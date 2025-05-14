// Enhanced AR View page without XR dependency (temporary version)
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import axios from "axios";

export default function ARViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [modelURL, setModelURL] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const BACKEND_URL = "http://localhost:5000";

  // Debug log
  useEffect(() => {
    if (id) {
      console.log("AR View: Model ID parameter:", id);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    
    const fetchModelData = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching model data for ID:", id);
        
        // First, try to determine if this is a direct file path or an object ID
        let modelFileUrl;
        if (id.endsWith('.glb')) {
          // If it's a GLB file, construct the URL directly
          modelFileUrl = `/uploads/${id}`;
          console.log("Direct GLB file detected, setting URL to:", modelFileUrl);
          setModelURL(modelFileUrl);
        } else {
          // Otherwise, treat as an object ID and fetch from backend
          try {
            console.log("Fetching model info from backend for ID:", id);
            const response = await axios.get(`${BACKEND_URL}/api/uploads/${id}`);
            
            if (response.data) {
              console.log("Model data retrieved:", response.data);
              
              // Set the model URL from the response
              modelFileUrl = response.data.fileUrl || response.data.url;
              if (modelFileUrl) {
                setModelURL(modelFileUrl);
                console.log("Setting model URL to:", modelFileUrl);
              } else {
                throw new Error("Model URL not found in response");
              }
            } else {
              throw new Error("No model data returned from server");
            }
          } catch (modelError) {
            console.error("Error fetching model:", modelError);
            setError("Could not find the 3D model. Please check the model ID.");
            setLoading(false);
            return;
          }
        }
        
        // Try to get the menu item if it exists
        try {
          console.log("Attempting to find menu item for model:", id);
          const menuItemResponse = await axios.get(`/api/public/menu-item-by-model/${id}`);
          if (menuItemResponse.data) {
            console.log("Menu item data:", menuItemResponse.data);
            setMenuItem(menuItemResponse.data.item);
            setMenuId(menuItemResponse.data.menuId);
          }
        } catch (menuError) {
          console.log("No menu item found for this model, or error:", menuError);
          // Not a critical error - we can still show the model
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error in fetchModelData:", error);
        setError(error.message || "Failed to load model data");
        setLoading(false);
      }
    };
    
    fetchModelData();
  }, [id, BACKEND_URL]);

  useEffect(() => {
    if (modelURL) {
      console.log("Loading 3D model from URL:", modelURL);
      const loader = new GLTFLoader();
      loader.load(
        modelURL,
        (gltf) => {
          console.log("Model loaded successfully");
          // Process the loaded model
          const loadedModel = gltf.scene;
          
          // Center and scale the model appropriately
          const box = new THREE.Box3().setFromObject(loadedModel);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1 / maxDim;
          
          loadedModel.position.x = -center.x * scale;
          loadedModel.position.y = -center.y * scale;
          loadedModel.position.z = -center.z * scale;
          loadedModel.scale.multiplyScalar(scale);
          
          setModel(loadedModel);
          
          // Log the interaction
          console.log(`Logged interaction: ar_view for model ${id}`);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('Error loading model:', error);
          setError("Failed to load 3D model. Please try again.");
        }
      );
    }
  }, [modelURL, id]);

  // Handle returning to menu or previous page
  const handleBackClick = () => {
    if (menuId) {
      // If we know which menu this came from, go back to it
      router.push(`/menu/${menuId}`);
    } else {
      // Otherwise just go back to the previous page
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading AR experience...</p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100%;
            background-color: #1a1a2e;
            color: white;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.2);
            border-top: 4px solid white;
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
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Model</h2>
        <p>{error}</p>
        <button onClick={handleBackClick}>
          Go Back
        </button>
        
        <style jsx>{`
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            padding: 20px;
            text-align: center;
            background-color: #1a1a2e;
            color: white;
          }
          h2 {
            margin-bottom: 20px;
            color: #ff4500;
          }
          p {
            margin-bottom: 30px;
          }
          button {
            padding: 10px 20px;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  if (!modelURL) {
    return (
      <div className="error-container">
        <h2>Model Not Found</h2>
        <p>The requested 3D model could not be found.</p>
        <button onClick={handleBackClick}>
          Go Back
        </button>
        
        <style jsx>{`
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            padding: 20px;
            text-align: center;
            background-color: #1a1a2e;
            color: white;
          }
          h2 {
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 30px;
          }
          button {
            padding: 10px 20px;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="ar-container">
      {/* Menu item info overlay */}
      {menuItem && (
        <div className="menu-item-overlay">
          <h3>{menuItem.name}</h3>
          {menuItem.description && <p className="description">{menuItem.description}</p>}
          {menuItem.price && (
            <p className="price">${menuItem.price.toFixed(2)}</p>
          )}
        </div>
      )}
      
      {/* 3D Viewer (non-AR version) */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 2], fov: 60 }}>
          <ambientLight intensity={0.8} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <Environment preset="apartment" />
          <OrbitControls />
          {model && <primitive object={model} />}
        </Canvas>
      </div>
      
      {/* Navigation controls */}
      <div className="controls">
        <button
          onClick={handleBackClick}
          className="back-button"
        >
          Back to Menu
        </button>
        
        <div className="ar-note">
          <p>Note: Full AR experience requires installation of @react-three/xr package.</p>
        </div>
      </div>
      
      <style jsx>{`
        .ar-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background-color: #1a1a2e;
        }
        
        .menu-item-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 15px;
          background: rgba(0,0,0,0.7);
          color: white;
          z-index: 10;
          text-align: center;
        }
        
        .menu-item-overlay h3 {
          margin: 0 0 5px 0;
          font-size: 20px;
        }
        
        .description {
          margin: 5px 0;
          font-size: 14px;
          opacity: 0.8;
        }
        
        .price {
          margin: 5px 0 0 0;
          font-weight: bold;
          color: #4caf50;
          font-size: 18px;
        }
        
        .canvas-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .controls {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 100;
        }
        
        .back-button {
          padding: 12px 24px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin-bottom: 15px;
        }
        
        .ar-note {
          background: rgba(0,0,0,0.5);
          color: white;
          padding: 8px 12px;
          border-radius: 5px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}