const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email configuration and sending
async function testEmailSystem() {
  console.log('🔍 Debugging Email System...\n');
  
  // Check environment variables
  console.log('📧 Environment Variables:');
  console.log('  EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
  console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
  console.log('  EMAIL_USER value:', process.env.EMAIL_USER);
  console.log('  EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
  
  // Test transporter creation
  console.log('\n🔧 Creating Email Transporter...');
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('  ✅ Transporter created successfully');
    
    // Test connection
    console.log('\n🔗 Testing SMTP Connection...');
    await transporter.verify();
    console.log('  ✅ SMTP connection successful');
    
    // Test sending a simple email
    console.log('\n📨 Sending Test Email...');
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'iTABAZA Email System Test',
      html: `
        <h2>Email System Test</h2>
        <p>This is a test email from the iTABAZA appointment system.</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>If you receive this, the email system is working correctly!</p>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('  ✅ Test email sent successfully');
    console.log('  📧 Message ID:', result.messageId);
    console.log('  📊 Response:', result.response);
    
    return true;
  } catch (error) {
    console.log('  ❌ Email system error:', error.message);
    
    // Provide specific guidance based on error type
    if (error.message.includes('Invalid login')) {
      console.log('\n🔐 Authentication Issue:');
      console.log('  - Check if EMAIL_USER and EMAIL_PASS are correct');
      console.log('  - Ensure 2-Factor Authentication is disabled OR use App Password');
      console.log('  - For Gmail: Generate App Password at https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('connect')) {
      console.log('\n🌐 Connection Issue:');
      console.log('  - Check internet connection');
      console.log('  - Firewall might be blocking SMTP connections');
    }
    
    return false;
  }
}

// Test the email function from the appointment system
async function testAppointmentEmail() {
  console.log('\n🏥 Testing Appointment Email Function...');
  
  // Room management system
  const HOSPITAL_ROOMS = {
    total: 20,
    rooms: Array.from({length: 20}, (_, i) => `Room-${String(i + 1).padStart(2, '0')}`)
  };
  
  function assignRoom(appointmentId) {
    const hash = appointmentId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const roomIndex = Math.abs(hash) % HOSPITAL_ROOMS.total;
    return HOSPITAL_ROOMS.rooms[roomIndex];
  }
  
  // Test appointment data
  const appointmentData = {
    consultation_type: 'in-person',
    problem_description: 'Test appointment for debugging email system',
    appointment_date: '2025-07-26',
    appointment_time: '10:00 AM',
    payment_status: true,
    patient_id: 'test123'
  };
  
  const patientFirstName = 'Test Patient';
  const docFirstName = 'Dr. Test Doctor';
  const patientEmail = process.env.EMAIL_USER; // Send to self for testing
  
  // Generate venue info
  const assignedRoom = appointmentData.consultation_type === 'in-person' 
    ? assignRoom(appointmentData.patient_id + appointmentData.appointment_date) 
    : null;
  
  const venueInfo = appointmentData.consultation_type === 'video-call' 
    ? {
        type: 'Video Call',
        url: 'https://itabaza-videocall.onrender.com/',
        location: 'Online Meeting'
      }
    : {
        type: 'In-Person Visit',
        url: 'https://itabaza-videocall.onrender.com/',
        location: 'Gihundwe Hospital',
        room: assignedRoom
      };
  
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    const consultationTypeText = appointmentData.consultation_type === 'video-call' ? 'Video Call' : 'In-Person';
    const paymentStatus = appointmentData.payment_status ? 'Paid' : 'Pending';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: `iTABAZA ${consultationTypeText} Appointment Confirmation - TEST`,
      html: `
      <!DOCTYPE html>
        <html>
          <head>
            <title>Appointment Confirmation</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333; padding: 20px;">
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; border-collapse: collapse; border: 1px solid #ddd;">
              <tr>
                <td style="background-color: #0077c0; text-align: center; padding: 20px;">
                  <h1 style="font-size: 28px; color: #fff; margin: 0;">iTABAZA</h1>
                  <p style="color: #fff; margin: 5px 0 0 0;">Healthcare Excellence</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <h2 style="font-size: 24px; color: #0077c0; margin-top: 0;">Hello, ${patientFirstName}!</h2>
                  <p style="margin-bottom: 20px;">Your ${consultationTypeText} appointment has been successfully booked and is now received. It will be confirmed after completing payment.</p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #0077c0; margin-top: 0;">Appointment Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Patient:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${patientFirstName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Doctor:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${docFirstName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Problem Description:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.problem_description || 'Not specified'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.appointment_date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.appointment_time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Type:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${consultationTypeText}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Venue:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                          ${venueInfo.location}${venueInfo.room ? ` - ${venueInfo.room}` : ''}<br>
                          <a href="${venueInfo.url}" style="color: #0077c0; text-decoration: none;">${venueInfo.url}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;"><strong>Payment Status:</strong></td>
                        <td style="padding: 8px 0; color: ${paymentStatus === 'Paid' ? '#28a745' : '#ffc107'}; font-weight: bold;">${paymentStatus}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="margin-bottom: 20px;"><strong>This is a test email to verify the appointment confirmation system is working correctly.</strong></p>
                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                      Best regards,<br>
                      <strong>iTABAZA Team</strong><br>
                      Email: support@itabaza.com<br>
                      Phone: +250 123 456 789
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('  ✅ Appointment confirmation email sent successfully');
    console.log('  📧 Message ID:', result.messageId);
    console.log('  📊 Venue Info:', JSON.stringify(venueInfo, null, 2));
    
    return true;
  } catch (error) {
    console.log('  ❌ Failed to send appointment email:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const emailWorking = await testEmailSystem();
  
  if (emailWorking) {
    await testAppointmentEmail();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 SUMMARY:');
  console.log('='.repeat(50));
  
  if (emailWorking) {
    console.log('✅ Email system is configured correctly');
    console.log('✅ Test emails sent successfully');
    console.log('\n🔍 If you\'re still not receiving emails from the appointment system:');
    console.log('  1. Check server logs for errors during appointment creation');
    console.log('  2. Verify the frontend is sending correct data to the API');
    console.log('  3. Check spam/junk folder in email client');
    console.log('  4. Ensure email addresses are valid and formatted correctly');
  } else {
    console.log('❌ Email system needs configuration');
    console.log('\n🛠️  To fix email issues:');
    console.log('  1. Check .env file has correct EMAIL_USER and EMAIL_PASS');
    console.log('  2. For Gmail: Use App Password instead of regular password');
    console.log('  3. Enable "Less secure app access" or use OAuth2');
  }
}

// Run the tests
runAllTests().catch(console.error);
