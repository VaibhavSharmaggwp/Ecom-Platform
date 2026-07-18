import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load cart from localStorage if exists
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('autovibe_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('autovibe_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        // Check if there is enough stock (quantity in database represents stock)
        const newQty = updatedItems[existingItemIndex].quantity + qty;
        if (newQty <= product.quantity) {
          updatedItems[existingItemIndex].quantity = newQty;
        } else {
          updatedItems[existingItemIndex].quantity = product.quantity; // limit to stock
        }
        return updatedItems;
      } else {
        // Limit initial quantity to stock
        const initialQty = qty <= product.quantity ? qty : product.quantity;
        return [...prevItems, { product, quantity: initialQty }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  // Update item quantity
  const updateCartQuantity = (productId, newQty) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId) {
          // Clamp quantity between 1 and product stock
          const clampedQty = Math.max(1, Math.min(newQty, item.product.quantity));
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total items
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate subtotal
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
