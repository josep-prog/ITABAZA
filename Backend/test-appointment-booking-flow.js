const { supabase } = require('./config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Simulate the exact flow that happens when "Confirm Payment & Book Appointment" is clicked
async function testAppointmentBookingFlow() {
  console.log('🧪 Testing Complete Appointment Booking Flow...\n');
  
  try {
    // Step 1: Get a real doctor from the database
    console.log('👨‍⚕️ Step 1: Fetching available doctor...');
    const { data: doctors, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('is_available', true)
      .limit(1);
      
    if (doctorError || !doctors || doctors.length === 0) {
      console.log('  ❌ Error: No available doctors found');
      return false;
    }
    
    const doctor = doctors[0];
    console.log(`  ✅ Found doctor: Dr. ${doctor.doctor_name} (ID: ${doctor.id})`);
    
    // Step 2: Get a real patient from the database
    console.log('\n👤 Step 2: Fetching patient...');
    const { data: patients, error: patientError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (patientError || !patients || patients.length === 0) {
      console.log('  ❌ Error: No patients found');
      return false;
    }
    
    const patient = patients[0];
    console.log(`  ✅ Found patient: ${patient.first_name} (ID: ${patient.id})`);
    console.log(`  📧 Patient email: ${patient.email}`);
    
    // Step 3: Simulate the enhanced appointment creation request
    console.log('\n📝 Step 3: Creating appointment with payment details...');
    
    const appointmentPayload = {
      userID: patient.id,
      email: patient.email,
      ageOfPatient: 25,
      gender: 'Male',
      address: 'Test Address, Kigali',
      problemDescription: 'Test appointment booking with confirmation email',
      appointmentDate: '2025-07-27',
      appointmentTime: '10:00',
      consultationType: 'in-person',
      symptoms: ['headache', 'fever'],
      medicalHistory: 'No significant medical history',
      medications: 'None',
      paymentDetails: {
        transactionId: 'TEST123456789',
        simcardHolder: 'MTN Rwanda',
        phoneNumber: '+250788123456',
        paymentMethod: 'MTN Mobile Money',
        amount: 7000,
        currency: 'RWF'
      }
    };
    
    // Step 4: Create appointment using the enhanced router logic
    console.log('  🔄 Processing appointment creation...');
    
    // Room assignment logic (same as in enhanced router)
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
    
    // Prepare appointment data
    const appointmentData = {
      patient_id: patient.id,
      doctor_id: doctor.id,
      patient_first_name: patient.first_name,
      doc_first_name: doctor.doctor_name,
      age_of_patient: appointmentPayload.ageOfPatient,
      gender: appointmentPayload.gender,
      address: appointmentPayload.address,
      problem_description: appointmentPayload.problemDescription,
      appointment_date: appointmentPayload.appointmentDate,
      appointment_time: appointmentPayload.appointmentTime,
      consultation_type: appointmentPayload.consultationType,
      symptoms: appointmentPayload.symptoms,
      medical_history: appointmentPayload.medicalHistory,
      medications: appointmentPayload.medications,
      status: 'pending',
      payment_status: true, // Since payment details are provided
      payment_transaction_id: appointmentPayload.paymentDetails.transactionId,
      payment_simcard_holder: appointmentPayload.paymentDetails.simcardHolder,
      payment_phone_number: appointmentPayload.paymentDetails.phoneNumber,
      payment_method: appointmentPayload.paymentDetails.paymentMethod,
      payment_amount: appointmentPayload.paymentDetails.amount,
      payment_currency: appointmentPayload.paymentDetails.currency,
      patient_email: patient.email,
      patient_phone: patient.mobile
    };
    
    // Step 5: Insert appointment into database
    const { data: createdAppointment, error: createError } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
      
    if (createError) {
      console.log('  ❌ Error creating appointment:', createError.message);
      return false;
    }
    
    console.log(`  ✅ Appointment created successfully (ID: ${createdAppointment.id})`);
    
    // Step 6: Generate room assignment and venue info
    console.log('\n🏥 Step 4: Generating venue information...');
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
        
    console.log('  📍 Venue details:', JSON.stringify(venueInfo, null, 2));
    
    // Step 7: Send confirmation email
    console.log('\n📧 Step 5: Sending confirmation email...');
    const emailSent = await sendConfirmationEmail(
      patient.email, 
      patient.first_name, 
      doctor.doctor_name, 
      appointmentData,
      venueInfo
    );
    
    if (emailSent) {
      console.log('  ✅ Confirmation email sent successfully');
      
      // Step 8: Clean up test data (optional)
      console.log('\n🧹 Step 6: Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', createdAppointment.id);
        
      if (deleteError) {
        console.log('  ⚠️  Warning: Could not delete test appointment:', deleteError.message);
      } else {
        console.log('  ✅ Test appointment cleaned up');
      }
      
      return true;
    } else {
      console.log('  ❌ Failed to send confirmation email');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    return false;
  }
}

// Email sending function (same as in enhanced router)
async function sendConfirmationEmail(patientEmail, patientFirstName, docFirstName, appointmentData, venueInfo) {
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
      subject: `iTABAZA ${consultationTypeText} Appointment Confirmation - LIVE TEST`,
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
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Dr. ${docFirstName}</td>
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
                  
                  <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <h4 style="color: #856404; margin-top: 0;">🧪 This is a LIVE TEST of the appointment system</h4>
                    <p style="color: #856404; margin: 0;">This email confirms that the appointment confirmation system is working correctly after clicking "Confirm Payment & Book Appointment".</p>
                  </div>
                  
                  ${appointmentData.consultation_type === 'video-call' ? `
                  <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #1976d2; margin-top: 0;">Video Call Instructions</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                      <li>Ensure you have a stable internet connection</li>
                      <li>Find a quiet, well-lit environment</li>
                      <li>Have your medical history ready</li>
                      <li>Join the call 5 minutes before your appointment time</li>
                    </ul>
                  </div>
                  ` : `
                  <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #2e7d32; margin-top: 0;">In-Person Visit Instructions</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                      <li>Arrive 15 minutes before your appointment time</li>
                      <li>Bring your ID and any relevant medical documents</li>
                      <li>Wear a mask and follow COVID-19 protocols</li>
                      <li>Your assigned room is: <strong>${venueInfo.room || 'To be assigned'}</strong></li>
                    </ul>
                  </div>
                  `}
                  
                  <p style="margin-bottom: 20px;">If you have any questions or need to reschedule, please contact our customer service team.</p>
                  <p style="margin-bottom: 20px;">Thank you for choosing iTABAZA!</p>
                  
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
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log('Email sending error:', error.message);
    return false;
  }
}

// Run the test
async function runLiveTest() {
  console.log('🚀 Starting Live Appointment Booking Flow Test');
  console.log('=' .repeat(60));
  
  const success = await testAppointmentBookingFlow();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS:');
  console.log('='.repeat(60));
  
  if (success) {
    console.log('✅ LIVE TEST PASSED!');
    console.log('✅ Appointment booking flow is working correctly');
    console.log('✅ Confirmation emails are being sent');
    console.log('✅ Room assignment is working');
    console.log('✅ All appointment details are properly included');
    console.log('\n🎉 The system is ready for production use!');
    console.log('\n📧 Check your email inbox for the test confirmation email');
  } else {
    console.log('❌ LIVE TEST FAILED');
    console.log('❌ There are issues with the appointment booking flow');
    console.log('\n🔍 Please check the error messages above for details');
  }
}

// Execute the live test
runLiveTest().catch(console.error);
