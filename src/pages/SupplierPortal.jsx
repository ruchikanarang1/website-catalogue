import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    addBulkSupplierSubmissions, 
    getVendorBrandRegistry,
    addBulkProducts,
    saveVendorBrandEntry,
    getGlobalCategories, 
    saveGlobalCategories,
    getGlobalUnits 
} from '../lib/db';
import { 
    Plus, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, 
    Check, X, Building2, Tag, LayoutGrid, Save, Send, AlertCircle
} from 'lucide-react';

export default function SupplierPortal() {
    const { profile, user } = useAuth();
    // In public-website, companyId is usually fixed or comes from profile
    const currentCompanyId = profile?.company_id || 1; // Default or detected
    const isAdmin = profile?.user_type === 'admin' || profile?.roles?.includes('admin');
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [existingVendors, setExistingVendors] = useState([]);
    const [existingBrands, setExistingBrands] = useState([]);
    const [directPublish, setDirectPublish] = useState(false);

    // Hierarchical State: Vendor -> Brands -> Products
    const [vendorName, setVendorName] = useState('');
    const [brands, setBrands] = useState([
        { 
            id: Date.now(), 
            name: '', 
            category: '',
            products: [{ 
                id: Date.now() + 1, 
                name: '', 
                description: '', 
                image: null, 
                variants: [{ id: Date.now() + 2, size: '', weight: '', dimensions: '', price: '' }],
                isExpanded: true 
            }] 
        }
    ]);

    useEffect(() => {
        if (currentCompanyId) {
            loadMetaData();
        }
    }, [currentCompanyId]);

    const loadMetaData = async () => {
        setLoading(true);
        try {
            const [cats, unts, registry] = await Promise.all([
                getGlobalCategories(currentCompanyId),
                getGlobalUnits(currentCompanyId),
                getVendorBrandRegistry(currentCompanyId)
            ]);
            setCategories(cats);
            setUnits(unts);
            const vendors = [...new Set(registry.map(r => r.vendor_name).filter(Boolean))];
            const brands = [...new Set(registry.map(r => r.brand_name).filter(Boolean))];
            setExistingVendors(vendors);
            setExistingBrands(brands);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Brand Management ---
    const addBrand = () => {
        setBrands([...brands, { 
            id: Date.now(), 
            name: '', 
            category: '',
            products: [{ 
                id: Date.now() + 1, 
                name: '', 
                description: '', 
                image: null, 
                variants: [{ id: Date.now() + 2, size: '', weight: '', dimensions: '', price: '' }],
                isExpanded: true 
            }] 
        }]);
    };

    const removeBrand = (id) => {
        if (brands.length > 1) setBrands(brands.filter(b => b.id !== id));
    };

    const updateBrand = (id, field, value) => {
        setBrands(brands.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    // --- Product Management ---
    const addProduct = (brandId) => {
        setBrands(brands.map(b => {
            if (b.id === brandId) {
                return { 
                    ...b, 
                    products: [...b.products, { 
                        id: Date.now(), 
                        name: '', 
                        description: '', 
                        image: null, 
                        variants: [{ id: Date.now() + 1, size: '', weight: '', dimensions: '', price: '' }],
                        isExpanded: true 
                    }] 
                };
            }
            return b;
        }));
    };

    const removeProduct = (brandId, productId) => {
        setBrands(brands.map(b => {
            if (b.id === brandId && b.products.length > 1) {
                return { ...b, products: b.products.filter(p => p.id !== productId) };
            }
            return b;
        }));
    };

    const updateProduct = (brandId, productId, field, value) => {
        setBrands(brands.map(b => {
            if (b.id === brandId) {
                return {
                    ...b,
                    products: b.products.map(p => p.id === productId ? { ...p, [field]: value } : p)
                };
            }
            return b;
        }));
    };

    // --- Variant Management ---
    const addVariant = (brandId, productId) => {
        setBrands(brands.map(b => {
            if (b.id === brandId) {
                return {
                    ...b,
                    products: b.products.map(p => {
                        if (p.id === productId) {
                            return { ...p, variants: [...p.variants, { id: Date.now(), size: '', weight: '', dimensions: '', price: '' }] };
                        }
                        return p;
                    })
                };
            }
            return b;
        }));
    };

    const removeVariant = (brandId, productId, variantId) => {
        setBrands(brands.map(b => {
            if (b.id === brandId) {
                return {
                    ...b,
                    products: b.products.map(p => {
                        if (p.id === productId && p.variants.length > 1) {
                            return { ...p, variants: p.variants.filter(v => v.id !== variantId) };
                        }
                        return p;
                    })
                };
            }
            return b;
        }));
    };

    const updateVariant = (brandId, productId, variantId, field, value) => {
        setBrands(brands.map(b => {
            if (b.id === brandId) {
                return {
                    ...b,
                    products: b.products.map(p => {
                        if (p.id === productId) {
                            return {
                                ...p,
                                variants: p.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v)
                            };
                        }
                        return p;
                    })
                };
            }
            return b;
        }));
    };

    // --- Image Handling ---
    const handleImageUpload = async (brandId, productId, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            updateProduct(brandId, productId, 'image', e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // --- Submission ---
    const handleSubmitAll = async () => {
        if (!vendorName.trim()) return alert("Please specify your company name.");
        if (!currentCompanyId) return alert("System Error: Company ID missing. Please refresh.");
        
        let valid = true;
        let productCount = 0;
        const allSubmissions = [];
        const toTitleCase = (str) => str ? str.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : '';

        brands.forEach(b => {
            if (!b.name.trim()) valid = false;
            const normalizedBrand = toTitleCase(b.name);
            const normalizedCategory = toTitleCase(b.category);
            
            b.products.forEach(p => {
                if (!p.name.trim()) valid = false;
                productCount++;
                allSubmissions.push({
                    vendor_name: toTitleCase(vendorName),
                    brand_name: normalizedBrand,
                    category: normalizedCategory,
                    product_name: p.name.trim(),
                    description: p.description,
                    image_url: p.image,
                    size_variants: p.variants.map(({ id, ...v }) => v),
                    sizes: p.variants.map(v => v.size).filter(Boolean),
                    status: 'discovery'
                });
            });
        });
        
        if (!valid) return alert("Please fill in all brand and product names.");
        if (productCount === 0) return alert("Please add at least one product.");

        setSubmitting(true);

        try {
            if (isAdmin && directPublish) {
                console.log("Admin Direct Publishing...");
                const productsToInsert = allSubmissions.map(s => ({
                    name: s.product_name,
                    brand: s.brand_name,
                    category: s.category || 'Uncategorized',
                    description: s.description || '',
                    size_variants: s.size_variants || [],
                    sizes: s.sizes || [],
                    image_url: s.image_url,
                    price: (s.size_variants && s.size_variants.length > 0) ? s.size_variants[0].price : null
                }));
                await addBulkProducts(currentCompanyId, productsToInsert);

                const brandsToSync = [...new Set(allSubmissions.map(s => s.brand_name))];
                for (const b of brandsToSync) {
                    const items = allSubmissions.filter(s => s.brand_name === b);
                    await saveVendorBrandEntry(currentCompanyId, null, {
                        vendor_name: toTitleCase(vendorName),
                        brand_name: b, // b is already normalized from allSubmissions.map(s => s.brand_name)
                        category: items[0].category || '',
                        notes: JSON.stringify(items.map(i => ({ name: i.product_name, sizes: i.sizes })))
                    });
                }
                alert("Successfully published directly to Catalogue and Registry!");
            } else {
                await addBulkSupplierSubmissions(currentCompanyId, allSubmissions);
                alert("Submission successful! Your data has been sent for review.");
            }
            
            // Update Global Categories list if new ones were added
            try {
                const currentCats = await getGlobalCategories(currentCompanyId);
                const submissionCats = [...new Set(allSubmissions.map(s => s.category).filter(Boolean))];
                const newCats = submissionCats.filter(c => !currentCats.includes(c));
                
                if (newCats.length > 0) {
                    await saveGlobalCategories(currentCompanyId, [...currentCats, ...newCats]);
                }
            } catch (catErr) {
                console.warn("Could not auto-update global categories:", catErr);
            }
            
            setVendorName('');
            setBrands([{ 
                id: Date.now(), 
                name: '', 
                category: '',
                products: [{ 
                    id: Date.now() + 1, 
                    name: '', 
                    description: '', 
                    image: null, 
                    variants: [{ id: Date.now() + 2, size: '', weight: '', dimensions: '', price: '' }],
                    isExpanded: true 
                }] 
            }]);
        } catch (err) {
            console.error(err);
            alert("Submission Failed: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '80px auto', padding: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                    Supplier Product Portal
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>Share your catalogue details for registration and inventory sync</p>
            </div>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', borderRadius: '20px', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#eff6ff', color: '#2563eb', padding: '12px', borderRadius: '12px' }}><Building2 size={24} /></div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Step 1: Your Information</h2>
                </div>
                <div style={{ maxWidth: '500px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Supplier / Vendor Name</label>
                    <input 
                        list="vendor-list"
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
                        placeholder="e.g. Tata Steel Ltd" 
                        value={vendorName} 
                        onChange={e => setVendorName(e.target.value)} 
                    />
                    <datalist id="vendor-list">
                        {existingVendors.map(v => <option key={v} value={v} />)}
                    </datalist>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingLeft: '1rem' }}>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '10px' }}><LayoutGrid size={20} /></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Step 2: Brands & Products</h2>
            </div>

            {brands.map((brand, bIdx) => (
                <div key={brand.id} className="card" style={{ marginBottom: '2rem', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white' }}>
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Brand Name</label>
                                <input 
                                    list="brand-list"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }} 
                                    placeholder="e.g. Tiscon" 
                                    value={brand.name} 
                                    onChange={e => updateBrand(brand.id, 'name', e.target.value)}
                                />
                                <datalist id="brand-list">
                                    {existingBrands.map(b => <option key={b} value={b} />)}
                                </datalist>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Category</label>
                                <input 
                                    list="category-list-main"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }} 
                                    placeholder="e.g. TMT Bars"
                                    value={brand.category} 
                                    onChange={e => updateBrand(brand.id, 'category', e.target.value)}
                                />
                                <datalist id="category-list-main">
                                    {categories.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                        </div>
                        {brands.length > 1 && (
                            <button onClick={() => removeBrand(brand.id)} style={{ marginLeft: '1.5rem', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        )}
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                        {brand.products.map((product, pIdx) => (
                            <div key={product.id} style={{ 
                                border: '1px solid #f1f5f9', 
                                borderRadius: '15px', 
                                marginBottom: pIdx === brand.products.length - 1 ? 0 : '1.5rem',
                                background: product.isExpanded ? '#fff' : '#f8fafc'
                            }}>
                                <div 
                                    onClick={() => updateProduct(brand.id, product.id, 'isExpanded', !product.isExpanded)}
                                    style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: '#eff6ff', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>{pIdx + 1}</div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: product.name ? '#0f172a' : '#94a3b8' }}>
                                                {product.name || 'New Product'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeProduct(brand.id, product.id); }}
                                            style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        {product.isExpanded ? <ChevronUp size={20} color="#cbd5e1" /> : <ChevronDown size={20} color="#cbd5e1" />}
                                    </div>
                                </div>

                                {product.isExpanded && (
                                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                                            <div>
                                                <div style={{ 
                                                    width: '100%', aspectRatio: '1', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer'
                                                }}>
                                                    {product.image ? (
                                                        <img src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <>
                                                            <ImageIcon size={32} color="#cbd5e1" />
                                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px', fontWeight: 700 }}>PHOTO</span>
                                                        </>
                                                    )}
                                                    <input 
                                                        type="file" accept="image/*" 
                                                        onChange={e => handleImageUpload(brand.id, product.id, e.target.files[0])}
                                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Product Name</label>
                                                    <input 
                                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                                                        placeholder="e.g. 12mm TMT Bar" 
                                                        value={product.name} 
                                                        onChange={e => updateProduct(brand.id, product.id, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Description</label>
                                                    <textarea 
                                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                                                        placeholder="Add specifications..." rows="3"
                                                        value={product.description} 
                                                        onChange={e => updateProduct(brand.id, product.id, 'description', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Variants</h4>
                                                <button 
                                                    onClick={() => addVariant(brand.id, product.id)}
                                                    style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    + ADD SIZE
                                                </button>
                                            </div>
                                            
                                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                                <thead>
                                                    <tr style={{ textAlign: 'left', fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8' }}>
                                                        <th style={{ padding: '0 8px' }}>SIZE</th>
                                                        <th style={{ padding: '0 8px' }}>WEIGHT</th>
                                                        <th style={{ padding: '0 8px' }}>DIMENSIONS</th>
                                                        <th style={{ padding: '0 8px' }}>PRICE (₹)</th>
                                                        <th style={{ width: '40px' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {product.variants.map((v, vIdx) => (
                                                        <tr key={v.id}>
                                                            <td style={{ padding: '0 4px' }}><input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="10mm" value={v.size} onChange={e => updateVariant(brand.id, product.id, v.id, 'size', e.target.value)} /></td>
                                                            <td style={{ padding: '0 4px' }}><input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="5kg" value={v.weight} onChange={e => updateVariant(brand.id, product.id, v.id, 'weight', e.target.value)} /></td>
                                                            <td style={{ padding: '0 4px' }}><input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="10x10" value={v.dimensions} onChange={e => updateVariant(brand.id, product.id, v.id, 'dimensions', e.target.value)} /></td>
                                                            <td style={{ padding: '0 4px' }}><input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} type="number" placeholder="0" value={v.price} onChange={e => updateVariant(brand.id, product.id, v.id, 'price', e.target.value)} /></td>
                                                            <td style={{ padding: '0 4px' }}>
                                                                <button onClick={() => removeVariant(brand.id, product.id, v.id)} disabled={product.variants.length === 1} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><X size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button 
                            onClick={() => addProduct(brand.id)}
                            style={{ 
                                width: '100%', marginTop: '1.5rem', padding: '1rem', background: '#fff', border: '2px dashed #cbd5e1', borderRadius: '15px', color: '#2563eb', fontWeight: 800, cursor: 'pointer'
                            }}
                        >
                            + ADD ANOTHER PRODUCT
                        </button>
                    </div>
                </div>
            ))}

            <button 
                onClick={addBrand}
                style={{ 
                    width: '100%', padding: '1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '4rem'
                }}
            >
                <Plus size={20} /> ADD ANOTHER BRAND
            </button>

            {/* Admin Controls */}
            {isAdmin && (
                <div style={{ 
                    background: '#eff6ff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #bfdbfe',
                    display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                    <input 
                        type="checkbox" id="direct-publish-website"
                        checked={directPublish}
                        onChange={e => setDirectPublish(e.target.checked)}
                        style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                    />
                    <div>
                        <label htmlFor="direct-publish-website" style={{ fontWeight: 800, color: '#1d4ed8', cursor: 'pointer', display: 'block', fontSize: '1rem' }}>
                            Admin Master Mode: Direct Entry
                        </label>
                        <p style={{ fontSize: '0.8rem', color: '#60a5fa', margin: 0 }}>Skip review and add products directly to the live Catalogue.</p>
                    </div>
                </div>
            )}

            <div style={{ 
                position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 2rem)', maxWidth: '600px', background: '#0f172a', padding: '1rem 2rem', borderRadius: '50px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', zIndex: 1000
            }}>
                <div style={{ color: '#fff' }}>
                    <div style={{ fontWeight: 900, fontSize: '1rem' }}>{directPublish ? 'Publish Directly?' : 'Ready to submit?'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{brands.length} Brands total</div>
                </div>
                <button 
                    onClick={handleSubmitAll} disabled={submitting}
                    style={{ 
                        background: directPublish ? '#10b981' : '#2563eb', color: '#fff', border: 'none', borderRadius: '30px', padding: '0.75rem 1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                >
                    {submitting ? 'PROCESSING...' : (directPublish ? 'PUBLISH LIVE' : 'SUBMIT CATALOGUE')} <Send size={18} />
                </button>
            </div>
        </div>
    );
}
