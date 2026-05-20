import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const parseOrderWithGemini = async (input, products) => {
    if (!genAI) {
        console.warn("Gemini API key missing. Using local smart matcher instead.");
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Robustly extract sizes from various possible formats in the database schema
        const productContext = products.map(p => {
            let extractedSizes = [];
            if (p.size_variants && Array.isArray(p.size_variants) && p.size_variants.length > 0) {
                extractedSizes = p.size_variants.map(v => v.size);
            } else if (p.sizes && Array.isArray(p.sizes)) {
                extractedSizes = p.sizes;
            } else if (p.size) {
                if (typeof p.size === 'string') {
                    extractedSizes = p.size.split(',').map(s => s.trim());
                } else if (Array.isArray(p.size)) {
                    extractedSizes = p.size;
                }
            }
            return {
                id: p.id,
                name: p.name,
                brand: p.brand,
                category: p.category,
                sizes: extractedSizes
            };
        });

        const prompt = `
You are an expert order-parsing assistant for a B2B stainless steel utensils and hardware wholesale business in India.
Parse the following customer wholesale order into a structured JSON array. The order may be written in English, Hindi, Telugu, or a mix (Hinglish/Teluglish) of these languages, using colloquial phrases, regional units, and phonetic spelling.

INPUT ORDER:
"${input}"

PRODUCT CATALOGUE (Match items against these products only):
${JSON.stringify(productContext.slice(0, 150))}

COMPREHENSIVE MULTILINGUAL DICTIONARY & UNIT MAP:
- Units / Quantity indicators:
  * Hindi: gatthi / gatti / kattu / bundle = bundle, nag / tukda / tukde / piece = piece, kilo / kg = kg, dozen / dojan = 12
  * Telugu: kattalu / gatthi / kattu = bundle, mukkalu / mukka / nag / piece = piece, kilo / kg = kg
- Numbers / Quantities:
  * Hindi: ek=1, do=2, teen/tin=3, char/chaar=4, panch/paanch=5, chhe/che/chey=6, saat=7, aath=8, nau/no=9, das/dass=10, bees/bis=20, tees/tis=30, chalis=40, pachas=50, sau/soo=100
  * Telugu: okati/oka=1, rendu=2, moodu/mudu=3, nalugu/nalgu=4, aidu/ayidu=5, aaru/aru=6, yedu/edu=7, enimidi/enmidi=8, thommidi/thmidi=9, padi/paddi=10, iravai=20, muppai=30, nalubhai/nalabhai=40, yabhai/yaabhai=50, aravai=60, debbhai=70, yenabhai/enabhai=80, thombhai=90, nooru/vanda=100
- Common Colloquial Product Names / Synonyms / Aliases:
  * Tope / Topa / Toap -> Tope
  * Patila / Patili / Patela / Degh -> Patila / Tope
  * Kadhai / Kadai / Karahi / Cheena Chatti -> Kadhai
  * Tasla / Tasala / Ghamela / Chauka -> Tasla
  * Thali / Plate / Taali / Kancham / Bhojanam Plate -> Thali / Plates
  * Glass / Gelas / Gilash / Tumbler / Chembu -> Glasses
  * Bowl / Katori / Ginne / Ginnelu / Vati -> Bowl
  * Spoon / Spoonlu / Chamchi / Chamcha / Spoons -> Spoons / Ladles
  * Ladle / Karandi / Teesa / Garite / Garitelu -> Spoons / Ladles
- Hindi Filler Words to ignore: chahiye, dena, bhejo, lana, mangwao, kar do, phekna, de do
- Telugu Filler Words to ignore: kavali, pampandi, ivvandi, teesukondi, pampu, eeyandi

PARSING & MATCHING RULES:
1. Extract quantity (resolving words like "dozen" to 12, "ek" to 1, "rendu" to 2, etc.), raw product name, brand (if specified), and size/volume (if specified).
2. Match each item to the closest product in the PRODUCT CATALOGUE by checking name, brand, category, or semantic similarity.
3. If a size is mentioned (e.g. "14 inch", "no.12", "5 Litres", "10 size"), extract it and include it exactly in "selectedSize". It must match one of the sizes in the matched product's sizes array if possible, or represent the closest volume/dimension description.
4. If no clear match is found in the catalogue for a specific item, set "product_id" to null and "confidence" to 0.
5. Return ONLY a valid JSON array. Do not wrap in markdown blocks, do not write explanations, and do not include extra commentary.

EXAMPLE INPUT:
"2 topa no.12, rendu commercial kadhai, and 3 dozen katori 3 inch"

EXPECTED OUTPUT (Strictly JSON):
[
  {"product_id": "tope-id-here", "quantity": 2, "selectedSize": "no.12", "original": "2 topa no.12", "confidence": 0.95},
  {"product_id": "kadhai-id-here", "quantity": 2, "selectedSize": "Commercial", "original": "rendu commercial kadhai", "confidence": 0.92},
  {"product_id": "bowl-id-here", "quantity": 36, "selectedSize": "3 inch", "original": "3 dozen katori 3 inch", "confidence": 0.90}
]

RETURN ONLY THE JSON ARRAY:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Robustly extract JSON array from response (handles markdown blocks, extra text)
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return null;
        
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
        console.error("Gemini Error:", error);
        return null;
    }
};
