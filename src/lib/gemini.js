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

        const productContext = products.map(p => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            sizes: (p.size_variants || []).map(v => v.size)
        }));

        const prompt = `
            You are an expert sales assistant for a steel and hardware ERP.
            Parse the following natural language order input into a JSON array of items.
            
            INPUT: "${input}"
            
            CATALOGUE CONTEXT (JSON): ${JSON.stringify(productContext.slice(0, 100))}
            
            RULES:
            1. Extract Quantity, Product Name, Brand, and Size.
            2. Match items to the provided CATALOGUE as accurately as possible.
            3. Handle Hindi (e.g. gatthi=bundle, nag=piece, das=10) and Telugu (e.g. kattalu=bundle, mukkalu=piece, padi=10).
            4. Return ONLY a valid JSON array of objects with this schema: 
               {"product_id": "ID", "quantity": number, "selectedSize": "Size", "confidence": 0-1}
            5. If an item is not found, exclude it or mark confidence low.
            
            RETURN ONLY THE JSON ARRAY. NO MARKDOWN. NO EXPLANATION.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean markdown if AI returned it
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Error:", error);
        return null;
    }
};
