<template>
    <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ text }}</p>
    </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    text: {
      type: String,
      default: 'Loading...'
    }
  }
};
</script>

<style>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 1rem;
  color: inherit;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
