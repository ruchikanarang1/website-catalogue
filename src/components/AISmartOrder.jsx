import React, { useState, useEffect } from 'react';
import { Sparkles, X, CheckCircle, Mic, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { parseOrderWithGemini } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';

export default function AISmartOrder({ onClose }) {
    const { addItem } = useCart();
    const [input, setInput] = useState('');
    const [results, setResults] = useState([]);
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
            rec.lang = 'en-IN';

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
                    alert("Microphone access was denied or is not allowed on this connection (e.g. testing on a phone over HTTP).");
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

    useEffect(() => {
        const handleProcess = async () => {
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

    const handleAddAll = () => {
        results.forEach(res => {
            if (res.product) addItem(res.product, res.selectedSize, res.quantity, 'pieces');
        });
        setInput('');
        setResults([]);
        if (onClose) onClose();
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
                        placeholder={isRecording ? "Listening..." : "Paste your WhatsApp order or speak..."}
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

                {/* Detected Items Chips */}
                {results.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
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
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Simple Action Button */}
                <button
                    disabled={!results.some(r => r.product)} onClick={handleAddAll}
                    style={{
                        width: '100%', padding: '0.85rem',
                        background: results.some(r => r.product) ? '#3b82f6' : '#1e293b',
                        color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem',
                        cursor: results.some(r => r.product) ? 'pointer' : 'not-allowed',
                        opacity: results.some(r => r.product) ? 1 : 0.5,
                        transition: 'all 0.2s'
                    }}
                >
                    ADD ALL TO CART
                </button>
            </div>
        </div>
    );
}
