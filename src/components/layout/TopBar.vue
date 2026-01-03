<template>
  <div class="search-bar-container">
    <v-text-field
      v-model="model"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search (doesn't work yet)…"
      hide-details
      class="search-field"
      density="comfortable"
      variant="outlined"
      rounded="xl"
    />

    <div class="links">

      <v-btn
        size="small"
        @click="$router.push('/reports')"
      >
        Reports
      </v-btn>

      <v-btn
        variant="text"
        size="small"
        href="http://localhost:8040/swagger-ui/index.html"
        target="_blank"
      >
        OpenAPI
      </v-btn>
      
      <!-- Theme Toggle Button -->
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
        @click="toggleTheme"
        variant="text"
        size="small"
      />

      <v-btn
        color="error"
        variant="text"
        size="small"
        prepend-icon="mdi-logout"
        @click="handleLogout"
      >
        Logout
      </v-btn>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from "vue";
import { useTheme } from 'vuetify';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const model = ref("");
const theme = useTheme();
const router = useRouter();
const authStore = useAuthStore();

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
  // Persist theme preference
  localStorage.setItem('theme', theme.global.name.value);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.search-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 0;
  gap: 16px;
}

.search-field {
  width: 50%;
  max-width: 600px;
}

.links {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
