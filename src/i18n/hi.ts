import en from './en';

const hi: Record<string, string> = {
  ...en,
  // Navigation
  'nav.overview': 'अवलोकन',
  'nav.myFarm': 'मेरा खेत',
  'nav.cropDoctor': 'फसल डॉक्टर',
  'nav.cropAdvisor': 'फसल सलाहकार',
  'nav.weather': 'मौसम',
  'nav.marketMandi': 'बाज़ार और मंडी',
  'nav.govSchemes': 'सरकारी योजनाएं',
  'nav.settings': 'सेटिंग्स',
  'nav.helpSupport': 'सहायता',

  // Settings
  'settings.title': 'सेटिंग्स और प्राथमिकताएं',
  'settings.regionalStandards': 'क्षेत्रीय मानक और माप इकाइयाँ',
  'settings.regionalLanguage': 'क्षेत्रीय भाषा',
  'settings.landAreaUnit': 'भूमि क्षेत्र इकाई',
  'settings.weightUnit': 'फसल उपज और वजन इकाई',
  'settings.temperatureScale': 'तापमान पैमाना',
  'settings.saveBtn': 'प्राथमिकताएं सहेजें',

  // Market
  'market.title': 'बाज़ार और मंडी भाव',
  'market.selectState': 'राज्य चुनें',
  'market.selectDistrict': 'ज़िला चुनें',
  'market.marketMandi': 'मंडी',
  'market.commodity': 'फसल/वस्तु',
  'market.minRate': 'न्यूनतम भाव',
  'market.maxRate': 'अधिकतम भाव',
  'market.modalRate': 'औसत भाव',
  'market.marketDate': 'मंडी दिनांक',

  // Weather
  'weather.title': 'खेत का मौसम और छिड़काव सलाह',
  'weather.currentWeather': 'वर्तमान मौसम',
  'weather.feelsLike': 'महसूस होता है',
  'weather.relativeHumidity': 'नमी',
  'weather.windVelocity': 'हवा की गति',
  'weather.rainProbability': 'बारिश की संभावना',
  'weather.forecast': '5-दिवसीय पूर्वानुमान',

  // My Farm
  'farm.title': 'मेरा खेत और प्लॉट',
  'farm.addBoundary': 'खेत की सीमा जोड़ें',
  'farm.farmArea': 'खेत का क्षेत्रफल',
  'farm.currentCrop': 'वर्तमान फसल',
  'farm.planted': 'बुवाई',

  // Common
  'common.loading': 'लोड हो रहा है...',
  'common.checkAgain': 'फिर से जांचें',
  'common.cancel': 'रद्द करें',
};

export default hi;
