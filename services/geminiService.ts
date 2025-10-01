



import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { NicheTrendResult, CompetitorAnalysisResult, SalesCopyResult, GroundingChunk, CompetitorDiscoveryResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

/**
 * A robust JSON parser that attempts to parse the AI's response.
 * It first tries to parse the whole text, then falls back to extracting from a markdown block.
 * @param response The raw response from the AI model.
 * @returns A parsed JSON object of type T.
 * @throws An error with a user-friendly message if parsing fails.
 */
const processJsonResponse = <T,>(response: GenerateContentResponse): T => {
    const rawText = response.text;
    if (!rawText) {
        throw new Error("AI tidak memberikan respons. Mohon coba lagi.");
    }

    try {
        // First attempt: parse the entire string directly.
        // This works if the model respects responseMimeType and returns only JSON.
        const parsedData = JSON.parse(rawText);
         if (typeof parsedData !== 'object' || parsedData === null) {
            throw new Error("Parsed JSON is not an object.");
        }
        return parsedData as T;
    } catch (e) {
        // Second attempt: extract from a markdown code block.
        // This is a fallback for when the model wraps the JSON in ```json ... ```.
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = rawText.match(jsonRegex);
        if (match && match[1]) {
            try {
                const parsedData = JSON.parse(match[1]);
                if (typeof parsedData !== 'object' || parsedData === null) {
                    throw new Error("Parsed JSON from markdown is not an object.");
                }
                return parsedData as T;
            } catch (error) {
                console.error("Failed to parse JSON from markdown:", error, "Raw content:", match[1]);
                throw new Error("AI memberikan respons JSON yang tidak valid. Ini bisa terjadi saat lalu lintas tinggi. Mohon coba lagi.");
            }
        }
    }
    
    console.error("No valid JSON found in AI response. Raw text:", rawText);
    throw new Error("Gagal mem-parsing respons dari AI karena tidak mengandung format JSON yang valid. Mohon coba lagi.");
};


export const analyzeNicheTrend = async (keywords: string): Promise<NicheTrendResult> => {
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            dominantVibe: {
                type: Type.OBJECT,
                properties: {
                    style: { type: Type.STRING, description: "Nama gaya visual yang dominan, mis. 'Minimalis Kontemporer'" },
                    details: { type: Type.STRING, description: "Detail spesifik tentang vibe, mis. 'Penggunaan warna Sage Green dan font sans-serif'" }
                },
                required: ["style", "details"]
            },
            hiddenNiche: {
                type: Type.OBJECT,
                properties: {
                    trend: { type: Type.STRING, description: "Nama tren turunan yang spesifik dan tersembunyi." },
                    explanation: { type: Type.STRING, description: "Penjelasan singkat mengapa tren ini adalah peluang." }
                },
                required: ["trend", "explanation"]
            },
            trendLifecycle: {
                type: Type.OBJECT,
                properties: {
                    phase: { type: Type.STRING, enum: ["Baru", "Berkembang", "Matang", "Menurun"], description: "Fase siklus hidup tren saat ini." },
                    recommendation: { type: Type.STRING, description: "Rekomendasi tindakan singkat berdasarkan fase tren." },
                    confidence: { type: Type.STRING, enum: ["Tinggi", "Sedang", "Rendah"], description: "Tingkat kepercayaan (confidence) terhadap klasifikasi fase tren." },
                    confidenceReason: { type: Type.STRING, description: "Alasan singkat untuk tingkat kepercayaan yang diberikan." }
                },
                 required: ["phase", "recommendation", "confidence", "confidenceReason"]
            },
             socialMediaTrends: {
                type: Type.OBJECT,
                properties: {
                    trendingHashtags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Daftar 3-5 hashtag paling relevan dan sedang tren di Instagram/TikTok."
                    },
                    popularContentFormats: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                format: { type: Type.STRING, description: "Nama format konten, mis. 'Reels/TikTok Video'." },
                                description: { type: Type.STRING, description: "Deskripsi singkat tentang cara menggunakan format ini untuk niche tersebut." }
                            },
                            required: ["format", "description"]
                        },
                        description: "Daftar 2-3 format konten paling populer dan efektif untuk niche ini."
                    }
                },
                required: ["trendingHashtags", "popularContentFormats"]
            }
        },
        required: ["dominantVibe", "hiddenNiche", "trendLifecycle", "socialMediaTrends"]
    };
    
    const prompt = `
ROLE: Elite Market Futurist for an Indonesian VC firm. Your goal is to find 'alpha' for SMEs.
TASK: Conduct a comprehensive market analysis for the user's input.
USER INPUT: "${keywords}"

MISSION BRIEF:
1.  **Dominant Vibe Analysis:**
    *   Identify the core psychological feel (e.g., 'approachable luxury', 'nostalgic comfort').
    *   Translate this into tangible visuals for the Indonesian market (colors, fonts, photo styles).
    *   Example: For "coffee," don't just say "Minimalist." Say "Warm Minimalism using terracotta palettes and natural light to create a serene, 'slow-living' atmosphere."

2.  **Hidden Niche Opportunity (Blue Ocean Hunting):**
    *   Go beyond the obvious. Find an intersection of trends or an unmet derivative need.
    *   Example: Input "skincare." Don't say "serum." A better answer: "Microbiome-friendly fermented rice water toners," explaining it combines the K-beauty trend with a demand for gentle, natural ingredients.
    *   Clearly state WHY it's an opportunity (e.g., 'Leverages the 'clean beauty' wave while tapping into Indonesian heritage ingredients').

3.  **Trend Lifecycle Analysis:**
    *   Classify the trend's phase: 'Baru' (New), 'Berkembang' (Growing), 'Matang' (Mature), 'Menurun' (Declining).
    *   Provide ONE single, highly strategic recommendation for that phase. Example for 'Growing' phase: "Dominate a sub-niche (e.g., vegan leather bags) before the main market saturates."
    *   State your confidence level ('Tinggi', 'Sedang', 'Rendah') and justify it with a single data-driven reason. Example: "Confidence: Tinggi. Search volume for 'vegan leather' increased 150% YoY in Indonesia."

4.  **Social Media Action Plan:**
    *   Identify 3-5 high-impact, trending hashtags on Instagram/TikTok, avoiding generic ones.
    *   Detail 2-3 popular content formats with concrete ideas. Example: "Format: 'ASMR Unboxing Reels.' Show the tactile experience of your product's packaging with high-quality sound to trigger a sensory response."

OUTPUT: Strictly adhere to the provided JSON schema. No extra text or explanations.`;


    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: "You are an expert market trend analyst for Indonesian Small-Medium Enterprises (SMEs). Provide structured, actionable insights in the requested JSON format.",
            responseMimeType: "application/json",
            responseSchema,
        }
    });
    
    return processJsonResponse<NicheTrendResult>(response);
};

