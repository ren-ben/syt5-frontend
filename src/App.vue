<template>
  <v-app>
    <AppSidebar v-if="authStore.isAuthenticated" @create="onCreate" />
    
    <v-main>
      <TopBar v-if="authStore.isAuthenticated" />
      
      <router-view v-slot="{ Component }">
        <component :is="Component" ref="tableWrapper" />
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import TopBar from "@/components/layout/TopBar.vue";

const authStore = useAuthStore();
const tableWrapper = ref<any>(null);

const onCreate = () => tableWrapper.value?.openCreate?.();
</script>
