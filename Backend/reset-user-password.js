const { supabase } = require("./config/db");
const bcrypt = require('bcrypt');

async function resetUserPassword() {
  try {
    const email = "nishimwejoseph26@gmail.com";
    const newPassword = "test123"; // Simple password for testing
    
    console.log(`🔄 Resetting password for: ${email}`);
    console.log(`New password will be: ${newPassword}`);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`✅ Password hashed successfully`);
    
    // Update the user's password in the database
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email)
      .select();
      
    if (error) {
      console.error("❌ Error updating password:", error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log("✅ Password updated successfully!");
      console.log(`   User: ${data[0].first_name} ${data[0].last_name}`);
      console.log(`   Email: ${data[0].email}`);
      
      // Test the new credentials
      console.log("\n🧪 Testing new credentials with unified login...");
      
      const axios = require('axios');
      
      try {
        const response = await axios.post('http://localhost:8080/auth/login', {
          email: email,
          password: newPassword
        });
        
        if (response.data.success) {
          console.log("🎉 SUCCESS! Unified login now works!");
          console.log(`   User Type: ${response.data.userType}`);
          console.log(`   Name: ${response.data.user.firstName} ${response.data.user.lastName}`);
          console.log(`   Dashboard URL: ${response.data.dashboardUrl}`);
          
          console.log("\n📋 You can now test in the browser:");
          console.log(`   URL: http://localhost:3000/login.html`);
          console.log(`   Email: ${email}`);
          console.log(`   Password: ${newPassword}`);
          
        } else {
          console.log("❌ Login still failed:", response.data.message);
        }
        
      } catch (error) {
        console.log("❌ Test login failed:", error.response?.data || error.message);
      }
      
    } else {
      console.log("⚠️  No user was updated. Check if the email exists.");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Ask for confirmation before running
console.log("⚠️  This will reset the password for nishimwejoseph26@gmail.com to 'test123'");
console.log("Press Ctrl+C to cancel, or wait 3 seconds to continue...");

setTimeout(() => {
  resetUserPassword();
}, 3000);
