/*
 * Simple hash-based client-side router.
 * Handles navigation between views (dashboard, maintenance, stock)
 * without reloading the page. Updates the content of the main container
 * based on the current route.
 */

import { renderDashboard } from "./views/dashboard.js";
import { renderMaintenance } from "./views/maintenance.js";
import { renderStock } from "./views/stock.js";

// Map of route names to corresponding view rendering functions
const routes = {
  dashboard: renderDashboard,
  maintenance: renderMaintenance,
  stock: renderStock,
};

let currentRoute = null;

/*
 * Initializes the router.
 * Listens for hash changes and renders the corresponding view.
 */
export function initRouter() {
  window.addEventListener("hashchange", renderCurrentView);
  renderCurrentView(); // Initial render on load
}

/*
 * Renders the view corresponding to the current hash route.
 * If route is invalid, displays a 404 message.
 */
export function renderCurrentView() {
  const route = window.location.hash.slice(1) || "dashboard";
  currentRoute = route;

  const view = routes[route];
  const container = document.getElementById("main-content");
  container.innerHTML = ""; // Clear previous content

  if (view) {
    view(container); // Call the appropriate view function
  } else {
    container.textContent = "404 – Page not found";
  }
}

/*
 * Navigates programmatically to a new route by updating the hash.
 */
export function navigate(route) {
  window.location.hash = `#${route}`;
}
