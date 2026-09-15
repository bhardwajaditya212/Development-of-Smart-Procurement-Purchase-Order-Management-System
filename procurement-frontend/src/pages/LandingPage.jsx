import React, { useState } from 'react';
import AuthPage from './AuthPage';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  ShoppingCart,
  FileCheck,
  CreditCard,
  X,
  Sparkles,
  RefreshCw,
  Lock,
  Layers,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

export const LandingPage = () => {
  const [modalRole, setModalRole] = useState(null); // 'EMPLOYEE' | 'ADMIN' | 'SUPPLIER' | null
  const [modalMode, setModalMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'

  const openAuthModal = (role = 'EMPLOYEE', mode = 'LOGIN') => {
    setModalRole(role);
    setModalMode(mode);
  };

  const steps = [
    {
      num: '01',
      title: 'Raise Requisition',
      desc: 'Employees select verified catalog items, specify quantities, and submit department purchase requests.',
      icon: ShoppingCart,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      num: '02',
      title: 'Multi-Tier Approvals',
      desc: 'Managers and Admins evaluate budget allocation through L1, L2, and L3 hierarchies to release official POs.',
      icon: FileCheck,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      num: '03',
      title: 'Supplier Fulfillment',
      desc: 'Suppliers receive digitized purchase orders, confirm dispatch, and assign live courier Air Waybills (AWB).',
      icon: Truck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      num: '04',
      title: '3-Way Match & Pay',
      desc: 'Automatic reconciliation between Purchase Order, Goods Receipt (GRN), and Invoice prior to final disbursal.',
      icon: CreditCard,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    }
  ];

  const highlights = [
    {
      title: 'Strict RBAC Security',
      desc: 'Isolated portal access for Employees, Approvers, and Suppliers.',
      icon: Lock,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      title: 'Automated PO Dispatch',
      desc: 'Digitized purchase order generation immediately upon final approval.',
      icon: FileSpreadsheet,
      color: 'text-purple-600 bg-purple-50 border-purple-100'
    },
    {
      title: 'Courier Logistics Sync',
      desc: 'Integrated tracking with real-time status updates and AWB numbers.',
      icon: Activity,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    {
      title: '3-Way Invoice Match',
      desc: 'Automated cross-check of PO, GRN & Vendor invoice to eliminate errors.',
      icon: Layers,
      color: 'text-blue-600 bg-blue-50 border-blue-100'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased text-left selection:bg-indigo-500 selection:text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* Decorative Subtle Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent pointer-events-none -z-10 blur-3xl"></div>

      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-2.5 rounded-2xl shadow-md shadow-indigo-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  SmartProcure
                </span>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Enterprise PO System
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium m-0">
                Infosys Springboard Virtual Internship 7.0
              </p>
            </div>
          </div>

          {/* Right Header Status & Sign In */}
          <div className="flex items-center space-x-3">
            <span className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Backend :8080 Connected</span>
              <RefreshCw className="w-3 h-3 text-emerald-500" />
            </span>

            <button
              onClick={() => openAuthModal('EMPLOYEE', 'LOGIN')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Sign In</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full flex-1 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-50/90 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Enterprise Procurement & Purchase Order Lifecycle</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight m-0">
            Intelligent Procurement & PO Management
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal m-0 max-w-2xl mx-auto">
            A secure platform uniting <span className="font-semibold text-slate-800">Employees</span>, <span className="font-semibold text-slate-800">Approvers</span>, and <span className="font-semibold text-slate-800">Suppliers</span> for automated requisitions, multi-tier approvals, shipment tracking, and 3-way invoice settlement.
          </p>
        </div>

        {/* 3 Core Role Portals */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 m-0">Select Your Workspace</h2>
              <p className="text-xs text-slate-500 font-medium m-0">Secure authentication required for all portal access.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Employee Portal Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs group-hover:scale-105 transition-transform">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Employee
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 m-0">Employee Portal</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 m-0">
                    Browse catalog items, raise purchase requisitions, track approval progress, and submit post-delivery feedback.
                  </p>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Requisition creation & item cart</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Real-time approval & shipment tracker</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Vendor rating & feedback submission</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('EMPLOYEE', 'LOGIN')}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Sign In as Employee</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => openAuthModal('EMPLOYEE', 'REGISTER')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    Need an account? <span className="font-bold text-indigo-600">Register here</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Admin & Approver Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-purple-600"></div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Admin / Approver
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 m-0">Approver Console</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 m-0">
                    Review requisitions via L1/L2/L3 approval hierarchy, authorize Purchase Orders, disburse funds, and view spend BI.
                  </p>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>L1/L2/L3 Approval matrix workflow</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Automated PO release & 3-way match</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Spend analytics & catalog management</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('ADMIN', 'LOGIN')}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-100 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => openAuthModal('ADMIN', 'REGISTER')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    Need an account? <span className="font-bold text-purple-600">Register Admin</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Supplier Portal Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-105 transition-transform">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Supplier Partner
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 m-0">Supplier Hub</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 m-0">
                    Acknowledge Purchase Orders, update consignment dispatch with courier AWB tracking, and manage payment settlements.
                  </p>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>PO digital acceptance & dispatch</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Air Waybill (AWB) courier tracking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Invoice status & settlement tracking</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('SUPPLIER', 'LOGIN')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Sign In as Supplier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => openAuthModal('SUPPLIER', 'REGISTER')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    New supplier? <span className="font-bold text-emerald-600">Register Partner</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4 Feature Badges Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start space-x-3">
                <div className={`p-2.5 rounded-xl border shrink-0 ${h.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900">{h.title}</div>
                  <p className="text-[11px] text-slate-500 leading-snug m-0">{h.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4-Step How It Works */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-900 m-0">Procurement Lifecycle Overview</h2>
            <p className="text-xs text-slate-500 font-medium m-0">Standard end-to-end workflow from requisition to payment disbursal.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 hover:bg-slate-100/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-800 font-black text-xs flex items-center justify-center shadow-xs">
                      {s.num}
                    </span>
                    <div className={`p-1.5 rounded-lg border ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">{s.title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enterprise Tech Stack Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider">Enterprise Stack &bull; Decoupled Architecture</div>
            <h3 className="text-lg font-black m-0">Production-Ready System Architecture</h3>
            <p className="text-xs text-slate-400 m-0">
              React 19 SPA &bull; Spring Boot 3 REST APIs (:8080) &bull; MySQL Database with Relational Integrity.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => openAuthModal('EMPLOYEE', 'LOGIN')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-900/50 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In to System</span>
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 font-bold text-slate-800">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>SmartProcure Enterprise</span>
            <span className="font-normal text-slate-400">| Infosys Springboard Virtual Internship 7.0</span>
          </div>
          <div>
            &copy; 2026 Smart Procurement & Purchase Order Management System. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay (Secure Login Only) */}
      {modalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative max-w-xl w-full">
            <button
              onClick={() => setModalRole(null)}
              className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-300 shadow-xs cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <AuthPage inline={true} onClose={() => setModalRole(null)} initialRole={modalRole} />
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
