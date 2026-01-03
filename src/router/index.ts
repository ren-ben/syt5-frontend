import { createRouter, createWebHistory } from 'vue-router';
import TableWrapper from '@/components/tables/TableWrapper.vue';
import LoginView from '@/views/LoginView.vue'; // <--- Import this
import { useAuthStore } from '@/stores/auth'; // <--- Import store

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
      // Implicitly protected because it lacks meta.public
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

  next();
});

export default router;
