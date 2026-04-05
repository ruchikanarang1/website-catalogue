import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

// Mock domainDetection
vi.mock('../lib/domainDetection', () => ({
  detectCompanyFromDomain: () => 'test-company-id',
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

  describe('addItem', () => {
    it('adds new item to empty cart with quantity 1', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
        unit: 'kg',
      };

      act(() => {
        result.current.addItem(product);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0]).toEqual({ ...product, quantity: 1 });
      expect(result.current.itemCount).toBe(1);
    });

    it('increments quantity when adding existing item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
      };

      act(() => {
        result.current.addItem(product);
        result.current.addItem(product);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(2);
      expect(result.current.itemCount).toBe(2);
    });
  });

  describe('updateQuantity', () => {
    it('updates item quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
      };

      act(() => {
        result.current.addItem(product);
        result.current.updateQuantity('prod-1', 5);
      });

      expect(result.current.cart[0].quantity).toBe(5);
      expect(result.current.itemCount).toBe(5);
    });

    it('removes item when quantity is set to 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
      };

      act(() => {
        result.current.addItem(product);
        result.current.updateQuantity('prod-1', 0);
      });

      expect(result.current.cart).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
    });

    it('removes item when quantity is negative', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
      };

      act(() => {
        result.current.addItem(product);
        result.current.updateQuantity('prod-1', -1);
      });

      expect(result.current.cart).toHaveLength(0);
    });
  });

  describe('removeItem', () => {
    it('removes item from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product1 = { id: 'prod-1', name: 'Product 1', price: 100 };
      const product2 = { id: 'prod-2', name: 'Product 2', price: 200 };

      act(() => {
        result.current.addItem(product1);
        result.current.addItem(product2);
        result.current.removeItem('prod-1');
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].id).toBe('prod-2');
    });
  });

  describe('clearCart', () => {
    it('removes all items from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product1 = { id: 'prod-1', name: 'Product 1', price: 100 };
      const product2 = { id: 'prod-2', name: 'Product 2', price: 200 };

      act(() => {
        result.current.addItem(product1);
        result.current.addItem(product2);
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.total).toBe(0);
    });
  });

  describe('total', () => {
    it('calculates total price correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product1 = { id: 'prod-1', name: 'Product 1', price: 100 };
      const product2 = { id: 'prod-2', name: 'Product 2', price: 200 };

      act(() => {
        result.current.addItem(product1);
        result.current.addItem(product1); // quantity 2
        result.current.addItem(product2); // quantity 1
      });

      // (100 * 2) + (200 * 1) = 400
      expect(result.current.total).toBe(400);
    });

    it('handles products without price', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product1 = { id: 'prod-1', name: 'Product 1', price: 100 };
      const product2 = { id: 'prod-2', name: 'Product 2' }; // no price

      act(() => {
        result.current.addItem(product1);
        result.current.addItem(product2);
      });

      // Only product1 contributes to total
      expect(result.current.total).toBe(100);
    });
  });

  describe('itemCount', () => {
    it('calculates total item count correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product1 = { id: 'prod-1', name: 'Product 1', price: 100 };
      const product2 = { id: 'prod-2', name: 'Product 2', price: 200 };

      act(() => {
        result.current.addItem(product1);
        result.current.addItem(product1);
        result.current.addItem(product1); // quantity 3
        result.current.addItem(product2); // quantity 1
      });

      expect(result.current.itemCount).toBe(4);
    });
  });

  describe('localStorage persistence', () => {
    it('saves cart to localStorage', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product = { id: 'prod-1', name: 'Product 1', price: 100 };

      act(() => {
        result.current.addItem(product);
      });

      const saved = JSON.parse(
        localStorageMock.getItem('cart_test-company-id')
      );
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('prod-1');
    });

    it('loads cart from localStorage on mount', () => {
      const savedCart = [
        { id: 'prod-1', name: 'Product 1', price: 100, quantity: 2 },
      ];
      localStorageMock.setItem(
        'cart_test-company-id',
        JSON.stringify(savedCart)
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(2);
      expect(result.current.itemCount).toBe(2);
    });
  });

  describe('cart drawer', () => {
    it('opens and closes cart drawer', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.openCart();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeCart();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });
});
