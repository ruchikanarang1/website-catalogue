import { supabase } from './supabase';

/**
 * Domain to Company ID mapping
 * 
 * Maps website domains to company UUIDs for multi-tenant support.
 * Each company can have multiple domains (www and non-www variants).
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get your company UUID from Supabase (companies table)
 * 2. Replace 'YOUR_COMPANY_UUID_HERE' below with your actual company UUID
 * 3. Add production domains when deploying
 * 
 * Example:
 * 'www.poonamsteel.com': '123e4567-e89b-12d3-a456-426614174000',
 * 'poonamsteel.com': '123e4567-e89b-12d3-a456-426614174000',
 * 'www.company2.com': '987fcdeb-51a2-43f1-b789-123456789abc',
 * 'company2.com': '987fcdeb-51a2-43f1-b789-123456789abc',
 */
/**
 * Returns the company ID for this website deployment.
 * Set VITE_COMPANY_ID in your environment variables when deploying.
 * Falls back to localhost mapping for local development.
 */
const LOCALHOST_COMPANY_ID = '69f9ce98-5855-4aa2-a60d-1bfece80178b';

export function detectCompanyFromDomain() {
  // Production: read from env var set at deploy time
  if (import.meta.env.VITE_COMPANY_ID) {
    return import.meta.env.VITE_COMPANY_ID;
  }

  // Local dev fallback
  const host = window.location.host;
  if (host.startsWith('localhost')) {
    return LOCALHOST_COMPANY_ID;
  }

  console.warn(`VITE_COMPANY_ID is not set for domain: ${host}`);
  return null;
}

/**
 * Fetches company details from the database
 * @param {string} companyId - The company UUID
 * @returns {Promise<Object|null>} Company details or null if not found
 */
export async function getCompanyDetails(companyId) {
  if (!companyId) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id, 
        name, 
        location,
        website_description,
        website_tagline,
        contact_email,
        contact_phone,
        contact_address,
        hero_image_url,
        logo_url,
        primary_color,
        secondary_color,
        background_color
      `)
      .eq('id', companyId)
      .single();
    
    if (error) {
      console.error('Failed to fetch company:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error fetching company details:', err);
    return null;
  }
}

/**
 * Detects company from domain and loads company details
 * @returns {Promise<{company: Object|null, error: string|null}>}
 */
export async function detectAndLoadCompany() {
  const companyId = detectCompanyFromDomain();
  
  if (!companyId) {
    return {
      company: null,
      error: 'DOMAIN_NOT_MAPPED',
      message: 'This domain is not configured. Please contact your supplier for the correct link.'
    };
  }
  
  const company = await getCompanyDetails(companyId);
  
  if (!company) {
    return {
      company: null,
      error: 'COMPANY_NOT_FOUND',
      message: 'Company not found. Please contact support.'
    };
  }
  
  return { company, error: null };
}
