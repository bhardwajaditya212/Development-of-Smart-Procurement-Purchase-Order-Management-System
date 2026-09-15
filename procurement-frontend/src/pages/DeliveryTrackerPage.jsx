import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestApi, deliveryApi } from '../services/api';
import { 
  Truck, 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Package, 
  Calendar,
  RefreshCw,
  Send,
  Info,
  Eye,
  X,
  FileText,
  UserCheck
} from 'lucide-react';

export const DeliveryTrackerPage = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let data = [];
      const currentUid = currentUser?.userId || currentUser?.id;

      if (!isAdmin && currentUid) {
        // Fetch only this employee's requests
        data = await requestApi.getRequestsByUserId(currentUid);
        // If empty or if backend endpoint returned full list, strictly filter by employee
        if (!data || data.length === 0) {
          const all = await requestApi.getAllRequests();
          data = (all || []).filter(o => {
            const oUid = o.userId || o.user?.userId || o.user?.id;
            const oUser = (typeof o.user === 'string' ? o.user : o.user?.name || o.userName || '').toLowerCase();
            const oEmail = (typeof o.email === 'string' ? o.email : o.user?.email || '').toLowerCase();
            const currentName = (currentUser?.name || '').toLowerCase();
            const currentEmail = (currentUser?.email || '').toLowerCase();

            return (oUid && currentUid && Number(oUid) === Number(currentUid)) ||
                   (currentEmail && oEmail && currentEmail === oEmail) ||
                   (currentName && oUser && (oUser.includes(currentName) || currentName.includes(oUser)));
          });
        }
      } else {
        data = await requestApi.getAllRequests();
      }

      const requestOrders = Array.isArray(data) ? data : [];
      const ordersWithDeliveryStatus = await Promise.all(
        requestOrders.map(async (order) => {
          const requestId = order.requestId || order.id;
          if (!requestId) return order;

          const delivery = await deliveryApi.getDeliveryByRequestId(requestId);
          if (!delivery) return order;

          const deliveryRecord = delivery.data || delivery;
          return {
            ...order,
            deliveryStatus: deliveryRecord.deliveryStatus || deliveryRecord.status || order.deliveryStatus,
            carrierName: deliveryRecord.carrierName || order.carrierName,
            trackingNumber: deliveryRecord.trackingNumber || deliveryRecord.awbNumber || order.trackingNumber,
            remarks: deliveryRecord.remarks || deliveryRecord.logisticsRemarks || order.remarks
          };
        })
      );

      setOrders(ordersWithDeliveryStatus);
    } catch (e) {
      console.error('Error loading shipment orders:', e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const reqId = String(o.requestId || o.id || '');
    const poNum = (o.poNumber || '').toLowerCase();
    const reqNum = (`req-${reqId}`).toLowerCase();
    const prod = (o.product || o.productName || '').toLowerCase();
    const user = (typeof o.user === 'string' ? o.user : o.user?.name || o.userName || '').toLowerCase();
    const dept = (o.department || o.departmentName || '').toLowerCase();
    const status = (o.deliveryStatus || o.paymentStatus || o.status || '').toLowerCase();

    return reqId.includes(term) ||
           poNum.includes(term) ||
           reqNum.includes(term) ||
           prod.includes(term) ||
           user.includes(term) ||
           dept.includes(term) ||
           status.includes(term);
  });

  const getFulfillmentInfo = (req) => {
    const deliveryStatus = String(req.deliveryStatus || '').toUpperCase();
    const requestStatus = String(req.status || '').toUpperCase();
    const paymentStatus = String(req.paymentStatus || '').toUpperCase();

    if (deliveryStatus === 'DELIVERED') {
      return { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 4 };
    }
    if (deliveryStatus === 'SHIPPED' || deliveryStatus === 'IN_TRANSIT') {
      return { label: 'Shipped (In Transit)', color: 'bg-purple-50 text-purple-700 border-purple-200', step: 3 };
    }
    if (deliveryStatus === 'PROCESSING') {
      return { label: 'Processing at Supplier', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', step: 2 };
    }
    if (deliveryStatus === 'ACCEPTED') {
      return { label: 'Accepted by Supplier', color: 'bg-blue-50 text-blue-700 border-blue-200', step: 1 };
    }
    if (deliveryStatus === 'READY_TO_DISPATCH' || deliveryStatus === 'READY_FOR_DISPATCH') {
      return { label: 'Ready for Dispatch', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', step: 2 };
    }
    if (deliveryStatus === 'READY_FOR_FULFILLMENT') {
      return { label: 'Ready for Supplier Fulfillment', color: 'bg-blue-50 text-blue-700 border-blue-200', step: 1 };
    }
    if (paymentStatus === 'PAYMENT_SUCCESSFUL' || paymentStatus === 'PAID') {
      return { label: 'Payment Cleared (Awaiting Supplier Acceptance)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 1 };
    }
    if (paymentStatus === 'PAYMENT_REQUIRED') {
      return { label: 'Approved (Awaiting Admin Payment)', color: 'bg-amber-50 text-amber-700 border-amber-200', step: 0 };
    }
    if (requestStatus === 'APPROVED') {
      return { label: 'Approved (Awaiting Admin Payment)', color: 'bg-amber-50 text-amber-700 border-amber-200', step: 0 };
    }
    if (requestStatus === 'REJECTED') {
      return { label: 'Request Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200', step: 0 };
    }
    return { label: req.status || 'PENDING_FOR_APPROVAL', color: 'bg-slate-100 text-slate-700 border-slate-200', step: 0 };
  };

  return (
    <div className="space-y-6 text-left">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>{isAdmin ? 'Module 3: Enterprise Fulfillment & Logistics' : 'My Orders & Shipments'}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 m-0">
            {isAdmin ? 'Enterprise Shipment & Delivery Tracker' : 'My Active Shipments & Deliveries'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Real-time multi-department delivery tracking across all enterprise purchase orders.'
              : `Tracking your personal purchase orders (${currentUser?.name || 'Employee'}).`}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by REQ #, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 border border-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Live Shipment List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 m-0">
              {isAdmin ? 'All Enterprise Purchase Orders' : 'My Procurement Orders'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Track shipment milestones, carrier details, and Airway Bill (AWB) numbers.</p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-bold">
            Loading Live Shipment Tracker...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 m-0">No active shipments found for your account.</p>
            {!isAdmin && (
              <p className="text-[11px] text-slate-500 mt-1">Submit a purchase requisition to begin order tracking.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((req, idx) => {
              const info = getFulfillmentInfo(req);
              const deliveryStatus = String(req.deliveryStatus || '').toUpperCase();
              const isPaid = req.paymentStatus === 'PAYMENT_SUCCESSFUL' || req.paymentStatus === 'PAID';
              const requesterName = typeof req.user === 'string' ? req.user : req.user?.name || req.userName || currentUser?.name || 'Employee';
              const reqDepartment = req.department?.departmentName || req.department || 'IT';

              return (
                <div key={req.requestId || idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-indigo-700 text-xs">#REQ-{req.requestId}</span>
                        <span className="font-black text-slate-900 text-sm">{req.product || req.productName}</span>
                        <span className="text-slate-400 text-xs">({req.quantity || 1} units)</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Requester: <span className="font-semibold text-slate-700">{requesterName}</span> &bull; Department: {reqDepartment} &bull; Budget: ₹{(req.totalCost || req.estimatedCost || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase border ${info.color}`}>
                        <Truck className="w-3.5 h-3.5" />
                        <span>{info.label}</span>
                      </span>

                      <button
                        onClick={() => setSelectedTrackOrder(req)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track Live Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Carrier & Tracking AWB Details if available */}
                  {(req.carrierName || req.trackingNumber || req.remarks || req.deliveryStatus) && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-700">
                      <div>
                        <span className="font-bold text-slate-900">Carrier:</span> {req.carrierName || (req.deliveryStatus ? 'Logistics Partner' : 'Awaiting Assignment')}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Airway Bill (AWB):</span>{' '}
                        {req.trackingNumber ? (
                          <span className="font-mono text-indigo-600 font-bold">{req.trackingNumber}</span>
                        ) : (
                          <span className="text-slate-400 italic">Pending Dispatch</span>
                        )}
                      </div>
                      <div className="text-slate-500 italic text-[11px] w-full">
                        "{req.remarks || (req.deliveryStatus === 'DELIVERED' ? 'Order has been delivered successfully to requester.' : 'Order scheduled for fulfillment.')}"
                      </div>
                    </div>
                  )}

                  {/* 4-Step Stepper Progress Bar */}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className="space-y-1">
                        <div className="w-full bg-emerald-500 h-1.5 rounded-full"></div>
                        <span className="text-emerald-700">1. Requisition Raised ✓</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-full h-1.5 rounded-full ${req.status === 'APPROVED' ? 'bg-emerald-500' : req.status === 'REJECTED' ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                        <span className={req.status === 'APPROVED' ? 'text-emerald-700' : req.status === 'REJECTED' ? 'text-rose-600' : 'text-slate-400'}>
                          {req.status === 'REJECTED' ? '2. Rejected ✕' : '2. Admin Approved'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-full h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        <span className={isPaid ? 'text-emerald-700' : 'text-slate-400'}>3. Admin Paid</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-full h-1.5 rounded-full ${deliveryStatus === 'DELIVERED' ? 'bg-emerald-500' : (info.step >= 3 || deliveryStatus === 'SHIPPED' || deliveryStatus === 'IN_TRANSIT') ? 'bg-purple-500 animate-pulse' : isPaid ? 'bg-indigo-400' : 'bg-slate-200'}`}></div>
                        <span className={deliveryStatus === 'DELIVERED' ? 'text-emerald-700' : (info.step >= 3 || deliveryStatus === 'SHIPPED' || deliveryStatus === 'IN_TRANSIT') ? 'text-purple-700' : isPaid ? 'text-indigo-600' : 'text-slate-400'}>
                          {deliveryStatus === 'DELIVERED'
                            ? '4. Order Delivered ✓'
                            : deliveryStatus === 'SHIPPED' || deliveryStatus === 'IN_TRANSIT'
                            ? '4. In Transit (SHIPPED)'
                            : deliveryStatus === 'PROCESSING'
                            ? '4. Supplier Processing'
                            : deliveryStatus === 'ACCEPTED'
                            ? '4. Supplier Accepted'
                            : deliveryStatus === 'READY_TO_DISPATCH' || deliveryStatus === 'READY_FOR_DISPATCH'
                            ? '4. Ready for Dispatch'
                            : deliveryStatus === 'READY_FOR_FULFILLMENT'
                            ? '4. Ready for Supplier Fulfillment'
                            : isPaid
                            ? '4. Awaiting Supplier Acceptance'
                            : '4. Supplier Fulfillment'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* LIVE ORDER TRACKER MODAL POPUP                            */}
      {/* ========================================================= */}
      {selectedTrackOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 m-0">Shipment Tracking Details</h3>
                  <p className="text-xs text-slate-500 m-0">PO / Request #REQ-{selectedTrackOrder.requestId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrackOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Product Item:</span>
                <span className="text-indigo-700">{selectedTrackOrder.product || selectedTrackOrder.productName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Quantity:</span>
                <span>{selectedTrackOrder.quantity || 1} units</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Carrier Partner:</span>
                <span className="font-bold text-slate-900">{selectedTrackOrder.carrierName || (selectedTrackOrder.deliveryStatus ? 'Logistics Partner' : 'Awaiting Assignment')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tracking AWB #:</span>
                {selectedTrackOrder.trackingNumber ? (
                  <span className="font-mono text-indigo-600 font-bold">{selectedTrackOrder.trackingNumber}</span>
                ) : (
                  <span className="text-slate-400 italic">Pending Dispatch</span>
                )}
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-indigo-100">
                <span>Order Total:</span>
                <span className="font-extrabold text-emerald-600">
                  ₹{(selectedTrackOrder.totalCost || selectedTrackOrder.estimatedCost || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Live Status Container */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold uppercase tracking-wider">
                <span>Live Fulfillment Status</span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">LIVE</span>
              </div>
              <p className="text-sm font-bold text-white m-0">
                {getFulfillmentInfo(selectedTrackOrder).label}
              </p>
              <p className="text-xs text-slate-300 m-0 leading-relaxed">
                {selectedTrackOrder.remarks || 'Supplier is currently processing this order for dispatch.'}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTrackOrder(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                Close Tracking Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
