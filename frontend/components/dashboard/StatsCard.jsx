// components/dashboard/StatsCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ icon, label, value, bgColor, iconColor }) {
  return (
    <motion.div 
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          padding: '10px',
          background: bgColor || '#f0f0f0',
          borderRadius: '8px',
          marginRight: '15px',
          color: iconColor || '#333'
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: '14px', color: '#666' }}>{label}</p>
          <h4 style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</h4>
        </div>
      </div>
    </motion.div>
  );
}