/*
 * Handles a single WebSocket connection to the server.
 * Sends client requests as JSON and receives the entire application state in return.
 * Notifies listeners when new data is received (used to update UI and state).
 */

import { setAppData } from "./data.js";

let ws; // WebSocket instance (singleton)
let onDataCallback = null; // Function to call when data is received

/*
 * Initializes the WebSocket connection.
 * Prevents multiple connections if already open or connecting.
 */
export function initWebSocket() {
  if (
    ws &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  ) {
    console.warn("WebSocket is already open or connecting.");
    return;
  }

  console.log("Creating WebSocket connection...");
  ws = new WebSocket("ws://localhost:9001");

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  /*
   * Handles incoming messages from the server.
   * Parses and validates JSON, updates app data, and triggers any listener callback.
   */
  ws.onmessage = (event) => {
    console.log("Received:", event.data);
    try {
      const data = JSON.parse(event.data);

      // Ensure all required fields are present
      if (
        !data.chains ||
        !data.machines ||
        !data.equipment ||
        !data.maintenance ||
        !data.stock
      )
        throw new Error("Missing fields in JSON");

      setAppData(data); // Update global state

      if (typeof onDataCallback === "function") {
        onDataCallback(data); // Notify app layer
      }
    } catch (err) {
      console.error("Error parsing WebSocket message:", err.message);
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  ws.onclose = (event) => {
    console.warn(
      "WebSocket closed:",
      event.code,
      event.reason || "(no reason)"
    );
  };
}

/*
 * Sends a JSON message to the server via WebSocket.
 */
export function sendToServer(json) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(json));
  } else {
    console.warn("WebSocket not ready");
  }
}

/*
 * Registers a callback to be called each time new data is received.
 * Useful for triggering re-renders or UI updates.
 */
export function onDataReceived(callback) {
  onDataCallback = callback;
}
