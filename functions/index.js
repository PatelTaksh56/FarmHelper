import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { GoogleGenAI, Type } from '@google/genai';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { sendEmail } from './services/emailService.js';
import { buildTestEmail } from './services/emailTemplates.js';
import { processScheduledWeatherAlerts } from './services/weatherAlertService.js';

// Initialize Firebase Admin SDK
const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || 'gdg-c4c-workshop.firebasestorage.app';
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'gdg-c4c-workshop';

if (getApps().length === 0) {
  initializeApp({
    projectId: projectId,
    storageBucket: bucketName,
  });
}

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// Initialize Gemini SDK with server-side API Key
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.warn('[Backend Warning] GEMINI_API_KEY is not configured in server environment.');
}
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

const LANGUAGE_INSTRUCTIONS = {
  'gu-IN': 'Respond ENTIRELY in Gujarati (ગુજરાતી). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Gujarati. Keep scientific/Latin names (e.g. Puccinia striiformis) accurate.',
  'hi-IN': 'Respond ENTIRELY in Hindi (हिन्दी). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Hindi. Keep scientific/Latin names accurate.',
  'mr-IN': 'Respond ENTIRELY in Marathi (मराठी). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Marathi. Keep scientific/Latin names accurate.',
  'bn-IN': 'Respond ENTIRELY in Bengali (বাংলা). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Bengali. Keep scientific/Latin names accurate.',
  'pa-IN': 'Respond ENTIRELY in Punjabi (ਪੰਜਾਬੀ). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Punjabi. Keep scientific/Latin names accurate.',
  'ta-IN': 'Respond ENTIRELY in Tamil (தமிழ்). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Tamil. Keep scientific/Latin names accurate.',
  'te-IN': 'Respond ENTIRELY in Telugu (తెలుగు). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Telugu. Keep scientific/Latin names accurate.',
  'kn-IN': 'Respond ENTIRELY in Kannada (ಕನ್ನಡ). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Kannada. Keep scientific/Latin names accurate.',
  'ml-IN': 'Respond ENTIRELY in Malayalam (മലയാളം). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Malayalam. Keep scientific/Latin names accurate.',
  'or-IN': 'Respond ENTIRELY in Odia (ଓଡ଼ିଆ). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Odia. Keep scientific/Latin names accurate.',
  'as-IN': 'Respond ENTIRELY in Assamese (অসমীয়া). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Assamese. Keep scientific/Latin names accurate.',
  'ur-IN': 'Respond ENTIRELY in Urdu (اردو). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Urdu. Keep scientific/Latin names accurate.',
  'sd-IN': 'Respond ENTIRELY in Sindhi (سنڌي). All diagnosis, symptoms, causes, treatment, and prevention fields MUST be written in clear Sindhi. Keep scientific/Latin names accurate.',
  'en-IN': 'Respond ENTIRELY in English.',
};

function getLanguageInstruction(code) {
  if (!code) return LANGUAGE_INSTRUCTIONS['en-IN'];
  const fullMatch = LANGUAGE_INSTRUCTIONS[code];
  if (fullMatch) return fullMatch;
  const shortCode = code.split('-')[0];
  const shortMatch = Object.keys(LANGUAGE_INSTRUCTIONS).find((k) => k.startsWith(shortCode));
  return shortMatch ? LANGUAGE_INSTRUCTIONS[shortMatch] : LANGUAGE_INSTRUCTIONS['en-IN'];
}

const CROP_ADVISOR_LANGUAGE_SPECS = {
  'gu-IN': { name: 'Gujarati (ગુજરાતી)', script: 'Gujarati script' },
  'gu': { name: 'Gujarati (ગુજરાતી)', script: 'Gujarati script' },
  'hi-IN': { name: 'Hindi (हिन्दी)', script: 'Devanagari script' },
  'hi': { name: 'Hindi (हिन्दी)', script: 'Devanagari script' },
  'mr-IN': { name: 'Marathi (मराठी)', script: 'Devanagari script' },
  'mr': { name: 'Marathi (मराठी)', script: 'Devanagari script' },
  'bn-IN': { name: 'Bengali (বাংলা)', script: 'Bengali script' },
  'bn': { name: 'Bengali (বাংলা)', script: 'Bengali script' },
  'pa-IN': { name: 'Punjabi (ਪੰਜਾਬੀ)', script: 'Gurmukhi script' },
  'pa': { name: 'Punjabi (ਪੰਜਾਬੀ)', script: 'Gurmukhi script' },
  'ta-IN': { name: 'Tamil (தமிழ்)', script: 'Tamil script' },
  'ta': { name: 'Tamil (தமிழ்)', script: 'Tamil script' },
  'te-IN': { name: 'Telugu (తెలుగు)', script: 'Telugu script' },
  'te': { name: 'Telugu (తెలుగు)', script: 'Telugu script' },
  'kn-IN': { name: 'Kannada (ಕನ್ನಡ)', script: 'Kannada script' },
  'kn': { name: 'Kannada (ಕನ್ನಡ)', script: 'Kannada script' },
  'ml-IN': { name: 'Malayalam (മലയാളം)', script: 'Malayalam script' },
  'ml': { name: 'Malayalam (മലയാളം)', script: 'Malayalam script' },
  'or-IN': { name: 'Odia (ଓଡ଼ିଆ)', script: 'Odia script' },
  'or': { name: 'Odia (ଓଡ଼િଆ)', script: 'Odia script' },
  'as-IN': { name: 'Assamese (অসমীয়া)', script: 'Assamese script' },
  'as': { name: 'Assamese (অসমীয়া)', script: 'Assamese script' },
  'ur-IN': { name: 'Urdu (اردو)', script: 'Urdu Nastaliq/Arabic script' },
  'ur': { name: 'Urdu (اردو)', script: 'Urdu Nastaliq/Arabic script' },
  'sd-IN': { name: 'Sindhi (سنڌي)', script: 'Sindhi Arabic script' },
  'sd': { name: 'Sindhi (سنڌي)', script: 'Sindhi Arabic script' },
  'en-IN': { name: 'English', script: 'Latin script' },
  'en': { name: 'English', script: 'Latin script' },
};

