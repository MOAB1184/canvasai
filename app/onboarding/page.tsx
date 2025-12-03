'use client';

import React, { useState } from 'react';
import { Link2, CheckCircle, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [canvasToken, setCanvasToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save settings');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 flex flex-col items-center justify-center animate-fade-in relative overflow-hidden">
        
        {/* Red Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-brand-600/60 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-red-600/60 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <div className="w-full max-w-lg relative z-10">
            <div className="text-center mb-10">
                 <Link href="/" className="inline-block">
                   <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center font-serif font-bold text-2xl text-white shadow-[0_0_30px_rgba(225,48,23,0.4)] border border-brand-500 mx-auto mb-6">C</div>
                 </Link>
                 <h1 className="text-4xl font-serif font-bold text-white mb-2">Let&apos;s get you set up</h1>
                 <p className="text-neutral-400">Connect your Canvas account to get started</p>
            </div>

            <div className="bg-neutral-900/80 backdrop-blur-md p-8 rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-neutral-800 border-b-[8px] border-black relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-blue-500"></div>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
                      <Link2 size={32} className="text-brand-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Connect Canvas LMS</h2>
                    <p className="text-neutral-400 text-sm">Generate an API token from your Canvas account to get started</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-2">Canvas API Token</label>
                    <input 
                      type="password" 
                      value={canvasToken}
                      onChange={(e) => setCanvasToken(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-white placeholder-neutral-600 shadow-inner"
                      placeholder="Paste your Canvas API token"
                    />
                    <a 
                      href="https://canvas.instructure.com/doc/api/file.oauth.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                    >
                      How to get your Canvas API token <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-white mb-1">AI Features Included</div>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          Your account comes with built-in AI capabilities powered by Gemini. No additional setup required!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={handleComplete}
                      disabled={loading}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3.5 rounded-lg transition-all border-b-[4px] border-neutral-900 active:border-b-0 active:translate-y-[4px]"
                    >
                      Skip for now
                    </button>
                    <button 
                      onClick={handleComplete}
                      disabled={loading || !canvasToken}
                      className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-800 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 group border-b-[4px] border-brand-900 active:border-b-0 active:translate-y-[4px]"
                    >
                      {loading ? 'Connecting...' : 'Continue'} 
                      {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>}
                    </button>
                  </div>
                </div>
            </div>
        </div>

    </div>
  );
}
