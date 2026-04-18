import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { detectAndLoadCompany } from '../lib/domainDetection';

export default function Footer() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    detectAndLoadCompany().then(({ company }) => {
      if (company) setCompany(company);
    });
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: '#000',
      color: 'white',
      marginTop: 'auto',
      borderTop: '1px solid #1f1f1f'
    }}>
      {/* Main Footer Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '4rem 2rem 2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginBottom: '1rem',
              color: 'white'
            }}>
              {company?.name || 'Steel Store'}
            </h3>
            <p style={{
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: '#d1d5db',
              marginBottom: '1.5rem'
            }}>
              {company?.website_tagline || 'Quality steel products for all your needs'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'white'
            }}>
              Quick Links
            </h4>
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Products' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' }
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: '#d1d5db',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'white'
            }}>
              Customer Service
            </h4>
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {[
                { to: '/login', label: 'My Account' },
                { to: '/orders', label: 'Order History' },
                { to: '/contact', label: 'Help & Support' }
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: '#d1d5db',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'white'
            }}>
              Contact Us
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {(company?.address || company?.contact_address) && (
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}>
                  <MapPin size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#d1d5db',
                    lineHeight: 1.5
                  }}>
                    {company.address || company.contact_address}
                  </span>
                </div>
              )}
              {(company?.phone || company?.contact_phone) && (
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center'
                }}>
                  <Phone size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                  <a
                    href={`tel:${company.phone || company.contact_phone}`}
                    style={{
                      fontSize: '0.9rem',
                      color: '#d1d5db',
                      textDecoration: 'none'
                    }}
                  >
                    {company.phone || company.contact_phone}
                  </a>
                </div>
              )}
              {(company?.email || company?.contact_email) && (
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center'
                }}>
                  <Mail size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                  <a
                    href={`mailto:${company.email || company.contact_email}`}
                    style={{
                      fontSize: '0.9rem',
                      color: '#d1d5db',
                      textDecoration: 'none'
                    }}
                  >
                    {company.email || company.contact_email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #1f1f1f',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{
            fontSize: '0.85rem',
            color: '#9ca3af',
            margin: 0
          }}>
            © {currentYear} {company?.name || 'Steel Store'}. All rights reserved.
          </p>
          <div style={{
            display: 'flex',
            gap: '1.5rem'
          }}>
            <Link
              to="/privacy"
              style={{
                fontSize: '0.85rem',
                color: '#9ca3af',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.color = '#dc2626'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              style={{
                fontSize: '0.85rem',
                color: '#9ca3af',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.color = '#dc2626'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
