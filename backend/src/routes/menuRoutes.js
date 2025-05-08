const express = require("express");
const router = express.Router();
const Menu = require('../../models/Menu');
const Element = require("../../models/Element");
const { protect } = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

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
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ error: "Menu not found" });
    
    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// Get model info (public endpoint)
router.get("/public/model/:id", async (req, res) => {
  try {
    const element = await Element.findById(req.params.id);
    if (!element) return res.status(404).json({ error: "Model not found" });
    
    res.json(element);
  } catch (error) {
    console.error("Error fetching model:", error);
    res.status(500).json({ error: "Failed to fetch model" });
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

module.exports = router;