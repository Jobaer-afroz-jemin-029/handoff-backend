# BUBT Mart Backend API

This is the backend API for the BUBT Mart application, built with Node.js, Express, MongoDB, and Cloudinary.

## Features

- User authentication with JWT
- Email verification system
- Product management with image uploads
- Rating system
- Admin approval system

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Port
PORT=8000
```

### 3. Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

### 4. Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Use the app password in your `.env` file

### 5. Start the Server

```bash
npm start
```

The server will run on `http://localhost:8000`

## API Endpoints

### Authentication

- `POST /register` - User registration
- `POST /login` - User login
- `GET /verify/:token` - Email verification

### Products

- `GET /api/products` - Get all products
- `POST /api/products/add` - Add new product (with images)
- `PATCH /api/products/approve/:id` - Approve product (admin)
- `PATCH /api/products/reject/:id` - Reject product (admin)
- `POST /api/products/:id/ratings` - Add rating to product

## File Structure

```
api/
├── models/
│   ├── user.js          # User model
│   └── product.js       # Product model
├── routes/
│   └── product.js       # Product routes
├── cloudinaryConfig.js  # Cloudinary configuration
├── index.js             # Main server file
└── package.json
```

## Image Upload

The API supports image uploads using Multer and Cloudinary. Images are automatically uploaded to Cloudinary and the URLs are stored in MongoDB.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Email verification
- Input validation
- CORS enabled
# handoff-backend
