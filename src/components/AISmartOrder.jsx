import React, { useState, useEffect } from 'react';
import { Sparkles, X, CheckCircle, Mic, AlertCircle, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { parseOrderWithGemini } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';

export default function AISmartOrder({ onClose }) {
    const { addItem } = useCart();
    const [input, setInput] = useState('');
    const [results, setResults] = useState([]);
    const [smartItems, setSmartItems] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [products, setProducts] = useState([]);
    const hasGemini = !!import.meta.env.VITE_GEMINI_API_KEY;
    const recognitionRef = React.useRef(null);

    // Fetch catalogue on mount
    useEffect(() => {
        const fetchCatalogue = async () => {
            const companyId = detectCompanyFromDomain();
            if (!companyId) return;
            const { data } = await supabase.from('products').select('*').eq('company_id', companyId);
            if (data) setProducts(data);
        };
        fetchCatalogue();
    }, []);

    // Speech Recognition setup
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'hi-IN';

            rec.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                setInput(transcript);
            };

            rec.onerror = (event) => {
                console.error("Speech error:", event.error);
                if (event.error === 'not-allowed') {
                    alert("Microphone access was denied. Please allow microphone access and try again.");
                } else if (event.error !== 'no-speech') {
                    alert("Speech error: " + event.error);
                }
                setIsRecording(false);
            };

            rec.onend = () => setIsRecording(false);

            recognitionRef.current = rec;
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Voice recording is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (e) {
                console.error("Recognition start error:", e);
                // Try to stop and restart if it's in a bad state
                try {
                    recognitionRef.current.stop();
                    setTimeout(() => {
                        recognitionRef.current.start();
                        setIsRecording(true);
                    }, 100);
                } catch(err) {}
            }
        }
    };

    // Multilingual Translation Map
    const translationMap = {
        'gatthi': 'bundles', 'kattalu': 'bundles', 'kattu': 'bundles',
        'nag': 'pieces', 'mukkalu': 'pieces', 'tukde': 'pieces',
        'kilo': 'kg', 'kilu': 'kg',
        'ek': '1', 'do': '2', 'teen': '3', 'char': '4', 'panch': '5',
        'das': '10', 'padi': '10', 'vanda': '100', 'sau': '100',
        'chahiye': '', 'kavali': '', 'pampandi': '', 'bhejo': ''
    };

    const processLocalInput = (text) => {
        try {
            if (!text || !text.trim() || products.length === 0) return [];
            let cleanText = text.toLowerCase();
            Object.entries(translationMap).forEach(([key, val]) => {
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                cleanText = cleanText.replace(regex, val);
            });

            const items = cleanText.split(/and|,|\.|\bthen\b/).filter(i => i.trim());
            return items.map(query => {
                const qtyMatch = query.match(/\d+/);
                const quantity = qtyMatch ? parseInt(qtyMatch[0]) : 1;
                const searchTerm = query.replace(/\d+/, '').trim();
                if (!searchTerm) return null;

                const keywords = searchTerm.split(/\s+/).filter(k => k.length >= 2);
                let bestMatch = null;
                let highestScore = 0;

                products.forEach(p => {
                    let score = 0;
                    const pName = (p.name || '').toLowerCase();
                    const pBrand = (p.brand || '').toLowerCase();
                    
                    let pVariants = '';
                    if (p.size_variants) {
                       pVariants = p.size_variants.map(v => v.size.toLowerCase()).join(' ');
                    } else if (p.size) {
                       if (typeof p.size === 'string') pVariants = p.size.toLowerCase();
                       else if (Array.isArray(p.size)) pVariants = p.size.join(' ').toLowerCase();
                    } else if (p.sizes && Array.isArray(p.sizes)) {
                       pVariants = p.sizes.join(' ').toLowerCase();
                    }

                    keywords.forEach(k => {
                        if (pName.includes(k)) score += 10;
                        if (pBrand.includes(k)) score += 5;
                        if (pVariants.includes(k)) score += 8;
                    });

                    if (score > highestScore) {
                        highestScore = score;
                        bestMatch = p;
                    }
                });

                if (bestMatch && highestScore > 5) {
                    let selectedSize = '';
                    let pVariants = [];
                    if (bestMatch.size_variants) pVariants = bestMatch.size_variants.map(v => v.size);
                    else if (Array.isArray(bestMatch.size)) pVariants = bestMatch.size;
                    else if (Array.isArray(bestMatch.sizes)) pVariants = bestMatch.sizes;
                    else if (typeof bestMatch.size === 'string') pVariants = bestMatch.size.split(',').map(s=>s.trim());

                    if (pVariants.length > 0) {
                        selectedSize = pVariants[0];
                        pVariants.forEach(v => {
                            if (searchTerm.includes(v.toLowerCase())) selectedSize = v;
                        });
                    }

                    return { original: query, product: bestMatch, quantity, selectedSize };
                }
                return { original: query, product: null, quantity };
            }).filter(m => m !== null);
        } catch (e) {
            return [];
        }
    };

    // Split and commit input whenever trigger words like "next", "then", "aur" are spoken/typed
    useEffect(() => {
        const checkForTriggersAndParse = async () => {
            if (!input || !input.trim() || products.length === 0) return;

            const triggers = ['next', 'then', 'aur'];
            let matchedTrigger = null;
            let splitIndex = -1;

            for (const trigger of triggers) {
                const regex = new RegExp(`\\b${trigger}\\b`, 'i');
                const match = input.match(regex);
                if (match) {
                    matchedTrigger = trigger;
                    splitIndex = match.index;
                    break;
                }
            }

            if (matchedTrigger && splitIndex !== -1) {
                const partToCommit = input.substring(0, splitIndex).trim();
                const remainingPart = input.substring(splitIndex + matchedTrigger.length).trim();

                if (partToCommit) {
                    setIsProcessing(true);
                    let parsed = [];
                    try {
                        if (hasGemini && partToCommit.length > 5) {
                            const geminiData = await parseOrderWithGemini(partToCommit, products);
                            if (geminiData && Array.isArray(geminiData)) {
                                parsed = geminiData.map(item => ({
                                    original: item.original || "Smart Match",
                                    product: products.find(p => p.id === item.product_id) || null,
                                    quantity: item.quantity || 1,
                                    selectedSize: item.selectedSize || null
                                }));
                            } else {
                                parsed = processLocalInput(partToCommit);
                            }
                        } else {
                            parsed = processLocalInput(partToCommit);
                        }
                    } catch (err) {
                        parsed = processLocalInput(partToCommit);
                    }

                    if (parsed.length > 0) {
                        setSmartItems(prev => {
                            let updated = [...prev];
                            parsed.forEach(res => {
                                if (!res.product) return;
                                const existingIdx = updated.findIndex(item => 
                                    item.product?.id === res.product?.id && 
                                    item.selectedSize === res.selectedSize
                                );
                                
                                const defaultSize = res.product.size_variants?.[0]?.size || (Array.isArray(res.product.size) ? res.product.size[0] : (typeof res.product.size === 'string' ? res.product.size.split(',')[0].trim() : ''));
                                const sizeToUse = res.selectedSize || defaultSize;

                                if (existingIdx > -1) {
                                    updated[existingIdx] = {
                                        ...updated[existingIdx],
                                        quantity: updated[existingIdx].quantity + res.quantity
                                    };
                                } else {
                                    updated.push({
                                        id: Math.random().toString(),
                                        product: res.product,
                                        quantity: res.quantity,
                                        selectedSize: sizeToUse,
                                        original: res.original
                                    });
                                }
                            });
                            return updated;
                        });
                    }
                    setIsProcessing(false);
                }

                setResults([]);
                setInput(remainingPart);
            }
        };

        checkForTriggersAndParse();
    }, [input, products, hasGemini]);

    // Handle normal debounce parsing for live preview
    useEffect(() => {
        const handleProcess = async () => {
            const triggers = ['next', 'then', 'aur'];
            if (triggers.some(t => new RegExp(`\\b${t}\\b`, 'i').test(input))) {
                return;
            }

            if (!input || !input.trim() || products.length === 0) {
                setResults([]);
                return;
            }

            try {
                if (hasGemini && input.length > 5) {
                    setIsProcessing(true);
                    const geminiData = await parseOrderWithGemini(input, products);
                    if (geminiData && Array.isArray(geminiData)) {
                        setResults(geminiData.map(item => ({
                            original: item.original || "Smart Match",
                            product: products.find(p => p.id === item.product_id) || null,
                            quantity: item.quantity || 1,
                            selectedSize: item.selectedSize || null
                        })));
                    } else {
                        setResults(processLocalInput(input));
                    }
                    setIsProcessing(false);
                } else {
                    setResults(processLocalInput(input));
                }
            } catch (err) {
                setResults(processLocalInput(input));
                setIsProcessing(false);
            }
        };

        const timeout = setTimeout(handleProcess, 600);
        return () => clearTimeout(timeout);
    }, [input, products, hasGemini]);

    const commitCurrentResults = () => {
        if (results.length === 0) return;
        
        setSmartItems(prev => {
            let updated = [...prev];
            results.forEach(res => {
                if (!res.product) return;
                const existingIdx = updated.findIndex(item => 
                    item.product?.id === res.product?.id && 
                    item.selectedSize === res.selectedSize
                );
                
                const defaultSize = res.product.size_variants?.[0]?.size || (Array.isArray(res.product.size) ? res.product.size[0] : (typeof res.product.size === 'string' ? res.product.size.split(',')[0].trim() : ''));
                const sizeToUse = res.selectedSize || defaultSize;

                if (existingIdx > -1) {
                    updated[existingIdx] = {
                        ...updated[existingIdx],
                        quantity: updated[existingIdx].quantity + res.quantity
                    };
                } else {
                    updated.push({
                        id: Math.random().toString(),
                        product: res.product,
                        quantity: res.quantity,
                        selectedSize: sizeToUse,
                        original: res.original
                    });
                }
            });
            return updated;
        });
        
        setInput('');
        setResults([]);
    };

    // Intelligent auto-commit: automatically add parsed preview to the list after 1.5 seconds of silence/inactivity
    useEffect(() => {
        if (!input || results.length === 0) return;

        const hasValidProduct = results.some(r => r.product);
        if (!hasValidProduct) return;

        const autoCommitTimeout = setTimeout(() => {
            commitCurrentResults();
        }, 1500); // 1.5s pause threshold

        return () => clearTimeout(autoCommitTimeout);
    }, [input, results]);

    // Instantly commit if user stops speech recording manually
    useEffect(() => {
        if (!isRecording && results.length > 0 && input.trim()) {
            commitCurrentResults();
        }
    }, [isRecording]);

    const addIndividualToSmartItems = (res) => {
        if (!res.product) return;
        setSmartItems(prev => {
            let updated = [...prev];
            const existingIdx = updated.findIndex(item => 
                item.product?.id === res.product?.id && 
                item.selectedSize === res.selectedSize
            );
            
            const defaultSize = res.product.size_variants?.[0]?.size || (Array.isArray(res.product.size) ? res.product.size[0] : (typeof res.product.size === 'string' ? res.product.size.split(',')[0].trim() : ''));
            const sizeToUse = res.selectedSize || defaultSize;

            if (existingIdx > -1) {
                updated[existingIdx] = {
                    ...updated[existingIdx],
                    quantity: updated[existingIdx].quantity + res.quantity
                };
            } else {
                updated.push({
                    id: Math.random().toString(),
                    product: res.product,
                    quantity: res.quantity,
                    selectedSize: sizeToUse,
                    original: res.original
                });
            }
            return updated;
        });

        setResults(prev => prev.filter(item => item !== res));
    };

    const handleAddAll = () => {
        const itemsToAdd = [];

        // Add from accumulated smartItems
        smartItems.forEach(item => {
            if (item.product) {
                itemsToAdd.push({
                    product: item.product,
                    size: item.selectedSize,
                    quantity: item.quantity
                });
            }
        });

        // Add from current live preview draft
        results.forEach(res => {
            if (res.product) {
                const defaultSize = res.product.size_variants?.[0]?.size || (Array.isArray(res.product.size) ? res.product.size[0] : (typeof res.product.size === 'string' ? res.product.size.split(',')[0].trim() : ''));
                const sizeToUse = res.selectedSize || defaultSize;
                itemsToAdd.push({
                    product: res.product,
                    size: sizeToUse,
                    quantity: res.quantity
                });
            }
        });

        itemsToAdd.forEach(item => {
            addItem(item.product, item.size, item.quantity, 'pieces');
        });

        setInput('');
        setResults([]);
        setSmartItems([]);
        if (onClose) onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commitCurrentResults();
        }
    };

    return (
        <div style={{
            padding: '1.5rem', background: '#0f172a', borderRadius: '20px', color: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid #1e293b',
            position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Minimal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: '#1e293b', padding: '8px', borderRadius: '10px' }}>
                            <Sparkles size={18} color="#fbbf24" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Poonam AI Assistant</h3>
                            <p style={{ margin: 0, fontSize: '0.6rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                                {isProcessing ? "Analyzing input..." : (hasGemini ? 'Gemini 2.0 Engine' : 'Local Intelligence')}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Input Area */}
                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                    <textarea
                        value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? "Listening..." : "Paste your WhatsApp order or speak... (Say 'next' to separate items)"}
                        style={{
                            width: '100%', minHeight: '100px', background: '#020617',
                            border: isRecording ? '1px solid #ef4444' : '1px solid #1e293b',
                            borderRadius: '12px', padding: '1rem', color: 'white', fontSize: '0.95rem',
                            outline: 'none', transition: 'all 0.2s', resize: 'none', lineHeight: '1.5'
                        }}
                    />
                    <button
                        onClick={toggleRecording}
                        style={{
                            position: 'absolute', bottom: '10px', right: '10px',
                            background: isRecording ? '#ef4444' : '#1e293b', border: 'none',
                            borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                    >
                        {isRecording ? <X size={18} color="white" /> : <Mic size={18} color="white" />}
                    </button>
                </div>

                {/* Detected Items Preview */}
                {results.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a1a1aa' }}>Detected Preview</span>
                            <button
                                onClick={commitCurrentResults}
                                style={{
                                    background: '#1d4ed8', border: 'none', color: '#93c5fd',
                                    borderRadius: '6px', padding: '2px 8px', fontSize: '0.7rem',
                                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                            >
                                <Plus size={10} /> Add All
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {results.map((res, i) => (
                                <div key={i} style={{
                                    background: res.product ? '#14532d' : '#450a0a',
                                    color: res.product ? '#4ade80' : '#f87171',
                                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem',
                                    fontWeight: 700, border: res.product ? '1px solid #166534' : '1px solid #7f1d1d',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}>
                                    {res.product ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                    {res.quantity}x {res.product ? res.product.name : res.original}
                                    {res.selectedSize && ` (${res.selectedSize})`}
                                    {res.product && (
                                        <button
                                            onClick={() => addIndividualToSmartItems(res)}
                                            style={{
                                                background: '#166534', border: 'none', color: 'white',
                                                borderRadius: '50%', width: '16px', height: '16px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', padding: 0, marginLeft: '4px'
                                            }}
                                            title="Add to Smart List"
                                        >
                                            <Plus size={10} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Persistent Smart Order List */}
                {smartItems.length > 0 && (
                    <div style={{
                        marginBottom: '1.25rem',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>Smart Order List ({smartItems.length})</span>
                            <button 
                                onClick={() => setSmartItems([])} 
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                CLEAR ALL
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {smartItems.map((item) => {
                                let sizeVariants = [];
                                if (item.product.size_variants) {
                                    sizeVariants = item.product.size_variants.map(v => v.size);
                                } else if (Array.isArray(item.product.size)) {
                                    sizeVariants = item.product.size;
                                } else if (Array.isArray(item.product.sizes)) {
                                    sizeVariants = item.product.sizes;
                                } else if (typeof item.product.size === 'string') {
                                    sizeVariants = item.product.size.split(',').map(s => s.trim());
                                }

                                return (
                                    <div key={item.id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                                        background: '#0f172a', padding: '6px 10px', borderRadius: '8px', border: '1px solid #1e293b'
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.product.name}
                                            </div>
                                            <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>
                                                {item.product.brand || 'No Brand'}
                                            </div>
                                        </div>

                                        {/* Size Selector */}
                                        {sizeVariants.length > 0 && (
                                            <select
                                                value={item.selectedSize || ''}
                                                onChange={(e) => {
                                                    const newSize = e.target.value;
                                                    setSmartItems(prev => prev.map(si => si.id === item.id ? { ...si, selectedSize: newSize } : si));
                                                }}
                                                style={{
                                                    background: '#020617', color: 'white', border: '1px solid #1e293b',
                                                    borderRadius: '6px', fontSize: '0.7rem', padding: '2px 4px', outline: 'none', cursor: 'pointer'
                                                }}
                                            >
                                                {sizeVariants.map(v => (
                                                    <option key={v} value={v}>{v}</option>
                                                ))}
                                            </select>
                                        )}

                                        {/* Quantity Controls */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '2px' }}>
                                            <button
                                                onClick={() => {
                                                    if (item.quantity > 1) {
                                                        setSmartItems(prev => prev.map(si => si.id === item.id ? { ...si, quantity: si.quantity - 1 } : si));
                                                    } else {
                                                        setSmartItems(prev => prev.filter(si => si.id !== item.id));
                                                    }
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, minWidth: '14px', textAlign: 'center' }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setSmartItems(prev => prev.map(si => si.id === item.id ? { ...si, quantity: si.quantity + 1 } : si));
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => setSmartItems(prev => prev.filter(si => si.id !== item.id))}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    disabled={smartItems.length === 0 && !results.some(r => r.product)} onClick={handleAddAll}
                    style={{
                        width: '100%', padding: '0.85rem',
                        background: (smartItems.length > 0 || results.some(r => r.product)) ? '#3b82f6' : '#1e293b',
                        color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem',
                        cursor: (smartItems.length > 0 || results.some(r => r.product)) ? 'pointer' : 'not-allowed',
                        opacity: (smartItems.length > 0 || results.some(r => r.product)) ? 1 : 0.5,
                        transition: 'all 0.2s'
                    }}
                >
                    ADD ALL TO CART {smartItems.length > 0 ? `(${smartItems.reduce((acc, i) => acc + i.quantity, 0)} ITEMS)` : ''}
                </button>
            </div>
        </div>
    );
}
