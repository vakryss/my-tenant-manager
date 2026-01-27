import { supabase } from "./supabase.js";
import { logout } from "./session.js";

const tenantSelect = document.getElementById("tenantSelect");
const utilityTypeSelect = document.getElementById("utilityType");
const chargeDateInput = document.getElementById("chargeDate");
const amountInput = document.getElementById("amount");
const notesInput = document.getElementById("notes");
const saveUtilityBtn = document.getElementById("saveUtilityBtn");
const utilityMessage = document.getElementById("utilityMessage");
const utilityTableBody = document.getElementById("utilityTableBody");
const logoutBtn = document.getElementById("logoutBtn");

/* =========================
   HELPERS
========================= */
function todayISO() {
  return new Date().toISOString().split("T")[0];
}

/* =========================
   LOAD TENANTS
========================= */
async function loadTenants() {
  const { data, error } = await supabase
    .from("tenants")
    .select("id, tenant_name")
    .order("tenant_name");

  tenantSelect.innerHTML = `<option value="">N/A</option>`;

  if (error) {
    console.error(error.message);
    return;
  }

  data.forEach(t => {
    const option = document.createElement("option");
    option.value = t.id;
    option.textContent = t.tenant_name;
    tenantSelect.appendChild(option);
  });
}

/* =========================
   LOAD UTILITIES
========================= */
async function loadUtilities() {
  const { data, error } = await supabase
    .from("utility_charges")
    .select(`
      charge_date,
      utility_type,
      amount,
      tenants ( tenant_name )
    `)
    .order("charge_date", { ascending: false });

  utilityTableBody.innerHTML = "";

  if (error || !data || data.length === 0) {
    utilityTableBody.innerHTML =
      "<tr><td colspan='4'>No records yet</td></tr>";
    return;
  }

  data.forEach(row => {
    const tenantName =
      row.tenants && row.tenants.tenant_name
        ? row.tenants.tenant_name
        : "N/A";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.charge_date}</td>
      <td>${tenantName}</td>
      <td>${row.utility_type}</td>
      <td>${row.amount}</td>
    `;
    utilityTableBody.appendChild(tr);
  });
}

/* =========================
   SAVE UTILITY + LEDGER
========================= */
async function saveUtility() {
  if (saveUtilityBtn.disabled) return;

  utilityMessage.textContent = "Saving utility charge...";
  saveUtilityBtn.disabled = true;

  const tenantId = tenantSelect.value;
  const utilityType = utilityTypeSelect.value;
  const chargeDate = chargeDateInput.value;
  const amount = parseFloat(amountInput.value);
  const notes = notesInput.value.trim();

  if (!tenantId || !utilityType || !chargeDate) {
    utilityMessage.textContent = "All required fields must be filled.";
    saveUtilityBtn.disabled = false;
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    utilityMessage.textContent = "Amount must be greater than zero.";
    saveUtilityBtn.disabled = false;
    return;
  }

  if (chargeDate > todayISO()) {
    utilityMessage.textContent = "Charge date cannot be in the future.";
    saveUtilityBtn.disabled = false;
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    utilityMessage.textContent = "Not authenticated.";
    saveUtilityBtn.disabled = false;
    return;
  }

  const { error: utilityError } = await supabase
    .from("utility_charges")
    .insert({
      user_id: user.id,
      tenant_id: tenantId,
      utility_type: utilityType,
      charge_date: chargeDate,
      amount: amount,
      notes: notes || "N/A"
    });

  if (utilityError) {
    utilityMessage.textContent = utilityError.message;
    saveUtilityBtn.disabled = false;
    return;
  }

  const { error: ledgerError } = await supabase
    .from("ledger_entries")
    .insert({
      user_id: user.id,
      tenant_id: tenantId,
      entry_date: chargeDate,
      entry_type: "charge",
      category: utilityType,
      amount: amount * -1,
      notes: notes || "Utility charge"
    });

  if (ledgerError) {
    utilityMessage.textContent = ledgerError.message;
    saveUtilityBtn.disabled = false;
    return;
  }

  utilityMessage.textContent = "Utility charge recorded.";

  amountInput.value = "";
  notesInput.value = "";
  saveUtilityBtn.disabled = false;

  await loadUtilities();
}

/* =========================
   EVENTS
========================= */
saveUtilityBtn.addEventListener("click", saveUtility);
logoutBtn.addEventListener("click", logout);

/* =========================
   INIT
========================= */
chargeDateInput.max = todayISO();
loadTenants();
loadUtilities();
