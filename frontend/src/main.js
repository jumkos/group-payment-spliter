import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import axios from 'axios';
import router from './router';
import { translations } from './utils/i18n';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: translations
});

const app = createApp(App);

// Configure axios
axios.defaults.baseURL = 'http://localhost:5000'; // Your backend URL
app.config.globalProperties.$http = axios;

// Use Vue Router and i18n
app.use(router);
app.use(i18n);

// Provide global properties
app.config.globalProperties.$formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Mount the app
app.mount('#app');