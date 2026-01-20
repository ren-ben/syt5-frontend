<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Reports & Analysis</h1>
      <p class="text-medium-emphasis mt-1">
        Run diagnostic tools or export formal PDF reports for Samples, Analysis, and Boxes.
      </p>
    </div>

    <!-- Navigation Tabs -->
    <v-tabs v-model="tab" color="primary" class="mb-6 border-b">
      <v-tab value="analysis">
        <v-icon start icon="mdi-monitor-dashboard" />
        Diagnostic Analysis
      </v-tab>
      <v-tab value="pdf">
        <v-icon start icon="mdi-file-pdf-box" />
        Standard PDF Exports
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      
      <!-- TAB 1: DIAGNOSTIC ANALYSIS DASHBOARD -->
      <v-window-item value="analysis">
        <v-row>
          <!-- Left Column: Controls -->
          <v-col cols="12" md="3">
            <v-card border elevation="0" class="position-sticky" style="top: 20px">
               <v-list density="compact" nav class="pa-2">
                 <v-list-subheader class="font-weight-bold text-caption text-uppercase">Diagnostic Functions</v-list-subheader>
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
                      <v-icon :icon="item.icon" size="small" class="mr-2"/>
                    </template>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                  </v-list-item>
               </v-list>

               <v-divider />

               <div class="px-4 py-4">
                 <label class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2 d-block">Filter Range</label>
                 <v-text-field 
                    v-model="startDate" 
                    type="datetime-local" 
                    label="Start Date" 
                    density="compact" 
                    variant="outlined" 
                    hide-details 
                    class="mb-3"
                 />
                 <v-text-field 
                    v-model="endDate" 
                    type="datetime-local" 
                    label="End Date" 
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

          <!-- Right Column: Results -->
          <v-col cols="12" md="9">
             <v-card border elevation="0" min-height="600" class="d-flex flex-column">
               <!-- Result Header -->
               <div class="d-flex align-center px-4 py-3 border-b bg-grey-lighten-5">
                 <v-icon :icon="selectedAnalysis?.icon" color="primary" class="mr-3" />
                 <div>
                    <h2 class="text-subtitle-1 font-weight-bold">{{ selectedAnalysis?.title || 'Select Analysis' }}</h2>
                    <div class="text-caption text-medium-emphasis" v-if="results.length > 0">Found {{ results.length }} records</div>
                 </div>
                 
                 <v-spacer />
                 
                 <div v-if="hasRun || results.length > 0" class="d-flex gap-2">
                   <v-btn 
                      variant="text" 
                      size="small" 
                      color="medium-emphasis" 
                      prepend-icon="mdi-file-delimited" 
                      @click="exportToCSV"
                      :disabled="!results.length"
                   >
                      CSV
                   </v-btn>
                   <v-btn 
                      variant="flat" 
                      size="small" 
                      color="primary" 
                      prepend-icon="mdi-file-pdf-box" 
                      @click="downloadAnalysisPdf"
                      :loading="analysisPdfLoading"
                   >
                      Download PDF
                   </v-btn>
                 </div>
               </div>

               <!-- Result Table -->
               <v-data-table 
                  v-if="results.length > 0"
                  :headers="dynamicHeaders" 
                  :items="results" 
                  density="comfortable" 
                  hover 
                  class="bg-transparent flex-grow-1"
               >
                  <template v-slot:item.s_stamp="{ item }">{{ formatTime(item.s_stamp) }}</template>
                  <template v-slot:item.date_in="{ item }">{{ formatTime(item.date_in) }}</template>
                  <template v-slot:item.date_out="{ item }">{{ formatTime(item.date_out) }}</template>
               </v-data-table>

               <!-- States -->
               <div v-else-if="loading" class="d-flex flex-column align-center justify-center flex-grow-1" style="min-height: 400px">
                  <v-progress-circular indeterminate color="primary" size="48" />
                  <div class="mt-4 text-caption text-uppercase font-weight-bold text-medium-emphasis">Scanning Database...</div>
               </div>

               <div v-else-if="hasRun && results.length === 0" class="d-flex flex-column align-center justify-center flex-grow-1 text-center" style="min-height: 400px">
                  <v-icon icon="mdi-check-circle-outline" size="64" color="success" class="mb-4" />
                  <h3 class="text-h6 text-medium-emphasis">No Issues Found</h3>
                  <p class="text-body-2 text-disabled">No records matched the criteria.</p>
               </div>

               <div v-else class="d-flex flex-column align-center justify-center flex-grow-1 text-center" style="min-height: 400px; opacity: 0.5">
                  <v-icon icon="mdi-magnify-scan" size="64" class="mb-4" />
                  <h3 class="text-h6">Ready to Analyze</h3>
                  <p class="text-body-2">Select a function from the left and click Run.</p>
               </div>
             </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- TAB 2: STANDARD PDF EXPORTS (Your Original Functionality) -->
      <v-window-item value="pdf">
        <v-row justify="center" class="mt-8">
          <v-col cols="12" md="8" lg="6">
             <v-card border elevation="0" class="pa-8">
               <div class="text-center mb-8">
                 <h2 class="text-h5 font-weight-bold">Generate Standard Report</h2>
                 <p class="text-body-1 text-medium-emphasis">Select a data type to export standard records.</p>
               </div>

               <v-form @submit.prevent="downloadStandardPdf">
                 <label class="text-subtitle-2 font-weight-bold mb-3 d-block">Report Type</label>
                 <v-item-group v-model="selectedStandardPdfType" mandatory class="mb-6">
                   <v-row dense>
                     <v-col v-for="type in standardPdfTypes" :key="type.value" cols="12" sm="4">
                       <v-item v-slot="{ isSelected, toggle }" :value="type.value">
                         <v-card 
                            :color="isSelected ? 'primary' : 'surface'" 
                            :variant="isSelected ? 'flat' : 'outlined'" 
                            class="py-4 text-center cursor-pointer transition-swing" 
                            @click="toggle"
                            :class="{'elevation-2': isSelected}"
                          >
                           <v-icon :icon="type.icon" size="28" class="mb-2" />
                           <div class="text-subtitle-2">{{ type.title }}</div>
                         </v-card>
                       </v-item>
                     </v-col>
                   </v-row>
                 </v-item-group>

                 <label class="text-subtitle-2 font-weight-bold mb-3 d-block">Time Range</label>
                 <v-row class="mb-2">
                   <v-col cols="12" sm="6">
                     <v-text-field v-model="startDate" type="datetime-local" label="Start Date" density="comfortable" variant="outlined" hide-details />
                   </v-col>
                   <v-col cols="12" sm="6">
                     <v-text-field v-model="endDate" type="datetime-local" label="End Date" density="comfortable" variant="outlined" hide-details />
                   </v-col>
                 </v-row>

                 <v-btn 
                    size="x-large" 
                    block 
                    color="primary" 
                    type="submit" 
                    :loading="standardPdfLoading" 
                    prepend-icon="mdi-file-download-outline" 
                    class="mt-6"
                  >
                    Download Standard PDF
                 </v-btn>
               </v-form>
             </v-card>
          </v-col>
        </v-row>
      </v-window-item>

    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { http } from '@/services/http';

