'use client';

import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase', met: /[A-Z]/.test(password) },
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!passwordRequirements.every(r => r.met)) {
      setError('Please meet all password requirements');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Redirect to onboarding
      router.push('/onboarding');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 flex flex-col items-center justify-center animate-fade-in relative overflow-hidden">
        
        {/* Red Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-brand-600/60 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-red-600/60 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
            <div className="text-center mb-10">
                 <Link href="/" className="inline-block">
                   <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center font-serif font-bold text-2xl text-white shadow-[0_0_30px_rgba(225,48,23,0.4)] border border-brand-500 mx-auto mb-6">C</div>
                 </Link>
                 <h1 className="text-4xl font-serif font-bold text-white mb-2">Create your account</h1>
                 <p className="text-neutral-400">Start your AI-powered learning journey</p>
            </div>

            <div className="bg-neutral-900/80 backdrop-blur-md p-8 rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-neutral-800 border-b-[8px] border-black relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-blue-500"></div>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-neutral-300 mb-2">Full Name</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 pl-11 bg-black border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-white placeholder-neutral-600 shadow-inner"
                                placeholder="Alex Student"
                                required
                            />
                            <User className="absolute left-3.5 top-3.5 text-neutral-500" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-neutral-300 mb-2">Email Address</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 pl-11 bg-black border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-white placeholder-neutral-600 shadow-inner"
                                placeholder="student@university.edu"
                                required
                            />
                            <Mail className="absolute left-3.5 top-3.5 text-neutral-500" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-neutral-300 mb-2">Password</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pl-11 bg-black border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-white placeholder-neutral-600 shadow-inner"
                                placeholder="••••••••"
                                required
                            />
                            <Lock className="absolute left-3.5 top-3.5 text-neutral-500" size={20} />
                        </div>
                        <div className="mt-3 space-y-2">
                          {passwordRequirements.map((req, i) => (
                            <div key={i} className={`flex items-center gap-2 text-xs ${req.met ? 'text-green-400' : 'text-neutral-500'}`}>
                              <Check size={14} className={req.met ? 'opacity-100' : 'opacity-30'} />
                              {req.label}
                            </div>
                          ))}
                        </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-800 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg shadow-lg shadow-brand-900/20 transition-all flex items-center justify-center gap-2 group border-b-[4px] border-brand-900 active:border-b-0 active:translate-y-[4px]"
                    >
                        {loading ? 'Creating account...' : 'Create Account'} 
                        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-neutral-800"></div>
                  <span className="text-xs text-neutral-500 font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-neutral-800"></div>
                </div>

                <button 
                  onClick={handleGoogleSignUp}
                  className="w-full bg-white hover:bg-neutral-100 text-black font-bold py-3.5 rounded-lg shadow-lg transition-all flex items-center justify-center gap-3 border-b-[4px] border-neutral-300 active:border-b-0 active:translate-y-[4px]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>

                <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
                    <p className="text-sm text-neutral-500">
                        Already have an account? <Link href="/login" className="font-bold text-brand-400 hover:text-brand-300 hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>

    </div>
  );
}
