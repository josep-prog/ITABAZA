const axios = require('axios');
const colors = require('colors');

const baseURL = 'http://localhost:8080';

async function testUnifiedLogin() {
  console.log('🧪 Testing Unified Login System'.cyan.bold);
  console.log('=' .repeat(50).gray);
  
  const testCases = [
    {
      name: "Patient Login Test",
      email: "test@example.com",
      password: "password123", // You may need to adjust this
      expectedType: "patient",
      description: "Testing patient authentication"
    },
    {
      name: "Doctor Login Test (Dr. John Smith)",
      email: "john.smith@medistar.com",
      password: "doctor123", // Default password we set
      expectedType: "doctor",
      description: "Testing doctor authentication with default password"
    },
    {
      name: "Doctor Login Test (Dr. Sarah Johnson)", 
      email: "sarah.johnson@medistar.com",
      password: "password123", // Alternative default password
      expectedType: "doctor",
      description: "Testing doctor authentication with alternative password"
    },
    {
      name: "Admin Login Test",
      email: "admin@medistar.com",
      password: "password123", // From database check
      expectedType: "admin",
      description: "Testing admin authentication"
    },
    {
      name: "Invalid Login Test",
      email: "nonexistent@example.com",
      password: "wrongpassword",
      expectedType: null,
      description: "Testing invalid credentials handling"
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`\n🔍 ${testCase.name}`.yellow);
    console.log(`   Description: ${testCase.description}`.gray);
    console.log(`   Email: ${testCase.email}`.gray);
    
    try {
      const response = await axios.post(`${baseURL}/auth/login`, {
        email: testCase.email,
        password: testCase.password
      }, {
        timeout: 10000, // 10 second timeout
        validateStatus: function (status) {
          return status < 500; // Don't throw error for 4xx responses
        }
      });
      
      const data = response.data;
      
      if (data.success) {
        console.log(`✅ Login successful!`.green);
        console.log(`   User Type: ${data.userType}`.green);
        console.log(`   Dashboard URL: ${data.dashboardUrl}`.green);
        console.log(`   User Name: ${data.user.firstName || data.user.name}`.green);
        console.log(`   Token: ${data.token ? 'Generated' : 'Missing'}`.green);
        
        if (data.userType === testCase.expectedType) {
          console.log(`✅ User type matches expected: ${testCase.expectedType}`.green);
          passedTests++;
        } else {
          console.log(`❌ User type mismatch. Expected: ${testCase.expectedType}, Got: ${data.userType}`.red);
        }
        
        // Test the user-role endpoint if login was successful
        if (data.token) {
          console.log(`🔍 Testing /auth/user-role endpoint...`.cyan);
          try {
            const roleResponse = await axios.get(`${baseURL}/auth/user-role`, {
              headers: {
                'Authorization': `Bearer ${data.token}`
              }
            });
            
            if (roleResponse.data.success) {
              console.log(`✅ Role endpoint works: ${roleResponse.data.userType}`.green);
            }
          } catch (roleError) {
            console.log(`❌ Role endpoint failed: ${roleError.response?.data?.message || roleError.message}`.red);
          }
        }
        
      } else {
        if (testCase.expectedType === null) {
          console.log(`✅ Expected failure for invalid credentials: ${data.message}`.green);
          passedTests++;
        } else {
          console.log(`❌ Login failed unexpectedly: ${data.message}`.red);
        }
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Server not running! Please start the backend server.`.red);
        break;
      } else if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data || 'Unknown error';
        if (testCase.expectedType === null) {
          console.log(`✅ Expected failure for invalid credentials: ${errorMessage}`.green);
          passedTests++;
        } else {
          console.log(`❌ Login failed: ${errorMessage}`.red);
        }
      } else {
        console.log(`❌ Network error: ${error.message}`.red);
      }
    }
  }
  
  console.log(`\n${'='.repeat(50)}`.gray);
  console.log(`🏁 Testing Complete!`.cyan.bold);
  console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`.yellow);
  
  if (passedTests === totalTests) {
    console.log(`🎉 All tests passed! Unified login is working correctly.`.green.bold);
  } else {
    console.log(`⚠️  Some tests failed. Please check the issues above.`.yellow);
  }
  
  console.log(`\n📋 Instructions for manual testing:`.blue);
  console.log(`1. Visit: http://localhost:3000/login.html`.blue);
  console.log(`2. Try logging in with these credentials:`.blue);
  console.log(`   👤 Patient: test@example.com / password123`.blue);
  console.log(`   👨‍⚕️ Doctor: john.smith@medistar.com / doctor123`.blue);
  console.log(`   🛡️  Admin: admin@medistar.com / password123`.blue);
  console.log(`3. Each should redirect to the appropriate dashboard`.blue);
}

// Check if server is running first
async function checkServer() {
  try {
    console.log('🔍 Checking if server is running...'.yellow);
    const response = await axios.get(`${baseURL}/api/health`, { timeout: 5000 });
    console.log('✅ Server is running!'.green);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start it with: npm start'.red);
      console.log('Or run: node index.js'.red);
      return false;
    } else {
      console.log('⚠️  Server health check failed, but proceeding with tests...'.yellow);
      return true;
    }
  }
}

// Run the tests
checkServer().then(serverRunning => {
  if (serverRunning) {
    testUnifiedLogin().catch(console.error);
  }
});
