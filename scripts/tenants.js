import { supabase } from "./supabase.js";

/* ELEMENTS */
const tableBody = document.getElementById("tenantTableBody");
const addModal = document.getElementById("addModal");
const editModal = document.getElementById("editModal");

/* UTILITIES */
const getChecked = group =>
  Array.from(group.querySelectorAll("input:checked")).map(c => c.value);

/* LOAD */
async function loadTenants() {
  const { data } = await supabase
    .from("tenants")
    .select("id, tenant_name, monthly_rent, rent_due_day, utilities")
    .order("created_at");

  tableBody.innerHTML = "";

  data.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.tenant_name}</td>
      <td>₱${t.monthly_rent}</td>
      <td>${t.rent_due_day}</td>
      <td>${(t.utilities || []).join(", ")}</td>
      <td><button class="secondary" onclick="openEditModal(${JSON.stringify(t).replace(/"/g,"'")})">Edit</button></td>
    `;
    tableBody.appendChild(tr);
  });
}

/* ADD */
document.getElementById("openAddModal").onclick = () => addModal.style.display = "flex";
window.closeAddModal = () => addModal.style.display = "none";

document.getElementById("submitAdd").onclick = async () => {
  if (!confirm("Add this tenant?")) return;

  await supabase.from("tenants").insert({
    tenant_name: addTenantName.value,
    monthly_rent: addMonthlyRent.value,
    rent_due_day: addRentDueDay.value,
    utilities: getChecked(addUtilities)
  });

  closeAddModal();
  loadTenants();
};

/* EDIT */
window.openEditModal = tenant => {
  editModal.style.display = "flex";
  editTenantId.value = tenant.id;
  editTenantName.value = tenant.tenant_name;
  editMonthlyRent.value = tenant.monthly_rent;
  editRentDueDay.value = tenant.rent_due_day;
  editUtilities.querySelectorAll("input").forEach(cb => {
    cb.checked = tenant.utilities?.includes(cb.value);
  });
};

window.closeEditModal = () => editModal.style.display = "none";

document.getElementById("submitEdit").onclick = async () => {
  if (!confirm("Update this tenant?")) return;

  await supabase
    .from("tenants")
    .update({
      tenant_name: editTenantName.value,
      monthly_rent: editMonthlyRent.value,
      rent_due_day: editRentDueDay.value,
      utilities: getChecked(editUtilities)
    })
    .eq("id", editTenantId.value);

  closeEditModal();
  loadTenants();
};

/* INIT */
loadTenants();
