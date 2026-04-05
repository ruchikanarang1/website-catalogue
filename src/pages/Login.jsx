import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Phone, Briefcase, Loader2, LogIn } from 'lucide-react';
import { validators, validateForm } from '../lib/validation';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, signInWithGoogle, resetPassword } = useAuth();
  
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});

  // Register form
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    employee_reference_id: ''
  });
  const [registerErrors, setRegisterErrors] = useState({});

  // Forgot password
  const [resetEmail, setResetEmail] = useState('');

  const orange = '#FF6A00';
  const navy = '#0f172a';

  const handleLoginChange = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    if (loginErrors[field]) {
      setLoginErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (message) setMessage('');
  };

  const handleRegisterChange = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    if (registerErrors[field]) {
      setRegisterErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (message) setMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const rules = {
      email: [validators.required, validators.email],
      password: [validators.required]
    };

    const errors = validateForm(loginData, rules);
    if (errors) {
      setLoginErrors(errors);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await login(loginData.email, loginData.password);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err) {
      console.error('Login failed:', err);
      setMessage(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const rules = {
      name: [validators.required],
      email: [validators.required, validators.email],
      phone: [validators.required, validators.phone],
      password: [validators.required]
    };

    const errors = validateForm(registerData, rules);
    if (errors) {
      setRegisterErrors(errors);
      return;
    }

    if (registerData.password.length < 8) {
      setRegisterErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await register(registerData);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err) {
      console.error('Registration failed:', err);
      setMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setMessage('Google sign-in failed. Please try again.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!resetEmail || !validators.email(resetEmail)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await resetPassword(resetEmail);
      setMessage('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err) {
      console.error('Password reset failed:', err);
      setMessage('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: `${orange}15`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <LogIn size={30} color={orange} />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: navy,
            margin: '0 0 0.5rem'
          }}>
            {showForgotPassword ? 'Reset Password' : 'Welcome'}
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#64748b',
            margin: 0
          }}>
            {showForgotPassword
              ? 'Enter your email to receive a reset link'
              : tab === 'login'
              ? 'Sign in to your account'
              : 'Create a new account'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
          {message && (
            <div style={{
              background: message.includes('success') || message.includes('sent') ? '#dcfce7' : '#fee2e2',
              color: message.includes('success') || message.includes('sent') ? '#166534' : '#991b1b',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          {showForgotPassword ? (
            // Forgot Password Form
            <form onSubmit={handleForgotPassword} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
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
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={loading}
                  placeholder="your@email.com"
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
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#cbd5e1' : orange,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                style={{
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  padding: '0.5rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Back to Login
              </button>
            </form>
          ) : (
            <>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <button
                  onClick={() => setTab('login')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `3px solid ${tab === 'login' ? orange : 'transparent'}`,
                    color: tab === 'login' ? orange : '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginBottom: '-2px'
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => setTab('register')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `3px solid ${tab === 'register' ? orange : 'transparent'}`,
                    color: tab === 'register' ? orange : '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginBottom: '-2px'
                  }}
                >
                  Register
                </button>
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                  color: '#334155'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>

              <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
                margin: '1rem 0',
                position: 'relative'
              }}>
                <span style={{
                  background: 'white',
                  padding: '0 1rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  or
                </span>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: '#e2e8f0',
                  zIndex: 0
                }} />
              </div>

              {tab === 'login' ? (
                // Login Form
                <form onSubmit={handleLogin} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}>
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
                      value={loginData.email}
                      onChange={(e) => handleLoginChange('email', e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${loginErrors.email ? '#ef4444' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {loginErrors.email && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                        {loginErrors.email}
                      </p>
                    )}
                  </div>

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
                      <Lock size={16} />
                      Password
                    </label>
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => handleLoginChange('password', e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${loginErrors.password ? '#ef4444' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {loginErrors.password && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                        {loginErrors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: orange,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'right',
                      padding: 0,
                      marginTop: '-0.5rem'
                    }}
                  >
                    Forgot Password?
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: loading ? '#cbd5e1' : orange,
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              ) : (
                // Register Form
                <form onSubmit={handleRegister} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}>
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
                      value={registerData.name}
                      onChange={(e) => handleRegisterChange('name', e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${registerErrors.name ? '#ef4444' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {registerErrors.name && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                        {registerErrors.name}
                      </p>
                    )}
                  </div>

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
                      Email *
                    </label>
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => handleRegisterChange('email', e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${registerErrors.email ? '#ef4444' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {registerErrors.email && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                        {registerErrors.email}
                      </p>
                    )}
                  </div>

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
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) => handleRegisterChange('phone', e.target.value)}
                      disabled={loading}
                      placeholder="10-digit number"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${registerErrors.phone ? '#ef4444' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {registerErrors.phone && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                        {registerErrors.phone}
                      </p>
                    )}
                  </div>

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
                      <Lock size={16} />
                      Password *
                    </label>
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => handleRegisterChange('password', e.target.value)}
                      disabled={loading}
                      placeholder="At least 8 characters"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${registerErrors.password ? '#ef4444' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {registerErrors.password && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                        {registerErrors.password}
                      </p>
                    )}
                  </div>

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
                      Employee Reference ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={registerData.employee_reference_id}
                      onChange={(e) => handleRegisterChange('employee_reference_id', e.target.value)}
                      disabled={loading}
                      placeholder="Your contact person's ID"
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
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: loading ? '#cbd5e1' : orange,
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              )}
            </>
          )}
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
