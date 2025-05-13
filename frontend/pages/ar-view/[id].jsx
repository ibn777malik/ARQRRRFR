// frontend/pages/ar-view/[id].jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Dynamic import for AR components to avoid SSR issues
const ARButton = dynamic(
  () => import('@react-three/xr').then((mod) => mod.ARButton),
  { ssr: false }
);

const XR = dynamic(
  () => import('@react-three/xr').then((mod) => mod.XR),
  { ssr: false }
);

export default function ARViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [modelURL, setModelURL] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState(null);
  const [arSupported, setARSupported] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if AR is supported
    if (typeof navigator !== 'undefined' && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then(supported => {
          setARSupported(supported);
        })
        .catch(err => {
          console.log("Error checking AR support:", err);
          setARSupported(false);
        });
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    
    const fetchModelAndMenuItem = async () => {
      try {
        // Fetch model information
        const modelResponse = await fetch(`/api/public/model/${id}`);
        
        if (!modelResponse.ok) {
          throw new Error(`Failed to load model: ${modelResponse.status}`);
        }
        
        const modelData = await modelResponse.json();
        console.log("Model data:", modelData);
        
        setModelURL(modelData.fileUrl);
        
        // Try to fetch the related menu item if available
        try {
          const menuItemResponse = await fetch(`/api/public/menu-item-by-model/${id}`);
          if (menuItemResponse.ok) {
            const menuItemData = await menuItemResponse.json();
            setMenuItem(menuItemData);
          }
        } catch (err) {
          console.log("No menu item found for this model");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load model");
        setLoading(false);
      }
    };
    
    fetchModelAndMenuItem();
  }, [id]);

  useEffect(() => {
    if (modelURL) {
      const loader = new GLTFLoader();
      loader.load(
        modelURL,
        (gltf) => {
          // Center and scale the model appropriately
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1 / maxDim;
          
          gltf.scene.position.x = -center.x * scale;
          gltf.scene.position.y = -center.y * scale;
          gltf.scene.position.z = -center.z * scale;
          gltf.scene.scale.multiplyScalar(scale);
          
          setModel(gltf.scene);
          
          // Log the interaction - could be connected to your analytics
          logInteraction('ar_view');
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

  const logInteraction = (interactionType) => {
    // This would connect to your analytics backend
    console.log(`Logged interaction: ${interactionType} for model ${id}`);
    // You could implement a real API call here
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
        <button onClick={() => router.back()}>
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
        <button onClick={() => router.back()}>
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
      
      {/* AR Experience */}
      <div className="canvas-container">
        {arSupported && (
          <div className="ar-button-container">
            <ARButton />
          </div>
        )}
        
        <Canvas camera={{ position: [0, 0, 2], fov: 60 }}>
          {arSupported ? (
            <XR>
              <ambientLight intensity={0.8} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
              {model && <primitive object={model} />}
            </XR>
          ) : (
            <>
              <ambientLight intensity={0.8} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
              <Environment preset="apartment" />
              <OrbitControls />
              {model && <primitive object={model} />}
            </>
          )}
        </Canvas>
      </div>
      
      {/* Navigation controls */}
      <div className="controls">
        <button
          onClick={() => router.back()}
          className="back-button"
        >
          Back to Menu
        </button>
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
        
        .ar-button-container {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
        }
        
        .controls {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
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
        }
      `}</style>
    </div>
  );
}