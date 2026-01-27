import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  const tenantTableBody = $("tenantTableBody");
  const openAddBtn = $("openAddModal");
  const addModal = $("addModal");
  const editModal = $("editModal");
  const submitAddBtn = $("submitAdd");
  const submitEditBtn = $("submitEdit");

  function getChecked(containerId) {
    const c = $(containerId);
    return c ? Array.from(c.querySelectorAll("input:checked")).map(cb => cb.value) : [];
  }

  function openModal(m) { if (m) m.style.display = "flex"; }
  function closeModal(m) { if (m) m.style.display = "none"; }

  function confirmAction(title, message) {
    return new Promise(resolve => {
      $("confirmTitle").textContent = title;
      $("confirmMessage").textContent = message;
      openModal($("confirmModal"));

      $("confirmYes").onclick = () => {
        closeModal($("confirmModal"));
        resolve(true);
      };

      $("confirmCancel").onclick = () => {
        closeModal($("confirmModal"));
        resolve(false);
      };
    });
  }

  async function loadTenants() {
    const { data } = await supabase
      .from("tenants")
      .select("id, tenant_name, monthly_rent, rent_due_day, utilities")
      .order("created_at");

    tenantTableBody.innerHTML = "";

    if (!data || !data.length) {
      tenantTableBody.innerHTML = `<tr><td colspan="5">No tenants yet</td></tr>`;
      return;
    }

    data.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.tenant_name}</td>
        <td>₱${Number(t.monthly_rent).toFixed(2)}</td>
        <td>${t.rent_due_day}</td>
        <td>${t.utilities?.join(", ") || "—"}</td>
        <td><button class="secondary">Edit</button></td>
      `;
      tr.querySelector("button").onclick = () => openEditModal(t);
      tenantTableBody.appendChild(tr);
    });
  }

  if (openAddBtn) openAddBtn.onclick = () => openModal(addModal);

  if (submitAddBtn) {
    submitAddBtn.onclick = async () => {
      const ok = await confirmAction(
        "Tenant Consent Required",
        "Do you confirm the tenant approved storing their information?"
      );
      if (!ok) return;

      submitAddBtn.disabled = true;
      submitAddBtn.textContent = "Saving… Please wait…";

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        await supabase.from("tenants").insert({
          user_id: user.id,
          tenant_name: $("addTenantName").value.trim(),
          monthly_rent: Number($("addMonthlyRent").value),
          rent_due_day: Number($("addRentDueDay").value),
          utilities: getChecked("addUtilities")
        });

        closeModal(addModal);
        loadTenants();
      } catch (e) {
        alert(e.message);
      } finally {
        submitAddBtn.disabled = false;
        submitAddBtn.textContent = "Save";
      }
    };
  }

  function openEditModal(t) {
    $("editTenantId").value = t.id;
    $("editTenantName").value = t.tenant_name;
    $("editMonthlyRent").value = t.monthly_rent;
    $("editRentDueDay").value = t.rent_due_day;
    $("editUtilities").querySelectorAll("input").forEach(cb => {
      cb.checked = (t.utilities || []).includes(cb.value);
    });
    openModal(editModal);
  }

  if (submitEditBtn) {
    submitEditBtn.onclick = async () => {
      const ok = await confirmAction(
        "Confirm Update",
        "Are you sure you want to update this tenant’s information?"
      );
      if (!ok) return;

      await supabase.from("tenants")
        .update({
          tenant_name: $("editTenantName").value.trim(),
          monthly_rent: Number($("editMonthlyRent").value),
          rent_due_day: Number($("editRentDueDay").value),
          utilities: getChecked("editUtilities")
        })
        .eq("id", $("editTenantId").value);

      closeModal(editModal);
      loadTenants();
    };
  }

  loadTenants();
});
