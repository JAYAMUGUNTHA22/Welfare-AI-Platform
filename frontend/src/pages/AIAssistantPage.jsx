import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Info, Bot, User, RefreshCw, HelpCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTranslation } from 'react-i18next';

const suggestedQuestionsMap = {
  en: [
    'Which schemes can I apply for?',
    'Am I eligible for this scheme?',
    'What documents do I need?',
    'Explain this scheme in Tamil.',
    'How do I apply for this scheme?',
  ],
  ta: [
    'நான் எந்தத் திட்டங்களுக்கு விண்ணப்பிக்கலாம்?',
    'இந்தத் திட்டத்திற்கு நான் தகுதியுடையவனா?',
    'எனக்கு என்ன ஆவணங்கள் தேவை?',
    'இந்தத் திட்டத்தை தமிழில் விளக்கவும்.',
    'இந்தத் திட்டத்திற்கு எவ்வாறு விண்ணப்பிப்பது?',
  ],
  hi: [
    'मैं किन योजनाओं के लिए आवेदन कर सकता हूं?',
    'क्या मैं इस योजना के लिए पात्र हूं?',
    'मुझे कौन से दस्तावेजों की आवश्यकता है?',
    'इस योजना को तमिल में समझाएं।',
    'मैं इस योजना के लिए आवेदन कैसे करूं?',
  ]
};

const demoResponsesMultilingual = {
  en: {
    apply: 'Based on your profile (Maharashtra, age 21, Student, income ₹1-2.5 lakh), you qualify for 4 top welfare schemes: 1. Post-Matric Scholarship (92% match), 2. Ayushman Bharat Health Insurance (88% match), 3. PM-KISAN (85% match), and 4. MGNREGA (81% match).',
    eligible: 'To determine your exact eligibility, WelfareAI compares your age, location, category, and income against official government rules. You can also run scenarios in our What-If Simulator!',
    documents: 'Key required documents include: (1) Aadhaar Card, (2) Income Certificate, (3) Caste/Category Certificate (if applicable), (4) Educational Marksheets, and (5) Bank Passbook copy. Upload these in your Document Vault for auto-verification.',
    tamil: 'இந்த திட்டங்கள் கல்வி, மருத்துவம் மற்றும் நிதி உதவிகளை வழங்குகின்றன. நீங்கள் போஸ்ட்-மெட்ரிக் கல்வி உதவித்தொகை மற்றும் ஆயுஷ்மான் பாரத் மருத்துவ காப்பீட்டிற்கு தகுதியுடையவர்.',
    howApply: 'You can apply directly through our platform! Select the scheme under "Explore Schemes", click "Apply Now", attach your uploaded documents from the Document Vault, and submit your application.',
    default: 'I am here to assist you with government scheme discovery, eligibility rules, document requirements, and application procedures. How can I guide you further?'
  },
  ta: {
    apply: 'உங்கள் சுயவிவரத்தின்படி, நீங்கள் 4 சிறந்த நலத்திட்டங்களுக்கு தகுதியுடையவர்: 1. போஸ்ட்-மெட்ரிக் கல்வி உதவித்தொகை (92% பொருத்தம்), 2. ஆயுஷ்மான் பாரத் காப்பீடு (88% பொருத்தம்), 3. பிஎம்-கிசான் (85% பொருத்தம்), மற்றும் 4. MGNREGA.',
    eligible: 'உங்கள் தகுதியைத் துல்லியமாகக் கண்டறிய, WelfareAI உங்கள் வயது, இருப்பிடம், பிரிவு மற்றும் வருமானத்தை சரிபார்க்கிறது. வாட்-இஃப் சிமுலேட்டரிலும் சோதிக்கலாம்!',
    documents: 'தேவையான முக்கிய ஆவணங்கள்: (1) ஆதார் அட்டை, (2) வருமானச் சான்றிதழ், (3) சாதிச் சான்றிதழ், (4) கல்விச் சான்றிதழ்கள், (5) வங்கிப் புத்தகம். ஆவணப் பெட்டகத்தில் (Document Vault) இவற்றை பதிவேற்றவும்.',
    tamil: 'இந்த திட்டங்கள் கல்வி, மருத்துவம் மற்றும் நிதி உதவிகளை வழங்குகின்றன. நீங்கள் போஸ்ட்-மெட்ரிக் கல்வி உதவித்தொகை மற்றும் ஆயுஷ்மான் பாரத் மருத்துவ காப்பீட்டிற்கு தகுதியுடையவர்.',
    howApply: 'எங்கள் தளம் மூலம் நேரடியாக விண்ணப்பிக்கலாம்! "Explore Schemes" சென்று, "Apply Now" கிளிக் செய்து, உங்கள் ஆவணங்களை இணைத்து சமர்ப்பிக்கவும்.',
    default: 'அரசுத் திட்டங்கள், தகுதி விதிகள் மற்றும் விண்ணப்பப் படிகள் குறித்து உங்களுக்கு உதவ நான் தயாராக உள்ளேன். வேறு என்ன கேட்க விரும்புகிறீர்கள்?'
  },
  hi: {
    apply: 'आपकी प्रोफ़ाइल के अनुसार, आप 4 प्रमुख योजनाओं के लिए पात्र हैं: 1. पोस्ट-मैट्रिक छात्रवृत्ति (92% मैच), 2. आयुष्मान भारत स्वास्थ्य बीमा (88% मैच), 3. पीएम-किसान (85% मैच), और 4. मनरेगा।',
    eligible: 'आपकी सटीक पात्रता निर्धारित करने के लिए, WelfareAI आपकी आयु, स्थान, श्रेणी और आय की तुलना सरकारी नियमों से करता है।',
    documents: 'आवश्यक दस्तावेज: (1) आधार कार्ड, (2) आय प्रमाण पत्र, (3) जाति प्रमाण पत्र, (4) शैक्षिक अंकपत्र, (5) बैंक पासबुक प्रति। इन्हें अपने डॉक्यूमेंट वॉल्ट में अपलोड करें।',
    tamil: 'यह योजनाएं शिक्षा, स्वास्थ्य और वित्तीय सहायता प्रदान करती हैं।',
    howApply: 'आप हमारे प्लेटफॉर्म के माध्यम से सीधे आवेदन कर सकते हैं! "Explore Schemes" पर जाएं, "Apply Now" पर क्लिक करें और दस्तावेज संलग्न करें।',
    default: 'मैं सरकारी योजनाओं की खोज, पात्रता नियमों, आवश्यक दस्तावेजों और आवेदन प्रक्रियाओं में आपकी सहायता के लिए यहां हूं।'
  }
};

