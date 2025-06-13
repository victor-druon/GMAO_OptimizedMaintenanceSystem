/*
 * Dynamically creates the sidebar navigation.
 * Handles route switching using hash-based navigation.
 * Highlights the active link based on the current route.
 */

import { navigate } from "../router.js";

/*
 * Initializes the sidebar navigation UI and sets up event handlers.
 */
export function setupNavbar() {
  const navbar = document.getElementById("sidebar");

  // Inject sidebar content
  navbar.innerHTML = `
    <h2>Control Center</h2>
    <a href="#" data-page="dashboard">Dashboard</a>
    <a href="#" data-page="maintenance">Maintenance</a>
    <a href="#" data-page="stock">Stock</a> 
  `;

  // Handle navigation clicks and route switching
  navbar.querySelectorAll("a").forEach((link) => {
    link.onclick = (e) => {
      e.preventDefault();
      navigate(link.dataset.page); // Update hash
    };
  });

  // Update link highlighting on route change
  window.addEventListener("hashchange", highlightActiveLink);
  highlightActiveLink(); // Initial highlight
}

/*
 * Adds/removes the 'active' class based on the current route.
 */
function highlightActiveLink() {
  const currentPage = window.location.hash.slice(1) || "dashboard";
  document.querySelectorAll("#sidebar a").forEach((link) => {
    const isActive = link.dataset.page === currentPage;
    link.classList.toggle("active", isActive);
  });
}
