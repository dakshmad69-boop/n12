import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
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
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 right-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/"><Logo variant="light" /></Link>
        </div>
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 shadow-premium-lg">
          <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 mb-8">
            <button onClick={() => setMode('signin')} className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors ${mode === 'signin' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500'}`}>Sign in</button>
            <button onClick={() => setMode('signup')} className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500'}`}>Create account</button>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-2 text-sm text-neutral-500">{mode === 'signin' ? 'Sign in to manage your orders and designs.' : 'Start ordering custom packaging in minutes.'}</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="block text-sm font-medium mb-2">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-2">Password</span>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500" />
            </label>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-packtoday-500 hover:bg-packtoday-600 text-white py-3.5 rounded-lg font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? 'Please wait...' : <>{mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-neutral-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Your data is secure with us
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-neutral-400">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-packtoday-400 font-semibold hover:text-packtoday-300">
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
