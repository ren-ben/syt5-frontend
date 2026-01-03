import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true  // ADD THIS - enables cookies for CSRF token
});

// ADD THIS - Request interceptor to add CSRF token
http.interceptors.request.use(
  (config) => {
    // For POST, PUT, DELETE, PATCH requests, add CSRF token from cookie
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.request.use(config => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

http.interceptors.response.use(
  r => r,
  err => {
    const status = err?.response?.status;
    const message = err?.message;
    
    // JWT Logic: 401 means "Who are you?" (Invalid Token)
    if (status === 401) {
      console.warn('[HTTP] 401 Unauthorized - Logging out...');
      const authStore = useAuthStore();
      authStore.logout(); // Force logout
    } 
    // JWT Logic: 403 means "You are known, but not allowed" (Role issue)
    else if (status === 403) {
      console.error('[HTTP] 403 Forbidden - Insufficient permissions');
    } 
    else {
      console.error('[HTTP]', status, message);
    }
    
    throw err;
  }
);

/** composite key helper: turns {s_stamp, s_id} into "s_id,s_stamp" and URL-encodes */
export function encodeCompositeKey(parts: (string|number)[]) {
  return encodeURIComponent(parts.join(','));
}

export function decodeCompositeKey(encoded: string) {
  return decodeURIComponent(encoded).split(',');
}
