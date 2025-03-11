import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { getUserKeys, testUsers } from "./config/test-users.config";

// Create a setup test for each user
for (const userKey of getUserKeys()) {
  const user = testUsers[userKey];

  setup(`setup ${user.email} user`, async ({ page }) => {
    console.log(`---------------------------------Setup ${user.email} user`);

    // --- Supabase Client Setup (for test user creation) ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env
      .NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Supabase URL and Service Role Key must be defined in environment variables.",
      );
    }

    const supabaseAdmin = await createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if the user already exists
    const { data: existingUser, error: userExistsError } = await supabaseAdmin
      .from("users")
      .select("id, role")
      .eq("email", user.email)
      .single();

    if (userExistsError && userExistsError.code !== "PGRST116") {
      // 'PGRST116' means no user found, which is fine. Other errors are not.
      throw new Error(
        `Error checking for existing user: ${userExistsError.message}`,
      );
    }

    // If user exists but role doesn't match, update the role
    if (existingUser && existingUser.role !== user.role) {
      console.log(`Updating role for ${user.email} to ${user.role}`);
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({ role: user.role })
        .eq("id", existingUser.id);

      if (updateError) {
        throw new Error(`Failed to update user role: ${updateError.message}`);
      }
    }

    // If user doesn't exist, create it
    if (!existingUser) {
      console.log(`Creating new user: ${user.email} with role ${user.role}`);
      const { data: authUser, error: signUpError } = await supabaseAdmin.auth
        .admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Important: Confirm the email immediately
        });

      if (signUpError) {
        throw new Error(`Test user signup failed: ${signUpError.message}`);
      }

      // Explicitly set the role in the users table
      if (authUser && authUser.user) {
        const { error: insertError } = await supabaseAdmin
          .from("users")
          .upsert([
            {
              id: authUser.user.id,
              email: user.email,
              full_name: `${
                user.role.charAt(0).toUpperCase() + user.role.slice(1)
              } Test User`,
              role: user.role,
            },
          ]);

        if (insertError) {
          throw new Error(`Failed to set user role: ${insertError.message}`);
        }
      }
    }

    // --- Sign in using the test login page instead of getting tokens directly ---
    await page.goto("http://localhost:3000/login");

    // Fill in the login form
    await page.getByTestId("login-email-input").fill(user.email);
    await page.getByTestId("login-password-input").fill(user.password);
    await page.getByTestId("email-login-button").click({ timeout: 60000 });

    // Wait for navigation to complete after login
    await page.waitForURL("http://localhost:3000/dashboard");

    // CRITICAL: Wait for the storage state to be updated after login
    await page.context().storageState({ path: user.storageState });
    await page.context().close();
    console.log(
      `---------------------------------Setup complete for ${user.email}`,
    );
  });
}
