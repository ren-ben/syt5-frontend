import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { http } from '@/services/http';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token'));
  
  // Simple check: do we have a token?
  const isAuthenticated = computed(() => !!token.value);

  // Helper to save token based on "Remember Me"
  function saveToken(newToken: string, rememberMe: boolean) {
    token.value = newToken;
    if (rememberMe) {
      localStorage.setItem('jwt_token', newToken);
    } else {
      sessionStorage.setItem('jwt_token', newToken);
    }
  }

  // Login Action
  async function login(credentials: any, rememberMe: boolean) {
    try {
      // Calls your backend @PostMapping("/api/auth/login")
      const response = await http.post('/auth/login', credentials);
      
      // Expecting { "token": "ey..." }
      saveToken(response.data.token, rememberMe);
      
      // Redirect to home
      await router.push('/');
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  }

  // Register Action
  async function register(data: any) {
    try {
      const response = await http.post('/auth/register', data);
      // Log them in immediately after register
      saveToken(response.data.token, false); 
      await router.push('/');
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  }

  // Logout Action
  function logout() {
    token.value = null;
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
    router.push('/login');
  }

  return { token, isAuthenticated, login, register, logout };
});
