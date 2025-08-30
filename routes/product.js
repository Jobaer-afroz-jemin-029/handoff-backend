const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig');
const Product = require('../models/product');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bubt-mart',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const parser = multer({ storage });

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(
    token,
    process.env.JWT_SECRET || 'your_jwt_secret',
    async (err, decoded) => {
      if (err)
        return res.status(403).json({ message: 'Invalid or expired token' });

      // Get user details including role
      try {
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(403).json({ message: 'User not found' });

        req.user = { ...decoded, role: user.role };
        next();
      } catch (error) {
        return res.status(500).json({ message: 'Error fetching user details' });
      }
    }
  );
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Add product (with image upload) - Any authenticated user can post
router.post(
  '/add',
  authenticateToken,
  parser.array('images', 5),
  async (req, res) => {
    try {
      console.log('Product add request received');
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);
      
      const {
        title,
        description,
        price,
        category,
        location,
        sellerName,
        sellerVarsityId,
      } = req.body;

      if (!title || !description || !price || !category || !req.files) {
        console.log('Missing required fields:', {
          title: !!title,
          description: !!description,
          price: !!price,
          category: !!category,
          files: !!req.files
        });
        return res
          .status(400)
          .json({ message: 'All required fields and images are mandatory' });
      }

      const imageUrls = req.files.map((file) => file.path);

      const newProduct = new Product({
        title,
        description,
        price,
        category,
        location,
        images: imageUrls,
        sellerId: req.user.userId, // From JWT
        sellerName,
        sellerVarsityId,
        status: 'pending', // All products need admin approval
      });

      await newProduct.save();
      res.status(201).json({
        message: 'Product added successfully and pending admin approval',
        product: newProduct,
        autoApproved: false,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to add product' });
    }
  }
);

// Get all products
router.get('/api/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Approve product (admin only)
router.patch(
  '/approve/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { status: 'approved' },
        { new: true }
      );
      if (!product)
        return res.status(404).json({ message: 'Product not found' });
      res.json({ message: 'Product approved successfully', product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to approve product' });
    }
  }
);

// Reject product (admin only)
router.patch(
  '/reject/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { status: 'rejected' },
        { new: true }
      );
      if (!product)
        return res.status(404).json({ message: 'Product not found' });
      res.json({ message: 'Product rejected successfully', product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to reject product' });
    }
  }
);

// Get pending products (admin only)
router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: 'pending' });
    res.json(pendingProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch pending products' });
  }
});

// Add rating to a product
router.post('/:id/ratings', authenticateToken, async (req, res) => {
  try {
    const { rating, comment, buyerName } = req.body;
    if (!rating || !buyerName) {
      return res
        .status(400)
        .json({ message: 'Rating and buyerName are required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const newRating = {
      buyerId: req.user.userId,
      buyerName,
      rating,
      comment,
      createdAt: new Date(),
    };

    product.ratings.push(newRating);
    await product.save();

    res
      .status(201)
      .json({ message: 'Rating added successfully', rating: newRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add rating' });
  }
});

module.exports = router;
