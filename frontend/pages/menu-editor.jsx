import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion } from "framer-motion";
import { Upload, ImagePlus, Cube, Link as LinkIcon, Video, Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import QRGenerator from '../components/QRGenerator';

const BACKEND_URL = "http://localhost:5000";

export default function EnhancedMenuEditor() {
  const router = useRouter();
  const { id } = router.query; // For editing existing menus
  const fileInputRef = useRef(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
const [savedMenuId, setSavedMenuId] = useState(null);
  // Menu state
  const [menu, setMenu] = useState({
    name: "Our Menu",
    restaurant: "My Restaurant",
    categories: ["Appetizers", "Main Courses", "Desserts", "Drinks"],
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
  const [currentCategory, setCurrentCategory] = useState("Appetizers");
  const [models, setModels] = useState([]);
  const [activeTab, setActiveTab] = useState("items"); // tabs: items, design, preview
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
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
          setCurrentCategory(response.data.categories[0] || "Appetizers");
          
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
  const addMenuItem = () => {
    const newItem = {
      name: "New Item",
      description: "Description here",
      price: 9.99,
      category: currentCategory,
      modelId: null,
      image: null,
      buttons: [] // For interactive buttons (links, videos, etc.)
    };
    
    setMenu({
      ...menu,
      items: [...menu.items, newItem]
    });
  };
  
  // Add interactive button to a menu item
  const addButton = (itemIndex, type) => {
    const updatedItems = [...menu.items];
    const newButton = {
      type, // 'link', 'video', 'model'
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Button`,
      value: type === 'link' ? 'https://' : null,
      modelId: type === 'model' ? null : undefined
    };
    
    if (!updatedItems[itemIndex].buttons) {
      updatedItems[itemIndex].buttons = [];
    }
    
    updatedItems[itemIndex].buttons.push(newButton);
    setMenu({ ...menu, items: updatedItems });
  };
  
  // Update button properties
  const updateButton = (itemIndex, buttonIndex, field, value) => {
    const updatedItems = [...menu.items];
    updatedItems[itemIndex].buttons[buttonIndex][field] = value;
    setMenu({ ...menu, items: updatedItems });
  };
  
  // Remove interactive button
  const removeButton = (itemIndex, buttonIndex) => {
    const updatedItems = [...menu.items];
    updatedItems[itemIndex].buttons.splice(buttonIndex, 1);
    setMenu({ ...menu, items: updatedItems });
  };
  
  // Update menu item
  const updateMenuItem = (index, field, value) => {
    const updatedItems = [...menu.items];
    updatedItems[index][field] = value;
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
  
  // Handle menu item image upload
  const handleItemImageUpload = async (itemIndex, e) => {
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
      updateMenuItem(itemIndex, "image", imageUrl);
      
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage("Failed to upload menu item image.");
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
    if (saveSuccessful) {
      setSavedMenuId(response.data._id);
      setShowQRGenerator(true);
    }
  
  };
  
  // Generate QR code for the menu
  const generateQRCode = async () => {
    if (!id) {
      setErrorMessage("Please save the menu first to generate a QR code.");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.get(`${BACKEND_URL}/api/menu-qr/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccessMessage("QR code generated successfully!");
      
    } catch (error) {
      console.error("Error generating QR code:", error);
      setErrorMessage("Failed to generate QR code.");
    }
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
              disabled={!id}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition"
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
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {menu.categories.map((category) => (
                      <button
                        key={category}
                        className={`px-4 py-2 rounded-full text-sm ${
                          currentCategory === category
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        onClick={() => setCurrentCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                    <button
                      className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm flex items-center"
                      onClick={() => {
                        const newCategory = prompt("Enter new category name:");
                        if (newCategory && newCategory.trim()) {
                          setMenu({
                            ...menu,
                            categories: [...menu.categories, newCategory.trim()]
                          });
                          setCurrentCategory(newCategory.trim());
                        }
                      }}
                    >
                      <Plus size={16} className="mr-1" /> Add Category
                    </button>
                  </div>
                </div>
                
                {/* Items for Current Category */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      Items in {currentCategory}
                    </h3>
                    <button
                      onClick={addMenuItem}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 flex items-center text-sm"
                    >
                      <Plus size={16} className="mr-1" /> Add Item
                    </button>
                  </div>
                  
                  {/* Item List */}
                  <div className="space-y-6">
                    {menu.items
                      .filter((item) => item.category === currentCategory)
                      .map((item, itemIndex) => {
                        const originalIndex = menu.items.findIndex(
                          (i) => i === item
                        );
                        
                        return (
                          <motion.div
                            key={itemIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border rounded-lg overflow-hidden bg-white"
                          >
                            {/* Item Header */}
                            <div className="bg-gray-50 p-4 flex justify-between items-center">
                              <h4 className="font-medium">{item.name || "New Item"}</h4>
                              <button
                                onClick={() => deleteMenuItem(originalIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            
                            {/* Item Content */}
                            <div className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Item Name
                                  </label>
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) =>
                                      updateMenuItem(originalIndex, "name", e.target.value)
                                    }
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Item Name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price ($)
                                  </label>
                                  <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) =>
                                      updateMenuItem(
                                        originalIndex,
                                        "price",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-full p-2 border rounded-md"
                                    step="0.01"
                                    min="0"
                                  />
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={item.description}
                                  onChange={(e) =>
                                    updateMenuItem(
                                      originalIndex,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 border rounded-md h-20"
                                  placeholder="Item description"
                                ></textarea>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Item Image
                                  </label>
                                  <div className="flex items-center">
                                    {item.image ? (
                                      <div className="relative mr-2">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-16 h-16 object-cover rounded-md"
                                        />
                                        <button
                                          onClick={() =>
                                            updateMenuItem(originalIndex, "image", null)
                                          }
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                          style={{ width: '20px', height: '20px', fontSize: '12px' }}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ) : null}
                                    <button
                                      onClick={() => {
                                        const input = document.createElement("input");
                                        input.type = "file";
                                        input.accept = "image/*";
                                        input.onchange = (e) =>
                                          handleItemImageUpload(originalIndex, e);
                                        input.click();
                                      }}
                                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded flex items-center text-sm"
                                    >
                                      <ImagePlus size={16} className="mr-1" />
                                      {item.image ? "Change Image" : "Add Image"}
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    3D Model
                                  </label>
                                  <select
                                    value={item.modelId || ""}
                                    onChange={(e) =>
                                      updateMenuItem(
                                        originalIndex,
                                        "modelId",
                                        e.target.value || null
                                      )
                                    }
                                    className="w-full p-2 border rounded-md"
                                  >
                                    <option value="">No 3D Model</option>
                                    {models.map((model) => (
                                      <option key={model._id} value={model._id}>
                                        {model.name || `Model ${model._id}`}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              // Then in your JSX
{showQRGenerator && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <QRGenerator 
      menuId={savedMenuId}
      menuName={menu.name}
      onClose={() => setShowQRGenerator(false)}
    />
  </div>
)}
                              {/* Interactive Buttons */}
                              <div className="mt-6">
                                <h5 className="font-medium text-sm mb-2">
                                  Interactive Buttons
                                </h5>
                                
                                <div className="space-y-3 mb-3">
                                  {item.buttons && item.buttons.map((button, buttonIndex) => (
                                    <div
                                      key={buttonIndex}
                                      className="border rounded-md p-3 bg-gray-50"
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-sm">
                                          {button.type.charAt(0).toUpperCase() +
                                            button.type.slice(1)}{" "}
                                          Button
                                        </span>
                                        <button
                                          onClick={() =>
                                            removeButton(originalIndex, buttonIndex)
                                          }
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Label
                                          </label>
                                          <input
                                            type="text"
                                            value={button.label}
                                            onChange={(e) =>
                                              updateButton(
                                                originalIndex,
                                                buttonIndex,
                                                "label",
                                                e.target.value
                                              )
                                            }
                                            className="w-full p-2 border rounded-md text-sm"
                                          />
                                        </div>
                                        {button.type === "link" && (
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              URL
                                            </label>
                                            <input
                                              type="url"
                                              value={button.value}
                                              onChange={(e) =>
                                                updateButton(
                                                  originalIndex,
                                                  buttonIndex,
                                                  "value",
                                                  e.target.value
                                                )
                                              }
                                              className="w-full p-2 border rounded-md text-sm"
                                              placeholder="https://"
                                            />
                                          </div>
                                        )}
                                        {button.type === "video" && (
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Video URL
                                            </label>
                                            <input
                                              type="url"
                                              value={button.value}
                                              onChange={(e) =>
                                                updateButton(
                                                  originalIndex,
                                                  buttonIndex,
                                                  "value",
                                                  e.target.value
                                                )
                                              }
                                              className="w-full p-2 border rounded-md text-sm"
                                              placeholder="YouTube or Video URL"
                                            />
                                          </div>
                                        )}
                                        {button.type === "model" && (
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              3D Model
                                            </label>
                                            <select
                                              value={button.modelId || ""}
                                              onChange={(e) =>
                                                updateButton(
                                                  originalIndex,
                                                  buttonIndex,
                                                  "modelId",
                                                  e.target.value || null
                                                )
                                              }
                                              className="w-full p-2 border rounded-md text-sm"
                                            >
                                              <option value="">Select a model</option>
                                              {models.map((model) => (
                                                <option
                                                  key={model._id}
                                                  value={model._id}
                                                >
                                                  {model.name || `Model ${model._id}`}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => addButton(originalIndex, "link")}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded flex items-center text-sm hover:bg-gray-200"
                                  >
                                    <LinkIcon size={14} className="mr-1" />
                                    Add Link
                                  </button>
                                  <button
                                    onClick={() => addButton(originalIndex, "video")}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded flex items-center text-sm hover:bg-gray-200"
                                  >
                                    <Video size={14} className="mr-1" />
                                    Add Video
                                  </button>
                                  <button
                                    onClick={() => addButton(originalIndex, "model")}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded flex items-center text-sm hover:bg-gray-200"
                                  >
                                    <Cube size={14} className="mr-1" />
                                    Add Model
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                  
                  {menu.items.filter((item) => item.category === currentCategory)
                    .length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                      <p className="text-gray-500">
                        No items yet. Click "Add Item" to get started.
                      </p>
                    </div>
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
                    backgroundPosition: 'center'
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
                  
                  {/* Category Navigation */}
                  <div 
                    style={{
                      display: 'flex',
                      overflowX: 'auto',
                      padding: '0.5rem',
                      backgroundColor: menu.theme.primaryColor,
                      color: '#fff'
                    }}
                  >
                    {menu.categories.map((category) => (
                      <button
                        key={category}
                        className="px-4 py-2 whitespace-nowrap text-white opacity-80 hover:opacity-100"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  
                  {/* Menu Items */}
                  <div 
                    className="p-6"
                    style={{
                      backgroundColor: backgroundImage ? 'rgba(0,0,0,0.7)' : 'transparent'
                    }}
                  >
                    {menu.categories.map((category) => (
                      <div key={category} className="mb-8">
                        <h3 
                          style={{ 
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: menu.theme.primaryColor,
                            borderBottom: `2px solid ${menu.theme.primaryColor}`,
                            paddingBottom: '0.5rem',
                            marginBottom: '1rem'
                          }}
                        >
                          {category}
                        </h3>
                        
                        <div className="space-y-4">
                          {menu.items
                            .filter((item) => item.category === category)
                            .map((item, idx) => (
                              <div 
                                key={idx}
                                className="rounded-lg overflow-hidden"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.9)',
                                  display: 'flex',
                                  color: '#333'
                                }}
                              >
                                {item.image && (
                                  <div 
                                    style={{
                                      width: '120px',
                                      backgroundImage: `url(${item.image})`,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center'
                                    }}
                                  ></div>
                                )}
                                
                                <div className="p-4 flex-1">
                                  <div className="flex justify-between items-start">
                                    <h4 style={{ fontWeight: 'bold' }}>{item.name}</h4>
                                    <span 
                                      style={{ 
                                        fontWeight: 'bold',
                                        color: menu.theme.primaryColor
                                      }}
                                    >
                                      ${item.price?.toFixed(2)}
                                    </span>
                                  </div>
                                  
                                  <p className="mt-1 text-sm">{item.description}</p>
                                  
                                  {(item.modelId || (item.buttons && item.buttons.length > 0)) && (
                                    <div className="mt-3 flex gap-2">
                                      {item.modelId && (
                                        <button 
                                          style={{
                                            backgroundColor: menu.theme.primaryColor,
                                            color: '#fff',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: 'none'
                                          }}
                                        >
                                          <Cube size={14} style={{ marginRight: '0.25rem' }} />
                                          View in AR
                                        </button>
                                      )}
                                      
                                      {item.buttons && item.buttons.map((button, btnIdx) => (
                                        <button 
                                          key={btnIdx}
                                          style={{
                                            backgroundColor: '#f0f0f0',
                                            color: '#333',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: 'none'
                                          }}
                                        >
                                          {button.type === 'link' && (
                                            <LinkIcon size={14} style={{ marginRight: '0.25rem' }} />
                                          )}
                                          {button.type === 'video' && (
                                            <Video size={14} style={{ marginRight: '0.25rem' }} />
                                          )}
                                          {button.type === 'model' && (
                                            <Cube size={14} style={{ marginRight: '0.25rem' }} />
                                          )}
                                          {button.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          
                          {menu.items.filter((item) => item.category === category).length === 0 && (
                            <div className="text-center py-4 bg-white bg-opacity-80 rounded">
                              <p className="text-gray-500">No items yet in this category</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}