export const discoverCompetitors = async (productInfo: string): Promise<{ analysis: CompetitorDiscoveryResult, sources: GroundingChunk[] }> => {
    const prompt = `
ROLE: Corporate Investigator specializing in the Indonesian competitive landscape.
TASK: Identify direct and indirect competitors for: "${productInfo}".
DATA SOURCE: Use Google Search. Prioritize Indonesian e-commerce sites (Tokopedia, Shopee), social media (Instagram), and local brand websites.

MISSION BRIEF:
1.  **Deep Search & Filtering:**
    *   Find specific businesses in Indonesia.
    *   **CRITICAL FILTER:** Ignore generic listicles ('10 best...'), aggregators, and pure marketplaces. Focus on actual brands or service providers.
2.  **Categorize Competitors:**
    *   **Direct Competitors:** Offer a near-identical solution to the same customer problem.
    *   **Indirect Competitors:** Solve the same core problem but with a different product, service, or approach.
3.  **Analyze & Justify:**
    *   Identify up to 5 direct and 5 indirect competitors. Include a mix of established players and innovative newcomers.
    *   For each, provide a concise, strategic "reason." This must answer: "Why would a customer choose them over others?" Focus on their unique selling proposition, not just what they sell.

OUTPUT FORMAT: A single, valid JSON object inside a markdown block. No text outside the JSON block.

JSON Structure:
\`\`\`json
{
  "directCompetitors": [
    {
      "name": "Direct Competitor Name",
      "type": "Type (e.g., E-commerce Brand, Instagram Store, Physical Restaurant)",
      "reason": "Concise reason explaining their competitive edge (e.g., 'Dominates the budget-conscious segment with aggressive pricing and promotions')."
    }
  ],
  "indirectCompetitors": [
    {
      "name": "Indirect Competitor Name",
      "type": "Type",
      "reason": "Concise reason for how they solve the same problem differently (e.g., 'Offers a cheaper DIY alternative to a full-service solution')."
    }
  ]
}
\`\`\`
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    const analysis = processJsonResponse<CompetitorDiscoveryResult>(response);
    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

    return { analysis, sources };
};


export const analyzeCompetitor = async (competitorIdentifier: string, focusKeywords?: string): Promise<{ analysis: CompetitorAnalysisResult, sources: GroundingChunk[] }> => {
    
    const focusPrompt = focusKeywords
        ? `SPECIAL FOCUS: The user is particularly interested in "${focusKeywords}". Every analysis point must be viewed through this lens.`
        : '';
    
    const prompt = `
ROLE: Elite Competitive Intelligence Operator. Your mission is to dissect a competitor's strategy and identify exploitable gaps.
TARGET: "${competitorIdentifier}".
DATA SOURCE: Use Google Search to find real-time data from Indonesian product pages, social media, customer reviews, and forums.
${focusPrompt}

MISSION BRIEF (Execute all steps):

1.  **Product Description Analysis:**
    *   **SEO Strength:** Identify 3-5 primary keywords they rank for.
    *   **Emotional Appeal:** What is the core emotional trigger they pull? (e.g., Aspiration, Security, FOMO).

2.  **Pricing & Value Proposition:**
    *   **Price Point Analysis:** Define their market position (e.g., Premium, Mid-Range, Budget-Friendly).
    *   **Value Proposition:** What are customers *really* buying? (e.g., Not just coffee, but a 'social status symbol').
    *   **Price Range:** Provide a numeric [min, max] price range if possible. If not, return null.

3.  **Customer Sentiment Analysis (Field Intel):**
    *   Synthesize reviews from multiple platforms.
    *   **Top Praise (3 points):** Frame these as "Marketing Angles to Amplify." How can the user replicate or improve upon this?
    *   **Top Complaints (3 points):** Frame these as a "Product Improvement Roadmap." What are the clear opportunities?

4.  **Social Proof Scan:**
    *   **Testimonials:** Quote 1-2 powerful testimonials highlighting a core benefit.
    *   **Star Rating:** Format as "4.8/5 (1,234 reviews)".
    *   **UGC Strategy:** Describe their User-Generated Content strategy (e.g., "Actively encourages UGC through contests and by featuring customer photos prominently.").

5.  **Relevant Keywords:** List 5-7 top keywords (product, brand, problem solved).

6.  **SWOT Analysis (Attacker's Perspective):**
    *   This SWOT must be from the perspective of a user wanting to compete.
    *   Weakness Example: "Over-reliance on a single influencer creates a vulnerability if the contract ends."
    *   Opportunity Example: "They have a strong product but weak community engagement; an opportunity exists to build a loyal customer community."

7.  **Visual Branding Analysis:**
    *   **Brand Identity:** Describe the brand's personality in 3-5 words (e.g., 'Bold, Modern, Inclusive').
    *   **Color Palette:** List 3-5 dominant hex codes.
    *   **Visual Alignment:** Does their visual style effectively resonate with their target audience?

8.  **Pricing Benchmark:** Find 2-3 other competitors in the niche. For each, provide name, price analysis, value proposition, and price range [min, max].

9.  **Differentiation Suggestion (The "Silver Bullet"):**
    *   Based on all analysis, provide ONE highly specific, actionable, and hard-to-copy differentiation strategy.
    *   Avoid generic advice. Good Example: "Competitor wins on product, but is weak on education. Launch a certified 'masterclass' series to become the go-to expert in the niche."

OUTPUT FORMAT: A single, valid JSON object inside a markdown block. No text outside the JSON block.

JSON Structure:
\`\`\`json
{
  "productDescriptionAnalysis": { "seoStrength": "...", "emotionalAppeal": "..." },
  "pricingStrategy": { "pricePointAnalysis": "...", "valueProposition": "...", "priceRange": [100000, 250000] },
  "customerSentiment": { "topPraise": ["..."], "topComplaints": ["..."] },
  "socialProof": { "testimonials": ["..."], "starRating": "...", "userGeneratedContentExamples": ["..."] },
  "swotAnalysis": { "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."] },
  "visualBrandingAnalysis": { "brandIdentity": "...", "colorPalette": ["#FFFFFF"], "visualAlignment": "..." },
  "pricingBenchmark": [ { "name": "...", "pricePointAnalysis": "...", "valueProposition": "...", "priceRange": [80000, 200000] } ],
  "relevantKeywords": ["..."],
  "differentiationSuggestion": "..."
}
\`\`\`
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    const analysis = processJsonResponse<CompetitorAnalysisResult>(response);
    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

    return { analysis, sources };
};


export const generateSalesCopy = async (businessQuestion: string): Promise<SalesCopyResult> => {
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            marketReactionAnalysis: { 
                type: Type.STRING,
                description: "Analysis of the projected market reaction to the business scenario in Indonesia, identifying key risks and customer emotions."
            },
            riskMitigationCopy: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A clear, non-clickbait headline for the announcement." },
                    body: { type: Type.STRING, description: "The full sales/announcement copy, written in empathetic and professional Indonesian." }
                },
                required: ["title", "body"]
            }
        },
        required: ["marketReactionAnalysis", "riskMitigationCopy"]
    };

    const prompt = `
ROLE: A hybrid PR Crisis Manager, Corporate Lawyer, and empathetic Direct-Response Copywriter for Indonesian SMEs.
USER SCENARIO: "${businessQuestion}"
TASK: Analyze the market risk of this scenario and draft a powerful, trust-building copy to mitigate it.

CHAIN-OF-THOUGHT:
1.  **Market Reaction & Risk Analysis:**
    *   What is the worst-case narrative that could go viral on Indonesian social media (TikTok, Twitter)?
    *   Predict the primary audience emotion (e.g., anger, disappointment, confusion, skepticism).
    *   Synthesize this into a concise analysis, explaining the core communication challenge.

2.  **Risk Mitigation Copy Generation:**
    *   Use the "Acknowledge, Explain, Reassure" framework.
    *   **Acknowledge:** Start by directly and honestly acknowledging the customer's feeling or the problem. No excuses. (e.g., "Kami mengerti Anda kecewa dengan kenaikan harga ini.")
    *   **Explain:** Transparently explain the 'why' behind the situation. Use simple language and relatable analogies. Avoid corporate jargon. (e.g., "Sama seperti biaya bahan baku untuk membuat kue naik, biaya 'bahan baku' server kami juga naik.")
    *   **Reassure:** State your commitment to the customer moving forward. What are you doing to address the issue? What can they expect? This builds trust.
    *   The tone must be human, empathetic, and professional, using appropriate Indonesian language ('bahasa yang santun dan jelas').

OUTPUT: Strictly adhere to the provided JSON schema. No extra text.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: "You are a business consultant and expert copywriter specializing in risk mitigation for Indonesian SMEs. Respond in structured, professional, and empathetic JSON.",
            responseMimeType: "application/json",
            responseSchema,
        }
    });

    return processJsonResponse<SalesCopyResult>(response);
};