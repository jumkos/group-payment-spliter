<template>
  <div :class="{ dark: isDarkMode }" class="app-container">
    <header class="app-header">
      <h1>{{ t('orderHistory') }}</h1>
      <div class="header-controls">
        <router-link to="/" class="nav-button">
          {{ t('backToHome') }}
        </router-link>
        <select 
          v-model="currentLang" 
          class="lang-select"
          :title="currentLang === 'en' ? 'Change Language' : 'Ubah Bahasa'"
        >
          <option value="en">English</option>
          <option value="id">Indonesia</option>
        </select>
        <button 
          @click="toggleDarkMode" 
          class="toggle-mode"
          :title="isDarkMode ? t('lightMode') : t('darkMode')"
        >
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
      <HistoryPage ref="historyPage" />
    </main>
  </div>
</template>

<script>
import HistoryPage from '../components/HistoryPage.vue'
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'

export default {
  name: 'HistoryView',
  components: {
    HistoryPage
  },
  setup() {
    const { t } = useI18n()
    const currentLang = ref(localStorage.getItem('language') || 'en')
    const isDarkMode = ref(false)
    const historyPage = ref(null)
    
    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
      localStorage.setItem('darkMode', isDarkMode.value)
    }
    
    const loadDarkModePreference = () => {
      const darkMode = localStorage.getItem('darkMode')
      if (darkMode !== null) {
        isDarkMode.value = darkMode === 'true'
      } else {
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        localStorage.setItem('darkMode', isDarkMode.value)
      }
    }

    onMounted(() => {
      loadDarkModePreference()
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
          isDarkMode.value = e.matches
          localStorage.setItem('darkMode', isDarkMode.value)
        }
      })
    })

    return {
      currentLang,
      isDarkMode,
      t,
      toggleDarkMode,
      historyPage
    }
  }
}
</script>

<style scoped>
.app-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333;
  background-color: #f8f9fa;
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
  display: flex;
  flex-direction: column;
}

.app-container.dark {
  background-color: #1a202c;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-button {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lang-select {
  padding: 0.5rem;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: background-color 0.3s;
}

.lang-select:hover {
  background: rgba(255, 255, 255, 0.2);
}

.toggle-mode {
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

.toggle-mode:hover {
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
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  main {
    padding: 1rem;
  }

  .header-controls {
    gap: 0.5rem;
  }
  
  .lang-select {
    font-size: 0.875rem;
    padding: 0.4rem;
  }

  .app-header h1 {
    font-size: 1.25rem;
  }

  .nav-button {
    padding: 0.4rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
