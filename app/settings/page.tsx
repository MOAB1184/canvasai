'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Link2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [canvasToken, setCanvasToken] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      setLoading(false);
    } catch {
      router.push('/login');
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save settings');
        setSaving(false);
        return;
      }

      setSuccess(true);
      setSaving(false);
      setCanvasToken(''); // Clear the field after saving
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-8 pb-20 px-6 relative overflow-hidden">
        
        {/* Red Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-brand-600/40 rounded-full blur-[120px] mix-blend-screen"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-red-600/40 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 font-medium transition-colors">
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <h1 className="text-4xl font-serif font-bold text-white mb-2">Settings</h1>
            <p className="text-neutral-400 mb-10">Manage your Canvas LMS integration</p>

            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-3 text-green-400 text-sm">
                <CheckCircle size={18} />
                Settings saved successfully!
              </div>
            )}

            <div className="bg-neutral-900/80 backdrop-blur-md rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-neutral-800 border-b-[8px] border-black overflow-hidden">
                <div className="p-8 space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-brand-900/30 rounded-lg flex items-center justify-center border border-brand-500/20">
                            <Link2 size={20} className="text-brand-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">Canvas LMS</h3>
                            <p className="text-xs text-neutral-500">Update your Canvas API token</p>
                          </div>
                        </div>
                        <input 
                            type="password" 
                            value={canvasToken}
                            onChange={(e) => setCanvasToken(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-white placeholder-neutral-600 shadow-inner"
                            placeholder="Enter new Canvas API token"
                        />
                        <p className="text-xs text-neutral-500 mt-2">
                          Leave blank to keep your current token
                        </p>
                    </div>

                    <div className="bg-green-900/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-bold text-green-400 mb-1">AI Features Active</div>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            Your account has full access to AI-powered features including flashcard generation, summaries, and study planning.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleSave}
                      disabled={saving || !canvasToken}
                      className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-800 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg shadow-lg shadow-brand-900/20 transition-all flex items-center justify-center gap-2 border-b-[4px] border-brand-900 active:border-b-0 active:translate-y-[4px]"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
