import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session.user.user_metadata || {});
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session.user.user_metadata || {});
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load customer profile - if no customer_profiles row exists (e.g. ERP employee logging in),
  // auto-create one so they can use the website as a customer. Website and ERP are separate concerns.
  const loadProfile = async (userId, userMeta = {}) => {
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // No customer profile yet - create one so any logged-in user can use the website
        const companyId = detectCompanyFromDomain();
        const newProfile = {
          user_id: userId,
          company_id: companyId,
          name: userMeta.full_name || userMeta.name || userMeta.email || 'Customer',
          email: userMeta.email || '',
          phone: userMeta.phone || '',
        };
        const { data: created, error: createError } = await supabase
          .from('customer_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Failed to create customer profile:', createError);
          setProfile(null);
        } else {
          setProfile(created);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new customer account
   * @param {Object} data - Registration data
   * @param {string} data.email - Customer email
   * @param {string} data.password - Account password
   * @param {string} data.name - Customer name
   * @param {string} data.phone - Customer phone
   * @param {string} [data.employee_reference_id] - Optional employee reference
   */
  const register = async (data) => {
    const { email, password, name, phone, employee_reference_id } = data;

    // Get company ID from domain
    const companyId = detectCompanyFromDomain();
    if (!companyId) {
      throw new Error('Company not detected. Please use the correct website link.');
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user account');

    // Create customer profile
    const { error: profileError } = await supabase
      .from('customer_profiles')
      .insert({
        user_id: authData.user.id,
        company_id: companyId,
        name,
        email,
        phone,
        employee_reference_id: employee_reference_id || null,
      });

    if (profileError) {
      console.error('Failed to create profile:', profileError);
      throw new Error('Failed to create customer profile');
    }

    // Load the new profile
    await loadProfile(authData.user.id);
  };

  /**
   * Login with email and password
   * @param {string} email - Customer email
   * @param {string} password - Account password
   */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Profile will be loaded by onAuthStateChange listener
    return data;
  };

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  };

  /**
   * Sign in with Phone (OTP)
   * @param {string} phone - Phone number in E.164 format (e.g., +919876543210)
   */
  const signInWithPhone = async (phone) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) throw error;
    return data;
  };

  /**
   * Verify phone OTP
   * @param {string} phone - Phone number
   * @param {string} token - OTP code
   */
  const verifyPhoneOtp = async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) throw error;

    // Check if profile exists, create if not
    if (data.user) {
      const { data: existingProfile } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (!existingProfile) {
        // Create profile for phone sign-in user
        const companyId = detectCompanyFromDomain();
        await supabase.from('customer_profiles').insert({
          user_id: data.user.id,
          company_id: companyId,
          name: data.user.phone || 'Customer',
          email: data.user.email || '',
          phone: data.user.phone || '',
        });
      }

      await loadProfile(data.user.id, { phone: data.user.phone, email: data.user.email });
    }

    return data;
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    setProfile(null);
  };

  /**
   * Send password reset email
   * @param {string} email - Customer email
   */
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  };

  /**
   * Update customer profile
   * @param {Object} updates - Profile fields to update
   */
  const updateProfile = async (updates) => {
    if (!user || !profile) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('customer_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) throw error;
    
    setProfile(data);
    return data;
  };

  const value = {
    user,
    profile,
    loading,
    register,
    login,
    signInWithGoogle,
    signInWithPhone,
    verifyPhoneOtp,
    logout,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
