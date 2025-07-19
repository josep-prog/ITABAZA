
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");
require("dotenv").config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY  // Ensure the service role key is used for checking security constraints
);

async function verifyUserPassword(email, inputPassword) {
    console.log("🔍 Verifying user password for:", email);

    // First, fetch user by email
    const { data: user, error } = await supabase
        .from("users")
        .select("password")
        .eq("email", email)
        .single();

    if (error) {
        return console.error("❌ Error fetching user:", error.message);
    }

    // User found, now verify password
    console.log("🔍 User found, verifying password...");
    const isMatch = await bcrypt.compare(inputPassword, user.password);
    if (isMatch) {
        console.log("✅ Password is correct!");
    } else {
        console.log("❌ Incorrect password.");
    }
}

verifyUserPassword("nishimwejosep26@gmail.com", "k@#+ymej@AQ@3");
 [32m
