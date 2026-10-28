import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { pagesEnglish, pagesHindi, pagesTamil, engSchemeDataExtra, hinSchemeDataExtra, tamSchemeDataExtra } from './translations';
import { engExtra, hinExtra, tamExtra, marExtra } from './extraTranslations';

const resources = {
  English: {
    translation: {
      menu: {
        home: "Home",
        dashboard: "Dashboard",
        mySchemes: "My Schemes",
        findSchemes: "Find Schemes",
        myApplications: "My Applications",
        myBenefits: "My Benefits",
        documents: "Documents",
        aiAssistant: "AI Assistant",
        whatIf: "What-If Simulator",
        compareSchemes: "Compare Schemes",
        feedback: "Feedback",
        profile: "Profile"
      },
      ...pagesEnglish,
      ...engExtra,
      dashboard: {
        greeting: {
          morning: "Good morning!",
          afternoon: "Good afternoon!",
          evening: "Good evening!"
        },
        welcomeBack: "Welcome back",
        recommendedSchemes: "Recommended Schemes",
        activeApplications: "Active Applications",
        benefitsReceived: "Benefits Received",
        documents: "Documents",
        aiMatchedSchemes: "AI-Matched Schemes",
        aiMatchedDesc: "Schemes matched to your profile — potentially eligible",
        viewAll: "View all",
        applicationStatus: "Application Status"
      },
      profile: {
        title: "My Profile",
        subtitle: "Manage your personal information",
        personalInfo: "Personal Information",
        fullName: "Full Name",
        email: "Email",
        mobile: "Mobile",
        state: "State",
        age: "Age",
        occupation: "Occupation",
        incomeBracket: "Income Bracket",
        socialCategory: "Social Category",
        preferredLanguage: "Preferred Language",
        accountSummary: "Account Summary",
        editProfile: "Edit Profile",
        note: "Note: Profile editing and account settings will be available once authentication is implemented. This is a demo profile."
      },
      schemeData: {
        "Post-Matric Scholarship for SC Students": "Post-Matric Scholarship for SC Students",
        "Ministry of Social Justice": "Ministry of Social Justice",
        "Up to ₹50,000 per year for tuition and maintenance": "Up to ₹50,000 per year for tuition and maintenance",
        "Ayushman Bharat PM-JAY": "Ayushman Bharat PM-JAY",
        "National Health Authority": "National Health Authority",
        "Health coverage up to ₹5 lakh per family per year": "Health coverage up to ₹5 lakh per family per year",
        "PM-KISAN Samman Nidhi": "PM-KISAN Samman Nidhi",
        "Ministry of Agriculture": "Ministry of Agriculture",
        "₹6,000 per year in three installments for farmers": "₹6,000 per year in three installments for farmers",
        "Age matches (21)": "Age matches (21)",
        "Location matches (Maharashtra)": "Location matches (Maharashtra)",
        "Occupation matches (Student)": "Occupation matches (Student)",
        "Income verification required": "Income verification required",
        "Income bracket matches": "Income bracket matches",
        "Family category eligible": "Family category eligible",
        "Aadhaar verification required": "Aadhaar verification required",
        "Occupation matches (Farmer)": "Occupation matches (Farmer)",
        "Land records verification required": "Land records verification required",
        ...engSchemeDataExtra
      },
      common: {
        citizenAccount: "Citizen Account",
        adminDashboard: "Admin Dashboard",
        logout: "Logout",
        language: "Language",
        changeLanguage: "Change Language"
      },
      scheme: {
        match: "Match",
        govVerified: "Government Verified",
        ngoVerified: "NGO Verified",
        csrVerified: "CSR Verified",
        sourceVerified: "Source Verified",
        whyMatches: "WHY THIS MATCHES YOU",
        apply: "Apply Now",
        viewDetails: "View Details",
        deadline: "Deadline",
        potentiallyEligible: "Potentially Eligible",
        checkEligibility: "Check My Eligibility",
        overview: "Overview",
        summary: "Summary",
        yourMatch: "Your Match"
      },
      eligibility: {
        assessment: "Eligibility assessment",
        title: "Why this scheme matches you",
        subtitle: "This explanation is based on your current profile and live eligibility data.",
        profileMatches: "Your profile matches the location and eligibility records used for this recommendation. You may be eligible, subject to official document verification.",
        profileMatchesTitle: "How your profile matches",
        prepareTitle: "What you should prepare",
        prepareText: "Keep your identity, residence, income, and category documents ready. The final decision is made by {{provider}} after it verifies your application.",
        location: "Location",
        locationValue: "Available for residents of {{state}}.",
        locationMissing: "Your state must be verified.",
        age: "Age",
        ageValue: "Your profile lists you as {{age}} years old.",
        ageMissing: "Add your age to improve this assessment.",
        socialCategory: "Social category",
        categoryValue: "{{category}}.",
        categoryAccepts: "This scheme accepts: {{categories}}.",
        income: "Income",
        incomeValue: "Your recorded annual income is ₹{{income}}.",
        incomeMissing: "Add your annual income for a more precise assessment.",
        matched: "Matches your profile",
        pending: "Needs verification",
        back: "Back to scheme details",
        continue: "Continue to application",
        loading: "Loading eligibility details...",
        unavailable: "This scheme is not recommended for your current profile."
      }
    }
  },
  हिंदी: {
    translation: {
      menu: {
        home: "होम",
        dashboard: "डैशबोर्ड",
        mySchemes: "मेरी योजनाएं",
        findSchemes: "योजनाएं खोजें",
        myApplications: "मेरे आवेदन",
        myBenefits: "मेरे लाभ",
        documents: "दस्तावेज़",
        aiAssistant: "एआई सहायक",
        whatIf: "अनुमान सिम्युलेटर",
        compareSchemes: "योजनाओं की तुलना करें",
        feedback: "प्रतिक्रिया",
        profile: "प्रोफ़ाइल"
      },
      ...pagesHindi,
      ...hinExtra,
      dashboard: {
        greeting: {
          morning: "सुप्रभात!",
          afternoon: "शुभ दोपहर!",
          evening: "शुभ संध्या!"
        },
        welcomeBack: "वापसी पर स्वागत है",
        recommendedSchemes: "अनुशंसित योजनाएं",
        activeApplications: "सक्रिय आवेदन",
        benefitsReceived: "प्राप्त लाभ",
        documents: "दस्तावेज़",
        aiMatchedSchemes: "AI-मिलान वाली योजनाएं",
        aiMatchedDesc: "आपकी प्रोफ़ाइल से मेल खाने वाली योजनाएं — संभावित रूप से पात्र",
        viewAll: "सभी देखें",
        applicationStatus: "आवेदन स्थिति"
      },
      profile: {
        title: "मेरी प्रोफ़ाइल",
        subtitle: "अपनी व्यक्तिगत जानकारी प्रबंधित करें",
        personalInfo: "व्यक्तिगत जानकारी",
        fullName: "पूरा नाम",
        email: "ईमेल",
        mobile: "मोबाइल",
        state: "राज्य",
        age: "आयु",
        occupation: "पेशा",
        incomeBracket: "आय वर्ग",
        socialCategory: "सामाजिक श्रेणी",
        preferredLanguage: "पसंदीदा भाषा",
        accountSummary: "खाता सारांश",
        editProfile: "प्रोफ़ाइल संपादित करें",
        note: "नोट: प्रोफ़ाइल संपादन और खाता सेटिंग्स प्रमाणीकरण लागू होने के बाद उपलब्ध होंगी। यह एक डेमो प्रोफ़ाइल है।"
      },
      schemeData: {
        "Post-Matric Scholarship for SC Students": "एससी छात्रों के लिए पोस्ट-मैट्रिक स्कॉलरशिप",
        "Ministry of Social Justice": "सामाजिक न्याय मंत्रालय",
        "Up to ₹50,000 per year for tuition and maintenance": "ट्यूशन और रखरखाव के लिए प्रति वर्ष ₹50,000 तक",
        "Ayushman Bharat PM-JAY": "आयुष्मान भारत पीएम-जय",
        "National Health Authority": "राष्ट्रीय स्वास्थ्य प्राधिकरण",
        "Health coverage up to ₹5 lakh per family per year": "प्रति परिवार प्रति वर्ष ₹5 लाख तक का स्वास्थ्य कवरेज",
        "PM-KISAN Samman Nidhi": "पीएम-किसान सम्मान निधि",
        "Ministry of Agriculture": "कृषि मंत्रालय",
        "₹6,000 per year in three installments for farmers": "किसानों के लिए तीन किस्तों में प्रति वर्ष ₹6,000",
        "Age matches (21)": "आयु मेल खाती है (21)",
        "Location matches (Maharashtra)": "स्थान मेल खाता है (महाराष्ट्र)",
        "Occupation matches (Student)": "पेशा मेल खाता है (छात्र)",
        "Income verification required": "आय सत्यापन आवश्यक है",
        "Income bracket matches": "आय वर्ग मेल खाता है",
        "Family category eligible": "पारिवारिक श्रेणी पात्र है",
        "Aadhaar verification required": "आधार सत्यापन आवश्यक है",
        "Occupation matches (Farmer)": "पेशा मेल खाता है (किसान)",
        "Land records verification required": "भूमि रिकॉर्ड सत्यापन आवश्यक है",
        ...hinSchemeDataExtra
      },
      common: {
        citizenAccount: "नागरिक खाता",
        adminDashboard: "व्यवस्थापक डैशबोर्ड",
        logout: "लॉग आउट",
        language: "भाषा",
        changeLanguage: "भाषा बदलें"
      },
      scheme: {
        match: "मिलान",
        govVerified: "सरकारी सत्यापित",
        ngoVerified: "एनजीओ सत्यापित",
        csrVerified: "सीएसआर सत्यापित",
        sourceVerified: "स्रोत सत्यापित",
        whyMatches: "यह आपसे क्यों मेल खाता है",
        apply: "अभी आवेदन करें",
        viewDetails: "विवरण देखें",
        deadline: "अंतिम तिथि",
        potentiallyEligible: "संभावित रूप से पात्र",
        checkEligibility: "मेरी पात्रता जांचें",
        overview: "अवलोकन",
        summary: "सारांश",
        yourMatch: "आपका मिलान"
      },
      eligibility: {
        assessment: "पात्रता मूल्यांकन",
        title: "यह योजना आपसे क्यों मेल खाती है",
        subtitle: "यह विवरण आपकी वर्तमान प्रोफ़ाइल और लाइव पात्रता डेटा पर आधारित है।",
        profileMatches: "आपकी प्रोफ़ाइल इस सिफारिश के लिए स्थान और पात्रता रिकॉर्ड से मेल खाती है। आधिकारिक दस्तावेज़ सत्यापन के अधीन आप पात्र हो सकते हैं।",
        profileMatchesTitle: "आपकी प्रोफ़ाइल का मिलान",
        prepareTitle: "आपको क्या तैयार रखना चाहिए",
        prepareText: "अपनी पहचान, निवास, आय और श्रेणी के दस्तावेज़ तैयार रखें। आपके आवेदन का सत्यापन करने के बाद {{provider}} अंतिम निर्णय लेगा।",
        location: "स्थान",
        locationValue: "{{state}} के निवासियों के लिए उपलब्ध।",
        locationMissing: "आपके राज्य का सत्यापन आवश्यक है।",
        age: "आयु",
        ageValue: "आपकी प्रोफ़ाइल में आयु {{age}} वर्ष दर्ज है।",
        ageMissing: "इस मूल्यांकन को बेहतर बनाने के लिए अपनी आयु जोड़ें।",
        socialCategory: "सामाजिक श्रेणी",
        categoryValue: "{{category}}।",
        categoryAccepts: "यह योजना स्वीकार करती है: {{categories}}।",
        income: "आय",
        incomeValue: "आपकी दर्ज वार्षिक आय ₹{{income}} है।",
        incomeMissing: "अधिक सटीक मूल्यांकन के लिए अपनी वार्षिक आय जोड़ें।",
        matched: "आपकी प्रोफ़ाइल से मेल खाता है",
        pending: "सत्यापन आवश्यक है",
        back: "योजना विवरण पर वापस जाएं",
        continue: "आवेदन जारी रखें",
        loading: "पात्रता विवरण लोड हो रहा है...",
        unavailable: "यह योजना आपकी वर्तमान प्रोफ़ाइल के लिए अनुशंसित नहीं है।"
      }
    }
  },
  தமிழ்: {
    translation: {
      menu: {
        home: "முகப்பு",
        dashboard: "டாஷ்போர்டு",
        mySchemes: "என் திட்டங்கள்",
        findSchemes: "திட்டங்களை தேடுங்கள்",
        myApplications: "என் விண்ணப்பங்கள்",
        myBenefits: "என் பயன்கள்",
        documents: "ஆவணங்கள்",
        aiAssistant: "செயற்கை நுண்ணறிவு உதவியாளர்",
        whatIf: "என்ன நடந்தால் சிமுலேட்டர்",
        compareSchemes: "திட்டங்களை ஒப்பிடுக",
        feedback: "பின்னூட்டம்",
        profile: "சுயவிவரம்"
      },
      ...pagesTamil,
      ...tamExtra,
      dashboard: {
        greeting: {
          morning: "காலை வணக்கம்!",
          afternoon: "மதிய வணக்கம்!",
          evening: "மாலை வணக்கம்!"
        },
        welcomeBack: "மீண்டும் வருக",
        recommendedSchemes: "பரிந்துரைக்கப்பட்ட திட்டங்கள்",
        activeApplications: "செயலில் உள்ள விண்ணப்பங்கள்",
        benefitsReceived: "பெறப்பட்ட பயன்கள்",
        documents: "ஆவணங்கள்",
        aiMatchedSchemes: "AI-பொருத்தப்பட்ட திட்டங்கள்",
        aiMatchedDesc: "உங்கள் சுயவிவரத்துடன் பொருந்தக்கூடிய திட்டங்கள் — தகுதியானவை",
        viewAll: "அனைத்தையும் காண்க",
        applicationStatus: "விண்ணப்ப நிலை"
      },
      profile: {
        title: "என் சுயவிவரம்",
        subtitle: "உங்கள் தனிப்பட்ட தகவல்களை நிர்வகிக்கவும்",
        personalInfo: "தனிப்பட்ட தகவல்கள்",
        fullName: "முழு பெயர்",
        email: "மின்னஞ்சல்",
        mobile: "மொபைல்",
        state: "மாநிலம்",
        age: "வயது",
        occupation: "தொழில்",
        incomeBracket: "வருமான வரம்பு",
        socialCategory: "சமூக வகை",
        preferredLanguage: "விருப்பமான மொழி",
        accountSummary: "கணக்கு சுருக்கம்",
        editProfile: "சுயவிவரத்தை திருத்து",
        note: "குறிப்பு: அங்கீகாரம் செயல்படுத்தப்பட்டவுடன் சுயவிவர திருத்தம் மற்றும் கணக்கு அமைப்புகள் கிடைக்கும். இது ஒரு டெமோ சுயவிவரம்."
      },
      schemeData: {
        "Post-Matric Scholarship for SC Students": "எஸ்சி மாணவர்களுக்கான போஸ்ட்-மெட்ரிக் கல்வி உதவித்தொகை",
        "Ministry of Social Justice": "சமூக நீதி அமைச்சகம்",
        "Up to ₹50,000 per year for tuition and maintenance": "பயிற்சி மற்றும் பராமரிப்புக்கு ஆண்டுக்கு ₹50,000 வரை",
        "Ayushman Bharat PM-JAY": "ஆயுஷ்மான் பாரத் பிஎம்-ஜெய்",
        "National Health Authority": "தேசிய சுகாதார ஆணையம்",
        "Health coverage up to ₹5 lakh per family per year": "குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வரை சுகாதார பாதுகாப்பு",
        "PM-KISAN Samman Nidhi": "பிஎம்-கிசான் சம்மான் நிதி",
        "Ministry of Agriculture": "வேளாண்மை அமைச்சகம்",
        "₹6,000 per year in three installments for farmers": "விவசாயிகளுக்கு மூன்று தவணைகளில் ஆண்டுக்கு ₹6,000",
        "Age matches (21)": "வயது பொருந்துகிறது (21)",
        "Location matches (Maharashtra)": "பகுதி பொருந்துகிறது (மகாராஷ்டிரா)",
        "Occupation matches (Student)": "தொழில் பொருந்துகிறது (மாணவர்)",
        "Income verification required": "வருமான சரிபார்ப்பு தேவை",
        "Income bracket matches": "வருமான வரம்பு பொருந்துகிறது",
        "Family category eligible": "குடும்ப வகை தகுதியானது",
        "Aadhaar verification required": "ஆதார் சரிபார்ப்பு தேவை",
        "Occupation matches (Farmer)": "தொழில் பொருந்துகிறது (விவசாயி)",
        "Land records verification required": "நில ஆவணங்கள் சரிபார்ப்பு தேவை",
        ...tamSchemeDataExtra
      },
      common: {
        citizenAccount: "குடிமகன் கணக்கு",
        adminDashboard: "நிர்வாகி டாஷ்போர்டு",
        logout: "வெளியேறு",
        language: "மொழி",
        changeLanguage: "மொழியை மாற்று"
      },
      scheme: {
        match: "பொருத்தம்",
        govVerified: "அரசு சரிபார்க்கப்பட்டது",
        ngoVerified: "தொண்டு நிறுவனம் சரிபார்க்கப்பட்டது",
        csrVerified: "CSR சரிபார்க்கப்பட்டது",
        sourceVerified: "ஆதாரம் சரிபார்க்கப்பட்டது",
        whyMatches: "இது உங்களுக்கு ஏன் பொருந்துகிறது",
        apply: "இப்போது விண்ணப்பிக்கவும்",
        viewDetails: "விவரங்களை காண்க",
        deadline: "கடைசி தேதி",
        potentiallyEligible: "சாத்தியமான தகுதி",
        checkEligibility: "என் தகுதியைச் சரிபார்க்கவும்",
        overview: "கண்ணோட்டம்",
        summary: "சுருக்கம்",
        yourMatch: "உங்கள் பொருத்தம்"
      },
      eligibility: {
        assessment: "தகுதி மதிப்பீடு",
        title: "இந்தத் திட்டம் உங்களுக்கு ஏன் பொருந்துகிறது",
        subtitle: "இந்த விளக்கம் உங்கள் தற்போதைய சுயவிவரம் மற்றும் நேரடி தகுதி தரவை அடிப்படையாகக் கொண்டது.",
        profileMatches: "இந்தப் பரிந்துரைக்கான இடம் மற்றும் தகுதி பதிவுகளுடன் உங்கள் சுயவிவரம் பொருந்துகிறது. அதிகாரப்பூர்வ ஆவண சரிபார்ப்புக்கு உட்பட்டு நீங்கள் தகுதியுடையவராக இருக்கலாம்.",
        profileMatchesTitle: "உங்கள் சுயவிவரம் எவ்வாறு பொருந்துகிறது",
        prepareTitle: "நீங்கள் தயார் செய்ய வேண்டியது",
        prepareText: "உங்கள் அடையாளம், வசிப்பிடம், வருமானம் மற்றும் வகை ஆவணங்களைத் தயார் வைத்திருங்கள். உங்கள் விண்ணப்பத்தைச் சரிபார்த்த பிறகு {{provider}} இறுதி முடிவை எடுக்கும்.",
        location: "இடம்",
        locationValue: "{{state}} குடியிருப்பாளர்களுக்கு கிடைக்கும்.",
        locationMissing: "உங்கள் மாநிலம் சரிபார்க்கப்பட வேண்டும்.",
        age: "வயது",
        ageValue: "உங்கள் சுயவிவரத்தில் வயது {{age}} எனக் குறிப்பிடப்பட்டுள்ளது.",
        ageMissing: "இந்த மதிப்பீட்டை மேம்படுத்த உங்கள் வயதைச் சேர்க்கவும்.",
        socialCategory: "சமூக வகை",
        categoryValue: "{{category}}.",
        categoryAccepts: "இந்தத் திட்டம் ஏற்றுக்கொள்வது: {{categories}}.",
        income: "வருமானம்",
        incomeValue: "உங்கள் பதிவு செய்யப்பட்ட ஆண்டு வருமானம் ₹{{income}}.",
        incomeMissing: "மிகவும் துல்லியமான மதிப்பீட்டிற்கு உங்கள் ஆண்டு வருமானத்தைச் சேர்க்கவும்.",
        matched: "உங்கள் சுயவிவரத்துடன் பொருந்துகிறது",
        pending: "சரிபார்ப்பு தேவை",
        back: "திட்ட விவரங்களுக்குத் திரும்பு",
        continue: "விண்ணப்பத்தைத் தொடரவும்",
        loading: "தகுதி விவரங்கள் ஏற்றப்படுகின்றன...",
        unavailable: "இந்தத் திட்டம் உங்கள் தற்போதைய சுயவிவரத்திற்கு பரிந்துரைக்கப்படவில்லை."
      }
    }
  }
};

