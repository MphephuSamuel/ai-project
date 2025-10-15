import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import Chatbot from '../pages/Chatbot';
import { useI18n } from '@/i18n/useI18n';

const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const { langCode, setLanguage, t } = useI18n();
  const [language, setLocalLanguage] = useState(langCode);
  const chatButtonRef = useRef(null);

  useEffect(() => {
    setLocalLanguage(langCode);
  }, [langCode]);

  return (
    <>
      {/* Floating Chat Icon */}
      <button
        ref={chatButtonRef}
        className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-400"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Chatbot"
        style={{ boxShadow: '0 4px 24px 0 rgba(34,197,94,0.25)' }}
      >
        <MessageCircle className="w-7 h-7" color="#22c55e" />
      </button>

      {/* Chatbot Drawer/Popup */}
      {open && (
  <div className="fixed bottom-8 right-8 z-50 w-[380px] max-w-[90vw] bg-white rounded-3xl shadow-2xl border border-green-200 flex flex-col overflow-hidden" style={{ minHeight: 480, maxHeight: '75vh', boxShadow: '0 8px 32px 0 rgba(34,197,94,0.18)', overflowX: 'hidden' }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-green-100 bg-gradient-to-r from-green-600 to-green-400 rounded-t-3xl">
            <span className="font-semibold text-white text-base tracking-wide">{t('chat.title')}</span>
            <div className="flex items-center gap-2">
              <select
                className="rounded border border-green-200 bg-white text-green-700 text-xs px-2 py-1"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ maxWidth: '90px' }}
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="zu">Zulu</option>
                <option value="xh">Xhosa</option>
                <option value="st">Sotho</option>
                <option value="tn">Tswana</option>
                <option value="ts">Tsonga</option>
                <option value="ss">Swati</option>
                <option value="ve">Venda</option>
                <option value="nr">Ndebele</option>
              </select>
              <button
                className="text-white hover:text-green-200 text-2xl font-bold px-2"
                onClick={() => setOpen(false)}
                aria-label="Close Chatbot"
              >
                ×
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden bg-green-50 rounded-b-3xl flex flex-col relative" style={{ minHeight: 350, overflowX: 'hidden' }}>
            <Chatbot floatingMode language={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
