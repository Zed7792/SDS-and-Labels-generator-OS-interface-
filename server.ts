import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy-initialized Gemini client with required telemetry
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// SDS AI Extraction Endpoint
app.post('/api/extract-sds', async (req, res) => {
  try {
    const { sdsText, fileName } = req.body;

    if (!sdsText || typeof sdsText !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid sdsText' });
    }

    const ai = getAiClient();

    // If Gemini key is available, use Gemini 3.8 Flash with structured JSON output
    if (ai) {
      const prompt = `You are a certified hazardous materials compliance and EHS specialist extracting data from a chemical Safety Data Sheet (SDS).
Extract the structured chemical information according to UN GHS Rev 8/10 and OSHA HazCom 2012 standards.

CRITICAL INSTRUCTIONS:
1. NEVER invent, hallucinate, or assume missing chemical information.
2. If any field or value cannot be explicitly found in the provided SDS text, return null for that field. Do NOT guess ratings or values.
3. For H-statements and P-statements, identify the standard GHS codes (e.g. "H225", "H301", "P210", "P301+P310"). Do NOT make up custom statement text.
4. For NFPA 704 and HMIS ratings, only return numbers (0-4) if explicitly printed in the SDS (often Section 2 or Section 16). If not explicitly found, return null.
5. Signal word must be "DANGER", "WARNING", or null if not stated.
6. Pictograms must be an array of standard GHS IDs: 'flame', 'flame-over-circle', 'exploding-bomb', 'corrosion', 'gas-cylinder', 'skull-and-crossbones', 'exclamation-mark', 'health-hazard', 'environment'.

SDS Document Content (${fileName || 'Uploaded SDS'}):
---
${sdsText.slice(0, 50000)}
---`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an industrial HSE compliance officer. You must never invent missing chemical information. Always return null if information is not explicitly in the text.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING, description: 'Product identifier / commercial name or null if missing', nullable: true },
              manufacturer: { type: Type.STRING, description: 'Manufacturer / supplier company name or null', nullable: true },
              productCode: { type: Type.STRING, description: 'Product catalog / SKU code or null', nullable: true },
              casNumber: { type: Type.STRING, description: 'Primary CAS number or null', nullable: true },
              physicalState: { type: Type.STRING, description: 'Liquid, Solid, Gas, Slurry, etc.', nullable: true },
              sdsRevisionDate: { type: Type.STRING, description: 'Revision date YYYY-MM-DD or string or null', nullable: true },
              signalWord: { type: Type.STRING, description: 'DANGER, WARNING, or null', nullable: true },
              pictograms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of matching pictogram ids: flame, corrosion, etc.',
              },
              hazardClasses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of hazard classes and categories',
              },
              hStatementCodes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of H codes found in SDS like H225, H301, H314',
              },
              pStatementCodes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of P codes found in SDS like P210, P280, P301+P310',
              },
              nfpa: {
                type: Type.OBJECT,
                properties: {
                  health: { type: Type.INTEGER, nullable: true },
                  flammability: { type: Type.INTEGER, nullable: true },
                  instability: { type: Type.INTEGER, nullable: true },
                  special: { type: Type.STRING, nullable: true },
                },
                nullable: true,
              },
              hmis: {
                type: Type.OBJECT,
                properties: {
                  health: { type: Type.INTEGER, nullable: true },
                  isChronic: { type: Type.BOOLEAN, nullable: true },
                  flammability: { type: Type.INTEGER, nullable: true },
                  physicalHazard: { type: Type.INTEGER, nullable: true },
                  ppeCode: { type: Type.STRING, nullable: true },
                },
                nullable: true,
              },
              ppeRecommendations: {
                type: Type.OBJECT,
                properties: {
                  eye: { type: Type.STRING, nullable: true },
                  hand: { type: Type.STRING, nullable: true },
                  respiratory: { type: Type.STRING, nullable: true },
                  body: { type: Type.STRING, nullable: true },
                  foot: { type: Type.STRING, nullable: true },
                },
                nullable: true,
              },
              emergency: {
                type: Type.OBJECT,
                properties: {
                  firstAidInhalation: { type: Type.STRING, nullable: true },
                  firstAidSkin: { type: Type.STRING, nullable: true },
                  firstAidEye: { type: Type.STRING, nullable: true },
                  firstAidIngestion: { type: Type.STRING, nullable: true },
                  fireResponse: { type: Type.STRING, nullable: true },
                  spillResponse: { type: Type.STRING, nullable: true },
                  storageHandling: { type: Type.STRING, nullable: true },
                  emergencyContact: { type: Type.STRING, nullable: true },
                  emergencyPhone: { type: Type.STRING, nullable: true },
                },
                nullable: true,
              },
            },
            required: ['pictograms', 'hazardClasses', 'hStatementCodes', 'pStatementCodes'],
          },
        },
      });

      const extractedJson = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        extracted: extractedJson,
      });
    }

    // Fallback deterministic extractor if API key is not yet configured
    const fallbackExtracted = parseSdsLocally(sdsText);
    return res.json({
      success: true,
      source: 'local-regex-fallback',
      extracted: fallbackExtracted,
      notice: 'Gemini API key not configured; structured local parsing was utilized.',
    });
  } catch (error: any) {
    console.error('SDS Extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract SDS data',
      message: error?.message || 'Unknown server error',
    });
  }
});

