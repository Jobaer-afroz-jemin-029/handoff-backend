require('dotenv').config();

console.log('Environment variables loaded:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  'CLOUDINARY_API_KEY:',
  process.env.CLOUDINARY_API_KEY ? '***SET***' : 'NOT SET'
);
console.log(
  'CLOUDINARY_API_SECRET:',
  process.env.CLOUDINARY_API_SECRET ? '***SET***' : 'NOT SET'
);

try {
  const cloudinary = require('cloudinary').v2;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('\nCloudinary config:', {
    cloud_name: cloudinary.config().cloud_name,
    api_key: cloudinary.config().api_key ? 'SET' : 'NOT SET',
    api_secret: cloudinary.config().api_secret ? 'SET' : 'NOT SET',
  });

  // Test 1: Try to get account info instead of ping
  console.log('\nTesting Cloudinary connection...');

  cloudinary.api
    .resources({ max_results: 1 })
    .then((result) => {
      console.log('✅ Cloudinary connection successful!');
      console.log('Account info:', {
        resource_count: result.resources?.length || 0,
        limit: result.limit,
        next_cursor: result.next_cursor,
      });
    })
    .catch((error) => {
      console.error('❌ Cloudinary connection failed:', error.message);
      console.error('Error details:', error);

      // Try alternative test
      console.log('\nTrying alternative test...');
      return cloudinary.api.root();
    })
    .then((result) => {
      if (result) {
        console.log('✅ Alternative test successful:', result);
      }
    })
    .catch((altError) => {
      console.error('❌ Alternative test also failed:', altError.message);
    });
} catch (error) {
  console.error('❌ Error loading cloudinary:', error.message);
}
