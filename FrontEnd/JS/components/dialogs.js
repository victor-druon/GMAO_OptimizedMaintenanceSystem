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
    const status = document.getElementById("modify-status").value;
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
}

/*
 * Opens the "Add Machine" dialog, pre-selecting the given chain ID.
 */
export function openAddMachineDialog(chainId) {
  const dialog = document.getElementById("dialog-add-machine");
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
  document.getElementById("modify-status").value = machine.status_machine;
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
