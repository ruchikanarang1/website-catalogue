import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';

// Replace this with your Supabase Storage video URL once uploaded
const VIDEO_URL = 'https://jjkgsmljveixsdryxlsy.supabase.co/storage/v1/object/sign/website%20video/poonam%20video.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NzQ4NTIzOS02MDViLTRmMWEtOWJlMy01N2VkMTEwY2QxNjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlIHZpZGVvL3Bvb25hbSB2aWRlby5tcDQiLCJpYXQiOjE3NzY1MTUzMDgsImV4cCI6MjA5MTg3NTMwOH0.bIygr1-Wv5op0bOn25ROIt7jo-g0szca0gloNWhr8m8'; // e.g. 'https://jjkgsmljveixsdryxlsy.supabase.co/storage/v1/object/public/assets/hero.mp4'

export default function ScrollHero({ companyName, companyPhone }) {
  return (
    <section style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      minHeight: '600px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a'
    }}>
      {/* Video background */}
      {VIDEO_URL ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.7
          }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      ) : (
        /* Fallback: animated gradient until video is added */
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1c1917 40%, #0c0a09 100%)',
        }}>
          {/* Subtle grid pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(220,38,38,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(220,38,38,0.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '400px',
            background: 'radial-gradient(ellipse, rgba(220,38,38,0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
        </div>
      )}

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', color: 'white',
        padding: '2rem', maxWidth: '800px', width: '100%'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)',
          borderRadius: '999px', padding: '0.35rem 1rem',
          marginBottom: '1.75rem', fontSize: '0.78rem', fontWeight: 600, color: '#EF4444',
          letterSpacing: '0.05em', textTransform: 'uppercase'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
          Premium Steel Supplier
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 900,
          lineHeight: 1.0,
          marginBottom: '1.5rem',
          letterSpacing: '-0.03em',
          color: 'white',
          textShadow: '0 2px 40px rgba(0,0,0,0.5)'
        }}>
          {companyName || 'Poonam Stainless Steel'}
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.7,
          marginBottom: '2.5rem',
          maxWidth: '560px',
          margin: '0 auto 2.5rem'
        }}>
          Quality steel products for construction, infrastructure, and industry. Trusted by 1000+ clients across the region.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" style={{
            background: '#DC2626', color: 'white',
            padding: '1rem 2.5rem', borderRadius: '10px',
            fontWeight: 700, fontSize: '1rem',
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            boxShadow: '0 0 40px rgba(220,38,38,0.35)',
            transition: 'transform 0.2s, background 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#B91C1C'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#DC2626'; }}
          >
            Browse Catalogue <ArrowRight size={20} />
          </Link>
          <Link to="/contact" style={{
            background: 'rgba(255,255,255,0.1)', color: 'white',
            padding: '1rem 2.5rem', borderRadius: '10px',
            fontWeight: 600, fontSize: '1rem',
            textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            backdropFilter: 'blur(8px)',
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <Phone size={18} /> Get a Quote
          </Link>
        </div>

        {companyPhone && (
          <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            Call us: <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{companyPhone}</span>
          </p>
        )}
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', letterSpacing: '0.1em'
      }}>
        <span>SCROLL</span>
        <div style={{
          width: '1px', height: '40px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
          animation: 'scrollPulse 2s ease-in-out infinite'
        }} />
      </div>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }
      `}</style>
    </section>
  );
}
