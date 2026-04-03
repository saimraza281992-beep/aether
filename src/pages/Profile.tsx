import { useEffect } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { useDreamStore } from '@/store/dreamStore';
import { Sparkles, Image as ImageIcon, LogOut, User as UserIcon, MapPin, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { 
    user, signOut, dreams, loadDreams, language, 
    locationEnabled, setLocationEnabled, 
    notificationsEnabled, setNotificationsEnabled,
    realityCheckEnabled, setRealityCheckEnabled
  } = useDreamStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadDreams();
  }, [loadDreams]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="glass-panel p-8 text-center flex flex-col items-center justify-center max-w-md w-full">
          <UserIcon className="w-12 h-12 text-aether-muted mb-4 opacity-50" />
          <p className="text-aether-text mb-4">
            {language === 'ur' ? 'پروفائل دیکھنے کے لیے سائن ان کریں۔' : 'Please sign in to view your profile.'}
          </p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleLocation = () => {
    if (!locationEnabled) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => setLocationEnabled(true),
          (error) => {
            console.error("Error getting location:", error);
            alert(language === 'ur' ? 'مقام تک رسائی کی اجازت نہیں دی گئی۔' : 'Location access denied.');
          }
        );
      } else {
        alert(language === 'ur' ? 'آپ کا براؤزر مقام کی حمایت نہیں کرتا ہے۔' : 'Geolocation is not supported by your browser.');
      }
    } else {
      setLocationEnabled(false);
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
        } else {
          alert(language === 'ur' ? 'اطلاعات کی اجازت نہیں دی گئی۔' : 'Notification permission denied.');
        }
      } else {
        alert(language === 'ur' ? 'آپ کا براؤزر اطلاعات کی حمایت نہیں کرتا ہے۔' : 'Notifications are not supported by your browser.');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <div className="min-h-screen p-6 pt-12 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-serif text-aether-gold glow-text mb-2">
          {language === 'ur' ? 'پروفائل' : 'Profile'}
        </h1>
        <div className="glass-panel p-6 mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-aether-purple/20 flex items-center justify-center border border-aether-gold/30">
              <UserIcon className="w-8 h-8 text-aether-gold" />
            </div>
            <div>
              <p className="text-sm text-aether-muted uppercase tracking-widest mb-1">
                {language === 'ur' ? 'ای میل' : 'Email'}
              </p>
              <p className="text-aether-text font-mono">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="glass-panel px-6 py-3 rounded-full flex items-center gap-2 text-sm text-aether-magenta hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="uppercase tracking-widest">
              {language === 'ur' ? 'سائن آؤٹ' : 'Sign Out'}
            </span>
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-serif text-aether-cyan glow-text mb-4">
          {language === 'ur' ? 'ترتیبات' : 'Settings'}
        </h2>
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 ${locationEnabled ? 'text-aether-cyan' : 'text-aether-muted'}`} />
              <div>
                <p className="text-aether-text">{language === 'ur' ? 'مقام کی مطابقت پذیری' : 'Location Sync'}</p>
                <p className="text-xs text-aether-muted">
                  {language === 'ur' ? 'اسی طرح کے مقامات سے خوابوں کو جوڑیں۔' : 'Connect dreams from similar locations.'}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleLocation}
              className={`w-12 h-6 rounded-full transition-colors relative ${locationEnabled ? 'bg-aether-cyan/50' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${locationEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-aether-gold' : 'text-aether-muted'}`} />
              <div>
                <p className="text-aether-text">{language === 'ur' ? 'اطلاعات' : 'Notifications'}</p>
                <p className="text-xs text-aether-muted">
                  {language === 'ur' ? 'جب دوسرے آپ کے خوابوں سے گونجتے ہیں تو جانیں۔' : 'Know when others resonate with your dreams.'}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-aether-gold/50' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className={`w-5 h-5 ${realityCheckEnabled ? 'text-aether-magenta' : 'text-aether-muted'}`} />
              <div>
                <p className="text-aether-text">{language === 'ur' ? 'حقیقت کی جانچ' : 'Reality Checks'}</p>
                <p className="text-xs text-aether-muted">
                  {language === 'ur' ? 'واضح خواب دیکھنے کے لیے یاد دہانیاں۔' : 'Reminders to induce lucid dreaming.'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setRealityCheckEnabled(!realityCheckEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${realityCheckEnabled ? 'bg-aether-magenta/50' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${realityCheckEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-serif text-aether-cyan glow-text mb-6">
          {language === 'ur' ? 'آپ کے تمام خواب' : 'Your Entire Tapestry'}
        </h2>

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
      </motion.div>
    </div>
  );
}
