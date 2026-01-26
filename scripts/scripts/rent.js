import { supabase } from "./supabase.js";
import { logout } from "./session.js";

const rentTableBody = document.getElementById("rentTableBody");
const rentMessage = document.getElementById("rentMessage");
const generateBtn = document.getElementById("generateRentBtn");
const logoutBtn = document.getElementById("logoutBtn");

function getCurrentMonthDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

async function loadRentCharges() {
  const { data, error } = await supabase
    .from("rent_charges")
    .select(`
      amount,
      due_date,
      charge_month,
      tenants ( tenant_name )
    `)
    .order("due_date");

  if (error) {
    console.error(error.message);
    return;
  }

  rentTableBody.innerHTML = "";

  if (!data || data.length === 0) {
    rentTableBody.innerHTML =
      "<tr><td colspan='4'>N/A</td></tr>";
    return;
  }

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.tenants.tenant_name}</td>
      <td>${row.amount}</td>
      <td>${row.due_date}</td>
      <td>${row.charge_month}</td>
    `;
    rentTableBody.appendChild(tr);
  });
}

async function generateRent() {
  rentMessage.textContent = "Generating rent...";
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, tenant_name, monthly_rent, rent_due_day");

  if (!tenants || tenants.length === 0) {
    rentMessage.textContent = "No tenants found.";
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  const monthDate = getCurrentMonthDate();

  const inserts = tenants.map(t => {
    const due = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      t.rent_due_day
    );

    return {
      user_id: user.id,
      tenant_id: t.id,
      charge_month: monthDate,
      amount: t.monthly_rent,
      due_date: due
    };
  });

  const { error } = await supabase
    .from("rent_charges")
    .insert(inserts, { ignoreDuplicates: true });

  if (error) {
    rentMessage.textContent = error.message;
    return;
  }

  rentMessage.textContent = "Rent generated successfully.";
  await loadRentCharges();
}

generateBtn.addEventListener("click", generateRent);
logoutBtn.addEventListener("click", logout);

loadRentCharges();
