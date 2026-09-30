import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/account';
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error } = await fn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    navigate(redirect);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left showcase panel */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-packtoday-950 flex-col justify-between p-12 xl:p-16">
        {/* Decorative orbs */}
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-packtoday-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[28rem] h-[28rem] rounded-full bg-packtoday-500/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-packtoday-400/5 blur-2xl" />

        <div className="relative z-10">
          <Link to="/"><Logo variant="light" /></Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full pl-1.5 pr-3.5 py-1.5 mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-packtoday-500">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-xs font-medium text-packtoday-100">Custom packaging, simplified</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight text-white leading-[1.1]">
            Packaging that<br />feels like yours.
          </h2>
          <p className="mt-5 text-lg text-packtoday-200/80 leading-relaxed">
            Sign in to manage orders, track production, and reorder your favourite packaging in a few clicks.
          </p>

          <div className="mt-10 space-y-5">
            {[
              { icon: Package, title: 'Low minimums', text: 'Start from just 100 units.' },
              { icon: ShieldCheck, title: 'Quality guaranteed', text: 'Food-grade materials you can trust.' },
              { icon: Sparkles, title: 'Design support', text: 'We help you create artwork that stands out.' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm shrink-0">
                  <f.icon className="w-5 h-5 text-packtoday-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-sm text-packtoday-200/60 mt-0.5">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-packtoday-200/40 text-sm">
          <Lock className="w-3.5 h-3.5" />
          <span>Bank-grade encryption keeps your data safe.</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-6">
          <Link to="/" className="inline-block"><Logo /></Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-[400px] animate-fade-up">
            {/* Mode toggle */}
            <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 mb-8">
              <button
                onClick={() => setMode('signin')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === 'signin' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === 'signup' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Create account
              </button>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              {mode === 'signin'
                ? 'Sign in to manage your orders and designs.'
                : 'Start ordering custom packaging in minutes.'}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block">
                <span className="block text-sm font-medium mb-2 text-neutral-700">Email</span>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="w-full border border-neutral-300 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-packtoday-500 focus:ring-2 focus:ring-packtoday-500/10 transition-all"
                  />
                </div>
              </label>

              <label className="block">
                <span className="block text-sm font-medium mb-2 text-neutral-700">Password</span>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full border border-neutral-300 rounded-xl pl-11 pr-11 py-3 text-sm outline-none focus:border-packtoday-500 focus:ring-2 focus:ring-packtoday-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </label>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 animate-scale-in">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-packtoday-500 hover:bg-packtoday-600 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:shadow-packtoday-500/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Please wait...
                  </span>
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Secure
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Encrypted
              </span>
            </div>

            <p className="mt-8 text-center text-sm text-neutral-500">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-packtoday-600 font-semibold hover:text-packtoday-500 transition-colors"
              >
                {mode === 'signin' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
