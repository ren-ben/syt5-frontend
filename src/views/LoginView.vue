<template>
    <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" lg="3">
        <v-card class="elevation-4 rounded-lg">
          <v-tabs v-model="tab" color="primary" grow>
            <v-tab value="login">Login</v-tab>
            <v-tab value="register">Register</v-tab>
          </v-tabs>

          <v-card-text class="pa-6">
            <v-window v-model="tab">
              <v-window-item value="login">
                <v-form @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="loginForm.username"
                    label="Username"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  ></v-text-field>
                  <v-text-field
                    v-model="loginForm.password"
                    label="Password"
                    prepend-inner-icon="mdi-lock"
                    type="password"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                  
                  <v-checkbox
                    v-model="rememberMe"
                    label="Remember me"
                    color="primary"
                    hide-details
                    class="mb-4"
                  ></v-checkbox>

                  <v-btn block color="primary" size="large" type="submit" :loading="loading">
                    Login
                  </v-btn>
                </v-form>
              </v-window-item>

              <!-- REGISTER FORM -->
              <v-window-item value="register">
                <v-form @submit.prevent="handleRegister">
                  <v-text-field
                    v-model="registerForm.username"
                    label="Username"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  ></v-text-field>
                  <v-text-field
                    v-model="registerForm.email"
                    label="Email"
                    prepend-inner-icon="mdi-email"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  ></v-text-field>
                  <v-text-field
                    v-model="registerForm.password"
                    label="Password"
                    prepend-inner-icon="mdi-lock"
                    type="password"
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                  ></v-text-field>

                  <v-btn block color="secondary" size="large" type="submit" :loading="loading">
                    Register
                  </v-btn>
                </v-form>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

      <v-snackbar v-model="successSnackbar" color="success" timeout="5000">
        <div class="d-flex align-center">
            <v-icon icon="mdi-check-circle" class="mr-2"></v-icon>
            {{ successMessage }}
            </div>
            <template v-slot:actions>
            <v-btn variant="text" @click="successSnackbar = false">Close</v-btn>
        </template>
     </v-snackbar>
    
    <v-snackbar v-model="errorSnackbar" color="error">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="errorSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const successSnackbar = ref(false);
const successMessage = ref('');

const authStore = useAuthStore();
const tab = ref('login');
const loading = ref(false);
const rememberMe = ref(false);
const errorSnackbar = ref(false);
const errorMessage = ref('');

const loginForm = ref({ username: '', password: '' });
const registerForm = ref({ username: '', email: '', password: '' });

const handleLogin = async () => {
  loading.value = true;
  try {
    await authStore.login(loginForm.value, rememberMe.value);
  } catch (e: any) {
    errorMessage.value = "Login failed. Check your credentials.";
    errorSnackbar.value = true;
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  loading.value = true;
  try {
    await authStore.register(registerForm.value);
    
    successMessage.value = "Registration sent! Please wait for admin approval.";
    successSnackbar.value = true;
    
    tab.value = 'login';
    
    registerForm.value = { username: '', email: '', password: '' };
    
  } catch (e: any) {
    errorMessage.value = "Registration failed.";
    errorSnackbar.value = true;
  } finally {
    loading.value = false;
  }
};
</script>
