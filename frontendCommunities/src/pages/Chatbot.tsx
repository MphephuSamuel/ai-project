import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n/useI18n';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
declare const importMetaEnv: { VITE_OPENROUTER_API_KEY?: string } | undefined;
const OPENROUTER_API_KEY: string =
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { VITE_OPENROUTER_API_KEY?: string } }).env?.VITE_OPENROUTER_API_KEY) ||
  (typeof importMetaEnv !== 'undefined' && importMetaEnv?.VITE_OPENROUTER_API_KEY) ||
  '';
const HAS_API_KEY = !!(OPENROUTER_API_KEY && OPENROUTER_API_KEY.trim());
const MAIN_MODEL = 'alibaba/tongyi-deepresearch-30b-a3b:free';
const TRANSLATE_MODEL = 'google/translate'; // Example translation model

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'zu', name: 'Zulu' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'st', name: 'Sotho' },
  { code: 'tn', name: 'Tswana' },
  { code: 'ts', name: 'Tsonga' },
  { code: 'ss', name: 'Swati' },
  { code: 've', name: 'Venda' },
  { code: 'nr', name: 'Ndebele' },
];

interface ChatbotProps {
  floatingMode?: boolean;
  language?: string;
  onLanguageChange?: (code: string) => void;
}

function Chatbot({ floatingMode, language: languageProp, onLanguageChange }: ChatbotProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('chat.initialMessage'),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(languageProp || 'en');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (languageProp && languageProp !== language) {
      setLanguage(languageProp);
    }
  }, [languageProp, language]);

  useEffect(() => {
    // scroll to bottom when messages update
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!HAS_API_KEY) {
      // Friendly message when API key isn't configured
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: input },
        {
          role: 'assistant',
          content:
            'Setup needed: No OpenRouter API key is configured. Please set VITE_OPENROUTER_API_KEY in frontendCommunities/.env.local and restart the dev server.',
        },
      ]);
      setInput('');
      return;
    }
    setLoading(true);
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    let prompt = input;
    let targetLang = language;
    // Detect language change request
    const langMatch = input.match(/chat in ([a-zA-Z ]+)/i);
    if (langMatch) {
      const langName = langMatch[1].toLowerCase();
      const found = LANGUAGES.find((l) => l.name.toLowerCase() === langName);
      if (found) {
        if (onLanguageChange) {
          onLanguageChange(found.code);
        } else {
          setLanguage(found.code);
        }
        targetLang = found.code;
        prompt = `Please continue this conversation in ${found.name}.`;
      }
    }

    // Topic guard: allow only sustainability, carbon emissions, climate action, eco-points/profile/context
    const allowedKeywords = [
      'carbon', 'co2', 'emission', 'emissions', 'climate', 'earth', 'environment', 'sustainable', 'sustainability',
      'recycle', 'recycling', 'compost', 'waste', 'plastic', 'green', 'renewable', 'solar', 'wind', 'energy', 'electricity', 'kwh',
      'transport', 'bus', 'taxi', 'car', 'bicycle', 'bike', 'walk', 'carpool', 'public transport',
      'tree', 'planting', 'water', 'pollution', 'offset', 'footprint', 'diet', 'meat', 'vegan', 'vegetarian',
      'community', 'eco points', 'eco-points', 'journal', 'dashboard', 'leaderboard', 'profile', 'language', 'signup', 'login',
      'green innovators'
    ];
    const isOnTopic = (text: string) => {
      const lowered = text.toLowerCase();
      return allowedKeywords.some((kw) => lowered.includes(kw));
    };
    if (!isOnTopic(prompt)) {
      // Refuse off-topic politely and guide back to climate topics; no API call
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chat.offTopic') || 'I can only help with carbon emissions, climate-friendly actions, and your Green Innovators profile. Please ask about those topics.' },
      ]);
      setInput('');
      setLoading(false);
      return;
    }

    // Compose system prompt
    let systemPrompt =
      `You are ${t('chat.assistantName')}, a focused assistant dedicated to: (1) reducing carbon emissions, (2) climate-friendly and sustainability actions, and (3) helping with the user's Green Innovators profile and eco-points if provided. ` +
      `Hard rule: Politely refuse and redirect any request outside these topics. Do NOT engage in unrelated subjects. ` +
      `Never invent user data; only reference information explicitly provided in context. ` +
      `Keep answers practical, friendly, and actionable. If the user requests a different language, respond in that language.`;
    if (targetLang !== 'en') {
      systemPrompt += ` Respond in ${LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang}.`;
    }

    // Call main model
    let reply = 'Sorry, I could not generate a response.';
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MAIN_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
            userMessage,
          ],
        }),
      });
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        reply = data.choices[0].message.content;
      } else if (data.error && data.error.message) {
        reply = `Error: ${data.error.message}`;
      }

      // If translation is needed and not already in targetLang
      if (targetLang !== 'en' && !langMatch) {
        const translateRes = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: TRANSLATE_MODEL,
            messages: [
              { role: 'system', content: `Translate the following to ${LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang}` },
              { role: 'user', content: reply },
            ],
          }),
        });
        const translateData = await translateRes.json();
        if (translateData.choices && translateData.choices[0] && translateData.choices[0].message && translateData.choices[0].message.content) {
          reply = translateData.choices[0].message.content;
        }
      }
    } catch (e) {
      // keep default reply
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    setInput('');
    setLoading(false);
  };

  // UI rendering (no header here; header lives in FloatingChat)
  if (floatingMode) {
    return (
  <div className="w-full h-full flex flex-col overflow-hidden flex-1" style={{ boxSizing: 'border-box', overflowX: 'hidden', maxWidth: '100%' }}>
        {/* Chat messages */}
  <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 w-full" style={{ background: '#f9fafb', overflowX: 'hidden', maxWidth: '100%' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} style={{ width: '100%', maxWidth: '100%' }}>
              <div
                className={`px-3 py-2 rounded-2xl shadow text-sm ${msg.role === 'user' ? 'bg-green-500 text-white rounded-br-none' : 'bg-white border border-green-200 text-gray-900 rounded-bl-none'}`}
                style={{ maxWidth: '75%', wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                <span className="block text-xs font-semibold mb-1" style={{ color: msg.role === 'user' ? '#d1fae5' : '#16a34a' }}>{msg.role === 'user' ? t('chat.you') || 'You' : t('chat.assistantName')}</span>
                <span className="whitespace-pre-line">{msg.content}</span>
              </div>
            </div>
          ))}
          {!HAS_API_KEY && (
            <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-2">
              Admin setup required: No OpenRouter API key found. Set VITE_OPENROUTER_API_KEY in frontendCommunities/.env.local and restart.
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
  {/* Input row pinned to bottom */}
  <div className="mt-auto sticky bottom-0 flex items-center gap-2 px-3 py-3 border-t border-green-100 bg-white w-full" style={{ boxSizing: 'border-box', maxWidth: '100%', overflowX: 'hidden' }}>
          <input
            className="flex-1 rounded-full border border-green-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 text-sm bg-gray-50"
            type="text"
            placeholder={HAS_API_KEY ? t('chat.inputPlaceholder') : 'Chat disabled: configure API key in .env.local'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            disabled={loading || !HAS_API_KEY}
            style={{ minWidth: 0, height: '40px' }}
          />
          <button
            className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition disabled:opacity-50 text-sm"
            onClick={handleSend}
            disabled={loading || !HAS_API_KEY}
            style={{ whiteSpace: 'nowrap' }}
          >
            {loading ? '...' : t('chat.send')}
          </button>
        </div>
      </div>
    );
  }

  // Default fallback (if not floatingMode)
  return null;
}

export default Chatbot;
