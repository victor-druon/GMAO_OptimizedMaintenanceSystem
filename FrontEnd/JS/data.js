/*
 * Global in-memory data store.
 * Holds the entire application state received from the server (chains, machines, etc.).
 * This acts as a lightweight state manager shared across modules.
 */

// Global application state (received from server)
export let appData = {
  chains: [],
  machines: [],
  equipment: [],
  maintenance: [],
  stock: [],
};

/*
 * Replaces the entire application state with new data.
 * Typically called when fresh JSON is received from the server.
 */
export function setAppData(newData) {
  appData = newData;
  console.log("Data updated");
  console.log(appData); // Debug output
}

/*
 * Returns the current global application state.
 */
export function getAppData() {
  return appData;
}
