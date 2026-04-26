import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, Sparkles, XCircle, Info } from 'lucide-react';
import { askExpert } from '../../services/geminiService';
import { cn } from '../../lib/utils';
import { Message } from '../../types';

export default function AgriBot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Bonjour ! Je suis Agri-Expert, votre assistant AI. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur vos cultures, les maladies ou les traitements." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await askExpert(messages, userMessage);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] md:h-[calc(100vh-100px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Conseiller AI</h2>
          <p className="text-slate-500">Posez vos questions techniques en arabe dialectal ou français</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-primary bg-green-50 px-3 py-1 rounded-full border border-green-100">
          <Sparkles size={12} />
          Gemini Pro Activé
        </div>
      </div>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-4 max-w-[85%]",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                  m.role === 'user' ? "bg-brand-primary text-white" : "bg-white border border-slate-200 text-brand-primary"
                )}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={cn(
                  "p-4 rounded-3xl text-sm md:text-base leading-relaxed",
                  m.role === 'user' 
                    ? "bg-brand-primary text-white rounded-tr-none shadow-md" 
                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm"
                )}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-brand-primary flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-3xl rounded-tl-none flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-brand-primary" />
                <span className="text-xs font-medium text-slate-400 italic">En train de réfléchir...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-2xl shadow-inner group focus-within:border-brand-primary transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ex: Comment traiter le mildiou des olives ?"
              className="flex-1 bg-transparent px-4 py-2 text-slate-700 focus:outline-none placeholder:text-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-3 bg-brand-primary text-white rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <QuickTag text="Traitement Olives" onClick={() => setInput("Quels sont les traitements bio pour l'olivier ?")} />
            <QuickTag text="Engrais Azoté" onClick={() => setInput("Comment doser l'engrais pour les agrumes ?")} />
            <QuickTag text="Météo Mahdia" onClick={() => setInput("Quelle est la météo agricole à Mahdia cette semaine ?")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickTag({ text, onClick }: { text: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="text-[10px] md:text-xs font-bold text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-full hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm"
    >
      {text}
    </button>
  );
}