// ── Marathi ─────────────────────────────────────────────────────────────────
const marTranslation = {
  ...marExtra,
  menu: { home: 'मुख्यपृष्ठ', dashboard: 'डॅशबोर्ड', mySchemes: 'माझ्या योजना', findSchemes: 'योजना शोधा', myApplications: 'माझे अर्ज', myBenefits: 'माझे लाभ', documents: 'कागदपत्रे', aiAssistant: 'AI सहाय्यक', whatIf: 'व्हाट-इफ सिम्युलेटर', compareSchemes: 'योजना तुलना', feedback: 'अभिप्राय', profile: 'प्रोफाइल' },
  common: { citizenAccount: 'नागरिक खाते', adminDashboard: 'प्रशासक डॅशबोर्ड', logout: 'लॉग आउट', language: 'भाषा', changeLanguage: 'भाषा बदला' },
  dashboard: { greeting: { morning: 'सुप्रभात!', afternoon: 'शुभ दुपार!', evening: 'शुभ संध्याकाळ!' }, welcomeBack: 'परत स्वागत आहे', recommendedSchemes: 'शिफारस केलेल्या योजना', activeApplications: 'सक्रिय अर्ज', benefitsReceived: 'प्राप्त लाभ', documents: 'कागदपत्रे', viewAll: 'सर्व पहा' },
};

