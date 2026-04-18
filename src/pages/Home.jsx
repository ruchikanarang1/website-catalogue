import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Award, TrendingUp, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';
import ProductCard from '../components/ProductCard';
import ScrollHero from '../components/ScrollHero';
import { useCart } from '../contexts/CartContext';

const stats = [
  { value: '20+', label: 'Years Experience' },
  { value: '1000+', label: 'Clients Served' },
  { value: '500+', label: 'Products' },
  { value: '99%', label: 'On-Time Delivery' },
];

const whyUs = [
  { icon: Shield, title: 'Certified Quality', desc: 'All products meet ISI and industry standards. We never compromise on material grade.' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'Same-day dispatch for in-stock items. Bulk orders fulfilled within 48 hours.' },
  { icon: Award, title: 'Trusted Supplier', desc: 'Preferred vendor for contractors, builders, and industrial clients across the region.' },
  { icon: TrendingUp, title: 'Competitive Pricing', desc: 'Direct from manufacturer pricing with volume discounts for regular buyers.' },
];

const industries = [
  'Structural Steel', 'Stainless Steel', 'MS Pipes & Tubes',
  'Steel Plates', 'Angles & Channels', 'Roofing Sheets',
  'TMT Bars', 'Coils & Strips', 'Fabrication'
];

export default function Home() {
  const companyId = detectCompanyFromDomain();
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    if (!companyId) return;
    const load = async () => {
      const [{ data: products }, { data: comp }] = await Promise.all([
        supabase.from('products').select('*').eq('company_id', companyId).limit(8),
        supabase.from('companies').select('*').eq('id', companyId).single()
      ]);
      setFeaturedProducts(products || []);
      setCompany(comp);
    };
    load();
  }, [companyId]);

  const companyName = company?.name || 'Poonam Stainless Steel';
  const companyPhone = company?.phone || '';
  const companyEmail = company?.email || '';
  const companyCity = company?.city || '';

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', -apple-system, sans-serif", color: '#111' }}>
      {/* ── Scroll-driven 3D Hero ── */}
      <ScrollHero companyName={companyName} companyPhone={companyPhone} />

      {/* ── Stats ── */}
      <section style={{ background: '#DC2626', padding: '2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pain points ── */}
      <section style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Why Choose Us</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Solving your biggest procurement headaches
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '3rem', maxWidth: '520px', lineHeight: 1.7 }}>
            Late deliveries, inconsistent quality, and opaque pricing — we've built our business around fixing exactly these problems.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {whyUs.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} style={{
                  background: 'white', borderRadius: '12px', padding: '1.75rem',
                  border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s, border-color 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#fbd5b5'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#DC2626' }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      {featuredProducts.length > 0 && (
        <section style={{ padding: '4rem 2rem', background: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Our Products</p>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Featured from our catalogue</h2>
              </div>
              <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#DC2626', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.gap = '0.7rem'}
                onMouseLeave={e => e.currentTarget.style.gap = '0.4rem'}
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={() => addItem(product)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Industries ── */}
      <section style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Industries We Serve</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#111827', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
            Our product range
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {industries.map(ind => (
              <div key={ind} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'white', border: '1px solid #e2e8f0', borderRadius: '999px',
                padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontWeight: 500, color: '#374151'
              }}>
                <CheckCircle size={14} color="#DC2626" />
                {ind}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '4rem 2rem', background: '#111111', color: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em', color: 'white' }}>
            Ready to place an order?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Browse our full catalogue, add to cart, and place your order directly. Our team will confirm and arrange delivery.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" style={{
              background: '#DC2626', color: 'white', padding: '0.875rem 2rem',
              borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
            }}>
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/contact" style={{
              background: 'transparent', color: 'white', padding: '0.875rem 2rem',
              borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem',
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <Mail size={16} /> Contact Us
            </Link>
          </div>
          {(companyPhone || companyEmail || companyCity) && (
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {companyPhone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}><Phone size={14} />{companyPhone}</div>}
              {companyEmail && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}><Mail size={14} />{companyEmail}</div>}
              {companyCity && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}><MapPin size={14} />{companyCity}</div>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
