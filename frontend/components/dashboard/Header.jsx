// components/dashboard/Header.jsx
import React from 'react';

export default function Header({ activeSection, searchQuery, setSearchQuery, notifications, markAllNotificationsAsRead }) {
  return (
    <header style={{ 
      background: 'white',
      padding: '15px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      zIndex: 10
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'semibold' }}>
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              marginRight: '15px',
              width: '220px'
            }}
          />
          
          <button 
            onClick={markAllNotificationsAsRead}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              padding: '5px',
              marginRight: '15px',
              cursor: 'pointer'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#555" />
            </svg>
            {notifications.some(n => !n.read) && (
              <span style={{
                position: 'absolute',
                top: '3px',
                right: '3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#e53e3e'
              }}></span>
            )}
          </button>
          
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#0070f3',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            AM
          </div>
        </div>
      </div>
    </header>
  );
}