// ── Telugu ───────────────────────────────────────────────────────────────────
const telTranslation = {
  menu: { home: 'హోమ్', dashboard: 'డాష్‌బోర్డ్', mySchemes: 'నా పథకాలు', findSchemes: 'పథకాలు వెతకండి', myApplications: 'నా దరఖాస్తులు', myBenefits: 'నా ప్రయోజనాలు', documents: 'పత్రాలు', aiAssistant: 'AI సహాయకుడు', whatIf: 'వాట్-ఇఫ్ సిమ్యులేటర్', compareSchemes: 'పథకాలు పోల్చండి', feedback: 'అభిప్రాయం', profile: 'ప్రొఫైల్' },
  common: { citizenAccount: 'పౌర ఖాతా', adminDashboard: 'అడ్మిన్ డాష్‌బోర్డ్', logout: 'లాగ్ అవుట్', language: 'భాష', changeLanguage: 'భాష మార్చండి' },
  authWelcome: 'తిరిగి స్వాగతం', authLoginSub: 'మీ WelfareAI ఖాతాలో సైన్ ఇన్ చేయండి',
  emailAddress: 'ఇమెయిల్ చిరునామా', mobileNumber: 'మొబైల్ నంబర్', password: 'పాస్‌వర్డ్',
  enterPassword: 'పాస్‌వర్డ్ నమోదు చేయండి', rememberMe: 'నన్ను గుర్తుంచుకో',
  login: 'సైన్ ఇన్', loggingIn: 'సైన్ ఇన్ అవుతోంది…', noAccount: 'ఖాతా లేదా?', signUp: 'నమోదు చేయండి',
  uploadDocument: 'పత్రం అప్‌లోడ్ చేయండి', documentVaultTitle: 'పత్ర వాల్ట్',
  documentVaultSubtitle: 'మీ పత్రాలను సురక్షితంగా నిర్వహించండి',
  allDocuments: 'అన్ని పత్రాలు', noDocuments: 'పత్రాలు లేవు',
  uploadFirstDoc: 'ప్రారంభించడానికి మీ మొదటి పత్రాన్ని అప్‌లోడ్ చేయండి.',
  aiExtracted: 'AI-సేకరించిన సమాచారం', extractData: 'డేటా సేకరించు',
  extracting: 'సేకరిస్తోంది…', extracted: 'సేకరించబడింది',
  dataExtracted: 'సమాచారం సేకరించబడింది', dataExtractedSuccess: 'పత్రం నుండి ప్రొఫైల్ అప్‌డేట్!',
  extractedNote: 'స్వయంచాలకంగా సేకరించబడింది. వినియోగానికి ముందు ధృవీకరించండి.',
  years: 'సం||', age: 'వయసు', dateOfBirth: 'పుట్టిన తేదీ',
  aadhaarNumber: 'ఆధార్ నం', panNumber: 'PAN నం', annualIncome: 'వార్షిక ఆదాయం',
  socialCategory: 'సామాజిక వర్గం', address: 'చిరునామా', state: 'రాష్ట్రం',
  docProfileTitle: 'పత్రాల నుండి సేకరించిన ప్రొఫైల్', docProfileSub: 'అప్‌లోడ్ చేసిన పత్రాల నుండి స్వయంచాలకంగా నింపబడింది',
  profileAutoUpdated: 'మీ అర్హత ప్రొఫైల్ స్వయంచాలకంగా అప్‌డేట్ చేయబడింది.',
  aiData: 'AI సమాచారం', upload: 'అప్‌లోడ్', cancel: 'రద్దు', save: 'సేవ్', close: 'మూసివేయి',
  view: 'చూడు', download: 'డౌన్‌లోడ్', replace: 'భర్తీ చేయి', delete: 'తొలగించు',
  identity: 'గుర్తింపు', income: 'ఆదాయం', education: 'విద్య', residence: 'నివాసం', casteCategory: 'కులం / వర్గం', other: 'ఇతర',
  loginToUpload: 'మీ పత్రాలను యాక్సెస్ చేయడానికి లాగిన్ చేయండి',
  loginToUploadDesc: 'మీ ప్రభుత్వ పత్రాలను సురక్షితంగా అప్‌లోడ్ చేయడానికి సైನ್ ఇన్ చేయండి.',
  uploadDate: 'అప్‌లోడ్ తేదీ', expires: 'గడువు ముగుస్తుంది',
  aiExtractionNote: 'AI మీ పత్రం నుండి వయసు, ఆదాయం, వర్గం వివరాలను స్వయంచాలకంగా సేకరిస్తుంది.',
  documentNameRequired: 'పత్రం పేరు అవసరం.',
  fileRequired: 'అప్‌లోడ్ చేయడానికి ఒక ఫైల్ ఎంచుకోండి.',
  optionalIfUnchanged: 'మార్పు లేకపోతే ఐచ్ఛికం',
  documentFile: 'పత్రం ఫైల్',
  optional: 'ఐచ్ఛికం',
  refresh: 'రిఫ్రెష్',
  documentPlaceholder: 'ఉదా. ఆధార్ కార్డ్',
  uploadSuccess: 'పత్రం అప్‌లోడ్! వివరాలు స్వయంచాలకంగా సేకరించబడ్డాయి.',
  updateSuccess: 'పత్రం అప్‌డేట్ చేయబడింది!',
  deleteSuccess: 'పత్రం తొలగించబడింది!',
  uploadFailed: 'అప్‌లోడ్ విఫలం. మళ్ళీ ప్రయత్నించండి.',
  latestVersion: 'తాజా',
  documentMetadata: 'పత్రం సమాచారం',
  originalFile: 'ఫైల్',
  moreOptions: 'ఇంకా ఎంపికలు',
  noExpiry: 'గడువు తేదీ లేదు',
  dragDrop: 'డ్రాగ్ చేసి వదలండి లేదా క్లిక్ చేసి బ్రౌజ్ చేయండి',
  fileLimitNote: 'PDF, JPG, PNG గరిష్టం 10MB',
  invalidFileType: 'అమాన్య ఫైల్ రకం.',
  fileTooLarge: 'ఫైల్ పరిమాణం 10MB మించింది.',
  documentName: 'పత్రం పేరు',
  documentCategory: 'పత్రం వర్గం',
  confirmDeleteTitle: 'పత్రం తొలగించు',
  confirmDeleteMsg: 'ఈ పత్రాన్ని నిజంగా తొలగించాలనుకుంటున్నారా?',
  previewTitle: 'పత్రం ప్రివ్యూ'
};

