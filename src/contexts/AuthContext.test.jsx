import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import React from 'react';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock domain detection
vi.mock('../lib/domainDetection', () => ({
  detectCompanyFromDomain: vi.fn(() => 'test-company-id'),
}));

// Test component to access auth context
function TestComponent({ onRender }) {
  const auth = useAuth();
  React.useEffect(() => {
    if (onRender) onRender(auth);
  }, [auth, onRender]);
  return <div data-testid="test-component">Test</div>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  describe('login method', () => {
    it('should call Supabase signInWithPassword with email and password', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };
      
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      const loginResult = await authContext.login('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(loginResult.user).toEqual(mockUser);
    });

    it('should throw error when login fails', async () => {
      const mockError = new Error('Invalid credentials');
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await expect(
        authContext.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout method', () => {
    it('should call Supabase signOut', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await authContext.logout();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(authContext.user).toBeNull();
      expect(authContext.profile).toBeNull();
    });

    it('should throw error when logout fails', async () => {
      const mockError = new Error('Logout failed');
      supabase.auth.signOut.mockResolvedValue({ error: mockError });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await expect(authContext.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('resetPassword method', () => {
    it('should call Supabase resetPasswordForEmail with correct parameters', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await authContext.resetPassword('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password'),
        })
      );
    });

    it('should throw error when reset password fails', async () => {
      const mockError = new Error('Email not found');
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: mockError });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await expect(
        authContext.resetPassword('nonexistent@example.com')
      ).rejects.toThrow('Email not found');
    });
  });

  describe('register method', () => {
    it('should create Supabase Auth user and customer profile with company_id from domain', async () => {
      const mockUser = { id: 'user-123', email: 'newuser@example.com' };
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        company_id: 'test-company-id',
        name: 'New User',
        email: 'newuser@example.com',
        phone: '9876543210',
        employee_reference_id: 'EMP001',
      };

      // Mock signUp
      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null,
      });

      // Mock profile insert
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      supabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await authContext.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        phone: '9876543210',
        employee_reference_id: 'EMP001',
      });

      // Verify Supabase Auth signUp was called
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
      });

      // Verify customer_profile was created with company_id from domain detection
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        company_id: 'test-company-id',
        name: 'New User',
        email: 'newuser@example.com',
        phone: '9876543210',
        employee_reference_id: 'EMP001',
      });
    });

    it('should auto-login user after successful registration', async () => {
      const mockUser = { id: 'user-123', email: 'newuser@example.com' };
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        company_id: 'test-company-id',
        name: 'New User',
        email: 'newuser@example.com',
        phone: '9876543210',
      };

      // Mock signUp (Supabase auto-logs in after signUp)
      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null,
      });

      // Mock profile operations
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await authContext.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        phone: '9876543210',
      });

      // Verify profile was loaded (indicating auto-login worked)
      await waitFor(() => {
        expect(authContext.profile).toEqual(mockProfile);
      });
    });

    it('should handle registration without employee_reference_id', async () => {
      const mockUser = { id: 'user-123', email: 'newuser@example.com' };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null,
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      supabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'profile-123', user_id: 'user-123' },
              error: null,
            }),
          }),
        }),
      });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await authContext.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        phone: '9876543210',
      });

      // Verify employee_reference_id is set to null when not provided
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          employee_reference_id: null,
        })
      );
    });

    it('should throw error when company not detected', async () => {
      const { detectCompanyFromDomain } = await import('../lib/domainDetection');
      detectCompanyFromDomain.mockReturnValue(null);

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await expect(
        authContext.register({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          phone: '9876543210',
        })
      ).rejects.toThrow('Company not detected');

      // Restore mock
      detectCompanyFromDomain.mockReturnValue('test-company-id');
    });

    it('should throw error when Supabase Auth signUp fails', async () => {
      const mockError = new Error('Email already registered');
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await expect(
        authContext.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'New User',
          phone: '9876543210',
        })
      ).rejects.toThrow('Email already registered');
    });

    it('should throw error when customer profile creation fails', async () => {
      const mockUser = { id: 'user-123', email: 'newuser@example.com' };
      
      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null,
      });

      const mockError = new Error('Database error');
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: mockError }),
      });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      await expect(
        authContext.register({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          phone: '9876543210',
        })
      ).rejects.toThrow('Failed to create customer profile');
    });
  });

  describe('user and profile state', () => {
    it('should initialize with null user and profile', async () => {
      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      expect(authContext.user).toBeNull();
      expect(authContext.profile).toBeNull();
    });

    it('should load user and profile from session', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
      };

      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
      });

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(auth) => { authContext = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => expect(authContext?.loading).toBe(false));

      expect(authContext.user).toEqual(mockUser);
      expect(authContext.profile).toEqual(mockProfile);
    });
  });
});
