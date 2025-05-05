<template>
  <div class="form-container">
    <h2 class="form-title">Payment Splitter</h2>
    <form @submit.prevent="validateAndSubmit" class="form">
      <div v-for="(person, index) in people" :key="index" class="form-row">
        <div class="input-group">
          <input 
            v-model="person.name" 
            placeholder="Name" 
            required 
            class="input"
            :class="{ 'error': errors[`people.${index}.name`] }"
          />
          <span class="error-message" v-if="errors[`people.${index}.name`]">
            {{ errors[`people.${index}.name`] }}
          </span>
        </div>
        <div class="input-group">
          <input 
            :value="formatInput(person.amount)"
            placeholder="Order Amount"
            required 
            class="input"
            :class="{ 'error': errors[`people.${index}.amount`] }"
            @input="handleAmountInput($event, index)"
          />
          <span class="error-message" v-if="errors[`people.${index}.amount`]">
            {{ errors[`people.${index}.amount`] }}
          </span>
        </div>
        <button type="button" @click="removePerson(index)" class="button button-remove">Remove</button>
        <template v-if="index === people.length - 1">
          <button type="button" @click="addPerson" class="button button-add">+</button>
        </template>
      </div>
      <div class="form-group">
        <div class="input-group">
          <input 
            :value="formatInput(deliveryFee)"
            placeholder="Delivery Fee"
            class="input"
            :class="{ 'error': errors.deliveryFee }"
            @input="handleDeliveryFeeInput"
          />
          <span class="error-message" v-if="errors.deliveryFee">{{ errors.deliveryFee }}</span>
        </div>
        <div class="input-group">
          <input 
            :value="formatInput(discount)"
            placeholder="Discount"
            class="input"
            :class="{ 'error': errors.discount }"
            @input="handleDiscountInput"
          />
          <span class="error-message" v-if="errors.discount">{{ errors.discount }}</span>
        </div>
      </div>
      <div class="button-group">
        <button type="button" @click="clearForm" class="button button-clear">Clear</button>
        <button type="submit" class="button button-submit">Calculate</button>
      </div>
    </form>

    <div v-if="results.length" class="results">
      <h3 class="results-title">Results</h3>
      <p>Subtotal: {{ formatCurrency(totalBefore) }}</p>
      <p>Final Total: {{ formatCurrency(totalAfter) }}</p>
      <p>Total to Delivery Service: {{ formatCurrency(totalToDeliveryService) }}</p>
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
            <td>{{ formatCurrency(result.amount) }}</td>
            <td>{{ formatCurrency(result.discountShare) }}</td>
            <td>{{ formatCurrency(result.finalOwed) }}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="button-group mt-4">
        <button @click="handleDone" class="button button-done">
          Done
        </button>
      </div>
    </div>
    <div v-if="showSuccessMessage" class="success-message">
      Calculation saved successfully!
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { formatCurrency, formatInput, parseCurrencyInput } from '../utils/currency';

