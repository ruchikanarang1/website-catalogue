import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';

export default function Privacy() {
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
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem' }}>Privacy Policy</h1>
        
        <div style={{ color: '#475569', lineHeight: 1.8 }}>
          <p style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <p style={{ marginBottom: '1.5rem' }}>
            This Privacy Policy describes how <strong>{company.name}</strong> ("we," "us," or "our") collects, uses, and shares your personal and business information when you use our public website, customer storefront, and supplier portals.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>1. Information We Collect</h2>
          <p style={{ marginBottom: '1rem' }}>
            To operate our steel wholesale and retail platform effectively, we collect the following types of information:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li><strong>Identity & Business Details:</strong> Name, company name, GST/Tax identification numbers, and role (e.g., customer, supplier, transporter).</li>
            <li><strong>Contact Information:</strong> Email addresses, phone numbers, billing addresses, and delivery/shipping addresses.</li>
            <li><strong>Transaction Data:</strong> Details of steel purchase orders, logistics invoices, payment history, and ledger balances.</li>
            <li><strong>System Usage:</strong> How you interact with our digital catalogue, cart, and client/supplier portals.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>2. How We Use Your Data</h2>
          <p style={{ marginBottom: '1rem' }}>We use your information specifically for business operations at {company.name}:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li>To process and fulfill steel orders, coordinate dispatch, and generate invoices/e-way bills.</li>
            <li>To manage your Customer or Supplier profile and authenticate your access to our portal.</li>
            <li>To send critical operational updates, such as order confirmations, dispatch tracking, and payment reminders.</li>
            <li>To ensure compliance with local taxation, financial, and trade regulations.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>3. Who We Share Your Data With</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We do not sell your personal or business data. We only share data with verified third parties when strictly necessary to fulfill our services:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li><strong>Logistics & Transport Partners:</strong> We share delivery addresses and contact numbers with assigned transport vehicles and drivers to ensure your goods are delivered safely.</li>
            <li><strong>Financial & Payment Gateways:</strong> For processing secure digital payments and managing business ledgers.</li>
            <li><strong>Regulatory Authorities:</strong> We may disclose transaction records and tax IDs (like GST) to government bodies when required for taxation and legal compliance.</li>
            <li><strong>WhatsApp Business Communications:</strong> We may use WhatsApp Business to send you order updates, payment reminders, and support messages. Any communication via WhatsApp is subject to Meta's Privacy Policy in addition to ours.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>4. Data Security & Retention</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            All business and personal data is secured using modern encryption standards on our cloud infrastructure. We retain order history, invoices, and ledgers as required by accounting and tax laws, even after you close your account with us.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>5. Contact Us Regarding Privacy</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            If you have any questions or wish to update your business information in our records, you can reach out directly to <strong>{company.name}</strong>:
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