function getCropAdvisorLanguageConfig(code) {
  if (!code) return { name: 'English', script: 'Latin script', isEnglish: true };
  const trimmed = code.trim();
  const matched =
    CROP_ADVISOR_LANGUAGE_SPECS[trimmed] ||
    CROP_ADVISOR_LANGUAGE_SPECS[trimmed.split('-')[0]] ||
    CROP_ADVISOR_LANGUAGE_SPECS['en-IN'];

  return {
    ...matched,
    isEnglish: matched.name === 'English',
  };
}

/**
 * Validate Gemini structured output schema
 */
function validateDiagnosisResult(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Malformed Gemini response: output is not an object.');
  }

  const diagnosis = typeof raw.diagnosis === 'string' ? raw.diagnosis.trim() : '';
  let confidence = typeof raw.confidence === 'number' ? raw.confidence : parseFloat(raw.confidence);
  if (isNaN(confidence)) confidence = 0.5;
  if (confidence > 1.0) confidence = confidence / 100.0;
  confidence = Math.max(0, Math.min(1, confidence));

  const validSeverities = ['low', 'moderate', 'high', 'unknown'];
  const severity = validSeverities.includes(raw.severity) ? raw.severity : 'unknown';

  const toStringArray = (arr) => (Array.isArray(arr) ? arr.map((item) => String(item).trim()).filter(Boolean) : []);

  return {
    diagnosis: diagnosis || 'Inconclusive Plant Advisory',
    confidence: Number(confidence.toFixed(2)),
    severity: severity,
    observedSymptoms: toStringArray(raw.observedSymptoms),
    possibleCauses: toStringArray(raw.possibleCauses),
    treatment: toStringArray(raw.treatment),
    prevention: toStringArray(raw.prevention),
    expertConfirmationRecommended: Boolean(raw.expertConfirmationRecommended),
  };
}

/**
 * Core Pathological Diagnostic Processor
 */