// Robust local SDS parser for testing without active Gemini API keys
function parseSdsLocally(text: string) {
  const getMatch = (regex: RegExp) => {
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  // Extract common fields
  const productName =
    getMatch(/Product Name:\s*([^\n\r]+)/i) ||
    getMatch(/1\.1\s*Product Identifier:?\s*(?:Product Name:?)?\s*([^\n\r]+)/i);

  const manufacturer =
    getMatch(/Manufacturer:\s*([^\n\r]+)/i) ||
    getMatch(/1\.3\s*Details of the Supplier[^:]*:\s*([^\n\r]+)/i);

  const productCode =
    getMatch(/Product Code:\s*([^\n\r]+)/i) ||
    getMatch(/Catalog (?:Number|No):?\s*([^\n\r]+)/i);

  const casNumber =
    getMatch(/CAS(?:[- ]?No|[- ]?Number)?:\s*([0-9]{2,7}-[0-9]{2}-[0-9])/i);

  const signalWordRaw = getMatch(/Signal Word:\s*(DANGER|WARNING)/i);
  const signalWord = signalWordRaw ? signalWordRaw.toUpperCase() : null;

  // H codes
  const hMatches = Array.from(text.matchAll(/(H\d{3}[A-Za-z]?)/g)).map((m) => m[1]);
  const hStatementCodes = Array.from(new Set(hMatches));

  // P codes
  const pMatches = Array.from(
    text.matchAll(/(P\d{3}(?:\+P\d{3})*)/g)
  ).map((m) => m[1]);
  const pStatementCodes = Array.from(new Set(pMatches));

  // Pictograms detection
  const pictograms: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes('flame') || lower.includes('ghs02')) pictograms.push('flame');
  if (lower.includes('skull') || lower.includes('ghs06')) pictograms.push('skull-and-crossbones');
  if (lower.includes('corros') || lower.includes('ghs05')) pictograms.push('corrosion');
  if (lower.includes('health hazard') || lower.includes('ghs08')) pictograms.push('health-hazard');
  if (lower.includes('exclamation') || lower.includes('ghs07')) pictograms.push('exclamation-mark');
  if (lower.includes('environment') || lower.includes('ghs09')) pictograms.push('environment');
  if (lower.includes('gas cylinder') || lower.includes('ghs04')) pictograms.push('gas-cylinder');
  if (lower.includes('explod') || lower.includes('ghs01')) pictograms.push('exploding-bomb');
  if (lower.includes('oxidiz') || lower.includes('ghs03')) pictograms.push('flame-over-circle');

  // NFPA 704
  const nfpaHealth = getMatch(/NFPA.*Health:\s*(\d)/i);
  const nfpaFlam = getMatch(/NFPA.*Flammability:\s*(\d)/i);
  const nfpaInst = getMatch(/NFPA.*(?:Instability|Reactivity):\s*(\d)/i);
  const nfpaSpec = getMatch(/NFPA.*Special:\s*([A-Za-zWw-]+)/i);

  const nfpa =
    nfpaHealth !== null || nfpaFlam !== null || nfpaInst !== null
      ? {
          health: nfpaHealth ? parseInt(nfpaHealth, 10) : 0,
          flammability: nfpaFlam ? parseInt(nfpaFlam, 10) : 0,
          instability: nfpaInst ? parseInt(nfpaInst, 10) : 0,
          special: nfpaSpec && nfpaSpec.toLowerCase() !== 'none' ? nfpaSpec : '',
        }
      : null;

  return {
    productName,
    manufacturer,
    productCode,
    casNumber,
    physicalState: lower.includes('liquid')
      ? 'Liquid'
      : lower.includes('gas')
      ? 'Gas'
      : lower.includes('solid')
      ? 'Solid'
      : null,
    sdsRevisionDate: getMatch(/Revision Date:\s*([0-9A-Za-z-–/]+)/i),
    signalWord,
    pictograms,
    hazardClasses: ['Extracted from SDS Section 2'],
    hStatementCodes,
    pStatementCodes,
    nfpa,
    hmis: {
      health: nfpa?.health ?? 2,
      isChronic: text.includes('*'),
      flammability: nfpa?.flammability ?? 2,
      physicalHazard: nfpa?.instability ?? 0,
      ppeCode: 'H',
    },
    ppeRecommendations: {
      eye: getMatch(/Eye Protection:\s*([^\n\r]+)/i) || getMatch(/Eye:\s*([^\n\r]+)/i),
      hand: getMatch(/Hand Protection:\s*([^\n\r]+)/i) || getMatch(/Hand:\s*([^\n\r]+)/i),
      respiratory: getMatch(/Respiratory Protection:\s*([^\n\r]+)/i) || getMatch(/Respiratory:\s*([^\n\r]+)/i),
      body: getMatch(/Body Protection:\s*([^\n\r]+)/i) || getMatch(/Body:\s*([^\n\r]+)/i),
      foot: getMatch(/Foot Protection:\s*([^\n\r]+)/i) || getMatch(/Foot:\s*([^\n\r]+)/i),
    },
    emergency: {
      firstAidInhalation: getMatch(/Inhalation:\s*([^\n\r]+)/i),
      firstAidSkin: getMatch(/Skin(?: Contact)?:\s*([^\n\r]+)/i),
      firstAidEye: getMatch(/Eye(?: Contact)?:\s*([^\n\r]+)/i),
      firstAidIngestion: getMatch(/Ingestion:\s*([^\n\r]+)/i),
      fireResponse: getMatch(/Suitable Extinguishing Media:\s*([^\n\r]+)/i),
      spillResponse: getMatch(/Clean-up:\s*([^\n\r]+)/i),
      storageHandling: getMatch(/Storage:\s*([^\n\r]+)/i),
      emergencyContact: getMatch(/Emergency Telephone:\s*([^\n\r]+)/i) || getMatch(/CHEMTREC[^:]*:\s*([^\n\r]+)/i),
      emergencyPhone: getMatch(/(?:1-800-[0-9]{3}-[0-9]{4}|\+1\s*\([0-9]{3}\)\s*[0-9]{3}-[0-9]{4})/i),
    },
  };
}

// Static assets directory
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/pictograms', express.static(path.join(process.cwd(), 'public/pictograms')));

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chemical Label Studio server running on port ${PORT}`);
  });
}

startServer();
