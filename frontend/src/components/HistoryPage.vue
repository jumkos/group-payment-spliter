<template>
  <div>
    <h2>Order History</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Total Discount</th>
          <th>Delivery Fee</th>
          <th>Orders</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in history" :key="order._id">
          <td>{{ new Date(order.createdAt).toLocaleString() }}</td>
          <td>{{ order.totalDiscount }}</td>
          <td>{{ order.deliveryFee }}</td>
          <td>
            <ul>
              <li v-for="person in order.orders" :key="person.name">
                {{ person.name }}: {{ person.finalOwed }}
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      history: []
    };
  },
  async created() {
    try {
      const response = await axios.get('/api/history');
      this.history = response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  }
};
</script>

<style>
/* Add any necessary styles here */
</style>