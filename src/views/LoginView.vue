<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
// import { useAuthStore } from '@/stores/auth'; // UNCOMMENT THIS

const router = useRouter();
// const authStore = useAuthStore(); // UNCOMMENT THIS

const isLogin = ref(true);
const isLoading = ref(false);
const errorMessage = ref('');

const form = reactive({
  username: '',
  email: '',
  password: ''
});

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
};

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    if (isLogin.value) {
      console.log('Logging in with:', form.username, form.password);
      // await authStore.login(form);
      // router.push('/dashboard');
    } else {
      console.log('Registering with:', form);
      // await authStore.register(form);
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Authentication failed';
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
  </div>
</template>

<style scoped>
/* --- REFINED DARK THEME VARIABLES --- */
:root {
  --primary: #2196F3;         /* Vuetify Blue */
  --primary-hover: #1E88E5;   /* Slightly Darker Blue */
  --bg-page: #000000;         /* Pitch Black Page Background */
  --card-bg: #1E1E1E;         /* Dark Grey Card */
  --text-main: #FFFFFF;       /* Pure White Text */
  --text-muted: #9E9E9E;      /* Medium Grey Text */
  --input-bg: #2D2D2D;        /* Lighter Grey for Inputs */
  --input-border: #424242;    /* Subtle Border */
  --tab-bg: #121212;          /* Black Tab Bar */
  --tab-inactive: #757575;    /* Inactive Tab Text */
}

/* --- LAYOUT --- */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Subtle gradient to add depth */
  background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
  font-family: 'Roboto', sans-serif;
  padding: 1rem;
  color: var(--text-main);
}

.auth-card {
  background: var(--card-bg);
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  border-radius: 12px;
  /* Strong shadow to lift card off background */
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
  /* White Glow Effect */
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
  background: #333; /* Dark Grey Active State (Subtle) or use Primary */
  color: white;
  background: var(--primary); /* OPTION: Use Primary color for active tab */
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
  color: #E0E0E0; /* Lighter than muted for readability */
  margin-left: 2px;
}

input {
  padding: 0.9rem 1rem;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 6px;
  font-size: 1rem;
  color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

input::placeholder {
  color: #666;
  font-weight: 400;
}

input:focus {
  border-color: var(--primary);
  background-color: #333; /* Slightly lighter on focus */
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

/* --- ANIMATION --- */
.slide-in {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
