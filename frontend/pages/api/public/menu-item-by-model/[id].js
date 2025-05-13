// frontend/pages/api/public/menu-item-by-model/[id].js
export default async function handler(req, res) {
    const { id } = req.query;
    
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    try {
      // This endpoint would fetch a menu item that references a specific model ID
      const response = await fetch(`http://localhost:5000/api/menus/public/menu-item-by-model/${id}`);
      
      if (!response.ok) {
        // If not found, it's not an error - just return null
        if (response.status === 404) {
          return res.status(200).json(null);
        }
        
        const errorText = await response.text();
        console.error(`Backend error (${response.status}):`, errorText);
        
        return res.status(response.status).json({ 
          error: `Failed to fetch menu item from backend: ${response.status}`,
          details: response.statusText,
          message: errorText
        });
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error in frontend API route:", error);
      return res.status(500).json({ error: "Internal error in frontend API", message: error.message });
    }
  }