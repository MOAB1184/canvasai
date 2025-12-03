'use client';

import React from 'react';
import { FileCheck, MessageSquare, BarChart3, Clock, Sparkles, CheckCircle, ArrowRight, FileText, Mic, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TeachersPage() {
  const features = [
    {
      icon: FileCheck,
      title: 'AI Auto-Grader',
      description: 'Upload your rubric and let AI grade student submissions. Get consistent, fair grades with detailed feedback in seconds.',
    },
    {
      icon: FileText,
      title: 'Lesson Plan Generator',
      description: 'Create comprehensive lesson plans aligned with your curriculum. Just describe your topic and learning objectives.',
    },
    {
      icon: MessageSquare,
      title: 'Announcement Writer',
      description: 'Draft professional, engaging announcements for your classes. Save time on routine communication.',
    },
    {
      icon: Mic,
      title: 'Lecture Transcription',
      description: 'Record your lectures and get automatic transcriptions with summaries. Perfect for creating study materials.',
    },
    {
      icon: BarChart3,
      title: 'Student Analytics',
      description: 'Get insights into student engagement and performance. Identify struggling students early.',
    },
    {
      icon: Shield,
      title: 'Plagiarism Detection',
      description: 'Check student submissions for originality. Integrated directly into your grading workflow.',
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-green-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-emerald-600/30 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-500/20 px-4 py-2 rounded-full text-sm font-bold text-green-400 mb-6">
            <Sparkles size={16} /> Built for educators
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Teach more,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              grade less
            </span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
            CanvasAI automates the tedious parts of teaching so you can focus on what matters most: your students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-brand-900/30"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-4 rounded-xl font-bold transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-neutral-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all group"
            >
              <div className="w-14 h-14 bg-green-900/30 text-green-400 rounded-xl flex items-center justify-center mb-6 border border-green-500/20 group-hover:scale-110 transition-transform">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { value: '10hrs', label: 'Saved per week' },
            { value: '500+', label: 'Educators using' },
            { value: '95%', label: 'Grading accuracy' },
            { value: '< 30s', label: 'Per assignment' },
          ].map((stat, index) => (
            <div key={index} className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-neutral-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-3xl p-12 text-center border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your teaching?</h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Join educators who are saving hours every week with CanvasAI.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-neutral-200 transition-all"
          >
            <CheckCircle size={20} /> Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

