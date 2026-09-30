/**
 * Crop Doctor Client Service
 * Interacts with Firebase Storage, Dynamic Backend Endpoint, and Mock AI Fallback Engine
 */
import { auth } from '../config/firebase';
import { uploadUserFile } from './storageService';
import { CropDoctorRecord } from '../types/models';

export interface DiagnosisRequestInput {
  userId: string;
  crop: string;
  description?: string;
  file?: File | null;
  preferredLanguage?: string;
}

export interface DiagnosisRequestOptions {
  forceMock?: boolean;
}

export class CropDoctorError extends Error {
  endpointUrl?: string;
  status?: number;
  isNetworkError?: boolean;
  isCorsError?: boolean;

  constructor(
    message: string,
    endpointUrl?: string,
    options?: { status?: number; isNetworkError?: boolean; isCorsError?: boolean }
  ) {
    super(message);
    this.name = 'CropDoctorError';
    this.endpointUrl = endpointUrl;
    this.status = options?.status;
    this.isNetworkError = options?.isNetworkError;
    this.isCorsError = options?.isCorsError;
  }
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validate image file constraints
 */
export function validateCropImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Unsupported image format. Please upload a JPEG, PNG, or WebP photograph.');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum 10 MB limit.`);
  }
}

/**
 * Dynamically resolve the backend endpoint URL from environment configuration
 */
export function getBackendEndpoint(): string {
  const envUrl =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed.endsWith('/diagnoseCrop') || trimmed.endsWith('/api/diagnose')) {
      return trimmed;
    }
    return `${trimmed}/diagnoseCrop`;
  }

  if (import.meta.env.PROD) {
    return '/diagnoseCrop';
  }

  return 'http://localhost:5001/diagnoseCrop';
}

/**
 * Convert File to Base64 data string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Generate simulated pathological diagnosis for developer/offline testing
 */
/**
 * Generate simulated pathological diagnosis for developer/offline testing with language support
 */
