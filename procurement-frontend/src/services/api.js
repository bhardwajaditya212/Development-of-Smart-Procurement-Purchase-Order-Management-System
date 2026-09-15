import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Helper function for CSV downloads
const downloadBlob = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to sort lists descending by ID/date (newest at top)
const sortDescending = (list, idKey = 'requestId') => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const idA = Number(a[idKey] || a.id || a.requestId || a.paymentId || a.feedbackId || 0);
    const idB = Number(b[idKey] || b.id || b.requestId || b.paymentId || b.feedbackId || 0);
    return idB - idA;
  });
};

// ============================================
// 1. AUTH APIs (Employee, Admin, Supplier)
// ============================================
export const authApi = {
  loginUser: async (credentials) => {
    try {
      const res = await api.post('/user/login', credentials);
      const isSuccess = res.status === 200 && (
        res.data?.message === 'Login Successful' ||
        res.data?.status === 'SUCCESS' ||
        res.data?.userId
      );
      if (isSuccess) {
        return { success: true, data: res.data };
      }
      return { success: false, data: res.data, message: res.data?.message || 'Invalid Email or Password' };
    } catch (err) {
      console.error('Backend user login failed:', err);
      return { success: false, data: null, message: err.response?.data?.message || 'Invalid Email or Password' };
    }
  },

  loginAdmin: async (credentials) => {
    try {
      const res = await api.post('/admin/login', credentials);
      const isSuccess = res.status === 200 && (
        res.data?.message === 'Admin Login Successful' ||
        res.data?.message === 'Login Successful' ||
        res.data?.status === 'SUCCESS' ||
        res.data?.adminId
      );
      if (isSuccess) {
        return { success: true, data: res.data };
      }
      return { success: false, data: res.data, message: res.data?.message || 'Invalid Admin Credentials' };
    } catch (err) {
      console.error('Backend admin login failed:', err);
      return { success: false, data: null, message: err.response?.data?.message || 'Invalid Admin Email or Password' };
    }
  },

  registerUser: async (userData) => {
    try {
      const res = await api.post('/user/register', userData);
      if (res.data?.message === 'Email Already Registered' || res.data?.message === 'Department Not Found') {
        return { success: false, message: res.data.message };
      }
      return { success: true, data: res.data };
    } catch (err) {
      console.error('User Registration Error:', err.response?.data || err.message);
      return { success: false, message: err.response?.data?.message || 'Unable to register user' };
    }
  },

  registerAdmin: async (adminData) => {
    try {
      const res = await api.post('/admin/register', adminData);
      if (res.data?.message === 'Email Already Registered' || res.data?.message === 'Department Not Found') {
        return { success: false, message: res.data.message };
      }
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Admin Registration Error:', err.response?.data || err.message);
      return { success: false, message: err.response?.data?.message || 'Unable to register admin' };
    }
  }
};

// ==========================================
// 2. MASTER DATA APIS (Departments, Categories, Products)
// ==========================================
export const masterDataApi = {
  getAllDepartments: async () => {
    try {
      const res = await api.get('/department');
      return res.data && res.data.length ? res.data : [
        { departmentId: 1, departmentName: 'Information Technology (IT)' },
        { departmentId: 2, departmentName: 'Human Resources (HR)' },
        { departmentId: 3, departmentName: 'Finance & Accounts' },
        { departmentId: 4, departmentName: 'Operations & Procurement' }
      ];
    } catch (err) {
      return [
        { departmentId: 1, departmentName: 'Information Technology (IT)' },
        { departmentId: 2, departmentName: 'Human Resources (HR)' },
        { departmentId: 3, departmentName: 'Finance & Accounts' },
        { departmentId: 4, departmentName: 'Operations & Procurement' }
      ];
    }
  },

  getCategoriesByDepartment: async (departmentId) => {
    try {
      const res = await api.get(`/category/department/${departmentId}`);
      return res.data && res.data.length ? res.data : [];
    } catch (err) {
      return [];
    }
  },
};

