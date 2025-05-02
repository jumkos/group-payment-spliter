<template>
  <div>
    <h2>Items</h2>
    <div v-for="item in items" :key="item._id">
      {{ item.name }} - {{ new Date(item.date).toLocaleDateString() }}
    </div>
    
    <input v-model="newItem" @keyup.enter="addItem" placeholder="Add new item">
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      newItem: ''
    }
  },
  async created() {
    await this.fetchItems();
  },
  methods: {
    async fetchItems() {
      try {
        const response = await this.$http.get('/api/items');
        this.items = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async addItem() {
      if (!this.newItem) return;
      
      try {
        await this.$http.post('/api/items', { name: this.newItem });
        this.newItem = '';
        await this.fetchItems();
      } catch (error) {
        console.error(error);
      }
    }
  }
}
</script>