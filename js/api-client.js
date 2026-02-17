/**
 * API Client for ESG Board System
 * Handles communication with the backend API
 */

// 🔥 Use protocol-relative URL to automatically match the page's protocol (HTTP/HTTPS)
const API_BASE_URL = window.location.protocol + '//' + window.location.host + '/esg/api';

const ApiClient = {
    // Helper to get auth header
    getHeaders(isMultipart = false) {
        const token = localStorage.getItem('token'); // Assuming token is stored here
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
    },

    // Generic fetch wrapper
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    // Posts API
    posts: {
        async getAll(params = {}) {
            const queryString = new URLSearchParams(params).toString();
            return ApiClient.request(`/posts?${queryString}`);
        },

        async getById(id) {
            return ApiClient.request(`/posts/${id}`);
        },

        async create(formData) {
            return ApiClient.request('/posts', {
                method: 'POST',
                headers: ApiClient.getHeaders(true),
                body: formData
            });
        },

        async update(id, formData) {
            return ApiClient.request(`/posts/${id}`, {
                method: 'PUT',
                headers: ApiClient.getHeaders(true),
                body: formData
            });
        },

        async delete(id) {
            return ApiClient.request(`/posts/${id}`, {
                method: 'DELETE',
                headers: ApiClient.getHeaders()
            });
        }
    },

    // Partners API
    partners: {
        async getAll() {
            return ApiClient.request('/partners');
        }
    },

    // Government Agencies API
    government: {
        async getAll() {
            return ApiClient.request('/government');
        }
    },

    // Events API
    events: {
        async getMyStats() {
            return ApiClient.request('/events/my-stats', {
                headers: ApiClient.getHeaders()
            });
        },

        async getMyRegistrations() {
            return ApiClient.request('/events/my-registrations', {
                headers: ApiClient.getHeaders()
            });
        },

        async getUpcoming() {
            return ApiClient.request('/events/upcoming');
        },

        async register(eventPostId) {
            return ApiClient.request('/events/register', {
                method: 'POST',
                headers: ApiClient.getHeaders(),
                body: JSON.stringify({ event_post_id: eventPostId })
            });
        },

        async cancel(registrationId) {
            return ApiClient.request(`/events/${registrationId}/cancel`, {
                method: 'PUT',
                headers: ApiClient.getHeaders()
            });
        }
    }
};

// Export to global scope
window.ApiClient = ApiClient;
