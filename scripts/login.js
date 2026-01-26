import { supabase } from "./supabase.js";

/* =========================
   ELEMENT REFERENCES
========================= */
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

/* =========================
   SHOW / HIDE PASSWORD
========================= */
if (togglePassword && passwordInput) {
  togglePassword.addEventListener("change", () => {
    passwordInput.type = togglePassword.checked ? "text" : "password";
  });
}

/* =========================
   LOGIN HANDLER
========================= */
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    message.textContent = "Logging in...";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      message.textContent = "Email and password are required.";
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (!data.session) {
        throw new Error("Login failed. No session created.");
      }

      message.textContent = "Login successful.";

      // Temporary redirect target
      window.location.href = "/index.html";

    } catch (err) {
      message.textContent = err.message || "Login failed.";
    }
  });
}
