// components/dashboard/ActivityCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function ActivityCard({ notifications }) {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold',
        marginBottom: '15px' 
      }}>
        Recent Activity
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.map((notification, index) => (
          <motion.div 
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              padding: '12px',
              borderRadius: '6px',
              background: notification.read ? '#f5f5f5' : '#f0f7ff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: notification.read ? '#d1d5db' : '#0070f3',
                marginRight: '10px'
              }}></div>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>{notification.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}