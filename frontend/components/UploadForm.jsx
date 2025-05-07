import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.url) {
        setPreview(data.url);
        setQrCode(data.qrCodePath);
        setQrUrl(data.qrUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Upload Restaurant Menu</h2>
      <form onSubmit={handleUpload}>
        <input 
          type="file" 
          accept=".zip,.glb,.gltf,.png,.jpg,.mp4" 
          onChange={(e) => setFile(e.target.files[0])} 
        />
        <button type="submit" style={{ marginLeft: "10px" }}>
          upload restaurant menu
        </button>
      </form>

      {preview && (
        <div style={{ marginTop: "20px" }}>
          <p>
            Uploaded File:{" "}
            <a href={preview} target="_blank" rel="noopener noreferrer">
              {preview}
            </a>
          </p>
          {qrCode && (
            <div>
              <img src={qrCode} alt="QR Code" style={{ maxWidth: "200px" }} />
              <p>
                Scan or visit:{" "}
                <a href={qrUrl} target="_blank" rel="noopener noreferrer">
                  {qrUrl}
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
