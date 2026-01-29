// tenants.js - Tenant data management
import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);
    const tenantTableBody = $("tenantTableBody");
    const statusFilter = $("statusFilter");
    
    // Load and display tenants
    async function loadTenants() {
        const filter = statusFilter.value;
        let query = supabase.from("tenants").select("*");
        if (filter !== "all") query = query.eq("status", filter);
        const { data } = await query;
        
        tenantTableBody.innerHTML = "";
        if (!data?.length) {
            tenantTableBody.innerHTML = `<tr><td colspan="6" class="no-data">No tenants found</td></tr>`;
            return;
        }
        
        data.sort((a, b) => a.tenant_name.localeCompare(b.tenant_name)).forEach(t => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${t.tenant_name}</td>
                <td><span class="status-badge status-${t.status.replace(/\s+/g, '').toLowerCase()}">${t.status}</span></td>
                <td>₱${Number(t.monthly_rent).toFixed(2)}</td>
                <td>${t.rent_due_day}</td>
                <td><div class="utilities-tags">${(Array.isArray(t.utilities) ? t.utilities : []).map(u => `<span class="utility-tag">${u}</span>`).join('')}</div></td>
                <td><button class="btn-edit" data-id="${t.id}">Edit</button></td>
            `;
            tr.querySelector('.btn-edit').addEventListener('click', () => openEditModal(t));
            tenantTableBody.appendChild(tr);
        });
    }
    
    // Initialize
    statusFilter.addEventListener('change', loadTenants);
    loadTenants();
    
    // Add your existing openEditModal, submitAdd, submitEdit functions here
    // Ensure they reference the corrected modal IDs from the new tenants.html
});
