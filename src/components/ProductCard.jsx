import React, { useState } from 'react';
import { Package, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function ProductCard({ product, onAddToCart }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const { cart, updateQuantity, removeItem } = useCart();

  const red = '#dc2626';
  const black = '#000000';

  // Check if product is in cart and get quantity
  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  // Get size options from the size array field
  // Handle both array format and potential string format
  let sizeOptions = [];
  if (Array.isArray(product.size)) {
    sizeOptions = product.size;
  } else if (product.sizes && Array.isArray(product.sizes)) {
    sizeOptions = product.sizes;
  } else if (typeof product.size === 'string' && product.size) {
    sizeOptions = product.size.split(',').map(s => s.trim());
  }

  // Debug log to see what we're getting
  if (product.id && (product.size || product.sizes)) {
    console.log('Product size data:', { 
      id: product.id, 
      name: product.name,
      size: product.size, 
      sizes: product.sizes,
      sizeOptions 
    });
  }

  const handleIncrease = (e) => {
    e.stopPropagation();
    if (quantity === 0) {
      onAddToCart(product);
    } else {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (quantity === 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div style={{
        position: 'relative',
        paddingTop: '100%', // 1:1 aspect ratio
        background: '#fafafa',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {product.image_url && !imageError ? (
            <img
              src={product.image_url}
              alt={product.name}
              onError={() => setImageError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <Package size={40} color="#d1d5db" />
          )}
        </div>

        {/* Category Badge - Small tag in corner */}
        {product.category && (
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            padding: '0.25rem 0.5rem',
            borderRadius: '2px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}>
            {product.category}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div style={{
        padding: '0.875rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {/* Brand */}
        {product.brand && (
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: '#6b7280',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}>
            {product.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 style={{
          margin: 0,
          fontSize: '0.875rem',
          fontWeight: 500,
          color: black,
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.6em'
        }}>
          {product.name}
        </h3>

        {/* Size Dropdown - Always show, disabled if no dimensions */}
        <div style={{ marginTop: '0.25rem' }}>
          <select
            value={selectedSize}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedSize(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={sizeOptions.length === 0}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              background: sizeOptions.length === 0 ? '#f3f4f6' : 'white',
              cursor: sizeOptions.length === 0 ? 'not-allowed' : 'pointer',
              outline: 'none',
              fontFamily: 'inherit',
              fontWeight: 500,
              color: selectedSize ? black : '#9ca3af'
            }}
          >
            <option value="">{sizeOptions.length === 0 ? 'No sizes available' : 'Select Size'}</option>
            {sizeOptions.map((size, idx) => (
              <option key={idx} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Price - Only show if available */}
        {product.price && (
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: black
            }}>
              ₹{product.price}
            </span>
            {product.unit && (
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                fontWeight: 500,
                marginLeft: '0.25rem'
              }}>
                / {product.unit}
              </span>
            )}
          </div>
        )}

        {/* Add/Quantity Controls */}
        <div style={{ marginTop: '0.75rem' }}>
          {quantity === 0 ? (
            <button
              onClick={handleIncrease}
              style={{
                width: '100%',
                background: red,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                transition: 'background 0.2s',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
              onMouseLeave={(e) => (e.currentTarget.style.background = red)}
            >
              <Plus size={14} />
              ADD
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fafafa',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                padding: '0.375rem 0.5rem'
              }}
            >
              <button
                onClick={handleDecrease}
                style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: black,
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = black;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = black;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = black;
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                −
              </button>
              <span
                style={{
                  minWidth: '2rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: black
                }}
              >
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                style={{
                  background: black,
                  border: '1px solid ' + black,
                  borderRadius: '2px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  flexShrink: 0,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f2937'}
                onMouseLeave={(e) => e.currentTarget.style.background = black}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
