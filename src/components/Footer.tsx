import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Shield, ExternalLink, Heart } from 'lucide-react';
import { GPM_DEPARTMENTS } from '../types/database';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#14261C] text-[#D0DCD2] border-t border-[#233B2D] mt-auto">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2D5A43] flex items-center justify-center text-[#FBF9F4] font-bold">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#FBF9F4]">
                SkillNest
              </span>
            </div>
            
            <p className="font-handwriting text-xl text-[#A7C1A9] italic">
              “By GPM Students, For GPM Students.”
            </p>

            <p className="text-xs text-[#9BB19E] leading-relaxed max-w-sm">
              Student Skill and Service Management System (SSSM) — an exclusive, peer-to-peer technical exchange and MSBTE academic resource platform for the diploma community of Government Polytechnic Malvan.
            </p>

            <div className="pt-2 text-xs text-[#7E9681] space-y-1">
              <p>MSBTE Institute Code: <strong className="text-[#FBF9F4]">0015</strong> &bull; DTE Code: <strong className="text-[#FBF9F4]">3011</strong></p>
              <p>Approved by AICTE, New Delhi &bull; Directorate of Technical Education, Maharashtra</p>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#FBF9F4] tracking-wide">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#A7C1A9]">
              <li><Link to="/services" className="hover:text-[#FBF9F4] transition">Explore Services</Link></li>
              <li><Link to="/freelancers" className="hover:text-[#FBF9F4] transition">Student Freelancers</Link></li>
              <li><Link to="/resources" className="hover:text-[#FBF9F4] transition">MSBTE Resources</Link></li>
              <li><Link to="/about" className="hover:text-[#FBF9F4] transition">About SkillNest</Link></li>
              <li><Link to="/contact" className="hover:text-[#FBF9F4] transition">Campus Support</Link></li>
            </ul>
          </div>

          {/* Departments */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#FBF9F4] tracking-wide">
              GPM Departments
            </h4>
            <ul className="space-y-2 text-xs text-[#A7C1A9]">
              {GPM_DEPARTMENTS.slice(0, 5).map((dept) => (
                <li key={dept}>
                  <Link to={`/services?dept=${encodeURIComponent(dept)}`} className="hover:text-[#FBF9F4] transition">
                    {dept}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/services" className="text-[#65A30D] hover:underline">
                  +3 More Departments
                </Link>
              </li>
            </ul>
          </div>

          {/* Official College Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#FBF9F4] tracking-wide">
              Campus Office
            </h4>
            <div className="space-y-3 text-xs text-[#9BB19E]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#A7C1A9] shrink-0 mt-0.5" />
                <p>
                  A/P Kumbharmath, Taluka Malvan,<br />
                  District Sindhudurg,<br />
                  Maharashtra &ndash; 416606
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#A7C1A9] shrink-0" />
                <span>02365 252223</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#A7C1A9] shrink-0" />
                <span className="truncate">office.gpmalvan@dtemaharashtra.gov.in</span>
              </div>

              <div className="pt-2">
                <a 
                  href="https://www.gpmalvan.co.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#A7C1A9] hover:text-[#FBF9F4] transition bg-[#1E3526] px-3 py-1.5 rounded-full border border-[#2D4F37]"
                >
                  <Globe className="w-3.5 h-3.5" /> Official GPM Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#233B2D] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7E9681]">
          <p>
            &copy; {new Date().getFullYear()} SkillNest &bull; Government Polytechnic Malvan (Est. 1985). All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-[#FBF9F4] transition">Academic Integrity</Link>
            <Link to="/contact" className="hover:text-[#FBF9F4] transition">Privacy & Conduct</Link>
            <span className="flex items-center gap-1 text-[#A7C1A9]">
              Crafted with <Heart className="w-3.5 h-3.5 text-[#B85D36] fill-[#B85D36]" /> for GPM Malvan
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
