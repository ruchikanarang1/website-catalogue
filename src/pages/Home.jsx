import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Award, TrendingUp, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';
import ProductCard from '../components/ProductCard';
import ScrollHero from '../components/ScrollHero';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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



export default function Home() {
  const companyId = detectCompanyFromDomain();
  const { addItem } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [company, setCompany] = useState(null);
  const [showRepeatToast, setShowRepeatToast] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    const load = async () => {
      const [{ data: products }, { data: na }, { data: comp }] = await Promise.all([
        supabase.from('products').select('*').eq('company_id', companyId).limit(8),
        supabase.from('products').select('*').eq('company_id', companyId).eq('is_new_arrival', true).limit(8),
        supabase.from('companies').select('*').eq('id', companyId).single()
      ]);
      setFeaturedProducts(products || []);
      setNewArrivals(na || []);
      setCompany(comp);
    };
    load();
  }, [companyId]);

  useEffect(() => {
    if (profile?.email) {
      const checkOrders = async () => {
        try {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('customer_email', profile.email);
            
          if (count > 0) {
            setShowRepeatToast(true);
          }
        } catch (err) {
          console.error(err);
        }
      };
      checkOrders();
    }
  }, [profile]);

  const companyName = company?.name || 'Poonam Stainless Steel';
  const companyPhone = company?.phone || '';
  const companyEmail = company?.email || '';
  const companyCity = company?.city || '';

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', -apple-system, sans-serif", color: '#111', display: 'flex', flexDirection: 'column' }}>
      {/* ── Scroll-driven 3D Hero ── */}
      <ScrollHero companyName={companyName} companyPhone={companyPhone} />

      {/* ── Stats ── */}
      <section style={{ background: '#DC2626', padding: '2rem' }} className="stats-section">
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
      <section className="why-us-section" style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
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

      {/* ── Prod      {/* ── Fun Artsy New Arrivals Banner ── */}
      {newArrivals.length > 0 && (
        <section style={{ padding: '4rem 1.5rem 2rem 1.5rem', background: '#FAFAFA', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          {/* Fun Artsy Background Shapes */}
          <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '250px', height: '250px', background: '#DC2626', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', opacity: 0.1, zIndex: 0, filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '10%', width: '300px', height: '300px', background: '#F59E0B', borderRadius: '50% 50% 30% 70% / 50% 30% 70% 50%', opacity: 0.15, zIndex: 0, filter: 'blur(40px)' }} />
          
          <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, color: '#111827', margin: 0, lineHeight: 0.95, letterSpacing: '-0.04em' }}>
              Fresh <br/><span style={{ color: '#DC2626', WebkitTextStroke: '2px #DC2626', textFillColor: 'transparent', WebkitTextFillColor: 'transparent' }}>Arrivals.</span>
            </h2>
            <p style={{ marginTop: '1.25rem', fontSize: '1rem', color: '#4B5563', lineHeight: 1.5, maxWidth: '450px' }}>
              Explore our most recently added pieces. We're constantly updating our catalogue with fresh, professional-grade additions.
            </p>
            <div style={{ marginTop: '1.5rem', display: 'inline-block', transform: 'rotate(-2deg)', background: '#F59E0B', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '30px', fontWeight: 800, fontSize: '0.8rem', boxShadow: '3px 3px 0px #111827', border: '2px solid #111827' }}>
              HOT RIGHT NOW 🔥
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals Carousel ── */}
      {newArrivals.length > 0 && (
        <section style={{ padding: '1rem 0 5rem 0', background: '#FAFAFA', overflow: 'hidden' }}>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="carousel-track" style={{
              display: 'flex', gap: '2rem',
              animation: 'carousel 30s linear infinite',
              width: 'max-content',
              padding: '1rem 2rem'
            }}>
              {[...newArrivals, ...newArrivals, ...newArrivals, ...newArrivals].map((product, i) => (
                <div key={product.id + '-' + i} style={{ width: '250px', flexShrink: 0, position: 'relative' }}>
                  {/* Subtle artsy shadow block for the grid items */}
                  <div style={{ position: 'absolute', inset: 0, background: i % 2 === 0 ? '#111827' : '#DC2626', borderRadius: '12px', transform: 'translate(6px, 6px)', zIndex: 0 }} />
                  
                  <div style={{ position: 'relative', zIndex: 1, background: 'white', borderRadius: '12px', overflow: 'hidden', border: '2px solid #111827', height: '100%', transition: 'transform 0.2s', display: 'flex' }}
                       onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)' }}
                       onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ width: '100%' }}>
                      <ProductCard product={product} onAddToCart={(prod, size) => addItem(prod, size)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3.5rem' }}>
            <Link to="/products?view=new-arrivals" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#111827', color: 'white', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', padding: '0.75rem 2rem', borderRadius: '30px', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#374151'}
              onMouseLeave={e => e.currentTarget.style.background = '#111827'}
            >
              View All New Additions <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
      <style>{`
        @keyframes carousel {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .carousel-track:hover { animation-play-state: paused; }

        @media (max-width: 768px) {

          /* Faster carousel on mobile */
          .carousel-track { animation-duration: 15s !important; }

          /* Mobile order: hero(0) → carousel(1) → stats(2) → why us(3) → cta(4) */
          .carousel-section { order: 1; padding: 1.5rem 0 !important; }
          .stats-section { order: 2; padding: 0.75rem 1rem !important; }
          .why-us-section { order: 3; }
          .cta-section { order: 4; }

          /* Compact stats on mobile */
          .stats-section > div {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 0 !important;
          }
          .stats-section > div > div { padding: 0.25rem !important; }
          .stats-section > div > div > div:first-child { font-size: 1.1rem !important; }
          .stats-section > div > div > div:last-child { font-size: 0.65rem !important; margin-top: 0.1rem !important; }
        }
      `}</style>

      {/* ── CTA ── */}
      <section className="cta-section" style={{ padding: '4rem 2rem', background: '#111111', color: 'white' }}>
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

      {/* ── Repeat Order Toast ── */}
      {showRepeatToast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'white',
          padding: '1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '300px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Want to repeat your last order?
            </h4>
            <button
              onClick={() => setShowRepeatToast(false)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem',
                color: '#94a3b8', lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            You can easily reorder your previous items with just a click.
          </p>
          <button
            onClick={() => {
              setShowRepeatToast(false);
              navigate('/orders');
            }}
            style={{
              background: '#DC2626',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
            onMouseLeave={e => e.currentTarget.style.background = '#DC2626'}
          >
            <Clock size={14} /> Repeat Order
          </button>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
