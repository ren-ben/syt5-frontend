<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">System Analysis & Reports</h1>
      <p class="text-medium-emphasis mt-1">
        Run diagnostic SQL functions to identify data inconsistencies and suspicious records.
      </p>
    </div>

    <v-row>
      <v-col cols="12" md="3">
        <v-card border elevation="0" class="position-sticky" style="top: 20px">
          <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">
            Analysis Type
          </v-card-title>
          
          <v-list density="compact" nav class="px-2">
            <v-list-item
              v-for="(item, i) in analysisTypes"
              :key="i"
              :value="item"
              :active="selectedAnalysis?.id === item.id"
              @click="selectAnalysis(item)"
              color="primary"
              rounded="lg"
              class="mb-1"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon" size="small" class="mr-2" />
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider class="my-2" />

          <div class="px-4 py-3">
            <label class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2 d-block">Time Range</label>
            <v-text-field
              v-model="startDate"
              type="datetime-local"
              label="Start"
              density="compact"
              variant="outlined"
              hide-details
              class="mb-3"
            />
            <v-text-field
              v-model="endDate"
              type="datetime-local"
              label="End"
              density="compact"
              variant="outlined"
              hide-details
              class="mb-4"
            />
            
            <v-btn
              block
              color="primary"
              :loading="loading"
              @click="runAnalysis"
              prepend-icon="mdi-play"
            >
              Run Analysis
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card border elevation="0" min-height="600">
          <!-- Toolbar -->
          <div class="d-flex align-center px-4 py-3 border-b">
            <div class="d-flex align-center">
              <v-icon :icon="selectedAnalysis?.icon" color="primary" class="mr-3" />
              <div>
                <h2 class="text-h6 font-weight-bold">{{ selectedAnalysis?.title || 'Select Analysis' }}</h2>
                <div class="text-caption text-medium-emphasis" v-if="results.length > 0">
                  Found {{ results.length }} records
                </div>
              </div>
            </div>
            
            <v-spacer />
            
            <v-btn
              v-if="results.length > 0"
              variant="outlined"
              size="small"
              prepend-icon="mdi-download"
              @click="exportToCSV"
            >
              Export CSV
            </v-btn>
          </div>

          <v-data-table
            v-if="results.length > 0"
            :headers="dynamicHeaders"
            :items="results"
            density="comfortable"
            hover
            class="bg-transparent"
          >
            <template v-slot:item.s_stamp="{ item }">
              {{ formatTime(item.s_stamp) }}
            </template>
             <template v-slot:item.date_in="{ item }">
              {{ formatTime(item.date_in) }}
            </template>
          </v-data-table>

          <div v-else-if="!loading && hasRun" class="d-flex flex-column align-center justify-center pa-12 text-center h-100">
            <v-icon icon="mdi-check-circle-outline" size="64" color="success" class="mb-4" />
            <h3 class="text-h6 text-medium-emphasis">No Issues Found</h3>
            <p class="text-body-2 text-disabled">No records matched the criteria for this time range.</p>
          </div>

          <div v-else-if="!hasRun" class="d-flex flex-column align-center justify-center pa-12 text-center h-100" style="opacity: 0.5">
            <v-icon icon="mdi-magnify-scan" size="64" class="mb-4" />
            <h3 class="text-h6">Ready to Analyze</h3>
            <p class="text-body-2">Select an analysis type and click Run.</p>
          </div>
          
           <div v-else class="d-flex flex-column align-center justify-center pa-12 h-100">
            <v-progress-circular indeterminate color="primary" size="48" />
            <div class="mt-4 text-caption text-uppercase font-weight-bold">Scanning Database...</div>
          </div>

        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { http } from '@/services/http';

interface AnalysisType {
  id: string;
  title: string;
  endpoint: string;
  icon: string;
}

// --- State ---
const loading = ref(false);
const hasRun = ref(false);
const results = ref<any[]>([]);
const selectedAnalysis = ref<AnalysisType | null>(null);

