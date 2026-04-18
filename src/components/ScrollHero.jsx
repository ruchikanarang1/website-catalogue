import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';

const VIDEO_URL = 'https://jjkgsmljveixsdryxlsy.supabase.co/storage/v1/object/sign/website%20video/poonam%20video.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NzQ4NTIzOS02MDViLTRmMWEtOWJlMy01N2VkMTEwY2QxNjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlIHZpZGVvL3Bvb25hbSB2aWRlby5tcDQiLCJpYXQiOjE3NzY1MTg3MzIsImV4cCI6MjA5MTg3ODczMn0.UVL0O1YuUxVDe75CRIWxHk8fpPkCGi3rWlFedeyYiBs'; // Set to your Supabase video URL when ready

export default function ScrollHero({ companyName, companyPhone }) {
  return (
    <section className="hero-section" style={{
      width: '100%',
      height: '100vh',
      minHeight: '560px',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'stretch',
      overflow: 'hidden'
    }}>
      {/* Left — Text content 40% */}
      <div className="hero-text" style={{
        width: '40%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem 2.5rem 4rem 4rem',
        background: '#ffffff'
      }}>
        {/* Eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 28, height: 2, background: '#DC2626' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Wholesale Distributor
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.75rem, 3vw, 3.25rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          color: '#111111',
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem'
        }}>
          {companyName || 'Poonam Stainless Steel'}
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: '#6B7280',
          lineHeight: 1.7,
          marginBottom: '2rem',
          maxWidth: '340px'
        }}>
Premium stainless steel utensils, supplied wholesale to retailers.        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'nowrap' }}>
          <Link to="/products" style={{
            background: '#DC2626', color: 'white',
            padding: '0.8rem 1.5rem', borderRadius: '8px',
            fontWeight: 700, fontSize: '0.875rem',
            textDecoration: 'none', whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            transition: 'background 0.15s, transform 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#B91C1C'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Catalogue <ArrowRight size={16} />
          </Link>
          <Link to="/contact" style={{
            background: 'transparent', color: '#111111',
            padding: '0.8rem 1.5rem', borderRadius: '8px',
            fontWeight: 600, fontSize: '0.875rem',
            textDecoration: 'none', border: '1.5px solid #E5E7EB', whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            transition: 'border-color 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#111111'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
          >
            <Phone size={15} /> Get a Quote
          </Link>
        </div>
      </div>

      {/* Right — Video 60% */}
      <div className="hero-video" style={{
        width: '60%',
        position: 'relative',
        overflow: 'hidden',
        background: '#111'
      }}>
        {VIDEO_URL ? (
          <video
            autoPlay muted loop playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
        ) : (
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
              position: 'absolute', top: '30%', left: '30%',
              width: '300px', height: '300px',
              background: 'radial-gradient(ellipse, rgba(220,38,38,0.2) 0%, transparent 70%)'
            }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', position: 'relative', zIndex: 1 }}>
              Add VIDEO_URL to ScrollHero.jsx
            </p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-section {
            flex-direction: column !important;
            height: auto !important;
            min-height: unset !important;
          }
          .hero-video {
            width: 100% !important;
            height: 60vw !important;
            min-height: 240px !important;
            flex: unset !important;
            order: 0 !important;
            margin-top: 64px !important;
          }
          .hero-text {
            width: 100% !important;
            min-width: unset !important;
            padding: 1.25rem 1.5rem 1.5rem !important;
            order: 1 !important;
          }
          .hero-text > div:first-child { margin-bottom: 0.75rem !important; }
          .hero-text h1 { font-size: 1.75rem !important; margin-bottom: 0.75rem !important; }
          .hero-text p { font-size: 0.875rem !important; margin-bottom: 1.25rem !important; line-height: 1.55 !important; }
          .hero-stats { display: none !important; }
        }
      `}</style>
    </section>
  );
}
