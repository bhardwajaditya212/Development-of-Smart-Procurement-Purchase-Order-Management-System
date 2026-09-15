import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, masterDataApi, supplierApi } from '../services/api';

import {
  Building2,
  ShieldCheck,
  UserCheck,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User,
  Phone,
  Truck,
  Building,
  MapPin,
  FileText
} from 'lucide-react';

export const AuthPage = ({ inline = false, onClose, initialRole = 'EMPLOYEE' }) => {
  const { login } = useAuth();
  const [roleTab, setRoleTab] = useState(initialRole || 'EMPLOYEE');
  const [mode, setMode] = useState('LOGIN');

  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: 'Aditya Bhardwaj',
    email: 'aditya@gmail.com',
    password: 'UserPassword123!',
    phoneNumber: '9876543210',
    designation: 'Procurement Executive',
    departmentId: 1,
    address: 'Electronic City, Bengaluru',
    gstNumber: '29ABCDE1234F1Z5'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync initialRole if provided
  useEffect(() => {
    if (initialRole) {
      handleQuickFill(initialRole, 'LOGIN');
    }
  }, [initialRole]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await masterDataApi.getAllDepartments();
        if (data && data.length > 0) {
          setDepartments(data);
          setFormData(prev => ({
            ...prev,
            departmentId: data[0].departmentId
          }));
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };

    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        let res;
        if (roleTab === 'SUPPLIER') {
          res = await supplierApi.loginSupplier({ email: formData.email });
        } else if (roleTab === 'ADMIN') {
          res = await authApi.loginAdmin({
            email: formData.email,
            password: formData.password
          });
        } else {
          res = await authApi.loginUser({
            email: formData.email,
            password: formData.password
          });
        }

        const isLoginSuccessful =
          res?.success ||
          (res?.data && res?.data?.message && res.data.message.toLowerCase().includes('success')) ||
          (res?.message && res.message.toLowerCase().includes('success'));

        if (isLoginSuccessful) {
          setSuccess(`Logged in successfully as ${roleTab}! Redirecting...`);

          const userPayload = {
            ...(res.data || {}),
            role: roleTab,
            name: res.data?.name || res.data?.adminName || formData.name || formData.email.split('@')[0],
            email: formData.email
          };

          login(userPayload);

          if (onClose) {
            setTimeout(() => {
              onClose();
            }, 400);
          }
        } else {
          setError(res?.message || res?.data?.message || 'Invalid Email or Credentials');
        }
      } else {
        let res;

        if (roleTab === 'SUPPLIER') {
          const supplierPayload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phoneNumber.trim(),
            address: formData.address,
            gstNumber: formData.gstNumber,
            status: 'VERIFIED',
            rating: 5.0
          };
          res = await supplierApi.registerSupplier(supplierPayload);
        } else if (roleTab === 'ADMIN') {
          const adminPayload = {
            name: formData.name,
            adminName: formData.name,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber.trim(),
            phone: formData.phoneNumber.trim(),
            designation: formData.designation,
            role: 'ADMIN',
            departmentId: parseInt(formData.departmentId, 10),
            department: {
              departmentId: parseInt(formData.departmentId, 10)
            }
          };
          res = await authApi.registerAdmin(adminPayload);
        } else {
          const userPayload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber.trim(),
            designation: formData.designation,
            departmentId: parseInt(formData.departmentId, 10),
            department: {
              departmentId: parseInt(formData.departmentId, 10)
            }
          };
          res = await authApi.registerUser(userPayload);
        }

        if (res?.success) {
          setSuccess(res.data?.message || `Successfully registered as ${roleTab}! You can now login.`);
          setMode('LOGIN');
        } else {
          setError(res?.message || res?.data?.message || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      const backendData = err.response?.data;

      if (backendData?.errors && Array.isArray(backendData.errors)) {
        const fieldErrors = backendData.errors
          .map(e => `${e.field || 'Field'}: ${e.defaultMessage}`)
          .join(' | ');
        setError(`Validation Error: ${fieldErrors}`);
      } else if (backendData?.message) {
        setError(`Backend Error: ${backendData.message}`);
      } else {
        setError('Server error. Please check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role, newMode = mode) => {
    setRoleTab(role);
    setMode(newMode);
    setError('');
    setSuccess('');

    if (role === 'ADMIN') {
      setFormData({
        name: 'HR Administrator',
        email: 'hradmin@gmail.com',
        password: 'AdminPassword123!',
        phoneNumber: '9876543210',
        designation: 'System Administrator',
        departmentId: 2,
        address: 'HQ Tower, Bengaluru',
        gstNumber: '29ABCDE1234F1Z5'
      });
    } else if (role === 'SUPPLIER') {
      setFormData({
        name: 'TechMatrix Global Ltd',
        email: 'sales@techmatrix.com',
        password: 'SupplierPassword123!',
        phoneNumber: '9876543210',
        designation: 'Supplier Partner',
        departmentId: 1,
        address: 'Electronic City, Bengaluru',
        gstNumber: '29ABCDE1234F1Z5'
      });
    } else {
      setFormData({
        name: 'Aditya Bhardwaj',
        email: 'aditya@gmail.com',
        password: 'UserPassword123!',
        phoneNumber: '9876543210',
        designation: 'Procurement Executive',
        departmentId: 1,
        address: 'Electronic City, Bengaluru',
        gstNumber: '29ABCDE1234F1Z5'
      });
    }
  };

  return (
    <div className={`text-left ${inline ? 'w-full' : 'min-h-screen bg-slate-50 flex items-center justify-center p-4'}`}>
      <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl ${inline ? 'max-w-2xl mx-auto w-full' : 'max-w-xl w-full'}`}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 mb-6 gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 m-0">Sign In to SmartProcure</h2>
              <p className="text-xs text-slate-500 font-medium m-0">
                Select your role and enter credentials
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setError(''); setSuccess(''); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                mode === 'LOGIN'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setError(''); setSuccess(''); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                mode === 'REGISTER'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* 3-Role Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => handleQuickFill('EMPLOYEE')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
              roleTab === 'EMPLOYEE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Employee</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('ADMIN')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
              roleTab === 'ADMIN'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('SUPPLIER')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
              roleTab === 'SUPPLIER'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span>Supplier</span>
          </button>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {roleTab === 'SUPPLIER' ? 'Supplier / Company Name *' : 'Full Name *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={roleTab === 'SUPPLIER' ? 'e.g. TechMatrix Global Ltd' : 'e.g. Aditya Bhardwaj'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  required
                />
                {roleTab === 'SUPPLIER' ? (
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                ) : (
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                )}
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={roleTab === 'SUPPLIER' ? 'e.g. sales@techmatrix.com' : 'e.g. aditya@gmail.com'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Password (Hidden for Supplier Login) */}
          {roleTab !== 'SUPPLIER' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter secure password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          {mode === 'REGISTER' && (
            <>
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Extra Supplier Specific Fields */}
              {roleTab === 'SUPPLIER' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      GST Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                        placeholder="e.g. 29ABCDE1234F1Z5"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                        required
                      />
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Office Address *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="e.g. Electronic City, Bengaluru"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                        required
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Department Mapping for Employee / Admin */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Department *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.departmentId}
                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      >
                        {departments.map((dept) => (
                          <option key={dept.departmentId} value={dept.departmentId}>
                            Dept #{dept.departmentId}: {dept.departmentName}
                          </option>
                        ))}
                      </select>
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Designation for Employee / Admin */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Designation *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="e.g. Procurement Executive"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                        required
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-2.5">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer ${
                roleTab === 'SUPPLIER'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : roleTab === 'ADMIN'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'REGISTER' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register as {roleTab}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login as {roleTab}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill(roleTab, mode)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Sample Data
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AuthPage;
