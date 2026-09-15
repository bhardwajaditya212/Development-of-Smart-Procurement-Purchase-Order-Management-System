import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { EmployeeRequisition } from './pages/EmployeeRequisition';
import { ApproverWorkflow } from './pages/ApproverWorkflow';
import { MasterDataPage } from './pages/MasterDataPage';
import { DeliveryTrackerPage } from './pages/DeliveryTrackerPage';
import { PaymentFeedbackPage } from './pages/PaymentFeedbackPage';
import { SpendAnalyticsPage } from './pages/SpendAnalyticsPage';
import SupplierDashboard from './pages/SupplierDashboard';
import { useAuth } from './context/AuthContext';
import { requestApi, paymentApi } from './services/api';
import {
  LogOut,
  UserCheck,
  ShieldCheck,
  UserPlus,
  LayoutDashboard,
  FileText,
  CheckSquare,
  Database,
  Package,
  CreditCard,
  BarChart2,
  Building2,
  RefreshCw,
  GitPullRequest,
  Star,
  Bell,
  Home,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isEmployee = currentUser?.role === 'EMPLOYEE';

  // Real-time dynamic notifications fetcher
  const fetchRealTimeNotifications = async () => {
    if (!currentUser) return;
    setLoadingNotifications(true);
    try {
      let reqList = [];
      let payList = [];

      try {
        if (isAdmin) {
          reqList = await requestApi.getAllRequests();
          payList = await paymentApi.getAllPayments();
        } else {
          const uid = currentUser?.userId || currentUser?.id;
          if (uid) {
            reqList = await requestApi.getRequestsByUserId(uid);
          }
          if (!reqList || reqList.length === 0) {
            const all = await requestApi.getAllRequests();
            const currentName = (currentUser?.name || '').toLowerCase();
            const currentEmail = (currentUser?.email || '').toLowerCase();
            reqList = (all || []).filter(o => {
              const oUid = o.userId || o.user?.userId || o.user?.id;
              const oUser = (typeof o.user === 'string' ? o.user : o.user?.name || o.userName || '').toLowerCase();
              const oEmail = (typeof o.email === 'string' ? o.email : o.user?.email || '').toLowerCase();
              return (oUid && uid && Number(oUid) === Number(uid)) ||
                     (currentEmail && oEmail && currentEmail === oEmail) ||
                     (currentName && oUser && (oUser.includes(currentName) || currentName.includes(oUser)));
            });
          }
        }
      } catch (err) {
        console.error('Error loading notification data:', err);
      }

      const generated = [];

      if (isAdmin) {
        // 1. Pending Approvals
        const pendingItems = (reqList || []).filter(
          r => r.status === 'PENDING_FOR_APPROVAL' || r.status === 'PENDING_L1' || r.status === 'PENDING_L2' || r.status === 'PENDING_L3'
        );
        pendingItems.slice(0, 4).forEach(r => {
          const reqId = r.requestId || r.id;
          const userStr = typeof r.user === 'string' ? r.user : r.user?.name || r.userName || 'Employee';
          const deptStr = r.department?.departmentName || r.department || 'IT';
          generated.push({
            id: `pending-${reqId}`,
            title: `#REQ-${reqId}: ${r.product || r.productName || 'Equipment'}`,
            message: `Raised by ${userStr} (${deptStr}). Awaiting Level ${r.currentApprovalLevel || 1} Approval review.`,
            time: r.createdDate ? r.createdDate.split('T')[0] : 'Today',
            type: 'PENDING',
            targetTab: 'approval'
          });
        });

        // 2. Recent Payments
        (payList || []).slice(-3).reverse().forEach(p => {
          generated.push({
            id: `pay-${p.paymentId || p.id}`,
            title: `#PAY-${p.paymentId || p.id} (Req #${p.requestId}): Disbursed`,
            message: `Admin authorized payment of ₹${Number(p.amount || 0).toLocaleString('en-IN')} via ${p.paymentMethod || 'UPI'}. Released to Supplier.`,
            time: p.paymentDate ? p.paymentDate.split('T')[0] : 'Recent',
            type: 'PAYMENT',
            targetTab: 'payments'
          });
        });

        // 3. Approved Orders Awaiting Payment
        const paymentRequired = (reqList || []).filter(
          r => r.status === 'APPROVED' && r.paymentStatus !== 'PAYMENT_SUCCESSFUL' && r.paymentStatus !== 'PAID'
        );
        paymentRequired.slice(0, 2).forEach(r => {
          const reqId = r.requestId || r.id;
          generated.push({
            id: `approved-${reqId}`,
            title: `#REQ-${reqId}: Approved (Payment Required)`,
            message: `Order approved at Level 3. Ready for invoice authorization in Payments Ledger.`,
            time: 'Action Required',
            type: 'ACTION',
            targetTab: 'payments'
          });
        });
      } else {
        // Employee Personal Notifications
        (reqList || []).forEach(r => {
          const reqId = r.requestId || r.id;
          const prod = r.product || r.productName || 'Requested Item';

          if (r.deliveryStatus === 'DELIVERED') {
            generated.push({
              id: `deliv-${reqId}`,
              title: `#REQ-${reqId}: Delivered Successfully`,
              message: `Your order for ${prod} has been delivered. Please submit quality feedback!`,
              time: 'Delivered',
              type: 'DELIVERED',
              targetTab: 'feedback'
            });
          } else if (r.paymentStatus === 'PAYMENT_SUCCESSFUL' || r.paymentStatus === 'PAID') {
            generated.push({
              id: `paid-${reqId}`,
              title: `#REQ-${reqId}: Payment Released`,
              message: `Finance authorized payment. Supplier is fulfilling your order for ${prod}.`,
              time: 'In Progress',
              type: 'PAYMENT',
              targetTab: 'shipment'
            });
          } else if (r.status === 'APPROVED') {
            generated.push({
              id: `appr-${reqId}`,
              title: `#REQ-${reqId}: Approved by Approver`,
              message: `Your requisition for ${prod} passed all approval stages.`,
              time: 'Approved',
              type: 'APPROVED',
              targetTab: 'shipment'
            });
          } else if (r.status === 'REJECTED') {
            generated.push({
              id: `rej-${reqId}`,
              title: `#REQ-${reqId}: Request Rejected`,
              message: `Your requisition for ${prod} was rejected. Reason: ${r.feedback || 'Budget constraint'}.`,
              time: 'Rejected',
              type: 'REJECTED',
              targetTab: 'requisition'
            });
          } else {
            generated.push({
              id: `req-${reqId}`,
              title: `#REQ-${reqId}: Under Review (Level ${r.currentApprovalLevel || 1})`,
              message: `Your requisition for ${prod} is actively being reviewed.`,
              time: r.createdDate ? r.createdDate.split('T')[0] : 'Active',
              type: 'PENDING',
              targetTab: 'shipment'
            });
          }
        });
      }

      setNotifications(generated);
      setUnreadCount(generated.length);
    } catch (e) {
      console.error('Error building notifications:', e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchRealTimeNotifications();
    const interval = setInterval(fetchRealTimeNotifications, 20000); // 20s auto refresh
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleToggleNotifications = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
    if (unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = (item) => {
    if (item.targetTab) {
      setActiveTab(item.targetTab);
      setShowNotificationsDropdown(false);
    }
  };

  // If user is not authenticated, display the high-conversion Landing Page
  if (!currentUser) {
    return <LandingPage />;
  }

  if (currentUser.role === 'SUPPLIER') {
    return <SupplierDashboard user={currentUser} onLogout={logout} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-left">

      {/* Top Navbar Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3 shadow-xs">
        <div className="w-full mx-auto flex items-center justify-between">

          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none m-0">
                  Smart Procurement System
                </h1>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-1 rounded-full">
                  Enterprise PO
                </span>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center space-x-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Spring Boot: 8080 Active</span>
                  <RefreshCw className="w-3 h-3 text-emerald-500" />
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 m-0">
                Infosys Springboard Virtual Internship 7.0 | Enterprise Edition
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold space-x-1">
              <span className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl transition-all ${
                isEmployee
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-500'
              }`}>
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Employee</span>
              </span>

              <span className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl transition-all ${
                isAdmin
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500'
              }`}>
                <ShieldCheck className="w-4 h-4" />
                <span>Admin / Approver</span>
              </span>
            </div>

            {/* Notification Bell Icon & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={handleToggleNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer bg-white"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in duration-150 text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-extrabold text-slate-900 m-0">Live Real-Time Notifications</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={fetchRealTimeNotifications}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Refresh"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingNotifications ? 'animate-spin' : ''}`} />
                      </button>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        LIVE MYSQL
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3 max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs font-medium">
                        No new notifications right now.
                      </div>
                    ) : (
                      notifications.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className="bg-slate-50 hover:bg-indigo-50/70 p-3 rounded-xl border border-slate-100 transition-colors cursor-pointer text-xs space-y-1 group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-700 flex items-center gap-1.5">
                              {item.type === 'PENDING' && <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                              {item.type === 'PAYMENT' && <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                              {item.type === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                              {item.type === 'DELIVERED' && <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-1">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 m-0 leading-relaxed">
                            {item.message}
                          </p>
                          <div className="flex justify-end pt-1">
                            <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5 group-hover:underline">
                              <span>View Details</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Mark all as read
                    </button>
                    <button
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info */}
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-indigo-600 text-white font-black text-sm rounded-full flex items-center justify-center shadow-md">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-900 leading-none">{currentUser?.name || 'User'}</div>
                <div className="text-[10px] text-indigo-600 font-extrabold uppercase mt-0.5">{currentUser?.role || 'EMPLOYEE'} ROLE</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all text-xs font-bold bg-white cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 w-full flex">

        {/* Left Role-Restricted Sidebar */}
        <aside className="w-72 shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col justify-between min-h-[calc(100vh-65px)] text-left">
          <div className="space-y-5">
            <div className="text-[11px] font-black text-slate-400 tracking-wider uppercase px-2">
              {isAdmin ? 'ADMIN CONTROL PANEL' : 'EMPLOYEE PORTAL'}
            </div>

            <nav className="space-y-1.5">
              {/* Dashboard Overview - Both */}
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Overview</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  activeTab === 'overview' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  MAIN
                </span>
              </button>

              {/* Raise Requisition - Employee ONLY */}
              {isEmployee && (
                <button
                  type="button"
                  onClick={() => setActiveTab('requisition')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'requisition'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4" />
                    <span>Raise Requisition</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    activeTab === 'requisition' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    EMPLOYEE
                  </span>
                </button>
              )}

              {/* Approval Workflow - Admin ONLY */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('approval')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'approval'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="w-4 h-4" />
                    <span>Approval Workflow</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    activeTab === 'approval' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    L1/L2/L3
                  </span>
                </button>
              )}

              {/* Master Data Catalog - Admin ONLY */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'catalog'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Database className="w-4 h-4" />
                    <span>Master Data Catalog</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    activeTab === 'catalog' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    MODULE 1
                  </span>
                </button>
              )}

              {/* Shipment & Delivery - Both */}
              <button
                type="button"
                onClick={() => setActiveTab('shipment')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'shipment'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4" />
                  <span>Shipment & Delivery</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  activeTab === 'shipment' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  MODULE 3
                </span>
              </button>

              {/* Payments & Disbursal - Admin ONLY */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'payments'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-4 h-4" />
                    <span>Payments & Disbursal</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    activeTab === 'payments' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    MODULE 4
                  </span>
                </button>
              )}

              {/* Product Feedback - Employee ONLY */}
              {isEmployee && (
                <button
                  type="button"
                  onClick={() => setActiveTab('feedback')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'feedback'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Star className="w-4 h-4" />
                    <span>Product & Vendor Feedback</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    activeTab === 'feedback' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    FEEDBACK
                  </span>
                </button>
              )}

              {/* Spend Analytics & KPIs - Admin ONLY */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <BarChart2 className="w-4 h-4" />
                    <span>Spend Analytics & KPIs</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    activeTab === 'analytics' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    REPORTS
                  </span>
                </button>
              )}

              {/* View Landing Showcase */}
              <button
                type="button"
                onClick={() => setActiveTab('landing')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'landing'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Home className="w-4 h-4" />
                  <span>Product Landing Page</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  activeTab === 'landing' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  HOME
                </span>
              </button>

              {/* Auth Portal Switcher */}
              <button
                type="button"
                onClick={() => setActiveTab('auth')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'auth'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <UserPlus className="w-4 h-4" />
                  <span>Account Settings</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  activeTab === 'auth' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  PORTAL
                </span>
              </button>
            </nav>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-2 text-indigo-800 font-bold text-xs">
                <GitPullRequest className="w-4 h-4 text-indigo-600" />
                <span>Workflow Security Active</span>
              </div>
              <p className="text-[11px] text-indigo-900/80 font-medium leading-relaxed m-0">
                {isAdmin
                  ? 'Admin Mode: Approve requisitions, authorize payments, and view spend reports.'
                  : 'Employee Mode: Raise purchase requirements, track orders, and submit feedback.'}
              </p>
            </div>

            <div className="px-2">
              <div className="text-[11px] font-bold text-slate-700">Spring Boot REST Connected</div>
              <div className="text-[10px] font-medium text-slate-400">Database: MySQL (employee_db)</div>
            </div>
          </div>
        </aside>

        {/* Dynamic Main View */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'landing' && <LandingPage />}
          {activeTab === 'auth' && <AuthPage inline={true} />}
          {activeTab === 'overview' && (
            <DashboardOverview
              user={currentUser}
              onLogout={logout}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'requisition' && isEmployee && <EmployeeRequisition />}
          {activeTab === 'approval' && isAdmin && <ApproverWorkflow />}
          {activeTab === 'catalog' && isAdmin && <MasterDataPage />}
          {activeTab === 'shipment' && <DeliveryTrackerPage />}
          {activeTab === 'payments' && isAdmin && <PaymentFeedbackPage userRole="ADMIN" />}
          {activeTab === 'feedback' && isEmployee && <PaymentFeedbackPage userRole="EMPLOYEE" />}
          {activeTab === 'analytics' && isAdmin && <SpendAnalyticsPage />}
        </main>

      </div>
    </div>
  );
}
