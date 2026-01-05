<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // INTEGRATED

const router = useRouter();
const authStore = useAuthStore(); // INTEGRATED

// --- STATE ---
const isLogin = ref(true); // Toggle between Login and Register
const isLoading = ref(false);

// --- SNACKBARS (Added back) ---
const successSnackbar = ref(false);
const successMessage = ref('');
const errorSnackbar = ref(false);
const errorMessage = ref('');

// --- FORM DATA ---
const form = reactive({
  username: '',
  email: '', 
  password: ''
});
const rememberMe = ref(false); // Added for login

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = ''; 
  // Optional: Reset form on toggle
  // form.username = ''; form.email = ''; form.password = '';
};

// --- ACTIONS ---
const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  errorSnackbar.value = false;

  try {
    if (isLogin.value) {
      // --- LOGIN LOGIC ---
      console.log('Logging in with:', form.username);
      // Pass username/password/rememberMe to store
      await authStore.login({ username: form.username, password: form.password }, rememberMe.value);
      
      // Router redirect is usually handled inside store or here
      // router.push('/dashboard'); 
    } else {
      // --- REGISTER LOGIC ---
      console.log('Registering with:', form);
      await authStore.register({ username: form.username, email: form.email, password: form.password });
      
      // Success handling
      successMessage.value = "Registration sent! Please wait for admin approval.";
      successSnackbar.value = true;
      
      // Switch back to login
      isLogin.value = true;
      form.password = ''; // Clear password
    }
  } catch (error: any) {
    console.error(error);
    errorMessage.value = error.response?.data?.message || (isLogin.value ? 'Login failed' : 'Registration failed');
    errorSnackbar.value = true;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      
      <!-- HEADER -->
      <div class="auth-header">
        <img src="@/assets/logo.png" alt="Venlab Logo" class="logo" />
        <h1 class="brand-name">Venlab</h1>
        <p class="credits">Made by Oliwier Przewlocki</p>
      </div>

      <!-- TABS -->
      <div class="auth-tabs">
        <button 
          :class="{ active: isLogin }" 
          @click="toggleMode">
          Login
        </button>
        <button 
          :class="{ active: !isLogin }" 
          @click="toggleMode">
          Register
        </button>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleSubmit" class="auth-form">
        
        <!-- Inline Error (Optional, duplicate of snackbar but good for UI) -->
        <div v-if="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input 
            id="username"
            v-model="form.username" 
            type="text" 
            placeholder="Username"
            required
          />
        </div>

        <!-- Email (Register Only) -->
        <div v-if="!isLogin" class="form-group slide-in">
          <label for="email">Email</label>
          <input 
            id="email"
            v-model="form.email" 
            type="email" 
            placeholder="Email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password"
            v-model="form.password" 
            type="password" 
            placeholder="Password"
            required
          />
        </div>

        <!-- Remember Me (Login Only) -->
        <div v-if="isLogin" class="form-group-checkbox slide-in">
          <label class="checkbox-container">
            <input type="checkbox" v-model="rememberMe">
            <span class="checkmark"></span>
            <span class="checkbox-label">Remember me</span>
          </label>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading">Processing...</span>
          <span v-else>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
        </button>
      </form>

      <div class="auth-footer">
        <p v-if="isLogin">New here? <a href="#" @click.prevent="toggleMode">Create an account</a></p>
        <p v-else>Already have an account? <a href="#" @click.prevent="toggleMode">Sign in</a></p>
      </div>

    </div>

    <!-- SNACKBARS (Hidden functionality, visible UI overlay) -->
    <!-- Note: We are using a simple CSS implementation for snackbars to match the style 
         instead of depending on V-Snackbar inside this raw CSS layout, 
         BUT since you have Vuetify installed, we can wrap the whole thing or just use fixed positioning -->
    
    <div v-if="successSnackbar" class="custom-snackbar success">
        <span>{{ successMessage }}</span>
        <button @click="successSnackbar = false">✕</button>
    </div>

    <div v-if="errorSnackbar" class="custom-snackbar error">
        <span>{{ errorMessage }}</span>
        <button @click="errorSnackbar = false">✕</button>
    </div>

  </div>
</template>

<style scoped>
/* --- REFINED DARK THEME VARIABLES --- */
:root {
  --primary: #2196F3;
  --primary-hover: #1E88E5;
  --bg-page: #000000;
  --card-bg: #1E1E1E;
  --text-main: #FFFFFF;
  --text-muted: #9E9E9E;
  --input-bg: #2D2D2D;
  --input-border: #424242;
  --tab-bg: #121212;
  --tab-inactive: #757575;
}

/* --- LAYOUT --- */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
  font-family: 'Roboto', sans-serif;
  padding: 1rem;
  color: var(--text-main);
  position: relative; /* For snackbars */
}

.auth-card {
  background: var(--card-bg);
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  border: 1px solid #333;
}

/* --- HEADER --- */
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  height: 64px;
  width: auto;
  margin-bottom: 1rem;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.15));
}

.brand-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  letter-spacing: 0.5px;
}

.credits {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
  font-weight: 400;
}

/* --- TABS --- */
.auth-tabs {
  display: flex;
  background: var(--tab-bg);
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
}

.auth-tabs button {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--tab-inactive);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.auth-tabs button.active {
  color: white;
  background: var(--primary);
}

/* --- FORM --- */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #E0E0E0;
  margin-left: 2px;
}

input[type="text"],
input[type="password"],
input[type="email"] {
  padding: 0.9rem 1rem;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 6px;
  font-size: 1rem;
  color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  width: 100%;
}

input::placeholder { color: #666; font-weight: 400; }

input:focus {
  border-color: var(--primary);
  background-color: #333;
  box-shadow: 0 0 0 1px var(--primary);
}

.submit-btn {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.submit-btn:hover {
  background-color: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.submit-btn:disabled {
  background-color: #333;
  color: #777;
  cursor: not-allowed;
  box-shadow: none;
}

/* --- CHECKBOX (Custom) --- */
.form-group-checkbox {
  display: flex;
  align-items: center;
}
.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.checkbox-container input {
  display: none;
}
.checkmark {
  width: 18px;
  height: 18px;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.2s;
}
.checkbox-container input:checked ~ .checkmark {
  background-color: var(--primary);
  border-color: var(--primary);
}
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

/* --- FOOTER --- */
.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.auth-footer a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.auth-footer a:hover {
  text-decoration: underline;
  color: var(--primary);
}

/* --- ALERTS & SNACKBARS --- */
.error-alert {
  background-color: rgba(211, 47, 47, 0.2);
  color: #FF5252;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
  border: 1px solid rgba(211, 47, 47, 0.5);
  margin-bottom: 0.5rem;
}

.custom-snackbar {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000;
    font-size: 0.9rem;
    min-width: 300px;
    justify-content: space-between;
    animation: slideDown 0.3s ease-out;
}

.custom-snackbar.success {
    background-color: #4CAF50; /* Green */
}

.custom-snackbar.error {
    background-color: #FF5252; /* Red */
}

.custom-snackbar button {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0.8;
}

/* --- ANIMATION --- */
.slide-in {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
