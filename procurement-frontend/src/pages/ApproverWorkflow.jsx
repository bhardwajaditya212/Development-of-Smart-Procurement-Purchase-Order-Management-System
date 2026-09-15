import React, { useState, useEffect } from 'react';
import { requestApi } from '../services/api';
import { 
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Search,
  MessageSquare,
  Building2,
  User,
  Package,
  AlertCircle,
  X,
  Send,
  ShieldCheck
} from 'lucide-react';

export const ApproverWorkflow = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Modals state
  const [selectedReqForAction, setSelectedReqForAction] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE' | 'REJECT'
  const [feedbackComment, setFeedbackComment] = useState('');
  const [actionResult, setActionResult] = useState(null); // Modal for final response

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const data = await requestApi.getPendingRequests();
      const list = (Array.isArray(data) ? data : []).sort((a, b) => {
        const idA = Number(a.requestId || a.id || 0);
        const idB = Number(b.requestId || b.id || 0);
        return idB - idA;
      });
      setRequests(list);
    } catch (err) {
      console.error('Failed to fetch pending approval queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (req, type) => {
    setSelectedReqForAction(req);
    setActionType(type);
    setFeedbackComment(type === 'APPROVE' ? `Approved at Level ${req.currentApprovalLevel || 1}` : 'Rejected due to budget constraints.');
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!selectedReqForAction || !actionType) return;

    setProcessingId(selectedReqForAction.requestId);

    try {
      const payload = {
        requestId: selectedReqForAction.requestId,
        action: actionType,
        feedback: feedbackComment
      };

      const res = await requestApi.takeAction(payload);
      const resultData = res?.data || res;

      // Close confirm modal and open result popup
      setSelectedReqForAction(null);
      setActionResult({
        success: true,
        message: resultData.message || (actionType === 'APPROVE' ? 'Request Approved Successfully!' : 'Request Rejected!'),
        requestId: selectedReqForAction.requestId,
        action: actionType,
        feedback: feedbackComment
      });

      // Refresh Queue
      fetchPendingRequests();
    } catch (err) {
      alert('Error processing action: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(r =>
    (r.product || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 m-0">Multi-Level Approval Workflow Engine</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Stage 1: Manager | Stage 2: Finance | Stage 3: Procurement Head</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by requester, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Approval Queue */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs font-bold bg-white rounded-2xl border border-slate-200">
          Loading Pending Approval Queue from MySQL...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-slate-800 m-0">Approval Queue Clear!</h3>
          <p className="text-xs text-slate-500 mt-1">No pending purchase requisitions require your review right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => (
            <div key={req.requestId} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-sm border border-indigo-100">
                    #REQ-{req.requestId}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 m-0">
                      <Package className="w-4 h-4 text-slate-400" />
                      {req.product}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> {req.user || 'Requester'}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {req.department || 'IT'}</span>
                      <span className="font-bold text-slate-800">Qty: {req.quantity} units</span>
                      <span className="font-extrabold text-emerald-600">
                        Total: ₹{(req.totalCost || (req.pricePerProduct * req.quantity) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow Stage Progress Badge */}
                <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-800 text-xs font-bold w-fit">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>Level {req.currentApprovalLevel || 1} Review ({req.status})</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-400 italic">
                  Created Date: {req.createdDate ? req.createdDate.split('T')[0] : '2026-09-02'}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenActionModal(req, 'REJECT')}
                    disabled={processingId === req.requestId}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleOpenActionModal(req, 'APPROVE')}
                    disabled={processingId === req.requestId}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Advance</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* CONFIRMATION MODAL (Approve / Reject Action)             */}
      {/* ========================================================= */}
      {selectedReqForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 m-0">
                {actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </h3>
              <button
                onClick={() => setSelectedReqForAction(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 m-0">
              {actionType === 'APPROVE'
                ? `Are you sure you want to approve Request #REQ-${selectedReqForAction.requestId} (${selectedReqForAction.product}) and advance it to the next workflow level?`
                : `Are you sure you want to reject Request #REQ-${selectedReqForAction.requestId}? Rejected requests will not proceed to payment.`}
            </p>

            <form onSubmit={handleExecuteAction} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {actionType === 'APPROVE' ? 'Approval Remarks' : 'Rejection Reason *'}
                </label>
                <textarea
                  rows="3"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Enter comments for the requester..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required={actionType === 'REJECT'}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReqForAction(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!processingId}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                    actionType === 'APPROVE'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  }`}
                >
                  {processingId ? 'Executing...' : actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACTION RESULT SUCCESS POPUP MODAL                         */}
      {/* ========================================================= */}
      {actionResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              actionResult.action === 'APPROVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {actionResult.action === 'APPROVE' ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 m-0">
                {actionResult.action === 'APPROVE' ? 'Workflow Stage Advanced!' : 'Request Rejected'}
              </h3>
              <p className="text-xs text-slate-500 m-0">{actionResult.message}</p>
            </div>

            <button
              onClick={() => setActionResult(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              Close & Refresh Queue
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default ApproverWorkflow;
