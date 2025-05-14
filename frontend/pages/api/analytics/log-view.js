// frontend/pages/api/analytics/log-view.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { modelId, menuId, viewType } = req.body;
    
    if (!modelId) {
      return res.status(400).json({ error: "Model ID is required" });
    }
    
    // Prepare data for analytics
    const analyticsData = {
      modelId,
      menuId: menuId || null,
      interactionType: viewType || 'ar_view',
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      }
    };
    
    // Send to backend analytics endpoint if available
    try {
      const response = await fetch("http://localhost:5000/api/analytics/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(analyticsData)
      });
      
      if (!response.ok) {
        console.warn("Backend analytics response not OK:", await response.text());
      }
    } catch (error) {
      // Log but don't fail the request if analytics fails
      console.warn("Failed to send analytics to backend:", error);
    }
    
    // Return success regardless of backend response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in analytics log-view API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}