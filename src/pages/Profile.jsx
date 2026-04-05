import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Phone, Mail, MapPin, Briefcase, Save, Loader2 } from 'lucide-react';
import { validators, validateForm } from '../lib/validation';

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    delivery_address: '',
    employee_reference_id: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const orange = '#FF6A00';
  const navy = '#0f172a';

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        delivery_address: profile.delivery_address || '',
        employee_reference_id: profile.employee_reference_id || ''
      });
    }
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const rules = {
      name: [validators.required],
      phone: [validators.required, validators.phone]
    };

    const errors = validateForm(formData, rules);
    if (errors) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '80px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '4rem 2rem'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: `${orange}15`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <User size={40} color={orange} />
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: navy,
            margin: '0 0 0.5rem'
          }}>
            My Profile
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#64748b',
            margin: 0
          }}>
            Manage your account information
          </p>
        </div>

        {/* Profile Form */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
          {message && (
            <div style={{
              background: message.includes('success') ? '#dcfce7' : '#fee2e2',
              color: message.includes('success') ? '#166534' : '#991b1b',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              textAlign: 'center',
              fontWeight: 600
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Email (Read-only) */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: navy
              }}>
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: '#f8fafc',
                  color: '#94a3b8',
                  cursor: 'not-allowed',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{
                margin: '0.25rem 0 0',
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}>
                Email cannot be changed
              </p>
            </div>

            {/* Name */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: navy
              }}>
                <User size={16} />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={loading}
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

            {/* Phone */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: navy
              }}>
                <Phone size={16} />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
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

            {/* Delivery Address */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: navy
              }}>
                <MapPin size={16} />
                Delivery Address
              </label>
              <textarea
                value={formData.delivery_address}
                onChange={(e) => handleChange('delivery_address', e.target.value)}
                disabled={loading}
                rows={3}
                placeholder="Enter your delivery address..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Employee Reference ID */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: navy
              }}>
                <Briefcase size={16} />
                Employee Reference ID
              </label>
              <input
                type="text"
                value={formData.employee_reference_id}
                onChange={(e) => handleChange('employee_reference_id', e.target.value)}
                disabled={loading}
                placeholder="Optional - Your contact person's ID"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{
                margin: '0.25rem 0 0',
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}>
                Enter your employee contact's reference ID if applicable
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#cbd5e1' : orange,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
