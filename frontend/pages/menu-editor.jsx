
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  Upload, ImagePlus, Cube, Link as LinkIcon, Video, Save, 
  ArrowLeft, Plus, Trash2, Type, Layout
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function EnhancedMenuEditor() {
  const router = useRouter();
  const { id } = router.query; // For editing existing menus
  const fileInputRef = useRef(null);
  
  // Menu state
  const [menu, setMenu] = useState({
    name: "Our Menu",
    restaurant: "My Restaurant",
    items: [],
    theme: {
      primaryColor: "#0070f3",
      secondaryColor: "#f5f5f5",
      textColor: "#333333",
      fontFamily: "Arial, sans-serif",
      backgroundImage: null
    }
  });
  
  // UI state
  const [models, setModels] = useState([]);
  const [activeTab, setActiveTab] = useState("items"); // tabs: items, design, preview
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [savedMenuId, setSavedMenuId] = useState(null);
  
  // Fetch existing menu if editing
  useEffect(() => {
    if (id) {
      const fetchMenu = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${BACKEND_URL}/api/menus/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMenu(response.data);
          
          // If menu has a background image, set it
          if (response.data.theme?.backgroundImage) {
            setBackgroundImage(response.data.theme.backgroundImage);
          }
          
        } catch (error) {
          console.error("Error fetching menu:", error);
          setErrorMessage("Failed to load the menu. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchMenu();
    }
  }, [id]);
  
  // Fetch available 3D models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BACKEND_URL}/api/elements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setModels(response.data || []);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    
    fetchModels();
  }, []);
  
  // Add new menu item
  const addMenuItem = (type) => {
    let newItem;
    
    switch (type) {
      case 'button':
        newItem = {
          type: 'button',
          name: "New Button",
          buttonType: "model", // Default button type: 'model', 'url', 'image', 'video'
          label: "View in AR",
          value: null, // URL, modelId, etc.
          style: {
            backgroundColor: menu.theme.primaryColor,
            textColor: "#FFFFFF",
            borderRadius: "4px",
          }
        };
        break;
      case 'image':
        newItem = {
          type: 'image',
          name: "Image Item",
          src: null,
          alt: "Menu image",
          width: 300,
          height: 200
        };
        break;
      case 'video':
        newItem = {
          type: 'video',
          name: "Video Item",
          src: null,
          width: 300,
          height: 200,
          autoplay: false,
          controls: true
        };
        break;
      case 'text':
      default:
        newItem = {
          type: 'text',
          name: "Text Area",
          content: "Enter your text here...",
          style: {
            fontSize: "16px",
            color: menu.theme.textColor,
            fontWeight: "normal",
            textAlign: "left",
            backgroundColor: "transparent"
          }
        };
        break;
    }
    
    setMenu({
      ...menu,
      items: [...menu.items, newItem]
    });
  };
  
  // Update menu item
  const updateMenuItem = (index, field, value) => {
    const updatedItems = [...menu.items];
    
    if (field.includes('.')) {
      // Handle nested properties like 'style.color'
      const [parentField, childField] = field.split('.');
      updatedItems[index][parentField] = {
        ...updatedItems[index][parentField],
        [childField]: value
      };
    } else {
      updatedItems[index][field] = value;
    }
    
    setMenu({ ...menu, items: updatedItems });
  };
  
  // Delete menu item
  const deleteMenuItem = (index) => {
    const updatedItems = [...menu.items];
    updatedItems.splice(index, 1);
    setMenu({ ...menu, items: updatedItems });
  };
  
  // Update theme colors
  const updateTheme = (field, value) => {
    setMenu({
      ...menu,
      theme: {
        ...menu.theme,
        [field]: value
      }
    });
  };
  
  // Handle image upload for menu items
  const handleItemImageUpload = async (itemIndex, type) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === 'video' ? "video/*" : "image/*";
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${BACKEND_URL}/api/uploads`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        });
        
        const fileUrl = response.data.fileUrl;
        if (type === 'video') {
          updateMenuItem(itemIndex, "src", fileUrl);
        } else {
          updateMenuItem(itemIndex, "src", fileUrl);
        }
        
      } catch (error) {
        console.error("Error uploading file:", error);
        setErrorMessage("Failed to upload file. Please try again.");
      }
    };
    
    input.click();
  };
  
  // Handle background image upload
  const handleBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BACKEND_URL}/api/uploads`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      
      const imageUrl = response.data.fileUrl;
      setBackgroundImage(imageUrl);
      updateTheme("backgroundImage", imageUrl);
      
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage("Failed to upload background image.");
    }
  };
  
  // Save menu
  const saveMenu = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      const token = localStorage.getItem("token");
      const endpoint = id 
        ? `${BACKEND_URL}/api/menus/${id}` 
        : `${BACKEND_URL}/api/menus`;
      
      const method = id ? "PUT" : "POST";
      
      const response = await axios({
        method,
        url: endpoint,
        data: menu,
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      setSuccessMessage("Menu saved successfully!");
      setSavedMenuId(response.data._id);
      
      // If this is a new menu, redirect to edit with the new ID
      if (!id && response.data._id) {
        setTimeout(() => {
          router.push(`/menu-editor?id=${response.data._id}`);
        }, 1000);
      }
      
    } catch (error) {
      console.error("Error saving menu:", error);
      setErrorMessage("Failed to save menu. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Generate QR code for the menu
  const generateQRCode = async () => {
    if (!id && !savedMenuId) {
      setErrorMessage("Please save the menu first to generate a QR code.");
      return;
    }
    
    const menuId = id || savedMenuId;
    setShowQRGenerator(true);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold">
              {id ? "Edit Menu" : "Create New Menu"}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={saveMenu}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </span>
              ) : (
                <>
                  <Save size={18} className="mr-1" />
                  Save Menu
                </>
              )}
            </button>
            
            <button
              onClick={generateQRCode}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              <span>Generate QR Code</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {errorMessage}
        </div>
      )}
      
      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`px-4 py-3 font-medium ${
                activeTab === "items"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("items")}
            >
              Menu Items
            </button>
            <button
              className={`px-4 py-3 font-medium ${
                activeTab === "design"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("design")}
            >
              Design & Theme
            </button>
            <button
              className={`px-4 py-3 font-medium ${
                activeTab === "preview"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
          </div>
          
          {/* Basic Menu Info */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Name
                </label>
                <input
                  type="text"
                  value={menu.name}
                  onChange={(e) => setMenu({ ...menu, name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Menu Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={menu.restaurant}
                  onChange={(e) => setMenu({ ...menu, restaurant: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Restaurant Name"
                />
              </div>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Menu Items Tab */}
            {activeTab === "items" && (
              <div>
                {/* Add Items Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Menu Items</h3>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => addMenuItem('button')}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 flex items-center text-sm"
                      >
                        <Plus size={16} className="mr-1" /> Button
                      </button>
                      <button
                        onClick={() => addMenuItem('image')}
                        className="px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200 flex items-center text-sm"
                      >
                        <ImagePlus size={16} className="mr-1" /> Image
                      </button>
                      <button
                        onClick={() => addMenuItem('video')}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 flex items-center text-sm"
                      >
                        <Video size={16} className="mr-1" /> Video
                      </button>
                      <button
                        onClick={() => addMenuItem('text')}
                        className="px-3 py-1 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 flex items-center text-sm"
                      >
                        <Type size={16} className="mr-1" /> Text
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Item List */}
                <div className="space-y-6">
                  {menu.items.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                      <p className="text-gray-500">
                        No items yet. Add your first item using the buttons above.
                      </p>
                    </div>
                  ) : (
                    menu.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg overflow-hidden bg-white"
                      >
                        {/* Item Header */}
                        <div className="bg-gray-50 p-4 flex justify-between items-center">
                          <h4 className="font-medium">
                            {item.name || "Untitled Item"} 
                            <span className="ml-2 text-xs text-gray-500">({item.type})</span>
                          </h4>
                          <button
                            onClick={() => deleteMenuItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        {/* Item Content - Different based on type */}
                        <div className="p-4">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Item Name/Label
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateMenuItem(index, "name", e.target.value)}
                              className="w-full p-2 border rounded-md"
                              placeholder="Item Name"
                            />
                          </div>
                          
                          {/* Button Type Item */}
                          {item.type === 'button' && (
                            <>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Button Type
                                  </label>
                                  <select
                                    value={item.buttonType}
                                    onChange={(e) => updateMenuItem(index, "buttonType", e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    <option value="model">AR Model</option>
                                    <option value="url">URL Link</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Button Label
                                  </label>
                                  <input
                                    type="text"
                                    value={item.label}
                                    onChange={(e) => updateMenuItem(index, "label", e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Button Label"
                                  />
                                </div>
                              </div>
                              
                              {/* Button Value based on type */}
                              {item.buttonType === 'model' && (
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    3D Model
                                  </label>
                                  <select
                                    value={item.value || ""}
                                    onChange={(e) => updateMenuItem(index, "value", e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    <option value="">Select a model</option>
                                    {models.map((model) => (
                                      <option key={model._id} value={model._id}>
                                        {model.name || `Model ${model._id}`}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              
                              {item.buttonType === 'url' && (
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL
                                  </label>
                                  <input
                                    type="url"
                                    value={item.value || ""}
                                    onChange={(e) => updateMenuItem(index, "value", e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="https://"
                                  />
                                </div>
                              )}
                              
                              {(item.buttonType === 'image' || item.buttonType === 'video') && (
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {item.buttonType === 'image' ? 'Image URL' : 'Video URL'}
                                  </label>
                                  <div className="flex">
                                    <input
                                      type="url"
                                      value={item.value || ""}
                                      onChange={(e) => updateMenuItem(index, "value", e.target.value)}
                                      className="flex-grow p-2 border rounded-l-md"
                                      placeholder={item.buttonType === 'image' ? 'Image URL' : 'Video URL'}
                                    />
                                    <button
                                      onClick={() => handleItemImageUpload(index, item.buttonType)}
                                      className="p-2 bg-gray-200 border border-l-0 rounded-r-md"
                                    >
                                      Upload
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {/* Button Styling */}
                              <div className="mt-4">
                                <h5 className="font-medium text-sm mb-2">Button Style</h5>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Background Color
                                    </label>
                                    <input
                                      type="color"
                                      value={item.style?.backgroundColor || menu.theme.primaryColor}
                                      onChange={(e) => updateMenuItem(index, "style.backgroundColor", e.target.value)}
                                      className="w-full p-0 h-8"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Text Color
                                    </label>
                                    <input
                                      type="color"
                                      value={item.style?.textColor || "#FFFFFF"}
                                      onChange={(e) => updateMenuItem(index, "style.textColor", e.target.value)}
                                      className="w-full p-0 h-8"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Border Radius
                                    </label>
                                    <select
                                      value={item.style?.borderRadius || "4px"}
                                      onChange={(e) => updateMenuItem(index, "style.borderRadius", e.target.value)}
                                      className="w-full p-2 border rounded-md text-sm"
                                    >
                                      <option value="0">None</option>
                                      <option value="4px">Small</option>
                                      <option value="8px">Medium</option>
                                      <option value="9999px">Rounded</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Button Preview */}
                              <div className="mt-4 p-4 bg-gray-50 rounded-md text-center">
                                <p className="text-sm text-gray-500 mb-2">Button Preview</p>
                                <button
                                  style={{
                                    backgroundColor: item.style?.backgroundColor || menu.theme.primaryColor,
                                    color: item.style?.textColor || "#FFFFFF",
                                    borderRadius: item.style?.borderRadius || "4px",
                                    padding: "8px 16px",
                                    border: "none",
                                  }}
                                >
                                  {item.label || "Button"}
                                </button>
                              </div>
                            </>
                          )}
                          
                          {/* Image Type Item */}
                          {item.type === 'image' && (
                            <>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Image
                                </label>
                                {item.src ? (
                                  <div className="relative mb-2">
                                    <img
                                      src={item.src}
                                      alt={item.alt || "Menu image"}
                                      className="w-full max-h-48 object-contain border rounded-md"
                                    />
                                    <button
                                      onClick={() => updateMenuItem(index, "src", null)}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                      style={{ width: '24px', height: '24px' }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    className="w-full h-48 border rounded-md flex items-center justify-center bg-gray-100 mb-2"
                                  >
                                    <p className="text-gray-400">No image selected</p>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleItemImageUpload(index, 'image')}
                                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded flex items-center text-sm"
                                >
                                  <ImagePlus size={16} className="mr-1" />
                                  {item.src ? "Change Image" : "Upload Image"}
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alt Text
                                  </label>
                                  <input
                                    type="text"
                                    value={item.alt || ""}
                                    onChange={(e) => updateMenuItem(index, "alt", e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Image description"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Click Behavior
                                  </label>
                                  <select
                                    value={item.clickBehavior || "none"}
                                    onChange={(e) => updateMenuItem(index, "clickBehavior", e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    <option value="none">No action</option>
                                    <option value="enlarge">Enlarge</option>
                                    <option value="link">Open link</option>
                                  </select>
                                </div>
                              </div>
                              
                              {item.clickBehavior === 'link' && (
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link URL
                                  </label>
                                  <input
                                    type="url"
                                    value={item.linkUrl || ""}
                                    onChange={(e) => updateMenuItem(index, "linkUrl", e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="https://"
                                  />
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Width (px)
                                  </label>
                                  <input
                                    type="number"
                                    value={item.width || 300}
                                    onChange={(e) => updateMenuItem(index, "width", parseInt(e.target.value))}
                                    className="w-full p-2 border rounded-md"
                                    min="50"
                                    max="1200"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Height (px)
                                  </label>
                                  <input
                                    type="number"
                                    value={item.height || 200}
                                    onChange={(e) => updateMenuItem(index, "height", parseInt(e.target.value))}
                                    className="w-full p-2 border rounded-md"
                                    min="50"
                                    max="1200"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                          
                          {/* Video Type Item */}
                          {item.type === 'video' && (
                            <>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Video
                                </label>
                                {item.src ? (
                                  <div className="relative mb-2">
                                    <video
                                      src={item.src}
                                      controls={true}
                                      className="w-full max-h-48 object-contain border rounded-md"
                                    />
                                    <button
                                      onClick={() => updateMenuItem(index, "src", null)}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                      style={{ width: '24px', height: '24px' }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    className="w-full h-48 border rounded-md flex items-center justify-center bg-gray-100 mb-2"
                                  >
                                    <p className="text-gray-400">No video selected</p>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleItemImageUpload(index, 'video')}
                                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded flex items-center text-sm"
                                >
                                  <Video size={16} className="mr-1" />
                                  {item.src ? "Change Video" : "Upload Video"}
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Width (px)
                                  </label>
                                  <input
                                    type="number"
                                    value={item.width || 300}
                                    onChange={(e) => updateMenuItem(index, "width", parseInt(e.target.value))}
                                    className="w-full p-2 border rounded-md"
                                    min="50"
                                    max="1200"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Height (px)
                                  </label>
                                  <input
                                    type="number"
                                    value={item.height || 200}
                                    onChange={(e) => updateMenuItem(index, "height", parseInt(e.target.value))}
                                    className="w-full p-2 border rounded-md"
                                    min="50"
                                    max="1200"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="flex items-center text-sm font-medium text-gray-700">
                                    <input
                                      type="checkbox"
                                      checked={item.controls || true}
                                      onChange={(e) => updateMenuItem(index, "controls", e.target.checked)}
                                      className="mr-2"
                                    />
                                    Show Controls
                                  </label>
                                </div>
                                <div>
                                  <label className="flex items-center text-sm font-medium text-gray-700">
                                    <input
                                      type="checkbox"
                                      checked={item.autoplay || false}
                                      onChange={(e) => updateMenuItem(index, "autoplay", e.target.checked)}
                                      className="mr-2"
                                    />
                                    Autoplay (muted)
                                  </label>
                                </div>
                              </div>
                            </>
                          )}
                          
                          {/* Text Area Type Item */}
                          {item.type === 'text' && (
                            <>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Text Content
                                </label>
                                <textarea
                                  value={item.content || ""}
                                  onChange={(e) => updateMenuItem(index, "content", e.target.value)}
                                  className="w-full p-2 border rounded-md h-24"
                                  placeholder="Enter your text here..."
                                ></textarea>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Font Size
                                  </label>
                                  <select
                                    value={item.style?.fontSize || "16px"}
                                    onChange={(e) => updateMenuItem(index, "style.fontSize", e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    <option value="12px">Small</option>
                                    <option value="16px">Medium</option>
                                    <option value="20px">Large</option>
                                    <option value="24px">X-Large</option>
                                    <option value="32px">XX-Large</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Text Color
                                  </label>
                                  <input
                                    type="color"
                                    value={item.style?.color || menu.theme.textColor}
                                    onChange={(e) => updateMenuItem(index, "style.color", e.target.value)}
                                    className="w-full p-0 h-8"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Text Align
                                  </label>
                                  <select
                                    value={item.style?.textAlign || "left"}
                                    onChange={(e) => updateMenuItem(index, "style.textAlign", e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Font Weight
                                  </label>
                                  <select
                                    value={item.style?.fontWeight || "normal"}
                                    onChange={(e) => updateMenuItem(index, "style.fontWeight", e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    <option value="normal">Normal</option>
                                    <option value="bold">Bold</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Background Color
                                  </label>
                                  <input
                                    type="color"
                                    value={item.style?.backgroundColor || "transparent"}
                                    onChange={(e) => updateMenuItem(index, "style.backgroundColor", e.target.value)}
                                    className="w-full p-0 h-8"
                                  />
                                </div>
                              </div>
                              
                              {/* Text Preview */}
                              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-500 mb-2">Text Preview</p>
                                <div
                                  style={{
                                    fontSize: item.style?.fontSize || "16px",
                                    color: item.style?.color || menu.theme.textColor,
                                    fontWeight: item.style?.fontWeight || "normal",
                                    textAlign: item.style?.textAlign || "left",
                                    backgroundColor: item.style?.backgroundColor || "transparent",
                                    padding: "10px",
                                    borderRadius: "4px"
                                  }}
                                >
                                  {item.content || "Text content appears here..."}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* Design & Theme Tab */}
            {activeTab === "design" && (
              <div>
                <h3 className="text-lg font-medium mb-4">Menu Appearance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Colors</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Primary Color
                        </label>
                        <div className="flex items-center">
                          <input
                            type="color"
                            value={menu.theme.primaryColor}
                            onChange={(e) =>
                              updateTheme("primaryColor", e.target.value)
                            }
                            className="w-10 h-10 rounded p-0 border-0 mr-2"
                          />
                          <input
                            type="text"
                            value={menu.theme.primaryColor}
                            onChange={(e) =>
                              updateTheme("primaryColor", e.target.value)
                            }
                            className="w-32 p-2 border rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Secondary Color
                        </label>
                        <div className="flex items-center">
                          <input
                            type="color"
                            value={menu.theme.secondaryColor}
                            onChange={(e) =>
                              updateTheme("secondaryColor", e.target.value)
                            }
                            className="w-10 h-10 rounded p-0 border-0 mr-2"
                          />
                          <input
                            type="text"
                            value={menu.theme.secondaryColor}
                            onChange={(e) =>
                              updateTheme("secondaryColor", e.target.value)
                            }
                            className="w-32 p-2 border rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Text Color
                        </label>
                        <div className="flex items-center">
                          <input
                            type="color"
                            value={menu.theme.textColor}
                            onChange={(e) =>
                              updateTheme("textColor", e.target.value)
                            }
                            className="w-10 h-10 rounded p-0 border-0 mr-2"
                          />
                          <input
                            type="text"
                            value={menu.theme.textColor}
                            onChange={(e) =>
                              updateTheme("textColor", e.target.value)
                            }
                            className="w-32 p-2 border rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mb-3 mt-6">Typography</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Font Family
                      </label>
                      <select
                        value={menu.theme.fontFamily}
                        onChange={(e) =>
                          updateTheme("fontFamily", e.target.value)
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="Arial, sans-serif">Arial (Sans-serif)</option>
                        <option value="Helvetica, sans-serif">Helvetica (Sans-serif)</option>
                        <option value="Georgia, serif">Georgia (Serif)</option>
                        <option value="'Times New Roman', serif">Times New Roman (Serif)</option>
                        <option value="'Courier New', monospace">Courier New (Monospace)</option>
                        <option value="'Trebuchet MS', sans-serif">Trebuchet MS (Sans-serif)</option>
                        <option value="Verdana, sans-serif">Verdana (Sans-serif)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Background</h4>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Image
                      </label>
                      
                      <div className="border rounded-lg p-4">
                        {backgroundImage ? (
                          <div className="relative mb-3">
                            <img
                              src={backgroundImage}
                              alt="Background"
                              className="w-full h-40 object-cover rounded-md"
                            />
                            <button
                              onClick={() => {
                                setBackgroundImage(null);
                                updateTheme("backgroundImage", null);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                              style={{ width: '24px', height: '24px' }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md mb-3">
                            <p className="text-gray-500">No background image</p>
                          </div>
                        )}
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2 bg-gray-100 text-gray-700 rounded flex items-center justify-center text-sm hover:bg-gray-200"
                        >
                          <Upload size={16} className="mr-1" />
                          {backgroundImage ? "Change Background" : "Upload Background"}
                        </button>
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleBackgroundUpload}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="font-medium mb-3">Preview Theme</h4>
                  <div 
                    className="border rounded-lg p-6"
                    style={{
                      backgroundColor: menu.theme.secondaryColor,
                      color: menu.theme.textColor,
                      fontFamily: menu.theme.fontFamily,
                      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}
                  >
                    {/* Overlay to ensure text is readable on image backgrounds */}
                    {backgroundImage && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          zIndex: 0
                        }}
                      />
                    )}
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <h2 
                        style={{ 
                          color: menu.theme.primaryColor,
                          fontSize: '1.5rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        {menu.restaurant}
                      </h2>
                      <h3 style={{ marginBottom: '1rem' }}>{menu.name}</h3>
                      
                      <div 
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          color: '#333'
                        }}
                      >
                        <h4 
                          style={{ 
                            color: menu.theme.primaryColor,
                            marginBottom: '0.5rem',
                            borderBottom: `2px solid ${menu.theme.primaryColor}`,
                            paddingBottom: '0.25rem'
                          }}
                        >
                          Sample Menu Item
                        </h4>
                        <p>Description of this delicious item goes here.</p>
                        <div 
                          style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '0.5rem'
                          }}
                        >
                          <span>$9.99</span>
                          <button 
                            style={{
                              backgroundColor: menu.theme.primaryColor,
                              color: '#fff',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              border: 'none'
                            }}
                          >
                            View in AR
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Preview Tab */}
            {activeTab === "preview" && (
              <div>
                <div className="bg-gray-100 p-4 mb-6 rounded-md">
                  <p className="text-sm text-gray-700">
                    This is a preview of how your menu will appear to customers. 
                    The AR model viewing experience will be available when customers 
                    access the menu through the QR code.
                  </p>
                </div>
                
                <div 
                  className="border rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: menu.theme.secondaryColor,
                    color: menu.theme.textColor,
                    fontFamily: menu.theme.fontFamily,
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '500px'
                  }}
                >
                  {/* Header */}
                  <div 
                    className="p-6 text-center"
                    style={{
                      backgroundColor: backgroundImage ? 'rgba(0,0,0,0.6)' : 'transparent',
                      position: 'relative'
                    }}
                  >
                    <h1 
                      style={{ 
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: menu.theme.primaryColor
                      }}
                    >
                      {menu.restaurant}
                    </h1>
                    <h2 
                      style={{ 
                        fontSize: '1.5rem',
                        opacity: 0.9
                      }}
                    >
                      {menu.name}
                    </h2>
                  </div>
                  
                  {/* Menu Items Preview */}
                  <div 
                    className="p-6"
                    style={{
                      backgroundColor: backgroundImage ? 'rgba(0,0,0,0.7)' : 'transparent'
                    }}
                  >
                    {menu.items.length === 0 ? (
                      <div className="text-center py-10 bg-white bg-opacity-80 rounded">
                        <p className="text-gray-500">No items added to the menu yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {menu.items.map((item, idx) => {
                          // Render different item types
                          if (item.type === 'text') {
                            return (
                              <div 
                                key={idx}
                                style={{
                                  fontSize: item.style?.fontSize || "16px",
                                  color: item.style?.color || menu.theme.textColor,
                                  fontWeight: item.style?.fontWeight || "normal",
                                  textAlign: item.style?.textAlign || "left",
                                  backgroundColor: item.style?.backgroundColor === 'transparent' 
                                    ? 'transparent' 
                                    : item.style?.backgroundColor || 'transparent',
                                  padding: "10px",
                                  borderRadius: "4px"
                                }}
                              >
                                {item.content || "Text content"}
                              </div>
                            );
                          }
                          
                          if (item.type === 'button') {
                            return (
                              <div key={idx} className="text-center my-3">
                                <button
                                  style={{
                                    backgroundColor: item.style?.backgroundColor || menu.theme.primaryColor,
                                    color: item.style?.textColor || "#FFFFFF",
                                    borderRadius: item.style?.borderRadius || "4px",
                                    padding: "8px 16px",
                                    border: "none",
                                  }}
                                >
                                  {item.label || "Button"}
                                </button>
                              </div>
                            );
                          }
                          
                          if (item.type === 'image' && item.src) {
                            return (
                              <div key={idx} className="my-3 text-center">
                                <img 
                                  src={item.src} 
                                  alt={item.alt || item.name} 
                                  style={{
                                    width: `${item.width || 300}px`,
                                    height: `${item.height || 200}px`,
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                    margin: '0 auto'
                                  }}
                                />
                              </div>
                            );
                          }
                          
                          if (item.type === 'video' && item.src) {
                            return (
                              <div key={idx} className="my-3 text-center">
                                <video 
                                  src={item.src}
                                  controls={item.controls !== false}
                                  autoPlay={item.autoplay || false}
                                  muted={item.autoplay || false}
                                  style={{
                                    width: `${item.width || 300}px`,
                                    height: `${item.height || 200}px`,
                                    maxWidth: '100%',
                                    margin: '0 auto'
                                  }}
                                />
                              </div>
                            );
                          }
                          
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* QR Code Generator Modal */}
      {showQRGenerator && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="qr-modal-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <h2 id="qr-modal-title" className="text-2xl font-bold">AR Menu QR Code</h2>
              <p className="opacity-90">For "{menu.name}"</p>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 p-4 rounded-lg mb-6 text-center">
                  {/* QR Code Display Placeholder */}
                  <div className="relative mb-3 inline-block">
                    <div className="w-64 h-64 bg-white border flex items-center justify-center">
                      <span className="text-gray-400">QR Code Preview</span>
                    </div>
                    
                    {/* Floating Indicator for AR Capability */}
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      AR
                    </div>
                  </div>
                  
                  {/* URL Display */}
                  <div className="text-sm text-gray-500 mt-2 mb-4">
                    <p className="truncate max-w-xs mx-auto">
                      {savedMenuId || id
                        ? `https://yourmenu.com/${savedMenuId || id}`
                        : "Please save the menu to generate a QR code"}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-3">
                    <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Download
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                      Copy URL
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowQRGenerator(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Styles for some animations */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}