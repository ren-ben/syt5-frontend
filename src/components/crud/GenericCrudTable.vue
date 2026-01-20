<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed, reactive } from "vue";
import { http } from "@/services/http";
import CrudDialog from "./CrudDialog.vue";
import DeleteChoiceDialog from "./DeleteChoiceDialog.vue";
import ColumnSelector from "@/components/tables/ColumnSelector.vue";

const props = defineProps<{
  apiPath: string;
  headers: { key: string; title: string }[];
  defaultSort?: string;
  getId: (row: Record<string, any>) => string;
  createFn: (form: any) => Promise<any>;
  updateFn: (form: any) => Promise<any>;
  deleteFn: (id: any, row?: any) => Promise<any>;
  keyMap?: Record<string, string>;
  validateForm?: (form: any) => Promise<{ ok: boolean; message?: string }>;
  storageKey?: string;
  showExport?: boolean; // NEW PROP
}>();

const isSampleTable = computed(() => props.apiPath.includes("/samples"));

const emit = defineEmits<{
  (e: "created", row: any): void;
  (e: "updated", row: any): void;
  (e: "deleted", id: string): void;
}>();

// ========== State ==========
const rows = ref<any[]>([]);
const total = ref(0);
const loading = ref(false);
const page = ref(1);
const sortBy = ref<{ key: string; order: "asc" | "desc" }[]>([
  { key: props.defaultSort || props.headers[0]?.key || 'id', order: "desc" },
]);

// Filters (auto-created from headers)
const filters = ref<Record<string, string>>(
    Object.fromEntries(props.headers.map((h) => [h.key, ""]))
);

const visibleFields = computed(() => {
  const keys = props.headers.map(h => h.key);
  if (dialog.value.mode === 'create') {
    if (props.apiPath.includes('/analysis')) return keys.filter(k => k !== 'aId');
    return keys;
  }
  return keys;
});

// Dynamic rows
const itemsPerPage = ref(25);
const userChangedItemsPerPage = ref(false);

function recalcItemsPerPage() {
  const headerHeight = 250; // filters + headers
  const rowHeight = 42;
  const available = window.innerHeight - headerHeight;
  const auto = Math.max(5, Math.floor(available / rowHeight) - 2);
  if (!userChangedItemsPerPage.value) itemsPerPage.value = auto;
}

// Dialogs
const dialog = ref({
  visible: false,
  mode: "create" as "create" | "edit",
  form: {} as Record<string, any>,
});
const confirm = ref({ visible: false, target: null as Record<string, any> | null });
const boxDelete = ref({ visible: false, target: null as Record<string, any> | null });
const advancedDelete = ref({ visible: false, target: null as Record<string, any> | null });
const boxCascade = ref({ visible: false, target: null as any });

// Error Dialog State
const errorDialog = reactive({
  visible: false,
  message: ''
});

// Export State
const exportLoading = ref(false);
const snackbar = ref({ show: false, message: '', color: '' });

function showError(message: string) {
  errorDialog.message = message;
  errorDialog.visible = true;
}

