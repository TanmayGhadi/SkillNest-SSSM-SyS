import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  ClipboardList, 
  BookOpen, 
  User, 
  LayoutDashboard, 
  Layers, 
  PlusCircle, 
  ShoppingBag, 
  Briefcase, 
  GraduationCap 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

export const MobileBottomNav: React.FC = () => {
  const { user, activityStats } = useAuth();
  const { mode, switchMode } = useMode();
  const location = useLocation();

  // Hide on certain full-screen workflows if needed (e.g. login/signup)
  const isAuthPage = location.pathname.startsWith('/login') || 
                     location.pathname.startsWith('/signup') || 
                     location.pathname.startsWith('/forgot-password') || 
                     location.pathname.startsWith('/reset-password');

  if (isAuthPage) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFDF9]/95 backdrop-blur-xl border-t border-[#ECE7DC] shadow-[0_-4px_20px_rgba(27,56,43,0.08)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {mode === 'student' ? (
          <>
            {/* Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-[#1B382B] bg-[#EFEAE0] scale-105'
                    : 'text-[#5C6A60] hover:text-[#1B382B]'
                }`
              }
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span>Home</span>
            </NavLink>

            {/* Services */}
            <NavLink
              to="/services"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-[#1B382B] bg-[#EFEAE0] scale-105'
                    : 'text-[#5C6A60] hover:text-[#1B382B]'
                }`
              }
            >
              <Search className="w-5 h-5 mb-0.5" />
              <span>Services</span>
            </NavLink>

            {/* My Requests (with badge) */}
            <NavLink
              to={user ? "/student/requests" : "/login"}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-[#1B382B] bg-[#EFEAE0] scale-105'
                    : 'text-[#5C6A60] hover:text-[#1B382B]'
                }`
              }
            >
              <ClipboardList className="w-5 h-5 mb-0.5" />
              <span>Requests</span>
              {activityStats.activeOrders > 0 && (
                <span className="absolute top-0.5 right-2 w-4 h-4 bg-[#B85D36] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {activityStats.activeOrders}
                </span>
              )}
            </NavLink>

            {/* Resources */}
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-[#1B382B] bg-[#EFEAE0] scale-105'
                    : 'text-[#5C6A60] hover:text-[#1B382B]'
                }`
              }
            >
              <BookOpen className="w-5 h-5 mb-0.5" />
              <span>Vault</span>
            </NavLink>

            {/* Profile */}
            <NavLink
              to={user ? "/profile" : "/login"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-[#1B382B] bg-[#EFEAE0] scale-105'
                    : 'text-[#5C6A60] hover:text-[#1B382B]'
                }`
              }
            >
              <User className="w-5 h-5 mb-0.5" />
              <span>Profile</span>
            </NavLink>
          </>
        ) : (
          <>
            {/* Freelancer Dashboard */}
            <NavLink
              to="/freelancer/dashboard"
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-[#1B382B] bg-[#EFEAE0] scale-105'
                    : 'text-[#5C6A60] hover:text-[#1B382B]'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Dashboard</span>
            </NavLink>

            {/* My Services */}
            <NavLink
              to="/freelancer/services"
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-[#1B382B] bg-[#EFEAE0] scale-105'
                    : 'text-[#5C6A60] hover:text-[#1B382B]'
                }`
              }
            >
              <Layers className="w-5 h-5 mb-0.5" />
              <span>My Gigs</span>
            </NavLink>

            {/* Create Service Action Button */}
            <NavLink
              to="/freelancer/services/new"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center -mt-3 p-2 bg-[#1B382B] text-white rounded-full shadow-lg transition-transform active:scale-95 ${
                  isActive ? 'ring-2 ring-[#C5DCCE]' : ''
                }`
              }
            >
              <PlusCircle className="w-6 h-6 text-[#E5ECE6]" />
            </NavLink>

            {/* Active Orders */}
            <NavLink
              to="/freelancer/orders"
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-[#1B382B] bg-[#EFEAE0] scale-105'
                    : 'text-[#5C6A60] hover:text-[#1B382B]'
                }`
              }
            >
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              <span>Orders</span>
              {activityStats.ordersReceived > 0 && (
                <span className="absolute top-0.5 right-2 w-4 h-4 bg-[#B85D36] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {activityStats.ordersReceived}
                </span>
              )}
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-[#1B382B] bg-[#EFEAE0] scale-105'
                    : 'text-[#5C6A60] hover:text-[#1B382B]'
                }`
              }
            >
              <User className="w-5 h-5 mb-0.5" />
              <span>Profile</span>
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};
