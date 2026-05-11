import { supabase } from './supabase';

const handle = ({ data, error }, context = "") => {
    if (error) {
        console.error(`[DB ERROR] ${context}:`, error);
        throw new Error(`Database operation failed: ${context} - ${error.message || JSON.stringify(error)}`);
    }
    return data;
};

// Supplier Portal Functions
export const addBulkSupplierSubmissions = async (companyId, submissions) => {
    const rows = submissions.map(s => ({ ...s, company_id: companyId }));
    const { data, error } = await supabase.from('supplier_submissions').insert(rows).select();
    return handle({ data, error }, "addBulkSupplierSubmissions");
};

export const getGlobalCategories = async (companyId) => {
    if (!companyId) return ['TMT Bars', 'Angles', 'Channels', 'Beams', 'Plates', 'Sheets'];
    try {
        const { data, error } = await supabase
            .from('configs')
            .select('value')
            .eq('company_id', companyId)
            .eq('key', 'categories')
            .maybeSingle();
        const result = handle({ data, error }, "getGlobalCategories");
        return result?.value?.list || ['TMT Bars', 'Angles', 'Channels', 'Beams', 'Plates', 'Sheets'];
    } catch (e) {
        return ['TMT Bars', 'Angles', 'Channels', 'Beams', 'Plates', 'Sheets'];
    }
};

export const getGlobalUnits = async (companyId) => {
    if (!companyId) return ['kg', 'MT', 'pieces', 'bundles', 'coils'];
    try {
        const { data, error } = await supabase
            .from('configs')
            .select('value')
            .eq('company_id', companyId)
            .eq('key', 'units')
            .maybeSingle();
        const result = handle({ data, error }, "getGlobalUnits");
        return result?.value?.list || ['kg', 'MT', 'pieces', 'bundles', 'coils'];
    } catch (e) {
        return ['kg', 'MT', 'pieces', 'bundles', 'coils'];
    }
};

export const getVendorBrandRegistry = async (companyId) => {
    const { data, error } = await supabase.from('vendor_brand_registry').select('*').eq('company_id', companyId);
    return handle({ data, error }, "getVendorBrandRegistry") || [];
};

export const saveGlobalCategories = async (companyId, categoriesArray) => {
    handle(await supabase.from('configs').upsert({
        company_id: companyId,
        key: 'categories',
        value: { list: categoriesArray }
    }, { onConflict: 'company_id,key' }));
};

// Needed for direct entry (if allowed on website - usually not, but we'll include for compatibility)
export const addBulkProducts = async (companyId, products) => {
    const rows = products.map(p => ({ ...p, company_id: companyId }));
    const { data, error } = await supabase.from('products').insert(rows).select();
    return handle({ data, error }, "addBulkProducts");
};

export const saveVendorBrandEntry = async (companyId, id, data) => {
    if (id) {
        handle(await supabase.from('vendor_brand_registry').update(data).eq('id', id).eq('company_id', companyId));
    } else {
        handle(await supabase.from('vendor_brand_registry').insert({ ...data, company_id: companyId }));
    }
};
