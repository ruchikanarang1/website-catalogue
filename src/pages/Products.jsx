import React, { useState, useEffect } from 'react';
import { Search, Package, Loader2, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const companyId = detectCompanyFromDomain();
  const { addItem } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price-low', 'price-high'

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const loadProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', companyId);

      if (error) {
        console.error('Failed to load products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    loadProducts();
  }, [companyId]);

  // Extract unique categories and brands
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const brands = ['All', ...new Set(products.map(p => p.brand).filter(Boolean))];

  // Filter and sort products
  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      const matchesSearch = p.name?.toLowerCase().includes(q) || 
                           p.category?.toLowerCase().includes(q) ||
                           p.brand?.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      } else if (sortBy === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });

  const red = '#dc2626';
  const black = '#000000';

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', paddingTop: '80px' }}>
      {/* Filters Bar */}
      <div style={{
        background: '#fafafa',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.25rem 2rem',
        position: 'sticky',
        top: '80px',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Search */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '0.5rem 0.75rem',
              flex: '1 1 250px',
              minWidth: '200px'
            }}>
              <Search size={16} color="#6b7280" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '0.875rem',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                whiteSpace: 'nowrap'
              }}>
                Category:
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontWeight: 500
                }}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                whiteSpace: 'nowrap'
              }}>
                Brand:
              </label>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontWeight: 500
                }}
              >
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <label style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                whiteSpace: 'nowrap'
              }}>
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontWeight: 500
                }}
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== 'All' || selectedBrand !== 'All' || search) && (
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '0.8125rem',
                color: '#6b7280',
                fontWeight: 500
              }}>
                Active filters:
              </span>
              {search && (
                <span style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.8125rem',
                  fontWeight: 500
                }}>
                  Search: "{search}"
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.8125rem',
                  fontWeight: 500
                }}>
                  Category: {selectedCategory}
                </span>
              )}
              {selectedBrand !== 'All' && (
                <span style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.8125rem',
                  fontWeight: 500
                }}>
                  Brand: {selectedBrand}
                </span>
              )}
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: red,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '0.25rem'
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Results Count */}
        <div style={{
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          fontWeight: 500
        }}>
          Showing {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#9ca3af'
          }}>
            <Loader2
              size={32}
              style={{
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
              }}
            />
            <p>Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '6rem 2rem',
            color: '#9ca3af'
          }}>
            <Package size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <h3 style={{ color: '#6b7280', fontWeight: 600, fontSize: '1.125rem' }}>No products found</h3>
            <p style={{ fontSize: '0.9375rem', marginTop: '0.5rem' }}>
              {search || selectedCategory !== 'All' || selectedBrand !== 'All'
                ? 'Try adjusting your filters'
                : 'No products available at the moment'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.25rem'
            }}
            className="products-grid"
          >
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addItem(product)}
              />
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Mobile: 2 columns */
        @media (max-width: 767px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
        }

        /* Tablet: 3 columns */
        @media (min-width: 768px) and (max-width: 1023px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        /* Desktop: 4-5 columns */
        @media (min-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  );
}
