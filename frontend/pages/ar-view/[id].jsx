import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import axios from "axios";

// Define a dummy class for "P" as a subclass of THREE.Object3D
class P extends THREE.Object3D {}
// Register it so that R3F can instantiate nodes of type "P"
extend({ P });

export default function ARViewer() {
  const router = useRouter();
  const { id, menuId } = router.query;
  const [model, setModel] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelData, setModelData] = useState(null);

  // Load model and optional menu information
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        let modelFileUrl;
        
        if (id.endsWith('.glb')) {
          modelFileUrl = `/uploads/${id}`;
          console.log("Loading model directly from:", modelFileUrl);
        } else {
          console.log("Fetching model data for ID:", id);
          try {
            const response = await axios.get(`/api/model/${id}`);
            
            if (response.data) {
              console.log("Model data retrieved:", response.data);
              setModelData(response.data);
              modelFileUrl = response.data.fileUrl || response.data.url;
              
              if (!modelFileUrl) {
                throw new Error("No model URL found in response");
              }
              console.log("Using model URL from response:", modelFileUrl);
            }
          } catch (error) {
            console.error("Error fetching model details:", error);
            setError("Failed to load model details. Please check the URL or try again.");
            setLoading(false);
            return;
          }
        }
        
        if (menuId) {
          try {
            const menuItemResponse = await axios.get(`/api/public/menu-item-by-model/${id}`);
            if (menuItemResponse.data && menuItemResponse.data.item) {
              setMenuItem(menuItemResponse.data.item);
            }
          } catch (menuErr) {
            console.log("No menu item found or error:", menuErr);
          }
        }
        
        loadModel(modelFileUrl);
      } catch (err) {
        console.error("Error in data fetching:", err);
        setError("Failed to load the 3D model. Please check the URL or try again.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, menuId]);

  const loadModel = (modelUrl) => {
    console.log("Loading 3D model from URL:", modelUrl);
    const loader = new GLTFLoader();
    
    loader.load(
      modelUrl,
      (gltf) => {
        console.log("Model loaded successfully");
        const loadedModel = gltf.scene;
        
        loadedModel.traverse((child) => {
          if (child.type === "P" || (child.constructor && child.constructor.name === "P")) {
            if (child.parent) {
              child.parent.remove(child);
            }
          }
        });
        
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
        setLoading(false);
        
        logViewInteraction();
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading model:', error);
        setError("Failed to load 3D model. The file may be corrupted or in an unsupported format.");
        setLoading(false);
      }
    );
  };

  const logViewInteraction = async () => {
    try {
      if (!id) return;
      
      await axios.post('/api/analytics/interactions', {
        modelId: id,
        menuId: menuId || null,
        interactionType: 'ar_view'
      });
      
      console.log(`Logged AR view for model ${id}`);
    } catch (error) {
      console.error("Failed to log view interaction:", error);
    }
  };

  // Handle back button click - navigate to previous page
  const handleBackClick = () => {
    router.back();
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        height: "100vh",
        background: "#1a1a2e",
        color: "white"
      }}>
        <div style={{
          width: "50px", 
          height: "50px", 
          border: "4px solid rgba(255, 255, 255, 0.2)",
          borderTop: "4px solid white",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px"
        }}></div>
        <p>Loading AR experience...</p>
        
        <style jsx>{`
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
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        height: "100vh",
        padding: "20px",
        textAlign: "center",
        background: "#1a1a2e",
        color: "white"
      }}>
        <h2 style={{ marginBottom: "20px", color: "#ff4500" }}>Error Loading Model</h2>
        <p style={{ marginBottom: "30px" }}>{error}</p>
        <button
          onClick={handleBackClick}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white", 
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Navigation Bar */}
      <nav
        style={{
          padding: "10px",
          textAlign: "center",
          background: "#1a1a2e",
          borderBottom: "1px solid #2d2d42",
          position: "fixed",
          width: "100%",
          top: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <button
          onClick={handleBackClick}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center"
          }}
        >
          ← Back to Menu
        </button>
        
        <div style={{ color: "white" }}>
          {menuItem ? (
            <span style={{ fontWeight: "bold" }}>{menuItem.name || "3D Model View"}</span>
          ) : (
            <span>{modelData?.name || "AR Model Viewer"}</span>
          )}
        </div>
        
        <div style={{ width: "100px" }}></div>
      </nav>

      <div style={{ width: "100vw", height: "100vh", background: "#1a1a2e" }}>
        <Canvas
          camera={{ position: [0, 1, 3], fov: 50 }}
          style={{ background: "#1a1a2e" }}
        >
          <ambientLight intensity={0.8} />
          <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <directionalLight position={[1, 1, 1]} intensity={0.8} />
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            rotateSpeed={0.5}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
          {model && <primitive object={model} dispose={null} />}
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </Canvas>
      </div>
      
      {menuItem && (
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          right: "20px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "15px",
          borderRadius: "10px",
          zIndex: 100
        }}>
          <h2 style={{ fontSize: "22px", marginBottom: "5px" }}>{menuItem.name}</h2>
          {menuItem.description && (
            <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>{menuItem.description}</p>
          )}
        </div>
      )}
    </div>
  );
}