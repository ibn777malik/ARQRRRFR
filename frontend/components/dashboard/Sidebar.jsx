// components/dashboard/Sidebar.jsx
import React from 'react';
import { useRouter } from 'next/router';
import { 
  PieChart, LogOut, Settings, Book, BarChart3, Utensils
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ activeSection, setActiveSection }) {
  const router = useRouter();
  
  // Simplified sidebar items without custom icons
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <PieChart size={20} /> },
    { id: 'models', label: 'Models', icon: <Book size={20} /> }, // Using Book icon instead
    { id: 'menus', label: 'Menus', icon: <Utensils size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };

  // Logo animation
  const logoVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Menu item animation
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ 
        width: '250px', 
        background: 'white', 
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <motion.div 
        variants={logoVariants}
        style={{ 
          padding: '20px', 
          borderBottom: '1px solid #eaeaea'
        }}
      >
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Utensils style={{ marginRight: '10px' }} size={24} />
          AR Menu Dashboard
        </h1>
      </motion.div>
      
      <nav style={{ marginTop: '20px', flex: '1' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sidebarItems.map(item => (
            <motion.li
              key={item.id}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <button
                onClick={() => setActiveSection(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px 20px',
                  background: activeSection === item.id ? '#f0f7ff' : 'transparent',
                  color: activeSection === item.id ? '#0070f3' : '#555',
                  border: 'none',
                  borderLeft: activeSection === item.id ? '4px solid #0070f3' : '4px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span style={{ marginRight: '10px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{ padding: '20px', borderTop: '1px solid #eaeaea' }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#e53e3e',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} style={{ marginRight: '8px' }} />
          <span>Logout</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}