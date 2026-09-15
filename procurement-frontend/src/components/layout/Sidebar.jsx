import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FilePlus2, 
  GitPullRequestDraft, 
  Database, 
  Truck, 
  CreditCard, 
  BarChart3,
  Sparkles,
  ChevronRight,
  UserPlus
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, isAdmin } = useAuth();

  const navItems = [
    {
      id: 'auth',
      label: 'Auth & Registration',
      icon: UserPlus,
      badge: 'Portal',
      roles: ['EMPLOYEE', 'ADMIN']
    },
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: 'Main',
      roles: ['EMPLOYEE', 'ADMIN']
    },
    {
      id: 'requisition',
      label: 'Raise Requisition',
      icon: FilePlus2,
      badge: 'Employee',
      roles: ['EMPLOYEE', 'ADMIN']
    },
    {
      id: 'workflow',
      label: 'Approval Workflow',
      icon: GitPullRequestDraft,
      badge: 'L1/L2/L3',
      highlight: true,
      roles: ['ADMIN']
    },
    {
      id: 'masterdata',
      label: 'Master Data Catalog',
      icon: Database,
      badge: 'Module 1',
      roles: ['ADMIN']
    },
    {
      id: 'delivery',
      label: 'Shipment & Delivery',
      icon: Truck,
      badge: 'Module 3',
      roles: ['EMPLOYEE', 'ADMIN']
    },
    {
      id: 'payments',
      label: 'Payments & Feedback',
      icon: CreditCard,
      badge: 'Module 4',
      roles: ['EMPLOYEE', 'ADMIN']
    },
    {
      id: 'analytics',
      label: 'Spend Analytics & KPIs',
      icon: BarChart3,
      badge: 'Reports',
      roles: ['ADMIN']
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        
        {/* Navigation Group */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Procurement Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAllowed = item.roles.includes(isAdmin ? 'ADMIN' : 'EMPLOYEE');

              if (!isAllowed) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isActive 
                        ? 'bg-indigo-700 text-indigo-100' 
                        : item.highlight 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workflow Info Card for Presentation */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-3.5 text-left">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs mb-1">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Workflow Engine</span>
          </div>
          <p className="text-[11px] text-indigo-700 leading-relaxed">
            3-Tier Hierarchical Approval: <strong>Manager (L1)</strong> &rarr; <strong>Finance (L2)</strong> &rarr; <strong>Procurement Head (L3)</strong>.
          </p>
        </div>

      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-left">
        <div className="text-[11px] font-semibold text-slate-700">Spring Boot REST Connected</div>
        <div className="text-[10px] text-slate-400">Database: MySQL (employee_db)</div>
      </div>
    </aside>
  );
};