// --- Types ---
interface AnalysisType {
  id: string;
  title: string;
  endpoint: string;
  pdfEndpoint: string;
  icon: string;
}

// --- State ---
const tab = ref('analysis');
const loading = ref(false);
const analysisPdfLoading = ref(false);
const standardPdfLoading = ref(false);
const hasRun = ref(false);
const results = ref<any[]>([]);

// Shared Date Range (Last 30 Days)
const endObj = new Date();
const startObj = new Date();
startObj.setDate(endObj.getDate() - 30);
const startDate = ref(startObj.toISOString().slice(0, 16));
const endDate = ref(endObj.toISOString().slice(0, 16));

// --- TAB 1: DIAGNOSTIC ANALYSIS CONFIG ---
const analysisTypes: AnalysisType[] = [
  { 
    id: 'no-analysis', 
    title: 'Containers without Analysis', 
    endpoint: '/reports/analysis/containers-without-analysis',
    pdfEndpoint: '/reports/analysis/containers-without-analysis/pdf',
    icon: 'mdi-flask-empty-off-outline'
  },
  { 
    id: 'no-sample', 
    title: 'Containers without Sample ID', 
    endpoint: '/reports/analysis/containers-without-sample',
    pdfEndpoint: '/reports/analysis/containers-without-sample/pdf',
    icon: 'mdi-barcode-off'
  },
  { 
    id: 'suspicious', 
    title: 'Suspicious Sample IDs', 
    endpoint: '/reports/analysis/suspicious-samples',
    pdfEndpoint: '/reports/analysis/suspicious-samples/pdf',
    icon: 'mdi-alert-circle-outline'
  },
  { 
    id: 'no-pos', 
    title: 'Analysis without Box Position', 
    endpoint: '/reports/analysis/analysis-without-position',
    pdfEndpoint: '/reports/analysis/analysis-without-position/pdf',
    icon: 'mdi-map-marker-off-outline'
  },
  { 
    id: 'zero-vals', 
    title: 'Analysis with Zero/Null Values', 
    endpoint: '/reports/analysis/analysis-zero-values',
    pdfEndpoint: '/reports/analysis/analysis-zero-values/pdf',
    icon: 'mdi-numeric-0-box-outline'
  },
  { 
    id: 'missing-time', 
    title: 'Analysis Missing Start/End Time', 
    endpoint: '/reports/analysis/analysis-missing-times',
    pdfEndpoint: '/reports/analysis/analysis-missing-times/pdf',
    icon: 'mdi-clock-alert-outline'
  },
  { 
    id: 'multi-analysis', 
    title: 'Samples with Multiple Analyses', 
    endpoint: '/reports/analysis/samples-multiple-analysis',
    pdfEndpoint: '/reports/analysis/samples-multiple-analysis/pdf',
    icon: 'mdi-content-duplicate'
  },
  { 
    id: 'bad-ean', 
    title: 'Invalid EAN13 Checksum', 
    endpoint: '/reports/analysis/samples-invalid-ean13',
    pdfEndpoint: '/reports/analysis/samples-invalid-ean13/pdf',
    icon: 'mdi-barcode-scan'
  }
];

