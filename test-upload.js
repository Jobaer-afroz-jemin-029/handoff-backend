require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary upload...');

// Test with a simple text-based image
const testImage =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGVzdDwvdGV4dD48L3N2Zz4=';

cloudinary.uploader
  .upload(testImage, {
    folder: 'test',
    public_id: 'test-image-' + Date.now(),
  })
  .then((result) => {
    console.log('✅ Upload successful!');
    console.log('Public ID:', result.public_id);
    console.log('URL:', result.secure_url);

    // Clean up - delete the test image
    return cloudinary.uploader.destroy(result.public_id);
  })
  .then((result) => {
    console.log('✅ Test image deleted:', result);
  })
  .catch((error) => {
    console.error('❌ Upload failed:', error.message);
    console.error('Error details:', error);
  });