// ── Bengali ──────────────────────────────────────────────────────────────────
const benTranslation = {
  menu: { home: 'হোম', dashboard: 'ড্যাশবোর্ড', mySchemes: 'আমার প্রকল্প', findSchemes: 'প্রকল্প খুঁজুন', myApplications: 'আমার আবেদন', myBenefits: 'আমার সুবিধা', documents: 'নথিপত্র', aiAssistant: 'AI সহায়ক', whatIf: 'হোয়াট-ইফ সিমুলেটর', compareSchemes: 'প্রকল্প তুলনা', feedback: 'মতামত', profile: 'প্রোফাইল' },
  common: { citizenAccount: 'নাগরিক অ্যাকাউন্ট', adminDashboard: 'অ্যাডমিন ড্যাশবোর্ড', logout: 'লগ আউট', language: 'ভাষা', changeLanguage: 'ভাষা পরিবর্তন' },
  authWelcome: 'ফিরে আসতে স্বাগতম', authLoginSub: 'আপনার WelfareAI অ্যাকাউন্টে সাইন ইন করুন',
  emailAddress: 'ইমেইল ঠিকানা', mobileNumber: 'মোবাইল নম্বর', password: 'পাসওয়ার্ড',
  enterPassword: 'পাসওয়ার্ড লিখুন', rememberMe: 'আমাকে মনে রাখুন',
  login: 'সাইন ইন', loggingIn: 'সাইন ইন হচ্ছে…', noAccount: 'অ্যাকাউন্ট নেই?', signUp: 'নিবন্ধন করুন',
  uploadDocument: 'নথি আপলোড করুন', documentVaultTitle: 'নথি ভল্ট',
  documentVaultSubtitle: 'আপনার নথিপত্র এক জায়গায় নিরাপদে পরিচালনা করুন',
  allDocuments: 'সব নথি', noDocuments: 'কোনো নথি নেই',
  uploadFirstDoc: 'শুরু করতে আপনার প্রথম নথি আপলোড করুন।',
  aiExtracted: 'AI-নিষ্কাশিত তথ্য', extractData: 'ডেটা নিষ্কাশন',
  extracting: 'নিষ্কাশন হচ্ছে…', extracted: 'নিষ্কাশিত',
  dataExtracted: 'তথ্য নিষ্কাশিত', dataExtractedSuccess: 'নথি থেকে প্রোফাইল আপডেট!',
  extractedNote: 'স্বয়ংক্রিয়ভাবে নিষ্কাশিত। ব্যবহারের আগে যাচাই করুন।',
  years: 'বছর', age: 'বয়স', dateOfBirth: 'জন্ম তারিখ',
  aadhaarNumber: 'আধার নং', panNumber: 'PAN নং', annualIncome: 'বার্ষিক আয়',
  socialCategory: 'সামাজিক বিভাগ', address: 'ঠিকানা', state: 'রাজ্য',
  docProfileTitle: 'নথি থেকে নিষ্কাশিত প্রোফাইল', docProfileSub: 'আপলোড করা নথি থেকে স্বয়ংক্রিয়ভাবে পূরণ',
  profileAutoUpdated: 'আপনার যোগ্যতা প্রোফাইল স্বয়ংক্রিয়ভাবে আপডেট হয়েছে।',
  aiData: 'AI তথ্য', upload: 'আপলোড', cancel: 'বাতিল', save: 'সংরক্ষণ', close: 'বন্ধ',
  view: 'দেখুন', download: 'ডাউনলোড', replace: 'প্রতিস্থাপন', delete: 'মুছুন',
  identity: 'পরিচয়', income: 'আয়', education: 'শিক্ষা', residence: 'বাসস্থান', casteCategory: 'জাতি / বিভাগ', other: 'অন্যান্য',
  loginToUpload: 'আপনার নথি অ্যাক্সেস করতে লগইন করুন',
  loginToUploadDesc: 'আপনার সরকারী নথি নিরাপদে আপলোড করতে সাইন ইন করুন।',
  uploadDate: 'আপলোড তারিখ', expires: 'মেয়াদ শেষ',
  aiExtractionNote: 'AI আপনার নথি থেকে বয়স, আয়, বিভাগ তথ্য স্বয়ংক্রিয়ভাবে নিষ্কাশন করবে।',
  documentNameRequired: 'নথির নাম আবশ্যক।',
  fileRequired: 'আপলোড করতে দয়া করে একটি ফাইল নির্বাচন করুন।',
  optionalIfUnchanged: 'অপরিবর্তিত হলে ঐচ্ছিক',
  documentFile: 'নথি ফাইল',
  optional: 'ঐচ্ছিক',
  refresh: 'রিফ্রেশ',
  documentPlaceholder: 'যেমন: আধার কার্ড',
  uploadSuccess: 'নথি আপলোড! বিবরণ স্বয়ংক্রিয়ভাবে নিষ্কাশিত।',
  updateSuccess: 'নথি আপডেট করা হয়েছে!',
  deleteSuccess: 'নথি মুছে ফেলা হয়েছে!',
  uploadFailed: 'আপলোড ব্যর্থ। আবার চেষ্টা করুন।',
  latestVersion: 'সর্বশেষ',
  documentMetadata: 'নথি তথ্য',
  originalFile: 'ফাইল',
  moreOptions: 'আরো বিকল্প',
  noExpiry: 'মেয়াদ নেই',
  dragDrop: 'টেনে নামিয়ে দিন বা ক্লিক করুন',
  fileLimitNote: 'PDF, JPG, PNG সর্বোচ্চ 10MB',
  invalidFileType: 'অবৈধ ফাইল ফরম্যাট।',
  fileTooLarge: 'ফাইল 10MB-এর বেশি।',
  documentName: 'নথির নাম',
  documentCategory: 'নথির বিভাগ',
  confirmDeleteTitle: 'নথি মুছুন',
  confirmDeleteMsg: 'আপনি কি সত্যিই এই নথিটি মুছতে চান?',
  previewTitle: 'নথি প্রিভিউ'
};

