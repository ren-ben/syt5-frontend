<script setup lang="ts">
import { ref } from 'vue';
import { http } from '@/services/http';

const loading = ref(false);
const selectedType = ref('samples');

// Default Range: Last 30 Days
const endDateObj = new Date();
const startDateObj = new Date();
startDateObj.setDate(endDateObj.getDate() - 30);

const startDate = ref(startDateObj.toISOString().slice(0, 16));
const endDate = ref(endDateObj.toISOString().slice(0, 16));

const reportTypes = [
  { title: 'Sample Report', value: 'samples', icon: 'mdi-flask-outline' },
  { title: 'Analysis Report', value: 'analysis', icon: 'mdi-microscope' },
  { title: 'Box Report', value: 'box', icon: 'mdi-package-variant' }
];

async function downloadPdf() {
  loading.value = true;
  try {
    const response = await http.get('/reports/pdf', {
      params: { type: selectedType.value, start: startDate.value, end: endDate.value },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${selectedType.value}_${startDate.value.slice(0,10)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error(err);
    alert("Failed to generate report.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container class="mt-12 d-flex justify-center" fluid>
    
    <v-card width="800" elevation="0" border class="pa-8 bg-surface">
      <div class="mb-8">
        <h1 class="text-h4 font-weight-bold mb-2">Export Reports</h1>
        <div class="text-body-1 text-medium-emphasis">
          Select a data type and time range to generate a PDF report.
        </div>
      </div>

      <v-form @submit.prevent="downloadPdf">
        
        <label class="text-subtitle-1 font-weight-bold mb-3 d-block">Report Type</label>
        
        <v-item-group v-model="selectedType" mandatory class="mb-8">
          <v-row>
            <v-col v-for="type in reportTypes" :key="type.value" cols="12" sm="4">
              <v-item v-slot="{ isSelected, toggle }" :value="type.value">
                <v-card
                    :color="isSelected ? 'primary' : 'surface'"
                    :variant="isSelected ? 'flat' : 'outlined'"
                    :class="['report-card', { 'selected': isSelected }]"
                    @click="toggle"
                    link
                    >
                    <div class="d-flex flex-column align-center report-card-content">
                        <v-icon :icon="type.icon" size="36" class="mb-3" />
                        <span class="text-h6">{{ type.title }}</span>
                    </div>
                </v-card>
              </v-item>
            </v-col>
          </v-row>
        </v-item-group>

        <label class="text-subtitle-1 font-weight-bold mb-3 d-block">Time Range</label>
        <v-row class="mb-6">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="startDate"
              type="datetime-local"
              label="Start Date"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="endDate"
              type="datetime-local"
              label="End Date"
              variant="outlined"
              hide-details
            />
          </v-col>
        </v-row>

        <v-btn
          color="primary"
          size="x-large"
          block
          height="56"
          class="text-none text-h6"
          :loading="loading"
          prepend-icon="mdi-file-download-outline"
          type="submit"
          flat
        >
          Generate Report
        </v-btn>

      </v-form>
    </v-card>
  </v-container>
</template>

<style scoped>
.report-card {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  border-color: rgba(255, 255, 255, 0.2) !important; /* Visible border */
}

/* FORCE TEXT COLOR TO BE VISIBLE WHEN NOT SELECTED */
.report-card:not(.selected) {
  color: rgba(255, 255, 255, 0.87) !important; /* High Emphasis White */
}

/* Optional: Make the icon slightly dimmer but still visible */
.report-card:not(.selected) .v-icon {
  color: rgba(255, 255, 255, 0.7) !important;
}

.report-card:not(.selected):hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}
</style>

