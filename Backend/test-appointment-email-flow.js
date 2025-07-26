const axios = require('axios');
require('dotenv').config();

console.log('🔍 Testing Appointment Booking Email Flow');
console.log('==========================================\n');

// Test configuration
const baseURL = 'http://localhost:8080'; // Change to production URL if needed

async function testAppointmentBooking() {
  try {
    console.log('📋 Step 1: Testing User Login');
    console.log('-------------------------------');
    
    // First, let's test if we can get a valid user from the database
    const { supabase } = require('./config/db');
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (userError || !users || users.length === 0) {
      console.log('❌ No test users found in database');
      return;
    }
    
    console.log('✅ Found test user:', users[0].email);
    
    // Step 1: Login to get authentication token
    console.log('\n🔐 Step 1.1: User Authentication');
    console.log('----------------------------------');
    
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: users[0].email,
      password: 'test123' // This should match the user's password
    });
    
    if (loginResponse.data.success) {
      console.log('✅ User login successful');
      const token = loginResponse.data.token;
      console.log('   Token received:', token ? 'Yes' : 'No');
      
      // Set up headers with authentication
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log('\n📋 Step 2: Testing Doctor Availability');
      console.log('----------------------------------------');
      
      const { data: doctors, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .limit(1);
      
      if (doctorError || !doctors || doctors.length === 0) {
        console.log('❌ No doctors found in database');
        return;
      }
      
      console.log('✅ Found test doctor:', doctors[0].email);
      
      console.log('\n📋 Step 3: Testing Appointment Creation API');
      console.log('---------------------------------------------');
      
      // Test the appointment creation endpoint directly
      const appointmentData = {
        patient_id: users[0].id,
        doctor_id: doctors[0].id,
        patient_first_name: users[0].first_name,
        doc_first_name: doctors[0].doctor_name,
        ageOfPatient: 25,
        gender: 'M',
        address: 'Test Address',
        problemDescription: 'Test appointment for email verification',
        appointmentDate: '2024-01-15',
        slotTime: '10:00',
        status: 'pending',
        patient_email: users[0].email
      };
      
      console.log('Sending appointment data:', {
        ...appointmentData,
        patient_email: appointmentData.patient_email
      });
      
      // Test the appointment creation endpoint with authentication
      const response = await axios.post(`${baseURL}/appointment/create/${doctors[0].id}`, appointmentData, {
        headers: authHeaders
      });
      
      console.log('✅ Appointment creation response:', response.data);
      
      if (response.data.message && response.data.message.includes('Check Your Mail')) {
        console.log('✅ Email confirmation message found in response!');
      } else {
        console.log('❌ Email confirmation message not found in response');
        console.log('   Response message:', response.data.message);
      }
      
      console.log('\n📋 Step 4: Testing Enhanced Appointment API');
      console.log('---------------------------------------------');
      
      const enhancedAppointmentData = {
        patient_id: users[0].id,
        doctor_id: doctors[0].id,
        patient_first_name: users[0].first_name,
        doc_first_name: doctors[0].doctor_name,
        ageOfPatient: 30,
        gender: 'F',
        address: 'Test Address Enhanced',
        problemDescription: 'Test enhanced appointment for email verification',
        appointmentDate: '2024-01-16',
        slotTime: '14:00',
        consultation_type: 'in-person',
        status: 'pending',
        patient_email: users[0].email,
        paymentDetails: {
          transactionId: 'test-transaction-123',
          simcardHolder: 'Test User',
          phoneNumber: '+250700000001',
          paymentMethod: 'mobile_money',
          amount: 5000,
          currency: 'RWF'
        }
      };
      
      console.log('Sending enhanced appointment data...');
      
      const enhancedResponse = await axios.post(`${baseURL}/enhanced-appointment/create/${doctors[0].id}`, enhancedAppointmentData, {
        headers: authHeaders
      });
      
      console.log('✅ Enhanced appointment response:', enhancedResponse.data);
      
      if (enhancedResponse.data.message && enhancedResponse.data.message.includes('Check your email')) {
        console.log('✅ Enhanced email confirmation message found!');
      } else {
        console.log('❌ Enhanced email confirmation message not found');
        console.log('   Response message:', enhancedResponse.data.message);
      }
      
      console.log('\n🎉 Email Flow Test Complete!');
      console.log('\nIf emails are not being received, check:');
      console.log('1. Email configuration in .env file');
      console.log('2. Gmail app password is correct');
      console.log('3. Patient email address is valid');
      console.log('4. Check spam/junk folders');
      console.log('5. Email provider is not blocking the emails');
      
    } else {
      console.log('❌ User login failed:', loginResponse.data.message);
      console.log('   This might be because the test user password is not set correctly');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
    
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the backend server is running');
    console.log('2. Check if the API endpoints are accessible');
    console.log('3. Verify database connection');
    console.log('4. Check server logs for errors');
    console.log('5. Verify test user credentials');
  }
}

// Run the test
testAppointmentBooking(); 