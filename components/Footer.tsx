'use client';

import React from 'react';
import { Monitor, Github, Twitter, Instagram, Shield, Lock, FileCheck } from 'lucide-react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black pt-24 pb-12 px-6 border-t border-neutral-900 relative overflow-hidden">
      {/* Subtle Footer Gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-900/50 blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* CTA Section */}
        <div className="mb-24 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-6 tracking-tight">
            The AI that helps you study, <br/>
            <span className="text-neutral-500 italic">not cheat.</span>
          </h2>
          <p className="text-xl text-neutral-400 mb-10 font-light">
            Install CanvasAI and start getting better grades today.
          </p>
          <a 
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white hover:bg-neutral-200 text-neutral-900 px-8 py-4 rounded-lg font-medium transition-all shadow-[0_10px_20px_-5px_rgba(255,255,255,0.1)] border-b-[4px] border-neutral-400 active:border-b-0 active:translate-y-[4px]"
          >
            <Monitor size={20} />
            <span>Add to Chrome</span>
          </a>
        </div>

        <div className="w-full h-px bg-neutral-900 mb-20"></div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6 group cursor-pointer">
              <span className="font-serif font-bold text-white text-3xl tracking-tight">CanvasAI</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest">Product</h4>
            <Link href="/students" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Students</Link>
            <Link href="/teachers" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Teachers</Link>
            <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Chrome Extension</a>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest">Company</h4>
            <a href="#" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">About Us</a>
            <a href="#" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Academic Integrity</a>
            <a href="#" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Security</a>
            <a href="#" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Contact Sales</a>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest">Resources</h4>
            <a href="#" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Blog</a>
            <a href="#" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Study Guides</a>
            <a href="#" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Help Center</a>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest">Legal</h4>
            <a href="#" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-neutral-500 hover:text-brand-400 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-t border-neutral-900 pt-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 bg-green-900/20 px-3 py-1.5 rounded-full w-fit border border-green-900/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Systems Operational</span>
            </div>
            
            {/* Security Badges */}
            <div className="flex gap-4 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex flex-col items-center gap-1" title="SOC 2 Type II">
                <div className="w-12 h-12 rounded-full border-2 border-neutral-800 flex items-center justify-center bg-neutral-900 shadow-sm">
                  <Shield size={20} className="text-neutral-400" />
                </div>
                <span className="text-[10px] font-bold text-neutral-600">SOC 2</span>
              </div>
              <div className="flex flex-col items-center gap-1" title="GDPR Compliant">
                <div className="w-12 h-12 rounded-full border-2 border-neutral-800 flex items-center justify-center bg-neutral-900 shadow-sm">
                  <Lock size={20} className="text-neutral-400" />
                </div>
                <span className="text-[10px] font-bold text-neutral-600">GDPR</span>
              </div>
              <div className="flex flex-col items-center gap-1" title="FERPA Compliant">
                <div className="w-12 h-12 rounded-full border-2 border-neutral-800 flex items-center justify-center bg-neutral-900 shadow-sm">
                  <FileCheck size={20} className="text-neutral-400" />
                </div>
                <span className="text-[10px] font-bold text-neutral-600">FERPA</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            <div className="flex-1"></div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex gap-5 text-neutral-500">
                <Twitter size={20} className="cursor-pointer hover:text-blue-400 transition-colors" />
                <Instagram size={20} className="cursor-pointer hover:text-pink-400 transition-colors" />
                <Github size={20} className="cursor-pointer hover:text-white transition-colors" />
              </div>
              <span className="text-xs text-neutral-600 font-medium">© 2025 CanvasAI Inc. Not affiliated with Instructure.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
