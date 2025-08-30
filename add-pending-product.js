require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGO_URI ||
      'mongodb+srv://jobaerafroz4:qwerty123456@cluster0.vp15qty.mongodb.net/'
  )
  .then(() => console.log('Connected to MongoDB'))
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

async function addPendingProduct() {
  try {
    // Create a test product with pending status
    const testProduct = new Product({
      title: 'Test Laptop for Admin Approval',
      description:
        'This is a test laptop that needs admin approval. It has good specs and is in excellent condition.',
      price: 45000,
      category: 'Computer',
      location: 'Dhaka',
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      sellerId: 'test-seller-123',
      sellerName: 'Test Seller',
      sellerVarsityId: '22235103000',
      status: 'pending', // This is the key - pending status
      ratings: [],
    });

    await testProduct.save();

    console.log('✅ Test pending product added successfully!');
    console.log('Product ID:', testProduct._id);
    console.log('Status:', testProduct.status);
    console.log('Title:', testProduct.title);
  } catch (error) {
    console.error('❌ Error adding test product:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the function
addPendingProduct().catch(console.error);


