export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("Frontend API: Fetching menu item for model ID:", id);
    
    // Connect to your backend API
    const response = await fetch(`http://localhost:5000/api/menus/public/menu-item-by-model/${id}`);
    
    if (!response.ok) {
      // If not found, it's not an error in this context - just return null
      if (response.status === 404) {
        console.log("No menu item found for model ID:", id);
        return res.status(200).json(null);
      }
      
      // For other errors, log details
      const errorText = await response.text();
      console.error(`Backend error (${response.status}):`, errorText);
      
      return res.status(response.status).json({ 
        error: `Failed to fetch menu item from backend: ${response.status}`,
        details: response.statusText,
        message: errorText
      });
    }
    
    const data = await response.json();
    console.log("Frontend API: Found menu item:", data);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in frontend API route:", error);
    return res.status(500).json({ error: "Internal error in frontend API", message: error.message });
  }
}