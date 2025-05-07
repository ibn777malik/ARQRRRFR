import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { extend } from "@react-three/fiber";

export default function ARViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (!id) return;
    const loader = new GLTFLoader();

    loader.load(`/uploads/${id}`, (gltf) => {
      // Traverse the loaded scene and remove any node with type or constructor name "P"
      gltf.scene.traverse((child) => {
        if (child.type === "P" || (child.constructor && child.constructor.name === "P")) {
          if (child.parent) {
            child.parent.remove(child);
          }
        }
      });
      setModel(gltf.scene);
    });
  }, [id]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* ✅ Navigation Bar */}
      <nav
        style={{
          padding: "10px",
          textAlign: "center",
          background: "#f0f0f0",
          borderBottom: "1px solid #ddd",
          position: "fixed",
          width: "100%",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          🔙 Back to Dashboard
        </button>
      </nav>

      {/* ✅ 3D Model Viewer */}
      <div style={{ width: "100vw", height: "calc(100vh - 50px)", marginTop: "50px" }}>
        <Canvas camera={{ position: [0, 1, 3] }}>
          <ambientLight intensity={1} />
          <directionalLight position={[1, 1, 1]} intensity={1} />
          <OrbitControls />
          {model ? <primitive object={model} dispose={null} /> : <p>Loading Model...</p>}
        </Canvas>
      </div>
    </div>
  );
}

// Define a dummy class for "P" as a subclass of THREE.Object3D
class P extends THREE.Object3D {}
// Register it so that R3F can instantiate nodes of type "P"
extend({ P });
