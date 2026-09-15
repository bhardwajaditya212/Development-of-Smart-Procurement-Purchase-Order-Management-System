import React from 'react';
import { requestApi, supplierApi, paymentApi } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Building2, 
  Layers, 
  Star, 
  FileSpreadsheet, 
  PieChart,
  ShieldAlert
} from 'lucide-react';

export const SpendAnalyticsPage = () => {
  const deptSpendData = [
    { name: 'Information Technology (IT)', amount: 245000, percentage: 57, color: 'bg-indigo-600' },
    { name: 'Human Resources (HR)', amount: 102000, percentage: 24, color: 'bg-cyan-500' },
    { name: 'Finance & Accounts', amount: 50000, percentage: 12, color: 'bg-amber-500' },
    { name: 'Operations & Procurement', amount: 30000, percentage: 7, color: 'bg-emerald-500' },
  ];

  const categorySpendData = [
    { name: 'Hardware & Laptops', amount: 195000, count: 8 },
    { name: 'Office Ergonomic Furniture', amount: 85000, count: 12 },
    { name: 'Software & Cloud Licenses', amount: 65000, count: 5 },
    { name: 'Networking Switches & Cables', amount: 45000, count: 3 },
    { name: 'General Stationery & Supplies', amount: 37000, count: 15 },
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Module 5: Executive Analytics</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 m-0">Procurement & Spend Intelligence</h2>
          <p className="text-xs text-slate-500 mt-1">Cross-departmental budget utilization, vendor scorecards, and audit logs.</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <button
            onClick={() => requestApi.downloadCsv()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md shadow-indigo-200 transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Requests Report</span>
          </button>

          <button
            onClick={() => paymentApi.downloadCsv()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center space-x-1.5 border border-slate-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Payments CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Allocated Budget</div>
          <div className="text-2xl font-black text-slate-800">₹10,00,000</div>
          <div className="text-[11px] text-slate-500 mt-1">Annual Procurement Budget 2026</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Utilized Spend</div>
          <div className="text-2xl font-black text-indigo-600">₹4,27,000</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">42.7% Budget Utilized (On Track)</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Fulfillment Turnaround</div>
          <div className="text-2xl font-black text-emerald-600">3.4 Days</div>
          <div className="text-[11px] text-slate-500 mt-1">From L1 Requisition to Delivery</div>
        </div>
      </div>

      {/* Spend Breakdown Charts (Visual Bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Spend by Department */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Spend by Department</span>
            </div>
            <span className="text-xs font-bold text-indigo-600">₹4,27,000 Total</span>
          </div>

          <div className="space-y-4">
            {deptSpendData.map((dept) => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{dept.name}</span>
                  <span className="text-slate-900 font-bold">₹{dept.amount.toLocaleString('en-IN')} ({dept.percentage}%)</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${dept.color} rounded-full transition-all duration-700`} 
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spend by Category */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Spend by Product Category</span>
            </div>
            <span className="text-xs font-bold text-slate-500">5 Categories</span>
          </div>

          <div className="space-y-3">
            {categorySpendData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{cat.name}</div>
                    <div className="text-[10px] text-slate-400">{cat.count} Requisitions Fulfilled</div>
                  </div>
                </div>
                <div className="font-bold text-xs text-slate-800">
                  ₹{cat.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
