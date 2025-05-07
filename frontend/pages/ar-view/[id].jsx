import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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

  useEffect(() => {
    // Check if AR is supported
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then(supported => {
        setARSupported(supported);
      });
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    
    const fetchModelAndMenuItem = async () => {
      try {
        // Fetch model information
        const modelResponse = await fetch(`/api/public/model/${id}`);
        if (!modelResponse.ok) throw new Error('Failed to fetch model');
        const modelData = await modelResponse.json();
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
          
          // Log the interaction
          logInteraction('ar_view');
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('Error loading model:', error);
        }
      );
    }
  }, [modelURL, id]);

  const logInteraction = (interactionType) => {
    if (!id) return;
    
    fetch('/api/analytics/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelId: id,
        menuItemId: menuItem?._id,
        interactionType,
      }),
    }).catch(err => console.error("Failed to log interaction:", err));
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading AR experience...</p>
      </div>
    );
  }

  if (!modelURL) {
    return (
      <div style={styles.errorContainer}>
        <h2>Model Not Found</h2>
        <p>The requested 3D model could not be found.</p>
        <button 
          onClick={() => router.back()} 
          style={styles.backButton}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Menu item info overlay */}
      {menuItem && (
        <div style={styles.menuItemOverlay}>
          <h3>{menuItem.name}</h3>
          <p>{menuItem.description}</p>
          <p style={styles.price}>${menuItem.price?.toFixed(2)}</p>
        </div>
      )}
      
      {/* AR Experience */}
      <div style={styles.canvasContainer}>
        {arSupported && (
          <div style={styles.arButtonContainer}>
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
              <OrbitControls />
              {model && <primitive object={model} />}
            </>
          )}
        </Canvas>
      </div>
      
      {/* Navigation controls */}
      <div style={styles.controls}>
        <button
          onClick={() => router.back()}
          style={styles.backButton}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#f7f7f7"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw"
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #0070f3",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    padding: "20px",
    textAlign: "center"
  },
  menuItemOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "15px",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    zIndex: 10,
    textAlign: "center"
  },
  price: {
    fontWeight: "bold",
    color: "#4caf50"
  },
  canvasContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  },
  arButtonContainer: {
    position: "absolute",
    bottom: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100
  },
  controls: {
    position: "absolute",
    bottom: "20px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    zIndex: 100
  },
  backButton: {
    padding: "12px 24px",
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};