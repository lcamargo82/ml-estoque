import { createRouter, createWebHashHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/scanner',
    name: 'Scanner',
    component: () => import('../views/ScannerView.vue')
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/InventoryView.vue')
  },
  {
    path: '/products/add',
    name: 'AddProduct',
    component: () => import('../views/AddProductView.vue')
  },
  {
    path: '/movement',
    name: 'Movement',
    component: () => import('../views/MovementView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  
  // Inicializar o store se necessário (buscar token persistido)
  if (!auth.token) {
    await auth.initialize();
  }

  if (!to.meta.public && !auth.isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && auth.isAuthenticated) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router
