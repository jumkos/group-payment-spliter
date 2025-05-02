<template>
  <div id="app">
    <HelloBackend />
    <ItemList />
  </div>
</template>

<script>
import HelloBackend from './components/HelloBackend.vue'
import ItemList from './components/ItemList.vue'

export default {
  name: 'App',
  components: {
    HelloBackend,
    ItemList
  }
}
</script>