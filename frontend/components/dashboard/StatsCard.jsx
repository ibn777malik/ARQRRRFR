// components/dashboard/StatsCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ icon, label, value, bgColor, iconColor }) {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 15,
        mass: 1
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        delay: 0.2
      }
    },
    hover: {
      rotate: [0, -10, 10, -5, 5, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  const valueVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        delay: 0.3
      }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Background glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.07 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute',
          right: '-20px',
          top: '-20px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: bgColor || '#f0f0f0',
          filter: 'blur(20px)'
        }}
      />

      <motion.div 
        variants={iconVariants}
        style={{
          padding: '15px',
          background: bgColor || '#f0f0f0',
          borderRadius: '10px',
          marginRight: '15px',
          color: iconColor || '#333',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {icon}
      </motion.div>

      <div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            marginBottom: '6px'
          }}
        >
          {label}
        </motion.p>
        
        <motion.h4 
          variants={valueVariants}
          style={{ 
            fontSize: '26px', 
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}
        >
          {/* Animate counting up from 0 to the value */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {value}
          </motion.span>
        </motion.h4>
      </div>
    </motion.div>
  );
}