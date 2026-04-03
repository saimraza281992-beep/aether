import { useEffect } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { useDreamStore } from '@/store/dreamStore';
import { Sparkles, Image as ImageIcon, Compass, Lightbulb, Palette, User as UserIcon } from 'lucide-react';

export default function Journal() {
  const { dreams, loadDreams, language, user } = useDreamStore();

  useEffect(() => {
    if (user) {
      loadDreams();
    }
  }, [loadDreams, user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="glass-panel p-8 text-center flex flex-col items-center justify-center max-w-md w-full">
          <UserIcon className="w-12 h-12 text-aether-muted mb-4 opacity-50" />
          <p className="text-aether-text mb-4">
            {language === 'ur' ? 'اپنا روزنامچہ دیکھنے کے لیے سائن ان کریں۔' : 'Please sign in to view your journal.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-12 max-w-2xl mx-auto pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-serif text-aether-gold glow-text mb-2">
          {language === 'ur' ? 'آپ کا روزنامچہ' : 'Your Tapestry'}
        </h1>
        <p className="text-aether-muted italic text-sm" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          {language === 'ur' ? 'آپ کے لاشعور کی بازگشت۔' : 'Echoes of your subconscious mind.'}
        </p>
      </motion.div>

      <div className="space-y-8">
        {dreams.length === 0 ? (
          <div className="glass-panel p-8 text-center flex flex-col items-center justify-center">
            <Sparkles className="w-8 h-8 text-aether-muted mb-4 opacity-50" />
            <p className="text-aether-muted">
              {language === 'ur' ? 'آپ کا روزنامچہ خالی ہے۔' : 'Your journal is empty.'}
            </p>
          </div>
        ) : (
          dreams.map((dream, index) => (
            <motion.div
              key={dream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel overflow-hidden group relative"
            >
              {dream.imageUrl ? (
                <div className="w-full h-48 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-aether-indigo to-transparent z-10" />
                  <img 
                    src={dream.imageUrl} 
                    alt="Dream visualization" 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-full h-24 bg-aether-purple/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-aether-indigo to-transparent z-10" />
                  <ImageIcon className="w-8 h-8 text-aether-muted/30" />
                </div>
              )}
              
              <div className="p-6 relative z-20 -mt-8">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-aether-gold/70 tracking-widest uppercase bg-aether-bg/80 px-2 py-1 rounded backdrop-blur-sm">
                    {format(new Date(dream.date), 'MMM dd, yyyy')}
                  </span>
                </div>
                
                <div className="mb-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
                  <p className={`text-aether-text/90 leading-relaxed font-light ${language === 'ur' ? 'font-urdu text-lg' : ''}`}>
                    "{dream.text}"
                  </p>
                </div>

                {dream.interpretation && (
                  <div className="mb-6 p-4 bg-white/5 rounded-xl border border-aether-gold/20 relative" dir={language === 'ur' ? 'rtl' : 'ltr'}>
                    <Sparkles className="absolute -top-2 -left-2 w-4 h-4 text-aether-gold" />
                    <p className={`text-aether-gold/90 italic text-sm leading-relaxed ${language === 'ur' ? 'font-urdu text-base' : ''}`}>
                      {dream.interpretation}
                    </p>
                  </div>
                )}

                {/* New Features Display */}
                <div className="space-y-4 mb-6">
                  {dream.problemInsight && (
                    <div className="p-4 bg-aether-cyan/5 rounded-xl border border-aether-cyan/20">
                      <div className="flex items-center gap-2 mb-2 text-aether-cyan">
                        <Lightbulb className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest font-serif">
                          {language === 'ur' ? 'مسئلے کا حل' : 'Subconscious Insight'}
                        </span>
                      </div>
                      <p className="text-sm text-aether-text/80">{dream.problemInsight}</p>
                    </div>
                  )}

                  {dream.wakingQuest && (
                    <div className="p-4 bg-aether-magenta/5 rounded-xl border border-aether-magenta/20">
                      <div className="flex items-center gap-2 mb-2 text-aether-magenta">
                        <Compass className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest font-serif">
                          {language === 'ur' ? 'آج کی تلاش' : 'Waking Quest'}
                        </span>
                      </div>
                      <p className="text-sm text-aether-text/80">{dream.wakingQuest}</p>
                    </div>
                  )}

                  {dream.musePrompts && dream.musePrompts.length > 0 && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 mb-3 text-aether-muted">
                        <Palette className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest font-serif">
                          {language === 'ur' ? 'تخلیقی اشارے' : 'The Muse'}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {dream.musePrompts.map((prompt, i) => (
                          <li key={i} className="text-sm text-aether-text/70 flex gap-2">
                            <span className="text-aether-gold/50">•</span>
                            {prompt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {dream.symbols.map(symbol => (
                    <span key={symbol} className="px-3 py-1 rounded-full bg-aether-cyan/10 border border-aether-cyan/20 text-xs text-aether-cyan">
                      {symbol}
                    </span>
                  ))}
                  {dream.emotions.map(emotion => (
                    <span key={emotion} className="px-3 py-1 rounded-full bg-aether-magenta/10 border border-aether-magenta/20 text-xs text-aether-magenta">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