// ========== Lifecycle ==========
onMounted(() => {
  recalcItemsPerPage();
  window.addEventListener("resize", recalcItemsPerPage);
  
  // Load saved columns from localStorage
  if (props.storageKey) {
    const saved = localStorage.getItem(props.storageKey);
    if (saved) {
      try {
        visibleColumns.value = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved columns', e);
      }
    }
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", recalcItemsPerPage);
});

// ========== Data Loading ==========
function mapKey(key: string) {
  // SAMPLE (composite)
  if (key === 'sId') return 'sample.id.sId';
  if (key === 'sStamp') return 'sample.id.sStamp';

  // ANALYSIS (nothing special)

  // **BOXPOS (composite ID)**
  if (props.apiPath.includes("/boxpos")) {
    if (key === "bposId") return "id.bposId";
    if (key === "bId") return "id.bId";
  }

  // BOX (simple field)
  if (props.apiPath.includes("/box")) {
    // Make sure "b_id" sorting works
    if (key === "bId") return "bId";
  }

  return key;
}

async function load() {
  loading.value = true;
  try {
    const sort = sortBy.value[0] ?? { key: props.headers[0]?.key, order: "asc" };

    const mappedFilters: Record<string, string> = {};
    for (const [k, v] of Object.entries(filters.value)) {
      if (v) mappedFilters[mapKey(k)] = v;
    }

    const mappedSort = { [mapKey(sort.key)]: sort.order };

    const { data } = await http.get(props.apiPath, {
      params: {
        page: page.value - 1,
        size: itemsPerPage.value,
        filter: mappedFilters,
        sort: mappedSort,
      },
    });

    function normalizeRow(a: any) {
      const id = a.id ?? {};

      return {
        ...a,
        // ===== Normalize ID naming across all tables =====
        bId: (
            a.bId ??
            id.bId ??
            a.bid ??
            id.bid ??
            a.b_id ??
            a.BID ??
            null
        ),
        // ===== normalize BoxPos ID =====
        bposId: a.bposId ?? id.bposId ?? null,
        // ===== normalize Sample foreign keys =====
        sId: (
            a.sId ??
            a.s_id ??
            a.sample?.id?.sId ??
            a.sample?.s_id ??
            null
        ),
        sStamp: (
            a.sStamp ??
            a.s_stamp ??
            a.sample?.id?.sStamp ??
            a.sample?.s_stamp ??
            null
        ),
        // ===== Date normalization =====
        dateExported: a.dateExported ?? a.date_exported ?? null,
        id // keep raw but never display directly
      };
    }

    rows.value = (data.content ?? []).map(normalizeRow);
    total.value = data.total_elements ?? data.totalElements ?? 0;

  } catch (err) {
    console.error("Load failed:", err);
  } finally {
    loading.value = false;
  }
}

const readonlyKeys = computed(() => {
  if (props.apiPath.includes('/samples')) return ['s_id','s_stamp'];
  if (props.apiPath.includes('/analysis')) return ['aId'];
  if (props.apiPath === '/box') return ['bId'];
  if (props.apiPath === '/boxpos') return [];
  const autoIds = props.headers.map(h=>h.key).filter(k => k==='id');
  return autoIds;
});

watch([page, itemsPerPage, sortBy, filters], load, { deep: true, immediate: true });

// ========== CRUD Actions ==========
function openCreate(defaults?: Record<string, any>) {
  dialog.value.mode = "create";

  const base = props.apiPath.includes("/samples")
      ? {
        s_id: String(Math.floor(Math.random() * 1e13)).padStart(13, "0"),
        s_stamp: new Date().toISOString().slice(0, 19),
      }
      : {};

  dialog.value.form = { ...base, ...(defaults ?? {}) };
  dialog.value.visible = true;
}

defineExpose({ openCreate });

function openEdit(item: any) {
  dialog.value = { visible: true, mode: "edit", form: { ...item } };
}

async function save(payload?: any) {
  const mode = dialog.value.mode;
  const form = payload ?? dialog.value.form;

  // 1. Perform Validation BEFORE saving
  if (props.validateForm) {
    loading.value = true;
    try {
      const validation = await props.validateForm(form);

      if (!validation.ok) {
        showError(validation.message ?? 'Validation failed');
        loading.value = false;
        return; // STOP HERE if validation fails
      }
    } catch (e) {
      console.error("Validation error:", e);
      showError("An error occurred during validation");
      loading.value = false;
      return;
    }
  }

  // 2. Proceed with Save if Validation passes
  try {
    if (mode === "create") {
      console.log("SAVE FORM = ", JSON.stringify(form, null, 2));
      await props.createFn(form);
      emit("created", form);
    } else {
      await props.updateFn(form);
      emit("updated", form);
    }
    dialog.value.visible = false;
    load();
  } catch (err: any) {
    console.error("Save failed:", err);
    showError(err.message || "Save operation failed");
  } finally {
    loading.value = false;
  }
}

function updateItemsPerPage(v: number | boolean) {
  userChangedItemsPerPage.value = true;
  if (v !== false) itemsPerPage.value = Number(v);
}

async function remove() {
  const target = confirm.value.target;
  if (!target) return;

  try {
    await props.deleteFn(props.getId ? props.getId(target) : target.id, target);

    confirm.value.visible = false;
    load();
  } catch (err: any) {
    console.warn("Delete failed:", err);
    const status = err.response?.status;

    if (
        props.apiPath.includes("/box") &&
        (err?.code === "NEEDS_CASCADE" || status === 409)
    ) {
      console.log(target)
      confirm.value.visible = false;

      const ok = window.confirm(
          `Die Box "${target.bId}" hat noch BoxPos Einträge.\n` +
          `Willst du die Box *komplett inkl. allen BoxPos löschen?*\n\n` +
          `→ OK = CASCADE\n→ Cancel = nix passiert`
      );

      if (ok) {
        await http.delete(`/box/advanced/${target.bId}`, {
          params: { action: "cascade" }
        });
        load();
      }
      return;
    }

    if (props.apiPath.includes("/samples") && status === 409) {
      confirm.value.visible = false;
      advancedDelete.value = { visible: true, target };
      return;
    }

    alert("löschen blockiert. Da hängt noch irgendwas dran.");
  }
}

async function performAdvancedDelete(action: "cascade" | "detach") {
  const t = advancedDelete.value.target;
  if (!t) return;

  if (props.apiPath.includes("/box")) {
    await http.delete(`/api/box/advanced/${t.bId}`, { params: { action } });
    advancedDelete.value.visible = false;
    load();
    return;
  }

  try {
    await http.delete(`/samples/advanced/${t.s_id},${t.s_stamp}`, {
      params: { action },
    });
    advancedDelete.value.visible = false;
    load();
  } catch (err: any) {
    console.error("Advanced delete failed", err);

    const raw = err.response?.data;
    const message =
        typeof raw === "string"
            ? raw
            : typeof raw === "object"
                ? JSON.stringify(raw)
                : "";

    if (err.response?.status === 409 && message.includes("analysis")) {
      advancedDelete.value = { visible: true, target: t };
      return;
    }

    if (err.response?.status === 409 && message.includes("boxpos")) {
      boxDelete.value = { visible: true, target: t };
      return;
    }

    if (err.response?.status === 409) {
      alert("Delete blocked — related data (analysis or boxpos) still exists.");
      return;
    }

    console.error("Unexpected delete error:", err);
  }
}

function askDelete(item: any) {
  confirm.value = { visible: true, target: item };
}

const visibleColumns = ref<string[]>(
  props.headers.map(h => h.key)
);

watch(visibleColumns, (newValue) => {
  if (props.storageKey) {
    localStorage.setItem(props.storageKey, JSON.stringify(newValue));
  }
}, { deep: true });

const filteredHeaders = computed(() => {
  return props.headers.filter(h => visibleColumns.value.includes(h.key));
});
// ... inside script setup ...

// REMOVE THIS LINE:
// import { useAxios } from "@/composables/useAxios"; 

async function exportToCSV() {
  exportLoading.value = true;
  try {
    const params = new URLSearchParams();
    
    // Add pagination
    params.append('page', '0');
    params.append('size', String(Math.max(total.value, 10000))); 
    
    // Add filters
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value) {
        params.append(`filter[${mapKey(key)}]`, String(value));
      }
    });
    
    // Add sort
    if (sortBy.value.length > 0) {
      const sort = sortBy.value[0];
      params.append(`sort[${mapKey(sort.key)}]`, sort.order);
    }
    
    // FIX: Use 'http' directly instead of useAxios()
    const response = await http.get(`${props.apiPath}/export/csv?${params}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Filename logic
    const contentDisposition = response.headers['content-disposition'];
    let filename = `${props.apiPath.replace('/', '')}_export.csv`;
    if (contentDisposition) {
        const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
        if (matches && matches[1]) filename = matches[1];
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    snackbar.value = { show: true, message: 'Export successful', color: 'success' };
  } catch (error: any) {
    console.error("Export failed", error);
    snackbar.value = { 
        show: true, 
        message: error.response?.data?.message || 'Export failed', 
        color: 'error' 
    };
  } finally {
    exportLoading.value = false;
  }
}

</script>

<template>
  <v-card flat>
    <v-toolbar flat density="compact" color="transparent">
      <v-spacer />
      
      <!-- Export Button -->
      <v-btn 
        v-if="showExport"
        icon
        variant="text" 
        :loading="exportLoading"
        @click="exportToCSV"
        class="mr-2"
        color="primary"
      >
        <v-icon>mdi-download</v-icon>
        <v-tooltip activator="parent" location="bottom">Export CSV</v-tooltip>
      </v-btn>

      <ColumnSelector
        :headers="props.headers"
        v-model="visibleColumns"
      />
    </v-toolbar>

    <v-data-table-server
        :headers="[...filteredHeaders, { key: 'actions', title: 'Actions' }]"
        :items="rows"
        :items-length="total"
        :loading="loading"
        :page="page"
        :items-per-page="itemsPerPage"
        :sort-by="sortBy"
        @update:page="page = $event"
        @update:items-per-page="updateItemsPerPage"
        @update:sort-by="sortBy = $event"
        density="comfortable"
    >
      <!-- Filters -->
      <template #top>
        <v-row class="pa-2" align="center">
          <v-col v-for="h in filteredHeaders" :key="h.key" cols="12" sm="2">
            <v-text-field
                :label="`Filter ${h.key}`"
                v-model="filters[h.key]"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                :data-cy="`filter-${h.key}`"
            />
          </v-col>
        </v-row>
      </template>

      <!-- Rows -->
      <template #item="{ item }">
        <tr>
          <td v-for="h in filteredHeaders" :key="h.key">{{ item[h.key] }}</td>
          <td class="text-right">
            <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" @click="openEdit(item)" />
            <v-btn icon="mdi-delete" size="small" color="error" variant="text" @click="askDelete(item)" />
          </td>
        </tr>
      </template>
    </v-data-table-server>

    <!-- Dialogs -->
    <CrudDialog
        v-model:visible="dialog.visible"
        :mode="dialog.mode"
        :form="dialog.form"
        :fields="visibleFields"
        :readonlyKeys="readonlyKeys"
        @save="save"
        @cancel="dialog.visible = false"
    />

    <v-dialog v-model="confirm.visible" width="420">
      <v-card class="pa-4" style="backdrop-filter: blur(10px);">
        <v-card-title>Delete item?</v-card-title>
        <v-card-text>
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirm.visible = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="remove">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <DeleteChoiceDialog
        v-model:visible="advancedDelete.visible"
        :target-name="advancedDelete.target?.name"
        @cancel="advancedDelete.visible = false"
        @choose="performAdvancedDelete"
    />

    <v-dialog v-model="errorDialog.visible" max-width="400">
      <v-card>
        <v-card-title class="text-h5 text-error">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Validation Error
        </v-card-title>
        <v-card-text class="pt-4">
          {{ errorDialog.message }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="errorDialog.visible = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for Export Status -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.message }}
        <template v-slot:actions>
            <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
        </template>
    </v-snackbar>
  </v-card>
</template>

<style scoped>
/* 1. Force the table container to have the surface background */
:deep(.v-table),
:deep(.v-table__wrapper) {
  background-color: rgb(var(--v-theme-surface)) !important;
}

/* 2. Force every row and cell to be opaque surface color */
:deep(.v-data-table__tr),
:deep(.v-data-table__td) {
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}

/* 3. Handle the sticky header specifically */
:deep(.v-data-table-header__content),
:deep(.v-data-table__th) {
  background-color: rgb(var(--v-theme-surface)) !important;
  z-index: 10 !important; /* Ensure it stays on top */
}

/* 4. Fix for hover state (optional, keeps it dark on hover) */
:deep(.v-data-table__tr:hover > td) {
  background-color: rgba(var(--v-theme-on-surface), 0.08) !important;
}
</style>
