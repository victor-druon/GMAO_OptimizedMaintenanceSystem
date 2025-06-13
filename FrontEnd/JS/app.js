/*
 * Entry point of the web client (SPA).
 * Initializes the navigation sidebar, routing logic, WebSocket connection,
 * and updates the UI upon data reception from the server.
 */

import { initWebSocket, onDataReceived } from "./websocket.js";
import { setupNavbar } from "./components/navbar.js";
import { initRouter, renderCurrentView } from "./router.js";
import { setupDialogs } from "./components/dialogs.js";

// Wait until the full HTML document has been loaded
window.addEventListener("DOMContentLoaded", () => {
  setupNavbar(); // Initialize sidebar navigation (click bindings)
  initRouter(); // Setup hash-based routing (SPA)
  initWebSocket(); // Establish WebSocket connection to the server

  // Callback to run when new app data is received from the server
  onDataReceived(() => {
    renderCurrentView(); // Re-render the current view
    setTimeout(setupDialogs, 0); // Delay to ensure dialogs are bound after DOM update
  });
});
