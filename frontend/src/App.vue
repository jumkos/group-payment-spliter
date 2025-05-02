<template>
  <div :class="{ dark: isDarkMode }" class="app-container">
    <header class="app-header">
      <h1>FairSplit</h1>
      <button @click="toggleDarkMode" class="toggle-mode">
        {{ isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode' }}
      </button>
    </header>
    <main>
      <PaymentForm />
      <HistoryPage />
    </main>
  </div>
</template>

<script>
import PaymentForm from './components/PaymentForm.vue';
import HistoryPage from './components/HistoryPage.vue';

export default {
  name: 'App',
  components: {
    PaymentForm,
    HistoryPage
  },
  data() {
    return {
      isDarkMode: false
    };
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
    }
  }
};
</script>

<style>
.app-container {
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #f8f9fa;
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
}
.app-container.dark {
  background-color: #333;
  color: #f8f9fa;
}
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
}
.app-header .toggle-mode {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}
.app-header .toggle-mode:hover {
  text-decoration: underline;
}
</style>