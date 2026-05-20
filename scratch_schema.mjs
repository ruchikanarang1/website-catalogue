import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error fetching schema:', error);
  } else if (data.length > 0) {
    console.log('Columns in products table:');
    console.log(Object.keys(data[0]));
    console.log('Sample data:', data[0]);
  } else {
    console.log('Table is empty, cannot infer columns from a generic select.');
  }
}

checkSchema();
