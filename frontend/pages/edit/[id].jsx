import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import * as THREE from "three";
import Link from "next/link";

const BACKEND_URL = "http://localhost:5000"; // Your backend API

export default function EditModel() {
  const router = useRouter();
  const { id } = router.query;
  const groupRef = useRef(new THREE.Group());
  const [transformMode, setTransformMode] = useState("translate");
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [renamingElementId, setRenamingElementId] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [newButton, setNewButton] = useState({
    name: "",
    type: "link",
    value: "",
    file: null,
  });

  // Load the main model when the component mounts.
  useEffect(() => {
    if (!id) return;
    const loader = new GLTFLoader();
    loader.load(
      `/uploads/${id}`,
      (gltf) => {
        const mainModel = gltf.scene.clone();
        mainModel.name = "Layer 1 (Main Model)";
        groupRef.current.add(mainModel);
        setElements([{ id: "layer-1", name: mainModel.name, object: mainModel }]);
        setSelectedElement(mainModel);
      },
      undefined,
      (error) => {
        console.error("Error loading main model:", error);
      }
    );
  }, [id]);

  // Save the current scene as a GLB file.
  const saveGLB = async () => {
    if (!groupRef.current) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      groupRef.current,
      (glb) => {
        const formData = new FormData();
        formData.append("file", new Blob([glb], { type: "application/octet-stream" }), id);

        fetch(`${BACKEND_URL}/api/save-glb`, {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then(() => alert("GLB saved successfully!"))
          .catch((err) => console.error("Error saving GLB:", err));
      },
      { binary: true }
    );
  };

  // Helper function: If the backend response does not include a URL,
  // use a blob URL created from the file.
  const getFileUrl = (resultObj, file) => {
    if (resultObj && (resultObj.fileUrl || resultObj.url)) {
      return resultObj.fileUrl || resultObj.url;
    }
    // Fallback to a blob URL if the backend didn’t return a URL.
    const blobUrl = URL.createObjectURL(file);
    console.warn("Using blob URL fallback:", blobUrl);
    return blobUrl;
  };

  // Handle file uploads for GLB, image, and ZIP.
  const handleFileUpload = async () => {
    if (!newButton.file) return alert("Please upload a file!");

    const formData = new FormData();
    formData.append("file", newButton.file);

    try {
      let result;
      const elementId = `layer-${elements.length + 1}`;

      if (newButton.type === "glb") {
        const response = await fetch(`${BACKEND_URL}/api/upload-file`, {
          method: "POST",
          body: formData,
        });
        result = await response.json();
        console.log("GLB upload result:", result);
        const fileUrl = getFileUrl(result, newButton.file);
        console.log("GLB fileUrl:", fileUrl);

        const loader = new GLTFLoader();
        loader.load(
          fileUrl,
          (gltf) => {
            const newModel = gltf.scene.clone();
            newModel.name = `Layer ${elements.length + 1} (GLB)`;
            newModel.position.set(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
            groupRef.current.add(newModel);
            setElements((prev) => [
              ...prev,
              { id: elementId, name: newModel.name, object: newModel },
            ]);
            setSelectedElement(newModel);
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF file:", error);
            alert("Error loading GLTF file. Check console for details.");
          }
        );
      } else if (newButton.type === "image") {
        const response = await fetch(`${BACKEND_URL}/api/upload-file`, {
          method: "POST",
          body: formData,
        });
        result = await response.json();
        console.log("Image upload result:", result);
        const fileUrl = getFileUrl(result, newButton.file);
        console.log("Image fileUrl:", fileUrl);

        new THREE.TextureLoader().load(
          fileUrl,
          (texture) => {
            const plane = new THREE.Mesh(
              new THREE.PlaneGeometry(1, 1),
              new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
            );
            plane.position.set(Math.random() * 2 - 1, 1, Math.random() * 2 - 1);
            plane.name = `Layer ${elements.length + 1} (Image)`;
            groupRef.current.add(plane);
            setElements((prev) => [
              ...prev,
              { id: elementId, name: plane.name, object: plane },
            ]);
            setSelectedElement(plane);
          },
          undefined,
          (error) => {
            console.error("Error loading image texture:", error);
            alert("Error loading image texture. Check console for details.");
          }
        );
      } else if (newButton.type === "zip") {
        const response = await fetch(`${BACKEND_URL}/api/extract-zip`, {
          method: "POST",
          body: formData,
        });
        result = await response.json();
        console.log("ZIP extraction result:", result);
        const fileUrl = getFileUrl(result, newButton.file);
        console.log("ZIP fileUrl:", fileUrl);

        alert("ZIP extracted and files loaded!");

        const loader = new GLTFLoader();
        loader.load(
          fileUrl,
          (gltf) => {
            const newModel = gltf.scene.clone();
            newModel.name = `Layer ${elements.length + 1} (Extracted ZIP)`;
            newModel.position.set(0, 0, 0);
            newModel.scale.set(1, 1, 1);
            groupRef.current.add(newModel);
            setElements((prev) => [
              ...prev,
              { id: elementId, name: newModel.name, object: newModel },
            ]);
            setSelectedElement(newModel);
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF from ZIP:", error);
            alert("Error loading GLTF from ZIP. Check console for details.");
          }
        );
      }

      // Reset the newButton state after upload.
      setNewButton({ name: "", type: "link", value: "", file: null });
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Failed to upload file");
    }
  };
  const saveElementName = async (elementId) => {
    try {
      await fetch(`${BACKEND_URL}/api/update-element-name`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ elementId, name: nameInput }),
      });
  
      setElements((prev) =>
        prev.map((el) => (el.id === elementId ? { ...el, name: nameInput } : el))
      );
      setRenamingElementId(null);
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };
  
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "300px",
          background: "#f8f9fa",
          padding: "20px",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2>Model Editor</h2>
        <p>
          <strong>Editing:</strong> {id}
        </p>

        <label>Transform Mode:</label>
        <select
          value={transformMode}
          onChange={(e) => setTransformMode(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        >
          <option value="translate">Move</option>
          <option value="rotate">Rotate</option>
          <option value="scale">Scale</option>
        </select>

        <button
          onClick={saveGLB}
          style={{
            width: "100%",
            padding: "10px",
            background: "#28a745",
            color: "#fff",
            marginBottom: "10px",
          }}
        >
          Save Changes
        </button>

        <h3>Layers</h3>
        <ul style={{ padding: 0, listStyle: "none" }}>
  {elements.map((element) => (
    <li
      key={element.id}
      onClick={() => {
        setSelectedElement(element.object);
        setRenamingElementId(null);
      }}
      style={{
        padding: "10px",
        background: selectedElement === element.object ? "#ddd" : "#fff",
        cursor: "pointer",
        marginBottom: "5px",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    >
      {renamingElementId === element.id ? (
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onBlur={() => saveElementName(element.id)}
          onKeyDown={(e) => e.key === "Enter" && saveElementName(element.id)}
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={() => {
            setRenamingElementId(element.id);
            setNameInput(element.name);
          }}
        >
          {element.name}
        </span>
      )}
    </li>
  ))}
</ul>


        <h3>Add Interactive Button</h3>
        <input
          type="text"
          placeholder="Button Name"
          value={newButton.name}
          onChange={(e) => setNewButton({ ...newButton, name: e.target.value })}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <select
          value={newButton.type}
          onChange={(e) => setNewButton({ ...newButton, type: e.target.value })}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        >
          <option value="link">Link</option>
          <option value="glb">GLB File</option>
          <option value="image">Image</option>
          <option value="zip">ZIP File</option>
        </select>

        <input
          type="file"
          accept=".glb,.zip,image/*"
          onChange={(e) => setNewButton({ ...newButton, file: e.target.files[0] })}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <button
          onClick={handleFileUpload}
          style={{
            width: "100%",
            padding: "10px",
            background: "#0070f3",
            color: "#fff",
            marginBottom: "10px",
          }}
        >
          Add Button
        </button>

        <Link href="/dashboard">
          <button
            style={{
              width: "100%",
              padding: "10px",
              background: "#0070f3",
              color: "#fff",
            }}
          >
            Back to Dashboard
          </button>
        </Link>
      </div>

      {/* 3D Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas camera={{ position: [0, 1, 3] }}>
          <ambientLight intensity={1} />
          <directionalLight position={[1, 1, 1]} intensity={1} />
          <OrbitControls />
          <primitive object={groupRef.current} />
          <TransformControls object={selectedElement} mode={transformMode} />
        </Canvas>
      </div>
    </div>
  );
}
