/**
 * EXAMPLE USAGE OF DOMAIN DETECTION
 * 
 * This file demonstrates how to use the domain detection functions.
 * This is NOT part of the application - it's for documentation purposes.
 */

import { detectCompanyFromDomain, getCompanyDetails, detectAndLoadCompany } from './domainDetection';

// Example 1: Detect company from current domain
async function example1() {
  console.log('Example 1: Detect company from domain');
  const companyId = detectCompanyFromDomain();
  console.log('Detected company ID:', companyId);
  // Output: null (if using placeholder) or actual UUID (if configured)
}

// Example 2: Fetch company details
async function example2() {
  console.log('Example 2: Fetch company details');
  const companyId = 'your-company-uuid-here';
  const company = await getCompanyDetails(companyId);
  console.log('Company details:', company);
  // Output: { id: '...', name: 'Company Name', location: 'Location' }
}

// Example 3: Complete detection and loading flow
async function example3() {
  console.log('Example 3: Complete detection flow');
  const result = await detectAndLoadCompany();
  
  if (result.error) {
    console.error('Error:', result.error);
    console.error('Message:', result.message);
    // Handle error - show company selector or error message
  } else {
    console.log('Company loaded:', result.company);
    // Use company data in your app
  }
}

// Example 4: Usage in a React component
const ExampleComponent = () => {
  const [company, setCompany] = React.useState(null);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    async function loadCompany() {
      const result = await detectAndLoadCompany();
      
      if (result.error) {
        setError(result.message);
      } else {
        setCompany(result.company);
      }
    }
    
    loadCompany();
  }, []);
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!company) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>Welcome to {company.name}</h1>
      <p>Location: {company.location}</p>
    </div>
  );
};

// Example 5: Setting up domain mapping for production
/*
PRODUCTION SETUP:

1. Get your company UUID from Supabase:
   - Go to Supabase SQL Editor
   - Run: SELECT id, name FROM companies;
   - Copy the UUID for your company

2. Update DOMAIN_COMPANY_MAP in domainDetection.js:
   
   const DOMAIN_COMPANY_MAP = {
     'localhost': '123e4567-e89b-12d3-a456-426614174000',
     'localhost:5173': '123e4567-e89b-12d3-a456-426614174000',
     'www.yourcompany.com': '123e4567-e89b-12d3-a456-426614174000',
     'yourcompany.com': '123e4567-e89b-12d3-a456-426614174000',
   };

3. Deploy your application to Hostinger

4. Configure your domain to point to the deployment

5. Test by visiting your domain - it should automatically detect your company
*/

export { example1, example2, example3, ExampleComponent };
