import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectCompanyFromDomain } from '../lib/domainDetection';

const CartContext = createContext({});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const companyId = detectCompanyFromDomain();
    if (companyId) {
      const storageKey = `cart_${companyId}`;
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (err) {
          console.error('Failed to parse saved cart:', err);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const companyId = detectCompanyFromDomain();
    if (companyId) {
      const storageKey = `cart_${companyId}`;
      localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart]);

  /**
   * Add item to cart (or increment quantity if already exists)
   * @param {Object} product - Product to add
   */
  const addItem = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // Increment quantity
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with quantity 1
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  /**
   * Update quantity of an item in cart
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity (0 to remove)
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  /**
   * Update unit of an item in cart
   * @param {string} productId - Product ID
   * @param {string} unit - New unit (pieces, bundles, kgs)
   */
  const updateUnit = (productId, unit) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, selectedUnit: unit } : item
      )
    );
  };

  /**
   * Remove item from cart
   * @param {string} productId - Product ID to remove
   */
  const removeItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * Open cart drawer
   */
  const openCart = () => {
    setIsOpen(true);
  };

  /**
   * Close cart drawer
   */
  const closeCart = () => {
    setIsOpen(false);
  };

  // Calculate total price
  const total = cart.reduce((sum, item) => {
    const price = item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // Calculate total item count
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cart,
    isOpen,
    addItem,
    updateQuantity,
    updateUnit,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    total,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
