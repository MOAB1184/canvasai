'use client';

import React, { useState, useEffect } from 'react';
import { NAV_LINKS } from '@/lib/constants';
import { Page } from '@/lib/types';
import { Menu, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  currentPage?: Page;
  onNavigate?: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: Page | undefined) => {
    if (page && onNavigate) {
      onNavigate(page);
      setIsOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getHref = (page: Page | undefined) => {
    switch (page) {
      case Page.STUDENTS: return '/students';
      case Page.TEACHERS: return '/teachers';
      case Page.PRICING: return '/pricing';
      case Page.SIGN_IN: return '/login';
      case Page.SIGN_UP: return '/signup';
      case Page.DASHBOARD: return '/dashboard';
      default: return '/';
    }
  };

  const islandStyle = `
    backdrop-blur-2xl bg-neutral-900/90 
    border border-white/10
    shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] 
    ring-1 ring-white/5
    transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
  `;

  return (
    <>
      <div 
        className={`
          fixed left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out font-sans
          ${scrolled ? 'top-4' : 'top-6'}
        `}
      >
        <header className="w-full max-w-7xl flex items-center justify-between px-4 md:px-8 pointer-events-none gap-4">
          
          {/* Logo */}
          <Link 
            href="/"
            className={`pointer-events-auto ${islandStyle} rounded-lg py-2 pl-2 pr-6 flex items-center gap-3 cursor-pointer group hover:bg-neutral-800 hover:-translate-y-0.5 border-b-[4px] border-b-black`}
          >
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 rounded-md text-white shadow-inner border border-white/10 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <span className="font-serif font-bold text-xl relative z-10">C</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold text-white tracking-tight leading-none group-hover:text-brand-100 transition-colors">CanvasAI</span>
            </div>
          </Link>

          {/* Navigation (Desktop) */}
          <nav className={`hidden md:flex pointer-events-auto ${islandStyle} rounded-lg p-1.5 items-center gap-1 border-b-[4px] border-b-black`}>
            {NAV_LINKS.map((link) => {
              const href = getHref(link.page);
              const isActive = pathname === href || currentPage === link.page;
              return (
                <Link
                  key={link.label}
                  href={href}
                  className={`
                    px-6 py-2.5 text-xs font-bold rounded-md transition-all duration-300 tracking-wide relative overflow-hidden group
                    ${isActive 
                      ? 'bg-white text-black shadow-lg shadow-white/10 scale-100 border-b-[3px] border-b-neutral-400' 
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border-b-[3px] border-b-transparent hover:border-b-white/10'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="pointer-events-auto flex items-center gap-3">
            <Link 
              href="/login"
              className={`hidden md:flex ${islandStyle} rounded-lg px-6 py-3 text-xs font-bold text-neutral-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 border-b-[4px] border-b-black active:border-b-0 active:translate-y-[4px]`}
            >
              Log In
            </Link>

            <Link 
              href="/signup"
              className="
                group relative bg-brand-600 hover:bg-brand-500 text-white 
                px-6 py-3 rounded-lg font-bold text-xs tracking-wide
                border-t border-white/10
                border-b-[4px] border-b-brand-900
                active:border-b-0 active:translate-y-[4px] active:shadow-none
                transition-all duration-150 ease-out
                shadow-[0_10px_20px_-5px_rgba(225,48,23,0.5)]
                hover:shadow-[0_15px_30px_-5px_rgba(225,48,23,0.6)]
                flex items-center gap-2 overflow-hidden
              "
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
              <span className="relative z-10">Get Started</span>
              <ChevronRight size={14} className="opacity-70 group-hover:translate-x-1 transition-transform relative z-10"/>
            </Link>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsOpen(true)}
              className={`md:hidden ${islandStyle} p-3.5 rounded-lg text-white hover:bg-neutral-800 active:scale-95 transition-transform border-b-[4px] border-b-black`}
            >
              <Menu size={20} />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`
          fixed inset-0 z-[60] flex justify-end transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        ></div>

        <div 
          className={`
            relative w-full max-w-xs bg-neutral-900 h-[calc(100%-2rem)] m-4 rounded-xl border border-white/10 shadow-2xl p-8 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'}
          `}
        >
          <div className="flex justify-between items-center mb-10">
            <span className="font-bold text-2xl text-white font-serif tracking-tight">Menu</span>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-3 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white border-b-[4px] border-neutral-950 hover:rotate-90 transition-all shadow-lg active:border-b-0 active:translate-y-[4px]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={getHref(link.page)}
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-neutral-400 hover:text-white text-left py-4 px-6 rounded-lg hover:bg-neutral-800 transition-all border border-transparent hover:border-neutral-700 flex justify-between group shadow-sm hover:shadow-md border-b-[4px] border-b-transparent hover:border-b-neutral-950"
              >
                {link.label}
                <ChevronRight className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-500" size={20}/>
              </Link>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <Link 
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-4 rounded-lg border border-neutral-800 bg-neutral-800 text-white font-bold hover:bg-neutral-700 hover:border-neutral-600 transition-all border-b-[4px] border-b-black active:border-b-0 active:translate-y-[4px] text-center"
            >
              Log In
            </Link>
            <Link 
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="w-full py-4 rounded-lg bg-brand-600 text-white font-bold shadow-[0_10px_30px_-5px_rgba(225,48,23,0.4)] hover:bg-brand-500 transition-all border-b-[4px] border-brand-900 active:border-b-0 active:translate-y-[4px] text-center"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