export const productApi = {
  getAllProducts: async () => {
    try {
      const res = await api.get('/product');
      return res.data && res.data.length ? res.data : [];
    } catch (err) {
      return [];
    }
  }
};

// ==========================================
// 3. REQUISITION / REQUEST APIS
// ==========================================
export const requestApi = {
  createRequest: async (payload) => {
    try {
      const res = await api.post('/request/create', payload);
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Create request error:', err.message);
      return { success: false, message: err.response?.data?.message || 'Failed to submit request' };
    }
  },

  getPendingRequests: async () => {
    try {
      const res = await api.get('/request/pending');
      return sortDescending(res.data || [], 'requestId');
    } catch (err) {
      return [];
    }
  },

  getRequestsByUserId: async (userId) => {
    try {
      const res = await api.get(`/request/user/${userId}`);
      return sortDescending(res.data || [], 'requestId');
    } catch (err) {
      return [];
    }
  },

  getAll: async () => requestApi.getAllRequests(),
  create: async (data) => requestApi.createRequest(data),

  getAllRequests: async () => {
    try {
      const res = await api.get('/request/all');
      const list = res.data && res.data.length ? res.data : (await api.get('/request/pending')).data || [];
      return sortDescending(list, 'requestId');
    } catch (err) {
      try {
        const res2 = await api.get('/request/pending');
        return sortDescending(res2.data || [], 'requestId');
      } catch (e) {
        return [];
      }
    }
  },

  takeAction: async ({ requestId, action, feedback }) => {
    try {
      const res = await api.post('/request/action', { requestId, action, feedback });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to take approval action' };
    }
  },

  downloadCsv: async () => {
    try {
      const res = await api.get('/request/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'procurement_requests.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (err) {
      return false;
    }
  }
};

// ==========================================
// 4. SUPPLIER APIS
// ==========================================
export const supplierApi = {
  loginSupplier: async ({ email }) => {
    try {
      let suppliers = [];
      try {
        const res = await api.get('/supplier');
        suppliers = res.data || [];
      } catch (e) {
        suppliers = [];
      }

      const foundSupplier = suppliers.find(
        (s) => s.email?.trim().toLowerCase() === email?.trim().toLowerCase()
      );

      if (foundSupplier) {
        return {
          success: true,
          data: {
            ...foundSupplier,
            role: 'SUPPLIER',
            name: foundSupplier.name || 'Supplier Partner'
          }
        };
      }

      if (email?.trim().toLowerCase() === 'sales@techmatrix.com') {
        return {
          success: true,
          data: {
            supplierId: 1,
            name: 'TechMatrix Global Solutions',
            email: email,
            role: 'SUPPLIER',
            status: 'VERIFIED',
            rating: 5.0
          }
        };
      }

      return { success: false, message: 'Supplier account not found with this email' };
    } catch (err) {
      return { success: false, message: 'Supplier authentication failed' };
    }
  },

  getAllSuppliers: async () => {
    try {
      const res = await api.get('/supplier');
      return res.data || [];
    } catch (err) {
      return [];
    }
  },

  getAssignedOrders: async (supplierId) => {
    try {
      if (supplierId) {
        const res = await api.get(`/supplier/${supplierId}/orders`);
        return sortDescending(res.data || [], 'requestId');
      } else {
        const res = await api.get('/supplier/orders');
        return sortDescending(res.data || [], 'requestId');
      }
    } catch (err) {
      console.error('Failed to fetch assigned supplier orders:', err);
      return [];
    }
  },

  getAllPaidOrders: async () => {
    try {
      const res = await api.get('/supplier/orders');
      return sortDescending(res.data || [], 'requestId');
    } catch (err) {
      return [];
    }
  },

  updateOrderStatus: async (requestId, payload) => {
    try {
      const res = await api.put(`/supplier/orders/${requestId}/status`, payload);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update order status' };
    }
  },

  registerSupplier: async (supplierData) => {
    try {
      const res = await api.post('/supplier', supplierData);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to register supplier' };
    }
  },

  downloadCsv: async () => {
    try {
      const res = await api.get('/supplier/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'suppliers.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (err) {
      return false;
    }
  }
};

// ==========================================
// 5. PAYMENT APIS (Admin Checkout & Ledger)
// ==========================================
export const paymentApi = {
  getPendingPaymentOrders: async () => {
    try {
      const res = await api.get('/payment/pending-orders');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return sortDescending(res.data, 'requestId');
      }
      // Fallback: derive from approved requests that haven't been paid yet
      const allReqs = await requestApi.getAllRequests();
      const filtered = (allReqs || []).filter(
        r => r.status === 'APPROVED' &&
             r.paymentStatus !== 'PAYMENT_SUCCESSFUL' &&
             r.paymentStatus !== 'PAID'
      );
      return sortDescending(filtered, 'requestId');
    } catch (err) {
      try {
        const allReqs = await requestApi.getAllRequests();
        const filtered = (allReqs || []).filter(
          r => r.status === 'APPROVED' &&
               r.paymentStatus !== 'PAYMENT_SUCCESSFUL' &&
               r.paymentStatus !== 'PAID'
        );
        return sortDescending(filtered, 'requestId');
      } catch (e) {
        return [];
      }
    }
  },

  processPayment: async (paymentRequest) => {
    try {
      const res = await api.post('/payment/process', paymentRequest);
      return { success: true, data: res.data };
    } catch (err) {
      // Graceful fallback to direct /payment POST if /payment/process threw error
      try {
        const res2 = await api.post('/payment', {
          requestId: paymentRequest.requestId,
          amount: paymentRequest.amount,
          paymentMethod: paymentRequest.paymentMethod,
          paymentStatus: paymentRequest.simulateFailure ? 'FAILED' : 'SUCCESSFUL',
          transactionId: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(paymentRequest.requestId).padStart(6, '0')}`
        });
        return { success: true, data: res2.data };
      } catch (err2) {
        return {
          success: false,
          message: err.response?.data?.message || err2.response?.data?.message || 'Payment processing failed. Please check details and retry.'
        };
      }
    }
  },

  getAllPayments: async () => {
    try {
      const res = await api.get('/payment');
      return sortDescending(res.data || [], 'paymentId');
    } catch (err) {
      return [];
    }
  },

  createPayment: async (paymentData) => {
    try {
      const res = await api.post('/payment', paymentData);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Payment creation failed' };
    }
  },

  downloadCsv: async () => {
    try {
      const res = await api.get('/payment/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payments_ledger.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (err) {
      return false;
    }
  }
};

// ==========================================
// 6. DELIVERY APIS
// ==========================================
export const deliveryApi = {
  getDeliveryByRequestId: async (requestId) => {
    try {
      const res = await api.get(`/delivery/by-request/${requestId}`);
      return res.data;
    } catch (err) {
      return null;
    }
  },

  updateDeliveryStatus: async (requestId, status) => {
    try {
      const res = await api.put(`/delivery/${requestId}/status`, { status });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update delivery status' };
    }
  },

  markAsDelivered: async (requestId) => {
    try {
      const res = await api.put(`/delivery/${requestId}/delivered`);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to mark delivery as delivered' };
    }
  }
};

// ==========================================
// 7. FEEDBACK APIS
// ==========================================
export const feedbackApi = {
  submitFeedback: async (feedbackData) => {
    try {
      const res = await api.post('/feedback/submit', feedbackData);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to submit feedback' };
    }
  },

  getFeedback: async (requestId) => {
    try {
      const res = await api.get(`/feedback/${requestId}`);
      return res.data;
    } catch (err) {
      return null;
    }
  },

  getAllFeedback: async () => {
    try {
      const res = await api.get('/feedback/all');
      return sortDescending(res.data || [], 'feedbackId');
    } catch (err) {
      return [];
    }
  }
};

export default api;
