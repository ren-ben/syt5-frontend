import axios from 'axios';

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

// UPDATED - Response interceptor with better error logging
http.interceptors.response.use(
  r => r,
  err => {
    const status = err?.response?.status;
    const message = err?.message;
    
    if (status === 403) {
      console.error('[HTTP] 403 Forbidden - CSRF validation failed or access denied');
    } else {
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
