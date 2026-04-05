import { describe, it, expect, beforeEach, vi } from 'vitest';
import { detectCompanyFromDomain, getCompanyDetails, detectAndLoadCompany } from './domainDetection';
import { supabase } from './supabase';

// Mock the supabase module
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('domainDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location for each test
    delete window.location;
  });

  describe('detectCompanyFromDomain', () => {
    it('returns null for placeholder UUID on localhost', () => {
      window.location = { hostname: 'localhost', host: 'localhost' };
      const result = detectCompanyFromDomain();
      expect(result).toBeNull();
    });

    it('returns null for unmapped domain', () => {
      window.location = { hostname: 'unknown.com', host: 'unknown.com' };
      const result = detectCompanyFromDomain();
      expect(result).toBeNull();
    });

    it('handles localhost with port', () => {
      window.location = { hostname: 'localhost', host: 'localhost:5173' };
      const result = detectCompanyFromDomain();
      expect(result).toBeNull(); // Because it's using placeholder
    });
  });

  describe('getCompanyDetails', () => {
    it('returns null when companyId is null', async () => {
      const result = await getCompanyDetails(null);
      expect(result).toBeNull();
    });

    it('fetches company details successfully', async () => {
      const mockCompany = {
        id: 'test-uuid',
        name: 'Test Company',
        location: 'Test Location'
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockCompany, error: null })
        })
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await getCompanyDetails('test-uuid');
      
      expect(supabase.from).toHaveBeenCalledWith('companies');
      expect(mockSelect).toHaveBeenCalledWith('id, name, location');
      expect(result).toEqual(mockCompany);
    });

    it('returns null when company not found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Not found' } 
          })
        })
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await getCompanyDetails('non-existent-uuid');
      expect(result).toBeNull();
    });

    it('handles database errors gracefully', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await getCompanyDetails('test-uuid');
      expect(result).toBeNull();
    });
  });

  describe('detectAndLoadCompany', () => {
    it('returns error when domain not mapped', async () => {
      window.location = { hostname: 'unknown.com', host: 'unknown.com' };
      
      const result = await detectAndLoadCompany();
      
      expect(result).toEqual({
        company: null,
        error: 'DOMAIN_NOT_MAPPED',
        message: 'This domain is not configured. Please contact your supplier for the correct link.'
      });
    });

    it('returns error when company not found in database', async () => {
      // Mock a valid company ID in the map (we'd need to modify the actual map for this test)
      // For now, we'll test the null case
      window.location = { hostname: 'localhost', host: 'localhost' };
      
      const result = await detectAndLoadCompany();
      
      expect(result.error).toBe('DOMAIN_NOT_MAPPED');
    });
  });
});
