const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  location: { type: String },
  images: [{ type: String }], // URLs from Cloudinary
  sellerId: { type: String, required: true },
  sellerName: { type: String, required: true },
  sellerVarsityId: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  ratings: [ratingSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
