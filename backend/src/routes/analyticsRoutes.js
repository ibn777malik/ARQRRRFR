const express = require("express");
const router = express.Router();
const MenuInteraction = require("../../models/MenuInteraction");
const { protect } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// Log a new interaction (public endpoint)
router.post("/interactions", async (req, res) => {
  try {
    const { 
      menuId, 
      menuItemId, 
      modelId, 
      interactionType, 
      metadata, 
      deviceInfo, 
      sessionId 
    } = req.body;
    
    // Validate required fields
    if (!interactionType) {
      return res.status(400).json({ error: "Interaction type is required" });
    }
    
    // Validate at least one ID is provided
    if (!menuId && !menuItemId && !modelId) {
      return res.status(400).json({ error: "At least one of menuId, menuItemId, or modelId is required" });
    }
    
    // Create and save the interaction
    const interaction = new MenuInteraction({
      menuId,
      menuItemId,
      modelId,
      interactionType,
      metadata,
      deviceInfo,
      sessionId,
      // If user is authenticated, store their ID
      userId: req.user?.userId,
    });
    
    await interaction.save();
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error logging interaction:", error);
    res.status(500).json({ error: "Failed to log interaction" });
  }
});

// Get interaction statistics for a menu (protected endpoint)
router.get("/menu/:menuId/stats", protect, async (req, res) => {
  try {
    const { menuId } = req.params;
    const { startDate, endDate } = req.query;
    
    const query = { menuId: mongoose.Types.ObjectId(menuId) };
    
    // Add date filtering if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Total interactions
    const totalInteractions = await MenuInteraction.countDocuments(query);
    
    // Interactions by type
    const interactionsByType = await MenuInteraction.aggregate([
      { $match: query },
      { $group: {
          _id: "$interactionType",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Most viewed items
    const mostViewedItems = await MenuInteraction.aggregate([
      { $match: { ...query, menuItemId: { $exists: true, $ne: null } } },
      { $group: {
          _id: "$menuItemId",
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);
    
    // Most viewed AR models
    const mostViewedModels = await MenuInteraction.aggregate([
      { $match: { ...query, modelId: { $exists: true, $ne: null }, interactionType: "ar_view" } },
      { $group: {
          _id: "$modelId",
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);
    
    // Items added to cart
    const cartAdditions = await MenuInteraction.aggregate([
      { $match: { ...query, interactionType: "add_to_cart" } },
      { $group: {
          _id: "$menuItemId",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalInteractions,
      interactionsByType,
      mostViewedItems,
      mostViewedModels,
      cartAdditions
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Get daily interaction counts for a date range
router.get("/menu/:menuId/daily", protect, async (req, res) => {
  try {
    const { menuId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Both startDate and endDate are required" });
    }
    
    const dailyInteractions = await MenuInteraction.aggregate([
      { 
        $match: { 
          menuId: mongoose.Types.ObjectId(menuId),
          timestamp: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(dailyInteractions);
  } catch (error) {
    console.error("Error fetching daily analytics:", error);
    res.status(500).json({ error: "Failed to fetch daily analytics" });
  }
});

// Export analytics data as CSV
router.get("/menu/:menuId/export", protect, async (req, res) => {
  try {
    const { menuId } = req.params;
    const { startDate, endDate } = req.query;
    
    const query = { menuId: mongoose.Types.ObjectId(menuId) };
    
    // Add date filtering if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const interactions = await MenuInteraction.find(query)
      .select("menuItemId modelId interactionType timestamp sessionId")
      .sort({ timestamp: 1 });
    
    // Create CSV header
    let csv = 'Timestamp,Interaction Type,Menu Item ID,Model ID,Session ID\n';
    
    // Add each interaction
    interactions.forEach(interaction => {
      const timestamp = new Date(interaction.timestamp).toISOString();
      const row = [
        timestamp,
        interaction.interactionType,
        interaction.menuItemId || '',
        interaction.modelId || '',
        interaction.sessionId || ''
      ];
      csv += row.join(',') + '\n';
    });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=menu_${menuId}_analytics.csv`);
    
    res.send(csv);
  } catch (error) {
    console.error("Error exporting analytics:", error);
    res.status(500).json({ error: "Failed to export analytics" });
  }
});

module.exports = router;