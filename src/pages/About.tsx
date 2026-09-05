import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  Award,
  ArrowRight,
  BookOpen,
  Anchor,
  Heart,
  Users
} from 'lucide-react';
import { GPM_DEPARTMENTS } from '../types/database';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="bg-[#1B382B] text-[#FBF9F4] rounded-3xl p-8 sm:p-14 relative overflow-hidden text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2D5A43] text-[#E5ECE6] text-xs font-semibold mb-6 border border-[#3E6E50]">
          <span className="w-2 h-2 rounded-full bg-[#E5ECE6] animate-pulse" />
          Government Polytechnic Malvan &bull; Established 1985
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          About SkillNest
        </h1>
        <p className="font-handwriting text-2xl text-[#A7C1A9] mt-3">
          “By GPM Students, For GPM Students.”
        </p>
        <p className="text-sm sm:text-base text-[#D0DCD2] max-w-2xl mx-auto mt-4 leading-relaxed font-sans">
          SkillNest (Student Skill and Service Management System) is an institutional peer-to-peer technical exchange platform created specifically for students of Government Polytechnic Malvan (GPM Malvan), affiliated with the Maharashtra State Board of Technical Education (MSBTE).
        </p>
      </div>

      {/* College Identity & Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-8 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#EFEAE0] text-[#1B382B] flex items-center justify-center border border-[#DDD5C5]">
            <Target className="w-6 h-6 text-[#2D5A43]" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1B382B]">Institutional Mission</h3>
          <p className="text-xs sm:text-sm text-[#5C6A60] leading-relaxed">
            To provide diploma students of Konkan with a practical, collaborative digital ecosystem to practice real engineering problem-solving, monetize specialized skills, and foster peer-learning.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-8 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2E9] text-[#B85D36] flex items-center justify-center border border-[#F6D7C3]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1B382B]">Academic Integrity</h3>
          <p className="text-xs sm:text-sm text-[#5C6A60] leading-relaxed">
            Every service, project mentorship, and academic document respects MSBTE guidelines. Deliverables emphasize guidance, conceptual clarity, code explanations, and structured drafting.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-8 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#E5ECE6] text-[#2D5A43] flex items-center justify-center border border-[#C5DCCE]">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1B382B]">Konkan Regional Impact</h3>
          <p className="text-xs sm:text-sm text-[#5C6A60] leading-relaxed">
            Connecting coastal Maharashtra’s diploma students with modern digital freelancing skills, preparing them for industry certifications and higher collegiate technical careers.
          </p>
        </div>
      </div>

      {/* Campus Details */}
      <div className="bg-[#F6F2E9] rounded-3xl p-8 sm:p-12 border border-[#ECE7DC] space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold text-[#2D5A43] uppercase tracking-wider">Campus Roots</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B382B]">
            Government Polytechnic Malvan (MSBTE Code: 0015 &bull; DTE Code: 3011)
          </h2>
          <p className="text-sm text-[#5C6A60] leading-relaxed">
            Established in 1985 in Kumbharmath, Malvan in the Sindhudurg district of Maharashtra, Government Polytechnic Malvan has trained generations of diploma engineers across disciplines. Approved by AICTE, New Delhi and DTE Maharashtra, the institute is affiliated to the Maharashtra State Board of Technical Education (MSBTE).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#ECE7DC]">
          <div>
            <p className="font-serif text-2xl font-bold text-[#1B382B]">1985</p>
            <p className="text-xs text-[#717E73]">Year Established</p>
          </div>
          <div>
            <p className="font-serif text-2xl font-bold text-[#1B382B]">0015</p>
            <p className="text-xs text-[#717E73]">MSBTE Code</p>
          </div>
          <div>
            <p className="font-serif text-2xl font-bold text-[#1B382B]">8</p>
            <p className="text-xs text-[#717E73]">Departments & Wings</p>
          </div>
          <div>
            <p className="font-serif text-2xl font-bold text-[#1B382B]">100%</p>
            <p className="text-xs text-[#717E73]">GPM Student Driven</p>
          </div>
        </div>
      </div>

      {/* Official Departments */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B382B]">
            Official Engineering Departments
          </h3>
          <p className="text-xs sm:text-sm text-[#5C6A60]">
            SkillNest caters to all academic streams at Government Polytechnic Malvan.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {GPM_DEPARTMENTS.map((dept) => (
            <div key={dept} className="bg-white rounded-2xl border border-[#ECE7DC] p-5 text-center shadow-sm">
              <h4 className="font-semibold text-xs sm:text-sm text-[#1B382B]">{dept}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B382B]">
          Ready to join fellow Malvan peers?
        </h3>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs transition-all shadow-sm"
          >
            Create Your Account <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white border border-[#DDD5C5] text-[#1B382B] hover:bg-[#F3EFE6] font-semibold text-xs transition-all"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
};