// ── Gujarati ─────────────────────────────────────────────────────────────────
const gujTranslation = {
  common: { citizenAccount: 'નાગрика ખातу', adminDashboard: 'Admin', logout: 'Logout', language: 'ભাша', changeLanguage: 'ભаша ब对 bदलو' },
  authWelcome: 'પાছા stawागт', authLoginSub: 'WelfareAI account मां sign in करो',
  emailAddress: 'ઈmail पता', mobileNumber: 'Mobile number', password: 'Password',
  enterPassword: 'Password nakho', rememberMe: 'Mane yaad nakho',
  login: 'Login', loggingIn: 'Login thay che…', noAccount: 'Account नथी?', signUp: 'नोंdhणी करो',
  uploadDocument: 'Document अपलोड करो', documentVaultTitle: 'Document Vault',
  documentVaultSubtitle: 'तमारा documents एक जगे सुरक्षित रीते manage करो',
  allDocuments: 'बधा Documents', noDocuments: 'कोई Document नथी',
  uploadFirstDoc: 'शरू करवा पेहलु document अपलोड करो.',
  aiExtracted: 'AI-extracted Info', extractData: 'Data extract करो',
  extracting: 'Extract थाय छे…', extracted: 'Extract थयु',
  dataExtracted: 'Info Extract थई', dataExtractedSuccess: 'Document माथी Profile auto-update!',
  extractedNote: 'Auto-extracted. वापर पेहला verify करो.',
  years: 'वर्ष', age: 'उमर', dateOfBirth: 'जन्म तारीख',
  aadhaarNumber: 'Aadhaar नं', panNumber: 'PAN नं', annualIncome: 'वार्षिक आवक',
  socialCategory: 'सामाजिक वर्ग', address: 'सरनामु', state: 'राज्य',
  docProfileTitle: 'Documents माथी Profile', docProfileSub: 'Documents माथी auto-filled',
  profileAutoUpdated: 'तमारी eligibility profile auto-update थई छे.',
  aiData: 'AI Info', upload: 'Upload', cancel: 'Cancel', save: 'Save', close: 'बंद करो',
  view: 'जुओ', download: 'Download', replace: 'बदलो', delete: 'हटावो',
  identity: 'ओळख', income: 'आवक', education: 'शिक्षण', residence: 'रेहठाण', casteCategory: 'जात / वर्ग', other: 'अन्य',
  loginToUpload: 'Documents जोवा Login करो', loginToUploadDesc: 'सरकारी Documents upload करवा Sign in करो.',
  uploadDate: 'Upload Date', expires: 'Expiry',
};

