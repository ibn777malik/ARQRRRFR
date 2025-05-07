// pages/dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cube, Eye, QrCode, ChefHat, Book, BarChart3, Upload, Menu as MenuIcon 
} from 'lucide-react';
// Import components
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatsCard from '../components/dashboard/StatsCard';
import ModelCard from '../components/dashboard/ModelCard';
import MenuCard from '../components/dashboard/MenuCard';
import ActivityCard from '../components/dashboard/ActivityCard';
import QuickActions from '../components/dashboard/QuickActions';
import Image3D from '../components/icons/CustomIcons';

const BACKEND_URL = "http://localhost:5000";
const FRONTEND_URL = "http://localhost:3000";

export default function Dashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [uploads, setUploads] = useState([]);
  const [menus, setMenus] = useState([]);
  const [stats, setStats] = useState({
    totalModels: 0,
    totalMenus: 0,
    totalViews: 0,
    totalArViews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUpload, setEditingUpload] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New AR features available!", read: false },
    { id: 2, message: "Your QR menu is getting popular!", read: false }
  ]);
  const [activeTab, setActiveTab] = useState('models');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch models/uploads
        const uploadsResponse = await fetch("/api/uploads");
        const uploadsData = await uploadsResponse.json();
        
        if (Array.isArray(uploadsData) && uploadsData.length > 0) {
          setUploads(uploadsData);
          setStats(prev => ({...prev, totalModels: uploadsData.length}));
        }
        
        // Try to fetch menus if endpoint exists
        try {
          const menusResponse = await fetch("/api/menus", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (menusResponse.ok) {
            const menusData = await menusResponse.json();
            setMenus(menusData);
            setStats(prev => ({...prev, totalMenus: menusData.length}));
          }
        } catch (menuError) {
          console.log("Menu endpoints may not be available yet:", menuError);
        }
        
        // Try to fetch analytics if endpoint exists
        try {
          const analyticsResponse = await fetch("/api/analytics/summary", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            setStats(prev => ({
              ...prev, 
              totalViews: analyticsData.totalViews || 0,
              totalArViews: analyticsData.totalArViews || 0
            }));
          }
        } catch (analyticsError) {
          console.log("Analytics endpoints may not be available yet:", analyticsError);
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const updateName = async (uploadId) => {
    if (!editingUpload || !editingUpload.name.trim()) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/elements/${uploadId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingUpload.name }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setUploads(uploads.map(upload =>
          upload._id === uploadId ? { ...upload, name: editingUpload.name } : upload
        ));
        setEditingUpload(null);
        
        // Show success notification
        addNotification(`Model "${editingUpload.name}" updated successfully!`);
      } else {
        console.error("Error updating name:", result.error);
      }
    } catch (err) {
      console.error("Failed to update name:", err);
    }
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      read: false
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notif => ({...notif, read: true})));
  };

  const generateMenuQR = async (menuId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/menu-qr/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the menu with QR information
        setMenus(menus.map(menu => 
          menu._id === menuId ? {...menu, qrCodeUrl: data.qrCodeUrl, menuUrl: data.menuUrl} : menu
        ));
        
        addNotification("QR code generated successfully!");
      } else {
        addNotification("Failed to generate QR code");
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const filteredUploads = uploads.filter(upload => 
    upload.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMenus = menus.filter(menu => 
    menu.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menu.restaurant?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f0f0' }}>
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Header 
          activeSection={activeSection}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          markAllNotificationsAsRead={markAllNotificationsAsRead}
        />
        
        {/* Content Area */}
        <main style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Dashboard Overview
                </h3>
                
                {/* Stats Cards */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  <StatsCard 
                    icon={<Image3D size={24} />}
                    label="Total Models"
                    value={stats.totalModels}
                    bgColor="#e6f7ff"
                    iconColor="#0070f3"
                  />
                  
                  <StatsCard 
                    icon={<MenuIcon size={24} />}
                    label="Total Menus"
                    value={stats.totalMenus}
                    bgColor="#e6ffef"
                    iconColor="#10b981"
                  />
                  
                  <StatsCard 
                    icon={<Eye size={24} />}
                    label="Total Views"
                    value={stats.totalViews}
                    bgColor="#f3e8ff"
                    iconColor="#8b5cf6"
                  />
                  
                  <StatsCard 
                    icon={<QrCode size={24} />}
                    label="AR Views"
                    value={stats.totalArViews}
                    bgColor="#fff7ed"
                    iconColor="#f97316"
                  />
                </div>
                
                {/* Quick Actions and Activity */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  <QuickActions setActiveSection={setActiveSection} />
                  <ActivityCard notifications={notifications} />
                </div>
              </motion.div>
            )}
            
            {activeSection === 'models' && (
              <motion.div
                key="models"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                    3D Models
                  </h3>
                  <button
                    onClick={() => router.push('/upload')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      background: '#0070f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={16} style={{ marginRight: '6px' }} />
                    Upload New Model
                  </button>
                </div>
                
                {isLoading ? (
                  <div style={{ 
                    height: '200px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid #f3f3f3',
                      borderTop: '3px solid #0070f3',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : error ? (
                  <div style={{
                    padding: '20px',
                    borderRadius: '8px',
                    background: '#fee2e2',
                    color: '#ef4444'
                  }}>
                    {error}
                  </div>
                ) : filteredUploads.length === 0 ? (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <Image3D size={48} style={{ marginBottom: '20px', color: '#d1d5db' }} />
                    <h3 style={{ marginBottom: '10px', fontWeight: '500' }}>No models found</h3>
                    <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                      {searchQuery ? `No models matching "${searchQuery}"` : "Upload your first 3D model to get started"}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          padding: '8px 16px',
                          background: '#f3f4f6',
                          color: '#4b5563',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    {filteredUploads.map(upload => (
                      <ModelCard 
                        key={upload._id}
                        model={upload}
                        onEdit={() => setEditingUpload(upload)}
                        onGenerateQR={generateMenuQR}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            
            {activeSection === 'menus' && (
              <motion.div
                key="menus"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                    AR Menus
                  </h3>
                  <button
                    onClick={() => router.push('/menu-editor')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <ChefHat size={16} style={{ marginRight: '6px' }} />
                    Create New Menu
                  </button>
                </div>
                
                {isLoading ? (
                  <div style={{ 
                    height: '200px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid #f3f3f3',
                      borderTop: '3px solid #10b981',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : menus.length === 0 ? (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <Book size={48} style={{ marginBottom: '20px', color: '#d1d5db' }} />
                    <h3 style={{ marginBottom: '10px', fontWeight: '500' }}>No menus created yet</h3>
                    <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                      Create your first AR menu to get started
                    </p>
                    <button
                      onClick={() => router.push('/menu-editor')}
                      style={{
                        padding: '8px 16px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      <ChefHat size={16} style={{ marginRight: '6px' }} />
                      Create Menu
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    {filteredMenus.map(menu => (
                      <MenuCard 
                        key={menu._id}
                        menu={menu}
                        onGenerateQR={generateMenuQR}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            
            {activeSection === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Analytics Dashboard
                </h3>
                
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    height: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed #d1d5db',
                    borderRadius: '4px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <BarChart3 size={40} style={{ color: '#9ca3af', marginBottom: '15px' }} />
                      <p>Analytics data will be displayed here</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Connect analytics to track interactions with your AR menus
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeSection === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Account Settings
                </h3>
                
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  marginBottom: '20px'
                }}>
                  <div style={{ borderBottom: '1px solid #e5e7eb', padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '25%', fontSize: '14px', color: '#0070f3', fontWeight: '500' }}>
                        Profile
                      </div>
                      <div style={{ width: '75%' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#0070f3',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            marginRight: '15px'
                          }}>
                            AM
                          </div>
                          <div>
                            <h4 style={{ fontWeight: '500', margin: '0 0 5px 0' }}>Restaurant Manager</h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>abdallamalik73i@gmail.com</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ borderBottom: '1px solid #e5e7eb', padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '25%', fontSize: '14px', color: '#0070f3', fontWeight: '500' }}>
                        Password
                      </div>
                      <div style={{ width: '75%' }}>
                        <button
                          style={{
                            border: 'none',
                            background: 'none',
                            color: '#0070f3',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Change password
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '25%', fontSize: '14px', color: '#0070f3', fontWeight: '500' }}>
                        Notifications
                      </div>
                      <div style={{ width: '75%' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input 
                            type="checkbox" 
                            defaultChecked={true}
                            style={{ marginRight: '8px' }}
                          />
                          <span>Email notifications</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '20px'
                }}>
                  <button
                    style={{
                      padding: '8px 16px',
                      background: '#0070f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      
      {/* Add a style tag for animations */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}