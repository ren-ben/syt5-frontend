<template>
  <v-navigation-drawer
    width="240"
    permanent
    class="pa-4 elevation-1 d-flex flex-column"
  >
    <v-list density="comfortable" nav>
      <v-list-subheader class="text-uppercase text-subtitle-2 mb-2">
        Tables
      </v-list-subheader>

      <v-list-item
        v-for="t in tables"
        :key="t"
        :to="`/table/${t}`"
        :title="t.charAt(0).toUpperCase() + t.slice(1)"
        class="mb-1 rounded-lg"
        active-class="bg-primary text-white"
        @click="set(t)"
      />

      <!-- ADMIN SECTION -->
      <div v-if="authStore.isAdmin">
        <v-divider class="my-3"></v-divider>
        <!-- UPDATED: removed text-error, uses default theme color -->
        <v-list-subheader class="text-uppercase text-subtitle-2 mb-2">
          Admin
        </v-list-subheader>
        
        <!-- UPDATED: active-class is now primary (blue) -->
        <v-list-item
          to="/admin/approvals"
          prepend-icon="mdi-account-check"
          title="Approvals"
          class="mb-1 rounded-lg"
          active-class="bg-primary text-white"
        >
          <template v-slot:append>
             <v-badge v-if="pendingCount > 0" :content="pendingCount" color="error" inline />
          </template>
        </v-list-item>
      </div>
    </v-list>

    <v-spacer />

    <!-- UPDATED: Button hidden on approvals page -->
    <div v-if="!isApprovalsPage" class="d-flex justify-center pa-3 mt-auto">
      <v-btn
        icon="mdi-plus"
        color="primary"
        elevation="6"
        size="large"
        class="sidebar-create-btn"
        @click="$emit('create')"
      />
    </div>
  </v-navigation-drawer>

  <!-- UNIVERSAL CRUD DIALOG -->
  <CrudDialog
    :visible="showDialog"
    :mode="mode"
    :form="form"
    :fields="fields"
    @cancel="closeDialog"
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useTablesStore } from "@/stores/tables.store";
import { useAuthStore } from "@/stores/auth";
import { useRoute } from 'vue-router'; // Import useRoute
import CrudDialog from "@/components/crud/CrudDialog.vue";
import { createSample } from "@/services/tables/sample.service"; 
import { http } from '@/services/http'; 

const store = useTablesStore();
const authStore = useAuthStore();
const route = useRoute(); // Initialize route

const tables = store.tables;
const set = (t: string) => store.setActive(t);

// Check if current page is approvals
const isApprovalsPage = computed(() => route.path === '/admin/approvals');

// Badge State
const pendingCount = ref(0);

// Dialog State
const showDialog = ref(false);
const mode = ref<"create" | "edit">("create");
const form = ref<Record<string, any>>({});

// Dynamische Felder vom Store
const fields = computed(() => store.getFieldsForActive()); 

function closeDialog() {
  showDialog.value = false;
}

async function handleSave(localForm) {
  await createSample(localForm);
  closeDialog();
}

// Fetch pending count on mount if admin
onMounted(async () => {
  if (authStore.isAdmin) {
    try {
      const res = await http.get('/admin/pending-users/count');
      pendingCount.value = res.data.count;
    } catch (e) {
      console.warn('Failed to fetch pending count', e);
    }
  }
});
</script>

<style scoped>
/* Dark mode styles */
.v-theme--dark .v-navigation-drawer {
  background-color: #121212 !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

/* Light mode styles */
.v-theme--light .v-navigation-drawer {
  background-color: #ffffff !important;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.sidebar-create-btn {
  backdrop-filter: blur(8px);
  transition: all 0.25s ease;
}

.sidebar-create-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 12px rgba(100, 181, 246, 0.6);
}
</style>
