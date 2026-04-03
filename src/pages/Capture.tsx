import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Send, Sparkles, User as UserIcon, Lightbulb } from 'lucide-react';
import { useDreamStore } from '@/store/dreamStore';
import { useNavigate } from 'react-router-dom';
import { interpretDream, generateDreamImage, generateOracleSeed } from '@/lib/gemini';

export default function Capture() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const { addDream, language, user, locationEnabled, activeProblem, setActiveProblem, oracleSeed, setOracleSeed } = useDreamStore();
  const navigate = useNavigate();
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (user && !oracleSeed) {
      generateOracleSeed(language).then(seed => setOracleSeed(seed));
    }
  }, [user, language, oracleSeed, setOracleSeed]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSave = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    
    let locationData = undefined;
    if (locationEnabled && 'geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } catch (err) {
        console.error("Could not get location for dream:", err);
      }
    }
    
    try {
      setProcessingStatus(language === 'ur' ? 'خواب کی تعبیر ہو رہی ہے...' : 'Consulting the Oracle...');
      const { interpretation, symbols, emotions, wakingQuest, musePrompts, problemInsight } = await interpretDream(transcript, language, activeProblem);
      
      setProcessingStatus(language === 'ur' ? 'تصویر بنائی جا رہی ہے...' : 'Painting the vision...');
      const imageUrl = await generateDreamImage(transcript, symbols);
      
      await addDream({
        text: transcript,
        interpretation,
        symbols,
        emotions,
        imageUrl,
        location: locationData,
        wakingQuest,
        musePrompts,
        problemInsight
      });
      
      // Clear problem after solving
      setActiveProblem('');
      
      navigate('/journal');
    } catch (error) {
      console.error("Failed to process dream:", error);
      // Fallback save if AI fails
      await addDream({
        text: transcript,
        symbols: ['mystery'],
        emotions: ['unknown'],
        location: locationData
      });
      navigate('/journal');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex flex-col items-center"
        >
          <h1 className="text-4xl font-serif text-aether-gold glow-text mb-2 text-center">AETHER</h1>
          <div className="glass-panel p-8 mt-8 text-center flex flex-col items-center justify-center w-full">
            <UserIcon className="w-12 h-12 text-aether-muted mb-4 opacity-50" />
            <p className="text-aether-text mb-2">
              {language === 'ur' ? 'خواب شامل کرنے کے لیے سائن ان کریں۔' : 'Please sign in to capture your dreams.'}
            </p>
            <p className="text-xs text-aether-muted italic">
              {language === 'ur' ? 'آپ کے خواب اجتماعی شعور کا حصہ بننے کے منتظر ہیں۔' : 'Your dreams await the collective consciousness.'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-20 relative pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <h1 className="text-4xl font-serif text-aether-gold glow-text mb-2 text-center">AETHER</h1>
        
        {/* Oracle's Seed */}
        {oracleSeed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full glass-panel p-4 mb-8 border-aether-gold/30 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-aether-gold" />
            <p className="text-xs text-aether-gold uppercase tracking-widest mb-1 font-serif">
              {language === 'ur' ? 'اوریکل کا بیج' : "The Oracle's Seed"}
            </p>
            <p className="text-sm text-aether-text italic" dir={language === 'ur' ? 'rtl' : 'ltr'}>
              "{oracleSeed}"
            </p>
          </motion.div>
        )}

        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          {/* Pulsing rings when recording */}
          {isRecording && (
            <>
              <motion.div 
                animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-aether-cyan glow-cyan"
              />
              <motion.div 
                animate={{ scale: [1, 1.2, 1.5], opacity: [0.8, 0.4, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-aether-magenta glow-magenta"
              />
            </>
          )}
          
          <button 
            onClick={toggleRecording}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
              isRecording ? 'bg-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.3)]' : 'glass-panel hover:bg-white/10'
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-aether-cyan" fill="currentColor" />
            ) : (
              <Mic className="w-10 h-10 text-aether-gold" />
            )}
          </button>
        </div>

        <div className="w-full glass-panel p-4 mb-4 min-h-[150px] relative">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={language === 'ur' ? 'یا اپنا خواب یہاں لکھیں...' : 'Or type your dream here...'}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
            className={`w-full h-full min-h-[120px] bg-transparent border-none focus:outline-none focus:ring-0 text-aether-text placeholder-aether-muted/50 resize-none ${language === 'ur' ? 'font-urdu text-lg leading-loose' : ''}`}
          />
        </div>

        {/* Subconscious Supercomputer */}
        <div className="w-full glass-panel p-3 mb-8 flex items-center gap-3 border-aether-cyan/20">
          <Lightbulb className="w-5 h-5 text-aether-cyan flex-shrink-0" />
          <input
            type="text"
            value={activeProblem}
            onChange={(e) => setActiveProblem(e.target.value)}
            placeholder={language === 'ur' ? 'کیا آپ کسی مسئلے کا حل تلاش کر رہے ہیں؟ (اختیاری)' : 'Incubate a problem to solve... (Optional)'}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
            className={`w-full bg-transparent border-none focus:outline-none text-sm text-aether-text placeholder-aether-muted/50 ${language === 'ur' ? 'font-urdu' : ''}`}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={!transcript.trim() || isProcessing}
          className="glass-panel px-8 py-3 rounded-full flex items-center gap-2 text-aether-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing ? (
            <Sparkles className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span className="font-serif tracking-widest uppercase text-sm">
            {isProcessing ? processingStatus : (language === 'ur' ? 'خواب شامل کریں' : 'Weave Dream')}
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