export function generateMockDiagnosis(
  crop: string,
  description?: string,
  hasImage?: boolean,
  preferredLanguage?: string
): CropDoctorRecord {
  const normalizedCrop = crop.toLowerCase();
  const lang = (preferredLanguage || 'en').toLowerCase().split('-')[0];

  // Localized Wheat Mock
  if (normalizedCrop.includes('wheat') || normalizedCrop.includes('kanak') || normalizedCrop.includes('gehun') || normalizedCrop.includes('ઘઉં')) {
    if (lang === 'gu') {
      return {
        id: `mock_${Date.now()}`,
        userId: 'mock_user',
        crop: crop,
        description: description || 'વરસાદ પછી પાંદડા પર પીળા પાવડર જેવા ડાઘ જોવા મળ્યા.',
        diagnosis: 'પીળો ગેરુ / પટ્ટી ગેરુ (Puccinia striiformis)',
        confidence: 0.92,
        severity: 'moderate',
        observedSymptoms: [
          'પાંદડાની નસો પર પીળા-નારંગી રંગના પાવડરી ડાઘ અને રેખાઓ.',
          hasImage ? 'પાંદડાના પેશીઓનો લીલો રંગ ઓછો થવો અને ફૂગનો સક્રિય વિકાસ.' : 'પાંદડા પર પીળી ધૂળ જેવી છટા.',
          'ઉપરના પાંદડા વહેલા સુકાઈ જવા અને પ્રકાશસંશ્લેષણ ક્ષમતા ઘટવી.',
        ],
        possibleCauses: [
          'વાતાવરણમાં વધુ ભેજ અને રાત્રિનું ઓછું તાપમાન (10-15°C).',
          'હવા દ્વારા પડોશી ખેતરોમાંથી ફૂગના બીજાણુઓ (Puccinia striiformis) નો ફેલાવો.',
          'પાકનો ગીચ વિકાસ જેથી રાત્રે ઝાકળ વધુ સમય ટકી રહે છે.',
        ],
        treatment: [
          'રાજ્ય કૃષિ વિભાગની ભલામણ મુજબ પ્રણાલીગત ફૂગનાશક (દા.ત., Propiconazole 25% EC અથવા Tebuconazole) નો છંટકાવ કરવો.',
          'સવારના વહેલા અથવા સાંજના સમયે એકસરખો છંટકાવ કરવો.',
          'સ્થાનિક કૃષિ વિજ્ઞાન કેન્દ્ર (KVK) ના અધિકારીની ભલામણ લેવી.',
        ],
        prevention: [
          'તમારા વિસ્તાર માટે ભલામણ કરેલ ગેરુ-પ્રતિકારક ઘઉંની જાતોનું વાવેતર કરવું.',
          'નાઇટ્રોજનયુક્ત ખાતરનો સંતુલિત ઉપયોગ કરવો.',
          'ભેજવાળા અને ઠંડા હવામાન દરમિયાન ખેતરનું નિયમિત નિરીક્ષણ કરવું.',
        ],
        expertConfirmationRecommended: true,
        createdAt: new Date().toISOString(),
      };
    }
    if (lang === 'hi') {
      return {
        id: `mock_${Date.now()}`,
        userId: 'mock_user',
        crop: crop,
        description: description || 'बारिश के बाद पत्तियों पर पीले रंग के पाउडर जैसे धब्बे दिखे।',
        diagnosis: 'पीला रतुआ / स्ट्राइप रस्ट (Puccinia striiformis)',
        confidence: 0.92,
        severity: 'moderate',
        observedSymptoms: [
          'पत्तियों की नसों पर पीले-नारंगी रंग की धारियां और पाउडर वाले धब्बे।',
          hasImage ? 'पत्तियों का पीला पड़ना और सक्रिय कवक बीजाणु।' : 'पत्तियों पर पीली धूल जैसा जमाव।',
          'ऊपरी पत्तियों का समय से पहले सूखना।',
        ],
        possibleCauses: [
          'उच्च आर्द्रता और रात का कम तापमान (10-15°C)।',
          'हवा द्वारा बीजाणुओं (Puccinia striiformis) का प्रसार।',
          'फसल का अत्यधिक सघन होना।',
        ],
        treatment: [
          'अनुशंसित कवकनाशी (जैसे Propiconazole 25% EC या Tebuconazole) का छिड़काव करें।',
          'सुबह या शाम के समय समान रूप से छिड़काव करें।',
          'निकटतम कृषि विज्ञान केंद्र (KVK) से सलाह लें।',
        ],
        prevention: [
          'रतुआ-रोधी किस्मों की बुवाई करें।',
          'नाइट्रोजन उर्वरक का संतुलित उपयोग करें।',
          'नियमित रूप से खेत का निरीक्षण करें।',
        ],
        expertConfirmationRecommended: true,
        createdAt: new Date().toISOString(),
      };
    }
    if (lang === 'mr') {
      return {
        id: `mock_${Date.now()}`,
        userId: 'mock_user',
        crop: crop,
        description: description || 'पावसानंतर पानांवर पिवळसर ठिपके दिसले.',
        diagnosis: 'पिवळा तांबेरा / स्ट्राइप रस्ट (Puccinia striiformis)',
        confidence: 0.92,
        severity: 'moderate',
        observedSymptoms: [
          'पानांच्या शिरांवर पिवळ्या-नारंगी रंगाचे पट्टे आणि ठिपके.',
          hasImage ? 'पाने पिवळी पडणे आणि बुरशीचा प्रादुर्भाव.' : 'पानांवर पिवळी धूळ साचणे.',
          'वरील पाने लवकर वाळणे.',
        ],
        possibleCauses: [
          'हवेतील जास्त आर्द्रता आणि रात्रीचे कमी तापमान.',
          'वाऱ्याद्वारे बुरशीच्या बीजाणूंचा (Puccinia striiformis) प्रसार.',
        ],
        treatment: [
          'शिफारस केलेल्या बुरशीनाशकाची (Propiconazole 25% EC किंवा Tebuconazole) फवारणी करा.',
          'सकाळी किंवा संध्याकाळी फवारणी करा.',
          'कृषी विज्ञान केंद्राचा (KVK) सल्ला घ्या.',
        ],
        prevention: [
          'तांबेरा-प्रतिबंधक वाणांची पेरणी करा.',
          'खतांचा संतुलित वापर करा.',
        ],
        expertConfirmationRecommended: true,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: `mock_${Date.now()}`,
      userId: 'mock_user',
      crop: crop,
      description: description || 'Yellowish powdery pustules observed along leaf veins after rain.',
      diagnosis: 'Stripe Rust / Yellow Rust (Puccinia striiformis)',
      confidence: 0.92,
      severity: 'moderate',
      observedSymptoms: [
        'Linear yellow-orange uredial pustules arranged in stripe patterns along leaf veins.',
        hasImage ? 'Visual leaf analysis indicates chlorotic leaf tissue and active fungal sporulation.' : 'Leaves show localized yellow dusting.',
        'Early leaf senescence and reduced photosynthetic area on upper foliage.',
      ],
      possibleCauses: [
        'High atmospheric humidity combined with cool night temperatures (10-15°C).',
        'Airborne fungal spores (Puccinia striiformis) carried from neighboring plots.',
        'Dense crop canopy retaining dew overnight.',
      ],
      treatment: [
        'Apply recommended systemic fungicide (e.g., Propiconazole 25% EC or Tebuconazole) as per official State Agricultural Department advisory.',
        'Spray during early morning or late evening hours ensuring uniform canopy coverage.',
        'Consult nearest Krishi Vigyan Kendra (KVK) officer for approved local formulation dosage.',
      ],
      prevention: [
        'Sow rust-resistant wheat varieties recommended for your agro-climatic zone.',
        'Maintain balanced nitrogen fertilization to avoid excessive vegetative growth.',
        'Monitor field weekly during cool, moist weather windows.',
      ],
      expertConfirmationRecommended: true,
      createdAt: new Date().toISOString(),
    };
  }

  // Generic Crop Mock in requested language
  if (lang === 'gu') {
    return {
      id: `mock_${Date.now()}`,
      userId: 'mock_user',
      crop: crop,
      description: description || 'પાંદડાનો રંગ બદલાવો અને લક્ષણો દેખાવા.',
      diagnosis: `${crop} પાંદડાના ડાઘ અને ફૂગનો ઉપદ્રવ`,
      confidence: 0.86,
      severity: 'moderate',
      observedSymptoms: [
        `${crop} ના પાંદડાની કિનારીઓ પર અનિયમિત ડાઘા જોવા મળે છે.`,
        hasImage ? 'પાંદડાના પેશીઓમાં પીળાશ અને સુકારાના ચિહ્નો.' : 'રિપોર્ટ કરેલ લક્ષણો ફૂગની પ્રવૃત્તિ દર્શાવે છે.',
        'બપોરના સમયે પાંદડા નમેલા જોવા મળે છે.',
      ],
      possibleCauses: [
        'હવામાં તાજેતરના ભેજને કારણે ફૂગના બીજાણુઓનો ફેલાવો.',
        'જમીનમાં ભેજ અને પોષક તત્વોની અસંતુલનતા.',
      ],
      treatment: [
        'જૈવિક ફૂગનાશક (દા.ત. Trichoderma viride અથવા કોપર ઓક્સિક્લોરાઇડ) નો છંટકાવ કરવો.',
        'મૂળ પાસે પાણી ન ભરાય તે માટે યોગ્ય નિકાલ કરવો.',
        'સ્થાનિક કિસાન હેલ્પલાઈન પર સલાહ લેવી.',
      ],
      prevention: [
        'પાકની ફેરબદલી કરવી.',
        'હવા-ઉજાસ માટે છોડ વચ્ચે યોગ્ય અંતર રાખવું.',
        'પ્રમાણિત અને સુધારેલા બિયારણનો ઉપયોગ કરવો.',
      ],
      expertConfirmationRecommended: true,
      createdAt: new Date().toISOString(),
    };
  }

  if (lang === 'hi') {
    return {
      id: `mock_${Date.now()}`,
      userId: 'mock_user',
      crop: crop,
      description: description || 'पत्तियों का रंग बदलना और धब्बे दिखना।',
      diagnosis: `${crop} लीफ स्पॉट एवं फंगल रोग`,
      confidence: 0.86,
      severity: 'moderate',
      observedSymptoms: [
        `${crop} की पत्तियों के किनारों पर धब्बे दिखाई दे रहे हैं।`,
        hasImage ? 'पत्तियों में पीलापन और सुखाने के लक्षण।' : 'लक्षण फंगल संक्रमण की ओर संकेत करते हैं।',
      ],
      possibleCauses: [
        'नमी के कारण फंगल बीजाणुओं का प्रसार।',
        'पोषक तत्वों का असंतुलन।',
      ],
      treatment: [
        'जैविक कवकनाशी (जैसे Trichoderma viride) का छिड़काव करें।',
        'खेत में जल निकासी सुनिश्चित करें।',
      ],
      prevention: [
        'फसल चक्र अपनाएं।',
        'उचित दूरी पर बुवाई करें।',
      ],
      expertConfirmationRecommended: true,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: `mock_${Date.now()}`,
    userId: 'mock_user',
    crop: crop,
    description: description || 'Foliar discoloration and visible physiological stress.',
    diagnosis: `${crop} Leaf Spot & Fungal Blight Complex`,
    confidence: 0.86,
    severity: 'moderate',
    observedSymptoms: [
      `Irregular necrotic spotting along the leaf margins of the ${crop} plant.`,
      hasImage ? `Visual symptom analysis confirms leaf tissue chlorosis.` : `Reported symptoms indicate foliar fungal activity.`,
      `Mild leaf drooping during afternoon sunlight.`,
    ],
    possibleCauses: [
      `Fungal spore accumulation favored by recent ambient humidity.`,
      `Minor nutrient imbalance or localized soil moisture fluctuation.`,
    ],
    treatment: [
      `Spray broad-spectrum bio-fungicide (e.g., Trichoderma viride or copper oxychloride solution) as approved locally.`,
      `Ensure proper drainage to prevent waterlogging near roots.`,
      `Contact local Kisan Helpline (1800-180-1551) for crop-specific dosage advisory.`,
    ],
    prevention: [
      `Practice crop rotation between growing seasons.`,
      `Maintain optimal plant-to-plant spacing for sunlight and air circulation.`,
      `Use clean, disease-free seed material.`,
    ],
    expertConfirmationRecommended: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Run Pathological Crop Diagnosis via Secure Backend API with Developer Mock Fallback
 */
export async function runCropDiagnosis(
  input: DiagnosisRequestInput,
  options?: DiagnosisRequestOptions
): Promise<CropDoctorRecord> {
  const { userId, crop, description, file } = input;

  if (!userId) {
    throw new CropDoctorError('Authentication required. Please sign in to use Crop Doctor.');
  }

  if (!crop || !crop.trim()) {
    throw new CropDoctorError('Please select a cultivated crop from the dropdown.');
  }

  const cleanDescription = description ? description.trim() : '';

  if (!file && !cleanDescription) {
    throw new CropDoctorError('Please upload an affected crop image or provide a description of the symptoms.');
  }

  const isMockEnabled = options?.forceMock === true;

  if (isMockEnabled) {
    console.log('[CropDoctorService] Running explicitly requested developer mock diagnosis.');
    await new Promise((resolve) => setTimeout(resolve, 800));
    return generateMockDiagnosis(crop.trim(), cleanDescription, Boolean(file), input.preferredLanguage);
  }

  let storagePath: string | null = null;
  let imageBase64: string | null = null;
  let imageMimeType: string | null = null;

  if (file) {
    validateCropImage(file);
    imageMimeType = file.type;

    imageBase64 = await fileToBase64(file);

    try {
      const uploadPromise = uploadUserFile(userId, file, 'cropDoctor');
      const timeoutPromise = new Promise<{ downloadUrl: string; storagePath: string }>((_, reject) =>
        setTimeout(() => reject(new Error('Storage upload timeout')), 3000)
      );
      const uploadResult = await Promise.race([uploadPromise, timeoutPromise]);
      storagePath = uploadResult.storagePath;
    } catch (uploadErr) {
      console.warn('[Storage Note] Proceeding with diagnosis using fast base64 upload:', uploadErr);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      storagePath = `users/${userId}/cropDoctor/${Date.now()}_${sanitizedName}`;
    }
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new CropDoctorError('User session expired. Please sign in again.');
  }

  const idToken = await currentUser.getIdToken(/* forceRefresh */ true);
  const backendUrl = getBackendEndpoint();

  const payload = {
    crop: crop.trim(),
    description: cleanDescription,
    imagePath: storagePath,
    imageBase64: imageBase64,
    imageMimeType: imageMimeType,
    preferredLanguage: input.preferredLanguage || 'en-IN',
  };

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ data: payload }),
    });

    let responseData: any = {};
    try {
      responseData = await response.json();
    } catch (parseErr) {
      console.warn('[CropDoctorService] Could not parse JSON response:', parseErr);
    }

    if (!response.ok) {
      const errorMessage =
        responseData.error ||
        responseData.message ||
        `Backend server returned error status ${response.status} (${response.statusText}).`;
      throw new CropDoctorError(errorMessage, backendUrl, { status: response.status });
    }

    const diagnosisRecord: CropDoctorRecord = responseData.data || responseData;
    return diagnosisRecord;
  } catch (err: any) {
    console.error('[CropDoctorService Error]', err);

    if (err instanceof CropDoctorError) {
      throw err;
    }

    const isNetworkError =
      err.name === 'TypeError' ||
      (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')));

    if (isNetworkError) {
      throw new CropDoctorError(
        `Unable to connect to the FarmHelper diagnostic backend. Please ensure the backend server is running at ${backendUrl}.`,
        backendUrl,
        { isNetworkError: true }
      );
    }

    throw new CropDoctorError(
      err.message || 'Unable to complete the AI diagnosis right now. Please try again.',
      backendUrl,
      { status: err.status }
    );
  }
}

