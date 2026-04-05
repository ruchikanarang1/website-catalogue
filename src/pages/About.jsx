import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Award, Target, ArrowRight } from 'lucide-react';
import { detectAndLoadCompany } from '../lib/domainDetection';

export default function About() {
  const [company, setCompany] = useState(null);

  const orange = '#FF6A00';
  const navy = '#0f172a';

  useEffect(() => {
    detectAndLoadCompany().then(({ company }) => {
      if (company) setCompany(company);
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, ${navy} 0%, #1e293b 100%)`,
        color: 'white',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 900,
            marginBottom: '1rem'
          }}>
            About <span style={{ color: orange }}>{company?.name || 'Us'}</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#cbd5e1',
            lineHeight: 1.6
          }}>
            Your trusted partner for quality steel products and reliable service
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section style={{
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                background: `${orange}15`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Building2 size={32} color={orange} />
              </div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 800,
                marginBottom: '1rem',
                color: navy
              }}>
                Who We Are
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '1rem',
                lineHeight: 1.8,
                marginBottom: '1rem'
              }}>
                {company?.name || 'Our company'} is a leading supplier of quality steel products, 
                serving construction companies, contractors, and industrial clients across the region.
              </p>
              <p style={{
                color: '#64748b',
                fontSize: '1rem',
                lineHeight: 1.8
              }}>
                With years of experience in the steel industry, we understand the importance of 
                reliable supply, consistent quality, and timely delivery for your projects.
              </p>
            </div>
            <div style={{
              background: '#f8fafc',
              padding: '2.5rem',
              borderRadius: '16px',
              border: `3px solid ${orange}20`
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: navy
              }}>
                Our Location
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: orange,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Building2 size={20} color="white" />
                </div>
                <div>
                  <p style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: navy,
                    margin: '0 0 0.5rem 0'
                  }}>
                    {company?.name || 'Steel Company'}
                  </p>
                  <p style={{
                    color: '#64748b',
                    fontSize: '0.95rem',
                    margin: 0
                  }}>
                    {company?.location || 'Location information available on request'}
                  </p>
                </div>
              </div>
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: orange,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                Get in Touch
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{
        padding: '4rem 2rem',
        background: '#f8fafc'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '3rem',
            color: navy
          }}>
            Our Core Values
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: <Award size={36} />,
                title: 'Quality First',
                description: 'We source only the highest quality steel products that meet industry standards and certifications.'
              },
              {
                icon: <Users size={36} />,
                title: 'Customer Focus',
                description: 'Your satisfaction is our priority. We work closely with you to understand and meet your specific needs.'
              },
              {
                icon: <Target size={36} />,
                title: 'Reliability',
                description: 'Consistent supply, on-time delivery, and dependable service you can count on for every project.'
              }
            ].map((value, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: `${orange}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  color: orange
                }}>
                  {value.icon}
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: navy
                }}>
                  {value.title}
                </h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section style={{
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '2rem',
            color: navy
          }}>
            What We Offer
          </h2>
          <div style={{
            background: '#f8fafc',
            padding: '2.5rem',
            borderRadius: '16px',
            border: `3px solid ${orange}20`
          }}>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {[
                'Wide range of steel products',
                'Competitive pricing',
                'Fast and reliable delivery',
                'Quality certifications',
                'Expert product guidance',
                'Flexible order quantities',
                'Online ordering system',
                'Dedicated customer support'
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '1rem',
                    color: '#334155'
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: orange,
                    flexShrink: 0
                  }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: `linear-gradient(135deg, ${orange} 0%, #ff8533 100%)`,
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: '1.5rem'
          }}>
            Ready to Work With Us?
          </h2>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            opacity: 0.95
          }}>
            Browse our product catalogue or get in touch to discuss your requirements
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/products"
              style={{
                background: 'white',
                color: orange,
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1.1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              View Products
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/contact"
              style={{
                background: 'transparent',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1.1rem',
                border: '2px solid white',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
