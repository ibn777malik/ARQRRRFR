import { useState, useEffect } from "react";
import axios from "axios";

export default function MenuEditor() {
  const [menu, setMenu] = useState({
    name: "Our Menu",
    restaurant: "My Restaurant",
    categories: ["Appetizers", "Main Courses", "Desserts"],
    items: []
  });
  const [models, setModels] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("Appetizers");
  
  // Fetch available 3D models
  useEffect(() => {
    const fetchModels = async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/elements", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModels(response.data);
    };
    
    fetchModels();
  }, []);
  
  // Add new menu item
  const addMenuItem = () => {
    const newItem = {
      name: "",
      description: "",
      price: 0,
      category: currentCategory,
      modelId: null,
      image: ""
    };
    
    setMenu({
      ...menu,
      items: [...menu.items, newItem]
    });
  };
  
  // Save menu
  const saveMenu = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/menus", menu, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      alert("Menu saved successfully!");
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Failed to save menu");
    }
  };
  
  return (
    <div className="menu-editor">
      <h1>Menu Editor</h1>
      
      {/* Menu details */}
      <div className="menu-details">
        <input 
          type="text" 
          value={menu.name} 
          onChange={e => setMenu({...menu, name: e.target.value})}
          placeholder="Menu Name"
        />
        <input 
          type="text" 
          value={menu.restaurant} 
          onChange={e => setMenu({...menu, restaurant: e.target.value})}
          placeholder="Restaurant Name"
        />
      </div>
      
      {/* Category tabs */}
      <div className="category-tabs">
        {menu.categories.map(category => (
          <button 
            key={category}
            className={category === currentCategory ? "active" : ""}
            onClick={() => setCurrentCategory(category)}
          >
            {category}
          </button>
        ))}
        <button onClick={() => {
          const newCategory = prompt("Enter new category name:");
          if (newCategory) {
            setMenu({...menu, categories: [...menu.categories, newCategory]});
            setCurrentCategory(newCategory);
          }
        }}>+ Add Category</button>
      </div>
      
      {/* Menu items for current category */}
      <div className="menu-items">
        <h2>{currentCategory}</h2>
        {menu.items
          .filter(item => item.category === currentCategory)
          .map((item, index) => (
            <div key={index} className="menu-item">
              <input 
                type="text" 
                value={item.name} 
                onChange={e => {
                  const updatedItems = [...menu.items];
                  updatedItems[index].name = e.target.value;
                  setMenu({...menu, items: updatedItems});
                }}
                placeholder="Item Name"
              />
              <textarea 
                value={item.description} 
                onChange={e => {
                  const updatedItems = [...menu.items];
                  updatedItems[index].description = e.target.value;
                  setMenu({...menu, items: updatedItems});
                }}
                placeholder="Description"
              />
              <input 
                type="number" 
                value={item.price} 
                onChange={e => {
                  const updatedItems = [...menu.items];
                  updatedItems[index].price = parseFloat(e.target.value);
                  setMenu({...menu, items: updatedItems});
                }}
                placeholder="Price"
              />
              
              {/* Model selection dropdown */}
              <select 
                value={item.modelId || ""}
                onChange={e => {
                  const updatedItems = [...menu.items];
                  updatedItems[index].modelId = e.target.value;
                  setMenu({...menu, items: updatedItems});
                }}
              >
                <option value="">No 3D Model</option>
                {models.map(model => (
                  <option key={model._id} value={model._id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        <button onClick={addMenuItem}>+ Add Item</button>
      </div>
      
      <button className="save-button" onClick={saveMenu}>Save Menu</button>
    </div>
  );
}