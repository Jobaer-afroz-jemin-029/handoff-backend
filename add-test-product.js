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
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Test product data
const testProduct = new Product({
  title: 'Test iPhone 15 Pro - Excellent Condition',
  description:
    'This is a test product to verify the system is working. Selling my iPhone 15 Pro in excellent condition. No scratches, battery health 95%. Comes with original charger and box. Perfect for testing the BUBT Mart application.',
  price: 95000,
  category: 'Phone',
  location: 'BUBT Campus, Mirpur',
  images: [
    'https://res.cloudinary.com/dcjuhwxsc/image/upload/v1756494460/main-sample.png',
  ],
  sellerId: 'TEST_USER_001',
  sellerName: 'Test Seller',
  sellerVarsityId: 'TEST001',
  status: 'approved',
  ratings: [
    {
      buyerId: 'TEST_BUYER_001',
      buyerName: 'Test Buyer',
      rating: 5,
      comment: 'Great test product! System is working perfectly.',
      createdAt: new Date(),
    },
  ],
});

async function addTestProduct() {
  try {
    // Check if test product already exists
    const existingProduct = await Product.findOne({
      title: 'Test iPhone 15 Pro - Excellent Condition',
    });

    if (existingProduct) {
      console.log('✅ Test product already exists!');
      console.log('Product ID:', existingProduct._id);
      console.log('Status:', existingProduct.status);
      return;
    }

    // Save the test product
    const savedProduct = await testProduct.save();

    console.log('✅ Test product added successfully!');
    console.log('Product ID:', savedProduct._id);
    console.log('Title:', savedProduct.title);
    console.log('Price:', savedProduct.price);
    console.log('Images:', savedProduct.images);
    console.log('Status:', savedProduct.status);
  } catch (error) {
    console.error('❌ Error adding test product:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the function
addTestProduct().catch(console.error);
