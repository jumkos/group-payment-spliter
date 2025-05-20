import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ShareView from '../views/ShareView.vue';
import HistoryView from '../views/HistoryView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/share/:id',
    name: 'Share',
    component: ShareView,
    props: true
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
