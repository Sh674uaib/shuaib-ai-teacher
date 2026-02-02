
import React from 'react';
import { X, Bot, User, Award, BookOpen, Heart, Github, Linkedin, ExternalLink, Code, Lightbulb, Zap, Quote, Target, Star, CheckCircle2, Facebook, Instagram, AtSign } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-100">
              <Bot className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">আমাদের সম্পর্কে</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-12 custom-scrollbar">
          
          {/* Section 1: About Shuaib 2.0 */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-emerald-600 border-b-2 border-emerald-100 pb-2 w-fit">
              <BookOpen size={20} />
              <h3 className="font-black uppercase tracking-widest text-sm">About Shuaib 2.0 – AI Teacher</h3>
            </div>
            
            <div className="space-y-6">
              {/* Introduction */}
              <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl">
                <h4 className="font-black text-emerald-800 mb-2 flex items-center gap-2">
                  <Star size={18} /> পরিচিতি (Introduction)
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium text-sm">
                  Shuaib 2.0 হলো একজন স্মার্ট AI শিক্ষক, যা বিশেষভাবে Class 6–10 এর শিক্ষার্থীদের জন্য তৈরি করা হয়েছে। এটি শিক্ষার্থীদের কঠিন বিষয়গুলোকে সহজ, ধাপে ধাপে এবং বাস্তব শিক্ষক-শৈলীতে শেখানোর জন্য ডিজাইন করা হয়েছে।
                </p>
              </div>

              {/* Mission & Vision */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-2">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <Target size={16} className="text-rose-500" /> উদ্দেশ্য (Mission)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Shuaib 2.0-এর লক্ষ্য হলো শিক্ষার্থীদের কেবল উত্তর মুখস্থ করানো নয়, বরং ধাপে ধাপে বোঝানো, লজিক তৈরি করা এবং আত্মবিশ্বাস বৃদ্ধি করা।
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-2">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <Lightbulb size={16} className="text-amber-500" /> ভবিষ্যৎ লক্ষ্য (Vision)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    দীর্ঘমেয়াদে Shuaib 2.0 শিক্ষার্থীদের জন্য এমন একটি সহায়ক সিস্টেম তৈরি করবে, যা শিক্ষাকে আরও সহজ, আনন্দদায়ক এবং কার্যকরী করবে।
                  </p>
                </div>
              </div>

              {/* Teaching Style & Key Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide px-1">শিক্ষাদানের ধরণ (Teaching Style)</h4>
                  <ul className="space-y-2">
                    {[
                      "Teacher-like Explanation: কঠিন বিষয় সহজ ভাষায় বোঝানো",
                      "Step-by-Step Learning: ধাপে ধাপে সমাধান প্রদর্শন",
                      "Hint-Based Help: সরাসরি উত্তর নয়, চিন্তা করার সুযোগ",
                      "Concept-First Approach: বোঝার উপর বেশি জোর"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide px-1">মূল বৈশিষ্ট্য (Key Features)</h4>
                  <ul className="space-y-2">
                    {[
                      "২৪/৭ AI Teacher",
                      "পরীক্ষা ও বোর্ড-ফোকাসড সমাধান",
                      "সহজ বাংলা ও English সমন্বিত ভাষা",
                      "User-friendly এবং interactive"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600">
                        <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: About Inventor */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 border-b-2 border-indigo-100 pb-2 w-fit">
              <User size={20} />
              <h3 className="font-black uppercase tracking-widest text-sm">About Inventor</h3>
            </div>
            
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-[2rem] flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left shadow-sm">
                <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100 shrink-0 transform rotate-3">
                  <User className="text-white w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Md. Shuaib Ahmed</h4>
                    <p className="text-indigo-600 font-bold text-sm tracking-wide">Inventor of Shuaib 2.0 AI</p>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm font-medium">
                    Md. Shuaib Ahmed একজন উদ্ভাবনী শিক্ষার্থী ও প্রযুক্তি প্রেমী, যিনি Shuaib 2.0 AI Teacher তৈরি করেছেন। তিনি শিক্ষার্থীদের জন্য এমন একটি AI ডিজিটাল শিক্ষক বানাতে চান, যা কঠিন বিষয়গুলোকে সহজ, ধাপে ধাপে এবং কার্যকরভাবে শেখায়।
                  </p>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <Zap size={18} className="text-amber-500" />
                    Skills & Expertise
                  </div>
                  <ul className="space-y-2">
                    {[
                      { icon: <Code size={14} />, text: "Coding & AI Development" },
                      { icon: <Zap size={14} />, text: "Graphic Design" },
                      { icon: <Lightbulb size={14} />, text: "Problem Solving & Innovation" }
                    ].map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <span className="text-indigo-500">{s.icon}</span>
                        {s.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 bg-emerald-50/30 border border-emerald-100 rounded-[2rem] space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <Lightbulb size={18} className="text-emerald-500" />
                    Vision
                  </div>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    তার লক্ষ্য হলো শিক্ষার্থীদের শুধু উত্তর শেখানো নয়, বরং বোঝার ক্ষমতা বৃদ্ধি করা এবং আত্মবিশ্বাস তৈরি করা।
                  </p>
                </div>
              </div>

              {/* Quote Section */}
              <div className="relative p-8 bg-indigo-600 rounded-[2rem] overflow-hidden shadow-xl shadow-indigo-100">
                <div className="absolute top-4 left-4 opacity-20 text-white">
                  <Quote size={40} />
                </div>
                <div className="text-center space-y-2 relative z-10">
                  <p className="text-white italic font-semibold leading-relaxed">
                    “Shuaib 2.0-কে আমি তৈরি করেছি যাতে শিক্ষার্থীরা সহজে বোঝে, আত্মবিশ্বাসী হয় এবং সৃজনশীলভাবে চিন্তা করতে শেখে।”
                  </p>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">— Md. Shuaib Ahmed</p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Social Links Box (Matching screenshot highlight) */}
              <div className="flex justify-center pt-2">
                <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl flex flex-wrap items-center justify-center gap-6 shadow-sm">
                  <a href="https://www.facebook.com/profile.php?id=61584072073798" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <Facebook size={14} /> Facebook
                  </a>
                  <a href="https://www.instagram.com/shuaib4hmed/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-pink-600 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <Instagram size={14} /> Instagram
                  </a>
                  <a href="https://www.linkedin.com/in/shuaib-undefined-6828973a6/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <Linkedin size={14} /> Linkedin
                  </a>
                  <a href="https://www.threads.com/@shuaib4hmed" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors text-[10px] font-black uppercase tracking-widest">
                    <AtSign size={14} /> Threads
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            &copy; 2026 Shuaib 2.0 AI - Developed by Md. Shuaib Ahmed
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
