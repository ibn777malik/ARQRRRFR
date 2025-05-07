export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const response = await fetch("http://localhost:5000/api/uploads"); // ✅ Fetch from backend
    if (!response.ok) {
      throw new Error(`Backend API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // ✅ Ensure every entry has `qrCodeUrl`
    const updatedData = data.map(item => ({
      ...item,
      qrCodeUrl: item.qrCodeUrl
        ? item.qrCodeUrl // ✅ Use existing value
        : `/qrcodes/${item.url?.split('/').pop()?.replace('.glb', '.png')}`, // ✅ Generate dynamically if missing
    }));

    res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error fetching uploads from backend:", error);
    res.status(500).json({ error: "Failed to fetch uploads from backend." });
  }
}