export default {
  data() {
    return {
      people: [{ name: '', amount: null }],
      deliveryFee: null,
      discount: null,
      results: [],
      totalBefore: 0,
      totalAfter: 0,
      totalToDeliveryService: 0,
      errors: {},
      showSuccessMessage: false
    };
  },
  computed: {
    maxDiscount() {
      return Math.max(...this.results.map(r => r.discountShare), 0);
    },
    subtotal() {
      return this.people.reduce((sum, person) => sum + (parseCurrencyInput(person.amount) || 0), 0);
    }
  },
  methods: {
    formatCurrency,
    formatInput,
    addPerson() {
      this.people.push({ name: '', amount: null });
    },
    removePerson(index) {
      this.people.splice(index, 1);
      if (this.people.length === 0) {
        this.addPerson();
      }
    },
    handleAmountInput(event, index) {
      this.people[index].amount = parseCurrencyInput(event.target.value);
    },
    handleDeliveryFeeInput(event) {
      this.deliveryFee = parseCurrencyInput(event.target.value);
    },
    handleDiscountInput(event) {
      this.discount = parseCurrencyInput(event.target.value);
    },
    validateForm() {
      this.errors = {};
      let isValid = true;

      // Validate people
      this.people.forEach((person, index) => {
        if (!person.name.trim()) {
          this.errors[`people.${index}.name`] = 'Name is required';
          isValid = false;
        }
        if (!person.amount) {
          this.errors[`people.${index}.amount`] = 'Amount is required';
          isValid = false;
        } else if (person.amount <= 0) {
          this.errors[`people.${index}.amount`] = 'Amount must be greater than 0';
          isValid = false;
        }
      });

      // Validate delivery fee
      if (this.deliveryFee < 0) {
        this.errors.deliveryFee = 'Delivery fee cannot be negative';
        isValid = false;
      }

      // Validate discount
      if (this.discount < 0) {
        this.errors.discount = 'Discount cannot be negative';
        isValid = false;
      }
      if (this.discount > this.subtotal) {
        this.errors.discount = 'Discount cannot be greater than subtotal';
        isValid = false;
      }

      return isValid;
    },
    async validateAndSubmit() {
      if (!this.validateForm()) {
        return;
      }

      try {
        const response = await axios.post('/api/calculate', {
          people: this.people,
          deliveryFee: this.deliveryFee || 0,
          discount: this.discount || 0
        });
        this.results = response.data.results;
        this.totalBefore = response.data.totalBefore;
        this.totalAfter = response.data.totalAfter;
        this.totalToDeliveryService = response.data.totalToDeliveryService;
      } catch (error) {
        console.error('Error calculating split:', error);
      }
    },
    clearForm() {
      this.people = [{ name: '', amount: null }];
      this.deliveryFee = null;
      this.discount = null;
      this.results = [];
      this.errors = {};
    },
    async handleDone() {
      try {
        await axios.post('/api/history', {
          orders: this.results,
          subtotal: this.subtotal,
          deliveryFee: this.deliveryFee || 0,
          totalDiscount: this.discount || 0
        });
        
        this.showSuccessMessage = true;
        // Emit event to notify parent that history should be refreshed
        this.$emit('history-updated');
        
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.clearForm();
        }, 2000);
      } catch (error) {
        console.error('Error saving to history:', error);
      }
    }
  }
};
</script>

<style>
.form-container {
  background-color: var(--form-bg, #f8f9fa);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
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
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}
.input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color, #ced4da);
  border-radius: 5px;
  background-color: var(--input-bg, #fff);
  color: inherit;
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
  height: 40px;
  margin-top: 2px; /* Align with input field */
}
.button-remove:hover {
  background-color: #c82333;
}
.button-add {
  background-color: #28a745;
  color: white;
  height: 40px;
  margin-top: 2px; /* Align with input field */
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
  color: inherit; /* Inherit color from parent to support dark mode */
  overflow-x: auto; /* Enable horizontal scrolling */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.results p {
  color: inherit; /* Ensure result text inherits color */
  margin: 8px 0;
}

.results-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #007bff; /* Use consistent blue color for titles */
}

.results-table {
  width: 100%;
  min-width: 600px; /* Ensure table doesn't get too narrow */
  border-collapse: collapse;
  margin-top: 10px;
  background-color: var(--table-bg, #fff); /* Use CSS variable for background */
}

.results-table th,
.results-table td {
  border: 1px solid var(--border-color, #dee2e6);
  padding: 10px;
  text-align: left;
  color: inherit; /* Ensure table text inherits color */
}

.results-table th {
  background-color: var(--header-bg, #e9ecef);
}

/* Dark mode styles */
.dark .results-table {
  --table-bg: #2d3748;
  --border-color: #4a5568;
  --header-bg: #1a202c;
}

.dark .highlight {
  background-color: #2f4f2f; /* Darker green for dark mode */
}

.highlight {
  background-color: #d4edda;
}

.input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px; /* Ensure inputs don't get too narrow */
}

.error {
  border-color: #dc3545 !important;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Dark mode styles */
.dark .form-container {
  --form-bg: #1a202c;
  --border-color: #4a5568;
}

.dark .input {
  --input-bg: #2d3748;
  --border-color: #4a5568;
}

/* Media query for mobile devices */
@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
  }

  .form-row {
    flex-direction: column;
  }

  .input-group {
    width: 100%;
  }

  .button-remove, .button-add {
    width: 100%;
    margin-top: 10px;
  }
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.button-clear {
  background-color: #6c757d;
  color: white;
  flex: 1;
}

.button-clear:hover {
  background-color: #5a6268;
}

.button-submit {
  background-color: #007bff;
  color: white;
  flex: 2;
}

.button-submit:hover {
  background-color: #0056b3;
}

.mt-4 {
  margin-top: 1rem;
}

.button-done {
  background-color: #28a745;
  color: white;
  width: 100%;
  padding: 0.75rem;
  font-size: 1.1rem;
}

.button-done:hover {
  background-color: #218838;
}

.success-message {
  background-color: #28a745;
  color: white;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group .input-group {
  width: 100%;
}
</style>