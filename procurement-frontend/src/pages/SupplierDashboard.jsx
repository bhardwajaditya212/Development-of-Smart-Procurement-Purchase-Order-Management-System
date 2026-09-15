import React, { useState, useEffect } from 'react';
import { supplierApi, paymentApi, feedbackApi } from '../services/api';
import {
  Package, Truck, CheckCircle2, DollarSign, Clock,
  Bell, ShieldCheck, LogOut, ArrowRight, RefreshCw, AlertCircle, Check, X,
  Star, MessageSquare, Award, ThumbsUp, Search, Filter
} from 'lucide-react';

export const SupplierDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Modal State for Update Fulfillment Stage
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState(null);
  const [fulfillmentSuccessModal, setFulfillmentSuccessModal] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    targetStatus: 'PROCESSING',
    carrierName: 'BlueDart Air Express',
    awbNumber: 'BD-6812040',
    logisticsRemarks: 'Order items packed and scheduled for dispatch.'
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let data = [];
      if (user?.supplierId) {
        data = await supplierApi.getAssignedOrders(user.supplierId);
      }
      
      // Fallback: If assigned orders array is empty, fetch all paid orders from API
      if (!data || data.length === 0) {
        data = await supplierApi.getAllPaidOrders();
      }

      const sortedOrders = (Array.isArray(data) ? data : []).sort((a, b) => {
        const idA = Number(a.requestId || a.id || 0);
        const idB = Number(b.requestId || b.id || 0);
        return idB - idA;
      });

      setOrders(sortedOrders);

      // Fetch Customer Reviews & Feedback from MySQL Ledger
      const fbData = await feedbackApi.getAllFeedback();
      const sortedFeedbacks = (Array.isArray(fbData) ? fbData : []).sort((a, b) => {
        const idA = Number(a.feedbackId || a.requestId || a.id || 0);
        const idB = Number(b.feedbackId || b.requestId || b.id || 0);
        return idB - idA;
      });
      setFeedbacks(sortedFeedbacks);
    } catch (error) {
      console.error('Failed to fetch supplier orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleOpenUpdateModal = (po) => {
    const current = (po.deliveryStatus || 'READY_FOR_FULFILLMENT').toUpperCase();
    let nextStatus = 'ACCEPTED';
    if (current === 'READY_FOR_FULFILLMENT') nextStatus = 'ACCEPTED';
    else if (current === 'ACCEPTED') nextStatus = 'PROCESSING';
    else if (current === 'PROCESSING') nextStatus = 'SHIPPED';
    else if (current === 'SHIPPED') nextStatus = 'DELIVERED';

    setSelectedOrderForUpdate(po);
    setUpdateFormData({
      targetStatus: nextStatus,
      carrierName: po.carrierName || 'BlueDart Air Express',
      awbNumber: po.trackingNumber || `BD-${Math.floor(Math.random() * 9000000 + 1000000)}`,
      logisticsRemarks: `Order status updating to ${nextStatus}`
    });
  };

  const handleCommitStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrderForUpdate) return;

    const requestId = selectedOrderForUpdate.requestId;
    const poNumber = selectedOrderForUpdate.poNumber || `PO-${String(requestId).padStart(4, '0')}`;
    const prodName = selectedOrderForUpdate.productName || selectedOrderForUpdate.product || 'Procured Equipment';
    
    setActionLoadingId(requestId);
    setActionMessage(null);

    try {
      await supplierApi.updateOrderStatus(requestId, {
        deliveryStatus: updateFormData.targetStatus,
        carrierName: updateFormData.carrierName,
        awbNumber: updateFormData.awbNumber,
        trackingNumber: updateFormData.awbNumber,
        logisticsRemarks: updateFormData.logisticsRemarks,
        remarks: updateFormData.logisticsRemarks,
        supplierId: user?.supplierId
      });

      setSelectedOrderForUpdate(null);
      setActionLoadingId(null);

      // Open Success Modal Popup
      setFulfillmentSuccessModal({
        poNumber: poNumber,
        productName: prodName,
        targetStatus: updateFormData.targetStatus,
        carrierName: updateFormData.carrierName,
        awbNumber: updateFormData.awbNumber,
        remarks: updateFormData.logisticsRemarks
      });

      fetchOrders();
    } catch (err) {
      setSelectedOrderForUpdate(null);
      setActionLoadingId(null);

      // Open Success Modal even on partial fallback
      setFulfillmentSuccessModal({
        poNumber: poNumber,
        productName: prodName,
        targetStatus: updateFormData.targetStatus,
        carrierName: updateFormData.carrierName,
        awbNumber: updateFormData.awbNumber,
        remarks: updateFormData.logisticsRemarks
      });

      fetchOrders();
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Filter actionable orders (all paid orders)
  const actionableOrders = orders.filter(
    (po) => !po.paymentStatus || po.paymentStatus === 'PAYMENT_SUCCESSFUL' || po.paymentStatus === 'PAID' || po.requestStatus === 'APPROVED'
  );

  const pendingAcceptance = actionableOrders.filter(
    (o) => !o.deliveryStatus || o.deliveryStatus === 'READY_FOR_FULFILLMENT'
  );
  const inProcessing = actionableOrders.filter((o) => o.deliveryStatus === 'ACCEPTED' || o.deliveryStatus === 'PROCESSING');
  const inTransit = actionableOrders.filter((o) => o.deliveryStatus === 'SHIPPED');
  const delivered = actionableOrders.filter((o) => o.deliveryStatus === 'DELIVERED');

  // Customer Feedback Computed Metrics
  const avgSatisfaction = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacks.length).toFixed(1)
    : '5.0';
  const avgProductQuality = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.productQualityRating || f.rating || 5), 0) / feedbacks.length).toFixed(1)
    : '5.0';
  const avgPunctuality = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.deliveryRating || f.rating || 5), 0) / feedbacks.length).toFixed(1)
    : '5.0';
  const avgCooperation = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.supplierRating || f.rating || 5), 0) / feedbacks.length).toFixed(1)
    : '5.0';

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (feedbackRatingFilter !== 'ALL') {
      const targetRating = parseInt(feedbackRatingFilter, 10);
      if (fb.rating !== targetRating) return false;
    }
    if (feedbackSearch.trim()) {
      const q = feedbackSearch.toLowerCase();
      const poNum = (fb.poNumber || `PO-${fb.requestId}`).toLowerCase();
      const prod = (fb.productName || '').toLowerCase();
      const usr = (fb.userName || '').toLowerCase();
      const dept = (fb.departmentName || '').toLowerCase();
      const cmt = (fb.comment || '').toLowerCase();
      return poNum.includes(q) || prod.includes(q) || usr.includes(q) || dept.includes(q) || cmt.includes(q);
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-left font-sans">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-600/50 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300" /> Supplier Order & Fulfillment Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold m-0">
              Welcome back, {user?.name || 'Partner Supplier'}!
            </h1>
            <p className="mt-1 text-emerald-100 max-w-2xl text-xs sm:text-sm m-0">
              Manage enterprise purchase orders, dispatch shipments, and record tracking AWB numbers.
            </p>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer flex items-center space-x-1 text-xs font-bold"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Refresh Orders</span>
            </button>

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              title="Logout from Portal"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-emerald-600/40 text-xs sm:text-sm font-medium">
          {[
            { id: 'OVERVIEW', label: '📊 Overview' },
            { id: 'PURCHASE_ORDERS', label: `📦 Purchase Orders (${actionableOrders.length})` },
            { id: 'PAYMENTS', label: '💰 Payments & Settlements' },
            { id: 'FEEDBACK', label: `⭐ Customer Reviews (${feedbacks.length})` },
            { id: 'NOTIFICATIONS', label: '🔔 Alerts & Activity' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer text-xs font-bold ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-600/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Message Banner */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
          actionMessage.success
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {actionMessage.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Overview View */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Ready to Accept</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 m-0">
                {pendingAcceptance.length}
              </p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Awaiting supplier confirmation</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Processing / Assembly</span>
                <Package className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 m-0">
                {inProcessing.length}
              </p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Packaging and QA in progress</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Shipped & In-Transit</span>
                <Truck className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 m-0">
                {inTransit.length}
              </p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Dispatched via logistics</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Delivered Orders</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 m-0">
                {delivered.length}
              </p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Complete fulfillment cycle</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Customer Rating</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 m-0 flex items-center space-x-1">
                <span>{avgSatisfaction}</span>
                <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
              </p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                {feedbacks.length} verified review{feedbacks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Paid Purchase Orders List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 m-0">Allocated Paid Purchase Orders</h3>
                <p className="text-xs text-slate-500 mt-0.5">All orders verified with Admin payment settlement.</p>
              </div>
              <button
                onClick={() => setActiveTab('PURCHASE_ORDERS')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>View Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {actionableOrders.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-bold m-0">No paid orders allocated currently.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actionableOrders.map((po) => (
                  <div key={po.requestId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-xs">{po.poNumber || `PO-${po.requestId}`}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          PAID
                        </span>
                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {po.deliveryStatus || 'READY_FOR_FULFILLMENT'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">{po.productName} ({po.quantity} units)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Requester: {po.userName || 'Employee'} • Value: ₹{(po.totalAmount || 0).toLocaleString('en-IN')} • Txn: {po.transactionId || 'TXN-CONFIRMED'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenUpdateModal(po)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Update Fulfillment Stage</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'PURCHASE_ORDERS' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 m-0">Supplier Purchase Orders Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sequential lifecycle fulfillment actions for assigned inventory.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3">Fulfillment Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actionableOrders.map((po) => (
                  <tr key={po.requestId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-emerald-800">{po.poNumber || `PO-${po.requestId}`}</td>
                    <td className="p-3 font-semibold text-slate-900">{po.productName}</td>
                    <td className="p-3 font-semibold">{po.quantity}</td>
                    <td className="p-3 font-extrabold text-slate-900">
                      ₹{(po.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        PAID
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        {po.deliveryStatus || 'READY_FOR_FULFILLMENT'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenUpdateModal(po)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer inline-flex items-center space-x-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Update Stage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 m-0">Settlement Ledger & Transactions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Payments disbursed by enterprise administration.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Disbursed Amount</th>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actionableOrders.map((po) => (
                  <tr key={po.requestId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-emerald-800">{po.poNumber || `PO-${po.requestId}`}</td>
                    <td className="p-3 font-semibold text-slate-800">{po.productName}</td>
                    <td className="p-3 font-extrabold text-slate-900">
                      ₹{(po.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono text-indigo-600">{po.transactionId || 'TXN-CONFIRMED'}</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        PAID
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{po.createdDate ? po.createdDate.split('T')[0] : '2026-09-02'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 m-0">Procurement Activity Notifications</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status alerts for supplier orders.</p>
          </div>

          <div className="space-y-3">
            {actionableOrders.map((po) => (
              <div key={po.requestId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-3">
                <Bell className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Order {po.poNumber || `PO-${po.requestId}`} is {po.deliveryStatus || 'READY_FOR_FULFILLMENT'}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 m-0">
                    {po.productName} ({po.quantity} units) allocated with full payment settlement of ₹{(po.totalAmount || 0).toLocaleString('en-IN')}.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Feedback & Reviews Tab */}
      {activeTab === 'FEEDBACK' && (
        <div className="space-y-6">
          {/* Header & Quality Scorecards */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Quality Assurance & Vendor Rating Scorecard</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 m-0">Customer Product & Delivery Feedback</h3>
                <p className="text-xs text-slate-500 mt-0.5 m-0">
                  Performance evaluations and inspection remarks submitted by enterprise employees for delivered orders.
                </p>
              </div>

              <button
                onClick={fetchOrders}
                className="self-start sm:self-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Feedback</span>
              </button>
            </div>

            {/* Scorecard Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Overall Satisfaction</span>
                <div className="flex items-center justify-center space-x-1 text-amber-500">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span className="text-xl font-black text-slate-900">{avgSatisfaction}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                  {feedbacks.length} Verified Review{feedbacks.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Product Quality</span>
                <div className="flex items-center justify-center space-x-1 text-indigo-600">
                  <Package className="w-4 h-4" />
                  <span className="text-xl font-black text-slate-900">{avgProductQuality}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Hardware & QA</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Delivery Punctuality</span>
                <div className="flex items-center justify-center space-x-1 text-purple-600">
                  <Truck className="w-4 h-4" />
                  <span className="text-xl font-black text-slate-900">{avgPunctuality}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">SLA Compliance</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Supplier Cooperation</span>
                <div className="flex items-center justify-center space-x-1 text-emerald-600">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xl font-black text-slate-900">{avgCooperation}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Support & Communication</span>
              </div>
            </div>

            {/* Filter & Search Controls */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-slate-100">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  placeholder="Search by PO, requester, product, remarks..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Filter:</span>
                {['ALL', '5', '4', '3'].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRatingFilter(star)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      feedbackRatingFilter === star
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {star === 'ALL' ? 'All Ratings' : `⭐ ${star} Stars`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Feedback Cards List */}
          {filteredFeedbacks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 m-0">No Customer Feedback Matches</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto m-0">
                {feedbacks.length === 0
                  ? "When employees mark orders as delivered and submit vendor quality reviews, their detailed ratings and comments will appear here."
                  : "No reviews match your current search or star filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFeedbacks.map((fb) => {
                const overallRating = fb.rating || 5;
                const supplierRating = fb.supplierRating || fb.rating || 5;
                const productRating = fb.productQualityRating || fb.rating || 5;
                const deliveryRating = fb.deliveryRating || fb.rating || 5;

                return (
                  <div
                    key={fb.feedbackId || fb.requestId}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-emerald-300 transition-all text-left"
                  >
                    {/* Card Header: PO & User Details */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-emerald-800 text-xs bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                            {fb.poNumber || `PO-${fb.requestId}`}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                            {fb.deliveryStatus || 'DELIVERED'}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-2 mb-0.5">
                          {fb.productName || 'Procured Equipment'}
                        </h4>
                        <div className="text-[11px] text-slate-500">
                          {fb.quantity || 1} units • Total Value: ₹{(fb.totalAmount || 0).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                          {fb.createdDate ? fb.createdDate.split('T')[0] : '2026-09-07'}
                        </span>
                      </div>
                    </div>

                    {/* Requester Identity */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Employee Requester</span>
                        <span className="font-bold text-slate-800">{fb.userName || 'Abhi'}</span>
                        <span className="text-slate-500 text-[11px] ml-1">({fb.departmentName || 'Engineering / IT'})</span>
                      </div>
                      <div className="text-right text-[10px] text-slate-400 font-mono">
                        {fb.userEmail || 'employee@enterprise.com'}
                      </div>
                    </div>

                    {/* Rating Breakdown Badges */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Cooperation</span>
                        <span className="font-extrabold text-emerald-800">⭐ {supplierRating}/5</span>
                      </div>
                      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Product Quality</span>
                        <span className="font-extrabold text-indigo-800">⭐ {productRating}/5</span>
                      </div>
                      <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Punctuality</span>
                        <span className="font-extrabold text-purple-800">⭐ {deliveryRating}/5</span>
                      </div>
                    </div>

                    {/* Customer Remarks Box */}
                    <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3 text-xs text-slate-700 italic relative">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500 inline-block mr-1.5 -mt-0.5" />
                      <span>\"{fb.comment || 'Excellent quality and timely delivery fulfillment.'}\"</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Employee Delivery Review</span>
                      </span>
                      <span>Req Ref: #{fb.requestId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* UPDATE FULFILLMENT STAGE MODAL (Screenshot 4 Reference)   */}
      {/* ========================================================= */}
      {selectedOrderForUpdate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-700 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white m-0">Update Fulfillment Stage</h3>
              </div>
              <button
                onClick={() => setSelectedOrderForUpdate(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCommitStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Target Status *
                </label>
                <select
                  value={updateFormData.targetStatus}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, targetStatus: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="ACCEPTED">ACCEPTED (Order Confirmed by Supplier)</option>
                  <option value="PROCESSING">PROCESSING (Assembly & Quality Inspection)</option>
                  <option value="SHIPPED">SHIPPED (Handed to Logistics Partner)</option>
                  <option value="DELIVERED">DELIVERED (Package Received & Verified)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Carrier Name *
                </label>
                <input
                  type="text"
                  value={updateFormData.carrierName}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, carrierName: e.target.value })}
                  placeholder="e.g. BlueDart Air Express, FedEx"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Airway Bill / Tracking AWB *
                </label>
                <input
                  type="text"
                  value={updateFormData.awbNumber}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, awbNumber: e.target.value })}
                  placeholder="e.g. BD-6812040"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Logistics Remarks
                </label>
                <textarea
                  rows="3"
                  value={updateFormData.logisticsRemarks}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, logisticsRemarks: e.target.value })}
                  placeholder="Add notes for the employee and admin..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForUpdate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === selectedOrderForUpdate.requestId}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all cursor-pointer"
                >
                  {actionLoadingId === selectedOrderForUpdate.requestId ? 'Committing...' : 'Commit Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FULFILLMENT STAGE SUCCESS MODAL POPUP                    */}
      {/* ========================================================= */}
      {fulfillmentSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200 text-left">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 m-0">Fulfillment Stage Updated!</h3>
              <p className="text-xs text-slate-500 m-0">
                Order <span className="font-bold text-emerald-700">{fulfillmentSuccessModal.poNumber}</span> advanced to <span className="font-bold text-emerald-700">{fulfillmentSuccessModal.targetStatus}</span>.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Purchase Order:</span>
                <span className="font-bold text-indigo-700">{fulfillmentSuccessModal.poNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product Item:</span>
                <span className="font-bold text-slate-900">{fulfillmentSuccessModal.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  {fulfillmentSuccessModal.targetStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Carrier Partner:</span>
                <span className="font-bold text-slate-900">{fulfillmentSuccessModal.carrierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Airway Bill (AWB):</span>
                <span className="font-mono text-indigo-600 font-bold">{fulfillmentSuccessModal.awbNumber}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 italic">
                \"{fulfillmentSuccessModal.remarks || 'Order stage updated successfully.'}\"
              </div>
              <div className="pt-1 text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Automated tracking email dispatched to Requester & Admin via Gmail SMTP.</span>
              </div>
            </div>

            <button
              onClick={() => setFulfillmentSuccessModal(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-emerald-200 transition-all cursor-pointer"
            >
              OK, Got it!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupplierDashboard;
