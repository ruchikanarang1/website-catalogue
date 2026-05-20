import React, { useState, useEffect } from 'react';
import { X, Package, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function ProductModal({ isOpen, onClose, product }) {
  const { addBulkItems } = useCart();
  const [rows, setRows] = useState([]);
  const [hasSpecs, setHasSpecs] = useState(false);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = product ? [product.image_url, ...(product.images || [])].filter(Boolean) : [];

  // Initialize rows based on product sizes and variants
  useEffect(() => {
    if (isOpen && product) {
      let sizeOptions = [];
      let variantsMap = {};
      let specsFound = false;

      if (product.size_variants && Array.isArray(product.size_variants) && product.size_variants.length > 0) {
        sizeOptions = product.size_variants.map(v => v.size);
        product.size_variants.forEach(v => {
           variantsMap[v.size] = { weight: v.weight, dimensions: v.dimensions };
           if (v.weight || v.dimensions) specsFound = true;
        });
      } else if (Array.isArray(product.size)) {
        sizeOptions = product.size;
      } else if (product.sizes && Array.isArray(product.sizes)) {
        sizeOptions = product.sizes;
      } else if (typeof product.size === 'string' && product.size) {
        sizeOptions = product.size.split(',').map(s => s.trim());
      }

      setHasSpecs(specsFound);

      if (sizeOptions.length === 0) {
        setRows([{ size: '', quantity: 0, unit: 'pieces', weight: '', dimensions: '' }]);
      } else {
        setRows(sizeOptions.map(size => ({ 
          size, 
          quantity: 0, 
          unit: 'pieces',
          weight: variantsMap[size]?.weight || '',
          dimensions: variantsMap[size]?.dimensions || ''
        })));
      }
    }
  }, [isOpen, product]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const updateRowQuantity = (index, qty) => {
    setRows(prev => {
      const newRows = [...prev];
      newRows[index].quantity = Math.max(0, qty);
      return newRows;
    });
  };

  const updateRowUnit = (index, unit) => {
    setRows(prev => {
      const newRows = [...prev];
      newRows[index].unit = unit;
      return newRows;
    });
  };

  const handleAddToCart = () => {
    const itemsToAdd = rows
      .filter(row => row.quantity > 0)
      .map(row => ({
        product,
        size: row.size,
        quantity: row.quantity,
        unit: row.unit
      }));

    if (itemsToAdd.length > 0) {
      addBulkItems(itemsToAdd);
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end', /* Bottom aligned on mobile */
        justifyContent: 'center',
        padding: window.innerWidth <= 768 ? '0' : '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: window.innerWidth <= 768 ? '16px 16px 0 0' : '8px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: window.innerWidth <= 768 ? '85vh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827', textTransform: 'uppercase' }}>
            Product Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Product Info Summary */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid #e5e7eb' }}>
           <div style={{ display: 'flex', gap: '1rem' }}>
             <div 
               onClick={() => {
                 if (allImages.length > 0) {
                   setCurrentImageIndex(0);
                   setIsCarouselOpen(true);
                 }
               }}
               style={{
                 width: '110px', height: '110px', borderRadius: '6px', overflow: 'hidden', background: '#f8fafc', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: allImages.length > 0 ? 'pointer' : 'default'
               }}
             >
               {product.image_url ? (
                 <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.25rem' }} />
               ) : (
                 <Package size={40} color="#94a3b8" />
               )}
             </div>
             <div style={{ flex: 1 }}>
               <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', lineHeight: '1.2' }}>{product.name}</h3>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                 <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                   {product.category}
                 </span>
                 {product.brand && (
                   <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                     {product.brand}
                   </span>
                 )}
               </div>
               <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#dc2626' }}>
                 {product.price ? `₹${product.price}` : 'Request Quote'} {product.price && product.unit ? `/ ${product.unit}` : ''}
               </p>
             </div>
           </div>

           {/* Description */}
           {product.description && (
             <div style={{ 
               fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', 
               background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px',
               borderLeft: '3px solid #cbd5e1'
             }}>
               {product.description}
             </div>
           )}
        </div>

        {/* Table Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Available Sizes & Specs</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Size</th>
                {hasSpecs && <th style={{ paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Specs</th>}
                <th style={{ paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Qty</th>
                <th style={{ paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    {row.size || 'Std'}
                  </td>
                  {hasSpecs && (
                    <td style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#64748b' }}>
                      {row.weight && <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 600 }}>Wt:</span> {row.weight}</div>}
                      {row.dimensions && <div><span style={{ fontWeight: 600 }}>Dim:</span> {row.dimensions}</div>}
                    </td>
                  )}
                  <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      value={row.quantity === 0 ? '' : row.quantity}
                      placeholder="0"
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updateRowQuantity(idx, isNaN(val) ? 0 : val);
                      }}
                      style={{
                        width: '60px',
                        padding: '0.4rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        fontWeight: 600
                      }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <select
                      value={row.unit}
                      onChange={(e) => updateRowUnit(idx, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        outline: 'none',
                        background: 'white',
                        fontFamily: 'inherit',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}
                    >
                      <option value="pieces">Pcs</option>
                      <option value="bundles">Bdl</option>
                      <option value="kgs">Kgs</option>
                      <option value="MT">MT</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>
            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={totalQuantity === 0}
            style={{
              background: totalQuantity === 0 ? '#cbd5e1' : '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: 700,
              cursor: totalQuantity === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
              boxShadow: totalQuantity > 0 ? '0 4px 12px rgba(220, 38, 38, 0.3)' : 'none'
            }}
          >
            <ShoppingCart size={18} />
            Add To Cart
          </button>
        </div>
      </div>

      {/* Image Carousel Overlay */}
      {isCarouselOpen && (
        <div 
          onClick={() => setIsCarouselOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)', zIndex: 100000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <button 
            onClick={() => setIsCarouselOpen(false)}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
          
          <img 
            src={allImages[currentImageIndex]} 
            alt={`${product.name} - ${currentImageIndex + 1}`} 
            style={{ maxWidth: '95vw', maxHeight: '80vh', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()} 
          />

          {allImages.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1); }}
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1); }}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
              >
                <ChevronRight size={24} />
              </button>
              <div style={{ position: 'absolute', bottom: '2rem', color: 'white', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '20px' }}>
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
