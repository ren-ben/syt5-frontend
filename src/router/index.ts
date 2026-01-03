import { createRouter, createWebHistory } from 'vue-router';
import TableWrapper from '@/components/tables/TableWrapper.vue';
import LoginView from '@/views/LoginView.vue';
import ApprovalsView from '@/views/ApprovalsView.vue'; // Make sure you created this file!
import { useAuthStore } from '@/stores/auth';
import ReportsView from '../views/ReportsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/login', 
      name: 'login', 
      component: LoginView,
      meta: { public: true } 
    },
    { 
      path: '/', 
      redirect: '/table/samples' 
    },
    { 
      path: '/table/:name', 
      name: 'table', 
      component: TableWrapper 
    },
    {
      path: '/admin/approvals',
      name: 'approvals',
      component: ApprovalsView,
      meta: { requiresAdmin: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
      meta: { requiresAuth: true }
    }
  ]
});

// Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // 1. If going to a protected route (NOT public) AND not logged in
  if (!to.meta.public && !isAuthenticated) {
    return next({ name: 'login' });
  }

  // 2. If logged in AND trying to access Login
  if (to.meta.public && isAuthenticated) {
    return next('/'); // Redirect to default home
  }

  // 3. Admin Check
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // If user tries to access admin route but isn't admin
    return next('/'); 
  }

  next();
});

export default router;
