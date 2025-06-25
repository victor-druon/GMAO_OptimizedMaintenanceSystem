// views/maintenance.js
import { getAppData } from "../data.js";
import {
  openAddMaintenanceDialog,
  openModifyMaintenanceDialog,
  openDeleteMaintenanceDialog,
} from "../components/dialogs.js";

export function renderMaintenance(container) {
  const { maintenance } = getAppData();

  const title = document.createElement("h2");
  title.textContent = "Maintenance View";
  title.classList.add("production-title");
  container.appendChild(title);

  const addButton = document.createElement("button");
  addButton.classList.add("add-machine"); // reuse style
  addButton.textContent = "Ajouter";
  addButton.onclick = () => {
    openAddMaintenanceDialog();
  };
  container.appendChild(addButton);

  if (maintenance.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No maintenance records available.";
    container.appendChild(empty);
    return;
  }

  const table = document.createElement("table");
  table.classList.add("machine-table");

  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Machine ID</th>
        <th>Type</th>
        <th>Description</th>
        <th>Date</th>
        <th>Status</th>
        <th>Technician</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  maintenance.forEach((entry) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${entry.id_maintenance}</td>
      <td>${entry.id_machine}</td>
      <td>${entry.type}</td>
      <td>${entry.description}</td>
      <td>${entry.date}</td>
      <td>${entry.status_maintenance}</td>
      <td>${entry.technician}</td>
      <td class="machine-actions">
        <button class="edit-btn" title="Modify">edit</button>
        <button class="delete-btn" title="Delete">del</button>
      </td>
    `;

    tr.querySelector(".edit-btn").onclick = () => {
      openModifyMaintenanceDialog(entry);
    };

    tr.querySelector(".delete-btn").onclick = () => {
      openDeleteMaintenanceDialog(entry);
    };

    tbody.appendChild(tr);
  });

  container.appendChild(table);
}
