import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const FRONTEND_URL = "http://localhost:3000"; // ✅ Ensure correct frontend URL
const BACKEND_URL = "http://localhost:5000"; // ✅ Backend API for saving names

export default function Dashboard() {
  const [uploads, setUploads] = useState([]);
  const [error, setError] = useState("");
  // Instead of separate states, we store the entire upload being edited.
  const [editingUpload, setEditingUpload] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/uploads")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUploads(data);
        } else {
          console.error("Unexpected API response:", data);
          console.log("Fetched data:", data);

          setError("Unexpected response format.");
        }
      })
      .catch((err) => {
        console.error("Error fetching uploads:", err);
        setError("Failed to fetch uploads.");
      });
  }, [router]);

  // Save updated name using the name from editingUpload.
  const updateName = async (uploadId) => {
    if (!editingUpload || !editingUpload.name.trim()) return; // Prevent empty names
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/elements/${uploadId}`, { // ✅ Corrected route
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Include auth token
        },
        body: JSON.stringify({ name: editingUpload.name }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setUploads((prev) =>
          prev.map((upload) =>
            upload._id === uploadId ? { ...upload, name: editingUpload.name } : upload
          )
        );
        setEditingUpload(null); // Close input field after saving
      } else {
        console.error("Error updating name:", result.error);
      }
    } catch (err) {
      console.error("Failed to update name:", err);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  console.log("Uploads array:", uploads);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      {/* Navigation */}
      <nav
        style={{
          padding: "10px",
          textAlign: "center",
          backgroundColor: "#f0f0f0",
          borderBottom: "1px solid #ddd",
          marginBottom: "20px",
        }}
      >
        <Link href="/" legacyBehavior>
          <a style={{ marginRight: "20px", textDecoration: "none", color: "#0070f3" }}>
            Return Home
          </a>
        </Link>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Logout
        </button>
      </nav>

      <h1 style={{ textAlign: "center" }}>Uploaded Models</h1>

      {/* Upload Button */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Link href="/upload" legacyBehavior>
          <a
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "#fff",
              borderRadius: "5px",
              textDecoration: "none",
            }}
          >
            Upload New Model
          </a>
        </Link>
      </div>

      {/* Error Message */}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Display Uploaded Models */}
      {uploads.length === 0 ? (
        <p style={{ textAlign: "center" }}>No uploads yet.</p>
        
      ) : (
        uploads.map((upload) => (
          <div
            key={upload._id}
            style={{
              marginBottom: "20px",
              textAlign: "center",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <p>
              <strong>AR View:</strong>{" "}
              <a
                href={`${FRONTEND_URL}/view/${upload.url.split("/").pop()}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in AR
              </a>
            </p>
            <img
              src={upload.qrCodeUrl}
              alt="QR Code"
              style={{ maxWidth: "200px", display: "block", margin: "10px auto" }}
            />

            {/* Name Field (Editable for only ONE element at a time) */}
            <div style={{ marginTop: "10px" }}>
              {editingUpload && editingUpload._id === upload._id ? (
                <>
                  <input
                    type="text"
                    value={editingUpload.name}
                    onChange={(e) =>
                      setEditingUpload({ ...editingUpload, name: e.target.value })
                    }
                    placeholder="Enter name"
                    style={{ padding: "5px", marginRight: "5px" }}
                  />
                  <button
                    onClick={() => updateName(upload._id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#0070f3",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingUpload(null)}
                    style={{
                      padding: "5px 10px",
                      marginLeft: "5px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <p>
                    <strong>Name:</strong> {upload.name || "NA"}
                  </p>
                  <button
                    onClick={() => setEditingUpload({ ...upload })}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#ffc107",
                      color: "#000",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Rename
                  </button>
                </>
              )}
            </div>

            {/* Edit Button */}
            <Link
              href={`${FRONTEND_URL}/edit/${upload.url.split("/").pop()}`}
              legacyBehavior
            >
              <a
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#ffc107",
                  color: "#000",
                  borderRadius: "5px",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Edit Model
              </a>
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
