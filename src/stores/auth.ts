import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { http } from '@/services/http';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token'));
  
  // Initialize isAdmin from localStorage to persist across refreshes
  const isAdmin = ref<boolean>(localStorage.getItem('isAdmin') === 'true');

  const isAuthenticated = computed(() => !!token.value);

  function saveToken(newToken: string, rememberMe: boolean) {
    token.value = newToken;
    if (rememberMe) {
      localStorage.setItem('jwt_token', newToken);
    } else {
      sessionStorage.setItem('jwt_token', newToken);
    }
  }

  // Helper to parse JWT (simple decode)
  function checkAdminStatus(jwt: string, username?: string) {
    try {
      // Decode payload
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      const roles = payload.roles || []; 
      // Check if admin by role OR username
      if (username === 'admin' || roles.includes('ROLE_ADMIN')) {
        isAdmin.value = true;
      } else {
        isAdmin.value = false;
      }
      localStorage.setItem('isAdmin', String(isAdmin.value));
    } catch (e) {
      console.warn('Failed to parse JWT for roles', e);
      isAdmin.value = false;
    }
  }

  async function login(credentials: any, rememberMe: boolean) {
    try {
      // Calls your backend @PostMapping("/api/auth/login")
      const response = await http.post('/auth/login', credentials);
      
      const jwt = response.data.token;
      saveToken(jwt, rememberMe);
      
      // Check roles
      checkAdminStatus(jwt, credentials.username);
      
      // Redirect to home
      await router.push('/');
    } catch (error: any) {
      // If backend returns specific "Pending" error (handled via 403 usually)
      if (error.response?.status === 403 || error.response?.data?.includes('pending')) {
        throw new Error("Your account is pending admin approval.");
      }
      console.error("Login failed", error);
      throw error;
    }
  }

  async function register(data: any) {
    try {
      await http.post('/auth/register', data);
      // DO NOT auto-login. Let them wait for approval.
      // We just return success so the UI can show a "Pending" message.
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  }

  function logout() {
    token.value = null;
    isAdmin.value = false;
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
    localStorage.removeItem('isAdmin');
    router.push('/login');
  }

  return { token, isAuthenticated, isAdmin, login, register, logout };
});
