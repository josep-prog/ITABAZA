const { supabase } = require("./config/db");
const bcrypt = require('bcrypt');

async function setupDoctorPasswords() {
  try {
    console.log("🔄 Setting up passwords for existing doctors...");
    
    // Get all doctors
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select('*');
      
    if (error) {
      console.error("❌ Error fetching doctors:", error);
      return;
    }
    
    console.log(`📋 Found ${doctors.length} doctors`);
    
    // Default password for all doctors (you should change this in production)
    const defaultPassword = "doctor123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    for (const doctor of doctors) {
      console.log(`🔄 Processing doctor: ${doctor.doctor_name} (${doctor.email})`);
      
      // Check if doctor already has a password_hash
      if (doctor.password_hash) {
        console.log(`✅ Doctor ${doctor.doctor_name} already has a password`);
        continue;
      }
      
      // Update doctor with password hash
      const { error: updateError } = await supabase
        .from('doctors')
        .update({ 
          password_hash: hashedPassword
        })
        .eq('id', doctor.id);
        
      if (updateError) {
        console.error(`❌ Error updating doctor ${doctor.doctor_name}:`, updateError);
      } else {
        console.log(`✅ Updated password for doctor ${doctor.doctor_name}`);
      }
    }
    
    console.log("✅ Doctor password setup completed!");
    console.log(`ℹ️  Default password for all doctors: ${defaultPassword}`);
    console.log("⚠️  Remember to ask doctors to change their passwords on first login");
    
  } catch (error) {
    console.error("❌ Error setting up doctor passwords:", error);
  }
}

setupDoctorPasswords();
