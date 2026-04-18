import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';

const VIDEO_URL = 'https://jjkgsmljveixsdryxlsy.supabase.co/storage/v1/object/sign/website%20video/poonam%20video.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NzQ4NTIzOS02MDViLTRmMWEtOWJlMy01N2VkMTEwY2QxNjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlIHZpZGVvL3Bvb25hbSB2aWRlby5tcDQiLCJpYXQiOjE3NzY1MTc2MjAsImV4cCI6MjA5MTg3NzYyMH0.GGFv8FGDKYohpLxfm2twU-brbSw1gQQkNI3mTWAId3o'; // Set to your Supabase video URL when ready

export default function ScrollHero({ companyName, companyPhone }) {
  return (
    <section style={{
      width: '100%',
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'stretch',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Left — Text content */}
      <div style={{
        width: '38%',
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '5rem 2rem 3rem 3rem',
        position: 'relative',
        zIndex: 2,
        background: '#ffffff'
      }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ width: 32, height: 2, background: '#DC2626' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Premium Steel Supplier
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.25rem, 4vw, 3.75rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          color: '#111111',
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem'
        }}>
          {companyName || 'Poonam Stainless Steel'}
        </h1>

        <p style={{
          fontSize: '1rem',
          color: '#6B7280',
          lineHeight: 1.65,
          marginBottom: '2rem',
          maxWidth: '340px'
        }}>
          Quality steel products for construction, infrastructure, and industry. Trusted by 1000+ clients across the region.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <Link to="/products" style={{
            background: '#DC2626', color: 'white',
            padding: '0.9rem 2rem', borderRadius: '8px',
            fontWeight: 700, fontSize: '0.95rem',
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            transition: 'background 0.15s, transform 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#B91C1C'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Browse Catalogue <ArrowRight size={18} />
          </Link>
          <Link to="/contact" style={{
            background: 'transparent', color: '#111111',
            padding: '0.9rem 2rem', borderRadius: '8px',
            fontWeight: 600, fontSize: '0.95rem',
            textDecoration: 'none', border: '1.5px solid #E5E7EB',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            transition: 'border-color 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#111111'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
          >
            <Phone size={16} /> Get a Quote
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid #F3F4F6', paddingTop: '2rem' }}>
          {[['20+', 'Years'], ['1000+', 'Clients'], ['500+', 'Products']].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111111', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Video */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: '#f1f1f1'
      }}>
        {VIDEO_URL ? (
          <video
            autoPlay muted loop playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
        ) : (
          /* Fallback grid until video is added */
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `linear-gradient(rgba(220,38,38,0.06) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(220,38,38,0.06) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }} />
            <div style={{
              position: 'absolute', top: '30%', left: '40%',
              width: '300px', height: '300px',
              background: 'radial-gradient(ellipse, rgba(220,38,38,0.2) 0%, transparent 70%)'
            }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', position: 'relative', zIndex: 1 }}>
              Add video URL to ScrollHero.jsx
            </p>
          </div>
        )}

      </div>

      {/* Mobile: stack vertically */}
      <style>{`
        @media (max-width: 768px) {
          section > div:first-child {
            width: 100% !important;
            min-width: unset !important;
            padding: 5rem 1.5rem 2rem !important;
          }
          section > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
