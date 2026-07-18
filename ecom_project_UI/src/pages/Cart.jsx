import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingBag, FaArrowRight, FaArrowLeft, FaCheckCircle, FaCar } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { productService } from '../services/api';
import './Cart.css';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useContext(CartContext);

  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // 'idle' | 'processing' | 'success'
  const [orderId, setOrderId] = useState('');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    setCheckoutStatus('processing');
    
    // Simulate premium payment processing
    setTimeout(() => {
      const generatedOrderId = `AV-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedOrderId);
      setCheckoutStatus('success');
      clearCart(); // clear global cart items
    }, 2000);
  };

  // Derived calculations
  const subtotal = getCartTotal();
  const taxRate = 0.18; // 18% GST for automobiles in India
  const tax = subtotal * taxRate;
  const deliveryCharges = subtotal > 1500000 ? 0 : 50000; // Free transport for bookings above 15L
  const grandTotal = subtotal + tax + deliveryCharges;

  if (checkoutStatus === 'processing') {
    return (
      <div className="checkout-processing-container glass-panel">
        <div className="spinner"></div>
        <h2>Processing Secure Reservation</h2>
        <p className="text-secondary">Authorizing payment gateway. Please do not close or refresh this page...</p>
      </div>
    );
  }

  if (checkoutStatus === 'success') {
    return (
      <div className="checkout-success-container glass-panel animate-scaleIn">
        <FaCheckCircle className="success-check-icon" />
        <h1 className="glow-text-cyan">Booking Confirmed!</h1>
        <p className="order-id-banner">
          Order ID: <strong>{orderId}</strong>
        </p>
        <p className="success-message text-secondary">
          Congratulations! Your premium vehicle reservation is successfully registered. 
          A sales representative from our elite dealership will contact you within 24 hours 
          to schedule delivery and final registration paperwork.
        </p>
        <div className="success-delivery-info">
          <span>Estimated Delivery Date:</span>
          <strong>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</strong>
        </div>
        <Link to="/" className="btn btn-primary return-home-btn">
          <FaCar /> Return to Showroom
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-container glass-panel">
        <FaShoppingBag className="empty-cart-icon text-muted" />
        <h2>Your Showroom Cart is Empty</h2>
        <p className="text-secondary">Explore our premium fleet and add luxury vehicles to your cart.</p>
        <Link to="/" className="btn btn-primary start-shopping-btn">
          Explore Fleet
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container animate-fadeIn">
      <h1 className="cart-page-title">Shopping Cart</h1>
      
      <div className="cart-content-layout">
        {/* Left Column: Cart Items */}
        <div className="cart-items-column">
          {cartItems.map((item) => {
            const product = item.product;
            const isOutOfStock = product.quantity <= 0;
            return (
              <div key={product.id} className="cart-item-card glass-panel">
                {/* Image Section */}
                <div className="cart-item-image-wrapper">
                  {product.imageName ? (
                    <img
                      src={productService.getProductImageUrl(product.id)}
                      alt={product.name}
                      className="cart-item-image"
                    />
                  ) : (
                    <div className="cart-item-image-placeholder">
                      <span className="cart-placeholder-brand">{product.brand}</span>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="cart-item-details">
                  <div className="cart-item-header">
                    <div>
                      <span className="cart-item-brand">{product.brand}</span>
                      <h3 className="cart-item-name">
                        <Link to={`/product/${product.id}`}>{product.name}</Link>
                      </h3>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="btn btn-secondary btn-icon-only remove-item-btn"
                      title="Remove from Cart"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="cart-item-footer">
                    {/* Quantity Picker */}
                    <div className="qty-picker">
                      <button
                        onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                        className="qty-btn"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                        className="qty-btn"
                        disabled={item.quantity >= product.quantity}
                      >
                        +
                      </button>
                    </div>

                    {/* Price Calculations */}
                    <div className="cart-item-prices">
                      <span className="price-unit text-muted">
                        {formatPrice(product.price)} each
                      </span>
                      <span className="price-subtotal">
                        {formatPrice(product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Link to="/" className="continue-shopping-link">
            <FaArrowLeft /> <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Right Column: Order Summary */}
        <div className="cart-summary-column glass-panel">
          <h2 className="summary-title">Summary</h2>
          
          <div className="summary-rows">
            <div className="summary-row">
              <span className="summary-row-label">Base Showroom Price</span>
              <span className="summary-row-val">{formatPrice(subtotal)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-row-label">GST Registration Tax (18%)</span>
              <span className="summary-row-val">{formatPrice(tax)}</span>
            </div>

            <div className="summary-row">
              <span className="summary-row-label">Dealership Handling & Transport</span>
              <span className="summary-row-val">
                {deliveryCharges === 0 ? (
                  <span className="badge badge-success">Free Delivery</span>
                ) : (
                  formatPrice(deliveryCharges)
                )}
              </span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row grand-total-row">
              <span className="grand-total-label">Total Booking Amount</span>
              <span className="grand-total-val">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button onClick={handleCheckout} className="btn btn-primary checkout-btn">
            <span>Proceed to Reservation</span>
            <FaArrowRight />
          </button>
          
          <p className="checkout-disclaimer text-muted">
            * By clicking reservation, you agree to book the vehicle. Tax and shipping charges are simulated calculations and will be finalized at dealership handover.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
