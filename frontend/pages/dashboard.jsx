// pages/dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Eye, QrCode, Book, BarChart3, Upload, Menu as MenuIcon,
  Plus, Calendar, Users, Zap, Settings, Bell, Search, LogOut, Utensils
} from 'lucide-react';

// Import components - assuming these are the enhanced versions we created
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityCard from '../components/dashboard/ActivityCard';
import QuickActions from '../components/dashboard/QuickActions';

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
  const [viewingQRForId, setViewingQRForId] = useState(null);

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

 const generateMenuQR = async (modelId) => {
  try {
    console.log("Generating QR for model ID:", modelId);
    const token = localStorage.getItem("token");
    
    // This URL should match your backend endpoint for QR generation
    const response = await fetch(`${BACKEND_URL}/api/uploads/${modelId}/qr`, {
      headers: { 
        Authorization: `Bearer ${token}`
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("QR code generation successful:", data);
      
      // Update the uploads array with the new QR code URL
      setUploads(uploads.map(upload => 
        upload._id === modelId ? { 
          ...upload, 
          qrCodeUrl: data.qrCodeUrl || data.qrUrl || data.url // Try different possible field names
        } : upload
      ));
      
      addNotification("QR code generated successfully!");
    } else {
      console.error("QR code generation failed:", await response.text());
      addNotification("Failed to generate QR code");
    }
  } catch (error) {
    console.error("Error generating QR code:", error);
    addNotification("Error generating QR code");
  }
};
const handleViewQR = (modelId) => {
  const upload = uploads.find(u => u._id === modelId);
  if (upload && upload.qrCodeUrl) {
    setViewingQRForId(modelId);
  } else {
    // If QR doesn't exist yet, generate it first
    generateMenuQR(modelId);
    // Then show it
    setTimeout(() => setViewingQRForId(modelId), 500);
  }
};

const closeQRViewer = () => {
  setViewingQRForId(null);
};

  const filteredUploads = uploads.filter(upload => 
    upload.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMenus = menus.filter(menu => 
    menu.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menu.restaurant?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animation variants
  const pageTransition = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Function to render model cards with animations
  const renderModelCards = () => {
    if (isLoading) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            height: '200px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #0070f3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </motion.div>
      );
    } 
    
    if (error) {
      return (
        <motion.div 
          variants={fadeIn}
          style={{
            padding: '20px',
            borderRadius: '8px',
            background: '#fee2e2',
            color: '#ef4444'
          }}
        >
          {error}
        </motion.div>
      );
    } 
    
    if (filteredUploads.length === 0) {
      return (
        <motion.div
          variants={fadeIn}
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Utensils size={48} style={{ color: '#d1d5db', marginBottom: '20px' }} />
          </motion.div>
          <h3 style={{ marginBottom: '10px', fontWeight: '500' }}>No models found</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {searchQuery ? `No models matching "${searchQuery}"` : "Upload your first 3D model to get started"}
          </p>
          {searchQuery && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
            </motion.button>
          )}
        </motion.div>
      );
    }

    // Render the model cards
    return (
      <motion.div 
        variants={containerVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}
      >
        {filteredUploads.map((upload, index) => (
          <motion.div
            key={upload._id}
            variants={itemVariants}
            custom={index}
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ 
              height: '140px', 
              background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f7ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Type badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {upload.type || "GLB"}
              </div>
              
              {/* Model icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0,112,243,0.1)'
                }}
              >
                <Utensils size={32} color="#0070f3" />
              </motion.div>
            </div>
            
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ 
                marginBottom: '8px', 
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {upload.name || "Unnamed Model"}
              </h3>
              
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                Added: {new Date(upload.createdAt || Date.now()).toLocaleDateString()}
              </p>
              
              <div style={{ 
                display: 'flex', 
                marginTop: 'auto',
                gap: '8px'
              }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/view/${upload.url?.split('/').pop() || upload._id}`)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    background: '#e6f7ff',
                    color: '#0070f3',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '500',
                    fontSize: '13px'
                  }}
                >
                  <Eye size={14} style={{ marginRight: '4px' }} />
                  Preview
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingUpload(upload)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    background: '#f3f4f6',
                    color: '#4b5563',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '500',
                    fontSize: '13px'
                  }}
                >
                  <Settings size={14} style={{ marginRight: '4px' }} />
                  Edit
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => generateMenuQR(upload._id)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    background: '#fff7ed',
                    color: '#f97316',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '500',
                    fontSize: '13px'
                  }}
                >
                  <QrCode size={14} style={{ marginRight: '4px' }} />
                  QR
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // Function to render menu cards with animations
  const renderMenuCards = () => {
    if (isLoading) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            height: '200px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </motion.div>
      );
    }
    
    if (menus.length === 0) {
      return (
        <motion.div
          variants={fadeIn}
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Book size={48} style={{ color: '#d1d5db', marginBottom: '20px' }} />
          </motion.div>
          <h3 style={{ marginBottom: '10px', fontWeight: '500' }}>No menus created yet</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Create your first AR menu to get started
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/menu-editor')}
            style={{
              padding: '10px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              fontWeight: '500'
            }}
          >
            <Plus size={16} style={{ marginRight: '6px' }} />
            Create Menu
          </motion.button>
        </motion.div>
      );
    }

    return (
      <motion.div 
        variants={containerVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}
      >
        {filteredMenus.map((menu, index) => (
          <motion.div
            key={menu._id}
            variants={itemVariants}
            custom={index}
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ 
              padding: '20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white'
            }}>
              <h3 style={{ fontWeight: '500', fontSize: '18px', marginBottom: '4px' }}>
                {menu.name || 'Menu'}
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>
                {menu.restaurant || 'Restaurant'}
              </p>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Categories:</span>
                  <span style={{ fontWeight: '500' }}>{menu.categories?.length || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Items:</span>
                  <span style={{ fontWeight: '500' }}>{menu.items?.length || 0}</span>
                </div>
              </div>

              {menu.qrCodeUrl ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  margin: '16px 0',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <img
                    src={menu.qrCodeUrl}
                    alt="QR Code"
                    style={{ width: '60px', height: '60px', marginRight: '12px' }}
                  />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>QR Code Ready</p>
                    <a
                      href={menu.qrCodeUrl}
                      download
                      style={{ fontSize: '13px', color: '#0070f3', textDecoration: 'none' }}
                    >
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateMenuQR(menu._id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '16px',
                    background: '#e6f7ff',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0070f3',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Generate QR Code
                </motion.button>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(menu.menuUrl || `/menu/${menu._id}`, '_blank')}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: '#e6ffef',
                    color: '#10b981',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  View Menu
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/menu-editor?id=${menu._id}`)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: '#f3f4f6',
                    color: '#4b5563',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Edit Menu
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

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
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.h3 
                  variants={itemVariants}
                  style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}
                >
                  Dashboard Overview
                </motion.h3>
                
                {/* Stats Cards */}
                <motion.div 
                  variants={containerVariants}
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}
                >
                  <motion.div variants={itemVariants}>
                    <StatsCard 
                      icon={<Utensils size={24} />}
                      label="Total Models"
                      value={stats.totalModels}
                      bgColor="#e6f7ff"
                      iconColor="#0070f3"
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <StatsCard 
                      icon={<MenuIcon size={24} />}
                      label="Total Menus"
                      value={stats.totalMenus}
                      bgColor="#e6ffef"
                      iconColor="#10b981"
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <StatsCard 
                      icon={<Eye size={24} />}
                      label="Total Views"
                      value={stats.totalViews}
                      bgColor="#f3e8ff"
                      iconColor="#8b5cf6"
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <StatsCard 
                      icon={<QrCode size={24} />}
                      label="AR Views"
                      value={stats.totalArViews}
                      bgColor="#fff7ed"
                      iconColor="#f97316"
                    />
                  </motion.div>
                </motion.div>
                
                {/* Quick Actions and Activity */}
                <motion.div
                  variants={containerVariants}
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}
                >
                  <motion.div variants={itemVariants}>
                    <QuickActions setActiveSection={setActiveSection} />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <ActivityCard notifications={notifications} />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
            
            {activeSection === 'models' && (
              <motion.div
                key="models"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  variants={itemVariants}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '600' }}>
                    3D Models
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/upload')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      background: '#0070f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <Upload size={16} style={{ marginRight: '8px' }} />
                    Upload New Model
                  </motion.button>
                </motion.div>
                
                {renderModelCards()}
                
              </motion.div>
            )}
            
            {activeSection === 'menus' && (
              <motion.div
                key="menus"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  variants={itemVariants}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '600' }}>
                    AR Menus
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/menu-editor')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                    >
                    <Book size={16} style={{ marginRight: '8px' }} />
                    Create New Menu
                  </motion.button>
                </motion.div>
                
                {renderMenuCards()}
              </motion.div>
            )}
            
            {activeSection === 'analytics' && (
              <motion.div
                key="analytics"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.h3 
                  variants={itemVariants}
                  style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}
                >
                  Analytics Dashboard
                </motion.h3>
                
                <motion.div
                  variants={itemVariants}
                  style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    marginBottom: '20px'
                  }}
                >
                  {/* Analytics graphs placeholder */}
                  <div style={{
                    height: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    color: '#6b7280'
                  }}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <BarChart3 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    </motion.div>
                    <p style={{ fontWeight: '500', marginBottom: '6px' }}>Analytics Coming Soon</p>
                    <p style={{ fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>
                      Connect your menus to track QR scans, views, and customer interactions
                    </p>
                  </div>
                </motion.div>
                
                {/* Analytics stats section */}
                <motion.div 
                  variants={containerVariants}
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '15px'
                  }}
                >
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      textAlign: 'center'
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(139, 92, 246, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                      }}
                    >
                      <QrCode size={24} color="#8b5cf6" />
                    </motion.div>
                    <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>QR Scans</h4>
                    <p style={{ fontSize: '22px', fontWeight: '600', color: '#1f2937' }}>
                      --
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      textAlign: 'center'
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                      }}
                    >
                      <Users size={24} color="#10b981" />
                    </motion.div>
                    <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Unique Visitors</h4>
                    <p style={{ fontSize: '22px', fontWeight: '600', color: '#1f2937' }}>
                      --
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      textAlign: 'center'
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(249, 115, 22, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                      }}
                    >
                      <Calendar size={24} color="#f97316" />
                    </motion.div>
                    <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Today's Views</h4>
                    <p style={{ fontSize: '22px', fontWeight: '600', color: '#1f2937' }}>
                      --
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      textAlign: 'center'
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(0, 112, 243, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                      }}
                    >
                      <Zap size={24} color="#0070f3" />
                    </motion.div>
                    <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Conversion Rate</h4>
                    <p style={{ fontSize: '22px', fontWeight: '600', color: '#1f2937' }}>
                      --
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
            
            {activeSection === 'settings' && (
              <motion.div
                key="settings"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.h3 
                  variants={itemVariants}
                  style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}
                >
                  Account Settings
                </motion.h3>
                
                <motion.div 
                  variants={itemVariants}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    marginBottom: '20px'
                  }}
                >
                  {/* Profile Section */}
                  <div style={{ borderBottom: '1px solid #e5e7eb', padding: '20px' }}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{ display: 'flex', alignItems: 'flex-start' }}
                    >
                      <div style={{ width: '25%', fontSize: '14px', color: '#0070f3', fontWeight: '500' }}>
                        Profile
                      </div>
                      <div style={{ width: '75%' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #0070f3 0%, #00a1ff 100%)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '24px',
                              marginRight: '20px'
                            }}
                          >
                            AM
                          </motion.div>
                          <div>
                            <h4 style={{ fontWeight: '600', margin: '0 0 5px 0', fontSize: '18px' }}>Restaurant Manager</h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>abdallamalik73i@gmail.com</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
    {/* QR Code Modal/Popup */}
{viewingQRForId && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    }}
    onClick={closeQRViewer}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the card
    >
      <button
        onClick={closeQRViewer}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          color: '#6b7280'
        }}
      >
        ×
      </button>
      
      {(() => {
        const upload = uploads.find(u => u._id === viewingQRForId);
        if (upload && upload.qrCodeUrl) {
          return (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>{upload.name || "Model"} QR Code</h3>
              <div style={{ marginBottom: '24px' }}>
                <img
                  src={upload.qrCodeUrl}
                  alt="QR Code"
                  style={{ maxWidth: '200px', width: '100%', height: 'auto', margin: '0 auto' }}
                />
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                Scan this QR code to view the 3D model in AR
              </p>
              <motion.a
                href={upload.qrCodeUrl}
                download
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: '#0070f3',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
              >
                Download QR Code
              </motion.a>
            </div>
          );
        } else {
          return (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Loading QR Code...</h3>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #0070f3',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            </div>
          );
        }
      })()}
    </motion.div>
  </motion.div>
)}              
                  {/* Password Section */}
                  <div style={{ borderBottom: '1px solid #e5e7eb', padding: '20px' }}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <div style={{ width: '25%', fontSize: '14px', color: '#0070f3', fontWeight: '500' }}>
                        Password
                      </div>
                      <div style={{ width: '75%' }}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: '#0070f3',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}
                        >
                          Change password
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Notifications Section */}
                  <div style={{ padding: '20px' }}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <div style={{ width: '25%', fontSize: '14px', color: '#0070f3', fontWeight: '500' }}>
                        Notifications
                      </div>
                      <div style={{ width: '75%' }}>
                        <motion.label 
                          whileHover={{ scale: 1.02 }}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            defaultChecked={true}
                            style={{ 
                              width: '16px', 
                              height: '16px', 
                              marginRight: '10px',
                              accentColor: '#0070f3'
                            }}
                          />
                          <span>Email notifications</span>
                        </motion.label>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '20px'
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '10px 20px',
                      background: '#0070f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Save Changes
                  </motion.button>
                </motion.div>
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
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        html, body {
          height: 100%;
          width: 100%;
        }
        
        button:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}