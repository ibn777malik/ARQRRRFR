// backend/src/routes/menuRoutes.js - Revert to working version

const express = require("express");
const router = express.Router();
const Menu = require('../../models/Menu');
const mongoose = require("mongoose");
const { protect } = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const { createQR } = require("../utils/qrGenerator");
const path = require("path");
const fs = require("fs");

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware: Verify Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized: No token provided" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Create a new menu
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, restaurant, categories, items, theme } = req.body;
    
    console.log("Creating menu with:", { name, restaurant, categories: categories?.length });
    
    const menu = new Menu({
      name,
      restaurant,
      categories,
      items,
      theme,
      userId: req.userId
    });
    
    await menu.save();
    console.log("Menu created successfully with ID:", menu._id);
    res.status(201).json(menu);
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(500).json({ error: "Failed to create menu" });
  }
});

// Generate QR code for menu
router.get("/qr/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);
    
    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }
    
    // Define QR code paths and URLs
    const qrDir = path.join(__dirname, "../public/qrcodes");
    const frontendQrDir = path.resolve(__dirname, "../../../frontend/public/qrcodes");
    
    // Make sure directories exist
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
    if (!fs.existsSync(frontendQrDir)) fs.mkdirSync(frontendQrDir, { recursive: true });
    
    // Create QR filename
    const qrFilename = `menu_${id}`;
    
    // Define the menu URL - use actual domain from environment or default to localhost
    const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${id}`;
    
    // Generate QR code
    const qrFilePath = path.join(frontendQrDir, `${qrFilename}.png`);
    await createQR(menuUrl, qrFilePath);
    
    // Return URLs
    res.json({
      menuUrl,
      qrCodeUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/qrcodes/${qrFilename}.png`
    });
    
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Update an existing menu
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, restaurant, categories, items, theme } = req.body;
    
    console.log(`Updating menu ${id} with:`, { name, restaurant });
    
    // Ensure the menu exists and belongs to this user
    const existingMenu = await Menu.findOne({ _id: id, userId: req.userId });
    
    if (!existingMenu) {
      return res.status(404).json({ error: "Menu not found or access denied" });
    }
    
    // Update the menu
    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      { name, restaurant, categories, items, theme },
      { new: true } // Return the updated document
    );
    
    console.log("Menu updated successfully");
    res.json(updatedMenu);
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(500).json({ error: "Failed to update menu" });
  }
});

// Get all menus for a user
router.get("/", verifyToken, async (req, res) => {
  try {
    const menus = await Menu.find({ userId: req.userId });
    res.json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(500).json({ error: "Failed to fetch menus" });
  }
});

// Get menu by ID (protected)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const menu = await Menu.findOne({ _id: req.params.id, userId: req.userId });
    if (!menu) return res.status(404).json({ error: "Menu not found" });
    
    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// Get menu by ID (public endpoint)
router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching public menu with ID: ${id}`);
    
    // Ensure the ID is in a valid format for MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid menu ID format: ${id}`);
      return res.status(400).json({ error: "Invalid menu ID format" });
    }
    
    const menu = await Menu.findById(id);
    
    if (!menu) {
      console.error(`Menu not found with ID: ${id}`);
      return res.status(404).json({ error: "Menu not found" });
    }
    
    console.log(`Successfully found menu: ${menu.name}`);
    res.json(menu);
  } catch (error) {
    console.error(`Error fetching menu ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// Delete a menu
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const result = await Menu.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    
    if (!result) {
      return res.status(404).json({ error: "Menu not found or access denied" });
    }
    
    res.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu:", error);
    res.status(500).json({ error: "Failed to delete menu" });
  }
});
// Get menu item and parent menu by model ID
router.get("/public/menu-item-by-model/:modelId", async (req, res) => {
  try {
    const { modelId } = req.params;
    console.log(`Searching for menu item referencing model: ${modelId}`);
    
    // Check for both value field and glbFile field
    const menu = await Menu.findOne({
      $or: [
        { "items.buttonType": "model", "items.value": modelId },
        { "items.buttonType": "model", "items.glbFile": modelId }
      ]
    });
    
    if (!menu) {
      console.log(`No menu found with an item referencing model ID: ${modelId}`);
      return res.status(404).json({ error: "No menu item found for this model" });
    }
    
    // Find the specific item within the menu
    let menuItem = menu.items.find(item => 
      item.buttonType === "model" && item.value === modelId
    );
    
    // If not found by value, try finding by glbFile
    if (!menuItem) {
      menuItem = menu.items.find(item =>
        item.buttonType === "model" && item.glbFile === modelId
      );
    }
    
    if (!menuItem) {
      console.log("Menu found but item not found (unexpected)");
      return res.status(404).json({ error: "Menu item not found" });
    }
    
    console.log(`Found menu item: ${menuItem.name} in menu: ${menu.name}`);
    
    // Return both the menu item and the menu ID
    res.json({
      item: menuItem,
      menuId: menu._id
    });
    
  } catch (error) {
    console.error(`Error finding menu item for model ${req.params.modelId}:`, error);
    res.status(500).json({ error: "Failed to retrieve menu item" });
  }
});
module.exports = router;