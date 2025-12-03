'use client';

import React, { useState } from 'react';
import { PRICING_DATA } from '@/lib/constants';
import { Check, User, GraduationCap, School } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'schools'>('students');

  const currentData = PRICING_DATA[activeTab];
  const itemCount = currentData.length;

  const gridColsClass = 
    itemCount === 4 ? 'lg:grid-cols-4' :
    itemCount === 3 ? 'lg:grid-cols-3' :
    itemCount === 2 ? 'lg:grid-cols-2' : 
    'lg:grid-cols-1';

  const maxWidthClass = itemCount === 4 ? 'max-w-[90rem]' : 'max-w-6xl';

  const handlePlanClick = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div id="pricing" className="min-h-screen bg-black pt-32 pb-24 font-sans selection:bg-brand-200 relative overflow-hidden">
          
          {/* Background Gradients */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] right-[-10%] w-[70%] h-[70%] bg-red-600/70 rounded-full blur-[150px] animate-pulse-slow mix-blend-screen"></div>
            <div className="absolute bottom-[10%] left-[10%] w-[70%] h-[70%] bg-red-700/70 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
            <div className="absolute top-[40%] left-[30%] w-[50%] h-[50%] bg-brand-900/60 rounded-full blur-[100px] mix-blend-screen"></div>
          </div>

          <div className="max-w-full mx-auto px-6 relative z-10">
            
            {/* Header Section */}
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="flex items-center justify-center gap-4 mb-6">
                <h1 className="text-5xl md:text-6xl font-semibold text-white tracking-tighter">
                  Start learning.
                </h1>
              </div>
              
              <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed mb-12">
                Select a plan to get started instantly.
              </p>

              {/* Toggle Tabs */}
              <div className="inline-flex bg-neutral-900 p-2 rounded-lg mb-20 shadow-inner border border-neutral-800 overflow-x-auto max-w-full border-b-[4px] border-black">
                <button 
                  onClick={() => setActiveTab('students')}
                  className={`px-6 md:px-8 py-2.5 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'students' ? 'bg-brand-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}
                >
                  <User size={16} />
                  Students
                </button>
                <button 
                  onClick={() => setActiveTab('teachers')}
                  className={`px-6 md:px-8 py-2.5 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'teachers' ? 'bg-brand-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}
                >
                  <GraduationCap size={16} />
                  Teachers
                </button>
                <button 
                  onClick={() => setActiveTab('schools')}
                  className={`px-6 md:px-8 py-2.5 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'schools' ? 'bg-brand-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}
                >
                  <School size={16} />
                  Schools
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className={`grid grid-cols-1 ${gridColsClass} gap-6 ${maxWidthClass} mx-auto items-stretch justify-center mb-32`}>
              {currentData.map((tier, index) => {
                const isContact = tier.price === "Contact";
                const isFree = tier.price === "$0" || tier.price === "Free";
                const isWaitlist = tier.buttonText === "Join Waitlist";
                
                return (
                  <div 
                    key={tier.name}
                    className={`flex flex-col bg-neutral-900/60 backdrop-blur-md rounded-lg p-6 md:p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_32px_64px_-12px_rgba(225,48,23,0.25)] transition-all duration-300 border border-neutral-800 relative overflow-hidden group hover:-translate-y-2 hover:bg-neutral-900/80 border-b-[8px] border-b-black`}
                  >
                    {tier.highlighted && (
                      <div className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg z-10 shadow-sm border-b border-l border-brand-700">
                        POPULAR
                      </div>
                    )}

                    {/* Header Section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">{tier.name}</h3>
                      
                      <div className="flex items-baseline gap-1.5 h-16">
                        {isContact ? (
                          <span className="text-4xl md:text-[3.5rem] leading-none font-bold tracking-tight text-white">Contact</span>
                        ) : isFree ? (
                          <span className="text-4xl md:text-[3.5rem] leading-none font-bold tracking-tight text-white">Free</span>
                        ) : (
                          <>
                            <span className="text-4xl md:text-[3.5rem] leading-none font-bold tracking-tight text-white">{tier.price}</span>
                            <span className="text-lg text-neutral-500 font-medium">/ mo</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mb-6">
                      <button 
                        onClick={handlePlanClick}
                        className={`w-full rounded-md py-3.5 font-medium text-[14px] transition-all shadow-lg border-b-[4px] active:border-b-0 active:translate-y-1 ${isWaitlist ? 'bg-neutral-800 border-neutral-950 text-white hover:bg-neutral-700' : 'bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-200 shadow-white/10'}`}
                      >
                        {isWaitlist ? "Start Free Trial" : tier.buttonText} 
                      </button>
                    </div>

                    <p className="text-neutral-400 text-[14px] font-normal mb-8 min-h-[24px]">
                      {tier.description}
                    </p>

                    {/* Divider */}
                    <div className="h-px bg-neutral-800 w-full mb-8"></div>

                    {/* Features List */}
                    <div className="flex-grow">
                      <ul className="space-y-4">
                        {tier.features.map((feature, i) => {
                          const isHeader = feature.startsWith("Everything");
                          return (
                            <li key={i} className="flex items-start gap-3 text-[14px]">
                              {!isHeader && (
                                <div className="mt-0.5 shrink-0 text-brand-500">
                                  <Check size={16} strokeWidth={2.5} />
                                </div>
                              )}
                              <span className={`${isHeader ? 'font-bold text-white block w-full -ml-0 mb-1' : 'text-neutral-300 font-medium'}`}>
                                {feature}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
