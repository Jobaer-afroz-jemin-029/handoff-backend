const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

//const API_BASE_URL = 'http://192.168.1.105:8000';
const API_BASE_URL = 'https://handoff-v1jo.onrender.com';

async function testProductAdd() {
  try {
    console.log('🧪 Testing product posting...\n');

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
    console.log(`📊 Current products: ${products.length}`);

    // Step 3: Create a test product
    console.log('\n3. Creating test product...');
    const formData = new FormData();
    formData.append('title', 'Test Product from API');
    formData.append('description', 'This is a test product created via API');
    formData.append('price', '5000');
    formData.append('category', 'Phone');
    formData.append('location', 'BUBT Campus');
    formData.append('sellerName', 'Test Seller');
    formData.append('sellerVarsityId', '12345678');

    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    formData.append('images', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    const addResponse = await fetch(`${API_BASE_URL}/api/products/add`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Add product response status:', addResponse.status);

    if (!addResponse.ok) {
      const errorText = await addResponse.text();
      console.log('❌ Failed to add product:', errorText);
      return;
    }

    const addData = await addResponse.json();
    console.log('✅ Product added successfully:', addData);

    // Step 4: Check products again
    console.log('\n4. Checking products after adding...');
    const finalProductsResponse = await fetch(`${API_BASE_URL}/api/products`);
    const finalProducts = await finalProductsResponse.json();
    console.log(`📊 Final products: ${finalProducts.length}`);

    // Find the new product
    const newProduct = finalProducts.find(p => p.title === 'Test Product from API');
    if (newProduct) {
      console.log('✅ New product found:', {
        id: newProduct._id,
        title: newProduct.title,
        status: newProduct.status
      });
    } else {
      console.log('❌ New product not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProductAdd();
