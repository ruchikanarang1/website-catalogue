import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Shield, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const companyId = detectCompanyFromDomain();
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!companyId) return;

      const [{ data: products }, { data: comp }] = await Promise.all([
        supabase.from('products').select('*').eq('company_id', companyId).limit(6),
        supabase.from('companies').select('*').eq('id', companyId).single()
      ]);
      setFeaturedProducts(products || []);
      setCompany(comp);
    };

    loadData();
  }, [companyId]);

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Hero + Trust Indicators Combined - 25vh */}
      <section style={{
        height: '25vh',
        minHeight: '280px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '5rem 2rem 1rem'
      }}>
        {/* Hero Content */}
        <div style={{
          textAlign: 'center',
          flex: '0 0 auto',
          marginBottom: '1.5rem'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 700,
              margin: '0 0 0.75rem',
              lineHeight: 1.1,
              color: '#000',
              letterSpacing: '-0.02em'
            }}>
              {company?.name || 'Premium Steel Products'}
            </h1>
            <p style={{
              fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
              margin: '0 0 1.25rem',
              color: '#6b7280',
              lineHeight: 1.4,
              fontWeight: 400
            }}>
              {company?.website_description || 'Quality steel and industrial products for all your construction and manufacturing needs'}
            </p>
            <div style={{
              display: 'flex',
              gap: '0.875rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link
                to="/products"
                style={{
                  background: '#dc2626',
                  color: 'white',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  border: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#b91c1c';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View Products <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                style={{
                  background: 'white',
                  color: '#000',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#000';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1.5rem',
          flex: '1 1 auto'
        }}>
          {[
            { icon: Clock, title: '20+ Years', desc: 'Experience' },
            { icon: Shield, title: 'Trusted', desc: '1000+ Clients' },
            { icon: Award, title: 'High Quality', desc: 'Certified' },
            { icon: TrendingUp, title: 'Fast Delivery', desc: 'On-Time' }
          ].map((item, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '0.5rem'
              }}
            >
              <div style={{
                width: '45px',
                height: '45px',
                background: '#fafafa',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem'
              }}>
                <item.icon size={22} color="#dc2626" strokeWidth={1.5} />
              </div>
              <h3 style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#000',
                margin: '0 0 0.25rem'
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: '0.8rem',
                color: '#6b7280',
                margin: 0
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Products Catalogue - Remaining space */}
      {featuredProducts.length > 0 && (
        <section style={{
          padding: '3rem 2rem 4rem',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h2 style={{
                  fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                  fontWeight: 700,
                  color: '#000',
                  margin: '0 0 0.5rem',
                  letterSpacing: '-0.02em'
                }}>
                  Our Products
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Browse our catalogue
                </p>
              </div>
              <Link
                to="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  transition: 'gap 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.gap = '0.75rem'}
                onMouseLeave={e => e.currentTarget.style.gap = '0.5rem'}
              >
                View All <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addItem(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
