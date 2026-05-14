/**
 * MediConnect API Client
 * Unified API client for frontend applications
 */

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000/api';

class APIClient {
  constructor(baseURL = API_GATEWAY_URL) {
    this.baseURL = baseURL;
    this.token = null;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Get authentication token
   */
  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Create singleton instance
const apiClient = new APIClient();

/**
 * Authentication API
 */
export const authAPI = {
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    if (response.success && response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.success && response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    apiClient.clearToken();
    return response;
  },

  async verifyToken() {
    return apiClient.get('/auth/verify');
  }
};

/**
 * AI API
 */
export const aiAPI = {
  async analyzeSymptoms(symptoms) {
    return apiClient.post('/ai/analyze-symptoms', { symptoms });
  },

  async chat(message, conversationHistory = []) {
    return apiClient.post('/ai/chat', { message, conversationHistory });
  },

  async getStatus() {
    return apiClient.get('/ai/status');
  }
};

/**
 * Patient API
 */
export const patientAPI = {
  async getProfile() {
    return apiClient.get('/patients/profile');
  },

  async updateProfile(data) {
    return apiClient.put('/patients/profile', data);
  },

  async getAppointments() {
    return apiClient.get('/patients/appointments');
  },

  async bookAppointment(appointmentData) {
    return apiClient.post('/patients/appointments', appointmentData);
  },

  async cancelAppointment(appointmentId) {
    return apiClient.delete(`/patients/appointments/${appointmentId}`);
  },

  async getMedicalHistory() {
    return apiClient.get('/patients/medical-history');
  }
};

/**
 * Doctor API
 */
export const doctorAPI = {
  async getAll() {
    return apiClient.get('/doctors');
  },

  async getById(doctorId) {
    return apiClient.get(`/doctors/${doctorId}`);
  },

  async getProfile() {
    return apiClient.get('/doctors/profile/me');
  },

  async updateProfile(data) {
    return apiClient.put('/doctors/profile', data);
  },

  async getAppointments() {
    return apiClient.get('/doctors/appointments/list');
  },

  async updateAppointment(appointmentId, status) {
    return apiClient.patch(`/doctors/appointments/${appointmentId}`, { status });
  },

  async getPatients() {
    return apiClient.get('/doctors/patients/list');
  },

  async addPrescription(prescriptionData) {
    return apiClient.post('/doctors/prescriptions', prescriptionData);
  }
};

/**
 * Emergency API
 */
export const emergencyAPI = {
  async getHospitals() {
    return apiClient.get('/emergency/hospitals');
  },

  async getAmbulances() {
    return apiClient.get('/emergency/ambulances');
  },

  async requestService(requestData) {
    return apiClient.post('/emergency/request', requestData);
  },

  async getContacts() {
    return apiClient.get('/emergency/contacts');
  },

  async trackAmbulance(requestId) {
    return apiClient.get(`/emergency/track/${requestId}`);
  }
};

/**
 * Admin API
 */
export const adminAPI = {
  async getUsers() {
    return apiClient.get('/admin/users');
  },

  async getStatistics() {
    return apiClient.get('/admin/statistics');
  },

  async updateDoctorStatus(doctorId, status) {
    return apiClient.patch(`/admin/doctors/${doctorId}/status`, { status });
  },

  async updateHospitalResources(hospitalId, resources) {
    return apiClient.put(`/admin/hospitals/${hospitalId}/resources`, resources);
  },

  async clearCache(pattern) {
    return apiClient.post('/admin/cache/clear', { pattern });
  },

  async getHealth() {
    return apiClient.get('/admin/health');
  }
};

export default apiClient;
