const express = require('express');
const nodemailer = require('nodemailer');
const { AppointmentModel } = require('../models/appointment.model');
const { DoctorModel } = require('../models/doctor.model');
const { UserModel } = require('../models/user.model');
require('dotenv').config();

const emailConfirmationRouter = express.Router();

// Manual email confirmation endpoint
emailConfirmationRouter.post('/send-confirmation', async (req, res) => {
  try {
    const { appointmentId, patientEmail } = req.body;
    
    // Validate input
    if (!appointmentId && !patientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Either appointment ID or patient email is required'
      });
    }
    
    console.log('[EMAIL-CONFIRMATION] Request received:', { appointmentId, patientEmail });
    
    let appointments = [];
    
    // Find appointments based on provided criteria
    if (appointmentId) {
      // Find specific appointment by ID
      const appointment = await AppointmentModel.findById(appointmentId);
      if (appointment) {
        appointments = [appointment];
      }
    } else if (patientEmail) {
      // Find recent appointments by email (last 30 days)
      const { supabase } = require('../config/db');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_email', patientEmail)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!error && data) {
        appointments = data;
      }
    }
    
    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No appointments found with the provided criteria'
      });
    }
    
    console.log(`[EMAIL-CONFIRMATION] Found ${appointments.length} appointment(s) to send confirmation for`);
    
    // Send confirmation emails for all found appointments
    let successCount = 0;
    const results = [];
    
    for (const appointment of appointments) {
      try {
        // Get patient and doctor details
        const patient = appointment.patient_id ? await UserModel.findById(appointment.patient_id) : null;
        const doctor = appointment.doctor_id ? await DoctorModel.findById(appointment.doctor_id) : null;
        
        const patientName = appointment.patient_first_name || patient?.first_name || 'Patient';
        const doctorName = appointment.doc_first_name || doctor?.doctor_name || 'Doctor';
        const emailAddress = appointment.patient_email || patient?.email || patientEmail;
        
        if (!emailAddress) {
          results.push({
            appointmentId: appointment.id,
            success: false,
            message: 'No email address found for this appointment'
          });
          continue;
        }
        
        // Send confirmation email
        await sendAppointmentConfirmationEmail(emailAddress, patientName, doctorName, appointment);
        
        successCount++;
        results.push({
          appointmentId: appointment.id,
          success: true,
          message: 'Confirmation email sent successfully',
          sentTo: emailAddress
        });
        
        console.log(`[EMAIL-CONFIRMATION] Email sent successfully for appointment ${appointment.id} to ${emailAddress}`);
        
      } catch (emailError) {
        console.error(`[EMAIL-CONFIRMATION] Failed to send email for appointment ${appointment.id}:`, emailError.message);
        results.push({
          appointmentId: appointment.id,
          success: false,
          message: `Failed to send email: ${emailError.message}`
        });
      }
    }
    
    // Return response
    res.status(200).json({
      success: successCount > 0,
      message: `Successfully sent ${successCount} out of ${appointments.length} confirmation emails`,
      results: results,
      totalAppointments: appointments.length,
      successCount: successCount
    });
    
  } catch (error) {
    console.error('[EMAIL-CONFIRMATION] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sending confirmation email',
      error: error.message
    });
  }
});

// Get appointment details for email confirmation
emailConfirmationRouter.get('/appointment/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Get additional details
    const patient = appointment.patient_id ? await UserModel.findById(appointment.patient_id) : null;
    const doctor = appointment.doctor_id ? await DoctorModel.findById(appointment.doctor_id) : null;
    
    res.status(200).json({
      success: true,
      appointment: {
        ...appointment,
        patient_name: appointment.patient_first_name || patient?.first_name,
        doctor_name: appointment.doc_first_name || doctor?.doctor_name,
        patient_email: appointment.patient_email || patient?.email,
        doctor_qualifications: doctor?.qualifications
      }
    });
    
  } catch (error) {
    console.error('[EMAIL-CONFIRMATION] Error getting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointment details',
      error: error.message
    });
  }
});

// Helper function to send appointment confirmation email
async function sendAppointmentConfirmationEmail(patientEmail, patientName, doctorName, appointmentData) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Room management system for Gihundwe Hospital
  const HOSPITAL_ROOMS = {
    total: 20,
    rooms: Array.from({length: 20}, (_, i) => `Room-${String(i + 1).padStart(2, '0')}`)
  };

  // Simple room assignment based on appointment ID
  function assignRoom(appointmentId) {
    const hash = appointmentId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const roomIndex = Math.abs(hash) % HOSPITAL_ROOMS.total;
    return HOSPITAL_ROOMS.rooms[roomIndex];
  }

  // Generate room assignment for in-person appointments
  const consultationType = appointmentData.consultation_type || 'in-person';
  const assignedRoom = consultationType === 'in-person' 
    ? assignRoom(appointmentData.patient_id + appointmentData.appointment_date) 
    : null;

  // Venue information
  const venueInfo = consultationType === 'video-call' 
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

  const consultationTypeText = consultationType === 'video-call' ? 'Video Call' : 'In-Person';
  const paymentStatus = appointmentData.payment_status ? 'Paid' : 'Pending';
  const appointmentStatus = appointmentData.status || 'pending';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: patientEmail,
    subject: `iTABAZA ${consultationTypeText} Appointment Confirmation`,
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
                <h2 style="font-size: 24px; color: #0077c0; margin-top: 0;">Hello, ${patientName}!</h2>
                <p style="margin-bottom: 20px;">
                  Your ${consultationTypeText} appointment has been ${appointmentStatus === 'confirmed' ? 'confirmed' : 'received'}.
                  ${paymentStatus === 'Pending' ? ' It will be confirmed after completing payment.' : ''}
                </p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #0077c0; margin-top: 0;">Appointment Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Patient:</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${patientName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Doctor:</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Dr. ${doctorName}</td>
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
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.appointment_time || appointmentData.slot_time}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Type:</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${consultationTypeText}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Status:</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: ${appointmentStatus === 'confirmed' ? '#28a745' : '#ffc107'}; font-weight: bold; text-transform: capitalize;">${appointmentStatus}</td>
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
                
                ${consultationType === 'video-call' ? `
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
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <p style="margin: 0; color: #856404;">
                    <strong>📧 Email Confirmation</strong><br>
                    This confirmation email was sent on your request. If you didn't request this, please contact our support team.
                  </p>
                </div>
                
                <p style="margin-bottom: 20px;">If you have any questions or need to reschedule, please contact our customer service team.</p>
                <p style="margin-bottom: 20px;">Thank you for choosing iTABAZA!</p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="margin: 0; color: #666; font-size: 14px;">
                    Best regards,<br>
                    <strong>iTABAZA Team</strong><br>
                    Email: support@itabaza.com<br>
                    Phone: +250 123 456 789<br>
                    Website: <a href="https://itabaza-2qjt.vercel.app" style="color: #0077c0;">https://itabaza-2qjt.vercel.app</a>
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
  return result;
}

module.exports = {
  emailConfirmationRouter,
};
