// components/dashboard/QuickActions.jsx
import React from 'react';
import { useRouter } from 'next/router';
import { Upload, ChefHat, BarChart3, QrCode } from 'lucide-react';

export default function QuickActions({ setActiveSection }) {
  const router = useRouter();
  
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
        Quick Actions
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
      }}>
        <button 
          onClick={() => router.push('/upload')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            background: '#f0f7ff',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Upload size={24} color="#0070f3" style={{ marginBottom: '8px' }} />
          <span style={{ fontWeight: 'medium', fontSize: '14px' }}>Upload Model</span>
        </button>
        
        <button 
          onClick={() => router.push('/menu-editor')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            background: '#e6ffef',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ChefHat size={24} color="#10b981" style={{ marginBottom: '8px' }} />
          <span style={{ fontWeight: 'medium', fontSize: '14px' }}>Create Menu</span>
        </button>
        
        <button 
          onClick={() => setActiveSection('analytics')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            background: '#f3e8ff',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <BarChart3 size={24} color="#8b5cf6" style={{ marginBottom: '8px' }} />
          <span style={{ fontWeight: 'medium', fontSize: '14px' }}>View Analytics</span>
        </button>
        
        <button 
          onClick={() => setActiveSection('models')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            background: '#fff7ed',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <QrCode size={24} color="#f97316" style={{ marginBottom: '8px' }} />
          <span style={{ fontWeight: 'medium', fontSize: '14px' }}>Generate QR</span>
        </button>
      </div>
    </div>
  );
}