function getResponse(input, lang = 'en') {
  const q = input.toLowerCase();
  const resSet = demoResponsesMultilingual[lang] || demoResponsesMultilingual.en;

  if (q.includes('which') || q.includes('qualify') || q.includes('எந்த') || q.includes('किन')) return resSet.apply;
  if (q.includes('eligible') || q.includes('தகுதி') || q.includes('पात्र')) return resSet.eligible;
  if (q.includes('document') || q.includes('ஆவணங்கள்') || q.includes('दस्तावेज')) return resSet.documents;
  if (q.includes('tamil') || q.includes('தமிழ்')) return resSet.tamil;
  if (q.includes('apply') || q.includes('விண்ணப்ப') || q.includes('आवेदन')) return resSet.howApply;
  return resSet.default;
}

export function AIAssistantPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: t('aiHello'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = suggestedQuestionsMap[currentLang] || suggestedQuestionsMap.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (text) => {
    const queryText = text || input;
    if (!queryText.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = getResponse(queryText, currentLang);
      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <DashboardLayout title={t('aiAssistTitle')} subtitle={t('aiAssistantHeaderSubtitle', { defaultValue: 'Ask anything about government schemes, eligibility, documents, and application steps.' })}>
      {/* Full height Chat Container filling viewport */}
      <div className="flex h-[calc(100vh-170px)] min-h-[500px] flex-col rounded-2xl border border-gray-200 bg-white shadow-card overflow-hidden">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-sky-50/80 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-navy-900">{t('aiAssistTitle')}</h2>
                <span className="flex h-2 w-2 rounded-full bg-success-500 animate-pulse" />
              </div>
              <p className="text-xs text-gray-500">{t('aiAssistSub')}</p>
            </div>
          </div>

          <button
            onClick={() => setMessages([{
              id: `welcome-${Date.now()}`,
              role: 'assistant',
              content: t('aiHello'),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }])}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-navy-900"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Chat
          </button>
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-sky-100 text-primary-700'
              }`}>
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>

              {/* Message Content Bubble */}
              <div className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm shadow-xs transition-all ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-none'
                  : 'bg-white border border-gray-200 text-navy-800 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <div className={`mt-1.5 text-[10px] font-semibold ${msg.role === 'user' ? 'text-primary-200 text-right' : 'text-gray-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator State */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-primary-700">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-gray-200 bg-white px-5 py-3 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary-400 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-2 w-2 rounded-full bg-primary-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="border-t border-gray-100 bg-white px-6 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-500">
            <HelpCircle className="h-3.5 w-3.5 text-primary-600" />
            {t('suggestedQuestions', { defaultValue: 'Suggested Questions' })}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="rounded-full border border-primary-200 bg-primary-50/60 px-3.5 py-1.5 text-xs font-semibold text-primary-800 transition-all hover:border-primary-400 hover:bg-primary-100 hover:shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('typeQ')}
              className="input-base flex-1 rounded-xl py-3 text-sm focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
