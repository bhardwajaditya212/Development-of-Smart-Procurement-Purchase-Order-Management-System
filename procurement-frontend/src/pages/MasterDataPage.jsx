import React, { useState, useEffect } from 'react';
import { masterDataApi, supplierApi } from '../services/api';
import { 
  Database, 
  Building2, 
  Layers, 
  Users, 
  Plus, 
  Download, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail,
  RefreshCw,
  Search
} from 'lucide-react';

export const MasterDataPage = () => {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(1);
  const [loading, setLoading] = useState(true);

  // New Supplier Modal State
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    productName: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [depts, sups] = await Promise.all([
        masterDataApi.getAllDepartments(),
        supplierApi.getAllSuppliers()
      ]);
      setDepartments(depts);
      setSuppliers(sups);
      if (depts.length > 0) {
        setSelectedDeptId(depts[0].departmentId);
        const cats = await masterDataApi.getCategoriesByDepartment(depts[0].departmentId);
        setCategories(cats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeptSelect = async (deptId) => {
    setSelectedDeptId(deptId);
    const cats = await masterDataApi.getCategoriesByDepartment(deptId);
    setCategories(cats);
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await supplierApi.createSupplier({
        ...newSupplier,
        product: { productId: 1, name: newSupplier.productName || 'Hardware Asset' }
      });
      if (res.success) {
        setSuppliers([...suppliers, res.data]);
        setShowAddSupplier(false);
        setNewSupplier({ name: '', phone: '', email: '', address: '', gstNumber: '', productName: '' });
      }
    } catch (e) {
      alert('Error creating supplier');
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Module 1: Master Data Management</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 m-0">Enterprise Data & Supplier Directory</h2>
          <p className="text-xs text-slate-500 mt-1">Configure Organizational Departments, Category Taxonomies & Verified Suppliers.</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setShowAddSupplier(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-indigo-200 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Supplier</span>
          </button>
          <button
            onClick={() => supplierApi.downloadCsv()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center space-x-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Suppliers CSV</span>
          </button>
        </div>
      </div>

      {/* Departments & Categories Split Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Departments ({departments.length})</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
              GET /department
            </span>
          </div>

          <div className="space-y-2">
            {departments.map((dept) => (
              <button
                key={dept.departmentId}
                onClick={() => handleDeptSelect(dept.departmentId)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedDeptId === dept.departmentId
                    ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                }`}
              >
                <div className="font-bold text-xs text-slate-800">{dept.departmentName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Manager: {dept.managerOfDepartment || 'Aditya'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Categories Under Selected Department */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Associated Categories</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
              GET /category/department/{selectedDeptId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <div key={cat.categoryId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{cat.categoryName}</div>
                    <div className="text-[10px] text-slate-400">Category ID: #{cat.categoryId}</div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center text-slate-400 text-xs">
                No subcategories found for this department.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Verified Suppliers Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 m-0">Verified Supplier Catalog</h3>
            <p className="text-xs text-slate-400 mt-0.5">Commercial vendor records with GST validation & performance ratings.</p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {suppliers.length} Active Vendors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          {suppliers.map((sup) => (
            <div key={sup.supplierId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 m-0">{sup.name}</h4>
                  <span className="text-[10px] text-indigo-600 font-semibold">{sup.productName || 'Equipment Supplier'}</span>
                </div>
                <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-[11px] font-bold border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{sup.rating || 4.8}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.address || 'Bengaluru, India'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{sup.phone || '+91 9876543210'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.email || 'sales@supplier.com'}</span>
                </div>
                <div className="flex items-center space-x-2 pt-1 font-mono text-[10px] text-slate-500">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>GST: {sup.gstNumber || '29ABCDE1234F1Z5'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-left">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Register New Supplier</h3>
            <p className="text-xs text-slate-500 mb-4">Add vendor details to the enterprise supplier repository.</p>

            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Company Name *</label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="e.g. Apex Hardware Pvt Ltd"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GST Number *</label>
                  <input
                    type="text"
                    value={newSupplier.gstNumber}
                    onChange={(e) => setNewSupplier({ ...newSupplier, gstNumber: e.target.value })}
                    placeholder="29ABCDE1234F1Z5"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="vendor@company.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
                <input
                  type="text"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="City, State"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplied Product / Asset</label>
                <input
                  type="text"
                  value={newSupplier.productName}
                  onChange={(e) => setNewSupplier({ ...newSupplier, productName: e.target.value })}
                  placeholder="e.g. Laptops, Routers, Office Tables"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
                >
                  Save Supplier (POST /supplier)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
