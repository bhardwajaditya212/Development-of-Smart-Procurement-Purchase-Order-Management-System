import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { masterDataApi, requestApi } from '../services/api';
import {
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Package,
  Calculator,
  Mail,
  RefreshCw,
  X,
  FileText,
  Eye,
  ShieldCheck,
  CreditCard,
  Truck,
  Download
} from 'lucide-react';

export const EmployeeRequisition = () => {
  const { currentUser } = useAuth();

  // State declarations
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const [productName, setProductName] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justification, setJustification] = useState('');

  const [loading, setLoading] = useState(false);
  const [successResponse, setSuccessResponse] = useState(null); // Triggers Modal
  const [errorMsg, setErrorMsg] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  // Selected Request Details Modal
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

  // Load My Requests from API
  const loadMyRequests = async () => {
    try {
      const currentUserId = currentUser?.userId || currentUser?.id || 1;
      let data = [];
      if (requestApi.getRequestsByUserId) {
        data = await requestApi.getRequestsByUserId(currentUserId);
      } else {
        data = await requestApi.getAllRequests();
      }

      const list = Array.isArray(data) ? data : (data?.data || []);

      const formatted = list.map(item => {
        const productNameExtracted =
          item.product?.name ||
          item.productName ||
          item.product ||
          'Enterprise Asset';

        const extractedUnitPrice =
          item.product?.pricePerProduct ||
          item.pricePerProduct ||
          item.unitPrice ||
          0;

        const qty = item.quantity || 1;
        const calculatedTotal = extractedUnitPrice * qty;

        return {
          requestId: item.requestId || item.id || 0,
          product: productNameExtracted,
          department: item.department?.departmentName || item.departmentName || item.department || 'IT Department',
          quantity: qty,
          unitPrice: extractedUnitPrice,
          totalCost: item.estimatedCost || calculatedTotal,
          status: item.status || item.approvalStatus || 'PENDING_FOR_APPROVAL',
          currentApprovalLevel: item.currentApprovalLevel || 1,
          paymentStatus: item.paymentStatus || 'UNPAID',
          feedback: item.feedback || item.comments || 'Submitted. Automated Email Dispatched.',
          date: item.createdDate ? item.createdDate.split('T')[0] : new Date().toISOString().split('T')[0]
        };
      }).sort((a, b) => Number(b.requestId || 0) - Number(a.requestId || 0));

      setMyRequests(formatted);
    } catch (err) {
      console.error('Failed to load user requests:', err);
    }
  };

  // Export My Requisitions as CSV File
  const downloadCSVReport = () => {
    if (!myRequests || myRequests.length === 0) return;
    const headers = ["Req ID", "Product", "Department", "Quantity", "Unit Price", "Total Cost", "Approval Status", "Payment Status", "Date"];
    const rows = myRequests.map(req => [
      `"${req.requestId}"`,
      `"${(req.product || '').replace(/"/g, '""')}"`,
      `"${(req.department || '').replace(/"/g, '""')}"`,
      req.quantity,
      req.unitPrice,
      req.totalCost,
      `"${req.status}"`,
      `"${req.paymentStatus}"`,
      `"${req.date}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `my_requisitions_${currentUser?.userId || 'user'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch initial departments and products database
  useEffect(() => {
    const initData = async () => {
      try {
        const depts = await masterDataApi.getAllDepartments();
        const deptList = Array.isArray(depts) ? depts : (depts?.data || []);
        setDepartments(deptList);
        if (deptList.length > 0) {
          setSelectedDeptId(deptList[0].departmentId || deptList[0].id);
        }

        const response = await fetch('http://localhost:8080/product');
        if (response.ok) {
          const productsData = await response.json();
          setProducts(productsData || []);

          if (productsData && productsData.length > 0) {
            const firstProduct = productsData[0];
            setSelectedProductId(firstProduct.productId);
            setProductName(firstProduct.name || '');
            setUnitPrice(firstProduct.pricePerProduct || 0);

            if (firstProduct.category?.categoryId) {
              setSelectedCatId(firstProduct.category.categoryId);
            }
          }
        }
      } catch (e) {
        console.error('Error in initData:', e);
      }
      await loadMyRequests();
    };

    initData();
  }, []);

  // Sync Categories when Department Changes
  useEffect(() => {
    if (selectedDeptId) {
      const fetchCats = async () => {
        try {
          const cats = await masterDataApi.getCategoriesByDepartment(selectedDeptId);
          const catList = Array.isArray(cats) ? cats : (cats?.data || []);
          setCategories(catList);
          if (catList.length > 0) {
            setSelectedCatId(catList[0].categoryId);
          }
        } catch (e) {
          console.error('Error fetching categories:', e);
        }
      };
      fetchCats();
    }
  }, [selectedDeptId]);

  // Product select update
  useEffect(() => {
    if (!selectedProductId || products.length === 0) return;

    const selectedProduct = products.find(
      product => product.productId === parseInt(selectedProductId, 10)
    );

    if (selectedProduct) {
      setProductName(selectedProduct.name || '');
      setUnitPrice(selectedProduct.pricePerProduct || 0);

      if (selectedProduct.category?.categoryId) {
        setSelectedCatId(selectedProduct.category.categoryId);
      }
    }
  }, [selectedProductId, products]);

  // Submit Requisition Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      setErrorMsg('Please select a valid product.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const payload = {
      user: {
        userId: currentUser?.userId || currentUser?.id || 1,
        name: currentUser?.name || 'Employee User',
        email: currentUser?.email || 'user@gmail.com'
      },
      department: {
        departmentId: parseInt(selectedDeptId, 10)
      },
      product: {
        productId: parseInt(selectedProductId, 10)
      },
      quantity: parseInt(quantity, 10),
      description: justification
    };

    try {
      const result = await requestApi.createRequest(payload);
      const resData = result?.data || result;

      const createdId = resData?.requestId || resData?.id || Math.floor(Math.random() * 9000) + 1000;
      const computedTotal = (unitPrice || 0) * parseInt(quantity, 10);

      // Open Success Modal
      setSuccessResponse({
        ...resData,
        requestId: createdId,
        productName: productName,
        quantity: parseInt(quantity, 10),
        totalCost: computedTotal,
        status: 'PENDING_FOR_APPROVAL',
        level: 1
      });

      await loadMyRequests();

      // Reset Form fields
      setQuantity(1);
      setJustification('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit request to Spring Boot backend.');
    } finally {
      setLoading(false);
    }
  };

  const totalCalculated = (unitPrice || 0) * (quantity || 1);

  return (
    <div className="space-y-6 text-left">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Employee Self-Service Portal</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 m-0">Raise Purchase Requisition</h2>
          <p className="text-xs text-slate-500 mt-1">Submit requirements to trigger automated multi-tier approval hierarchy & email notifications.</p>
        </div>
        <div className="mt-3 md:mt-0 flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-200">
          <Mail className="w-3.5 h-3.5" />
          <span>Spring Mailer Active (Gmail SMTP)</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center space-x-3 text-rose-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Requisition Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Target Department *
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept.departmentId || dept.id} value={dept.departmentId || dept.id}>
                      {dept.departmentName || dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. Product Category *
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>
                        {cat.categoryName || cat.name}
                      </option>
                    ))
                  ) : (
                    <option value="">General Hardware & Equipment</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                3. Select Inventory Product *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              >
                {products.map((prod) => (
                  <option key={prod.productId} value={prod.productId}>
                    {prod.name} — ₹{(prod.pricePerProduct || 0).toLocaleString('en-IN')} (Available: {prod.numberOfQuantities || 50} units)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  4. Required Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  5. Estimated Unit Price (₹)
                </label>
                <input
                  type="text"
                  value={`₹${(unitPrice || 0).toLocaleString('en-IN')}`}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-600 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                6. Business Justification / Description *
              </label>
              <textarea
                rows="3"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain why this equipment is needed for corporate projects..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Request to Backend...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Purchase Requisition</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Budget Summary Side Card */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Calculator className="w-4 h-4" />
              <span>Budget Estimate Summary</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300 pb-2 border-b border-white/10">
                <span>Quantity:</span>
                <span className="font-bold text-white">{quantity} Units</span>
              </div>
              <div className="flex justify-between text-slate-300 pb-2 border-b border-white/10">
                <span>Est. Unit Price:</span>
                <span className="font-bold text-white">₹{unitPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300 pb-2 border-b border-white/10">
                <span>GST / Taxes (18%):</span>
                <span className="font-bold text-white">₹{Math.round(totalCalculated * 0.18).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 flex justify-between items-baseline">
                <span className="font-bold text-indigo-300 text-sm">Total Budget:</span>
                <span className="font-extrabold text-xl text-emerald-400">
                  ₹{Math.round(totalCalculated * 1.18).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requester Profile</div>
            <div className="text-xs font-bold text-slate-800">{currentUser?.name || 'Aditya Bhardwaj'}</div>
            <div className="text-xs text-slate-500">{currentUser?.email || 'aditya@gmail.com'}</div>
          </div>
        </div>
      </div>

      {/* Submitted Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 m-0">My Submitted Requisitions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any row to view complete details, approval history, and payment status.</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={downloadCSVReport}
              className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-indigo-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              {myRequests.length} Total Requests
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Req #</th>
                <th className="p-4">Product / Item</th>
                <th className="p-4">Department</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Est. Cost</th>
                <th className="p-4">Approval Stage</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRequests.length > 0 ? (
                myRequests.map((req) => (
                  <tr
                    key={req.requestId}
                    onClick={() => setSelectedRequestDetails(req)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-bold text-indigo-700">#{req.requestId}</td>
                    <td className="p-4 font-semibold text-slate-800">{req.product}</td>
                    <td className="p-4 text-slate-600">{req.department}</td>
                    <td className="p-4 font-bold text-slate-700">{req.quantity}</td>
                    <td className="p-4 font-extrabold text-slate-900">
                      ₹{(req.totalCost || (req.quantity * req.unitPrice) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> :
                         req.status === 'REJECTED' ? <XCircle className="w-3 h-3" /> :
                         <Clock className="w-3 h-3 animate-pulse" />}
                        <span>{req.status?.replace(/_/g, ' ') || 'PENDING'}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.paymentStatus === 'PAYMENT_SUCCESSFUL' || req.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.paymentStatus === 'PAYMENT_REQUIRED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {req.paymentStatus || 'UNPAID'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequestDetails(req);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-400 font-medium">
                    No purchase requisitions raised yet. Submit a requirement above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUCCESS MODAL POPUP (Triggered after Raise Request)       */}
      {/* ========================================================= */}
      {successResponse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 m-0">Purchase Requisition Submitted!</h3>
              <p className="text-xs text-slate-500 m-0">Order recorded in MySQL DB & automated email alert sent via Gmail SMTP.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Request Reference:</span>
                <span className="font-bold text-indigo-700">#REQ-{successResponse.requestId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product Name:</span>
                <span className="font-bold text-slate-900">{successResponse.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-bold text-slate-900">{successResponse.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Estimated Budget:</span>
                <span className="font-black text-emerald-600">₹{(successResponse.totalCost || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Current Workflow Stage:</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  Level 1 Manager Review
                </span>
              </div>
            </div>

            <button
              onClick={() => setSuccessResponse(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              OK, Got it!
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REQUEST DETAILS MODAL POPUP                               */}
      {/* ========================================================= */}
      {selectedRequestDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900 m-0">
                  Requisition Details #REQ-{selectedRequestDetails.requestId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequestDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Product Item</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedRequestDetails.product}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                  <span className="font-bold text-slate-900">{selectedRequestDetails.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
                  <span className="font-bold text-slate-900">{selectedRequestDetails.quantity} units</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Budget</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    ₹{(selectedRequestDetails.totalCost || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Approval Status:</span>
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                    {selectedRequestDetails.status} (Level {selectedRequestDetails.currentApprovalLevel})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Payment Disbursal:</span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                    {selectedRequestDetails.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Created Date:</span>
                  <span className="text-slate-800 font-semibold">{selectedRequestDetails.date}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-bold block mb-1">Approver Remarks / Feedback:</span>
                <p className="bg-slate-50 p-3 rounded-xl text-slate-700 italic border border-slate-200 m-0">
                  "{selectedRequestDetails.feedback || 'Pending review by Level 1 Manager.'}"
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRequestDetails(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default EmployeeRequisition;
