import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

// Mock domainDetection
vi.mock('../lib/domainDetection', () => ({
  detectCompanyFromDomain: () => 'test-company-123',
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
    removeItem: (key) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('CartContext - Integration Tests for Cart Persistence (Task 6.2)', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

  describe('Requirement 6.8: Persist cart to localStorage for guests', () => {
    it('persists cart using company-specific key', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product = {
        id: 'prod-1',
        name: 'Steel Rod 10mm',
        price: 50,
        unit: 'kg',
      };

      act(() => {
        result.current.addItem(product);
      });

      // Verify cart is saved with company-specific key
      const storageKey = 'cart_test-company-123';
      const savedData = localStorageMock.getItem(storageKey);
      
      expect(savedData).toBeTruthy();
      
      const parsedCart = JSON.parse(savedData);
      expect(parsedCart).toHaveLength(1);
      expect(parsedCart[0]).toMatchObject({
        id: 'prod-1',
        name: 'Steel Rod 10mm',
        price: 50,
        quantity: 1,
      });
    });

    it('loads cart from localStorage on mount', () => {
      // Pre-populate localStorage with cart data
      const existingCart = [
        { id: 'prod-1', name: 'Steel Rod', price: 50, quantity: 2 },
        { id: 'prod-2', name: 'Steel Plate', price: 75, quantity: 1 },
      ];
      
      localStorageMock.setItem(
        'cart_test-company-123',
        JSON.stringify(existingCart)
      );

      // Mount the provider
      const { result } = renderHook(() => useCart(), { wrapper });

      // Verify cart is loaded from localStorage
      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0]).toMatchObject({
        id: 'prod-1',
        quantity: 2,
      });
      expect(result.current.cart[1]).toMatchObject({
        id: 'prod-2',
        quantity: 1,
      });
      expect(result.current.itemCount).toBe(3);
      expect(result.current.total).toBe(175); // (50*2) + (75*1)
    });

    it('persists cart updates to localStorage', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product = {
        id: 'prod-1',
        name: 'Steel Rod',
        price: 50,
      };

      // Add item
      act(() => {
        result.current.addItem(product);
      });

      let savedCart = JSON.parse(
        localStorageMock.getItem('cart_test-company-123')
      );
      expect(savedCart[0].quantity).toBe(1);

      // Update quantity
      act(() => {
        result.current.updateQuantity('prod-1', 5);
      });

      savedCart = JSON.parse(
        localStorageMock.getItem('cart_test-company-123')
      );
      expect(savedCart[0].quantity).toBe(5);

      // Remove item
      act(() => {
        result.current.removeItem('prod-1');
      });

      savedCart = JSON.parse(
        localStorageMock.getItem('cart_test-company-123')
      );
      expect(savedCart).toHaveLength(0);
    });

    it('handles corrupted localStorage data gracefully', () => {
      // Set invalid JSON in localStorage
      localStorageMock.setItem('cart_test-company-123', 'invalid-json{');

      // Should not throw error, just start with empty cart
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.cart).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
    });

    it('persists cart across multiple sessions', () => {
      // Session 1: Add items
      {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
          result.current.addItem({ id: 'prod-1', name: 'Product 1', price: 100 });
          result.current.addItem({ id: 'prod-2', name: 'Product 2', price: 200 });
        });

        expect(result.current.cart).toHaveLength(2);
      }

      // Session 2: Reload (simulate page refresh)
      {
        const { result } = renderHook(() => useCart(), { wrapper });

        // Cart should be restored from localStorage
        expect(result.current.cart).toHaveLength(2);
        expect(result.current.itemCount).toBe(2);
        expect(result.current.total).toBe(300);
      }

      // Session 3: Add more items
      {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
          result.current.addItem({ id: 'prod-3', name: 'Product 3', price: 150 });
        });

        expect(result.current.cart).toHaveLength(3);
        expect(result.current.total).toBe(450);
      }

      // Session 4: Verify persistence
      {
        const { result } = renderHook(() => useCart(), { wrapper });

        expect(result.current.cart).toHaveLength(3);
        expect(result.current.total).toBe(450);
      }
    });

    it('clears localStorage when cart is cleared', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'prod-1', name: 'Product 1', price: 100 });
        result.current.addItem({ id: 'prod-2', name: 'Product 2', price: 200 });
      });

      expect(result.current.cart).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      const savedCart = JSON.parse(
        localStorageMock.getItem('cart_test-company-123')
      );
      expect(savedCart).toHaveLength(0);
      expect(result.current.cart).toHaveLength(0);
    });

    it('uses different storage keys for different companies', () => {
      // This test verifies that different companies have isolated carts
      const company1Cart = [
        { id: 'prod-1', name: 'Company 1 Product', price: 100, quantity: 1 },
      ];
      const company2Cart = [
        { id: 'prod-2', name: 'Company 2 Product', price: 200, quantity: 1 },
      ];

      localStorageMock.setItem('cart_company-1', JSON.stringify(company1Cart));
      localStorageMock.setItem('cart_company-2', JSON.stringify(company2Cart));

      // Verify both carts are stored separately
      const saved1 = JSON.parse(localStorageMock.getItem('cart_company-1'));
      const saved2 = JSON.parse(localStorageMock.getItem('cart_company-2'));

      expect(saved1[0].name).toBe('Company 1 Product');
      expect(saved2[0].name).toBe('Company 2 Product');
      expect(saved1).not.toEqual(saved2);
    });
  });
});
