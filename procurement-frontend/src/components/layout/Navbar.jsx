import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout, switchRole, isAdmin } = useAuth();
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  const checkBackendHealth = async () => {
    setBackendStatus('checking');
    try {
      // Test ping to backend department endpoint
      await api.get('/department', { timeout: 3000 });
      setBackendStatus('online');
    } catch (err) {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Internship Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-brand-600 to-indigo-500 p-2.5 rounded-xl shadow-md text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight m-0">Smart Procurement</h1>
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold border border-indigo-200">
                  PO Management
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Infosys Springboard Virtual Internship 7.0 | Batch-2</p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            
            {/* Live Backend Connection Indicator */}
            <button 
              onClick={checkBackendHealth}
              title="Click to re-check Spring Boot Backend connection"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                backendStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : backendStatus === 'checking'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
                backendStatus === 'checking' ? 'bg-amber-500 animate-spin' : 'bg-rose-500'
              }`} />
              <span className="hidden md:inline">
                {backendStatus === 'online' ? 'Spring Boot: 8080 Active' :
                 backendStatus === 'checking' ? 'Connecting to Backend...' : 'Backend Offline (Reconnecting...)'}
              </span>
              <RefreshCw className="w-3 h-3 ml-1 opacity-60" />
            </button>

            {/* Quick Role Switcher (For Presentation Demo) */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => switchRole('EMPLOYEE')}
                className={`flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  !isAdmin 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Employee</span>
              </button>

              <button
                onClick={() => switchRole('ADMIN')}
                className={`flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  isAdmin 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin / Approver</span>
              </button>
            </div>

            {/* User Profile info & Logout */}
            {currentUser && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => switchRole(isAdmin ? 'EMPLOYEE' : 'ADMIN')}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs hover:ring-2 hover:ring-indigo-400 transition-all"
                  title="Click to toggle Role"
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                </button>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium capitalize">{currentUser.role} Role</div>
                </div>

                <button
                  onClick={logout}
                  title="Logout / Open Registration Screen"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all ml-1 flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-bold hidden sm:inline text-slate-600 hover:text-rose-600">Logout</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