// ── Kannada ──────────────────────────────────────────────────────────────────
const kanTranslation = {
  menu: { home: 'ಮನೆ', dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', mySchemes: 'ನನ್ನ ಯೋಜನೆಗಳು', findSchemes: 'ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ', myApplications: 'ನನ್ನ ಅರ್ಜಿಗಳು', myBenefits: 'ನನ್ನ ಪ್ರಯೋಜನಗಳು', documents: 'ದಾಖಲೆಗಳು', aiAssistant: 'AI ಸಹಾಯಕ', whatIf: 'ವಾಟ್-ಇಫ್ ಸಿಮ್ಯುಲೇಟರ್', compareSchemes: 'ಯೋಜನೆಗಳನ್ನು ಹೋಲಿಸಿ', feedback: 'ಪ್ರತಿಕ್ರಿಯೆ', profile: 'ಪ್ರೊಫೈಲ್' },
  common: { citizenAccount: 'ನಾಗರಿಕ ಖಾತೆ', adminDashboard: 'ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', logout: 'ಲಾಗ್ ಔಟ್', language: 'ಭಾಷೆ', changeLanguage: 'ಭಾಷೆ ಬದಲಿಸಿ' },
  authWelcome: 'ಮತ್ತೆ ಸ್ವಾಗತ', authLoginSub: 'ನಿಮ್ಮ WelfareAI ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
  emailAddress: 'ಇಮೇಲ್ ವಿಳಾಸ', mobileNumber: 'ಮೊಬೈಲ್ ನಂಬರ್', password: 'ಪಾಸ್‌ವರ್ಡ್',
  enterPassword: 'ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ', rememberMe: 'ನನ್ನನ್ನು ನೆನಪಿಡಿ',
  login: 'ಸೈನ್ ಇನ್', loggingIn: 'ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ…', noAccount: 'ಖಾತೆ ಇಲ್ಲವೇ?', signUp: 'ನೋಂದಾಯಿಸಿ',
  uploadDocument: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', documentVaultTitle: 'ದಾಖಲೆ ವಾಲ್ಟ್',
  documentVaultSubtitle: 'ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ನಿರ್ವಹಿಸಿ',
  allDocuments: 'ಎಲ್ಲ ದಾಖಲೆಗಳು', noDocuments: 'ದಾಖಲೆಗಳಿಲ್ಲ',
  uploadFirstDoc: 'ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಮೊದಲ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
  aiExtracted: 'AI-ಹೊರತೆಗೆದ ಮಾಹಿತಿ', extractData: 'ಡೇಟಾ ಹೊರತೆಗೆಯಿರಿ',
  extracting: 'ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ…', extracted: 'ಹೊರತೆಗೆಯಲಾಗಿದೆ',
  dataExtracted: 'ಮಾಹಿತಿ ಹೊರತೆಗೆಯಲಾಗಿದೆ', dataExtractedSuccess: 'ದಾಖಲೆಯಿಂದ ಪ್ರೊಫೈಲ್ ಅಪ್‌ಡೇಟ್!',
  extractedNote: 'ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹೊರತೆಗೆಯಲಾಗಿದೆ. ಬಳಕೆಗೆ ಮೊದಲು ಪರಿಶೀಲಿಸಿ.',
  years: 'ವರ್ಷ', age: 'ವಯಸ್ಸು', dateOfBirth: 'ಹುಟ್ಟಿದ ದಿನ',
  aadhaarNumber: 'ಆಧಾರ್ ನಂ', panNumber: 'PAN ನಂ', annualIncome: 'ವಾರ್ಷಿಕ ಆದಾಯ',
  socialCategory: 'ಸಾಮಾಜಿಕ ವರ್ಗ', address: 'ವಿಳಾಸ', state: 'ರಾಜ್ಯ',
  docProfileTitle: 'ದಾಖಲೆಗಳಿಂದ ಪ್ರೊಫೈಲ್', docProfileSub: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಗಳಿಂದ ಸ್ವಯಂಚಾಲಿತ',
  profileAutoUpdated: 'ನಿಮ್ಮ ಅರ್ಹತೆ ಪ್ರೊಫೈಲ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅಪ್‌ಡೇಟ್ ಆಗಿದೆ.',
  aiData: 'AI ಮಾಹಿತಿ', upload: 'ಅಪ್‌ಲೋಡ್', cancel: 'ರದ್ದುಗೊಳಿಸಿ', save: 'ಉಳಿಸಿ', close: 'ಮುಚ್ಚಿ',
  view: 'ವೀಕ್ಷಿಸಿ', download: 'ಡೌನ್‌ಲೋಡ್', replace: 'ಬದಲಾಯಿಸಿ', delete: 'ಅಳಿಸಿ',
  identity: 'ಗುರುತು', income: 'ಆದಾಯ', education: 'ಶಿಕ್ಷಣ', residence: 'ನಿವಾಸ', casteCategory: 'ಜಾತಿ / ವರ್ಗ', other: 'ಇತರ',
  loginToUpload: 'ದಾಖಲೆಗಳನ್ನು ಪ್ರವೇಶಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ', loginToUploadDesc: 'ಸರ್ಕಾರಿ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಸೈನ್ ಇನ್ ಮಾಡಿ.',
  uploadDate: 'ಅಪ್‌ಲೋಡ್ ದಿನಾಂಕ', expires: 'ಅವಧಿ ಮುಗಿಯುತ್ತದೆ',
};

// Register new language translations into the shared resources object
resources['मराठी'] = { translation: marTranslation };
resources['తెలుగు'] = { translation: telTranslation };
resources['বাংলা']  = { translation: benTranslation };
resources['ગુજરાતી'] = { translation: gujTranslation };
resources['ಕನ್ನಡ'] = { translation: kanTranslation };

const supportedLanguages = ['English', 'हिंदी', 'தமிழ்'];
const requestedLanguage = typeof window !== 'undefined' ? (localStorage.getItem('userLanguage') || localStorage.getItem('i18nextLng') || 'English') : 'English';
const savedLanguage = supportedLanguages.includes(requestedLanguage) ? requestedLanguage : 'English';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, 
    fallbackLng: "English",
    interpolation: {
      escapeValue: false 
    }
  });

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined' && lng) {
    localStorage.setItem('userLanguage', lng);
    localStorage.setItem('i18nextLng', lng);
  }
});

export default i18n;
