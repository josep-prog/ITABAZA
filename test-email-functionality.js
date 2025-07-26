const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 iTABAZA Email Functionality Diagnostic Test');
console.log('==============================================\n');

// Test 1: Check Environment Variables
console.log('📋 Test 1: Environment Variables Check');
console.log('----------------------------------------');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log(`EMAIL_USER: ${emailUser ? '✅ Set' : '❌ Missing'} ${emailUser ? `(${emailUser})` : ''}`);
console.log(`EMAIL_PASS: ${emailPass ? '✅ Set' : '❌ Missing'} ${emailPass ? '(***hidden***)' : ''}`);

if (!emailUser || !emailPass) {
  console.log('\n❌ Email configuration is incomplete!');
  console.log('Please set EMAIL_USER and EMAIL_PASS in your .env file');
  console.log('\nTo get Gmail app password:');
  console.log('1. Go to your Google Account settings');
  console.log('2. Security > 2-Step Verification > App passwords');
  console.log('3. Generate a new app password for "Mail"');
  process.exit(1);
}

// Test 2: Test Email Transporter
console.log('\n📧 Test 2: Email Transporter Test');
console.log('----------------------------------');

const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

console.log('Testing email transporter...');

transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email transporter verification failed:');
    console.log('   Error:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Gmail app password is incorrect');
    console.log('2. 2-factor authentication not enabled');
    console.log('3. Less secure app access not enabled');
    console.log('4. Gmail account security settings blocking access');
  } else {
    console.log('✅ Email transporter is ready!');
    
    // Test 3: Send Test Email
    console.log('\n📤 Test 3: Send Test Email');
    console.log('----------------------------');
    
    const testEmail = {
      from: emailUser,
      to: emailUser, // Send to self for testing
      subject: "iTABAZA Email Test - " + new Date().toISOString(),
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>iTABAZA Email Test</title>
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
                  <h2 style="font-size: 24px; color: #0077c0; margin-top: 0;">Email Test Successful!</h2>
                  <p style="margin-bottom: 20px;">This is a test email to verify that the iTABAZA email system is working correctly.</p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #0077c0; margin-top: 0;">Test Details</h3>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    <p><strong>From:</strong> ${emailUser}</p>
                    <p><strong>To:</strong> ${emailUser}</p>
                    <p><strong>Status:</strong> ✅ Working</p>
                  </div>
                  
                  <p style="margin-bottom: 20px;">If you received this email, the email system is working correctly!</p>
                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                      Best regards,<br>
                      iTABAZA Team
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `
    };
    
    transporter.sendMail(testEmail, (error, info) => {
      if (error) {
        console.log('❌ Failed to send test email:');
        console.log('   Error:', error.message);
        console.log('\nTroubleshooting steps:');
        console.log('1. Check your Gmail account for security alerts');
        console.log('2. Verify the app password is correct');
        console.log('3. Check if Gmail is blocking the connection');
        console.log('4. Try enabling "Less secure app access" temporarily');
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
        console.log('\n📧 Check your email inbox for the test message');
        console.log('   If you don\'t see it, check your spam folder');
        
        // Test 4: Test Appointment Confirmation Email
        console.log('\n🏥 Test 4: Appointment Confirmation Email Test');
        console.log('-----------------------------------------------');
        
        const appointmentEmail = {
          from: emailUser,
          to: emailUser,
          subject: "iTABAZA Appointment Confirm",
          html: `
          <!DOCTYPE html>
            <html>
              <head>
                <title>Example Email Template</title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              </head>
              <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5; color: #333; padding: 20px;">
                <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; border-collapse: collapse;">
                  <tr>
                    <td style="background-color: #0077c0; text-align: center; padding: 10px;">
                      <h1 style="font-size: 28px; color: #fff; margin: 0;">iTABAZA</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px;">
                      <h2 style="font-size: 24px; color: #0077c0; margin-top: 0;">Hello, [Test Patient]</h2>
                      <h5 style="margin-bottom: 20px;">Thank you for your recent appointment with Dr. Test Doctor. Your appointment has been booked for [Test Problem] on [2024-01-15]</h5>
                      <p style="margin-bottom: 20px;">If you do have any issues, please don't hesitate to contact our customer service team. We're always happy to help.</p>
                      <p style="margin-bottom: 20px;">Thank you for choosing iTABAZA Services</p>
                      <p style="margin-bottom: 0;">Best regards,</p>
                      <p style="margin-bottom: 20px;">iTABAZA</p>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `
        };
        
        transporter.sendMail(appointmentEmail, (error, info) => {
          if (error) {
            console.log('❌ Failed to send appointment confirmation email:');
            console.log('   Error:', error.message);
          } else {
            console.log('✅ Appointment confirmation email sent successfully!');
            console.log('   Message ID:', info.messageId);
            console.log('\n🎉 Email system is fully functional!');
            console.log('\nIf patients are not receiving emails, check:');
            console.log('1. Patient email address is correct');
            console.log('2. Patient email is not in spam folder');
            console.log('3. Patient email provider is not blocking the emails');
            console.log('4. Appointment booking is actually calling the email function');
          }
        });
      }
    });
  }
});

console.log('\n📊 Test Summary');
console.log('---------------');
console.log('This test will check:');
console.log('1. ✅ Environment variables are set');
console.log('2. ✅ Email transporter configuration');
console.log('3. ✅ Test email sending capability');
console.log('4. ✅ Appointment confirmation email format');
console.log('\nRunning tests...\n'); 