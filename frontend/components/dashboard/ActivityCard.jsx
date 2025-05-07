// components/dashboard/ActivityCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Clock } from 'lucide-react';

export default function ActivityCard({ notifications }) {
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  // Title animation variants
  const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };

  // Notification item animation variants
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300, 
        damping: 20
      }
    },
    hover: {
      backgroundColor: "#f9fafb",
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  // Animation for empty state
  const emptyVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        delay: 0.3,
        type: "spring",
        stiffness: 300
      }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <motion.div 
        variants={titleVariants}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}
      >
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Bell size={18} />
          Recent Activity
        </h3>
        
        {notifications.length > 0 && (
          <motion.span
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              fontSize: '12px',
              color: '#0070f3',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Check size={14} />
            Mark all as read
          </motion.span>
        )}
      </motion.div>

      {notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {notifications.map((notification, index) => (
            <motion.div 
              key={notification.id}
              custom={index}
              variants={itemVariants}
              whileHover="hover"
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: notification.read ? '#f5f5f5' : '#f0f7ff',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Animated highlight for unread notifications */}
              {!notification.read && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  style={{
                    position: 'absolute',
                    height: '3px',
                    background: 'linear-gradient(90deg, #0070f3, #00a1ff)',
                    bottom: 0,
                    left: 0,
                    borderRadius: '0 4px 4px 0'
                  }}
                />
              )}
              
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: notification.read ? '#d1d5db' : '#0070f3',
                  marginRight: '12px',
                  marginTop: '6px',
                  flexShrink: 0
                }}></div>
                
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontSize: '14px', 
                    color: notification.read ? '#4b5563' : '#111827',
                    fontWeight: notification.read ? '400' : '500',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {notification.message}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginTop: '6px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    <span>Just now</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={emptyVariants}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            flex: 1,
            color: '#9ca3af',
            textAlign: 'center'
          }}
        >
          <Bell size={32} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ margin: 0 }}>No recent activity to display</p>
        </motion.div>
      )}
    </motion.div>
  );
}