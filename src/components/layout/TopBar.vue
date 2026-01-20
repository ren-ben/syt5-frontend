<template>
  <div class="search-bar-container">
    <!-- Date Range Filter Section -->
    <div class="date-filter-container elevation-1 rounded-xl px-4 py-1">
      <div class="d-flex align-center" style="gap: 12px">
        <v-icon color="primary" icon="mdi-filter-outline" size="small" class="mr-1" />
        <span class="text-caption font-weight-bold text-medium-emphasis text-uppercase mr-2">Global Filter</span>
        
        <v-text-field
          v-model="dateFrom"
          type="datetime-local"
          label="Start (DateIn)"
          variant="plain"
          density="compact"
          hide-details
          class="date-input"
          style="min-width: 180px"
        />
        
        <v-icon icon="mdi-arrow-right" size="x-small" color="medium-emphasis" />
        
        <v-text-field
          v-model="dateTo"
          type="datetime-local"
          label="End (DateIn)"
          variant="plain"
          density="compact"
          hide-details
          class="date-input"
          style="min-width: 180px"
        />
        
        <v-btn 
          v-if="dateFrom || dateTo"
          icon="mdi-close" 
          size="x-small" 
          variant="text" 
          color="medium-emphasis"
          @click="clearDates"
          title="Clear Dates"
        />
      </div>
    </div>

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
import { useTheme } from 'vuetify';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useGlobalFilter } from '@/composables/useGlobalFilter';

const { dateFrom, dateTo } = useGlobalFilter();

const theme = useTheme();
const router = useRouter();
const authStore = useAuthStore();

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
  localStorage.setItem('theme', theme.global.name.value);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const clearDates = () => {
  dateFrom.value = '';
  dateTo.value = '';
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

/* New container for the date inputs to look like a single "bar" */
.date-filter-container {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.date-filter-container:focus-within {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
}

/* Custom styling to make the inputs look cleaner inside the bar */
:deep(.date-input .v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  font-size: 0.9rem;
}

:deep(.date-input .v-label) {
  font-size: 0.8rem;
}

.links {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
