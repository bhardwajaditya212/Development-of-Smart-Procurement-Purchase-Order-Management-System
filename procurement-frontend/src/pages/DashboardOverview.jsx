import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestApi, supplierApi, paymentApi } from '../services/api';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  FileText, 
  ArrowRight, 
  ShieldAlert,
  Sparkles,
  Download,
  Truck,
  CreditCard,
  Building,
  Calculator,
  Send,
  XCircle,
  BarChart,
  Check,
  Package,
  RefreshCw,
  Bell,
  CheckSquare,
  Star
} from 'lucide-react';

export const DashboardOverview = ({ activeTab: propActiveTab, setActiveTab: propSetActiveTab }) => {
  const { setActiveTab: contextSetActiveTab, currentUser } = useAuth();

  const activeTab = propActiveTab || 'overview';
  const setActiveTab = propSetActiveTab || contextSetActiveTab;

  const isAdmin = currentUser?.role === 'ADMIN';

  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    paid: 0,
    delivered: 0,
    spend: 0
  });

  // Requisition Form State (Employee Only)
  const [formData, setFormData] = useState({
    department: 'IT',
    category: 'Desktop',
    product: 'HP Desktop — ₹55,000',
    quantity: 1,
    unitPrice: 55000,
    justification: ''
  });

  const productOptions = [
    { name: 'Wireless Mouse', price: 700 },
    { name: 'Dell Latitude Laptop', price: 70000 },
    { name: 'HP Desktop', price: 55000 },
    { name: 'Wireless Keyboard', price: 1200 },
    { name: '24 Inch Monitor', price: 15000 }
  ];

  // Fetch Requests on Mount
  useEffect(() => {
    fetchRequisitions();
  }, [currentUser]);

  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      let data = [];
      const currentUid = currentUser?.userId || currentUser?.id;

      if (!isAdmin && currentUid) {
        data = await requestApi.getRequestsByUserId(currentUid);
        if (!data || data.length === 0) {
          const all = await requestApi.getAllRequests();
          const currentName = (currentUser.name || '').toLowerCase();
          const currentEmail = (currentUser.email || '').toLowerCase();
          data = (all || []).filter(o => {
            const oUid = o.userId || o.user?.userId || o.user?.id;
            const oUser = (typeof o.user === 'string' ? o.user : o.user?.name || o.userName || '').toLowerCase();
            const oEmail = (typeof o.email === 'string' ? o.email : o.user?.email || '').toLowerCase();
            return (oUid && currentUid && Number(oUid) === Number(currentUid)) ||
                   (currentEmail && oEmail && currentEmail === oEmail) ||
                   (currentName && oUser && (oUser.includes(currentName) || currentName.includes(oUser)));
          });
        }
      } else {
        data = await requestApi.getAllRequests();
      }

      const list = (Array.isArray(data) ? data : []).sort((a, b) => {
        const idA = Number(a.requestId || a.id || 0);
        const idB = Number(b.requestId || b.id || 0);
        return idB - idA;
      });
      setRequisitions(list);

      // Compute statistics from backend data
      const pendingCount = list.filter(r => r.status === 'PENDING_FOR_APPROVAL' || r.status === 'PENDING_L1').length;
      const approvedCount = list.filter(r => r.status === 'APPROVED').length;
      const paidCount = list.filter(r => r.paymentStatus === 'PAYMENT_SUCCESSFUL' || r.paymentStatus === 'PAID').length;
      const totalSpend = list.reduce((acc, r) => {
        const unit = r.pricePerProduct || r.unitPrice || 700;
        const qty = r.quantity || 1;
        const cost = (r.totalCost && r.totalCost > 0) ? r.totalCost : (r.estimatedCost && r.estimatedCost > 0) ? r.estimatedCost : (unit * qty);
        return acc + cost;
      }, 0);

      setStats({
        pending: pendingCount,
        approved: approvedCount,
        paid: paidCount,
        delivered: list.filter(r => r.deliveryStatus === 'DELIVERED').length,
        spend: totalSpend
      });
    } catch (err) {
      console.error('Fetching requisition data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const selectedName = e.target.value;
    const item = productOptions.find(p => `${p.name} — ₹${p.price.toLocaleString('en-IN')}` === selectedName);
    if (item) {
      setFormData({
        ...formData,
        product: selectedName,
        unitPrice: item.price
      });
    } else {
      setFormData({ ...formData, product: selectedName });
    }
  };

  const gstAmount = formData.unitPrice * formData.quantity * 0.18;
  const totalBudget = (formData.unitPrice * formData.quantity) + gstAmount;

  // Submit Requisition (Employee Only)
  const handleSubmitRequisition = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      user: { userId: currentUser?.userId || currentUser?.id || 1 },
      department: { departmentId: 1 },
      product: { productId: 1 },
      quantity: formData.quantity,
      description: formData.justification
    };

    try {
      await requestApi.createRequest(payload);
      alert('Purchase Requisition Raised Successfully!');
      fetchRequisitions();
      setFormData({ ...formData, justification: '' });
    } catch (error) {
      alert('Failed to submit requisition to backend');
    } finally {
      setLoading(false);
    }
  };

  // EMPLOYEE REQUISITION VIEW GUARD
  if (activeTab === 'requisition' && !isAdmin) {
    return (
      <div className="space-y-6 text-left">
        <form onSubmit={handleSubmitRequisition} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">1. Target Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800"
                >
                  <option value="IT">Information Technology (IT)</option>
                  <option value="Finance">Finance & Accounts</option>
                  <option value="Operations">Operations & Procurement</option>
                  <option value="HR">Human Resources (HR)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">2. Product Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800"
                >
                  <option value="Hardware">Hardware & Laptops</option>
                  <option value="Furniture">Office Furniture</option>
                  <option value="Networking">Networking Equipment</option>
                  <option value="Software">Software Licenses</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">3. Select Product Item *</label>
              <select
                value={formData.product}
                onChange={handleProductChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800"
              >
                {productOptions.map((item, idx) => (
                  <option key={idx} value={`${item.name} — ₹${item.price.toLocaleString('en-IN')}`}>
                    {item.name} — ₹{item.price.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">4. Purchase Justification & Purpose *</label>
              <textarea
                rows="3"
                required
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                placeholder="Explain why this purchase is needed for current deliverables..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting to Spring Boot Backend...' : 'Submit Purchase Requisition'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black tracking-wider uppercase">Budget Estimate Summary</span>
              </div>
              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-300">
                  <span>Quantity:</span>
                  <span className="font-bold text-white">{formData.quantity} Units</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Est. Unit Price:</span>
                  <span className="font-bold text-white">₹{formData.unitPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>GST / Taxes (18%):</span>
                  <span className="font-bold text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">Total Budget:</span>
                <span className="text-2xl font-black text-emerald-400">₹{totalBudget.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 text-xs">
              <div className="font-bold text-slate-400 uppercase tracking-wider mb-2">REQUESTER PROFILE</div>
              <div className="font-extrabold text-slate-800 text-sm">{currentUser?.name || 'Aditya'}</div>
              <div className="text-slate-500 text-[11px] mt-0.5">{currentUser?.email || 'adityaeps.notification@gmail.com'}</div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // DEFAULT DASHBOARD OVERVIEW VIEW
  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl text-left">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-indigo-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Procurement & Purchase Order Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 m-0">
            Welcome back, {currentUser?.name || 'User'}! 👋
          </h2>
          <p className="text-indigo-100 text-sm leading-relaxed mb-6 mt-1">
            {isAdmin
              ? 'Admin Dashboard: Review multi-level approval queues, authorize payments, and manage vendor scorecards.'
              : 'Employee Portal: Raise purchase requirements, track order fulfillment stages, and submit vendor feedback.'}
          </p>
          <div className="flex flex-wrap gap-3">
            {!isAdmin ? (
              <button
                onClick={() => setActiveTab('requisition')}
                className="bg-white text-indigo-900 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-indigo-50 shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span>Raise New Requisition</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('approval')}
                className="bg-white text-indigo-900 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-indigo-50 shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <span>Open Approval Workflow</span>
              </button>
            )}

            <button
              onClick={() => requestApi.downloadCsv()}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm border border-white/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Pending Approvals</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.pending}</div>
          <span className="text-[10px] text-amber-600 font-bold mt-1 block">Level 1/2/3 Review Queue</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Approved Requests</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.approved}</div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Passed L3 Final Review</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Payments Disbursed</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.paid}</div>
          <span className="text-[10px] text-indigo-600 font-bold mt-1 block">GPay / PhonePe / Card Paid</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Spend (FY 26)</div>
          <div className="text-2xl font-black text-slate-800 mt-1">₹{stats.spend.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-purple-600 font-bold mt-1 block">Verified MySQL Procurement Spend</span>
        </div>
      </div>

      {/* Requisitions Control Ledger (Full Width) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 m-0">
              {isAdmin ? 'Enterprise Requisitions Control Ledger' : 'My Submitted Requisitions'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status tracking and approver decisions from MySQL backend.</p>
          </div>
          <button
            onClick={() => requestApi.downloadCsv()}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 border border-slate-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">Req #</th>
                <th className="py-3 px-3">Product / Item</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Qty</th>
                <th className="py-3 px-3">Est. Budget</th>
                <th className="py-3 px-3">Approval Stage</th>
                <th className="py-3 px-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {requisitions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 italic">No requisitions raised yet.</td>
                </tr>
              ) : (
                requisitions.map((req, idx) => {
                  const unitPrice = req.pricePerProduct || req.unitPrice || 700;
                  const calculatedCost = (req.totalCost && req.totalCost > 0)
                    ? req.totalCost
                    : (req.estimatedCost && req.estimatedCost > 0)
                    ? req.estimatedCost
                    : (unitPrice * (req.quantity || 1));

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-indigo-700">#REQ-{req.requestId || req.id || (idx + 101)}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{req.product || req.productName || 'Procured Item'}</td>
                      <td className="py-3 px-3">{req.department || req.departmentName || 'IT'}</td>
                      <td className="py-3 px-3 font-bold">{req.quantity || 1}</td>
                      <td className="py-3 px-3 font-extrabold text-emerald-600">
                        ₹{calculatedCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {req.status || 'PENDING_FOR_APPROVAL'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          req.paymentStatus === 'PAYMENT_SUCCESSFUL' || req.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {req.paymentStatus || 'UNPAID'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default DashboardOverview;
