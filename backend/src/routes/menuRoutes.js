// Add to backend/src/routes/menuRoutes.js
const express = require("express");
const router = express.Router();
const Menu = require('../../models/Menu');
const Element = require("../../models/Element");
const { protect } = require("../middleware/authMiddleware");

// Create a new menu
router.post("/", protect, async (req, res) => {
  try {
    const { name, restaurant, categories, items } = req.body;
    
    const menu = new Menu({
      name,
      restaurant,
      categories,
      items,
      userId: req.user.userId
    });
    
    await menu.save();
    res.status(201).json(menu);
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(500).json({ error: "Failed to create menu" });
  }
});

// Get all menus for a user
router.get("/", protect, async (req, res) => {
  try {
    const menus = await Menu.find({ userId: req.user.userId });
    res.json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(500).json({ error: "Failed to fetch menus" });
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

module.exports = router;