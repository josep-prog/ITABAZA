// Test script to verify CORS configuration
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCORS() {
    try {
        console.log('Testing CORS configuration...');
        
        // Test preflight OPTIONS request
        console.log('\n1. Testing OPTIONS preflight request...');
        const optionsResponse = await fetch('https://itabaza.onrender.com/department/all', {
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://itabaza-2qjt.vercel.app',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log('OPTIONS Status:', optionsResponse.status);
        console.log('OPTIONS Headers:');
        for (const [key, value] of optionsResponse.headers.entries()) {
            if (key.startsWith('access-control')) {
                console.log(`  ${key}: ${value}`);
            }
        }
        
        // Test actual GET request
        console.log('\n2. Testing actual GET request...');
        const getResponse = await fetch('https://itabaza.onrender.com/department/all', {
            method: 'GET',
            headers: {
                'Origin': 'https://itabaza-2qjt.vercel.app',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('GET Status:', getResponse.status);
        console.log('GET Headers:');
        for (const [key, value] of getResponse.headers.entries()) {
            if (key.startsWith('access-control')) {
                console.log(`  ${key}: ${value}`);
            }
        }
        
        if (getResponse.ok) {
            const data = await getResponse.json();
            console.log('\nResponse data received successfully');
            console.log('Number of departments:', data.departments?.length || 0);
        } else {
            console.log('\nGET request failed:', getResponse.statusText);
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testCORS();
