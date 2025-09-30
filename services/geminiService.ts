
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { NicheTrendResult, CompetitorAnalysisResult, SalesCopyResult, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const parseJsonFromMarkdown = <T,>(markdownString: string): T | null => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = markdownString.match(jsonRegex);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]) as T;
        } catch (error) {
            console.error("Failed to parse JSON from markdown:", error);
            return null;
        }
    }
    console.error("No JSON block found in markdown string.");
    return null;
}

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
                    recommendation: { type: Type.STRING, description: "Rekomendasi tindakan singkat berdasarkan fase tren." }
                },
                 required: ["phase", "recommendation"]
            }
        },
        required: ["dominantVibe", "hiddenNiche", "trendLifecycle"]
    };
    
    const prompt = `Sebagai analis tren pasar untuk UMKM Indonesia, lakukan analisis komprehensif untuk kata kunci: "${keywords}". Fokus pada audiens dan konteks pasar Indonesia.
1.  **Vibe Dominan:** Telusuri Instagram, TikTok, dan Pinterest. Identifikasi estetika visual utama (palet warna, tipografi, gaya fotografi) yang sedang populer di kalangan target pasar. Berikan deskripsi yang jelas dan contoh.
2.  **Niche Tersembunyi:** Cari sub-tren atau peluang pasar yang belum banyak dieksploitasi yang terkait dengan kata kunci utama. Contoh: untuk "kopi", jangan hanya sebut "cold brew", cari sesuatu yang lebih spesifik seperti "cascara tea" atau "proffee (protein coffee)". Jelaskan mengapa ini adalah peluang.
3.  **Siklus Hidup Tren:** Berdasarkan volume pencarian dan diskusi online, klasifikasikan tren ini sebagai 'Baru', 'Berkembang', 'Matang', atau 'Menurun'. Berikan rekomendasi tindakan konkret untuk setiap fase.`;


    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: "Anda adalah seorang analis tren pasar yang ahli dalam mengidentifikasi peluang untuk Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia. Berikan jawaban dalam format JSON yang terstruktur dan actionable.",
            responseMimeType: "application/json",
            responseSchema,
        }
    });
    
    return JSON.parse(response.text) as NicheTrendResult;
};

export const analyzeCompetitor = async (competitorIdentifier: string): Promise<{ analysis: CompetitorAnalysisResult | null, sources: GroundingChunk[] }> => {
    
    const prompt = `
        Anda adalah seorang analis kompetitor e-commerce ahli untuk pasar Indonesia. Tugas Anda adalah membedah kompetitor ini: "${competitorIdentifier}". Ini bisa berupa URL produk di Tokopedia/Shopee atau nama toko di Instagram/TikTok.
        Gunakan Google Search secara ekstensif untuk mengumpulkan data, terutama ulasan pelanggan dari berbagai platform (e-commerce, social media, forum).

        Lakukan analisis dengan langkah-langkah berikut dan berikan output dalam format JSON di dalam blok kode markdown:

        1.  **Analisis Deskripsi Produk:**
            *   **SEO:** Identifikasi kata kunci utama dan sekunder. Evaluasi seberapa baik deskripsi dioptimalkan untuk mesin pencari.
            *   **Daya Tarik Emosional:** Analisis gaya bahasa dan *tone of voice*. Apakah mereka menjual fitur atau manfaat? Apa emosi yang ingin mereka bangkitkan?

        2.  **Analisis Sentimen Pelanggan:**
            *   Sintesis ulasan pelanggan. Cari tema dan pola yang berulang.
            *   **Pujian Utama:** Identifikasi 3 keunggulan spesifik yang paling sering dipuji pelanggan (contoh: "packaging aman", "admin responsif", "kualitas bahan premium").
            *   **Keluhan Utama:** Identifikasi 3 kekurangan atau masalah spesifik yang paling sering dikeluhkan (contoh: "pengiriman lambat", "ukuran tidak konsisten", "warna berbeda dari foto").

        3.  **Saran Diferensiasi Strategis:**
            *   Berdasarkan kelemahan kompetitor yang teridentifikasi, berikan 1-2 saran yang sangat spesifik dan dapat ditindaklanjuti. Contoh: Jika kompetitor lambat merespons, sarankan "Tawarkan 'Jaminan Balas Chat dalam 5 Menit'". Jika packaging mereka sering dikeluhkan, sarankan "Gunakan 'Garansi Packaging Anti Rusak'".

        Struktur JSON harus sebagai berikut:
        {
          "productDescriptionAnalysis": {
            "seoStrength": "Evaluasi kekuatan SEO dari deskripsi produk, termasuk penggunaan kata kunci.",
            "emotionalAppeal": "Evaluasi kekuatan daya tarik emosional dari deskripsi produk."
          },
          "customerSentiment": {
            "topPraise": ["Tiga (3) pujian atau keunggulan yang paling sering disebut pelanggan dalam ulasan."],
            "topComplaints": ["Tiga (3) keluhan atau kekurangan yang paling sering disebut pelanggan dalam ulasan."]
          },
          "differentiationSuggestion": "Satu atau dua saran diferensiasi taktis yang paling berdampak bagi UMKM untuk bersaing, berdasarkan analisis kelemahan dan keunggulan kompetitor."
        }
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    const analysis = parseJsonFromMarkdown<CompetitorAnalysisResult>(response.text);
    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

    return { analysis, sources };
};


export const generateSalesCopy = async (businessQuestion: string): Promise<SalesCopyResult> => {
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            marketReactionAnalysis: { 
                type: Type.STRING,
                description: "Analisis proyeksi reaksi pasar terhadap pertanyaan/skenario bisnis yang diajukan, berdasarkan data sejenis di pasar Indonesia."
            },
            riskMitigationCopy: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Judul atau headline untuk copy yang dihasilkan." },
                    body: { type: Type.STRING, description: "Isi draft klausa atau copy penjualan yang lugas, mengurangi ambiguitas, dan aman secara hukum dalam konteks Indonesia." }
                },
                required: ["title", "body"]
            }
        },
        required: ["marketReactionAnalysis", "riskMitigationCopy"]
    };

    const prompt = `Sebagai konsultan bisnis dan copywriter untuk UMKM Indonesia, jawab pertanyaan berikut: "${businessQuestion}".
1.  **Analisis Reaksi Pasar:** Berdasarkan psikologi konsumen di Indonesia dan tren pasar saat ini, prediksikan kemungkinan reaksi audiens (positif, negatif, netral). Sebutkan potensi risiko utama (misalnya, kehilangan kepercayaan, tuduhan tidak transparan, viral negatif).
2.  **Copy Mitigasi Risiko:** Buat draf copy (pengumuman, klausa, atau pesan) untuk mengatasi skenario ini. Copy harus:
    *   **Empatetik:** Mengakui perspektif pelanggan.
    *   **Transparan:** Jelas dan jujur tanpa bertele-tele.
    *   **Membangun Kepercayaan:** Menawarkan solusi atau menegaskan kembali nilai brand.
    *   **Sesuai Konteks Lokal:** Menggunakan bahasa yang sesuai untuk pasar Indonesia.
Pastikan output Anda dalam format JSON yang telah ditentukan.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: "Anda adalah konsultan bisnis dan copywriter ahli yang berfokus pada mitigasi risiko untuk UMKM di Indonesia. Berikan jawaban dalam format JSON yang terstruktur, empatetik, dan profesional.",
            responseMimeType: "application/json",
            responseSchema,
        }
    });

    return JSON.parse(response.text) as SalesCopyResult;
};
