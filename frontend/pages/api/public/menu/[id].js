export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Make sure to use the correct endpoint path that matches your backend
    const response = await fetch(`http://localhost:5000/api/menus/public/${id}`);
    
    if (!response.ok) {
      // Log more details about the error
      const errorText = await response.text();
      console.error(`Backend error (${response.status}):`, errorText);
      
      return res.status(response.status).json({ 
        error: `Failed to fetch menu from backend: ${response.status}`,
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

  useEffect(() => {
    if (!id) return;
    
    console.log("Menu ID from URL:", id);
    
    // Fetch menu data

    const fetchMenu = async () => {
        try {
          setLoading(true);
          
          // Call the backend directly
          const backendUrl = "http://localhost:5000";
          const response = await fetch(`${backendUrl}/api/menus/public/${id}`);
          
          if (!response.ok) {
            console.error("Error fetching menu:", response.status, response.statusText);
            throw new Error(`Menu fetch failed: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Menu data received:", data);
          
          setMenu(data);
          setSelectedCategory(data.categories && data.categories.length > 0 ? data.categories[0] : null);
        } catch (error) {
          console.error("Error processing menu data:", error);
          setError(error.message || "Failed to load menu");
        } finally {
          setLoading(false);
        }
      };
    
    fetchMenu();
  }, [id]);
  