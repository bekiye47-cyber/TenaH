import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  ShieldCheck, 
  AlertCircle, 
  Lock, 
  Mail, 
  ArrowRight, 
  Smartphone, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

interface LoginPageProps {
  onSwitchToMiniApp?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToMiniApp }) => {
  const { signIn, signUp, accessDeniedMessage, clearAccessDenied, isLiveSupabase } = useAdminAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);
    clearAccessDenied();

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        const res = await signUp(email, password);
        setSuccessNotice(res.message);
        setMode('signin');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    clearAccessDenied();
    setLoading(true);
    try {
      await signIn('admin@tenaholistic.com', 'admin123');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] dark:bg-[#0D1512] text-[#1D2B24] dark:text-[#E2EBE6] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white font-serif font-bold text-2xl shadow-md mb-3">
            T
          </div>
          <h1 className="text-2xl font-bold font-serif-heading tracking-tight">
            Tena Holistic Admin
          </h1>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Internal content management & deposit approvals portal
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Access Denied Banner */}
          {accessDeniedMessage && (
            <div 
              id="access-denied-alert"
              className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs leading-relaxed flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Access Denied</p>
                <p className="mt-1 opacity-90">{accessDeniedMessage}</p>
                <p className="mt-2 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                  Tip: Open Supabase Table Editor &gt; table "users" &gt; edit your row and set column <code className="font-mono bg-rose-100 dark:bg-rose-900 px-1 py-0.5 rounded">role = 'admin'</code>.
                </p>
              </div>
            </div>
          )}

          {/* Standard error */}
          {errorMsg && !accessDeniedMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success notice */}
          {successNotice && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Tabs: Sign In / Sign Up */}
          <div className="flex rounded-xl bg-stone-100 dark:bg-stone-900/80 p-1 mb-6">
            <button
              id="tab-signin"
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'signin'
                  ? 'bg-white dark:bg-[#14221C] text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Admin Sign In
            </button>
            <button
              id="tab-signup"
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'signup'
                  ? 'bg-white dark:bg-[#14221C] text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Register New User
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tenaholistic.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-[#1D2B24] dark:text-[#E2EBE6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-[#1D2B24] dark:text-[#E2EBE6]"
                />
              </div>
            </div>

            <button
              id="admin-submit-button"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block animate-spin text-sm">●</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Portal' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Preview Button */}
          <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800">
            <button
              id="quick-demo-admin-btn"
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Instant Demo Admin Access (Reviewer Mode)</span>
            </button>
            <p className="mt-2 text-[11px] text-center text-stone-400">
              Instantly bypass login to test all 5 sections with seed data.
            </p>
          </div>
        </div>

        {/* Return to Mini App Link */}
        {onSwitchToMiniApp && (
          <div className="text-center mt-6">
            <button
              id="login-switch-to-miniapp"
              onClick={onSwitchToMiniApp}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Back to Telegram Mini App interface</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
