// components/dashboard/Sidebar.jsx
import React from 'react';
import { useRouter } from 'next/router';
import { 
  PieChart, LogOut, Settings, Book, BarChart3, Utensils
} from 'lucide-react';
import Image3D from '../icons/CustomIcons';
import { motion } from 'framer-motion';
export default function Sidebar({ activeSection, setActiveSection }) {
  const router = useRouter();
  
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <PieChart size={20} /> },
    { id: 'models', label: 'Models', icon: <Image3D size={20} /> },
    { id: 'menus', label: 'Menus', icon: <Book size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div style={{ 
      width: '250px', 
      background: 'white', 
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #eaeaea'
      }}>
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Utensils style={{ marginRight: '10px' }} size={24} />
          AR Menu Dashboard
        </h1>
      </div>
      
      <nav style={{ marginTop: '20px', flex: '1' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sidebarItems.map(item => (
            <motion.li
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: sidebarItems.findIndex(i => i.id === item.id) * 0.1 }}
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
      
      <div style={{ padding: '20px', borderTop: '1px solid #eaeaea' }}>
        <button
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
        </button>
      </div>
    </div>
  );
}