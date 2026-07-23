'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { TurnstileCaptcha } from '@/components/auth/turnstile-captcha';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Clear any previous session
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: captchaToken || undefined,
      },
    });
    if (error) {
      setError(error.message);
    } else if (data.session && data.user) {
      await supabase.from('user_settings').upsert(
        { user_id: data.user.id },
        { onConflict: 'user_id', ignoreDuplicates: true }
      );
      window.location.href = '/onboarding';
    } else if (data.user) {
      setError('Account created! Please check your email inbox to confirm your sign-up before logging in.');
    }
    setLoading(false);
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-alabaster p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-sage/5 blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-terracotta/5 blur-[80px]" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center">
              <Leaf size={24} className="text-sage" strokeWidth={1.5} />
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-semibold text-forest">Create Account</h1>
          <p className="text-text-secondary mt-2">Start managing your finances with AI</p>
        </div>

        <div className="bg-white rounded-card shadow-botanical-lg border border-stone/50 p-8">
          {/* Google */}
          <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border border-stone/50 rounded-full text-forest font-medium hover:bg-cream hover:border-sage/30 transition-all duration-300 mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-stone/50" />
            <span className="text-xs text-mushroom tracking-wider uppercase">or</span>
            <div className="flex-1 h-px bg-stone/50" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-forest mb-2 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-botanical" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-sm font-medium text-forest mb-2 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-botanical pr-12" placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-mushroom hover:text-forest transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <TurnstileCaptcha onVerify={setCaptchaToken} />

            {error && <div className="p-3 bg-terracotta/10 border border-terracotta/20 rounded-xl text-sm text-terracotta">{error}</div>}

            <button type="submit" disabled={loading} className="btn-botanical w-full flex items-center justify-center gap-2 group mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link href="/signin" className="text-sage font-medium hover:text-forest transition-colors duration-300">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
