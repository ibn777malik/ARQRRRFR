const mongoose = require("mongoose");

// Define menu item schema
const MenuItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['button', 'image', 'video', 'text'],
    required: true
  },
  name: {
    type: String,
    default: "Untitled Item"
  },
  // For button type
  buttonType: {
    type: String,
    enum: ['model', 'url', 'image', 'video'],
  },
  label: String,
  value: String,
  // For image/video type
  src: String,
  alt: String,
  width: Number,
  height: Number,
  autoplay: Boolean,
  controls: Boolean,
  // For text type
  content: String,
  // For all types - styling
  style: {
    type: Object,
    default: {}
  },
  // Additional fields
  clickBehavior: String,
  linkUrl: String
});

// Define the menu theme schema
const ThemeSchema = new mongoose.Schema({
  primaryColor: {
    type: String,
    default: "#0070f3"
  },
  secondaryColor: {
    type: String,
    default: "#f5f5f5"
  },
  textColor: {
    type: String,
    default: "#333333"
  },
  fontFamily: {
    type: String,
    default: "Arial, sans-serif"
  },
  backgroundImage: String
});

// Define the main menu schema
const MenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "My Menu"
  },
  restaurant: {
    type: String,
    required: true,
    default: "My Restaurant"
  },
  categories: {
    type: [String],
    default: []
  },
  items: {
    type: [MenuItemSchema],
    default: []
  },
  theme: {
    type: ThemeSchema,
    default: {
      primaryColor: "#0070f3",
      secondaryColor: "#f5f5f5",
      textColor: "#333333",
      fontFamily: "Arial, sans-serif"
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
MenuSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Menu", MenuSchema);