// Default Date Range (Last 7 Days)
const endObj = new Date();
const startObj = new Date();
startObj.setDate(endObj.getDate() - 7);
const startDate = ref(startObj.toISOString().slice(0, 16));
const endDate = ref(endObj.toISOString().slice(0, 16));

// --- Configuration: The 8 Tasks ---
const analysisTypes: AnalysisType[] = [
  { 
    id: 'no-analysis', 
    title: 'Containers without Analysis', 
    endpoint: '/reports/analysis/containers-without-analysis',
    icon: 'mdi-flask-empty-off-outline'
  },
  { 
    id: 'no-sample', 
    title: 'Containers without Sample ID', 
    endpoint: '/reports/analysis/containers-without-sample',
    icon: 'mdi-barcode-off'
  },
  { 
    id: 'suspicious', 
    title: 'Suspicious Sample IDs', 
    endpoint: '/reports/analysis/suspicious-samples',
    icon: 'mdi-alert-circle-outline'
  },
  { 
    id: 'no-pos', 
    title: 'Analysis without Box Position', 
    endpoint: '/reports/analysis/analysis-without-position',
    icon: 'mdi-map-marker-off-outline'
  },
  { 
    id: 'zero-vals', 
    title: 'Analysis with Zero/Null Values', 
    endpoint: '/reports/analysis/analysis-zero-values',
    icon: 'mdi-numeric-0-box-outline'
  },
  { 
    id: 'missing-time', 
    title: 'Analysis Missing Start/End Time', 
    endpoint: '/reports/analysis/analysis-missing-times',
    icon: 'mdi-clock-alert-outline'
  },
  { 
    id: 'multi-analysis', 
    title: 'Samples with Multiple Analyses', 
    endpoint: '/reports/analysis/samples-multiple-analysis',
    icon: 'mdi-content-duplicate'
  },
  { 
    id: 'bad-ean', 
    title: 'Invalid EAN13 Checksum', 
    endpoint: '/reports/analysis/samples-invalid-ean13',
    icon: 'mdi-barcode-scan'
  }
];

// Set default selection
selectedAnalysis.value = analysisTypes[0];

// --- Logic ---

function selectAnalysis(item: AnalysisType) {
  selectedAnalysis.value = item;
  hasRun.value = false;
  results.value = [];
}

async function runAnalysis() {
  if (!selectedAnalysis.value) return;
  
  loading.value = true;
  hasRun.value = false;
  results.value = [];

  try {
    const { data } = await http.get(selectedAnalysis.value.endpoint, {
      params: {
        start: startDate.value,
        end: endDate.value
      }
    });
    results.value = data;
    hasRun.value = true;
  } catch (e) {
    console.error(e);
    alert("Failed to fetch analysis data.");
  } finally {
    loading.value = false;
  }
}

// Dynamically generate table headers based on the first result item
const dynamicHeaders = computed(() => {
  if (results.value.length === 0) return [];
  
  const firstItem = results.value[0];
  return Object.keys(firstItem).map(key => ({
    title: formatHeader(key),
    key: key,
    sortable: true
  }));
});

// Helper to make "s_id" look like "Sample ID"
function formatHeader(key: string) {
  const map: Record<string, string> = {
    s_id: 'Sample ID',
    s_stamp: 'Timestamp',
    b_id: 'Box ID',
    bpos_id: 'Pos ID',
    a_id: 'Analysis ID',
    date_in: 'Date In',
    date_out: 'Date Out'
  };
  return map[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
}

function formatTime(val: string) {
  if (!val) return '-';
  return new Date(val).toLocaleString();
}

function exportToCSV() {
  if (!results.value.length) return;
  
  const headers = Object.keys(results.value[0]);
  const csvContent = [
    headers.join(','),
    ...results.value.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${selectedAnalysis.value?.id}_export.csv`);
  document.body.appendChild(link);
  link.click();
}
</script>

<style scoped>
/* Make the sidebar sticky */
.v-card.position-sticky {
  position: sticky;
  top: 20px;
  z-index: 1;
}
</style>
