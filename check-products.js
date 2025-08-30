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

async function checkProducts() {
  try {
    // Get all products
    const allProducts = await Product.find({});

    console.log(`\n📊 Total Products: ${allProducts.length}`);

    if (allProducts.length === 0) {
      console.log('❌ No products found in database');
      return;
    }

    // Group by status
    const pendingProducts = allProducts.filter((p) => p.status === 'pending');
    const approvedProducts = allProducts.filter((p) => p.status === 'approved');
    const rejectedProducts = allProducts.filter((p) => p.status === 'rejected');

    console.log(`\n🟡 Pending Products: ${pendingProducts.length}`);
    console.log(`🟢 Approved Products: ${approvedProducts.length}`);
    console.log(`🔴 Rejected Products: ${rejectedProducts.length}`);

    // Show pending products details
    if (pendingProducts.length > 0) {
      console.log('\n📋 Pending Products Details:');
      pendingProducts.forEach((product, index) => {
        console.log(
          `${index + 1}. ${product.title} - ৳${product.price} - By: ${
            product.sellerName
          }`
        );
        console.log(`   Status: ${product.status} | ID: ${product._id}`);
      });
    }

    // Show sample of all products
    console.log('\n📋 All Products Sample:');
    allProducts.slice(0, 5).forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.title} - Status: ${product.status} - ID: ${
          product._id
        }`
      );
    });

    if (allProducts.length > 5) {
      console.log(`   ... and ${allProducts.length - 5} more products`);
    }
  } catch (error) {
    console.error('❌ Error checking products:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the function
checkProducts().catch(console.error);


