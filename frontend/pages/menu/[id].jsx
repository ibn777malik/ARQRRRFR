// frontend/pages/menu/[id].jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    console.log("Menu ID from URL:", id);
    
    // Fetch menu data
    const fetchMenu = async () => {
      try {
        setLoading(true);
        
        // Use the frontend API route that connects to backend
        const response = await fetch(`/api/public/menu/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch menu: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Menu data received:", data);
        
        setMenu(data);
        
        // Set the background image if available
        if (data.theme?.backgroundImage) {
          setBackgroundImage(data.theme.backgroundImage);
        }
        
        // Set initial category if categories exist
        if (data.categories && data.categories.length > 0) {
          setSelectedCategory(data.categories[0]);
        }
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
      loader.load(
        modelURL, 
        (gltf) => {
          setModel(gltf.scene);
        },
        undefined,
        (error) => {
          console.error("Error loading model:", error);
        }
      );
    }
  }, [modelURL]);

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    
    // Check for button items with modelId in value
    if (item.type === 'button' && item.buttonType === 'model' && item.value) {
      try {
        console.log("Loading model ID:", item.value);
        
        // Fetch the model information using the frontend API route
        const response = await fetch(`/api/public/model/${item.value}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch model: ${response.status}`);
        }
        
        const modelData = await response.json();
        console.log("Model data:", modelData);
        
        setSelectedItemModel(modelData);
        setModelURL(modelData.fileUrl);
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
  const renderMenuItem = (item) => {
    switch (item.type) {
      case 'text':
        return (
          <div 
            className="text-item"
            onClick={() => handleItemClick(item)}
            style={{
              fontSize: item.style?.fontSize || "16px",
              color: item.style?.color || menu.theme?.textColor || "#333333",
              fontWeight: item.style?.fontWeight || "normal",
              textAlign: item.style?.textAlign || "left",
              backgroundColor: item.style?.backgroundColor === 'transparent' 
                ? 'transparent' 
                : (item.style?.backgroundColor || 'transparent'),
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "15px",
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {item.content || "Text content"}
          </div>
        );
      
      case 'button':
        return (
          <div 
            className="button-item"
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
                padding: "8px 16px",
                border: "none",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              {item.label || "Button"}
              {item.buttonType === 'model' && (
                <span style={{ 
                  marginLeft: "8px", 
                  backgroundColor: "rgba(255,255,255,0.3)", 
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
      
      case 'image':
        if (!item.src) return null;
        return (
          <div 
            className="image-item"
            style={{
              textAlign: "center",
              marginBottom: "15px",
            }}
          >
            <img 
              src={item.src} 
              alt={item.alt || item.name || "Menu image"} 
              style={{
                width: `${item.width || 300}px`,
                height: `${item.height || 'auto'}px`,
                maxWidth: "100%",
                objectFit: "contain",
                margin: "0 auto",
                borderRadius: "4px",
              }}
              onClick={() => {
                if (item.clickBehavior === 'enlarge') {
                  // Handle image enlargement logic
                  console.log("Enlarge image");
                } else if (item.clickBehavior === 'link' && item.linkUrl) {
                  window.open(item.linkUrl, '_blank');
                }
              }}
            />
          </div>
        );
      
      case 'video':
        if (!item.src) return null;
        return (
          <div 
            className="video-item"
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
                width: `${item.width || 300}px`,
                height: `${item.height || 'auto'}px`,
                maxWidth: "100%",
                margin: "0 auto",
                borderRadius: "4px",
              }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh", 
      width: "100%", 
      backgroundColor: "#f5f5f5"
    }}>
      <div style={{
        width: "50px",
        height: "50px",
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #0070f3",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "20px"
      }}></div>
      <p>Loading menu...</p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
  
  if (error) return (
    <div style={{
      maxWidth: "600px",
      margin: "50px auto",
      padding: "30px",
      textAlign: "center",
      backgroundColor: "#fff5f5",
      borderRadius: "8px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ color: "#e53e3e", marginBottom: "15px" }}>Error Loading Menu</h2>
      <p style={{ marginBottom: "20px" }}>{error}</p>
      <button 
        onClick={() => router.back()}
        style={{
          background: "#0070f3",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "500"
        }}
      >
        Go Back
      </button>
    </div>
  );
  
  if (!menu) return null;

  return (
    <div style={{
      backgroundColor: menu.theme?.secondaryColor || "#f5f5f5",
      color: menu.theme?.textColor || "#333333",
      fontFamily: menu.theme?.fontFamily || "Arial, sans-serif",
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Overlay for background image */}
      {backgroundImage && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 0,
        }} />
      )}
      
      {/* Main Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "20px" 
      }}>
        {/* Header */}
        <div style={{ 
          padding: "30px 20px", 
          textAlign: "center",
          marginBottom: "30px"
        }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "bold",
            color: menu.theme?.primaryColor || "#0070f3",
            marginBottom: "10px",
          }}>
            {menu.restaurant}
          </h1>
          <h2 style={{ 
            fontSize: "1.5rem",
            opacity: 0.9,
            color: backgroundImage ? '#ffffff' : (menu.theme?.textColor || "#333333"),
          }}>
            {menu.name}
          </h2>
        </div>
        
        {/* Category Navigation */}
        {menu.categories && menu.categories.length > 0 && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "30px",
          }}>
            {menu.categories.map((category) => (
              <button 
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "8px 16px",
                  background: category === selectedCategory 
                    ? (menu.theme?.primaryColor || "#0070f3") 
                    : "rgba(255,255,255,0.9)",
                  color: category === selectedCategory 
                    ? "#ffffff" 
                    : (menu.theme?.textColor || "#333333"),
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: category === selectedCategory ? "500" : "normal",
                  transition: "all 0.2s ease",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        {/* Content Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: model ? "1fr 1fr" : "1fr",
          gap: "30px",
        }}>
          {/* Menu Items */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            {/* Filter items by category if a category is selected */}
            {menu.items && menu.items.length > 0 ? (
              <div>
                {menu.items
                  .filter(item => !selectedCategory || item.category === selectedCategory)
                  .map((item, index) => (
                    <div key={index}>
                      {item.name && item.type !== 'button' && (
                        <h3 style={{ 
                          marginBottom: "10px", 
                          color: menu.theme?.primaryColor || "#0070f3",
                          fontWeight: "600",
                          fontSize: "1.2rem",
                          borderBottom: `2px solid ${menu.theme?.primaryColor || "#0070f3"}`,
                          paddingBottom: "5px",
                        }}>
                          {item.name}
                        </h3>
                      )}
                      {renderMenuItem(item)}
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "30px" }}>
                <p>No items found in this menu.</p>
              </div>
            )}
          </div>
          
          {/* 3D Model Viewer */}
          {model && (
            <div style={{
              backgroundColor: 'white',
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              position: "sticky",
              top: "20px",
              alignSelf: "start",
            }}>
              <h3 style={{ 
                marginBottom: "15px", 
                color: menu.theme?.primaryColor || "#0070f3",
                fontWeight: "600",
              }}>
                3D View: {selectedItem?.name || "Item"}
              </h3>
              
              <div style={{
                height: "300px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "15px",
              }}>
                <Canvas camera={{ position: [0, 1, 3] }}>
                  <ambientLight intensity={1} />
                  <directionalLight position={[1, 1, 1]} intensity={1} />
                  <OrbitControls />
                  {model && <primitive object={model} dispose={null} />}
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
                  fontWeight: "600",
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
            </div>
          )}
        </div>
      </div>
      
      {/* Styles */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        html, body {
          height: 100%;
          width: 100%;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .text-item:hover, .button-item:hover, .image-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}