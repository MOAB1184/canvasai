'use client';

import React, { useState } from 'react';
import { FAQ_ITEMS } from '@/lib/constants';
import { ChevronDown } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-black w-full relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[80%] h-[100%] bg-red-600/50 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[60%] h-[80%] bg-red-700/40 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-brand-500/30 rounded-full blur-[100px] pointer-events-none"></div>
      </div>
      
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-12 tracking-tight">
          Frequently asked questions
        </h2>

        <div className="divide-y divide-neutral-800 border-t border-neutral-800">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="group">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="text-lg font-medium text-neutral-200 group-hover:text-brand-400 transition-colors">
                  {item.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-brand-400' : ''}`} 
                />
              </button>
              <div 
                className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <p className="text-neutral-400 leading-relaxed text-lg pr-8">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
