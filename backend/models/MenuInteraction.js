const mongoose = require("mongoose");

const MenuInteractionSchema = new mongoose.Schema({
  // User identifier (optional - could be anonymous)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  
  // Reference to the menu
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: false,
  },
  
  // Reference to the menu item
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  
  // Reference to the model
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Element',
    required: false,
  },
  
  // Type of interaction
  interactionType: {
    type: String,
    enum: ['view', 'ar_view', 'add_to_cart', 'order', 'share'],
    required: true,
  },
  
  // Additional data about the interaction
  metadata: {
    type: Object,
    default: {},
  },
  
  // Device information
  deviceInfo: {
    type: Object,
    default: {},
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
  },
  
  // Session identifier to track user journey
  sessionId: {
    type: String,
    required: false,
  }
});

// Add indexes for common queries
MenuInteractionSchema.index({ menuId: 1, timestamp: -1 });
MenuInteractionSchema.index({ menuItemId: 1, timestamp: -1 });
MenuInteractionSchema.index({ modelId: 1, timestamp: -1 });
MenuInteractionSchema.index({ interactionType: 1, timestamp: -1 });

module.exports = mongoose.model("MenuInteraction", MenuInteractionSchema);