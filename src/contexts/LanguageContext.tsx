import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    'dashboard': 'Dashboard',
    'farms': 'Farms',
    'alerts': 'AI Alerts',
    'reports': 'Reports',
    'chat': 'Chat',
    'settings': 'Settings',
    'logout': 'Logout',
    'scheduler': 'Scheduler',

    // Dashboard
    'dashboard.title': 'Farm Dashboard',
    'dashboard.selectFarm': 'Select Farm',
    'dashboard.addFarm': 'Add New Farm',
    'dashboard.createFarm': 'Create Farm',
    'dashboard.noFarms': 'No farms found. Create your first farm to get started.',

    // Farm Setup
    'farm.setup.title': 'Create Your Farm',
    'farm.setup.subtitle': "Let's set up your first farm to get started",
    'farm.setup.farmName': 'Farm Name',
    'farm.setup.location': 'Location',
    'farm.setup.crop': 'Primary Crop',
    'farm.setup.phoneNumber': 'Phone Number',
    'farm.setup.boundary': 'Farm Boundary',
    'farm.setup.save': 'Save Farm',
    'farm.setup.creating': 'Creating Farm...',

    // Weather
    'weather.title': 'Weather Forecast',
    'weather.today': 'Today',
    'weather.high': 'High',
    'weather.low': 'Low',
    'weather.rain': 'Rain',
    'weather.wind': 'Wind',
    'weather.humidity': 'Humidity',
    'weather.pressure': 'Pressure',
    'weather.uvIndex': 'UV Index',
    'weather.sunrise': 'Sunrise',

    // Crop Health
    'health.title': 'Crop Health Monitor',
    'health.fieldAnalysis': 'Field Analysis',
    'health.vegetationHealth': 'Vegetation Health Indices',
    'health.soilEnvironmental': 'Soil & Environmental Indices',
    'health.fieldArea': 'Field Area',
    'health.cropCode': 'Crop Code',
    'health.sowingDate': 'Sowing Date',
    'health.healthUnits': 'Health Units',

    // AI
    'ai.title': 'AI Farming Insights',
    'ai.poweredBy': 'Powered by Gemini AI',
    'ai.analyzing': 'Analyzing...',
    'ai.refreshInsights': 'Refresh Insights',
    'ai.chat.title': 'AI Assistant',
    'ai.chat.placeholder': 'Ask me anything about farming...',

    // Scheduler
    'scheduler.title': 'Farm Activity Scheduler',
    'scheduler.addActivity': 'Add Activity',
    'scheduler.editActivity': 'Edit Activity',
    'scheduler.deleteActivity': 'Delete Activity',
    'scheduler.activityName': 'Activity Name',
    'scheduler.activityType': 'Activity Type',
    'scheduler.date': 'Date',
    'scheduler.time': 'Time',
    'scheduler.description': 'Description',
    'scheduler.priority': 'Priority',
    'scheduler.status': 'Status',
    'scheduler.save': 'Save',
    'scheduler.cancel': 'Cancel',
    'scheduler.today': 'Today',
    'scheduler.upcoming': 'Upcoming',
    'scheduler.completed': 'Completed',

    // Reports
    'reports.title': 'Farm Reports',
    'reports.generate': 'Generate Report',
    'reports.download': 'Download',
    'reports.cropHealth': 'Crop Health Report',
    'reports.weather': 'Weather Analysis',
    'reports.activities': 'Activity Summary',
    'reports.yield': 'Yield Estimation',
    'reports.financial': 'Financial Overview',

    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile Settings',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.about': 'About',
    'settings.save': 'Save Changes',
    'settings.name': 'Name',
    'settings.email': 'Email',
    'settings.phone': 'Phone Number',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
  },
  hi: {
    // Navigation
    'dashboard': 'डैशबोर्ड',
    'farms': 'खेत',
    'alerts': 'AI अलर्ट',
    'reports': 'रिपोर्ट',
    'chat': 'चैट',
    'settings': 'सेटिंग्स',
    'logout': 'लॉगआउट',
    'scheduler': 'शेड्यूलर',

    // Dashboard
    'dashboard.title': 'फार्म डैशबोर्ड',
    'dashboard.selectFarm': 'खेत चुनें',
    'dashboard.addFarm': 'नया खेत जोड़ें',
    'dashboard.createFarm': 'खेत बनाएं',
    'dashboard.noFarms': 'कोई खेत नहीं मिला। शुरू करने के लिए अपना पहला खेत बनाएं।',

    // Farm Setup
    'farm.setup.title': 'अपना खेत बनाएं',
    'farm.setup.subtitle': 'आइए शुरू करने के लिए अपना पहला खेत सेट करें',
    'farm.setup.farmName': 'खेत का नाम',
    'farm.setup.location': 'स्थान',
    'farm.setup.crop': 'मुख्य फसल',
    'farm.setup.phoneNumber': 'फोन नंबर',
    'farm.setup.boundary': 'खेत की सीमा',
    'farm.setup.save': 'खेत सेव करें',
    'farm.setup.creating': 'खेत बनाया जा रहा है...',

    // Weather
    'weather.title': 'मौसम पूर्वानुमान',
    'weather.today': 'आज',
    'weather.high': 'अधिकतम',
    'weather.low': 'न्यूनतम',
    'weather.rain': 'बारिश',
    'weather.wind': 'हवा',
    'weather.humidity': 'नमी',
    'weather.pressure': 'दबाव',
    'weather.uvIndex': 'UV इंडेक्स',
    'weather.sunrise': 'सूर्योदय',

    // Crop Health
    'health.title': 'फसल स्वास्थ्य मॉनिटर',
    'health.fieldAnalysis': 'खेत विश्लेषण',
    'health.vegetationHealth': 'वनस्पति स्वास्थ्य सूचकांक',
    'health.soilEnvironmental': 'मिट्टी और पर्यावरण सूचकांक',
    'health.fieldArea': 'खेत का क्षेत्रफल',
    'health.cropCode': 'फसल कोड',
    'health.sowingDate': 'बुआई की तारीख',
    'health.healthUnits': 'स्वास्थ्य इकाइयां',

    // AI
    'ai.title': 'AI कृषि अंतर्दृष्टि',
    'ai.poweredBy': 'Gemini AI द्वारा संचालित',
    'ai.analyzing': 'विश्लेषण कर रहे हैं...',
    'ai.refreshInsights': 'अंतर्दृष्टि रीफ्रेश करें',
    'ai.chat.title': 'AI सहायक',
    'ai.chat.placeholder': 'कृषि के बारे में कुछ भी पूछें...',

    // Scheduler
    'scheduler.title': 'कृषि गतिविधि शेड्यूलर',
    'scheduler.addActivity': 'गतिविधि जोड़ें',
    'scheduler.editActivity': 'गतिविधि संपादित करें',
    'scheduler.deleteActivity': 'गतिविधि हटाएं',
    'scheduler.activityName': 'गतिविधि का नाम',
    'scheduler.activityType': 'गतिविधि का प्रकार',
    'scheduler.date': 'तारीख',
    'scheduler.time': 'समय',
    'scheduler.description': 'विवरण',
    'scheduler.priority': 'प्राथमिकता',
    'scheduler.status': 'स्थिति',
    'scheduler.save': 'सेव करें',
    'scheduler.cancel': 'रद्द करें',
    'scheduler.today': 'आज',
    'scheduler.upcoming': 'आगामी',
    'scheduler.completed': 'पूर्ण',

    // Reports
    'reports.title': 'कृषि रिपोर्ट',
    'reports.generate': 'रिपोर्ट जेनरेट करें',
    'reports.download': 'डाउनलोड',
    'reports.cropHealth': 'फसल स्वास्थ्य रिपोर्ट',
    'reports.weather': 'मौसम विश्लेषण',
    'reports.activities': 'गतिविधि सारांश',
    'reports.yield': 'उत्पादन अनुमान',
    'reports.financial': 'वित्तीय अवलोकन',

    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.profile': 'प्रोफाइल सेटिंग्स',
    'settings.language': 'भाषा',
    'settings.notifications': 'सूचनाएं',
    'settings.privacy': 'गोपनीयता',
    'settings.about': 'के बारे में',
    'settings.save': 'परिवर्तन सेव करें',
    'settings.name': 'नाम',
    'settings.email': 'ईमेल',
    'settings.phone': 'फोन नंबर',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.warning': 'चेतावनी',
    'common.info': 'जानकारी',
    'common.close': 'बंद करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.view': 'देखें',
    'common.search': 'खोजें',
    'common.filter': 'फिल्टर',
    'common.export': 'निर्यात',
    'common.import': 'आयात',
  },
  te: {
    // Navigation
    'dashboard': 'డాష్‌బోర్డ్',
    'farms': 'వ్యవసాయ క్షేత్రాలు',
    'alerts': 'AI హెచ్చరికలు',
    'reports': 'నివేదికలు',
    'chat': 'చాట్',
    'settings': 'సెట్టింగ్‌లు',
    'logout': 'లాగ్ అవుట్',
    'scheduler': 'షెడ్యూలర్',

    // Dashboard
    'dashboard.title': 'వ్యవసాయ డాష్‌బోర్డ్',
    'dashboard.selectFarm': 'వ్యవసాయ క్షేత్రం ఎంచుకోండి',
    'dashboard.addFarm': 'కొత్త వ్యవసాయ క్షేత్రం జోడించండి',
    'dashboard.createFarm': 'వ్యవసాయ క్షేత్రం సృష్టించండి',
    'dashboard.noFarms': 'వ్యవసాయ క్షేత్రాలు కనుగొనబడలేదు. ప్రారంభించడానికి మీ మొదటి వ్యవసాయ క్షేత్రాన్ని సృష్టించండి.',

    // Farm Setup
    'farm.setup.title': 'మీ వ్యవసాయ క్షేత్రాన్ని సృష్టించండి',
    'farm.setup.subtitle': 'ప్రారంభించడానికి మీ మొదటి వ్యవసాయ క్షేత్రాన్ని సెటప్ చేద్దాం',
    'farm.setup.farmName': 'వ్యవసాయ క్షేత్రం పేరు',
    'farm.setup.location': 'స్థానం',
    'farm.setup.crop': 'ప్రధాన పంట',
    'farm.setup.phoneNumber': 'ఫోన్ నంబర్',
    'farm.setup.boundary': 'వ్యవసాయ క్షేత్రం సరిహద్దు',
    'farm.setup.save': 'వ్యవసాయ క్షేత్రాన్ని సేవ్ చేయండి',
    'farm.setup.creating': 'వ్యవసాయ క్షేత్రం సృష్టిస్తున్నాం...',

    // Weather
    'weather.title': 'వాతావరణ అంచనా',
    'weather.today': 'ఈరోజు',
    'weather.high': 'గరిష్ట',
    'weather.low': 'కనిష్ట',
    'weather.rain': 'వర్షం',
    'weather.wind': 'గాలి',
    'weather.humidity': 'తేమ',
    'weather.pressure': 'ఒత్తిడి',
    'weather.uvIndex': 'UV సూచిక',
    'weather.sunrise': 'సూర్యోదయం',

    // Crop Health
    'health.title': 'పంట ఆరోగ్య పర్యవేక్షణ',
    'health.fieldAnalysis': 'క్షేత్ర విశ్లేషణ',
    'health.vegetationHealth': 'వృక్షసంపద ఆరోగ్య సూచికలు',
    'health.soilEnvironmental': 'మట్టి మరియు పర్యావరణ సూచికలు',
    'health.fieldArea': 'క్షేత్ర వైశాల్యం',
    'health.cropCode': 'పంట కోడ్',
    'health.sowingDate': 'విత్తన తేదీ',
    'health.healthUnits': 'ఆరోగ్య యూనిట్లు',

    // AI
    'ai.title': 'AI వ్యవసాయ అంతర్దృష్టులు',
    'ai.poweredBy': 'Gemini AI ద్వారా శక్తివంతం',
    'ai.analyzing': 'విశ్లేషిస్తున్నాం...',
    'ai.refreshInsights': 'అంతర్దృష్టులను రిఫ్రెష్ చేయండి',
    'ai.chat.title': 'AI సహాయకుడు',
    'ai.chat.placeholder': 'వ్యవసాయం గురించి ఏదైనా అడగండి...',

    // Scheduler
    'scheduler.title': 'వ్యవసాయ కార్యకలాప షెడ్యూలర్',
    'scheduler.addActivity': 'కార్యకలాపం జోడించండి',
    'scheduler.editActivity': 'కార్యకలాపం సవరించండి',
    'scheduler.deleteActivity': 'కార్యకలాపం తొలగించండి',
    'scheduler.activityName': 'కార్యకలాప పేరు',
    'scheduler.activityType': 'కార్యకలాప రకం',
    'scheduler.date': 'తేదీ',
    'scheduler.time': 'సమయం',
    'scheduler.description': 'వివరణ',
    'scheduler.priority': 'ప్రాధాన్యత',
    'scheduler.status': 'స్థితి',
    'scheduler.save': 'సేవ్ చేయండి',
    'scheduler.cancel': 'రద్దు చేయండి',
    'scheduler.today': 'ఈరోజు',
    'scheduler.upcoming': 'రాబోయే',
    'scheduler.completed': 'పూర్తయింది',

    // Reports
    'reports.title': 'వ్యవసాయ నివేదికలు',
    'reports.generate': 'నివేదిక రూపొందించండి',
    'reports.download': 'డౌన్‌లోడ్',
    'reports.cropHealth': 'పంట ఆరోగ్య నివేదిక',
    'reports.weather': 'వాతావరణ విశ్లేషణ',
    'reports.activities': 'కార్యకలాప సారాంశం',
    'reports.yield': 'దిగుబడి అంచనా',
    'reports.financial': 'ఆర్థిక అవలోకనం',

    // Settings
    'settings.title': 'సెట్టింగ్‌లు',
    'settings.profile': 'ప్రొఫైల్ సెట్టింగ్‌లు',
    'settings.language': 'భాష',
    'settings.notifications': 'నోటిఫికేషన్‌లు',
    'settings.privacy': 'గోప్యత',
    'settings.about': 'గురించి',
    'settings.save': 'మార్పులను సేవ్ చేయండి',
    'settings.name': 'పేరు',
    'settings.email': 'ఇమెయిల్',
    'settings.phone': 'ఫోన్ నంబర్',

    // Common
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.error': 'లోపం',
    'common.success': 'విజయం',
    'common.warning': 'హెచ్చరిక',
    'common.info': 'సమాచారం',
    'common.close': 'మూసివేయండి',
    'common.edit': 'సవరించండి',
    'common.delete': 'తొలగించండి',
    'common.view': 'చూడండి',
    'common.search': 'వెతకండి',
    'common.filter': 'ఫిల్టర్',
    'common.export': 'ఎగుమతి',
    'common.import': 'దిగుమతి',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};