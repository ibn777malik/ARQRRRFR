// frontend/pages/menu/[id].jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import axios from "axios";

export default function MenuView() {
  const router = useRouter();
  const { id } = router.query;
  const [menu, setMenu] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modelURL, setModelURL] = useState(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItemModel, setSelectedItemModel] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    console.log("Menu ID from URL:", id);
    
    // Fetch menu data directly from the backend
    const fetchMenu = async () => {
      try {
        setLoading(true);
        
        // Connect directly to the backend
        const backendUrl = "http://localhost:5000";
        const response = await axios.get(`${backendUrl}/api/menus/public/${id}`);
        
        console.log("Menu data received:", response.data);
        
        setMenu(response.data);
        setSelectedCategory(response.data.categories && response.data.categories.length > 0 
          ? response.data.categories[0] 
          : null);
      } catch (error) {
        console.error("Error processing menu data:", error);
        setError(error.message || "Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenu();
  }, [id]);

  useEffect(() => {
    if (modelURL) {
      const loader = new GLTFLoader();
      loader.load(modelURL, (gltf) => {
        setModel(gltf.scene);
      });
    }
  }, [modelURL]);

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    
    // Check for button items with modelId in value
    if (item.type === 'button' && item.buttonType === 'model' && item.value) {
      try {
        console.log("Loading model ID:", item.value);
        
        // Fetch the model information directly from the backend
        const backendUrl = "http://localhost:5000";
        const response = await axios.get(`${backendUrl}/api/uploads/${item.value}`);
        
        console.log("Model data:", response.data);
        setSelectedItemModel(response.data);
        setModelURL(response.data.url || response.data.fileUrl);
      } catch (error) {
        console.error("Error fetching model:", error);
      }
    } else {
      setModelURL(null);
      setModel(null);
      setSelectedItemModel(null);
    }
  };

  // Function to render a menu item based on its type
  const renderMenuItem = (item, index) => {
    if (item.type === 'text') {
      return (
        <div 
          key={index}
          className="menu-item text-item"
          onClick={() => handleItemClick(item)}
          style={{
            fontSize: item.style?.fontSize || "16px",
            color: item.style?.color || menu.theme?.textColor || "#333",
            fontWeight: item.style?.fontWeight || "normal",
            textAlign: item.style?.textAlign || "left",
            backgroundColor: item.style?.backgroundColor || "transparent",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "15px",
            cursor: "pointer",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          <div className="item-content">
            <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>{item.name}</h3>
            <div>{item.content}</div>
          </div>
        </div>
      );
    } else if (item.type === 'button') {
      return (
        <div 
          key={index}
          className="menu-item button-item"
          style={{
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          <button 
            onClick={() => handleItemClick(item)}
            style={{
              backgroundColor: item.style?.backgroundColor || menu.theme?.primaryColor || "#0070f3",
              color: item.style?.textColor || "#FFFFFF",
              borderRadius: item.style?.borderRadius || "4px",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {item.label || "View"}
            {item.buttonType === 'model' && (
              <span style={{ 
                marginLeft: "8px", 
                backgroundColor: "#ff4500", 
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.7rem"
              }}>
                AR
              </span>
            )}
          </button>
        </div>
      );
    } else if (item.type === 'image' && item.src) {
      return (
        <div 
          key={index}
          className="menu-item image-item"
          onClick={() => handleItemClick(item)}
          style={{
            textAlign: "center",
            marginBottom: "15px",
            cursor: "pointer",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          <img 
            src={item.src} 
            alt={item.alt || item.name || "Menu image"} 
            style={{
              maxWidth: "100%",
              width: `${item.width || 300}px`,
              height: `${item.height || 'auto'}px`,
              borderRadius: "8px",
              margin: "0 auto",
            }}
          />
          {item.name && (
            <h3 style={{ 
              marginTop: "10px", 
              fontSize: "1.2rem",
              color: menu.theme?.textColor || "#333"
            }}>
              {item.name}
            </h3>
          )}
        </div>
      );
    } else if (item.type === 'video' && item.src) {
      return (
        <div 
          key={index}
          className="menu-item video-item"
          style={{
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          <video 
            src={item.src}
            controls={item.controls !== false}
            autoPlay={item.autoplay || false}
            muted={item.autoplay || false}
            style={{
              maxWidth: "100%",
              width: `${item.width || 300}px`,
              height: `${item.height || 'auto'}px`,
              borderRadius: "8px",
              margin: "0 auto",
            }}
          />
          {item.name && (
            <h3 style={{ 
              marginTop: "10px", 
              fontSize: "1.2rem",
              color: menu.theme?.textColor || "#333"
            }}>
              {item.name}
            </h3>
          )}
        </div>
      );
    } else {
      // Default item rendering for other types or missing data
      return (
        <div
          key={index}
          className="menu-item"
          onClick={() => handleItemClick(item)}
          style={{
            border: "1px solid #eee",
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "15px",
            cursor: "pointer",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          <h3 style={{ 
            marginBottom: "5px", 
            fontSize: "1.2rem",
            color: menu.theme?.textColor || "#333"
          }}>
            {item.name || "Untitled Item"}
          </h3>
          <div style={{ color: "#666" }}>
            {item.description || item.content || "No description available"}
          </div>
        </div>
      );
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading menu...</p>
      
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          padding: 50px;
          text-align: center;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0070f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <h2>Error Loading Menu</h2>
      <p>{error}</p>
      <button onClick={() => router.push("/dashboard")}>
        Return to Dashboard
      </button>
      
      <style jsx>{`
        .error-container {
          max-width: 600px;
          margin: 50px auto;
          padding: 30px;
          text-align: center;
          background: #fff5f5;
          border-radius: 8px;
          border-left: 4px solid #f56565;
        }
        h2 {
          color: #e53e3e;
          margin-bottom: 15px;
        }
        p {
          margin-bottom: 20px;
        }
        button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
  
  if (!menu) return <div className="p-8 text-center">Menu not found</div>;

  return (
    <div className="menu-container" style={{
      backgroundColor: menu.theme?.secondaryColor || "#f5f5f5",
      color: menu.theme?.textColor || "#333333",
      fontFamily: menu.theme?.fontFamily || "Arial, sans-serif",
      backgroundImage: menu.theme?.backgroundImage ? `url(${menu.theme.backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Overlay if background image exists */}
      {menu.theme?.backgroundImage && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 0,
        }} />
      )}
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <header style={{ 
          textAlign: "center", 
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: menu.theme?.backgroundImage ? 'rgba(0,0,0,0.7)' : 'transparent',
          borderRadius: '10px'
        }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            marginBottom: "10px",
            color: menu.theme?.primaryColor || "#0070f3"
          }}>
            {menu.restaurant}
          </h1>
          <h2 style={{ 
            fontSize: "1.5rem",
            color: menu.theme?.backgroundImage ? 'white' : (menu.theme?.textColor || "#666")
          }}>
            {menu.name}
          </h2>
        </header>
        
        {/* Category tabs */}
        {menu.categories && menu.categories.length > 0 && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "30px",
            justifyContent: "center",
          }}>
            {menu.categories.map(category => (
              <button 
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "8px 16px",
                  background: category === selectedCategory 
                    ? (menu.theme?.primaryColor || "#0070f3") 
                    : "#f5f5f5",
                  color: category === selectedCategory ? "white" : "#333",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        {/* Main content grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: model ? "1fr 1fr" : "1fr",
          gap: "30px",
        }}>
          {/* Menu items section */}
          <div style={{ 
            backgroundColor: menu.theme?.backgroundImage ? 'rgba(255,255,255,0.9)' : 'white',
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            {/* Item list */}
            {menu.items && menu.items.length > 0 ? (
              menu.items
                .filter(item => !selectedCategory || item.category === selectedCategory)
                .map((item, index) => renderMenuItem(item, index))
            ) : (
              <div style={{
                textAlign: "center",
                padding: "30px",
                color: "#666",
              }}>
                No menu items available
              </div>
            )}
          </div>
          
          {/* 3D Model Viewer (only shown when a model is selected) */}
          {model && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              height: "fit-content",
              position: "sticky",
              top: "20px",
            }}>
              <h3 style={{ 
                marginBottom: "15px", 
                color: menu.theme?.primaryColor || "#0070f3",
                fontSize: "1.3rem",
                fontWeight: "bold",
              }}>
                3D Preview: {selectedItem?.name || "Model"}
              </h3>
              
              <div style={{
                height: "300px",
                borderRadius: "8px",
                overflow: "hidden",
                background: "#f5f5f5",
                marginBottom: "15px",
              }}>
                <Canvas camera={{ position: [0, 1, 3] }}>
                  <ambientLight intensity={1} />
                  <directionalLight position={[1, 1, 1]} intensity={1} />
                  <OrbitControls />
                  {model ? <primitive object={model} dispose={null} /> : <p>Loading Model...</p>}
                </Canvas>
              </div>
              
              <button 
                onClick={() => {
                  const modelId = selectedItemModel?._id || selectedItem?.value;
                  if (modelId) {
                    window.open(`/ar-view/${modelId}`, '_blank');
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#ff4500",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ marginRight: "8px" }}>View in AR</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 18h.01M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
                  <path d="M12 6v8" />
                </svg>
              </button>
              
              {selectedItemModel && (
                <div style={{
                  marginTop: "15px",
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}>
                  <p style={{ margin: "0 0 5px 0", fontWeight: "500" }}>Model Information:</p>
                  <p style={{ margin: "0", color: "#666" }}>
                    Name: {selectedItemModel.name || "Unnamed Model"}
                  </p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>
                    Type: {selectedItemModel.type || "3D Model"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .menu-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}