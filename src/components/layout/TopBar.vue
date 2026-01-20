<template>
  <div class="search-bar-container">
    <!-- Date Range Filter Section -->
    <div class="date-filter-container elevation-1 rounded-xl px-4 py-2">
      <div class="d-flex align-center flex-wrap justify-center" style="gap: 16px">
        
        <!-- Label -->
        <div class="d-flex align-center">
          <v-icon color="primary" icon="mdi-filter-outline" size="small" class="mr-2" />
          <span class="text-caption font-weight-bold text-medium-emphasis text-uppercase">Global Filter</span>
        </div>
        
        <!-- Inputs Wrapper -->
        <div class="d-flex align-center" style="gap: 12px">
          <v-text-field
            v-model="tempDateFrom"
            type="datetime-local"
            label="Start Date (DateIn)"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="surface"
            class="date-input"
            style="min-width: 200px"
          />
          
          <v-icon icon="mdi-arrow-right" size="small" color="medium-emphasis" />
          
          <v-text-field
            v-model="tempDateTo"
            type="datetime-local"
            label="End Date (DateIn)"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="surface"
            class="date-input"
            style="min-width: 200px"
          />
        </div>

        <!-- Action Buttons -->
        <div class="d-flex align-center" style="gap: 8px">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            height="40"
            prepend-icon="mdi-check"
            @click="applyDates"
            :disabled="!isChanged"
          >
            Apply
          </v-btn>

          <v-btn 
            v-if="dateFrom || dateTo"
            icon="mdi-close" 
            size="small" 
            variant="text" 
            color="medium-emphasis"
            @click="clearDates"
            title="Clear Filter"
          />
        </div>
      </div>
    </div>

    <!-- Links Section (unchanged) -->
    <div class="links">
      <v-btn size="small" @click="$router.push('/reports')">Reports</v-btn>
      <v-btn variant="text" size="small" href="http://localhost:8040/swagger-ui/index.html" target="_blank">OpenAPI</v-btn>
      <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'" @click="toggleTheme" variant="text" size="small" />
      <v-btn color="error" variant="text" size="small" prepend-icon="mdi-logout" @click="handleLogout">Logout</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTheme } from 'vuetify';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useGlobalFilter } from '@/composables/useGlobalFilter';

const { dateFrom, dateTo } = useGlobalFilter();

// Local state for the inputs (so we don't trigger updates while typing)
const tempDateFrom = ref(dateFrom.value);
const tempDateTo = ref(dateTo.value);

// Sync local state if global state changes externally (e.g. cleared elsewhere)
watch([dateFrom, dateTo], () => {
  tempDateFrom.value = dateFrom.value;
  tempDateTo.value = dateTo.value;
});

const isChanged = computed(() => 
  tempDateFrom.value !== dateFrom.value || tempDateTo.value !== dateTo.value
);

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

const applyDates = () => {
  // Commit local values to the global store
  dateFrom.value = tempDateFrom.value;
  dateTo.value = tempDateTo.value;
};

const clearDates = () => {
  dateFrom.value = '';
  dateTo.value = '';
  tempDateFrom.value = '';
  tempDateTo.value = '';
};
</script>

<style scoped>
.search-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 0;
  gap: 16px;
  width: 100%;
}

.date-filter-container {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  max-width: 900px; /* Limit width so it doesn't stretch too far */
  width: 95%;
}

:deep(.date-input .v-field__input) {
  font-size: 0.9rem;
  font-family: monospace; /* Helps align numbers */
}

.links {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
