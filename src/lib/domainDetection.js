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
const DOMAIN_COMPANY_MAP = {
  // Development fallback
  'localhost': '98f6ccba-d7ef-4a7d-b346-6d432178b863',
  'localhost:5173': '98f6ccba-d7ef-4a7d-b346-6d432178b863', // Vite dev server
  'localhost:3001': '98f6ccba-d7ef-4a7d-b346-6d432178b863', // Custom dev port
  
  // Production domains - add your custom domains here:
  // COMPANY 1 - Replace with your actual company UUID from Supabase
  // 'www.company1.com': 'YOUR_COMPANY_1_UUID_HERE',
  // 'company1.com': 'YOUR_COMPANY_1_UUID_HERE',
  
  // COMPANY 2 - Replace with your actual company UUID from Supabase
  // 'www.company2.com': 'YOUR_COMPANY_2_UUID_HERE',
  // 'company2.com': 'YOUR_COMPANY_2_UUID_HERE',
};

/**
 * Detects the company ID based on the current domain
 * @returns {string|null} Company ID or null if not mapped
 */
export function detectCompanyFromDomain() {
  const hostname = window.location.hostname;
  const hostnameWithPort = window.location.host; // includes port
  
  // Try with port first (for localhost:5173), then hostname only
  let companyId = DOMAIN_COMPANY_MAP[hostnameWithPort];
  if (companyId === undefined) {
    companyId = DOMAIN_COMPANY_MAP[hostname];
  }
  
  if (!companyId) {
    console.warn(`No company mapped for domain: ${hostname}`);
  }
  
  return companyId || null;
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
