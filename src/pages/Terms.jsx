import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';

export default function Terms() {
  const companyId = detectCompanyFromDomain();
  const [company, setCompany] = useState({ name: 'Poonam Steel', email: 'support@poonamsteel.com', phone: 'Contact us via phone', address: '' });

  useEffect(() => {
    if (!companyId) return;
    const loadCompany = async () => {
      const { data } = await supabase.from('companies').select('*').eq('id', companyId).single();
      if (data) {
        setCompany({
          name: data.name || 'Poonam Steel',
          email: data.contact_email || data.email || 'support@poonamsteel.com',
          phone: data.contact_phone || data.phone || 'Contact us via phone',
          address: data.contact_address || data.address || data.location || ''
        });
      }
    };
    loadCompany();
  }, [companyId]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '100px',
      paddingBottom: '4rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem' }}>Terms of Service</h1>
        
        <div style={{ color: '#475569', lineHeight: 1.8 }}>
          <p style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <p style={{ marginBottom: '1.5rem' }}>
            Welcome to the digital storefront and portals of <strong>{company.name}</strong>. By accessing our platform to view catalogues, place orders, or manage supplier shipments, you agree to the following terms specific to our industry operations.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>1. Platform & Accounts</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Our platform provides distinct access for retail customers, B2B wholesale clients, and registered suppliers. You are responsible for maintaining the confidentiality of your account credentials. You must ensure that your business details, including GST numbers and billing addresses, are accurate and up-to-date.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>2. Pricing & Quotations</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Due to the volatile nature of the steel industry, prices displayed in the digital catalogue are indicative and subject to daily market fluctuations. Final invoicing is based on the agreed rate at the time of order confirmation and the <strong>actual weight</strong> measured at the time of dispatch.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>3. Orders, Dispatch & Logistics</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            While we coordinate closely with transport networks to ensure prompt delivery, estimated delivery timelines are not strictly guaranteed. {company.name} is not liable for indirect losses caused by transit delays. Upon delivery, it is the buyer's responsibility to verify the physical goods and actual weight against the provided invoice and e-way bill.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>4. Returns, Defects & Discrepancies</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Given the industrial nature of steel products, returns are generally not accepted unless there is a verifiable manufacturing defect, grade mismatch, or significant discrepancy in weight. All claims must be raised with our sales team immediately upon offloading the goods at the destination.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>5. Payment Terms</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Payment terms (such as advance payments, credit limits, and credit periods) are determined on a per-customer basis and documented in your ledger. Overdue payments may be subject to interest as per standard business practices.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>6. Contact Us</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            If you need clarification on any of these business terms, please contact <strong>{company.name}</strong> at:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyle: 'none' }}>
            <li><strong>Email:</strong> <a href={`mailto:${company.email}`} style={{ color: '#FF6A00', textDecoration: 'none' }}>{company.email}</a></li>
            <li><strong>Phone:</strong> <a href={`tel:${company.phone}`} style={{ color: '#FF6A00', textDecoration: 'none' }}>{company.phone}</a></li>
            {company.address && <li><strong>Address:</strong> {company.address}</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
