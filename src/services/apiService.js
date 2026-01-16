// Generic API service for Dashboard, Automations, Agents, Admin, and Auth
import axios from "axios";
import { API } from "../types";

// Create axios instance with default config
console.log("ANTIGRAVITY_HMR_CHECK: API URL is", API);
const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth token
// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Try getting token specifically
    const token = localStorage.getItem('token');

    // Also check user object just in case
    const userStr = localStorage.getItem('user');

    let validToken = token;

    if (!validToken && userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.token) {
          validToken = userData.token;
        }
      } catch (e) {
        console.error('Error parsing user data in interceptor', e);
      }
    }

    if (validToken) {
      config.headers.Authorization = `Bearer ${validToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user data and redirect to login on unauthorized
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // --- Auth ---
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.warn('Backend login failed, falling back to mock auth for demo:', error.message);

      // Mock fallback for demo purposes
      if (credentials.email && credentials.password) {
        return {
          id: 'demo-user-123',
          name: 'Demo User',
          email: credentials.email,
          avatar: ''
        };
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to connect to server');
    }
  },

  async signup(userData) {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.warn('Backend signup failed, falling back to mock auth for demo:', error.message);

      // Mock fallback for demo purposes
      return {
        id: 'demo-user-' + Date.now(),
        name: userData.name,
        email: userData.email,
        avatar: ''
      };
    }
  },

  // --- Profile ---
  async getUserProfile() {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch profile:", error);
      throw error;
    }
  },

  async updateUserProfile(data) {
    try {
      const response = await apiClient.put('/user/profile', data);
      return response.data;
    } catch (error) {
      console.warn("Failed to update profile:", error);
      throw error;
    }
  },

  // --- Dashboard Stats ---
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      // Mock fallback
      return {
        totalChats: 24,
        activeAgents: 6,
        tokensUsed: 450230,
        savedTime: '18h 45m'
      };
    }
  },

  async getAdminOverviewStats() {
    try {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Backend admin stats failed:', error.message);
      throw error;
    }
  },

  async getAdminUserStats() {
    try {
      const response = await apiClient.get('/admin/stats/users');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return { total: 0, active: 0 };
    }
  },

  async getAdminVendorStats() {
    try {
      const response = await apiClient.get('/admin/stats/vendors');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch vendor stats:', error);
      return { total: 0, approved: 0, pending: 0 };
    }
  },

  async getAdminAgentStats() {
    try {
      const response = await apiClient.get('/admin/stats/agents');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch agent stats:', error);
      return { total: 0, active: 0, archive: 0 };
    }
  },

  async getAdminRevenueStats() {
    try {
      const response = await apiClient.get('/admin/stats/revenue');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch revenue stats:', error);
      return { totalRevenue: 0, platformFees: 0, vendorPayouts: 0 };
    }
  },

  // --- Agents ---
  async getCreatedAgents() {
    try {
      const response = await apiClient.get('/agents/created-by-me');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch created agents:", error);
      throw error;
    }
  },

  async getAgents() {
    try {
      const response = await apiClient.get('/agents');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      throw error;
    }
  },

  async createAgent(agentData) {
    try {
      const response = await apiClient.post('/agents', agentData);
      return response.data;
    } catch (error) {
      console.error("Failed to create agent:", error);
      throw error;
    }
  },

  async updateAgent(id, updates) {
    try {
      const response = await apiClient.put(`/agents/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Failed to update agent:", error);
      throw error;
    }
  },

  async deleteAgent(id) {
    try {
      await apiClient.delete(`/agents/${id}`);
      return true;
    } catch (error) {
      console.error("Failed to delete agent:", error);
      throw error;
    }
  },

  // --- Review Workflow ---
  async submitForReview(id) {
    try {
      const response = await apiClient.post(`/agents/submit-review/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to submit review:", error);
      throw error;
    }
  },

  async approveAgent(id, message) {
    try {
      const response = await apiClient.post(`/agents/approve/${id}`, { message });
      return response.data;
    } catch (error) {
      console.error("Failed to approve agent:", error);
      throw error;
    }
  },

  async approveDeletion(id) {
    try {
      const response = await apiClient.post(`/agents/admin/approve-deletion/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to approve deletion:", error);
      throw error;
    }
  },

  async rejectDeletion(id, reason) {
    try {
      const response = await apiClient.post(`/agents/admin/reject-deletion/${id}`, { reason });
      return response.data;
    } catch (error) {
      console.error("Failed to reject deletion:", error);
      throw error;
    }
  },

  // Dashboard Messaging
  async sendDashboardMessage(data) {
    try {
      const response = await apiClient.post('/dashboard-messages', data);
      return response.data;
    } catch (error) {
      console.error("Failed to send dashboard message", error);
      throw error;
    }
  },

  async getVendorDashboardMessages(vendorId) {
    try {
      const response = await apiClient.get(`/dashboard-messages/vendor/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch vendor dashboard messages", error);
      // Return empty array/object on failure to prevent UI crash
      return { success: false, data: [] };
    }
  },

  async rejectAgent(id, reason) {
    try {
      const response = await apiClient.post(`/agents/reject/${id}`, { reason });
      return response.data;
    } catch (error) {
      console.error("Failed to reject agent:", error);
      throw error;
    }
  },

  async approveDeletion(id) {
    try {
      const response = await apiClient.post(`/agents/admin/approve-deletion/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to approve deletion:", error);
      throw error;
    }
  },

  async rejectDeletion(id, reason) {
    try {
      const response = await apiClient.post(`/agents/admin/reject-deletion/${id}`, { reason });
      return response.data;
    } catch (error) {
      console.error("Failed to reject deletion:", error);
      throw error;
    }
  },

  async getVendorRevenue() {
    try {
      const response = await apiClient.get('/revenue/vendor');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch vendor revenue:", error);
      throw error;
    }
  },

  async getAdminRevenueStats() {
    try {
      const response = await apiClient.get('/revenue/admin');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch admin revenue:", error);
      // Fallback or rethrow
      return {
        overview: { totalGross: 0, totalVendorPayouts: 0, totalPlatformNet: 0 },
        appPerformance: []
      };
    }
  },

  async getVendorTransactions() {
    try {
      const response = await apiClient.get('/revenue/transactions');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch vendor transactions:", error);
      throw error;
    }
  },

  async getAdminTransactions() {
    try {
      const response = await apiClient.get('/revenue/admin/transactions');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch admin transactions:", error);
      return []; // Return empty array on error
    }
  },

  async downloadInvoice(transactionId) {
    try {
      const response = await apiClient.get(`/revenue/invoice/${transactionId}`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Failed to download invoice:", error);
      throw error;
    }
  },

  // --- Notifications ---
  async getNotifications() {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      console.warn("Using mock notifications");
      return [];
    }
  },

  async markNotificationRead(id) {
    try {
      const response = await apiClient.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  },

  // --- Automations ---
  async getAutomations() {
    try {
      const response = await apiClient.get('/automations');
      return response.data;
    } catch (error) {
      const stored = localStorage.getItem('mock_automations');
      if (stored) return JSON.parse(stored);

      const defaults = [
        { id: '1', name: 'Daily Digest', description: 'Summarize unread emails at 9 AM', active: true, type: 'Email' },
        { id: '2', name: 'Lead Qualifier', description: 'Score incoming leads from CRM', active: false, type: 'CRM' },
        { id: '3', name: 'Code Reviewer', description: 'Auto-review PRs on GitHub', active: true, type: 'Dev' },
        { id: '4', name: 'Meeting Notes', description: 'Transcribe and summarize Zoom calls', active: true, type: 'Productivity' }
      ];

      localStorage.setItem('mock_automations', JSON.stringify(defaults));
      return defaults;
    }
  },

  async toggleAutomation(id) {
    try {
      const response = await apiClient.post(`/automations/${id}/toggle`);
      return response.data;
    } catch (error) {
      const stored = JSON.parse(localStorage.getItem('mock_automations') || '[]');

      const updated = stored.map(a =>
        a.id === id ? { ...a, active: !a.active } : a
      );

      localStorage.setItem('mock_automations', JSON.stringify(updated));

      return updated.find(a => a.id === id);
    }
  },

  // --- Admin ---
  async getAdminSettings() {
    try {
      const response = await apiClient.get('/admin/settings');
      return response.data;
    } catch (error) {
      const stored = localStorage.getItem('mock_admin_settings');
      if (stored) return JSON.parse(stored);

      return {
        allowPublicSignup: true,
        defaultModel: 'gemini-2.5-flash',
        maxTokensPerUser: 500000,
        organizationName: 'ACME Corp'
      };
    }
  },

  async updateAdminSettings(settings) {
    try {
      const response = await apiClient.post('/admin/settings', settings);
      return response.data;
    } catch (error) {
      localStorage.setItem('mock_admin_settings', JSON.stringify(settings));
      return settings;
    }
  },

  async updateMaintenanceMode(enabled) {
    try {
      const response = await apiClient.post('/admin/settings/maintenance', { enabled });
      return response.data;
    } catch (error) {
      console.error("Failed to update maintenance mode:", error);
      throw error;
    }
  },

  async updateKillSwitch(enabled) {
    try {
      const response = await apiClient.post('/admin/settings/killswitch', { enabled });
      return response.data;
    } catch (error) {
      console.error("Failed to update kill switch:", error);
      throw error;
    }
  },

  async updateRateLimit(limit) {
    try {
      const response = await apiClient.post('/admin/settings/ratelimit', { limit });
      return response.data;
    } catch (error) {
      console.error("Failed to update rate limit:", error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const response = await apiClient.get('/user/all');
      return response.data;
    } catch (error) {
      console.warn('Backend get users failed, falling back to mock:', error.message);
      // Mock fallback
      return [
        { id: '1', name: 'Mock User 1', email: 'user1@example.com', role: 'user', status: 'Active', agents: [], spent: 120 },
        { id: '2', name: 'Mock User 2', email: 'user2@example.com', role: 'user', status: 'Active', agents: [], spent: 250 }
      ];
    }
  },

  async toggleBlockUser(id, isBlocked) {
    try {
      const response = await apiClient.put(`/user/${id}/block`, { isBlocked });
      return response.data;
    } catch (error) {
      console.error("Failed to block/unblock user:", error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      await apiClient.delete(`/user/${id}`);
      return true;
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },

  async getAdminTeam() {
    try {
      const response = await apiClient.get('/user/admin-team');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch admin team:", error);
      return [];
    }
  },

  async addAdmin(email) {
    try {
      const response = await apiClient.post('/user/add-admin', { email });
      return response.data;
    } catch (error) {
      console.error("Failed to add admin:", error);
      throw error;
    }
  },

  // --- Reports ---
  async submitReport(reportData) {
    try {
      const response = await apiClient.post('/reports/submit', reportData);
      return response.data;
    } catch (error) {
      console.warn("Backend report submission failed, using mock:", error.message);
      // Mock successful response for demo
      return { success: true, message: "Report submitted successfully (mock)" };
    }
  },

  async getReports() {
    try {
      const response = await apiClient.get('/reports');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      return [];
    }
  },

  async getMyReports() {
    try {
      const response = await apiClient.get('/reports/me');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch my reports:", error);
      return [];
    }
  },

  async deleteReport(id) {
    try {
      const response = await apiClient.delete(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete report:", error);
      throw error;
    }
  },
  async resolveReport(id, status, resolutionNote) {
    try {
      const response = await apiClient.put(`/reports/${id}/resolve`, { status, resolutionNote });
      return response.data;
    } catch (error) {
      console.error("Failed to resolve report:", error);
      throw error;
    }
  },

  // --- Support Tickets ---
  async submitSupportTicket(ticketData) {
    try {
      const response = await apiClient.post('/support', ticketData);
      return response.data;
    } catch (error) {
      console.error("Failed to submit support ticket:", error);
      throw error;
    }
  },

  async getUserSupportTickets(userId) {
    try {
      const response = await apiClient.get(`/support/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user support tickets:", error);
      return [];
    }
  },

  async replyToSupportTicket(ticketId, message, sender, senderId = null) {
    try {
      const response = await apiClient.post(`/support/${ticketId}/reply`, { message, sender, senderId });
      return response.data;
    } catch (error) {
      console.error("Failed to replying to support ticket:", error);
      throw error;
    }
  },

  // --- Support Chat ---
  async getMySupportChat(chatType = 'user_support') {
    try {
      const response = await apiClient.get(`/support-chat/my-chat?chatType=${chatType}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch support chat:", error);
      return null;
    }
  },

  async sendSupportChatMessage(chatId, text) {
    try {
      const response = await apiClient.post(`/support-chat/${chatId}/message`, { text });
      return response.data;
    } catch (error) {
      console.error("Failed to send support chat message:", error);
      throw error;
    }
  },

  async getAdminActiveChats() {
    try {
      const response = await apiClient.get('/support-chat/admin/active');
      console.log("[apiService] getAdminActiveChats Success:", response.data.length, "chats");
      return response.data;
    } catch (error) {
      console.error("[apiService] getAdminActiveChats Error:", error.response?.status, error.message);
      if (error.response?.data) {
        console.error("[apiService] Error details:", error.response.data);
      }
      throw error;
    }
  },

  async replyToVendorTicket(ticketId, message) {
    try {
      const response = await apiClient.post(`/reports/${ticketId}/reply`, { message });
      return response.data;
    } catch (error) {
      console.error("Failed to send reply:", error);
      throw error;
    }
  },

  // Vendor Chat APIs
  async getMyVendorChats() {
    try {
      const response = await apiClient.get('/vendor-chat/my-chats');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch vendor chats:", error);
      throw error;
    }
  },

  async getVendorActiveChats() {
    try {
      const response = await apiClient.get('/vendor-chat/vendor/active');
      console.log("[apiService] getVendorActiveChats Success:", response.data.length, "chats");
      return response.data;
    } catch (error) {
      console.error("[apiService] getVendorActiveChats Error:", error.response?.status, error.message);
      throw error;
    }
  },

  async sendVendorMessage({ vendorId, agentId, text }) {
    try {
      const response = await apiClient.post('/vendor-chat/message', { vendorId, agentId, text });
      return response.data;
    } catch (error) {
      console.error("Failed to send vendor message:", error);
      throw error;
    }
  },

  async sendVendorChatMessage(chatId, text) {
    try {
      const response = await apiClient.post(`/vendor-chat/${chatId}/message`, { text });
      return response.data;
    } catch (error) {
      console.error("Failed to send vendor chat message:", error);
      throw error;
    }
  },

  async getReportMessages(reportId) {
    try {
      const response = await apiClient.get(`/reports/${reportId}/messages`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch report messages:", error);
      return [];
    }
  },

  async sendReportMessage(reportId, message) {
    try {
      const response = await apiClient.post(`/reports/${reportId}/messages`, { message });
      return response.data;
    } catch (error) {
      console.error("Failed to send report message:", error);
      throw error;
    }
  },

  async contactVendor(data) {
    try {
      const response = await apiClient.post('/messages/contact-vendor', data);
      return response.data;
    } catch (error) {
      console.error("Failed to contact vendor:", error);
      throw error;
    }
  },

  async getVendorSupportMessages(userId) {
    try {
      const response = await apiClient.get(`/agents/vendor/${userId}/support?type=AdminSupport`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch vendor support messages:", error);
      return [];
    }
  },

  async getVendorMessages(vendorId) {
    try {
      const response = await apiClient.get(`/messages/vendor/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch vendor messages:", error);
      return { success: false, data: { messages: [] } };
    }
  },

  async getMessageById(id) {
    try {
      const response = await apiClient.get(`/messages/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch message:", error);
      throw error;
    }
  },

  async replyToMessage(data) {
    try {
      const response = await apiClient.post('/messages/send-reply', data);
      return response.data;
    } catch (error) {
      console.error("Failed to reply:", error);
      throw error;
    }
  },

  async adminDirectMessage(data) {
    try {
      const response = await apiClient.post('/messages/admin-direct', data);
      return response.data;
    } catch (error) {
      console.error("Failed to send admin direct message:", error);
      throw error;
    }
  },

  async updateMessageStatus(messageId, status) {
    try {
      const response = await apiClient.patch(`/messages/${messageId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Failed to update message status:", error);
      throw error;
    }
  },

  // Vendor Onboarding & Approval
  async registerVendor(data) {
    try {
      const response = await apiClient.post('/vendor/register', data);
      return response.data;
    } catch (error) {
      console.error("Vendor registration failed:", error);
      throw error;
    }
  },

  async loginVendor(credentials) {
    try {
      const response = await apiClient.post('/vendor/login', credentials);
      return response.data;
    } catch (error) {
      console.error("Vendor login failed:", error);
      throw error;
    }
  },

  async checkVendorStatus(email) {
    try {
      const response = await apiClient.get(`/vendor/status/${email}`);
      return response.data;
    } catch (error) {
      console.error("Status check failed:", error);
      throw error;
    }
  },

  async getPendingVendors() {
    try {
      const response = await apiClient.get('/vendor/admin/pending');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch pending vendors:", error);
      return { success: false, vendors: [], count: 0 };
    }
  },

  async getAllVendors(status = 'all') {
    try {
      const response = await apiClient.get(`/vendor/admin/all?status=${status}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      return { success: false, vendors: [], count: 0 };
    }
  },

  async approveVendor(id) {
    try {
      const response = await apiClient.patch(`/vendor/admin/approve/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to approve vendor:", error);
      throw error;
    }
  },

  async rejectVendor(id, reason) {
    try {
      const response = await apiClient.patch(`/vendor/admin/reject/${id}`, { reason });
      return response.data;
    } catch (error) {
      console.error("Failed to reject vendor:", error);
      throw error;
    }
  }
};

export default apiService;