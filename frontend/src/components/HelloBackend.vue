<template>
  <div>
    <h1>Frontend Connected to Backend</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Loading...'
    }
  },
  async created() {
    try {
        const response = await this.$http.get('/');
        console.log('Response:', response);
        this.message = response.data;
    } catch (error) {
        console.error('Error:', error);
        this.message = 'Error connecting to backend';
    }
}
}
</script>