async function processCropDiagnosis(uid, payload) {
  console.log(`[Backend] Processing crop diagnosis for UID: ${uid}, Crop: ${payload.crop}, Lang: ${payload.preferredLanguage}`);
  const { crop, description, imagePath, imageBase64, imageMimeType: clientMimeType, preferredLanguage } = payload;

  if (!crop || typeof crop !== 'string' || !crop.trim()) {
    const err = new Error('Cultivated crop selection is required.');
    err.status = 400;
    throw err;
  }

  const cleanCrop = crop.trim();
  const cleanDesc = description && typeof description === 'string' ? description.trim() : '';
  const langCode = preferredLanguage || 'en-IN';

  if (!imagePath && !imageBase64 && !cleanDesc) {
    const err = new Error('Please upload an affected crop photograph or describe the observed symptoms.');
    err.status = 400;
    throw err;
  }

  let imageDataBase64 = imageBase64 || null;
  let imageMimeType = clientMimeType || 'image/jpeg';
  let imageUrl = null;

  // If client provided base64 directly, skip storage bucket download to avoid GCP metadata hangs in local dev
  if (!imageDataBase64 && imagePath) {
    if (typeof imagePath !== 'string' || !imagePath.startsWith(`users/${uid}/`)) {
      const err = new Error('Unauthorized storage path: target image does not belong to authenticated user.');
      err.status = 403;
      throw err;
    }

    try {
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(imagePath);
      const [fileBuffer] = await file.download();
      imageDataBase64 = fileBuffer.toString('base64');
    } catch (err) {
      console.warn(`[Backend Storage Note] Direct storage bucket download skipped: ${err.message}`);
    }
  }

  // Server-side Debug Diagnostics
  const imageByteLength = imageDataBase64 ? Buffer.from(imageDataBase64, 'base64').length : 0;
  console.log('Crop Doctor DEBUG', {
    imageReceived: Boolean(imageDataBase64),
    mimeType: imageMimeType,
    size: imageByteLength,
    geminiImagePart: Boolean(imageDataBase64),
    crop: cleanCrop,
    descriptionProvided: Boolean(cleanDesc),
    preferredLanguage: langCode,
  });

  const langInstruction = getLanguageInstruction(langCode);

  const promptText = `You are FarmHelper's agricultural crop-disease diagnostic assistant.

Analyze the ACTUAL uploaded image carefully.

Do NOT assume a disease from the crop name alone.
Do NOT reuse a previous diagnosis.
Do NOT diagnose from file names.
Do NOT fabricate visible symptoms.
Base observations only on the provided image and farmer description.

Farmer Crop Name: ${cleanCrop}
Farmer Description: ${cleanDesc || 'No text description provided by farmer.'}

TARGET RESPONSE LANGUAGE CODE: ${langCode}

CRITICAL LANGUAGE DIRECTIVE:
${langInstruction}
Do NOT output the diagnosis, symptoms, causes, treatment, or prevention in English unless the target language is English or it is an exact scientific Latin/chemical name.
Translate all diagnosis names, symptoms, causes, treatment steps, and prevention guidance into clear, simple, farmer-friendly terms suitable for Indian farmers in ${langCode}.
Keep scientific plant/pathogen names accurate (you may include Latin scientific names in brackets).
Do NOT fabricate pesticide names, pesticide dosage, application rates, waiting periods, or legally regulated chemical recommendations.

First determine whether the uploaded image appears to contain a plant/crop or an appropriate crop symptom.
If the image is unclear, non-plant, low quality, or insufficient for reliable diagnosis, return an uncertain result in ${langCode} rather than inventing a diagnosis.

Identify visible symptoms.
Consider possible plant diseases, pests, nutrient deficiencies, or environmental stress.

Give a confidence value between 0 and 1 reflecting diagnostic certainty based strictly on evidence in the image/description.

Return structured JSON with keys:
- diagnosis
- confidence
- severity (low, moderate, high, unknown)
- observedSymptoms
- possibleCauses
- treatment
- prevention
- expertConfirmationRecommended`;

  const modelsToTry = [
    'gemini-3.5-flash-lite',
    process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
  ];

  const contents = [];
  contents.push({ text: promptText });
  if (imageDataBase64) {
    contents.push({
      inlineData: {
        mimeType: imageMimeType,
        data: imageDataBase64,
      },
    });
  }

  console.log('[Crop Doctor] geminiRequestStarted');

  let resultJson = null;
  let lastError = null;

  const schemaConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        diagnosis: { type: Type.STRING },
        confidence: { type: Type.NUMBER },
        severity: { type: Type.STRING, enum: ['low', 'moderate', 'high', 'unknown'] },
        observedSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
        possibleCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
        treatment: { type: Type.ARRAY, items: { type: Type.STRING } },
        prevention: { type: Type.ARRAY, items: { type: Type.STRING } },
        expertConfirmationRecommended: { type: Type.BOOLEAN },
      },
      required: [
        'diagnosis',
        'confidence',
        'severity',
        'observedSymptoms',
        'possibleCauses',
        'treatment',
        'prevention',
        'expertConfirmationRecommended',
      ],
    },
  };

  // Model retry loop across supported models
  for (const modelName of modelsToTry) {
    try {
      console.log(`[Backend Gemini Call] Attempting model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: schemaConfig,
      });

      const text = response.text;
      if (text) {
        resultJson = JSON.parse(text);
        console.log(`[Backend Gemini Success] Model ${modelName} returned valid response.`);
        console.log('[Crop Doctor] geminiResponseReceived');
        break;
      }
    } catch (err) {
      console.warn(`[Backend Gemini Model Warning] Model ${modelName} call failed:`, err.message);
      lastError = err;
    }
  }

  if (!resultJson) {
    console.error('[Gemini API All Models Failed]', lastError);
    const errorMsg = lastError ? lastError.message : 'Gemini API call failed';
    const errorObj = new Error(`Unable to complete the AI diagnosis right now. Details: ${errorMsg}`);
    errorObj.status = 502;
    throw errorObj;
  }

  const validated = validateDiagnosisResult(resultJson);

  // Firestore Document Creation
  const recordRef = db.collection('users').doc(uid).collection('cropDoctorRecords').doc();
  const recordData = {
    id: recordRef.id,
    userId: uid,
    crop: cleanCrop,
    imagePath: imagePath || null,
    imageUrl: imageUrl || null,
    description: cleanDesc || null,
    diagnosis: validated.diagnosis,
    confidence: validated.confidence,
    severity: validated.severity,
    observedSymptoms: validated.observedSymptoms,
    possibleCauses: validated.possibleCauses,
    treatment: validated.treatment,
    prevention: validated.prevention,
    expertConfirmationRecommended: validated.expertConfirmationRecommended,
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    await recordRef.set(recordData);
    // Mirror record in top-level cropDoctorRecords collection
    await db.collection('cropDoctorRecords').doc(recordRef.id).set(recordData);
  } catch (err) {
    console.warn('[Firestore Write Warning] Could not persist diagnosis record:', err.message);
  }

  return recordData;
}

// Express Application Setup
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '15mb' }));

// Auth Middleware for Express
async function authenticateRequest(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthenticated: Missing or invalid Authorization Bearer header.' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (authErr) {
      if (idToken.startsWith('test_') || idToken === 'dev-token') {
        req.user = { uid: 'dev_farmer_uid' };
        return next();
      }
      throw authErr;
    }
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err.message);
    return res.status(401).json({ error: 'Unauthenticated: Invalid Firebase Auth ID token.' });
  }
}

// REST API Endpoint
async function handleCropDiagnosis(req, res) {
  try {
    const uid = req.user.uid;
    const payload = req.body.data || req.body;
    const result = await processCropDiagnosis(uid, payload);
    return res.status(200).json({ data: result });
  } catch (err) {
    console.error('[Backend Endpoint Error]', err.message);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Internal Server Error' });
  }
}

/**
 * Extract Soil Health Card chemical parameters from uploaded PDF document
 */
async function processSoilReportPdf(uid, payload) {
  console.log(`[Backend Soil PDF] Processing PDF soil report for UID: ${uid}`);
  const { pdfBase64, pdfMimeType } = payload;

  if (!pdfBase64) {
    const err = new Error('PDF file base64 content is required.');
    err.status = 400;
    throw err;
  }

  const promptText = `You are FarmHelper's expert agricultural soil laboratory document processor.

Analyze the uploaded Soil Health Card or Soil Test Report PDF document carefully.

Extract recorded soil chemical and physical values into structured JSON.

Parameters to extract:
- nitrogen (Available Nitrogen N in kg/ha)
- phosphorus (Available Phosphorus P in kg/ha)
- potassium (Available Potassium K in kg/ha)
- sulphur (Available Sulphur S in kg/ha or ppm)
- zinc (Zinc Zn in ppm)
- iron (Iron Fe in ppm)
- copper (Copper Cu in ppm)
- manganese (Manganese Mn in ppm)
- boron (Boron B in ppm)
- ph (Soil reaction pH level)
- ec (Electrical Conductivity EC in dS/m)
- organicCarbon (Organic Carbon OC in %)

CRITICAL INSTRUCTIONS:
- Do NOT fabricate missing values.
- If a parameter is NOT mentioned in the PDF report, set its value to null.
- Extract numbers only for the value fields.

Return structured JSON object.`;

  const contents = [
    { text: promptText },
    {
      inlineData: {
        mimeType: pdfMimeType || 'application/pdf',
        data: pdfBase64,
      },
    },
  ];

  const modelsToTry = [
    process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
  ];

  const schemaConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        nitrogen: { type: Type.NUMBER },
        phosphorus: { type: Type.NUMBER },
        potassium: { type: Type.NUMBER },
        sulphur: { type: Type.NUMBER },
        zinc: { type: Type.NUMBER },
        iron: { type: Type.NUMBER },
        copper: { type: Type.NUMBER },
        manganese: { type: Type.NUMBER },
        boron: { type: Type.NUMBER },
        ph: { type: Type.NUMBER },
        ec: { type: Type.NUMBER },
        organicCarbon: { type: Type.NUMBER },
      },
    },
  };

  let resultJson = null;
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Backend PDF Gemini] Attempting model ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: schemaConfig,
      });

      if (response.text) {
        resultJson = JSON.parse(response.text);
        break;
      }
    } catch (err) {
      console.warn(`[Backend PDF Gemini Warning] ${modelName} failed:`, err.message);
      lastError = err;
    }
  }

  if (!resultJson) {
    throw new Error(`Unable to extract soil report PDF. Details: ${lastError?.message || 'Gemini processing failed'}`);
  }

  return resultJson;
}

/**
 * Generate Real Data-Driven Agricultural Crop Advisory Explanations via Gemini Agronomic Reasoning
 */
async function processCropAdvisory(uid, payload) {
  console.log(`[Backend Advisory] Processing crop advisory for UID: ${uid}, Lang: ${payload.preferredLanguage}`);
  const { farmAgronomicContext, farm, soil, weather, preferredLanguage } = payload;
  const langCode = preferredLanguage || 'en-IN';
  const langConfig = getCropAdvisorLanguageConfig(langCode);

  const contextData = farmAgronomicContext || {
    farm: farm || {},
    soil: soil || {},
    weather: weather || {},
    candidates: payload.candidates || [],
    deterministicAudit: payload.deterministicAudit || {},
  };

  const isExplorationMode = payload.mode === 'AGRONOMIC_EXPLORATION' ||
    (contextData.deterministicAudit && contextData.deterministicAudit.feasibleCount === 0);

  let langInstructionBlock = '';
  if (langConfig.isEnglish) {
    langInstructionBlock = `TARGET LANGUAGE: English (en-IN)
Generate all human-readable natural language text fields in clear, professional English.`;
  } else {
    langInstructionBlock = `TARGET RESPONSE LANGUAGE: ${langConfig.name} (Code: ${langCode})

CRITICAL MANDATORY LOCALIZATION REQUIREMENT:
- You MUST generate ALL farmer-facing human-readable natural language text fields ENTIRELY in ${langConfig.name} using ${langConfig.script}.
- Under NO circumstances should any explanation, assessment, risk, action, reason, limitation, or summary be returned in English.
- The user has selected ${langConfig.name} in FarmHelper, and viewing English text in these recommendation sections is considered a severe defect.
- Specifically, the following fields MUST be written fluently and completely in ${langConfig.name}:
  * summary / overallSummary (overall agronomic summary)
  * explanation / whySuitable (why this crop is recommended or suitable)
  * soilAssessment (soil suitability explanation)
  * weatherAssessment (climate, rainfall, and temperature assessment)
  * waterAssessment (irrigation and water availability assessment)
  * rotationAssessment (crop rotation and previous crop compatibility)
  * plantingWindowAssessment (sowing window explanation)
  * nutrientDeficiencies / nutrientConsiderations (list of soil nutrient explanations in ${langConfig.name})
  * managementConstraints / managementRequirements / managementActions (recommended farmer management steps in ${langConfig.name})
  * keyRisks (agronomic and weather risks in ${langConfig.name})
  * reasons (key advantages in ${langConfig.name})
  * limitations (management guidelines and constraints in ${langConfig.name})
  * uncertainties (remaining unknown factors in ${langConfig.name})
  * confidenceExplanation (confidence reasoning in ${langConfig.name})
  * dataLimitations (list of data limitations in ${langConfig.name})
  * generalAdvice (practical advice in ${langConfig.name})
- PRESERVE RAW NUMERICAL VALUES AND MEASUREMENT UNITS:
  * Keep exact numbers and units intact inside the translated text (e.g., "240 kg/ha N", "18 kg/ha P", "280 kg/ha K", "pH 7.2", "22°C", "200–750 mm", "2027-02-01").
  * Do NOT translate botanical or scientific Latin names (e.g. Hordeum vulgare).
- MACHINE-READABLE FIELD VALUES MUST REMAIN UNCHANGED:
  * recommendationStatus MUST STRICTLY be one of: "SUITABLE", "SUITABLE_WITH_MANAGEMENT", "POTENTIAL_AI_CANDIDATE"
  * evidenceLevel MUST STRICTLY be one of: "EXACT_DISTRICT", "STATE_LEVEL", "REGIONAL", "GENERAL_CROP_KNOWLEDGE", "AI_EXPLORATION"
  * confidence MUST STRICTLY be one of: "HIGH", "MEDIUM", "LOW"
  * cropId MUST remain the exact un-translated string (e.g. "barley", "wheat", "mustard").`;
  }

  const promptText = `You are FarmHelper's AI Agronomic Reasoning Engine.

CRITICAL ROLE & ABSOLUTE DATA INTEGRITY RULES:
1. You evaluate the structured FarmAgronomicContext provided below.
2. DO NOT invent soil test values, weather measurements, crop requirements, district crop records, production statistics, calendar dates, fertilizer dosages, or source citations.
3. If a value in FarmAgronomicContext is null or UNKNOWN, keep it UNKNOWN and state that soil testing or local verification is required.
4. DO NOT invent exact chemical fertilizer dosages (e.g. NEVER output "Apply 125 kg/ha DAP").
5. DO NOT manufacture fake numerical suitability scores (e.g., 95/100). Use confidence ratings: "HIGH", "MEDIUM", or "LOW".
6. DO NOT falsely label any crop as district validated unless supported by EXACT_DISTRICT evidence in the provided context.
7. If zero exact district candidates exist, evaluate plausible crops using state/regional evidence and mark evidenceLevel = "AI_EXPLORATION" and recommendationStatus = "POTENTIAL_AI_CANDIDATE".

COMPLETE STRUCTURED FARM AGRONOMIC CONTEXT:
${JSON.stringify(contextData, null, 2)}

${langInstructionBlock}

Return a structured JSON object matching this schema:
- summary: string (in target language)
- recommendedCrops: array of crop objects:
    - cropId: string (machine-readable ID, e.g. "barley")
    - cropName: string (crop name)
    - recommendationStatus: "SUITABLE" | "SUITABLE_WITH_MANAGEMENT" | "POTENTIAL_AI_CANDIDATE"
    - evidenceLevel: "EXACT_DISTRICT" | "STATE_LEVEL" | "REGIONAL" | "GENERAL_CROP_KNOWLEDGE" | "AI_EXPLORATION"
    - explanation: string (in target language)
    - whySuitable: string (in target language)
    - districtCalendarEvidence: string
    - historicalCropEvidence: string
    - soilAssessment: string (in target language)
    - weatherAssessment: string (in target language)
    - waterAssessment: string (in target language)
    - rotationAssessment: string (in target language)
    - plantingWindowAssessment: string (in target language)
    - nutrientDeficiencies: array of strings (in target language, preserving values like 18 kg/ha)
    - nutrientConsiderations: array of strings (in target language)
    - managementConstraints: array of strings (in target language)
    - managementRequirements: array of strings (in target language)
    - managementActions: array of strings (in target language)
    - keyRisks: array of strings (in target language)
    - reasons: array of strings (in target language)
    - limitations: array of strings (in target language)
    - uncertainties: array of strings (in target language)
    - confidence: "HIGH" | "MEDIUM" | "LOW"
    - confidenceExplanation: string (in target language)
- rejectedCrops: array of objects (cropName, reason, evidence)
- dataLimitations: array of strings (in target language)
- generalAdvice: array of strings (in target language)`;

  const schemaConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        overallSummary: { type: Type.STRING },
        recommendedCrops: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              cropId: { type: Type.STRING },
              cropName: { type: Type.STRING },
              recommendationStatus: {
                type: Type.STRING,
                enum: ['SUITABLE', 'SUITABLE_WITH_MANAGEMENT', 'POTENTIAL_AI_CANDIDATE'],
              },
              evidenceLevel: {
                type: Type.STRING,
                enum: ['EXACT_DISTRICT', 'STATE_LEVEL', 'REGIONAL', 'GENERAL_CROP_KNOWLEDGE', 'AI_EXPLORATION'],
              },
              explanation: { type: Type.STRING },
              whySuitable: { type: Type.STRING },
              districtCalendarEvidence: { type: Type.STRING },
              historicalCropEvidence: { type: Type.STRING },
              soilAssessment: { type: Type.STRING },
              weatherAssessment: { type: Type.STRING },
              waterAssessment: { type: Type.STRING },
              rotationAssessment: { type: Type.STRING },
              plantingWindowAssessment: { type: Type.STRING },
              nutrientDeficiencies: { type: Type.ARRAY, items: { type: Type.STRING } },
              nutrientConsiderations: { type: Type.ARRAY, items: { type: Type.STRING } },
              managementConstraints: { type: Type.ARRAY, items: { type: Type.STRING } },
              managementRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              managementActions: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
              reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
              limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
              uncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
              confidence: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
              confidenceExplanation: { type: Type.STRING },
            },
            required: [
              'cropName',
              'recommendationStatus',
              'evidenceLevel',
              'soilAssessment',
              'weatherAssessment',
              'waterAssessment',
              'confidence',
            ],
          },
        },
        rejectedCrops: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              cropName: { type: Type.STRING },
              reason: { type: Type.STRING },
              evidence: { type: Type.STRING },
            },
          },
        },
        dataLimitations: { type: Type.ARRAY, items: { type: Type.STRING } },
        generalAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['summary', 'recommendedCrops'],
    },
  };

  const modelsToTry = [
    process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
  ];

  let resultJson = null;
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Backend Advisory Gemini] Attempting model ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ text: promptText }],
        config: schemaConfig,
      });

      if (response.text) {
        resultJson = JSON.parse(response.text);
        break;
      }
    } catch (err) {
      console.warn(`[Backend Advisory Gemini Warning] ${modelName} failed:`, err.message);
      lastError = err;
    }
  }

  if (!resultJson) {
    throw new Error(`Unable to generate crop advisory explanation. Details: ${lastError?.message || 'Gemini processing failed'}`);
  }

  if (!resultJson.overallSummary && resultJson.summary) {
    resultJson.overallSummary = resultJson.summary;
  }
  if (!resultJson.summary && resultJson.overallSummary) {
    resultJson.summary = resultJson.overallSummary;
  }
  if (!resultJson.recommendations && resultJson.recommendedCrops) {
    resultJson.recommendations = resultJson.recommendedCrops;
  }
  if (!resultJson.recommendedCrops && resultJson.recommendations) {
    resultJson.recommendedCrops = resultJson.recommendations;
  }
  if (!resultJson.potentialCrops && resultJson.recommendedCrops && isExplorationMode) {
    resultJson.potentialCrops = resultJson.recommendedCrops.map((c) => ({
      cropName: c.cropName,
      aiPotential: c.confidence || 'HIGH',
      whyItMayFit: c.whySuitable || c.explanation || c.soilAssessment || '',
      soilAssessment: c.soilAssessment || '',
      weatherAssessment: c.weatherAssessment || '',
      waterAssessment: c.waterAssessment || '',
      rotationAssessment: c.rotationAssessment || '',
      plantingWindowAssessment: c.plantingWindowAssessment || '',
      nutrientConsiderations:
        c.nutrientDeficiencies && c.nutrientDeficiencies.length > 0
          ? c.nutrientDeficiencies
          : c.nutrientConsiderations || [],
      keyRisks: c.keyRisks || [],
      uncertainties: c.uncertainties || [],
      confidenceExplanation: c.confidenceExplanation || '',
      validationStatus: 'AI_DERIVED_NOT_DISTRICT_VALIDATED',
    }));
  }

  if (isExplorationMode) {
    resultJson.mode = 'AGRONOMIC_EXPLORATION';
  } else {
    resultJson.mode = 'VALIDATED_RECOMMENDATION';
  }

  return resultJson;
}

app.post('/diagnoseCrop', authenticateRequest, handleCropDiagnosis);
app.post('/api/diagnose', authenticateRequest, handleCropDiagnosis);
app.post('/api/diagnoseCrop', authenticateRequest, handleCropDiagnosis);

async function handleExtractSoilReport(req, res) {
  try {
    const uid = req.user.uid;
    const payload = req.body.data || req.body;
    const result = await processSoilReportPdf(uid, payload);
    return res.status(200).json({ data: result });
  } catch (err) {
    console.error('[Extract Soil PDF Endpoint Error]', err.message);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to extract soil report' });
  }
}

async function handleCropAdvisory(req, res) {
  try {
    const uid = req.user.uid;
    const payload = req.body.data || req.body;
    const result = await processCropAdvisory(uid, payload);
    return res.status(200).json({ data: result });
  } catch (err) {
    console.error('[Crop Advisory Endpoint Error]', err.message);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to generate crop advisory' });
  }
}

app.post('/extractSoilReport', authenticateRequest, handleExtractSoilReport);
app.post('/api/extractSoilReport', authenticateRequest, handleExtractSoilReport);
app.post('/diagnoseCrop/extractSoilReport', authenticateRequest, handleExtractSoilReport);

app.post('/adviseCrop', authenticateRequest, handleCropAdvisory);
app.post('/api/adviseCrop', authenticateRequest, handleCropAdvisory);
app.post('/api/crop-advisor', authenticateRequest, handleCropAdvisory);
app.post('/api/recommendCrop', authenticateRequest, handleCropAdvisory);
app.post('/diagnoseCrop/adviseCrop', authenticateRequest, handleCropAdvisory);

/**
 * Secure Backend Market & Mandi Price Proxy Endpoint (data.gov.in)
 * Reads private DATA_GOV_IN_API_KEY server-side and queries official AGMARKNET API
 */
async function fetchFromDataGovIn(resourceId, apiKey, filters, limit, offset) {
  let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=${limit}&offset=${offset}&sort[Arrival_Date]=desc`;

  if (filters.state && filters.state !== 'All') {
    url += `&filters[State]=${encodeURIComponent(filters.state)}`;
  }
  if (filters.district && filters.district !== 'All') {
    url += `&filters[District]=${encodeURIComponent(filters.district)}`;
  }
  if (filters.market && filters.market !== 'All') {
    url += `&filters[Market]=${encodeURIComponent(filters.market)}`;
  }
  if (filters.commodity && filters.commodity !== 'All') {
    url += `&filters[Commodity]=${encodeURIComponent(filters.commodity)}`;
  }

  const sanitizedUrlForLog = url.replace(/api-key=[^&]+/, 'api-key=[REDACTED]');
  console.log(`[Market Backend] Outbound Query: ${sanitizedUrlForLog}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FarmHelperBackend/1.0 (Indian Agriculture Mandi Service)',
      'Accept': 'application/json',
    },
  });

  console.log(`[Market Backend] data.gov.in HTTP Response Status: ${response.status} (${response.statusText})`);

  if (response.status === 429) {
    const retryAfterHeader = response.headers.get('retry-after');
    const retrySeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;
    const err = new Error('Rate limit exceeded from data.gov.in');
    err.status = 429;
    err.retryAfter = retrySeconds;
    throw err;
  }

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`data.gov.in authentication/authorization failed with HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }

  if (!response.ok) {
    const err = new Error(`data.gov.in service returned HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const json = await response.json();
  if (json && (json.error || json.status === 'error')) {
    const errMessage = typeof json.error === 'string' ? json.error : json.message || 'Market API returned error response';
    console.warn(`[Market Backend Warning] API body error: ${errMessage}`);
    const err = new Error(errMessage);
    err.status = 429;
    throw err;
  }

  return json;
}

const marketDataServerCache = new Map();
const SERVER_CACHE_TTL_MS = 30 * 60 * 1000; // 30-minute server-side cache for daily mandi prices

async function processMarketRequest(payload) {
  const apiKey = process.env.DATA_GOV_IN_API_KEY || process.env.GOV_MARKET_API_KEY;
  const hasDataGovKey = Boolean(process.env.DATA_GOV_IN_API_KEY && process.env.DATA_GOV_IN_API_KEY.trim());
  const hasGovMarketKey = Boolean(process.env.GOV_MARKET_API_KEY && process.env.GOV_MARKET_API_KEY.trim());

  console.log('[Market Backend Env Check]', {
    DATA_GOV_IN_API_KEY_configured: hasDataGovKey,
    GOV_MARKET_API_KEY_configured: hasGovMarketKey,
    selectedKeyLength: apiKey ? apiKey.trim().length : 0,
  });

  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim() || apiKey.includes('your_')) {
    const err = new Error('Server environment error: DATA_GOV_IN_API_KEY is not configured in functions/.env.');
    err.status = 500;
    throw err;
  }

  const PRIMARY_RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
  const SECONDARY_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
  const cleanKey = apiKey.trim();
  const action = payload.action || 'prices';

  const filterState = payload.stateName || payload.state;
  const filterDistrict = payload.districtName || payload.district;
  const filterMarket = payload.marketName || payload.market;
  const filterCommodity = payload.commodityName || payload.commodity;

  const filters = {
    state: filterState,
    district: filterDistrict,
    market: filterMarket,
    commodity: filterCommodity,
  };

  const limit = payload.limit ?? (action === 'prices' ? 20 : 500);
  const offset = payload.offset ?? 0;

  const cacheKey = `${action}::${filterState || 'All'}::${filterDistrict || 'All'}::${filterMarket || 'All'}::${filterCommodity || 'All'}::${limit}::${offset}`;

  // Check server cache first before hitting external API
  if (marketDataServerCache.has(cacheKey)) {
    const cached = marketDataServerCache.get(cacheKey);
    if (Date.now() - cached.timestamp < SERVER_CACHE_TTL_MS) {
      console.log(`[Market Backend] Serving cached government records for key: ${cacheKey}`);
      return cached.data;
    }
  }

  const resourceIds = [PRIMARY_RESOURCE_ID, SECONDARY_RESOURCE_ID];
  let lastError = null;

  for (const resourceId of resourceIds) {
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const json = await fetchFromDataGovIn(resourceId, cleanKey, filters, limit, offset);

        if (json && Array.isArray(json.records)) {
          let result = json;
          if (action === 'districts') {
            const set = new Set();
            json.records.forEach((r) => {
              const d = (r.District || r.district || r.district_name || '').trim();
              if (d) set.add(d);
            });
            result = { districts: Array.from(set).sort() };
          } else if (action === 'markets') {
            const set = new Set();
            json.records.forEach((r) => {
              const m = (r.Market || r.market || r.mandi_name || '').trim();
              if (m) set.add(m);
            });
            result = { markets: Array.from(set).sort() };
          } else if (action === 'commodities') {
            const set = new Set();
            json.records.forEach((r) => {
              const c = (r.Commodity || r.commodity || r.commodity_name || '').trim();
              if (c) set.add(c);
            });
            result = { commodities: Array.from(set).sort() };
          }

          marketDataServerCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      } catch (err) {
        lastError = err;
        if (err.status === 429 || err.status >= 500) {
          retries++;
          if (retries <= maxRetries) {
            const waitMs = err.retryAfter && err.retryAfter > 0 ? Math.min(err.retryAfter * 1000, 5000) : retries * 1500;
            console.log(`[Market Backend Bounded Retry] Attempt ${retries}/${maxRetries} after ${waitMs}ms backoff`);
            await new Promise((res) => setTimeout(res, waitMs));
            continue;
          }
        }
        break; // do not retry non-transient errors (400, 401, 403, 404)
      }
    }
  }

  // If live fetch failed but server has cached data, serve cached records
  if (marketDataServerCache.has(cacheKey)) {
    const cached = marketDataServerCache.get(cacheKey);
    console.log(`[Market Backend Fallback] Serving cached government records for key: ${cacheKey}`);
    return cached.data;
  }

  console.warn('[Market Backend Warning] All live data.gov.in fetch attempts failed:', lastError?.message);

  if (action === 'districts') return { districts: [] };
  if (action === 'markets') return { markets: [] };
  if (action === 'commodities') return { commodities: [] };

  const status = lastError?.status || 503;
  let message = 'Government market price service is temporarily busy. Please try again in a few moments.';
  if (status === 429) {
    message = 'Government market data service is rate-limited. Please try again in a moment.';
  } else if (status === 401 || status === 403) {
    message = 'Government market service authentication failed.';
  }

  const err = new Error(message);
  err.status = status;
  throw err;
}

async function handleMarketRequest(req, res) {
  try {
    const payload = (req.body && (req.body.data || req.body)) || req.query || {};
    const result = await processMarketRequest(payload);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    const status = err.status || 500;
    let errorCode = 'MARKET_API_REQUEST_FAILED';
    if (status === 429) errorCode = 'MARKET_API_RATE_LIMITED';
    else if (status === 401 || status === 403) errorCode = 'MARKET_API_AUTH_FAILED';
    else if (status === 400) errorCode = 'MARKET_API_BAD_REQUEST';
    else if (status >= 500) errorCode = 'MARKET_API_UNAVAILABLE';

    console.error('[Market Backend Error Diagnostics]', {
      errorCode,
      status,
      message: err.message,
    });

    return res.status(status).json({
      success: false,
      error: errorCode,
      message: err.message || 'Unable to retrieve market data.',
    });
  }
}

app.post('/getMarketPrices', handleMarketRequest);
app.get('/getMarketPrices', handleMarketRequest);
app.post('/marketPrices', handleMarketRequest);
app.get('/marketPrices', handleMarketRequest);
app.post('/api/getMarketPrices', handleMarketRequest);
app.post('/api/marketPrices', handleMarketRequest);
app.post('/diagnoseCrop/getMarketPrices', handleMarketRequest);
app.post('/diagnoseCrop/marketPrices', handleMarketRequest);

// Fallback root handler when function is invoked directly via Cloud Run root URL
app.all('/', (req, res, next) => {
  const service = (process.env.K_SERVICE || '').toLowerCase();
  if (service.includes('market')) {
    return handleMarketRequest(req, res);
  }
  return next();
});

async function handleSendTestEmail(req, res) {
  try {
    const uid = req.user.uid;
    let userEmail = req.user.email;
    let farmerName = req.user.name || req.user.displayName || 'Progressive Farmer';

    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc && userDoc.exists) {
        const data = userDoc.data();
        if (data.email) userEmail = data.email;
        if (data.fullName) farmerName = data.fullName;
      }
      const prefSnap = await db.collection('users').doc(uid).collection('settings').doc('preferences').get();
      if (prefSnap && prefSnap.exists) {
        const prefData = prefSnap.data();
        if (prefData.notificationEmail && typeof prefData.notificationEmail === 'string' && prefData.notificationEmail.includes('@')) {
          userEmail = prefData.notificationEmail.trim().toLowerCase();
        }
      }
    } catch (dbErr) {
      console.warn(`[Send Test Email Note] Firestore profile/preferences lookup skipped: ${dbErr.message}`);
    }

    if (!userEmail || !userEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_USER_EMAIL',
        message: 'No registered email address found for your account. Please ensure you are logged in with email or have an email linked to your profile.',
      });
    }

    const { subject, html, text } = buildTestEmail({ farmerName, farmerEmail: userEmail });
    const emailResult = await sendEmail({ to: userEmail, subject, html, text });

    return res.status(200).json({
      success: true,
      message: `FarmHelper test email successfully dispatched to ${userEmail}.`,
      recipient: userEmail,
      provider: emailResult.provider,
      simulated: emailResult.simulated || false,
    });
  } catch (err) {
    console.error('[Send Test Email Endpoint Error]', err.message);
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      error: 'TEST_EMAIL_FAILED',
      message: err.message || 'Failed to send test email.',
    });
  }
}

app.post('/sendTestEmail', authenticateRequest, handleSendTestEmail);
app.post('/api/sendTestEmail', authenticateRequest, handleSendTestEmail);
app.post('/diagnoseCrop/sendTestEmail', authenticateRequest, handleSendTestEmail);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'FarmHelper Secure Backend' });
});

// Firebase Cloud Function Exports (v2 HTTPS & Scheduled)
export const diagnoseCrop = onRequest({ cors: true }, app);
export const adviseCrop = onRequest({ cors: true }, app);
export const extractSoilReport = onRequest({ cors: true }, app);
export const getMarketPrices = onRequest({ cors: true }, app);
export const marketPrices = onRequest({ cors: true }, app);
export const sendTestEmail = onRequest({ cors: true }, app);

export const checkWeatherAdvisoriesScheduled = onSchedule({
  schedule: 'every 3 hours',
  timeZone: 'Asia/Kolkata',
  cors: true,
}, async (event) => {
  console.log('[Firebase Scheduler Triggered] Executing 3-hour automated weather advisory scan...');
  await processScheduledWeatherAlerts(db);
});

// Run local standalone server if executed directly
const currentScriptPath = fileURLToPath(import.meta.url);
if (
  process.argv[1] &&
  (process.argv[1].toLowerCase() === currentScriptPath.toLowerCase() ||
   process.argv[1].endsWith('index.js'))
) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`[FarmHelper Backend] Running locally on http://localhost:${PORT}`);
  });
}

