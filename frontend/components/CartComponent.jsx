import React, { useState, useEffect } from 'react';

export default function CartComponent({ cart, onRemoveItem, onUpdateQuantity, onCheckout }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Calculate total whenever cart changes
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      return sum + (item.price * (item.quantity || 1));
    }, 0);
    setTotal(newTotal);
  }, [cart]);
  
  // Function to handle quantity changes
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    onUpdateQuantity(itemId, newQuantity);
  };
  
  // Toggle cart expanded state
  const toggleCart = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Render empty cart
  if (cart.length === 0) {
    return (
      <div style={styles.cartContainer}>
        <div style={styles.cartHeader} onClick={toggleCart}>
          <h3 style={styles.cartTitle}>Your Order (0 items)</h3>
          <span style={styles.cartTotal}>$0.00</span>
        </div>
        
        <div style={{...styles.cartBody, display: isExpanded ? 'block' : 'none'}}>
          <p style={styles.emptyCartMessage}>Your cart is empty. Add some delicious items!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.cartContainer}>
      <div style={styles.cartHeader} onClick={toggleCart}>
        <h3 style={styles.cartTitle}>
          Your Order ({cart.reduce((count, item) => count + (item.quantity || 1), 0)} items)
        </h3>
        <span style={styles.cartTotal}>${total.toFixed(2)}</span>
      </div>
      
      <div style={{...styles.cartBody, display: isExpanded ? 'block' : 'none'}}>
        {cart.map((item) => (
          <div key={item.id} style={styles.cartItem}>
            <div style={styles.itemInfo}>
              <h4 style={styles.itemName}>{item.name}</h4>
              <p style={styles.itemPrice}>${(item.price * (item.quantity || 1)).toFixed(2)}</p>
            </div>
            
            <div style={styles.itemControls}>
              <button 
                style={styles.quantityButton}
                onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
              >
                -
              </button>
              
              <span style={styles.quantity}>{item.quantity || 1}</span>
              
              <button 
                style={styles.quantityButton}
                onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
              >
                +
              </button>
              
              <button 
                style={styles.removeButton}
                onClick={() => onRemoveItem(item.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
        
        <div style={styles.cartFooter}>
          <div style={styles.totalRow}>
            <span>Subtotal:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <div style={styles.totalRow}>
            <span>Tax (8%):</span>
            <span>${(total * 0.08).toFixed(2)}</span>
          </div>
          
          <div style={styles.grandTotal}>
            <span>Total:</span>
            <span>${(total * 1.08).toFixed(2)}</span>
          </div>
          
          <button 
            style={styles.checkoutButton}
            onClick={onCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  cartContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    borderTopLeftRadius: '15px',
    borderTopRightRadius: '15px',
    zIndex: 1000,
    maxHeight: '80vh',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
  },
  cartTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600
  },
  cartTotal: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0070f3'
  },
  cartBody: {
    padding: '15px 20px',
    maxHeight: 'calc(80vh - 60px)',
    overflowY: 'auto'
  },
  emptyCartMessage: {
    textAlign: 'center',
    color: '#666',
    padding: '20px 0'
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    margin: '0 0 5px 0',
    fontSize: '16px'
  },
  itemPrice: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  itemControls: {
    display: 'flex',
    alignItems: 'center'
  },
  quantityButton: {
    width: '30px',
    height: '30px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    fontSize: '16px',
    cursor: 'pointer'
  },
  quantity: {
    padding: '0 10px',
    fontSize: '16px'
  },
  removeButton: {
    marginLeft: '10px',
    width: '30px',
    height: '30px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: '#ff4d4f',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer'
  },
  cartFooter: {
    marginTop: '15px',
    borderTop: '1px solid #eee',
    paddingTop: '15px'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '5px 0',
    fontSize: '14px',
    color: '#666'
  },
  grandTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '10px 0',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  checkoutButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  }
};