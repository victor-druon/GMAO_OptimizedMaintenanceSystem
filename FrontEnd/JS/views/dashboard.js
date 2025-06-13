/*
 * Responsible for rendering the main dashboard view.
 * Displays all production lines (chains) and their associated machines.
 * Each chain includes a button to add a new machine.
 * Each machine includes buttons to modify or delete it.
 */

import { getAppData } from "../data.js";
import {
  openAddMachineDialog,
  openModifyMachineDialog,
  openDeleteMachineDialog,
} from "../components/dialogs.js";

/*
 * Renders the dashboard into the given DOM container.
 */
export function renderDashboard(container) {
  const { chains, machines } = getAppData();

  // Global title
  const title = document.createElement("h2");
  title.textContent = "Dashboard View";
  title.classList.add("production-title");
  container.appendChild(title);

  // For each production line (chain)
  chains.forEach((chain) => {
    const chainBlock = document.createElement("div");
    chainBlock.classList.add("production-line");

    // Title for the chain
    const chainTitle = document.createElement("h2");
    chainTitle.classList.add("production-title");
    chainTitle.textContent = `Chaîne : ${chain.name_chain}`;
    chainBlock.appendChild(chainTitle);

    // Add machine button (pre-fills the chain ID)
    const addButton = document.createElement("button");
    addButton.classList.add("add-machine");
    addButton.innerHTML = `+ Ajouter`;
    addButton.onclick = () => {
      openAddMachineDialog(chain.id_chain);
    };
    chainBlock.appendChild(addButton);

    // Table of machines
    const table = document.createElement("table");
    table.classList.add("machine-table");

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Statut</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    // Filter machines belonging to the current chain
    const chainMachines = machines.filter((m) => m.id_chain === chain.id_chain);

    // Populate each machine row
    chainMachines.forEach((machine) => {
      const tr = document.createElement("tr");

      // Determine status color class
      const statusClass =
        {
          "En fonctionnement": "status-ok",
          "En maintenance": "status-maintenance",
          "En panne": "status-failure",
        }[machine.status_machine] || "status-unknown";

      // Row content
      tr.innerHTML = `
        <td>${machine.id_machine}</td>
        <td>${machine.name_machine}</td>
        <td class="${statusClass}">${machine.status_machine}</td>
        <td class="machine-actions">
          <button class="edit-btn" title="Modify">
            edit
          </button>
          <button class="delete-btn" title="Delete">
            del
          </button>
        </td>
      `;

      // Attach click handlers for modify/delete
      tr.querySelector(".edit-btn").onclick = () => {
        console.log("Modify machine", machine.id_machine);
        openModifyMachineDialog(machine);
      };

      tr.querySelector(".delete-btn").onclick = () => {
        console.log("Delete machine", machine.id_machine);
        openDeleteMachineDialog(machine);
      };

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    chainBlock.appendChild(table);
    container.appendChild(chainBlock);
  });
}
