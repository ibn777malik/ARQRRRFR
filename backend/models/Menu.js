// Create a new Menu model in backend/models/Menu.js
const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Element' },
  image: { type: String },
  ingredients: [String],
  allergens: [String],
  available: { type: Boolean, default: true }
});

const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  restaurant: { type: String, required: true },
  categories: [String],
  items: [MenuItemSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Menu", MenuSchema);