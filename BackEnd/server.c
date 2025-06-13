/*
 * WebSocket server using libwebsockets to interface between a web client
 * and Excel macros via VBS scripts. This server receives JSON requests,
 * writes them to a file, triggers a VBA macro through a VBScript,
 * and sends the JSON result back to the client.
 * 
 * Main responsibilities:
 *  - Listen for WebSocket connections
 *  - Handle incoming messages (JSON commands)
 *  - Trigger Excel-side logic via VBScript
 *  - Return the updated JSON state to the client
 */

#include <libwebsockets.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

// Constants
#define MAX_PAYLOAD_SIZE 4096
#define REQUEST_PATH "C:\\Users\\vdruo\\Desktop\\EPF\\3A\\PAML\\GMAO_OptimizedMaintenanceSystem\\BackEnd\\query_response\\query.txt"
#define RESPONSE_PATH "C:\\Users\\vdruo\\Desktop\\EPF\\3A\\PAML\\GMAO_OptimizedMaintenanceSystem\\BackEnd\\query_response\\response.txt"
#define SCRIPT_PATH "C:\\Users\\vdruo\\Desktop\\EPF\\3A\\PAML\\GMAO_OptimizedMaintenanceSystem\\BackEnd\\query_response\\runExcel.vbs"

/*
 * Writes the received JSON string to a file.
 * This file will be read by the VBScript which runs the Excel macro.
 */
void write_request(const char *json, size_t len) {
    FILE *f = fopen(REQUEST_PATH, "w");
    if (f) {
        fwrite(json, 1, len, f);
        fclose(f);
    } else {
        perror("Failed to write request");
    }
}

/*
 * Reads the full JSON response from the Excel macro (through VBScript).
 * Returns a dynamically allocated string and sets the output length.
 */
char *read_response(int *out_len) {
    FILE *f = fopen(RESPONSE_PATH, "r");
    if (!f) {
        perror("Failed to open response");
        *out_len = 0;
        return NULL;
    }

    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    rewind(f);

    if (size <= 0) {
        fclose(f);
        *out_len = 0;
        return NULL;
    }

    char *buffer = malloc(size + 1);
    if (!buffer) {
        fclose(f);
        *out_len = 0;
        return NULL;
    }

    fread(buffer, 1, size, f);
    buffer[size] = '\0';
    fclose(f);
    *out_len = (int)size;

    // Handle potential wrapping quotes (Excel sometimes adds them)
    if (buffer[0] == '"' && buffer[*out_len - 1] == '"') {
        buffer[*out_len - 1] = '\0';
        memmove(buffer, buffer + 1, *out_len);
        *out_len -= 2;
    }

    return buffer;
}

/*
 * Executes the VBScript which triggers the Excel macro.
 * Reads the resulting JSON and sends it back to the WebSocket client.
 */
void handle_and_send(struct lws *wsi) {
    if (system("cscript.exe //Nologo " SCRIPT_PATH) != 0) {
        const char *msg = "{\"error\":\"Failed to execute Excel macro\"}";
        unsigned char buf[LWS_PRE + 256];
        size_t len = strlen(msg);
        memcpy(&buf[LWS_PRE], msg, len);
        lws_write(wsi, &buf[LWS_PRE], len, LWS_WRITE_TEXT);
        return;
    }

    int len_resp = 0;
    char *response = read_response(&len_resp);

    if (response && len_resp > 0) {
        unsigned char *buf = malloc(LWS_PRE + len_resp);
        if (!buf) {
            fprintf(stderr, "Memory allocation error\n");
            free(response);
            return;
        }

        memcpy(buf + LWS_PRE, response, len_resp);
        int n = lws_write(wsi, buf + LWS_PRE, len_resp, LWS_WRITE_TEXT);
        if (n < 0) {
            fprintf(stderr, "Failed to send response\n");
        }

        printf("JSON sent to client : %.*s\n", len_resp, response);

        free(buf);
        free(response);
    } else {
        const char *msg = "{\"error\":\"Empty or missing response\"}";
        unsigned char buf[LWS_PRE + 256];
        size_t len = strlen(msg);
        memcpy(&buf[LWS_PRE], msg, len);
        lws_write(wsi, &buf[LWS_PRE], len, LWS_WRITE_TEXT);
    }
}

/*
 * Callback function called by libwebsockets on WebSocket events.
 * Handles connection, message reception, and disconnection.
 */
static int callback_handler(struct lws *wsi, enum lws_callback_reasons reason,
                            void *user, void *in, size_t len) {
    switch (reason) {
        case LWS_CALLBACK_ESTABLISHED:
            printf("Client connected\n");
            write_request("{\"action\":\"lister\"}", strlen("{\"action\":\"lister\"}"));
            handle_and_send(wsi);
            break;

        case LWS_CALLBACK_RECEIVE:
            printf("Message received: %.*s\n", (int)len, (char *)in);
            write_request((char *)in, len);
            handle_and_send(wsi);
            break;

        case LWS_CALLBACK_CLOSED:
            printf("Client disconnected\n");
            break;

        default:
            break;
    }

    return 0;
}

// Defines the WebSocket protocol
static struct lws_protocols protocols[] = {
    { "cmms-protocol", callback_handler, 0, MAX_PAYLOAD_SIZE },
    { NULL, NULL, 0, 0 }
};

/*
 * Entry point. Initializes the WebSocket context and starts the service loop.
 */
int main(void) {
    struct lws_context_creation_info info;
    memset(&info, 0, sizeof(info));
    info.port = 9001;
    info.protocols = protocols;

    struct lws_context *context = lws_create_context(&info);
    if (!context) {
        fprintf(stderr, "WebSocket context creation failed\n");
        return 1;
    }

    printf("WebSocket server listening on port 9001\n");
    while (1) {
        lws_service(context, 0); // Process incoming events
    }

    lws_context_destroy(context);
    return 0;
}
