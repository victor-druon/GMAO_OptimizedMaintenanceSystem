/*
 * Manages all machine-related dialog boxes (add, modify, delete).
 * Handles form submission, dialog state management, and populates form data.
 * Delegates actions to the WebSocket layer for communication with the backend.
 */

import { getAppData } from "../data.js";
import { sendToServer } from "../websocket.js";

/*
 * Initializes all machine dialogs and binds form behavior.
 */
export function setupDialogs() {
  const { chains } = getAppData();
  populateTechnicianDatalist();
  // Populate <select> inputs with production line options
  const chainSelects = [
    document.getElementById("dialog-line-id"),
    document.getElementById("modify-chain"),
  ];
  chainSelects.forEach((select) => {
    if (!select) return;
    select.innerHTML = "";
    chains.forEach((chain) => {
      const option = document.createElement("option");
      option.value = chain.id_chain;
      option.textContent = chain.name_chain;
      select.appendChild(option);
    });
  });

  // Handle "Add Machine" form submission
  const addDialog = document.getElementById("dialog-add-machine");
  document.getElementById("form-add-machine").onsubmit = () => {
    const id = document.getElementById("dialog-machine-id").value;
    const name = document.getElementById("dialog-machine-name").value;
    const status = document.getElementById("dialog-machine-status").value;
    const chain = document.getElementById("dialog-line-id").value;

    if (!id || !name || !status || !chain) return alert("All fields required.");

    sendToServer({
      action: "add_machine",
      id_machine: id,
      name_machine: name,
      status_machine: status,
      id_chain: chain,
    });

    addDialog.close();
  };

  // Handle "Delete Machine" confirmation
  const deleteDialog = document.getElementById("dialog-delete-machine");
  document.getElementById("confirm-deletion").onclick = () => {
    const id = document.getElementById("machine-to-delete-id").value;
    sendToServer({
      action: "delete_machine",
      id_machine: id,
    });
    deleteDialog.close();
  };

  // Handle "Modify Machine" form submission
  const modifyDialog = document.getElementById("dialog-modify-machine");
  document.getElementById("form-modify-machine").onsubmit = () => {
    const id = document.getElementById("modify-id").value;
    const name = document.getElementById("modify-name").value;
    const status = document.getElementById("modify-status-machine").value;
    const chain = document.getElementById("modify-chain").value;

    if (!name || !status || !chain) return alert("All fields required.");

    sendToServer({
      action: "modify_machine",
      id_machine: id,
      name_machine: name,
      status_machine: status,
      id_chain: chain,
    });

    modifyDialog.close();
  };

  // Add maintenance
  document.getElementById("form-add-maintenance").onsubmit = () => {
    const id = document.getElementById("add-maintenance-id").value;
    const id_machine = document.getElementById("add-machine-id").value;
    const type = document.getElementById("add-type").value;
    const description = document.getElementById("add-description").value;
    const date = document.getElementById("add-date").value;
    const status = document.getElementById("add-status").value;
    const technician = document.getElementById("add-technician").value;

    if (
      !id ||
      !id_machine ||
      !type ||
      !description ||
      !date ||
      !status ||
      !technician
    )
      return alert("All fields are required");

    sendToServer({
      action: "add_maintenance",
      id_maintenance: id,
      id_machine,
      type,
      description,
      date,
      status_maintenance: status,
      technician,
    });

    document.getElementById("dialog-add-maintenance").close();
  };

  // Modify maintenance
  document.getElementById("form-modify-maintenance").onsubmit = () => {
    const id = document.getElementById("modify-maintenance-id").value;
    const id_machine = document.getElementById("modify-machine-id").value;
    const type = document.getElementById("modify-type").value;
    const description = document.getElementById("modify-description").value;
    const date = document.getElementById("modify-date").value;
    const status = document.getElementById("modify-status-maintenance").value;

    let technician =
      document.getElementById("modify-technician").value ||
      document.getElementById("modify-technician-select").value;

    sendToServer({
      action: "modify_maintenance",
      id_maintenance: id,
      id_machine,
      type,
      description,
      date,
      status_maintenance: status,
      technician,
    });

    document.getElementById("dialog-modify-maintenance").close();
  };

  // Delete maintenance
  document.getElementById("confirm-delete-maintenance").onclick = () => {
    const id = document.getElementById("delete-maintenance-id").value;
    sendToServer({ action: "delete_maintenance", id_maintenance: id });
    document.getElementById("dialog-delete-maintenance").close();
  };

  // Bind cancel buttons (all dialogs)
  const cancelButtons = document.querySelectorAll(
    "dialog button.cancel-dialog"
  );
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dialog = btn.closest("dialog");
      if (dialog) {
        console.log("→ cancel button clicked in:", dialog.id);
        dialog.close();
      }
    });
  });

  // Extract unique technician names from maintenance data
  function populateTechnicianDatalist() {
    const { maintenance } = getAppData();
    const datalist = document.getElementById("technician-list");
    if (!datalist) return;

    const technicians = new Set();

    maintenance.forEach((entry) => {
      if (entry.technician?.trim()) {
        technicians.add(entry.technician.trim());
      }
    });

    // Clear existing options
    datalist.innerHTML = "";

    // Add unique options
    technicians.forEach((tech) => {
      const option = document.createElement("option");
      option.value = tech;
      datalist.appendChild(option);
    });
  }
}

