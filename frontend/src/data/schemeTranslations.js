const schemeTranslations = {
  English: {
    'pm-scholarship': { name: 'Post-Matric Scholarship for SC Students', provider: 'Ministry of Social Justice', benefit: 'Up to ₹50,000 per year for tuition and maintenance', description: 'Financial support for higher education of students from Scheduled Caste communities.' },
    'ayushman-bharat': { name: 'Ayushman Bharat PM-JAY', provider: 'National Health Authority', benefit: 'Health coverage up to ₹5 lakh per family per year', description: 'Free health insurance coverage for eligible families at empaneled hospitals nationwide.' },
    'pm-kisan': { name: 'PM-KISAN Samman Nidhi', provider: 'Ministry of Agriculture', benefit: '₹6,000 per year in three installments for farmers', description: 'Direct income support for small and marginal farmers to supplement financial needs.' },
    'tata-skills': { name: 'TATA Skills Development Program', provider: 'TATA Trusts', benefit: 'Free skill training with stipend up to ₹8,000/month', description: 'CSR-funded skill development program offering vocational training and job placement support.' },
    'pmay-housing': { name: 'Pradhan Mantri Awas Yojana (Urban)', provider: 'Ministry of Housing and Urban Affairs', benefit: 'Subsidized home loan up to ₹2.67 lakh interest subsidy', description: 'Interest subsidy on home loans for economically weaker and low-income groups to own a house.' },
    'mgnrega': { name: 'MGNREGA Employment Guarantee', provider: 'Ministry of Rural Development', benefit: '100 days of guaranteed wage employment per year', description: 'Legal guarantee of 100 days of wage employment per year to rural households.' },
    'atal-pension-yojana': { name: 'Atal Pension Yojana', provider: 'PFRDA', benefit: 'Guaranteed minimum pension of ₹1,000 to ₹5,000 per month', description: 'Pension scheme for workers in the unorganized sector.' },
    'mudra-loan': { name: 'Mudra Loan', provider: 'Ministry of Finance', benefit: 'Loans up to ₹10 lakh for small and micro enterprises', description: 'Financial support for small businesses.' },
    'stand-up-india': { name: 'Stand Up India', provider: 'Department of Financial Services', benefit: 'Bank loans between ₹10 lakh and ₹1 Crore', description: 'Facilitates bank loans for SC, ST, and women entrepreneurs.' },
  },
  'हिंदी': {
    'pm-scholarship': {
      name: 'एससी छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति',
      provider: 'सामाजिक न्याय मंत्रालय',
      benefit: 'ट्यूशन और रखरखाव के लिए प्रति वर्ष ₹50,000 तक',
      description: 'अनुसूचित जाति समुदाय के छात्रों की उच्च शिक्षा के लिए वित्तीय सहायता।',
      eligibility: 'आयु 18-25 वर्ष, वार्षिक आय ₹1 लाख से कम',
      applicationProcess: 'ऑनलाइन आवेदन करें, दस्तावेज़ अपलोड करें, सत्यापन की प्रतीक्षा करें',
      documentsRequired: ['आधार कार्ड', 'आय प्रमाण पत्र', 'शैक्षणिक प्रमाण पत्र']
    },
    'ayushman-bharat': {
      name: 'आयुष्मान भारत पीएम-जय',
      provider: 'राष्ट्रीय स्वास्थ्य प्राधिकरण',
      benefit: 'परिवार प्रति वर्ष ₹5 लाख तक स्वास्थ्य कवरेज',
      description: 'देश भर के सूचीबद्ध अस्पतालों में पात्र परिवारों के लिए मुफ्त स्वास्थ्य बीमा।',
      eligibility: 'आयु 0-60 वर्ष, आय सीमा नहीं',
      applicationProcess: 'नजदीकी पोर्टल पर पंजीकरण, कार्ड प्राप्ति',
      documentsRequired: ['आधार कार्ड', 'परिवार कार्ड']
    },
    'pm-kisan': {
      name: 'पीएम-किसान सम्मान निधि',
      provider: 'कृषि मंत्रालय',
      benefit: 'किसानों के लिए तीन किस्तों में प्रति वर्ष ₹6,000',
      description: 'छोटे और सीमांत किसानों के लिए प्रत्यक्ष आय सहायता।',
      eligibility: 'किसान होना आवश्यक, आय सीमा नहीं',
      applicationProcess: 'ऑनलाइन पोर्टल पर आवेदन, बैंक खाते से सीधे ट्रांसफर',
      documentsRequired: ['आधार कार्ड', 'खेत की विवरणी']
    },
    'tata-skills': {
      name: 'टाटा कौशल विकास कार्यक्रम',
      provider: 'टाटा ट्रस्ट',
      benefit: '₹8,000 प्रति माह तक वजीफे के साथ मुफ्त कौशल प्रशिक्षण',
      description: 'व्यावसायिक प्रशिक्षण और रोजगार सहायता वाला कौशल विकास कार्यक्रम।',
      eligibility: 'उम्र 18-35, न्यूनतम शैक्षणिक योग्यता 10वीं पास',
      applicationProcess: 'ऑनलाइन पंजीकरण, चयन प्रक्रिया, प्रशिक्षण शुरू',
      documentsRequired: ['आधार कार्ड', 'शैक्षणिक प्रमाण पत्र']
    },
    'pmay-housing': {
      name: 'प्रधानमंत्री आवास योजना (शहरी)',
      provider: 'आवास और शहरी कार्य मंत्रालय',
      benefit: '₹2.67 लाख तक ब्याज सब्सिडी वाला गृह ऋण',
      description: 'कम आय वाले परिवारों को घर खरीदने के लिए गृह ऋण पर ब्याज सब्सिडी।',
      eligibility: 'आयु 18-60, वार्षिक आय ₹6 लाख तक',
      applicationProcess: 'ऑनलाइन आवेदन, दस्तावेज़ अपलोड, स्वीकृति',
      documentsRequired: ['आधार कार्ड', 'आय प्रमाण पत्र', 'भू-स्वामित्व प्रमाण']
    },
    'mgnrega': {
      name: 'मनरेगा रोजगार गारंटी',
      provider: 'ग्रामीण विकास मंत्रालय',
      benefit: 'प्रति वर्ष 100 दिनों के वेतन रोजगार की गारंटी',
      description: 'ग्रामीण परिवारों को प्रति वर्ष 100 दिनों के रोजगार की कानूनी गारंटी।',
      eligibility: 'ग्रामीण निवासी, आयु 18-55',
      applicationProcess: 'स्थानीय पैनल में पंजीकरण, कार्य आवंटन',
      documentsRequired: ['आधार कार्ड', 'पता प्रमाण']
    },
    'atal-pension-yojana': {
      name: 'अटल पेंशन योजना',
      provider: 'पीएफआरडीए',
      benefit: '₹1,000 से ₹5,000 प्रति माह की न्यूनतम पेंशन',
      description: 'असंगठित क्षेत्र के कामगारों के लिए पेंशन योजना।',
      eligibility: 'आयु 18-40, वार्षिक आय ₹3 लाख तक',
      applicationProcess: 'बैंक में पंजीकरण, मासिक योगदान',
      documentsRequired: ['आधार कार्ड', 'आय प्रमाण पत्र']
    },
    'mudra-loan': {
      name: 'मुद्रा ऋण',
      provider: 'वित्त मंत्रालय',
      benefit: 'छोटे और सूक्ष्म उद्यमों के लिए ₹10 लाख तक ऋण',
      description: 'छोटे व्यवसायों के लिए वित्तीय सहायता।',
      eligibility: 'व्यवसाय पंजीकरण, आयु 21-60',
      applicationProcess: 'बैंक या वित्तीय संस्थान में आवेदन',
      documentsRequired: ['आधार कार्ड', 'व्यवसाय पंजीकरण प्रमाण', 'आय प्रमाण पत्र']
    },
    'stand-up-india': {
      name: 'स्टैंड अप इंडिया',
      provider: 'वित्तीय सेवा विभाग',
      benefit: '₹10 लाख से ₹1 करोड़ तक बैंक ऋण',
      description: 'एससी, एसटी और महिला उद्यमियों के लिए बैंक ऋण की सुविधा।',
      eligibility: 'एससी/एसटी/महिला, आयु 18-45, न्यूनतम प्रोजेक्ट लागत ₹10 लाख',
      applicationProcess: 'बैंक में आवेदन, प्रोजेक्ट प्रपोज़ल, स्वीकृति',
      documentsRequired: ['आधार कार्ड', 'पैन कार्ड', 'प्रोजेक्ट योजना']
    }
  },
  'தமிழ்': {
    'pm-scholarship': { name: 'எஸ்சி மாணவர்களுக்கான போஸ்ட்-மெட்ரிக் உதவித்தொகை', provider: 'சமூக நீதி அமைச்சகம்', benefit: 'பயிற்சி மற்றும் பராமரிப்புக்கு ஆண்டுக்கு ₹50,000 வரை', description: 'பட்டியல் சாதி மாணவர்களின் உயர்கல்விக்கான நிதி உதவி.' },
    'ayushman-bharat': { name: 'ஆயுஷ்மான் பாரத் பிஎம்-ஜெய்', provider: 'தேசிய சுகாதார ஆணையம்', benefit: 'குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வரை சுகாதார பாதுகாப்பு', description: 'நாடு முழுவதும் உள்ள அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் தகுதியான குடும்பங்களுக்கு இலவச காப்பீடு.' },
    'pm-kisan': { name: 'பிஎம்-கிசான் சம்மான் நிதி', provider: 'வேளாண்மை அமைச்சகம்', benefit: 'விவசாயிகளுக்கு மூன்று தவணைகளில் ஆண்டுக்கு ₹6,000', description: 'சிறு மற்றும் குறு விவசாயிகளுக்கான நேரடி வருமான உதவி.' },
    'tata-skills': { name: 'டாடா திறன் மேம்பாட்டு திட்டம்', provider: 'டாடா டிரஸ்ட்', benefit: 'மாதம் ₹8,000 வரை உதவித்தொகையுடன் இலவச திறன் பயிற்சி', description: 'தொழில் பயிற்சி மற்றும் வேலைவாய்ப்பு உதவி வழங்கும் திறன் மேம்பாட்டு திட்டம்.' },
    'pmay-housing': { name: 'பிரதம மந்திரி ஆவாஸ் யோஜனா (நகர்ப்புறம்)', provider: 'வீட்டுவசதி மற்றும் நகர்ப்புற விவகார அமைச்சகம்', benefit: '₹2.67 லட்சம் வரை வட்டி மானியத்துடன் வீட்டு கடன்', description: 'குறைந்த வருமான குடும்பங்கள் வீடு வாங்க வீட்டு கடன் வட்டி மானியம்.' },
    'mgnrega': { name: 'மகாத்மா காந்தி தேசிய ஊரக வேலைவாய்ப்பு உத்தரவாதம்', provider: 'ஊரக வளர்ச்சி அமைச்சகம்', benefit: 'ஆண்டுக்கு 100 நாட்கள் ஊதிய வேலை உத்தரவாதம்', description: 'ஊரக குடும்பங்களுக்கு ஆண்டுக்கு 100 நாட்கள் வேலை வழங்கும் சட்ட உத்தரவாதம்.' },
    'atal-pension-yojana': { name: 'அடல் ஓய்வூதியத் திட்டம்', provider: 'பிஎஃப்ஆர்டிஏ', benefit: 'மாதம் ₹1,000 முதல் ₹5,000 வரை குறைந்தபட்ச ஓய்வூதியம்', description: 'அமைப்புசாரா துறை தொழிலாளர்களுக்கான ஓய்வூதியத் திட்டம்.' },
    'mudra-loan': { name: 'முத்ரா கடன்', provider: 'நிதி அமைச்சகம்', benefit: 'சிறு மற்றும் குறு நிறுவனங்களுக்கு ₹10 லட்சம் வரை கடன்', description: 'சிறு வணிகங்களுக்கான நிதி உதவி.' },
    'stand-up-india': { name: 'ஸ்டாண்ட் அப் இந்தியா', provider: 'நிதி சேவைகள் துறை', benefit: '₹10 லட்சம் முதல் ₹1 கோடி வரை வங்கிக் கடன்', description: 'எஸ்சி, எஸ்டி மற்றும் பெண் தொழில்முனைவோருக்கான வங்கிக் கடன் வசதி.' },
  },
};

export function getSchemeTranslation(id, language, fallback = {}) {
  return schemeTranslations[language]?.[id] || schemeTranslations.English[id] || fallback;
}
