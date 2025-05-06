<template>
  <div :class="{ dark: isDarkMode }" class="app-container">
    <header class="app-header">
      <h1>{{ t('title') }}</h1>
      <div class="header-controls">
        <select 
          v-model="currentLang" 
          class="lang-select"
          :title="currentLang === 'en' ? 'Change Language' : 'Ubah Bahasa'"
        >
          <option value="en">English</option>
          <option value="id">Indonesia</option>
        </select>
        <button @click="toggleDarkMode" class="toggle-mode" :title="isDarkMode ? t('lightMode') : t('darkMode')">
          <svg v-if="isDarkMode" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </header>
    <main>
      <PaymentForm @history-updated="refreshHistory" />
      <HistoryPage ref="historyPage" />
    </main>
  </div>
</template>

<script>
import PaymentForm from './components/PaymentForm.vue';
import HistoryPage from './components/HistoryPage.vue';
import { translations } from './utils/i18n';
import { provide, ref } from 'vue';

export default {
  name: 'App',
  components: {
    PaymentForm,
    HistoryPage
  },
  setup() {
    const currentLang = ref(localStorage.getItem('language') || 'en');
    const t = (key) => translations[currentLang.value][key] || key;
    
    provide('currentLang', currentLang);
    provide('t', t);

    return {
      currentLang,
      t
    };
  },
  data() {
    return {
      isDarkMode: false
    };
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode);
    },
    loadDarkModePreference() {
      const darkMode = localStorage.getItem('darkMode');
      if (darkMode !== null) {
        this.isDarkMode = darkMode === 'true';
      } else {
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        localStorage.setItem('darkMode', this.isDarkMode);
      }
    },
    refreshHistory() {
      this.$refs.historyPage.fetchHistory();
    }
  },
  watch: {
    currentLang(newLang) {
      localStorage.setItem('language', newLang);
    }
  },
  mounted() {
    this.loadDarkModePreference();
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('darkMode') === null) {
        this.isDarkMode = e.matches;
        localStorage.setItem('darkMode', this.isDarkMode);
      }
    });
  }
};
</script>

<style>
/* Add CSS reset to ensure consistent styling */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #f8f9fa;
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
  display: flex;
  flex-direction: column;
}

.app-container.dark {
  background-color: #333;
  color: #f8f9fa;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #007bff;
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-header .toggle-mode {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.app-header .toggle-mode:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.icon {
  width: 24px;
  height: 24px;
}

main {
  flex: 1;
  padding: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lang-select {
  padding: 0.5rem;
  border-radius: 5px;
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.lang-select option {
  background-color: #007bff;
  color: white;
}

.dark .lang-select option {
  background-color: #1a202c;
}

@media (max-width: 768px) {
  .header-controls {
    gap: 0.5rem;
  }
  
  .lang-select {
    font-size: 0.875rem;
    padding: 0.4rem;
  }
}
</style>