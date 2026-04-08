import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Login from '@/views/Login.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { public: true },
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { public: false },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  
  if (!to.meta.public && !auth.isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && auth.isAuthenticated) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
