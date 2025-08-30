const fetch = require('node-fetch');

const API_BASE_URL = 'http://192.168.1.105:8000';

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login...\n');

    // Test admin login
    const adminEmail = '22235103029@cse.bubt.edu.bd';
    const adminPassword = 'admin123'; // Updated password

    console.log(`Attempting login with: ${adminEmail}`);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    if (!response.ok) {
      const errorData = await response.text();
      console.log('Error response:', errorData);
      return;
    }

    const data = await response.json();
    console.log('\n✅ Login successful!');
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.user && data.user.role) {
      console.log(`\n👑 User role: ${data.user.role}`);
      if (data.user.role === 'admin') {
        console.log('✅ User has admin privileges!');
      } else {
        console.log('❌ User does not have admin privileges');
      }
    } else {
      console.log('❌ No role information in response');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminLogin();
