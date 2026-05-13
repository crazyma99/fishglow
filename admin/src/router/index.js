import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/fish', component: () => import('../views/FishList.vue') },
  { path: '/review', component: () => import('../views/ReviewList.vue') },
  { path: '/users', component: () => import('../views/UserList.vue') },
];

export default createRouter({
  history: createWebHashHistory(),
  routes
});
