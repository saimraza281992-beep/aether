import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link to complete your weaving.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md p-6"
          >
            <div className="glass-panel p-8 relative overflow-hidden">
              {/* Decorative glows */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-aether-cyan/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-aether-magenta/20 rounded-full blur-3xl pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-aether-muted hover:text-aether-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8 relative z-10">
                <h2 className="text-2xl font-serif text-aether-gold glow-text mb-2">
                  {isSignUp ? 'Join the Collective' : 'Enter the Tapestry'}
                </h2>
                <p className="text-sm text-aether-muted italic">
                  {isSignUp
                    ? 'Create your anonymous vessel.'
                    : 'Welcome back, dreamer.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-aether-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-aether-text placeholder-aether-muted/50 focus:outline-none focus:border-aether-cyan/50 focus:ring-1 focus:ring-aether-cyan/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-aether-muted" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      minLength={6}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-aether-text placeholder-aether-muted/50 focus:outline-none focus:border-aether-cyan/50 focus:ring-1 focus:ring-aether-cyan/50 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-xs text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="text-aether-cyan text-xs text-center bg-aether-cyan/10 py-2 rounded-lg border border-aether-cyan/20">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-aether-gold py-3 rounded-xl font-serif tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-xs text-aether-muted hover:text-aether-cyan transition-colors"
                >
                  {isSignUp
                    ? 'Already have a vessel? Sign In'
                    : 'New to the collective? Sign Up'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
