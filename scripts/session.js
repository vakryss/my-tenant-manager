import { supabase } from "./supabase.js";

/* =========================
   CHECK AUTH SESSION
========================= */
export async function requireAuth() {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "/login.html";
  }
}

/* =========================
   LOGOUT
========================= */
export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
}