/*
 * Opens the "Add Machine" dialog, pre-selecting the given chain ID.
 */
export function openAddMachineDialog(chainId) {
  const dialog = document.getElementById("dialog-add-machine");

  // Reset form fields
  document.getElementById("form-add-machine").reset();

  const select = document.getElementById("dialog-line-id");
  if (select) select.value = chainId;
  dialog.showModal();
}

/*
 * Opens the "Modify Machine" dialog with pre-filled machine values.
 */
export function openModifyMachineDialog(machine) {
  document.getElementById("modify-id").value = machine.id_machine;
  document.getElementById("modify-name").value = machine.name_machine;
  document.getElementById("modify-status-machine").value =
    machine.status_machine;
  document.getElementById("modify-chain").value = machine.id_chain;
  document.getElementById("dialog-modify-machine").showModal();
}

/*
 * Opens the "Delete Machine" confirmation dialog with machine info.
 */
export function openDeleteMachineDialog(machine) {
  document.getElementById("machine-to-delete-id").value = machine.id_machine;
  document.getElementById("machine-to-delete-name").textContent =
    machine.name_machine;
  document.getElementById("dialog-delete-machine").showModal();
}

// Open "Add Maintenance" dialog
export function openAddMaintenanceDialog() {
  const dialog = document.getElementById("dialog-add-maintenance");

  // Reset form fields
  document.getElementById("form-add-maintenance").reset();

  // Remplir la liste des machines
  const { machines, maintenance } = getAppData();
  const machineSelect = document.getElementById("add-machine-id");
  machineSelect.innerHTML = "";
  machines.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id_machine;
    opt.textContent = `${m.id_machine} - ${m.name_machine}`;
    machineSelect.appendChild(opt);
  });

  // Remplir la liste des techniciens uniques
  const technicianList = document.getElementById("technician-list");
  technicianList.innerHTML = "";
  const uniqueTechnicians = [
    ...new Set(maintenance.map((m) => m.technician).filter(Boolean)),
  ];
  uniqueTechnicians.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    technicianList.appendChild(opt);
  });

  dialog.showModal();
}

// Open "Modify Maintenance" dialog
export function openModifyMaintenanceDialog(maintenance) {
  const dialog = document.getElementById("dialog-modify-maintenance");
  const machineSelect = document.getElementById("modify-machine-id");
  const technicianList = document.getElementById("technician-list");

  const { machines, maintenance: allMaintenances } = getAppData();

  // Populate machine select
  machineSelect.innerHTML = "";
  machines.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id_machine;
    opt.textContent = `${m.id_machine} - ${m.name_machine}`;
    machineSelect.appendChild(opt);
  });

  // Populate technician datalist
  const technicians = [
    ...new Set(allMaintenances.map((m) => m.technician).filter(Boolean)),
  ];
  technicianList.innerHTML = "";
  technicians.forEach((tech) => {
    const opt = document.createElement("option");
    opt.value = tech;
    technicianList.appendChild(opt);
  });

  // Fill existing data
  document.getElementById("modify-maintenance-id").value =
    maintenance.id_maintenance;
  document.getElementById("modify-machine-id").value = maintenance.id_machine;
  document.getElementById("modify-type").value = maintenance.type;
  document.getElementById("modify-description").value = maintenance.description;
  document.getElementById("modify-date").value = maintenance.date;
  document.getElementById("modify-status-maintenance").value =
    maintenance.status_maintenance;
  document.getElementById("modify-technician").value = maintenance.technician;

  dialog.showModal();
}

export function openDeleteMaintenanceDialog(maintenance) {
  document.getElementById("delete-maintenance-id").value =
    maintenance.id_maintenance;
  document.getElementById("delete-maintenance-name").textContent =
    maintenance.description;
  document.getElementById("dialog-delete-maintenance").showModal();
}
