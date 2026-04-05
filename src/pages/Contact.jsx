import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';
import { validators, validateForm } from '../lib/validation';

export default function Contact() {
  const companyId = detectCompanyFromDomain();
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    const loadCompany = async () => {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      setCompany(data);
    };

    loadCompany();
  }, [companyId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const rules = {
      name: [validators.required],
      email: [validators.required, validators.email],
      phone: [validators.required, validators.phone],
      message: [validators.required]
    };

    const errors = validateForm(formData, rules);
    if (errors) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          company_id: companyId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Failed to submit contact form:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const orange = '#FF6A00';
  const navy = '#0f172a';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '80px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '4rem 2rem'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: navy,
            margin: '0 0 1rem'
          }}>
            Contact Us
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            margin: 0
          }}>
            Get in touch with us for any inquiries or questions
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Contact Info */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: navy,
              margin: '0 0 1.5rem'
            }}>
              Get In Touch
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {company?.location && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <MapPin size={24} color={orange} style={{ flexShrink: 0 }} />
                  <div>
                    <h3 style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: navy,
                      margin: '0 0 0.25rem'
                    }}>
                      Address
                    </h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      margin: 0,
                      lineHeight: 1.6
                    }}>
                      {company.location}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Phone size={24} color={orange} style={{ flexShrink: 0 }} />
                <div>
                  <h3 style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: navy,
                    margin: '0 0 0.25rem'
                  }}>
                    Phone
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    margin: 0
                  }}>
                    Contact us for phone details
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Mail size={24} color={orange} style={{ flexShrink: 0 }} />
                <div>
                  <h3 style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: navy,
                    margin: '0 0 0.25rem'
                  }}>
                    Email
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    margin: 0
                  }}>
                    Send us a message using the form
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
          }}>
            {submitted ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem'
              }}>
                <CheckCircle size={64} color="#22c55e" style={{ marginBottom: '1rem' }} />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: navy,
                  margin: '0 0 0.5rem'
                }}>
                  Message Sent!
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#64748b',
                  margin: '0 0 1.5rem'
                }}>
                  Thank you for contacting us. We'll get back to you soon.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    background: orange,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: navy
                  }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.name ? '#ef4444' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.name && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: navy
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.email ? '#ef4444' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.email && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: navy
                  }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.phone ? '#ef4444' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.phone && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: navy
                  }}>
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    disabled={submitting}
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.message ? '#ef4444' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.message && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                      {formErrors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: submitting ? '#cbd5e1' : orange,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {submitting ? 'Sending...' : (
                    <>
                      <Send size={18} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
