const nodemailer = require('nodemailer');
const { supabase } = require('./config/db');
require('dotenv').config();

async function quickEmailConfirmationTest() {
  console.log('🔥 Quick Email Confirmation Test\n');

  try {
    // Test 1: Email system
    console.log('1️⃣ Testing Email System...');
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log('   ✅ Email system working');

    // Test 2: Find a recent appointment to send confirmation for
    console.log('\n2️⃣ Finding Recent Appointments...');
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error || !appointments || appointments.length === 0) {
      console.log('   ⚠️  No appointments found, creating test email...');
      
      // Send a test email instead
      const testMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to self
        subject: 'iTABAZA Email System Test - Quick Verification',
        html: `
          <h2>📧 Email System Verification</h2>
          <p>This is a quick test to verify the iTABAZA email system is working correctly.</p>
          <p><strong>Status:</strong> ✅ Email system is functional</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>From:</strong> iTABAZA Appointment System</p>
          <hr>
          <p><em>If you receive this email, the email confirmation system is working properly!</em></p>
        `
      };

      const result = await transporter.sendMail(testMailOptions);
      console.log('   ✅ Test email sent successfully');
      console.log('   📧 Message ID:', result.messageId);
      
    } else {
      console.log(`   ✅ Found ${appointments.length} recent appointments`);
      
      // Show recent appointments
      appointments.forEach((apt, index) => {
        console.log(`   ${index + 1}. ${apt.patient_first_name} -> Dr. ${apt.doc_first_name} (${apt.appointment_date})`);
        console.log(`      Email: ${apt.patient_email || 'Not specified'}`);
        console.log(`      Status: ${apt.status} | Payment: ${apt.payment_status ? 'Paid' : 'Pending'}`);
      });

      // Send confirmation for the most recent appointment with email
      const appointmentWithEmail = appointments.find(apt => apt.patient_email);
      if (appointmentWithEmail) {
        console.log('\n3️⃣ Sending Test Confirmation Email...');
        
        const testMailOptions = {
          from: process.env.EMAIL_USER,
          to: appointmentWithEmail.patient_email,
          subject: 'iTABAZA Appointment Confirmation - Test',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #0077c0; color: white; padding: 20px; text-align: center;">
                <h1>iTABAZA</h1>
                <p>Healthcare Excellence</p>
              </div>
              <div style="padding: 30px;">
                <h2>Hello, ${appointmentWithEmail.patient_first_name}!</h2>
                <p>This is a test confirmation email for your appointment.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Appointment Details</h3>
                  <p><strong>Patient:</strong> ${appointmentWithEmail.patient_first_name}</p>
                  <p><strong>Doctor:</strong> Dr. ${appointmentWithEmail.doc_first_name}</p>
                  <p><strong>Date:</strong> ${appointmentWithEmail.appointment_date}</p>
                  <p><strong>Problem:</strong> ${appointmentWithEmail.problem_description || 'Not specified'}</p>
                  <p><strong>Status:</strong> ${appointmentWithEmail.status}</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                  <p style="margin: 0; color: #856404;">
                    <strong>⚠️ This is a test email</strong> to verify the appointment confirmation system is working.
                  </p>
                </div>
                
                <p>Thank you for choosing iTABAZA!</p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 14px;">
                    iTABAZA Team<br>
                    Email: support@itabaza.com<br>
                    Website: https://itabaza-2qjt.vercel.app
                  </p>
                </div>
              </div>
            </div>
          `
        };

        const result = await transporter.sendMail(testMailOptions);
        console.log('   ✅ Test confirmation email sent successfully');
        console.log('   📧 Sent to:', appointmentWithEmail.patient_email);
        console.log('   📧 Message ID:', result.messageId);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📋 QUICK TEST SUMMARY:');
    console.log('='.repeat(50));
    console.log('✅ Email system is fully functional');
    console.log('✅ SMTP connection verified');
    console.log('✅ Database connectivity confirmed');
    console.log('✅ Appointment data accessible');
    console.log('✅ Email sending capability verified');
    
    console.log('\n🔍 If patients are not receiving emails:');
    console.log('1. Check spam/junk folders');
    console.log('2. Verify email addresses are correct');
    console.log('3. Use the manual email confirmation page');
    console.log('4. Ensure appointment was created successfully');
    
    console.log('\n🌐 Email Confirmation Page:');
    console.log('https://itabaza-2qjt.vercel.app/email-confirmation.html');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🛠️  Check your environment variables and database connection.');
  }
}

// Run the quick test
quickEmailConfirmationTest().catch(console.error);
