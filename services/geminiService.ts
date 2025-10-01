
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { NicheTrendResult, CompetitorAnalysisResult, SalesCopyResult, GroundingChunk, CompetitorDiscoveryResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const parseJsonFromMarkdown = <T,>(markdownString: string): T => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = markdownString.match(jsonRegex);
    if (match && match[1]) {
        try {
            const parsedData = JSON.parse(match[1]);
            if (typeof parsedData !== 'object' || parsedData === null) {
                throw new Error("Parsed JSON is not an object.");
            }
            return parsedData as T;
        } catch (error) {
            console.error("Failed to parse JSON from markdown:", error, "Raw content:", match[1]);
            throw new Error("AI memberikan respons JSON yang tidak valid. Mohon coba lagi.");
        }
    }
    console.error("No JSON block found in markdown string:", markdownString);
    throw new Error("AI tidak memberikan respons dalam format yang diharapkan. Mohon coba lagi.");
}

const generateIcon = async (prompt: string): Promise<string | undefined> => {
    try {
        const fullPrompt = `A simple, clean, minimalist, flat 2D icon representing '${prompt}', suitable for a web app dashboard. White background, vector style, no text, no shadows.`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    } catch (error) {
        console.error(`Failed to generate icon for prompt "${prompt}":`, error);
    }
    return undefined;
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
PERAN: Anda adalah 'Chief Futurist' & Market Strategist untuk firma modal ventura yang berfokus pada UMKM di Indonesia. Klien Anda tidak butuh data mentah, mereka butuh 'alpha'—wawasan unik yang bisa dieksploitasi untuk keuntungan kompetitif. Tugas Anda adalah memberikan analisis yang tajam, prediktif, dan sangat relevan dengan konteks lokal.

INPUT PENGGUNA: "${keywords}"

INSTRUKSI: Lakukan analisis pasar komprehensif untuk input pengguna. Ikuti rantai pemikiran (Chain-of-Thought) berikut dan hasilkan output HANYA dalam format JSON yang ditentukan.

PROSES BERPIKIR (CHAIN-OF-THOUGHT):

1.  **Vibe & Estetika Dominan:**
    *   Apa nuansa psikologis yang sedang dicari pasar? (mis., 'kenyamanan', 'nostalgia', 'kemewahan yang terjangkau').
    *   Bagaimana nuansa ini diterjemahkan secara visual di media sosial Indonesia?
    *   Identifikasi palet warna kunci, gaya font, dan mood fotografi. Jangan hanya sebutkan nama gaya (mis., 'Minimalis'), jelaskan esensinya (mis., 'Minimalisme Hangat dengan sentuhan material alami untuk menciptakan rasa tenang').

2.  **Peluang Niche Tersembunyi (Blue Ocean Hunting):**
    *   Lihat melampaui tren yang jelas. Apa persimpangan (intersection) dari dua tren yang ada? Apa kebutuhan turunan yang belum terpenuhi?
    *   Contoh: Jika input "kopi", jangan sebut "cold brew". Pikirkan lebih dalam: "Kopi Drip Bag dengan Infusi Herbal Fungsional (mis., adaptogen seperti Ashwagandha untuk pereda stres)".
    *   Jelaskan MENGAPA ini adalah peluang: 'Pasar kopi jenuh, tetapi pasar 'wellness' sedang naik daun. Menggabungkan keduanya menciptakan kategori baru dengan persaingan rendah.'

3.  **Analisis Siklus Hidup & Validasi Data:**
    *   Evaluasi fase tren dengan bukti. Gunakan data imajiner dari Google Trends, diskusi di forum (mis., Female Daily), dan adopsi oleh influencer/brand.
    *   Klasifikasikan: 'Baru', 'Berkembang', 'Matang', 'Menurun'.
    *   Berikan SATU rekomendasi strategis yang paling cerdas untuk fase tersebut. (Contoh: Fase 'Berkembang' -> 'Kolaborasi dengan 'micro-influencer' di niche terkait untuk membangun kredibilitas sebelum pasar jenuh').
    *   Justifikasi tingkat keyakinan Anda dengan data. (Contoh: 'Keyakinan Tinggi karena volume pencarian naik 70% MoM dan 5 dari 10 kafe top di Jakarta sudah mulai bereksperimen').

4.  **Taktik Media Sosial yang Efektif:**
    *   Fokus pada Instagram & TikTok. Identifikasi 3-5 hashtag yang sedang digunakan oleh 'early adopters', bukan hanya hashtag generik.
    *   Jelaskan 2-3 format konten yang bekerja. Berikan ide konkret. (Contoh: Format 'Reels Edukasi Cepat' -> 'Tunjukkan 3 cara membedakan kopi Arabika asli dalam 15 detik, posisikan brand sebagai ahli').

HASILKAN OUTPUT HANYA DALAM FORMAT JSON SESUAI SKEMA.`;


    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: "Anda adalah seorang analis tren pasar yang ahli dalam mengidentifikasi peluang untuk Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia. Berikan jawaban dalam format JSON yang terstruktur dan actionable.",
            responseMimeType: "application/json",
            responseSchema,
        }
    });
    
    let result: NicheTrendResult;
    try {
        result = JSON.parse(response.text) as NicheTrendResult;
    } catch (error) {
        console.error("Gagal mem-parsing JSON dari AI untuk NicheTrend:", response.text, error);
        throw new Error("AI memberikan respons JSON yang tidak valid. Mohon coba lagi.");
    }

    if (typeof result !== 'object' || result === null) {
        console.error("Respons AI untuk NicheTrend bukan objek yang valid:", result);
        throw new Error("AI tidak memberikan respons dalam format yang diharapkan.");
    }

    if (result.hiddenNiche?.trend) {
        try {
            const iconUrl = await generateIcon(result.hiddenNiche.trend);
            if (iconUrl) {
                result.hiddenNiche.iconUrl = iconUrl;
            }
        } catch (error) {
            console.error("Icon generation for niche trend failed, proceeding without it.", error);
        }
    }

    return result;
};

export const discoverCompetitors = async (productInfo: string): Promise<{ analysis: CompetitorDiscoveryResult, sources: GroundingChunk[] }> => {
    const prompt = `
PERAN: Anda adalah seorang 'Corporate Investigator' yang disewa untuk memetakan lanskap kompetitif secara diam-diam dan akurat di pasar Indonesia.
TUGAS: Identifikasi kompetitor utama untuk produk, brand, atau layanan berikut: "${productInfo}".
SUMBER DATA: Gunakan Google Search secara ekstensif. Manfaatkan operator pencarian lanjutan (mis., \`site:tokopedia.com\`, \`intext:"brand lokal"\`, \`"saingan dari X"\`) untuk menemukan permata tersembunyi.

INSTRUKSI:
1.  **Pencarian Mendalam & Filter:**
    *   Lakukan pencarian untuk menemukan entitas bisnis yang relevan di Indonesia.
    *   **FILTER PENTING:** Abaikan artikel listicle generik ('10 brand terbaik...'), halaman agregator, atau marketplace. Fokus pada brand, toko, atau layanan spesifik.
2.  **Kategorikan dengan Cermat:**
    *   **Kompetitor Langsung:** Menawarkan solusi yang hampir identik untuk masalah pelanggan yang sama.
    *   **Kompetitor Tidak Langsung:** Menyelesaikan masalah inti yang sama, tetapi dengan cara atau produk yang berbeda.
3.  **Prioritaskan & Beri Alasan Tajam:**
    *   Identifikasi hingga 5 kompetitor langsung dan 5 tidak langsung. Sertakan campuran pemain besar dan penantang baru yang inovatif.
    *   Untuk setiap kompetitor, berikan alasan strategis yang menjawab pertanyaan: "Mengapa pelanggan target akan memilih mereka daripada yang lain?" Hindari deskripsi produk, fokus pada keunggulan kompetitif mereka.

FORMAT OUTPUT:
Hasilnya HARUS berupa JSON valid di dalam blok kode markdown. Jangan tambahkan teks atau penjelasan lain di luar blok JSON.

Struktur JSON:
\`\`\`json
{
  "directCompetitors": [
    {
      "name": "Nama Kompetitor Langsung",
      "type": "Jenis (mis. Brand E-commerce, Toko Instagram, Restoran Fisik)",
      "reason": "Alasan singkat yang menjelaskan keunggulan kompetitif mereka (mis., 'Menguasai pasar harga terjangkau dengan distribusi massal')."
    }
  ],
  "indirectCompetitors": [
    {
      "name": "Nama Kompetitor Tidak Langsung",
      "type": "Jenis",
      "reason": "Alasan singkat mengapa mereka memecahkan masalah yang sama secara berbeda (mis., 'Menawarkan solusi DIY yang lebih murah daripada layanan jadi')."
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

    const analysis = parseJsonFromMarkdown<CompetitorDiscoveryResult>(response.text);
    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

    if (analysis) {
        try {
            const allCompetitors = [...(analysis.directCompetitors || []), ...(analysis.indirectCompetitors || [])];
            const uniqueTypes = [...new Set(allCompetitors.map(c => c.type))];
            const iconCache = new Map<string, string>();

            for (const type of uniqueTypes) {
                const iconUrl = await generateIcon(type);
                if (iconUrl) {
                    iconCache.set(type, iconUrl);
                }
            }

            analysis.directCompetitors?.forEach(c => {
                if (iconCache.has(c.type)) {
                    c.iconUrl = iconCache.get(c.type);
                }
            });
            analysis.indirectCompetitors?.forEach(c => {
                 if (iconCache.has(c.type)) {
                    c.iconUrl = iconCache.get(c.type);
                }
            });
        } catch (error) {
             console.error("Icon generation for competitors failed, proceeding without them.", error);
        }
    }

    return { analysis, sources };
};


export const analyzeCompetitor = async (competitorIdentifier: string, focusKeywords?: string): Promise<{ analysis: CompetitorAnalysisResult, sources: GroundingChunk[] }> => {
    
    const focusPrompt = focusKeywords
        ? `PERHATIAN KHUSUS: Pengguna meminta fokus pada: "${focusKeywords}". Jadikan ini sebagai lensa utama untuk semua analisis Anda. Setiap poin harus merefleksikan bagaimana kompetitor menangani aspek ini.`
        : '';
    
    const prompt = `
PERAN: Anda adalah seorang 'Competitive Intelligence Operator' elit. Misi Anda adalah membongkar strategi kompetitor hingga ke akarnya dan menemukan celah kelemahan yang bisa dieksploitasi. Anda berpikir seperti seorang grandmaster catur, tiga langkah di depan.
TUGAS: Lakukan analisis 360 derajat yang mendalam dan dapat ditindaklanjuti terhadap kompetitor: "${competitorIdentifier}".
SUMBER DATA: Gunakan Google Search secara ekstensif untuk data real-time: halaman produk, media sosial, ulasan pelanggan, artikel berita, dan diskusi forum di Indonesia.
${focusPrompt}

INSTRUKSI ANALISIS (Ikuti semua langkah secara cermat):

1.  **Analisis Deskripsi Produk (Linguistik & Psikologi):**
    *   **Kekuatan SEO:** Identifikasi 3-5 kata kunci utama.
    *   **Daya Tarik Emosional:** Apa 'hook' emosional utama? Identifikasi pemicu psikologis yang mereka gunakan (mis., FOMO, aspirasi, keamanan, bukti sosial).

2.  **Strategi Harga & Proposisi Nilai:**
    *   **Posisi Harga:** Tentukan posisi harga (premium, menengah, terjangkau). Berikan rentang harga numerik [min, max] jika memungkinkan, jika tidak, kembalikan 'null'.
    *   **Proposisi Nilai:** Apa pembenaran mereka untuk harga tersebut? Apa yang pelanggan 'benar-benar' beli? (mis., bukan kopi, tapi 'status sosial').

3.  **Sentimen Pelanggan (Intel dari Lapangan):**
    *   Sintesis ulasan dari berbagai platform.
    *   **Pujian Utama:** Ekstrak 3 pujian. Ubah ini menjadi "Marketing Angle Amplifier" - bagaimana pengguna bisa meniru atau melampaui ini?
    *   **Keluhan Utama:** Ekstrak 3 keluhan. Ubah ini menjadi "Product Improvement Roadmap" - peluang perbaikan produk/layanan yang jelas.

4.  **Bukti Sosial (Mesin Kepercayaan):**
    *   **Testimoni:** Kutip 1-2 testimoni paling kuat yang menyoroti manfaat inti.
    *   **Peringkat:** Format: "4.8/5 dari 1.200 ulasan".
    *   **Konten Buatan Pengguna (UGC):** Deskripsikan strategi UGC mereka. Apakah pasif atau aktif didorong?

5.  **Kata Kunci Relevan:**
    *   Daftar 5-7 kata kunci paling penting (produk, brand, masalah yang dipecahkan).

6.  **Analisis SWOT (Sudut Pandang Penyerang):**
    *   Analisis SWOT harus dari sudut pandang PENGGUNA (UMKM yang ingin bersaing), bukan dari sudut pandang kompetitor itu sendiri. Contoh 'Weakness': 'Ketergantungan tinggi pada satu influencer, berisiko jika kontrak berakhir'.

7.  **Analisis Visual Branding (Bahasa Tanpa Kata):**
    *   **Identitas Brand:** Deskripsikan kepribadian brand dalam 3-5 kata (mis., 'Berani, Modern, Inklusif').
    *   **Palet Warna:** Identifikasi 3-5 warna dominan (berikan kode hex).
    *   **Kesesuaian Visual:** Evaluasi seberapa efektif visual mereka berkomunikasi dengan target pasar.

8.  **Benchmarking Harga:**
    *   Temukan 2-3 kompetitor lain di niche yang sama. Untuk setiap benchmark: nama, analisis posisi harga, proposisi nilai, dan rentang harga [min, max].

9.  **Saran Diferensiasi ('Silver Bullet'):**
    *   Berdasarkan semua analisis, berikan SATU saran diferensiasi yang paling cerdas, berdampak tinggi, dan sulit ditiru. Hindari saran generik. Contoh: "Jika kompetitor unggul di produk tapi lemah di komunitas, luncurkan 'Program Ambassador' eksklusif dengan akses langsung ke pendiri."

FORMAT OUTPUT:
Hasilnya HARUS berupa JSON valid di dalam blok kode markdown. Jangan tambahkan teks atau penjelasan lain di luar blok JSON.

Struktur JSON:
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

    const prompt = `
PERAN: Anda adalah gabungan dari seorang 'PR Crisis Manager' berpengalaman, seorang 'Corporate Lawyer' yang teliti, dan seorang 'Direct-Response Copywriter' yang empatetik, khusus untuk pasar UMKM di Indonesia.
SKENARIO PENGGUNA: "${businessQuestion}"

TUGAS: Berdasarkan skenario, berikan analisis risiko pasar dan buat draf copy mitigasi yang kuat. Tujuannya adalah untuk mengubah potensi krisis menjadi momen pembangunan kepercayaan.

LANGKAH-LANGKAH (CHAIN-OF-THOUGHT):
1.  **Analisis Reaksi Pasar & Risiko:**
    *   Identifikasi 'Worst-Case Scenario'. Apa narasi negatif yang paling mungkin viral di media sosial Indonesia (TikTok, Twitter, grup Facebook)?
    *   Berikan 'Risk Score' (Rendah, Sedang, Tinggi) dengan justifikasi.
    *   Prediksikan sentimen audiens (mis., marah, kecewa, bingung, skeptis).
    *   Jelaskan mengapa pendekatan 'Radical Honesty' (kejujuran radikal) adalah strategi terbaik untuk skenario ini.

2.  **Pembuatan Copy Mitigasi Risiko (Struktur A.S.T.O.):**
    *   Tulis copy menggunakan struktur A.S.T.O:
        *   **Acknowledge (Akui):** Mulai dengan mengakui masalah atau perasaan pelanggan secara langsung dan jujur. Tanpa alasan. Contoh: "Kami tahu Anda kecewa dengan kenaikan harga ini. Kami mendengarnya."
        *   **Solution & Story (Solusi & Cerita):** Jelaskan solusi atau langkah perbaikan yang diambil. Berikan konteks 'mengapa' di balik keputusan ini dengan cerita yang transparan. Hindari jargon korporat. Gunakan analogi yang mudah dipahami.
        *   **Transparency (Transparansi):** Jelaskan detail yang relevan. Jika menaikkan harga, tunjukkan kenaikan biaya bahan baku. Jika ada keterlambatan, tunjukkan foto gudang yang overload.
        *   **Outlook (Pandangan ke Depan):** Nyatakan komitmen Anda ke depan dan apa yang bisa diharapkan pelanggan. Berikan jaminan.
    *   Tulis judul (headline) yang jelas, bukan clickbait.
    *   Tulis isi (body) dengan gaya bahasa yang manusiawi, empatetik, dan lugas.

HASILKAN OUTPUT HANYA DALAM FORMAT JSON SESUAI SKEMA.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: "Anda adalah konsultan bisnis dan copywriter ahli yang berfokus pada mitigasi risiko untuk UMKM di Indonesia. Berikan jawaban dalam format JSON yang terstruktur, empatetik, dan profesional.",
            responseMimeType: "application/json",
            responseSchema,
        }
    });

    let result: SalesCopyResult;
    try {
        result = JSON.parse(response.text) as SalesCopyResult;
    } catch (error) {
        console.error("Gagal mem-parsing JSON dari AI untuk SalesCopy:", response.text, error);
        throw new Error("AI memberikan respons JSON yang tidak valid. Mohon coba lagi.");
    }

    if (typeof result !== 'object' || result === null) {
        console.error("Respons AI untuk SalesCopy bukan objek yang valid:", result);
        throw new Error("AI tidak memberikan respons dalam format yang diharapkan.");
    }
    
    return result;
};
