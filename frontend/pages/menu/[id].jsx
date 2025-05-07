import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function MenuView() {
  const router = useRouter();
  const { id } = router.query;
  const [menu, setMenu] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modelURL, setModelURL] = useState(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // Fetch menu data
    const fetchMenu = async () => {
      try {
        const response = await fetch(`/api/public/menu/${id}`);
        const data = await response.json();
        setMenu(data);
        setSelectedCategory(data.categories[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching menu:", error);
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
    
    if (item.modelId) {
      try {
        // Fetch the model information
        const response = await fetch(`/api/public/model/${item.modelId}`);
        const modelData = await response.json();
        setModelURL(modelData.fileUrl);
      } catch (error) {
        console.error("Error fetching model:", error);
      }
    } else {
      setModelURL(null);
      setModel(null);
    }
  };

  if (loading) return <div>Loading menu...</div>;
  if (!menu) return <div>Menu not found</div>;

  return (
    <div className="menu-container">
      <header>
        <h1>{menu.restaurant}</h1>
        <h2>{menu.name}</h2>
      </header>
      
      {/* Category tabs */}
      <div className="categories">
        {menu.categories.map(category => (
          <button 
            key={category}
            className={category === selectedCategory ? "active" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="menu-content">
        {/* Menu items */}
        <div className="menu-items">
          {menu.items
            .filter(item => item.category === selectedCategory)
            .map(item => (
              <div 
                key={item._id} 
                className={`menu-item ${selectedItem?._id === item._id ? 'selected' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                {item.image && <img src={item.image} alt={item.name} />}
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="price">${item.price.toFixed(2)}</span>
                  {item.modelId && <span className="ar-badge">AR Available</span>}
                </div>
              </div>
            ))}
        </div>
        
        {/* 3D Model Viewer */}
        {selectedItem && modelURL && (
          <div className="model-viewer">
            <h3>3D View: {selectedItem.name}</h3>
            <div className="canvas-container">
              <Canvas camera={{ position: [0, 1, 3] }}>
                <ambientLight intensity={1} />
                <directionalLight position={[1, 1, 1]} intensity={1} />
                <OrbitControls />
                {model ? <primitive object={model} dispose={null} /> : <p>Loading Model...</p>}
              </Canvas>
            </div>
            <button 
              onClick={() => window.location.href = `/ar-view/${selectedItem.modelId}`}
              className="view-ar-button"
            >
              View in AR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}