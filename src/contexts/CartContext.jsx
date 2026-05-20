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
          // Normalize old cart items to have cartItemId if they don't
          let parsed = JSON.parse(savedCart);
          parsed = parsed.map(item => {
            if (!item.cartItemId) {
               return { ...item, cartItemId: item.selectedSize ? `${item.id}-${item.selectedSize}` : item.id };
            }
            return item;
          });
          setCart(parsed);
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
   */
  const addItem = (product, size = null, quantity = 1, unit = 'pieces') => {
    const cartItemId = size ? `${product.id}-${size}` : product.id;
    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        // Increment quantity
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prev, { ...product, cartItemId, selectedSize: size, selectedUnit: unit, quantity }];
      }
    });
  };

  /**
   * Add multiple items at once from the bulk modal table
   */
  const addBulkItems = (items) => {
    setCart((prev) => {
      let newCart = [...prev];
      items.forEach(({ product, size, quantity, unit }) => {
        if (quantity <= 0) return;
        const cartItemId = size ? `${product.id}-${size}` : product.id;
        const existingIdx = newCart.findIndex((item) => item.cartItemId === cartItemId);
        if (existingIdx >= 0) {
          newCart[existingIdx] = { ...newCart[existingIdx], quantity: newCart[existingIdx].quantity + quantity };
        } else {
          newCart.push({ ...product, cartItemId, selectedSize: size, selectedUnit: unit, quantity });
        }
      });
      return newCart;
    });
  };

  /**
   * Update quantity of an item in cart
   */
  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  /**
   * Update unit of an item in cart
   */
  const updateUnit = (cartItemId, unit) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, selectedUnit: unit } : item
      )
    );
  };

  /**
   * Remove item from cart
   */
  const removeItem = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => {
    setIsOpen(true);
  };

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
    addBulkItems,
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
