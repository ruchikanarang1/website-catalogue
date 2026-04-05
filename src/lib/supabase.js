/**
 * Supabase Client Configuration
 * 
 * This client is configured for the public customer website with:
 * - Public access: Uses anon key for unauthenticated product browsing
 * - Authenticated access: Automatically handles user JWT tokens for customer operations
 * - Session management: Auto-refresh tokens and persist sessions across page reloads
 * 
 * Security:
 * - Anon key is safe for client-side use (RLS policies enforce data access)
 * - User JWT tokens are automatically included in authenticated requests
 * - Row Level Security (RLS) policies control data access at the database level
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '❌ Supabase environment variables are missing!\n' +
        'Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
}

/**
 * Supabase client instance
 * 
 * Configuration:
 * - autoRefreshToken: Automatically refresh JWT tokens before expiry
 * - persistSession: Store session in localStorage for persistence across page reloads
 * - detectSessionInUrl: Handle OAuth callback URLs and magic links
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
