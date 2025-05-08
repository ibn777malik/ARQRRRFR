import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Info, ShoppingCart, RotateCcw, Maximize, 
  Image, Share, PanelLeftClose, PanelLeftOpen
} from "lucide-react";

// Constants
const BACKEND_URL = "http://localhost:5000";

export default function EnhancedARViewer() {
  const router = useRouter();
  const { id, menuId } = router.query;
  
  // Refs
  const modelRef = useRef();
  const containerRef = useRef();
  
  // States
  const [modelData, setModelData] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [arSupported, setARSupported] = useState(false);
  const [arMode, setARMode] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  
  // Check for AR support
  useEffect(() => {
    const checkARSupport = async () => {
      if (typeof navigator !== 'undefined' && navigator.xr) {
        try {
          const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
          setARSupported(isSupported);
        } catch (error) {
          console.log("AR not supported:", error);
          setARSupported(false);
        }
      } else {
        setARSupported(false);
      }
    };
    
    checkARSupport();
  }, []);
  
  // Fetch model and menu item data
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch model data
        const modelResponse = await axios.get(`${BACKEND_URL}/api/models/${id}`);
        setModelData(modelResponse.data);
        
        // Log the view interaction
        logInteraction("ar_view", id);
        
        // If menuId is provided, fetch menu item data
        if (menuId) {
          try {
            const menuItemResponse = await axios.get(`${BACKEND_URL}/api/menu-items/${menuId}`);
            setMenuItem(menuItemResponse.data);
          } catch (error) {
            console.error("Error fetching menu item:", error);
          }
        }
        
      } catch (error) {
        console.error("Error fetching model data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, menuId]);
  
  // Load 3D model
  useEffect(() => {
    if (!modelData || !modelData.fileUrl) return;
    
    const loader = new GLTFLoader();
    loader.load(
      modelData.fileUrl,
      (gltf) => {
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDim;
        
        gltf.scene.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale
        );
        gltf.scene.scale.multiplyScalar(scale);
        
        // Traverse the scene and optimize materials
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            // Create sharper shadows
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Improve material appearance
            if (child.material) {
              child.material.envMapIntensity = 1.5;
              
              // Enable outline effect for meshes (optional)
              // child.material.emissive = new THREE.Color(0x000000);
              // child.material.wireframe = false;
            }
          }
        });
        
        setModel(gltf.scene);
      },
      (xhr) => {
        // Loading progress
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }, [modelData]);
  
  // Rotate model automatically
  useEffect(() => {
    if (!isRotating || !modelRef.current) return;
    
    let animationId;
    const animate = () => {
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.005;
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isRotating, model]);
  
  // Log interactions with the AR viewer
  const logInteraction = async (type, modelId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/analytics/interactions`, {
        interactionType: type,
        modelId: modelId || id,
        menuItemId: menuId || null,
        metadata: {
          device: navigator.userAgent,
          arSupported
        }
      });
    } catch (error) {
      console.error("Error logging interaction:", error);
    }
  };
  
  // Handle enter AR mode
  const enterARMode = async () => {
    if (!arSupported) {
      alert("AR is not supported on your device");
      return;
    }
    
    setARMode(true);
    logInteraction("enter_ar_mode", id);
    
    // Here you'd typically initialize your AR session using WebXR
    // For now, we'll just toggle a state to simulate
    setTimeout(() => {
      setShowInfo(false);
    }, 3000);
  };
  
  // Add to cart
  const addToCart = () => {
    if (!menuItem) return;
    
    const itemInCart = cart.find(item => item.id === menuItem._id);
    
    if (itemInCart) {
      setCart(cart.map(item => 
        item.id === menuItem._id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, {
        id: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
    
    setShowCart(true);
    logInteraction("add_to_cart", id);
  };
  
  // Create a share link
  const shareModel = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: menuItem?.name || modelData?.name || "3D Model",
          text: "Check out this 3D model in AR!",
          url: window.location.href
        });
        logInteraction("share", id);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };
  
  // Reset camera view
  const resetCamera = () => {
    if (containerRef.current) {
      // This is a simplified reset - in a real implementation
      // you'd get a reference to the OrbitControls instance
      // and call its reset() method
      const orbitControls = containerRef.current.querySelector('canvas')?.controls;
      if (orbitControls) {
        orbitControls.reset();
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading AR Experience...</p>
      </div>
    );
  }
  
  if (!modelData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h2 className="text-2xl mb-4">Model Not Found</h2>
        <p className="mb-6">Sorry, we couldn't find the 3D model you're looking for.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="inline mr-2" size={18} />
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-900" ref={containerRef}>
      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [0, 0, 2], fov: 50 }}
        shadows
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'radial-gradient(circle, #1a2030 0%, #0a0a0a 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <spotLight 
          position={[5, 10, 5]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1} 
          castShadow 
        />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        
        {/* Environment map for realistic reflections */}
        <Environment preset="apartment" />
        
        {/* Controls */}
        {!arMode && (
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={10}
            enablePan={false}
            autoRotate={isRotating}
            autoRotateSpeed={1}
          />
        )}
        
        {/* 3D Model */}
        {model && (
          <group ref={modelRef}>
            <primitive object={model} dispose={null} />
            {/* Add a transparent floor */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -0.5, 0]} 
              receiveShadow
            >
              <planeGeometry args={[10, 10]} />
              <shadowMaterial transparent opacity={0.2} />
            </mesh>
          </group>
        )}
        
        {/* AR Mode UI Elements */}
        {arMode && (
          <Html center>
            <div className="text-white bg-black bg-opacity-50 p-3 rounded">
              <p>Move your device to place the model</p>
            </div>
          </Html>
        )}
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-auto">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all ${
                isRotating ? "text-blue-400" : "text-white"
              }`}
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={resetCamera}
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all"
            >
              <Maximize size={20} />
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 bg-gray-800 bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all ${
                showInfo ? "text-blue-400" : "text-white"
              }`}
            >
              <Info size={20} />
            </button>
          </div>
        </div>
        
        {/* Info Panel */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-0 right-0 mx-auto max-w-md bg-gray-900 bg-opacity-90 p-4 rounded-lg text-white pointer-events-auto"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <h2 className="text-xl font-bold mb-1">
              {menuItem?.name || modelData.name || "3D Model"}
            </h2>
            {menuItem?.description && (
              <p className="text-gray-300 mb-3">{menuItem.description}</p>
            )}
            {menuItem?.price && (
              <p className="text-xl font-bold text-green-400 mb-3">
                ${menuItem.price.toFixed(2)}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {arSupported && (
                <button
                  onClick={enterARMode}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors"
                >
                  <Image size={18} className="mr-2" />
                  View in AR
                </button>
              )}
              {menuItem && (
                <button
                  onClick={addToCart}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 transition-colors"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Order
                </button>
              )}
              <button
                onClick={shareModel}
                className="flex items-center justify-center px-4 py-2 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors"
              >
                <Share size={18} className="mr-2" />
                Share
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-auto">
          {arSupported && !arMode && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={enterARMode}
              className="px-6 py-3 bg-blue-600 rounded-lg text-white flex items-center hover:bg-blue-700 transition-colors"
            >
              <Image size={20} className="mr-2" />
              View in Augmented Reality
            </motion.button>
          )}
        </div>
        
        {/* Shopping Cart Overlay */}
        <div 
          className={`absolute top-0 right-0 h-full max-w-md w-full bg-gray-900 bg-opacity-95 transition-transform duration-300 pointer-events-auto ${
            showCart ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ backdropFilter: 'blur(10px)' }}
        >
          <div className="flex flex-col h-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Your Order</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700"
              >
                <PanelLeftClose size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-6">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 flex justify-between">
                      <div>
                        <h4 className="text-white">{item.name}</h4>
                        <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        <button 
                          className="text-red-400 text-sm"
                          onClick={() => {
                            setCart(cart.filter((_, i) => i !== index));
                            logInteraction("remove_from_cart", id);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="mt-4">
                <div className="border-t border-gray-700 pt-4 mb-4">
                  <div className="flex justify-between text-gray-300 mb-2">
                    <span>Subtotal</span>
                    <span>
                      ${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white font-bold">
                    <span>Total</span>
                    <span>
                      ${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                  onClick={() => {
                    alert("Order placed successfully!");
                    setCart([]);
                    setShowCart(false);
                    logInteraction("checkout", id);
                  }}
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Cart Toggle Button */}
        {cart.length > 0 && !showCart && (
          <button
            onClick={() => setShowCart(true)}
            className="absolute top-4 right-4 p-3 bg-green-600 rounded-full text-white hover:bg-green-700 transition-colors pointer-events-auto"
          >
            <ShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </button>
        )}
      </div>
      
      {/* AR Mode Interface (simulated) */}
      {arMode && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col">
          <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
            <button
              onClick={() => setARMode(false)}
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="text-white bg-gray-800 bg-opacity-70 px-4 py-2 rounded-full">
              Move your device to place model
            </div>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="p-4 pointer-events-auto">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-4 rounded-lg text-white">
              <h3 className="font-bold">AR Instructions</h3>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Move your device to scan the environment</li>
                <li>• Tap on a surface to place the model</li>
                <li>• Pinch to resize the model</li>
                <li>• Use two fingers to rotate</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}