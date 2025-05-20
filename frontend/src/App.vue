<template>
  <router-view />
</template>

<script>
import { translations } from './utils/i18n';
import { provide, ref } from 'vue';

export default {
  name: 'App',
  setup() {
    const currentLang = ref(localStorage.getItem('language') || 'en');
    const t = (key) => translations[currentLang.value][key] || key;
    
    provide('currentLang', currentLang);
    provide('t', t);

    return {
      currentLang,
      t
    };
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

:root {
  --border-color: #dee2e6;
  --form-bg: #ffffff;
  --header-bg: #f8f9fa;
}

.dark {
  --border-color: #4a5568;
  --form-bg: #2d3748;
  --header-bg: #1a202c;
}

/* Base styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--form-bg);
  padding: 2rem;
  border-radius: 8px;
  max-width: 90%;
  width: 500px;
  color: inherit;
}

/* Success message styles */
.success-message {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #28a745;
  color: white;
  padding: 1rem 2rem;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
}

@keyframes slideIn {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Button styles */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

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
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  background-color: rgba(255, 255, 255, 0.2);
}

.lang-select option {
  background-color: #007bff;
  color: white;
  padding: 0.5rem;
}

.dark .lang-select option {
  background-color: #2d3748;
}

/* Responsive styles */
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
}
</style>