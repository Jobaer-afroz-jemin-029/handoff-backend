const fetch = require('node-fetch');

//const API_BASE_URL = 'http://192.168.1.105:8000';
const API_BASE_URL = 'https://handoff-v1jo.onrender.com';

async function testProductPosting() {
  try {
    console.log('🧪 Testing product posting flow...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: '22235103029@cse.bubt.edu.bd',
        password: 'admin123',
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Step 2: Check current products
    console.log('\n2. Checking current products...');
    const productsResponse = await fetch(`${API_BASE_URL}/api/products`);
    const products = await productsResponse.json();
    
    console.log(`📊 Total products: ${products.length}`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title} - Status: ${product.status}`);
    });

    // Step 3: Check pending products
    console.log('\n3. Checking pending products...');
    const pendingResponse = await fetch(`${API_BASE_URL}/api/products/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (pendingResponse.ok) {
      const pendingProducts = await pendingResponse.json();
      console.log(`📋 Pending products: ${pendingProducts.length}`);
      pendingProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.title} by ${product.sellerName}`);
      });
    } else {
      console.log('❌ Failed to fetch pending products');
    }

    // Step 4: Approve a pending product (if any)
    if (products.some(p => p.status === 'pending')) {
      const pendingProduct = products.find(p => p.status === 'pending');
      console.log(`\n4. Approving product: ${pendingProduct.title}`);
      
      const approveResponse = await fetch(`${API_BASE_URL}/api/products/approve/${pendingProduct._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (approveResponse.ok) {
        console.log('✅ Product approved successfully');
      } else {
        console.log('❌ Failed to approve product');
      }
    } else {
      console.log('\n4. No pending products to approve');
    }

    // Step 5: Check products again
    console.log('\n5. Checking products after approval...');
    const finalProductsResponse = await fetch(`${API_BASE_URL}/api/products`);
    const finalProducts = await finalProductsResponse.json();
    
    console.log(`📊 Final product count: ${finalProducts.length}`);
    finalProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title} - Status: ${product.status}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProductPosting();
