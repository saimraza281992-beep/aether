import { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useDreamStore } from '@/store/dreamStore';
import { Sparkles, BookOpen, CloudLightning, Compass } from 'lucide-react';

export default function Insights() {
  const { dreams, loadDreams, language, user } = useDreamStore();

  useEffect(() => {
    loadDreams();
  }, [loadDreams]);

  // Calculate Grimoire (unique symbols)
  const grimoire = useMemo(() => {
    const symbols = new Set<string>();
    dreams.forEach(d => d.symbols?.forEach(s => symbols.add(s.toLowerCase())));
    return Array.from(symbols);
  }, [dreams]);

  // Calculate Emotional Weather
  const weather = useMemo(() => {
    const counts: Record<string, number> = {};
    dreams.forEach(d => {
      d.emotions?.forEach(e => {
        const em = e.toLowerCase();
        counts[em] = (counts[em] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [dreams]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="glass-panel p-8 text-center flex flex-col items-center justify-center max-w-md w-full">
          <Compass className="w-12 h-12 text-aether-muted mb-4 opacity-50" />
          <p className="text-aether-text mb-4">
            {language === 'ur' ? 'بصیرت دیکھنے کے لیے سائن ان کریں۔' : 'Please sign in to view your insights.'}
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
          {language === 'ur' ? 'بصیرت' : 'Insights'}
        </h1>
        <p className="text-aether-muted italic text-sm" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          {language === 'ur' ? 'آپ کے لاشعور کے نقشے۔' : 'Maps of your subconscious.'}
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Emotional Weather Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <CloudLightning className="w-6 h-6 text-aether-cyan" />
            <h2 className="text-xl font-serif text-aether-cyan">
              {language === 'ur' ? 'جذباتی موسم' : 'Emotional Weather'}
            </h2>
          </div>
          
          {weather.length === 0 ? (
            <p className="text-aether-muted text-sm italic">
              {language === 'ur' ? 'ابھی تک کوئی جذبات ریکارڈ نہیں ہوئے۔' : 'No emotions recorded yet.'}
            </p>
          ) : (
            <div className="space-y-4">
              {weather.map(([emotion, count], index) => {
                const maxCount = weather[0][1];
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={emotion} className="relative">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-aether-text capitalize">{emotion}</span>
                      <span className="text-aether-muted">{count}</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-aether-indigo to-aether-cyan"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Symbol Grimoire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-aether-magenta" />
            <h2 className="text-xl font-serif text-aether-magenta">
              {language === 'ur' ? 'علامتوں کی کتاب' : 'Symbol Grimoire'}
            </h2>
          </div>

          {grimoire.length === 0 ? (
            <p className="text-aether-muted text-sm italic">
              {language === 'ur' ? 'ابھی تک کوئی علامت دریافت نہیں ہوئی۔' : 'No symbols discovered yet.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {grimoire.map((symbol, index) => (
                <motion.div
                  key={symbol}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-aether-magenta/20 flex items-center gap-2 group hover:bg-aether-magenta/10 transition-colors cursor-default"
                >
                  <Sparkles className="w-3 h-3 text-aether-magenta opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm text-aether-text capitalize">{symbol}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
