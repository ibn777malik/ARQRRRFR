export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Connect to your backend API
    const response = await fetch(`http://localhost:5000/api/elements/${id}`);
    
    if (!response.ok) {
      // Log more details about the error
      const errorText = await response.text();
      console.error(`Backend error (${response.status}):`, errorText);
      
      return res.status(response.status).json({ 
        error: `Failed to fetch model from backend: ${response.status}`,
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