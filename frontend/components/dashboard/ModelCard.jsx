// components/dashboard/ModelCard.jsx
import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Eye, Settings, QrCode } from 'lucide-react';

export default function ModelCard({ model, onEdit, onGenerateQR }) {
  const router = useRouter();
  
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4
      }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: {
        type: "spring",
        stiffness: 500,
      }
    }
  };
  
  // Button animation variants
  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
  };
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ 
          height: '160px', 
          background: 'linear-gradient(135deg, #f0f7ff 0%, #dbeafe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {/* Model type badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          {model.type || "GLB"}
        </motion.div>
        
        {/* Placeholder model image or icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.3
          }}
          style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: '#0070f3'
          }}
        >
          3D
        </motion.div>
      </motion.div>
      
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ 
            marginBottom: '10px', 
            fontWeight: '600',
            fontSize: '18px',
            color: '#1a202c'
          }}
        >
          {model.name || "Unnamed Model"}
        </motion.h3>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: '10px', flex: 1 }}
        >
          <p style={{ 
            fontSize: '14px', 
            color: '#718096',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{ width: '20px', textAlign: 'center', marginRight: '8px' }}>📅</span>
            <span style={{ fontWeight: '500' }}>
              {new Date(model.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </p>
          
          {model.description && (
            <p style={{ fontSize: '14px', color: '#4a5568', marginTop: '8px' }}>
              {model.description.length > 80 
                ? model.description.substring(0, 80) + "..." 
                : model.description}
            </p>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: 'auto',
            gap: '8px'
          }}
        >
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => router.push(`/view/${model.url?.split('/').pop() || model._id}`)}
            style={{
              flex: 1,
              padding: '10px 0',
              background: '#e6f7ff',
              color: '#0070f3',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <Eye size={16} style={{ marginRight: '5px' }} />
            Preview
          </motion.button>
          
          <motion.button
  variants={buttonVariants}
  whileHover="hover"
  whileTap="tap"
  onClick={() => {
    console.log("Navigating to edit for model:", model._id);
    router.push(`/edit/${model._id}`);
  }}
  style={{
    flex: 1,
    padding: '10px 0',
    background: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    fontSize: '14px'
  }}
>
  <Settings size={16} style={{ marginRight: '5px' }} />
  Edit
</motion.button>
          
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onGenerateQR(model._id)}
            style={{
              flex: 1,
              padding: '10px 0',
              background: '#fff7ed',
              color: '#f97316',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <QrCode size={16} style={{ marginRight: '5px' }} />
            QR
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}