const selectedAnalysis = ref(analysisTypes[0]);

function selectAnalysis(item: AnalysisType) {
  selectedAnalysis.value = item;
  hasRun.value = false;
  results.value = [];
}

async function runAnalysis() {
  loading.value = true;
  hasRun.value = false;
  results.value = [];
  try {
    const { data } = await http.get(selectedAnalysis.value.endpoint, {
      params: { start: startDate.value, end: endDate.value }
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

async function downloadAnalysisPdf() {
  if (!selectedAnalysis.value) return;
  analysisPdfLoading.value = true;
  try {
    const response = await http.get(selectedAnalysis.value.pdfEndpoint, {
      params: { start: startDate.value, end: endDate.value },
      responseType: 'blob'
    });
    triggerDownload(response.data, `${selectedAnalysis.value.id}_analysis.pdf`);
  } catch (err) {
    console.error(err);
    alert("Failed to generate PDF.");
  } finally {
    analysisPdfLoading.value = false;
  }
}

// --- TAB 2: STANDARD PDF CONFIG ---
const selectedStandardPdfType = ref('samples');
const standardPdfTypes = [
  { title: 'Sample Report', value: 'samples', icon: 'mdi-flask-outline' },
  { title: 'Analysis Report', value: 'analysis', icon: 'mdi-microscope' },
  { title: 'Box Report', value: 'box', icon: 'mdi-package-variant' }
];

async function downloadStandardPdf() {
  standardPdfLoading.value = true;
  try {
    const response = await http.get('/reports/pdf', {
      params: { type: selectedStandardPdfType.value, start: startDate.value, end: endDate.value },
      responseType: 'blob'
    });
    triggerDownload(response.data, `standard_report_${selectedStandardPdfType.value}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Failed to generate report.");
  } finally {
    standardPdfLoading.value = false;
  }
}

// --- Helpers ---

// Generic download trigger
function triggerDownload(blobData: Blob, filename: string) {
  const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Create headers from first result row
const dynamicHeaders = computed(() => {
  if (results.value.length === 0) return [];
  const firstItem = results.value[0];
  return Object.keys(firstItem).map(key => ({
    title: formatHeader(key),
    key: key,
    sortable: true
  }));
});

function formatHeader(key: string) {
  const map: Record<string, string> = {
    s_id: 'Sample ID', s_stamp: 'Timestamp', b_id: 'Box ID', bpos_id: 'Position',
    a_id: 'Analysis ID', date_in: 'Date In', date_out: 'Date Out', count: 'Count', is_ean13: 'Valid EAN13'
  };
  return map[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
}

function formatTime(val: string) {
  return val ? new Date(val).toLocaleString() : '-';
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
  link.href = url;
  link.setAttribute("download", `${selectedAnalysis.value?.id}_export.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.gap-2 { gap: 8px; }
.position-sticky { position: sticky; top: 20px; z-index: 1; }
</style>
