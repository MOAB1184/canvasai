'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Sparkles, UserPlus, LayoutGrid, Book, Calendar, Bell, Settings, BarChart3, Plus, Brain, FileText, CheckCircle2, ArrowRight, MousePointer2, Check, MoreHorizontal, ChevronLeft, X, RotateCw, Clock, Target } from 'lucide-react';
import Link from 'next/link';

const Hero: React.FC = () => {
  const [uiState, setUiState] = useState<'dashboard' | 'typing' | 'scanning' | 'results' | 'clicking_start' | 'deck_active'>('dashboard');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [typedText, setTypedText] = useState('');
  const [flipped, setFlipped] = useState(false);
  
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const factor = 600;
      const x = (e.clientX - left - width / 2) / factor;
      const y = (e.clientY - top - height / 2) / factor;
      setRotate({ x: -y, y: x });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (uiState === 'dashboard') {
      timeout = setTimeout(() => setUiState('typing'), 2500);
    } 
    else if (uiState === 'typing') {
      const targetText = "Week 4: Cellular Respiration";
      if (typedText.length < targetText.length) {
        timeout = setTimeout(() => {
          setTypedText(targetText.slice(0, typedText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => setUiState('scanning'), 800);
      }
    }
    else if (uiState === 'scanning') {
      timeout = setTimeout(() => setUiState('results'), 2200);
    }
    else if (uiState === 'results') {
      timeout = setTimeout(() => setUiState('clicking_start'), 1500);
    }
    else if (uiState === 'clicking_start') {
      timeout = setTimeout(() => setUiState('deck_active'), 600);
    }
    else if (uiState === 'deck_active') {
      if (!flipped) {
        timeout = setTimeout(() => setFlipped(true), 2000);
      } else {
        timeout = setTimeout(() => {
          setFlipped(false);
          setTypedText('');
          setUiState('dashboard');
        }, 5000);
      }
    }

    return () => clearTimeout(timeout);
  }, [uiState, typedText, flipped]);

  const handleReset = () => {
    setUiState('dashboard');
    setTypedText('');
    setFlipped(false);
  };

  return (
    <section className="relative w-full pt-32 pb-20 overflow-hidden flex flex-col items-center bg-black selection:bg-brand-500 selection:text-white min-h-screen">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-noise">
        <div className="absolute inset-0 bg-grid opacity-[0.1] animate-grid-move perspective-1000 transform rotate-x-12 scale-150"></div>
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[90vw] h-[70vh] bg-red-600/60 rounded-[100%] blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-red-700/50 rounded-full blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-800/70 rounded-full blur-[100px] mix-blend-screen"></div>
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-brand-500/40 rounded-full blur-[80px] mix-blend-screen animate-float"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute top-32 left-10 lg:left-32 animate-float hidden md:block z-20 hover:z-30">
        <div className="w-20 h-20 bg-neutral-900/40 backdrop-blur-xl rounded-lg transform rotate-12 flex items-center justify-center text-white border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-300 hover:scale-110 hover:rotate-6 ring-1 ring-white/5 border-b-[6px] border-b-black/60">
          <span className="text-4xl font-serif font-bold bg-gradient-to-br from-brand-400 to-white bg-clip-text text-transparent drop-shadow-sm">A+</span>
        </div>
      </div>

      <div className="absolute top-40 right-10 lg:right-32 animate-float-delayed hidden md:block z-20 hover:z-30">
        <div className="w-16 h-16 bg-neutral-900/40 backdrop-blur-xl rounded-lg transform -rotate-12 flex items-center justify-center border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-300 hover:scale-110 hover:-rotate-6 ring-1 ring-white/5 border-b-[6px] border-b-black/60">
          <Sparkles size={32} className="text-brand-400 drop-shadow-[0_0_10px_rgba(255,107,87,0.5)]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mb-24 px-6 animate-fade-in-up">
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold text-white mb-8 tracking-tighter leading-[0.95] drop-shadow-2xl">
          Your Canvas LMS <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-400 via-brand-500 to-red-600 animate-pulse-slow relative">
            supercharged.
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-600 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C2.00025 6.99997 101.999 -5.99992 198 7.00003" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-neutral-300 max-w-2xl mx-auto mb-12 font-light leading-relaxed drop-shadow-md tracking-tight">
          The all-in-one AI workspace. Connects to your courses, reads your modules, and generates <span className="text-red-400 font-medium">flashcards & guides</span> instantly.
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-5">
          <a 
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto group flex items-center justify-center gap-3 bg-brand-600 text-white px-8 py-4 rounded-lg font-bold text-base transition-all shadow-[0_10px_40px_-10px_rgba(225,48,23,0.6)] hover:bg-brand-500 border-t border-white/10 border-b-[6px] border-b-brand-900 active:border-b-0 active:translate-y-[6px]"
          >
            <Monitor size={20} />
            <span>Add to Chrome</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </a>
          <Link 
            href="/signup"
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-white/5 backdrop-blur-md text-white px-8 py-4 rounded-lg font-bold text-base transition-all border border-white/10 hover:bg-white/10 shadow-lg border-b-[6px] border-b-black/50 active:border-b-0 active:translate-y-[6px]"
          >
            <UserPlus size={20} />
            <span>Create Account</span>
          </Link>
        </div>

        {/* Trusted By */}
        <div className="mt-16 pt-8 border-t border-white/5 opacity-60">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Trusted by students at</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-70 hover:opacity-100 transition-opacity">
            {['Stanford', 'Berkeley', 'MIT', 'Harvard', 'UCLA'].map(u => (
              <span key={u} className="text-lg font-serif font-bold text-neutral-400">{u}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Dashboard Showcase */}
      <div className="relative z-10 w-full max-w-[1200px] px-4 perspective-1000" ref={containerRef}>
        
        <div className="absolute inset-0 bg-red-600/40 blur-[100px] -z-10 translate-y-20 scale-90 rounded-full"></div>

        <div 
          className="relative bg-[#0a0a0a] rounded-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden aspect-[4/3] md:aspect-[16/9] flex flex-col border border-white/10 ring-1 ring-white/5 group transition-transform duration-100 ease-out border-b-[8px] border-b-black"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/0 to-white/0 opacity-40 pointer-events-none z-50 mix-blend-overlay"></div>
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 translate-x-[-100%] animate-shimmer pointer-events-none z-50"></div>
          
          {/* Window Controls */}
          <div className="h-10 bg-[#0f0f0f] border-b border-white/5 flex items-center px-4 justify-between z-20 shrink-0">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-sm"></div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] rounded-md text-[10px] font-bold text-neutral-500 border border-white/5 shadow-inner">
              <Monitor size={10} /> canvas-ai.app
            </div>
            <div className="w-14"></div>
          </div>

          {/* App Content */}
          <div className="flex-1 flex overflow-hidden bg-black relative">
            
            {/* Sidebar */}
            <div className="w-[80px] bg-[#0f0f0f] flex flex-col items-center py-6 gap-6 shrink-0 z-10 border-r border-white/5">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg mb-4 border-b-[3px] border-brand-900">C</div>
              {[
                {id: 'dashboard', icon: LayoutGrid},
                {id: 'courses', icon: Book},
                {id: 'calendar', icon: Calendar},
                {id: 'inbox', icon: Bell},
                {id: 'settings', icon: Settings}
              ].map(item => (
                <div key={item.id} className={`p-3 rounded-md transition-all ${activeTab === item.id ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
                  <item.icon size={22} />
                </div>
              ))}
            </div>

            {/* Main Canvas Area */}
            <div className={`flex-1 flex relative transition-all duration-700 ${uiState !== 'dashboard' ? 'blur-[3px] scale-[0.98] brightness-75' : ''}`}>
              
              {/* Center Content */}
              <div className="flex-1 p-8 overflow-hidden flex flex-col">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
                    <p className="text-neutral-500 text-sm mt-1 font-medium">Fall 2025 Semester • 4 Active Courses</p>
                  </div>
                  <button className="bg-white text-black px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 hover:bg-neutral-200 transition-all border-b-[4px] border-neutral-300 active:border-b-0 active:translate-y-[4px]">
                    <Plus size={14}/> Customize
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  {[
                    { code: 'BIO 101', name: 'Intro to Biology', grade: '88% B+', color: 'from-brand-600 to-brand-900' },
                    { code: 'HIST 200', name: 'World History', grade: '92% A-', color: 'from-orange-600 to-orange-900' },
                    { code: 'CHEM 101', name: 'Gen Chemistry', grade: '76% C', color: 'from-blue-600 to-blue-900' }
                  ].map((c, i) => (
                    <div key={i} className="bg-[#111] rounded-lg border border-white/5 overflow-hidden group cursor-pointer hover:border-white/20 transition-all hover:-translate-y-1 relative border-b-[4px] border-black">
                      <div className="h-24 relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        <div className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"><MoreHorizontal size={16}/></div>
                        <div className="absolute bottom-3 left-4 text-white font-bold text-xl drop-shadow-md tracking-tight">{c.code}</div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-white mb-3 text-sm truncate">{c.name}</h3>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex gap-3 text-neutral-500">
                            <Bell size={14} className="hover:text-white transition-colors"/> 
                            <FileText size={14} className="hover:text-white transition-colors"/>
                          </div>
                          <span className="text-[10px] font-bold text-neutral-300 bg-white/5 px-2 py-1 rounded-sm border border-white/5">{c.grade}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Section */}
                <div className="flex gap-6 flex-1 min-h-0">
                  <div className="flex-[2] bg-[#111] rounded-lg border border-white/5 p-5 flex flex-col border-b-[4px] border-black">
                    <h3 className="font-bold text-neutral-400 text-xs mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <BarChart3 size={14} className="text-brand-500"/> Activity
                    </h3>
                    <div className="flex-1 flex items-end justify-between gap-2">
                      {[30, 45, 25, 60, 75, 40, 55, 70, 50, 65, 80, 60, 45, 80].map((h,i) => (
                        <div key={i} className="w-full bg-[#1a1a1a] rounded-t-sm relative group h-full flex flex-col justify-end">
                          <div className="w-full bg-brand-600 rounded-t-sm transition-all duration-500 group-hover:bg-brand-500 shadow-[0_-4px_10px_rgba(225,48,23,0.3)]" style={{height: `${h}%`}}></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 bg-[#111] rounded-lg border border-white/5 p-5 flex flex-col justify-center relative overflow-hidden group border-b-[4px] border-black">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-green-500/20 transition-all"></div>
                    <h3 className="font-bold text-neutral-400 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1 relative z-10">
                      <Target size={12} className="text-green-500"/> Projected GPA
                    </h3>
                    <div className="text-5xl font-black text-white mb-4 relative z-10 tracking-tighter">3.8</div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full mb-3 overflow-hidden relative z-10">
                      <div className="bg-green-500 h-full w-[92%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                    </div>
                    <div className="text-[10px] text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded-sm w-fit border border-green-500/20 relative z-10">
                      +0.2 from last semester
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="w-72 border-l border-white/5 bg-[#0f0f0f] p-6 hidden lg:flex flex-col z-10">
                <h3 className="font-bold text-neutral-500 text-xs mb-6 uppercase tracking-wider">To Do List</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Read Chapter 4', sub: 'BIO 101', due: 'Tomorrow', done: false },
                    { title: 'History Essay', sub: 'HIST 200', due: 'Friday', done: false },
                    { title: 'Lab Safety Quiz', sub: 'CHEM 101', due: 'Sunday', done: true },
                    { title: 'Calculus Set', sub: 'MATH 105', due: 'Next Week', done: false },
                    { title: 'Group Project', sub: 'COM 101', due: 'In 2 weeks', done: false }
                  ].map((t, i) => (
                    <div key={i} className={`flex gap-3 group cursor-pointer ${t.done ? 'opacity-40' : ''}`}>
                      <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors mt-0.5 ${t.done ? 'bg-brand-600 border-brand-600 text-white' : 'border-neutral-700 bg-[#1a1a1a] group-hover:border-brand-500'}`}>
                        {t.done && <Check size={12}/>}
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${t.done ? 'line-through text-neutral-500' : 'text-neutral-300 group-hover:text-white transition-colors'}`}>{t.title}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{t.sub} • <span className={t.due==='Tomorrow'?'text-brand-400 font-bold':''}>{t.due}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Widget */}
            <div className={`absolute bottom-6 right-6 w-[380px] bg-[#111]/90 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 ring-1 ring-black/5 z-40 flex flex-col overflow-hidden transition-all duration-500 transform ${uiState === 'deck_active' ? 'translate-y-10 opacity-0 pointer-events-none' : (uiState !== 'dashboard' ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none')}`}>
              <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm bg-brand-600 flex items-center justify-center text-white shadow-sm border border-brand-500">
                    <Sparkles size={10}/>
                  </div>
                  <span className="font-bold text-white text-xs tracking-wide">CanvasAI Assistant</span>
                </div>
                <button onClick={handleReset}><X size={14} className="text-neutral-500 hover:text-white"/></button>
              </div>
              <div className="p-5 h-[260px] overflow-y-auto bg-black/50 space-y-4 relative">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[#222] border border-white/5 rounded-full flex items-center justify-center text-neutral-400 shadow-sm shrink-0"><Brain size={14}/></div>
                  <div className="bg-[#222] border border-white/5 p-3 rounded-lg rounded-tl-none text-xs text-neutral-300 shadow-sm leading-relaxed">
                    Hi! I noticed you have a Bio midterm coming up. Want some help studying?
                  </div>
                </div>
                {uiState !== 'dashboard' && (
                  <div className="flex gap-3 flex-row-reverse animate-fade-in-up">
                    <div className="w-8 h-8 bg-brand-900 border border-brand-700 rounded-full flex items-center justify-center text-brand-400 text-[10px] font-bold shrink-0">ME</div>
                    <div className="bg-brand-600 text-white p-3 rounded-lg rounded-tr-none text-xs shadow-md border border-brand-500">
                      Make flashcards for {typedText}<span className="animate-pulse">|</span>
                    </div>
                  </div>
                )}
                {(uiState === 'scanning' || uiState === 'results' || uiState === 'clicking_start') && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 bg-[#222] border border-white/5 rounded-full flex items-center justify-center text-neutral-400 shadow-sm shrink-0"><Brain size={14}/></div>
                    <div className="flex-1">
                      {uiState === 'scanning' ? (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 bg-[#222] border border-white/5 p-3 rounded-lg w-fit shadow-sm">
                          <span className="animate-spin text-brand-500"><RotateCw size={12}/></span> Scanning "Week 4 Modules"...
                        </div>
                      ) : (
                        <div className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden shadow-lg ring-1 ring-black/5 animate-fade-in-up w-full">
                          <div className="h-1 bg-green-500 w-full shadow-[0_0_10px_#22c55e]"></div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2 text-green-500 font-bold text-xs">
                              <CheckCircle2 size={14}/> Ready to Study
                            </div>
                            <p className="text-xs text-neutral-400 mb-4 font-medium">Generated 24 flashcards from your lecture slides.</p>
                            <button className={`w-full py-2 bg-white text-black rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-transform hover:bg-neutral-200 border-b-[3px] border-neutral-300 active:border-b-0 active:translate-y-[3px] ${uiState === 'clicking_start' ? 'scale-95' : ''}`}>
                              Open Deck <ArrowRight size={12}/>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Screen Deck */}
            {uiState === 'deck_active' && (
              <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-8 animate-fade-in">
                <div className="bg-[#111] w-full max-w-3xl h-[450px] rounded-lg shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10 animate-fade-in-up border border-white/5">
                  <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#151515]">
                    <div className="flex items-center gap-4">
                      <button onClick={handleReset} className="p-2 hover:bg-white/5 rounded-full text-neutral-400 transition-colors"><ChevronLeft size={20}/></button>
                      <div>
                        <div className="font-bold text-white text-sm">BIO 101: Week 4 Terms</div>
                        <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Flashcard Deck</div>
                      </div>
                    </div>
                    <span className="bg-brand-900/30 text-brand-400 px-3 py-1 rounded-sm text-[10px] font-bold border border-brand-500/20">24 Cards</span>
                  </div>
                  <div className="flex-1 bg-black p-10 flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    
                    <div onClick={() => setFlipped(!flipped)} className="w-full max-w-xl aspect-[16/9] relative perspective-1000 cursor-pointer">
                      <div className={`relative w-full h-full transition-transform duration-700 style-preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
                        <div className="absolute inset-0 bg-[#1a1a1a] rounded-lg shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] border border-white/10 backface-hidden flex flex-col items-center justify-center p-10 text-center hover:-translate-y-2 transition-all group border-b-[6px] border-black">
                          <span className="absolute top-6 left-6 text-xs font-bold text-neutral-600 uppercase tracking-widest border border-white/5 px-2 py-1 rounded-sm">Term</span>
                          <h3 className="text-4xl font-serif font-medium text-white group-hover:scale-105 transition-transform duration-500">Adenosine Triphosphate</h3>
                          <div className="absolute bottom-6 text-brand-500 text-xs font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                            Click to flip <RotateCw size={10}/>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 to-[#1a1a1a] rounded-lg shadow-[0_20px_50px_-10px_rgba(225,48,23,0.2)] border border-brand-500/30 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-12 text-center border-b-[6px] border-brand-950">
                          <span className="absolute top-6 left-6 text-xs font-bold text-brand-400 uppercase tracking-widest border border-brand-500/20 px-2 py-1 rounded-sm">Definition</span>
                          <p className="text-xl font-medium text-neutral-200 leading-relaxed">
                            The primary energy carrier in all living organisms on earth. 
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fake Cursor */}
            <div 
              className="absolute z-[60] pointer-events-none transition-all duration-500 drop-shadow-2xl"
              style={{
                bottom: uiState === 'clicking_start' ? '120px' : '80px',
                right: uiState === 'clicking_start' ? '220px' : '50px',
                opacity: (uiState === 'results' || uiState === 'clicking_start') ? 1 : 0,
                transform: uiState === 'clicking_start' ? 'scale(0.9)' : 'scale(1)'
              }}
            >
              <MousePointer2 fill="black" stroke="white" strokeWidth={2} size={32} />
            </div>

            {/* Trigger */}
            <div 
              onClick={() => setUiState('typing')}
              className={`absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-brand-500 to-orange-600 rounded-lg shadow-[0_0_30px_rgba(225,48,23,0.5)] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-all z-30 ring-4 ring-black border-b-[4px] border-orange-900 ${uiState === 'dashboard' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <Sparkles size={24} className="animate-pulse"/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
