<template>
  <div class="payment-form">
    <form @submit.prevent="calculateSplit">
      <div class="people-inputs">
        <div v-for="(person, index) in people" :key="index" class="person-row">
          <input 
            v-model="person.name"
            :placeholder="t('name')"
            required
            class="name-input"
          />
          <input 
            v-model="person.displayAmount"
            type="text"
            :placeholder="t('orderAmount')"
            required
            class="amount-input"
            @input="handleAmountInput($event, index)"
          />
          <button 
            type="button" 
            @click="removePerson(index)"
            class="remove-button"
            :aria-label="t('remove')"
          >
            ✕
          </button>
        </div>
        <button type="button" @click="addPerson" class="add-button">
          {{ t('addPerson') }}
        </button>
      </div>

      <div class="additional-inputs">
        <div class="input-group">
          <label for="deliveryFee">{{ t('deliveryFee') }}</label>
          <input
            id="deliveryFee"
            v-model="displayDeliveryFee"
            type="text"
            class="fee-input"
            @input="handleDeliveryFeeInput"
          />
        </div>
        <div class="input-group">
          <label for="discount">{{ t('discount') }}</label>
          <input
            id="discount"
            v-model="displayDiscount"
            type="text"
            class="discount-input"
            @input="handleDiscountInput"
          />
        </div>
      </div>

      <button type="submit" class="calculate-button" :disabled="isSubmitting">
        {{ t('calculate') }}
      </button>
    </form>

    <div v-if="results" class="results">
      <div class="results-header">
        <h3>{{ t('summary') }}</h3>
        <div class="totals">
          <div class="total-item">
            <span>{{ t('subtotal') }}:</span>
            <span>{{ formatCurrency(results.subtotal) }}</span>
          </div>
          <div class="total-item">
            <span>{{ t('deliveryFee') }}:</span>
            <span>{{ formatCurrency(results.deliveryFee) }}</span>
          </div>
          <div class="total-item">
            <span>{{ t('totalDiscount') }}:</span>
            <span>{{ formatCurrency(results.totalDiscount) }}</span>
          </div>
          <div class="total-item total-paid">
            <span>{{ t('totalPaid') }}:</span>
            <span>{{ formatCurrency(results.totalPaid) }}</span>
          </div>
          <div class="total-item remaining">
            <span>{{ t('remainingAmount') }}:</span>
            <span>{{ formatCurrency(results.remainingAmount) }}</span>
          </div>
        </div>
      </div>

      <table class="results-table">
        <thead>
          <tr>
            <th>{{ t('person') }}</th>
            <th>{{ t('orderAmount') }}</th>
            <th>{{ t('discountShare') }}</th>
            <th>{{ t('finalOwed') }}</th>
            <th>{{ t('paymentStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="person in results.orders" 
            :key="person.name"
            :class="{ 
              'highlight': person.discountShare === maxDiscountShare,
              'paid': person.paid 
            }"
          >
            <td>{{ person.name }}</td>
            <td>{{ formatCurrency(person.amount) }}</td>
            <td>{{ formatCurrency(person.discountShare) }}</td>
            <td>{{ formatCurrency(person.finalOwed) }}</td>
            <td>
              <label :for="'paid-' + person.name" class="payment-toggle">
                <input
                  :id="'paid-' + person.name"
                  type="checkbox"
                  v-model="person.paid"
                  @change="updatePaymentStatus(person)"
                />
                <span class="payment-status">
                  {{ person.paid ? t('paid') : t('unpaid') }}
                </span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="save-actions">
        <button @click="saveToHistory" class="save-button">
          {{ t('save') }}
        </button>
        <button @click="shareResult" class="share-button">
          {{ t('share') }}
        </button>
        <button @click="resetForm" class="reset-button">
          {{ t('cancel') }}
        </button>
      </div>

      <!-- Share Link Modal -->
      <div v-if="showShareModal" class="modal-overlay" @click="closeShareModal">
        <div class="modal-content" @click.stop>
          <h3>{{ t('shareResult') }}</h3>
          <div class="share-url">
            <input type="text" readonly :value="shareUrl" ref="shareUrlInput" />
            <button @click="copyShareUrl" class="copy-button">
              {{ t(urlCopied ? 'linkCopied' : 'copyLink') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="urlCopied" class="success-message">
        {{ t('linkCopied') }}
      </div>

    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { formatCurrency, formatInput, parseCurrencyInput } from '../utils/currency';
import axios from 'axios';
import { inject } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const t = inject('t');
    const router = useRouter();
    return { t, router };
  },

  data() {
    return {
      people: [{ name: '', amount: null, displayAmount: '' }],
      deliveryFee: 0,
      displayDeliveryFee: '',
      discount: 0,
      displayDiscount: '',
      results: null,
      error: null,
      isSubmitting: false,
      orderId: null,
      showShareModal: false,
      shareUrl: '',
      urlCopied: false
    };
  },

  computed: {
    maxDiscountShare() {
      return this.results?.orders
        ? Math.max(...this.results.orders.map(p => p.discountShare))
        : 0;
    }
  },

  methods: {
    formatCurrency,
    
    addPerson() {
      this.people.push({ name: '', amount: null, displayAmount: '' });
    },

    removePerson(index) {
      this.people.splice(index, 1);
    },

    handleAmountInput(event, index) {
      const formattedValue = formatInput(event.target.value);
      this.people[index].displayAmount = formattedValue;
      this.people[index].amount = parseCurrencyInput(formattedValue);
    },

    handleDeliveryFeeInput(event) {
      const formattedValue = formatInput(event.target.value);
      this.displayDeliveryFee = formattedValue;
      this.deliveryFee = parseCurrencyInput(formattedValue);
    },

    handleDiscountInput(event) {
      const formattedValue = formatInput(event.target.value);
      this.displayDiscount = formattedValue;
      this.discount = parseCurrencyInput(formattedValue);
    },

    async calculateSplit() {
      this.error = null;
      this.isSubmitting = true;

      try {
        const response = await axios.post('/api/calculate', {
          orders: this.people,
          deliveryFee: this.deliveryFee,
          totalDiscount: this.discount
        });

        this.results = response.data.data;
        this.orderId = response.data.data.id;
      } catch (error) {
        this.error = error.response?.data?.error || 'Calculation failed';
      } finally {
        this.isSubmitting = false;
      }
    },

    async updatePaymentStatus(person) {
      if (!this.orderId) return;

      try {
        const response = await axios.patch(`/api/calculate/${this.orderId}/payment`, {
          personName: person.name,
          isPaid: person.paid
        });

        // Update the totals
        this.results.totalPaid = response.data.data.totalPaid;
        this.results.remainingAmount = response.data.data.remainingAmount;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update payment status';
        // Revert the checkbox if the update failed
        person.paid = !person.paid;
      }
    },

    resetForm() {
      this.people = [{ name: '', amount: null, displayAmount: '' }];
      this.deliveryFee = 0;
      this.displayDeliveryFee = '';
      this.discount = 0;
      this.displayDiscount = '';
      this.results = null;
      this.error = null;
      this.orderId = null;
      this.showShareModal = false;
      this.shareUrl = '';
      this.urlCopied = false;
    },

    async saveToHistory() {
      // The order is already saved when calculated
      this.resetForm();
      // Navigate to history page
      this.router.push('/history');
    },

    shareResult() {
      if (!this.orderId) return;
      
      const shareUrl = `${window.location.origin}/share/${this.orderId}`;
      this.shareUrl = shareUrl;
      this.showShareModal = true;
    },

    async copyShareUrl() {
      try {
        await navigator.clipboard.writeText(this.shareUrl);
        this.urlCopied = true;
        setTimeout(() => {
          this.urlCopied = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    },

    closeShareModal() {
      this.showShareModal = false;
      this.shareUrl = '';
      this.urlCopied = false;
    }
  }
};
</script>

<style>
.payment-form {
  background: var(--form-bg, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.people-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.person-row {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 1rem;
  align-items: center;
  background: var(--header-bg, #f8f9fa);
  padding: 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.person-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.name-input,
.amount-input,
.fee-input,
.discount-input {
  padding: 0.75rem;
  border: 1px solid var(--border-color, #ced4da);
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
  transition: border-color 0.2s ease;
  background: var(--form-bg, #ffffff);
  color: inherit;
}

.name-input:focus,
.amount-input:focus,
.fee-input:focus,
.discount-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.remove-button {
  padding: 0.75rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button:hover {
  background: #c82333;
}

.add-button {
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  margin-top: 0.5rem;
  align-self: flex-end;
}

.add-button:hover {
  background: #218838;
  transform: translateY(-1px);
}

.additional-inputs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  background: var(--header-bg, #f8f9fa);
  padding: 1.5rem;
  border-radius: 6px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
  color: inherit;
}

.calculate-button {
  width: 100%;
  padding: 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.calculate-button:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.calculate-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.results {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--form-bg, #f8f9fa);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.results-header {
  margin-bottom: 1.5rem;
}

.totals {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.total-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--total-bg, #fff);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.total-paid {
  color: #28a745;
}

.remaining {
  color: #dc3545;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.results-table th,
.results-table td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid var(--border-color, #dee2e6);
}

.results-table th {
  background: var(--header-bg, #e9ecef);
}

.highlight td {
  background-color: rgba(40, 167, 69, 0.1);
}

.paid td {
  background-color: rgba(40, 167, 69, 0.05);
}

.payment-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.payment-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

input[type="checkbox"]:checked + .payment-status {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

input[type="checkbox"]:not(:checked) + .payment-status {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.save-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.save-button,
.reset-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button {
  background: #28a745;
  color: white;
}

.reset-button {
  background: #6c757d;
  color: white;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
}

.dark .results {
  background-color: #2d3748;
  color: #f8f9fa;
}

.dark .total-item {
  background-color: #1a202c;
}

.dark input[type="text"],
.dark input[type="number"] {
  background-color: #2d3748;
  color: #f8f9fa;
  border-color: #4a5568;
}

.dark .results-table th {
  background-color: #1a202c;
}

.dark .results-table td {
  border-color: #4a5568;
}

@media (max-width: 768px) {
  .payment-form {
    padding: 1rem;
  }

  .person-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .additional-inputs {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .add-button,
  .calculate-button {
    width: 100%;
    margin-top: 0.75rem;
  }
}

.share-button {
  background: #6c757d;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.share-button:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-1px);
}

.share-url {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.share-url input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--form-bg);
  color: inherit;
}

.copy-button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.copy-button:hover {
  background: #0056b3;
}
</style>