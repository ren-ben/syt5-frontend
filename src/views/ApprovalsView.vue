<template>
  <v-container>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4">Pending Approvals</h1>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-refresh" variant="text" @click="fetchPending"></v-btn>
    </div>

    <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = ''">
      {{ error }}
    </v-alert>

    <v-card v-if="pendingUsers.length === 0 && !loading" class="pa-8 text-center" color="transparent" flat>
      <v-icon icon="mdi-check-all" size="64" color="success" class="mb-4" style="opacity: 0.8"></v-icon>
      <div class="text-h6 text-medium-emphasis">All caught up!</div>
      <div class="text-body-2 text-disabled">No pending registrations found.</div>
    </v-card>

    <div v-else>
      <v-card v-for="user in pendingUsers" :key="user.id" class="mb-3" border flat>
        <v-list-item lines="two">
          <template v-slot:prepend>
            <v-avatar color="primary" variant="tonal">
              <v-icon>mdi-account-clock</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-bold text-body-1">{{ user.username }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>

          <template v-slot:append>
            <div class="d-flex align-center gap-3">
              <v-btn
                color="success"
                variant="tonal"
                prepend-icon="mdi-check"
                height="40"
                class="text-uppercase font-weight-bold px-4"
                :loading="processing === user.id"
                @click="approveUser(user.id)"
              >
                Approve
              </v-btn>

              <v-btn
                color="error"
                variant="text"
                icon="mdi-close-circle-outline"
                size="large"
                :loading="processing === user.id"
                @click="declineUser(user.id)"
                v-tooltip="'Reject'"
              ></v-btn>
            </div>
          </template>
        </v-list-item>
      </v-card>
    </div>
    
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { http } from '@/services/http';

interface PendingUser {
  id: number;
  username: string;
  email: string;
}

const pendingUsers = ref<PendingUser[]>([]);
const loading = ref(false);
const processing = ref<number | null>(null);
const error = ref('');

const fetchPending = async () => {
  loading.value = true;
  try {
    const res = await http.get('/admin/pending-users');
    pendingUsers.value = res.data;
  } catch (e) {
    console.error(e);
    error.value = "Failed to load pending users.";
  } finally {
    loading.value = false;
  }
};

const approveUser = async (id: number) => {
  processing.value = id;
  try {
    await http.post(`/admin/approve/${id}`);
    pendingUsers.value = pendingUsers.value.filter(u => u.id !== id);
  } catch (e) {
    error.value = "Approval failed.";
  } finally {
    processing.value = null;
  }
};

const declineUser = async (id: number) => {
  if (!confirm("Reject this user?")) return;
  processing.value = id;
  try {
    await http.delete(`/admin/users/${id}`);
    pendingUsers.value = pendingUsers.value.filter(u => u.id !== id);
  } catch (e) {
    error.value = "Rejection failed.";
  } finally {
    processing.value = null;
  }
};

onMounted(() => {
  fetchPending();
});
</script>

<style scoped>
.gap-3 { gap: 12px; }
</style>
