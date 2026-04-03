import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Moon, Book, Network, User, LogOut, Volume2, VolumeX, Languages, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDreamStore } from '@/store/dreamStore';
import AuthModal from './AuthModal';

export default function Layout() {
  const location = useLocation();
  const { user, checkUser, signOut, language, setLanguage, soundEnabled, toggleSound, realityCheckEnabled } = useDreamStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Reality Check Interval
  useEffect(() => {
    if (!realityCheckEnabled || !user) return;

    // Check every 2 hours (in ms)
    const interval = setInterval(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(language === 'ur' ? 'کیا آپ خواب دیکھ رہے ہیں؟' : 'Are you dreaming right now?', {
          body: language === 'ur' ? 'حقیقت کی جانچ کریں۔' : 'Perform a reality check.',
          icon: '/icon.png' // Assuming there's an icon
        });
      }
    }, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [realityCheckEnabled, user, language]);

  const navItems = [
    { path: '/', icon: Moon, label: 'Capture' },
    { path: '/journal', icon: Book, label: 'Journal' },
    { path: '/tapestry', icon: Network, label: 'Tapestry' },
    { path: '/insights', icon: Compass, label: 'Insights' },
  ];

  return (
    <div className="min-h-screen bg-aether-bg text-aether-text flex flex-col font-sans overflow-hidden relative">
      {/* Mystical background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-aether-purple/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-aether-indigo/40 blur-[100px]" />
      </div>

      {/* Top Bar / Auth & Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
          className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-aether-muted hover:text-aether-gold transition-colors"
          title="Toggle Language"
        >
          <span className="text-xs font-serif font-bold">{language === 'en' ? 'UR' : 'EN'}</span>
        </button>
        
        <button
          onClick={toggleSound}
          className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-aether-muted hover:text-aether-cyan transition-colors"
          title="Toggle Ambient Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {user ? (
          <Link 
            to="/profile"
            className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-xs text-aether-gold hover:bg-white/10 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>{language === 'ur' ? 'پروفائل' : 'Profile'}</span>
          </Link>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-xs text-aether-gold hover:bg-white/10 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>{language === 'ur' ? 'سائن ان' : 'Sign In'}</span>
          </button>
        )}
      </div>

      <main className="flex-1 relative z-10 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation for PWA */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-b-none rounded-t-3xl border-b-0 border-x-0 pb-safe pt-2 px-6 pb-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className="relative flex flex-col items-center p-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon 
                  className={cn(
                    "w-6 h-6 mb-1 transition-colors duration-300",
                    isActive ? "text-aether-gold glow-text" : "text-aether-muted"
                  )} 
                />
                <span className={cn(
                  "text-[10px] font-medium tracking-wider uppercase",
                  isActive ? "text-aether-gold" : "text-aether-muted"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
