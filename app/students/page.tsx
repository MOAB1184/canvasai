'use client';

import React from 'react';
import { Brain, Layers, Calendar, Clock, Sparkles, CheckCircle, ArrowRight, Zap, BookOpen, Target } from 'lucide-react';
import Link from 'next/link';

export default function StudentsPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Flashcards',
      description: 'Automatically generate study cards from your lecture slides, PDFs, and Canvas modules. No more manual card creation.',
    },
    {
      icon: Layers,
      title: 'Smart Content Indexing',
      description: 'Our AI scans and indexes all your course materials, making it easy to find exactly what you need for studying.',
    },
    {
      icon: Calendar,
      title: 'Auto To-Do List',
      description: 'Never miss a deadline. CanvasAI automatically pulls assignments, quizzes, and events from all your courses.',
    },
    {
      icon: Zap,
      title: 'Instant Answers',
      description: 'Ask questions about your course content and get accurate answers based on your actual lecture materials.',
    },
    {
      icon: BookOpen,
      title: 'Course Summaries',
      description: 'Get AI-generated summaries of entire modules or specific topics to speed up your review sessions.',
    },
    {
      icon: Target,
      title: 'Exam Prep Mode',
      description: 'Focus on what matters. Our AI identifies key concepts and creates targeted study materials for your exams.',
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/20 px-4 py-2 rounded-full text-sm font-bold text-blue-400 mb-6">
            <Sparkles size={16} /> Built for students
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Study smarter,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              not harder
            </span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
            CanvasAI transforms your Canvas LMS into an AI-powered study companion. 
            Generate flashcards, get instant answers, and never miss a deadline.
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
              <div className="w-14 h-14 bg-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-12 text-center border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to ace your classes?</h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Join thousands of students who are already studying smarter with CanvasAI.
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

