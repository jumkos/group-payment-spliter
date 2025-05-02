<template>
  <div class="form-container">
    <h2 class="form-title">Payment Splitter</h2>
    <form @submit.prevent="calculateSplit" class="form">
      <div v-for="(person, index) in people" :key="index" class="form-row">
        <input v-model="person.name" placeholder="Name" required class="input" />
        <input v-model.number="person.amount" type="number" placeholder="Order Amount" required class="input" />
        <button type="button" @click="removePerson(index)" class="button button-remove">Remove</button>
        <template v-if="index === people.length - 1">
          <button type="button" @click="addPerson" class="button button-add">+</button>
        </template>
      </div>
      <div class="form-group">
        <input v-model.number="deliveryFee" type="number" placeholder="Delivery Fee" class="input" />
        <input v-model.number="discount" type="number" placeholder="Discount" class="input" />
      </div>
      <button type="submit" class="button button-submit">Calculate</button>
    </form>

    <div v-if="results.length" class="results">
      <h3 class="results-title">Results</h3>
      <p>Total Before: Rp{{ totalBefore }}</p>
      <p>Total After: Rp{{ totalAfter }}</p>
      <p>Total to Delivery Service: Rp{{ totalToDeliveryService }}</p>
      <table class="results-table">
        <thead>
          <tr>
            <th>Person</th>
            <th>Order Amount</th>
            <th>Discount Share</th>
            <th>Final Owed</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="result in results" :key="result.name" :class="{ highlight: result.discountShare === maxDiscount }">
            <td>{{ result.name }}</td>
            <td>{{ result.amount }}</td>
            <td>{{ result.discountShare }}</td>
            <td>{{ result.finalOwed }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      people: [{ name: '', amount: null }],
      deliveryFee: null,
      discount: null,
      results: [],
      totalBefore: 0,
      totalAfter: 0,
      totalToDeliveryService: 0
    };
  },
  computed: {
    maxDiscount() {
      return Math.max(...this.results.map(r => r.discountShare), 0);
    }
  },
  methods: {
    addPerson() {
      this.people.push({ name: '', amount: null });
    },
    removePerson(index) {
      this.people.splice(index, 1);
    },
    async calculateSplit() {
      try {
        const response = await axios.post('/api/calculate', {
          people: this.people,
          deliveryFee: this.deliveryFee,
          discount: this.discount
        });
        this.results = response.data.results;
        this.totalBefore = response.data.totalBefore;
        this.totalAfter = response.data.totalAfter;
        this.totalToDeliveryService = response.data.totalToDeliveryService;
      } catch (error) {
        console.error('Error calculating split:', error);
      }
    }
  }
};
</script>

<style>
.form-container {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}
.form-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #007bff; /* Use a distinct color for visibility in both light and dark modes */
}
.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 5px;
}
.button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.button-remove {
  background-color: #dc3545;
  color: white;
}
.button-remove:hover {
  background-color: #c82333;
}
.button-add {
  background-color: #28a745;
  color: white;
}
.button-add:hover {
  background-color: #218838;
}
.button-submit {
  background-color: #007bff;
  color: white;
  width: 100%;
}
.button-submit:hover {
  background-color: #0056b3;
}
.results {
  margin-top: 20px;
}
.results-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 10px;
}
.results-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.results-table th,
.results-table td {
  border: 1px solid #dee2e6;
  padding: 10px;
  text-align: left;
}
.results-table th {
  background-color: #e9ecef;
}
.highlight {
  background-color: #d4edda;
}
</style>