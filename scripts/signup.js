import { supabase } from "./supabase.js";

const signupBtn = document.getElementById("signupBtn");
const message = document.getElementById("message");

signupBtn.addEventListener("click", async () => {
  message.textContent = "Processing...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const country = document.getElementById("country").value.trim();
  const termsAccepted = document.getElementById("terms").checked;
  const privacyAccepted = document.getElementById("privacy").checked;

  if (!email || !password || !country) {
    message.textContent = "All fields are required.";
    return;
  }

  if (!termsAccepted || !privacyAccepted) {
    message.textContent = "You must accept Terms and Privacy.";
    return;
  }

  try {
    // 1. Create Auth user
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email,
        password
      });

    if (authError) throw authError;

    const userId = authData.user.id;

    // 2. Insert user profile
    const { error: profileError } = await supabase
      .from("users_profile")
      .insert({
        id: userId,
        email: email,
        full_name: "N/A",
        country: country,
        currency_code: "PHP",
        currency_symbol: "₱"
      });

    if (profileError) throw profileError;

    // 3. Insert legal acceptance
    const { error: legalError } = await supabase
      .from("legal_acceptance")
      .insert({
        user_id: userId,
        terms_accepted: true,
        privacy_accepted: true
      });

    if (legalError) throw legalError;

    message.textContent = "Account created successfully.";

  } catch (err) {
    message.textContent = err.message;
  }
});
