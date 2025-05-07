// components/dashboard/ModelCard.jsx
import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Image3D } from '../icons/CustomIcons';

export default function ModelCard({ model, onEdit, onGenerateQR }) {
  const router = useRouter();
  
  return (
    <motion.div
      className="model-card"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ 
        height: '160px', 
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Image3D size={48} color="#999" />
      </div>
      
      <div style={{ padding: '15px' }}>
        <h3 style={{ marginBottom: '10px', fontWeight: '500' }}>{model.name || "Unnamed Model"}</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Type: <span style={{ fontWeight: '500' }}>{model.type || "GLB"}</span>
          </p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Added: <span style={{ fontWeight: '500' }}>{new Date(model.createdAt || Date.now()).toLocaleDateString()}</span>
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '15px'
        }}>
          <button
            onClick={() => router.push(`/view/${model.url?.split('/').pop() || model._id}`)}
            style={{
              padding: '6px 12px',
              background: '#e6f7ff',
              color: '#0070f3',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Preview
          </button>
          
          <button
            onClick={() => onEdit(model)}
            style={{
              padding: '6px 12px',
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Edit
          </button>
          
          <button
            onClick={() => onGenerateQR(model._id)}
            style={{
              padding: '6px 12px',
              background: '#fff7ed',
              color: '#f97316',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            QR Code
          </button>
        </div>
      </div>
    </motion.div>
  );
}