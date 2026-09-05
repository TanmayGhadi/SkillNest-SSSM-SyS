import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { BecomeFreelancerModal } from './BecomeFreelancerModal';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  MessageSquare, 
  Bell, 
  PlusCircle, 
  Search,
  ChevronDown,
  ShoppingBag,
  Clock,
  Heart,
  Settings,
  Star,
  CheckCircle2,
  Layers
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, activityStats, logout, isAdmin, isFreelancer } = useAuth();
  const { mode, switchMode } = useMode();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFreelancerModalOpen, setIsFreelancerModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeSwitch = (newMode: 'student' | 'freelancer') => {
    if (newMode === 'freelancer' && !isFreelancer) {
      setIsFreelancerModalOpen(true);
      return;
    }
    switchMode(newMode);
    if (newMode === 'freelancer') {
      navigate('/freelancer/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FBF9F4]/95 backdrop-blur-md border-b border-[#ECE7DC] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Brand Identity */}
            <div className="flex items-center gap-5">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-[#1B382B] flex items-center justify-center text-[#E5ECE6] shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-2xl font-bold tracking-tight text-[#1B382B]">
                      SkillNest
                    </span>
                    <span className="bg-[#EAE5D8] text-[#1B382B] text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#DCD3C1]">
                      GPM
                    </span>
                  </div>
                  <span className="text-[10px] text-[#717E73] block uppercase tracking-wider font-semibold -mt-0.5 font-sans">
                    Govt. Polytechnic Malvan
                  </span>
                </div>
              </Link>

              {/* Dual Mode Switcher Pill */}
              {user && (
                <div className="hidden md:flex items-center p-1 bg-[#EFEAE0] rounded-full border border-[#E0D8C8]">
                  <button
                    onClick={() => handleModeSwitch('student')}
                    className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                      mode === 'student'
                        ? 'bg-[#1B382B] text-[#FBF9F4] shadow-sm'
                        : 'text-[#4A5E4F] hover:text-[#1B382B]'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Student
                  </button>
                  <button
                    onClick={() => handleModeSwitch('freelancer')}
                    className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                      mode === 'freelancer'
                        ? 'bg-[#1B382B] text-[#FBF9F4] shadow-sm'
                        : 'text-[#4A5E4F] hover:text-[#1B382B]'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Freelancer
                    {!isFreelancer && (
                      <span className="bg-[#B85D36] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">New</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {mode === 'student' ? (
                <>
                  <Link 
                    to="/" 
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                      isActive('/') ? 'text-[#1B382B] bg-[#EFEAE0] font-semibold' : 'text-[#4A5E4F] hover:text-[#1B382B] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/services" 
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                      isActive('/services') ? 'text-[#1B382B] bg-[#EFEAE0] font-semibold' : 'text-[#4A5E4F] hover:text-[#1B382B] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    Services
                  </Link>
                  <Link 
                    to="/resources" 
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                      isActive('/resources') ? 'text-[#1B382B] bg-[#EFEAE0] font-semibold' : 'text-[#4A5E4F] hover:text-[#1B382B] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    Resources
                  </Link>
                  <Link 
                    to="/freelancers" 
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                      isActive('/freelancers') ? 'text-[#1B382B] bg-[#EFEAE0] font-semibold' : 'text-[#4A5E4F] hover:text-[#1B382B] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    Students
                  </Link>
                  <Link 
                    to="/about" 
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                      isActive('/about') ? 'text-[#1B382B] bg-[#EFEAE0] font-semibold' : 'text-[#4A5E4F] hover:text-[#1B382B] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    About
                  </Link>
                  {user && (
                    <Link 
                      to="/student/requests" 
                      className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                        isActive('/student/requests') ? 'text-[#1B382B] bg-[#EFEAE0] font-semibold' : 'text-[#4A5E4F] hover:text-[#1B382B] hover:bg-[#F3EFE6]'
                      }`}
                    >
                      My Requests
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link 
                    to="/freelancer/dashboard" 
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                      isActive('/freelancer/dashboard') ? 'text-[#1B382B] bg-[#EFEAE0] font-semibold' : 'text-[#4A5E4F] hover:text-[#1B382B] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/freelancer/services" 
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                      isActive('/freelancer/services') ? 'text-[#1B382B] bg-[#EFEAE0] font-semibold' : 'text-[#4A5E4F] hover:text-[#1B382B] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    My Services
                  </Link>
                  <Link 
                    to="/freelancer/orders" 
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                      isActive('/freelancer/orders') ? 'text-[#1B382B] bg-[#EFEAE0] font-semibold' : 'text-[#4A5E4F] hover:text-[#1B382B] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    Active Orders
                  </Link>
                  <Link 
                    to="/freelancer/services/new" 
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold bg-[#EFEAE0] text-[#1B382B] hover:bg-[#E3DCCE] transition"
                  >
                    <PlusCircle className="w-4 h-4 text-[#2D5A43]" />
                    Create Service
                  </Link>
                </>
              )}
            </nav>

            {/* Right Side: Search / Notifications / Authenticated User / Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/services"
                className="p-2 text-[#4A5E4F] hover:text-[#1B382B] rounded-full hover:bg-[#EFEAE0] transition"
                title="Search SkillNest"
              >
                <Search className="w-5 h-5" />
              </Link>

              {user ? (
                <>
                  <Link 
                    to="/messages" 
                    className="p-2 text-[#4A5E4F] hover:text-[#1B382B] rounded-full hover:bg-[#EFEAE0] transition relative"
                    title="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  <Link 
                    to="/notifications" 
                    className="p-2 text-[#4A5E4F] hover:text-[#1B382B] rounded-full hover:bg-[#EFEAE0] transition relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {activityStats.unreadNotificationsCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#B85D36] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {activityStats.unreadNotificationsCount}
                      </span>
                    )}
                  </Link>

                  {/* Authenticated User Header Section & Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 bg-[#EFEAE0] hover:bg-[#E3DCCE] border border-[#DDD5C5] rounded-full transition-all group"
                      title="User Account Menu"
                    >
                      {/* User Avatar / Initials Placeholder */}
                      <div className="w-8 h-8 rounded-full bg-[#1B382B] text-[#FBF9F4] flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}</span>
                        )}
                      </div>

                      {/* Header User Identity Details */}
                      <div className="text-left hidden sm:block max-w-[140px] leading-tight">
                        <p className="text-xs font-bold text-[#1B382B] truncate">
                          {profile?.full_name || 'GPM Student'}
                        </p>
                        <p className="text-[10px] text-[#717E73] truncate">
                          {profile?.department || 'Government Polytechnic Malvan'}
                        </p>
                      </div>

                      <ChevronDown className={`w-3.5 h-3.5 text-[#717E73] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Enhanced User Profile Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-[#FFFDF9] border border-[#ECE7DC] rounded-3xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                        
                        {/* Profile Header Block */}
                        <div className="px-5 py-4 border-b border-[#ECE7DC] text-center space-y-2 bg-[#FBF9F4]">
                          {/* Centered Large Profile Photo */}
                          <div className="w-16 h-16 rounded-full bg-[#1B382B] text-[#FBF9F4] mx-auto flex items-center justify-center font-serif text-2xl font-bold border-2 border-[#DDD5C5] shadow-sm overflow-hidden">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}</span>
                            )}
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-base text-[#1B382B] truncate">
                              {profile?.full_name || 'GPM Student'}
                            </h4>
                            <p className="text-xs text-[#5C6A60] truncate">
                              {profile?.department || 'Government Polytechnic Malvan'}
                            </p>
                            <p className="text-[11px] font-mono text-[#2D5A43] font-semibold mt-0.5">
                              Student ID: {profile?.enrollment_no || 'GPM-Pending'}
                            </p>
                          </div>

                          {/* Current Mode Indicator Pill */}
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5ECE6] text-[#2D5A43] text-[11px] font-bold border border-[#C5DCCE]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A43] animate-pulse" />
                              {mode === 'student' ? 'Student Mode' : 'Freelancer Mode'}
                            </span>
                          </div>
                        </div>

                        {/* User Mini Activity Summary (Live Database Calculated) */}
                        <div className="px-5 py-3 border-b border-[#ECE7DC] space-y-2.5 bg-white">
                          
                          {/* Profile Completion Bar */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#1B382B] mb-1">
                              <span>Profile Completion</span>
                              <span className="text-[#2D5A43]">{activityStats.profileCompletion}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#EFEAE0] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#2D5A43] rounded-full transition-all duration-500" 
                                style={{ width: `${activityStats.profileCompletion}%` }}
                              />
                            </div>
                          </div>

                          {/* Live Student Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                            <div className="bg-[#FBF9F4] p-2 rounded-xl border border-[#ECE7DC]">
                              <p className="font-serif font-bold text-sm text-[#1B382B]">{activityStats.ordersGiven}</p>
                              <p className="text-[10px] text-[#717E73]">Orders Given</p>
                            </div>
                            <div className="bg-[#FBF9F4] p-2 rounded-xl border border-[#ECE7DC]">
                              <p className="font-serif font-bold text-sm text-[#2D5A43]">{activityStats.activeOrders}</p>
                              <p className="text-[10px] text-[#717E73]">Active</p>
                            </div>
                            <div className="bg-[#FBF9F4] p-2 rounded-xl border border-[#ECE7DC]">
                              <p className="font-serif font-bold text-sm text-[#1B382B]">{activityStats.completedOrders}</p>
                              <p className="text-[10px] text-[#717E73]">Completed</p>
                            </div>
                          </div>

                          {/* Live Freelancer Stats (if user has activated freelancer profile) */}
                          {isFreelancer && (
                            <div className="pt-2 border-t border-[#ECE7DC] grid grid-cols-4 gap-1.5 text-center">
                              <div className="bg-[#FEFDE8] p-1.5 rounded-lg border border-[#F6EAA8]">
                                <p className="font-bold text-xs text-[#1B382B]">{activityStats.activeGigs}</p>
                                <p className="text-[9px] text-[#717E73]">Gigs</p>
                              </div>
                              <div className="bg-[#FEFDE8] p-1.5 rounded-lg border border-[#F6EAA8]">
                                <p className="font-bold text-xs text-[#1B382B]">{activityStats.ordersReceived}</p>
                                <p className="text-[9px] text-[#717E73]">Received</p>
                              </div>
                              <div className="bg-[#FEFDE8] p-1.5 rounded-lg border border-[#F6EAA8]">
                                <p className="font-bold text-xs text-[#1B382B]">{activityStats.completedGigs}</p>
                                <p className="text-[9px] text-[#717E73]">Done</p>
                              </div>
                              <div className="bg-[#FEFDE8] p-1.5 rounded-lg border border-[#F6EAA8]">
                                <p className="font-bold text-xs text-[#B7950B]">{activityStats.rating > 0 ? activityStats.rating.toFixed(1) : 'New'} ★</p>
                                <p className="text-[9px] text-[#717E73]">Rating</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Navigation Links */}
                        <div className="py-2 text-xs font-medium text-[#1B382B] space-y-0.5">
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-2 hover:bg-[#F3EFE6] transition"
                          >
                            <User className="w-4 h-4 text-[#2D5A43]" />
                            <span>Profile</span>
                          </Link>

                          <Link
                            to="/student/requests"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-2 hover:bg-[#F3EFE6] transition"
                          >
                            <ShoppingBag className="w-4 h-4 text-[#2D5A43]" />
                            <span>My Orders</span>
                          </Link>

                          <Link
                            to="/student/requests"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-2 hover:bg-[#F3EFE6] transition"
                          >
                            <Clock className="w-4 h-4 text-[#2D5A43]" />
                            <span>My Requests</span>
                          </Link>

                          {isFreelancer ? (
                            <>
                              <Link
                                to="/freelancer/services"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 px-5 py-2 hover:bg-[#F3EFE6] transition"
                              >
                                <Layers className="w-4 h-4 text-[#2D5A43]" />
                                <span>My Services</span>
                              </Link>
                              <Link
                                to="/freelancer/dashboard"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 px-5 py-2 hover:bg-[#F3EFE6] transition"
                              >
                                <Briefcase className="w-4 h-4 text-[#2D5A43]" />
                                <span>Freelancer Dashboard</span>
                              </Link>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                setIsFreelancerModalOpen(true);
                              }}
                              className="w-full text-left flex items-center gap-3 px-5 py-2 text-[#B85D36] hover:bg-[#FBF2EC] transition font-semibold"
                            >
                              <Briefcase className="w-4 h-4 text-[#B85D36]" />
                              <span>Become a Freelancer</span>
                            </button>
                          )}

                          <Link
                            to="/notifications"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center justify-between px-5 py-2 hover:bg-[#F3EFE6] transition"
                          >
                            <div className="flex items-center gap-3">
                              <Bell className="w-4 h-4 text-[#2D5A43]" />
                              <span>Notifications</span>
                            </div>
                            {activityStats.unreadNotificationsCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-[#B85D36] text-white text-[10px] font-bold">
                                {activityStats.unreadNotificationsCount}
                              </span>
                            )}
                          </Link>

                          <Link
                            to="/services?saved=true"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center justify-between px-5 py-2 hover:bg-[#F3EFE6] transition"
                          >
                            <div className="flex items-center gap-3">
                              <Heart className="w-4 h-4 text-[#2D5A43]" />
                              <span>Saved Services</span>
                            </div>
                            {activityStats.savedServicesCount > 0 && (
                              <span className="text-[11px] text-[#717E73] font-semibold">
                                {activityStats.savedServicesCount}
                              </span>
                            )}
                          </Link>

                          <Link
                            to="/settings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-2 hover:bg-[#F3EFE6] transition"
                          >
                            <Settings className="w-4 h-4 text-[#2D5A43]" />
                            <span>Settings</span>
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-5 py-2 text-[#B85D36] font-semibold hover:bg-[#FBF2EC] transition"
                            >
                              <ShieldCheck className="w-4 h-4 text-[#B85D36]" />
                              <span>GPM Admin Panel</span>
                            </Link>
                          )}
                        </div>

                        {/* Sign Out Action */}
                        <div className="border-t border-[#ECE7DC] pt-2 px-2">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                              navigate('/login');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    to="/login" 
                    className="text-xs font-semibold text-[#1B382B] hover:text-[#2D5A43] px-3.5 py-2 rounded-full hover:bg-[#EFEAE0] transition"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="text-xs font-semibold bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] px-4.5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Join SkillNest
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-[#1B382B] rounded-full hover:bg-[#EFEAE0] transition"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#ECE7DC] bg-[#FBF9F4] px-4 pt-3 pb-6 space-y-2">
            {user && (
              <div className="flex items-center gap-2 p-1.5 bg-[#EFEAE0] rounded-full mb-3">
                <button
                  onClick={() => handleModeSwitch('student')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition ${
                    mode === 'student' ? 'bg-[#1B382B] text-[#FBF9F4] shadow' : 'text-[#4A5E4F]'
                  }`}
                >
                  Student Mode
                </button>
                <button
                  onClick={() => handleModeSwitch('freelancer')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition ${
                    mode === 'freelancer' ? 'bg-[#1B382B] text-[#FBF9F4] shadow' : 'text-[#4A5E4F]'
                  }`}
                >
                  Freelancer Mode
                </button>
              </div>
            )}

            {mode === 'student' ? (
              <>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#1B382B]">Home</Link>
                <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#1B382B]">Explore Services</Link>
                <Link to="/resources" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#1B382B]">Academic Resources</Link>
                <Link to="/freelancers" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#1B382B]">Student Freelancers</Link>
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#1B382B]">About SkillNest</Link>
                {user && <Link to="/student/requests" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#1B382B]">My Requests</Link>}
              </>
            ) : (
              <>
                <Link to="/freelancer/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#1B382B]">Freelancer Dashboard</Link>
                <Link to="/freelancer/services" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#1B382B]">My Services</Link>
                <Link to="/freelancer/services/new" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#1B382B]">Create Service</Link>
                <Link to="/freelancer/orders" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#1B382B]">Active Orders</Link>
              </>
            )}

            <div className="pt-3 border-t border-[#ECE7DC] flex flex-col gap-2">
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-[#5C6A60]">Contact GPM Campus</Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-[#B85D36] font-semibold">
                  GPM Faculty Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Freelancer Onboarding Modal */}
      <BecomeFreelancerModal 
        isOpen={isFreelancerModalOpen} 
        onClose={() => setIsFreelancerModalOpen(false)} 
      />
    </>
  );
};
