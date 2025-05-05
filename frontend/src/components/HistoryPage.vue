<template>
  <div class="form-container">
    <h2 class="form-title">Order History</h2>
    
    <!-- Filters -->
    <div class="filters">
      <div class="input-group">
        <label class="input-label">Search by name</label>
        <input
          v-model="filters.name"
          placeholder="Enter name"
          class="input"
          @input="handleNameInput"
        />
      </div>
      <div class="input-group">
        <label class="input-label">Start Date</label>
        <input
          type="date"
          v-model="filters.startDate"
          class="input"
          @change="handleDateChange"
        />
      </div>
      <div class="input-group">
        <label class="input-label">End Date</label>
        <input
          type="date"
          v-model="filters.endDate"
          class="input"
          @change="handleDateChange"
        />
      </div>
      <select v-model="sortBy" class="input">
        <option value="createdAt">Date</option>
        <option value="subtotal">Total Amount</option>
      </select>
      <select v-model="sortOrder" class="input">
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>
      <div class="clear-history">
        <button 
          v-if="history.length > 0" 
          @click="showClearModal = true" 
          class="button button-danger"
        >
          Clear History
        </button>
      </div>
    </div>

    <!-- History Table -->
    <div class="results" v-if="history.length">
      <table class="results-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>People</th>
            <th>Subtotal</th>
            <th>Delivery Fee</th>
            <th>Total Discount</th>
            <th>Final Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in history" :key="order._id">
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>
              <ul class="order-people">
                <li v-for="person in order.orders" :key="person.name">
                  {{ person.name }}: {{ formatCurrency(person.finalOwed) }}
                </li>
              </ul>
            </td>
            <td>{{ formatCurrency(order.subtotal) }}</td>
            <td>{{ formatCurrency(order.deliveryFee) }}</td>
            <td>{{ formatCurrency(order.totalDiscount) }}</td>
            <td>{{ formatCurrency(calculateFinalTotal(order)) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button 
          class="button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button 
          class="button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
    <div v-else class="no-results">
      No orders found
    </div>

    <!-- Clear History Modal -->
    <div v-if="showClearModal" class="modal-overlay" @click="cancelClear">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">Clear History</h3>
        <p class="modal-text">Type 'clear' to confirm deletion of all history.</p>
        <div class="modal-body">
          <input
            v-model="clearConfirmText"
            placeholder="Type 'clear' to confirm"
            class="input"
            @keyup.enter="clearConfirmText === 'clear' && clearHistory()"
            @keyup.esc="cancelClear"
          />
        </div>
        <div class="modal-actions">
          <button 
            @click="clearHistory" 
            :disabled="clearConfirmText !== 'clear'"
            class="button button-danger"
          >
            Confirm Clear
          </button>
          <button 
            @click="cancelClear" 
            class="button button-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="showSuccessMessage" class="success-message">
      History cleared successfully!
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { formatCurrency } from '../utils/currency';

export default {
  data() {
    return {
      history: [],
      currentPage: 1,
      totalPages: 1,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      filters: {
        name: '',
        startDate: null,
        endDate: null
      },
      showClearModal: false,
      clearConfirmText: '',
      showSuccessMessage: false
    };
  },
  methods: {
    formatCurrency,
    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    calculateFinalTotal(order) {
      return order.orders.reduce((sum, person) => sum + person.finalOwed, 0);
    },
    handleNameInput(event) {
      this.filters.name = event.target.value;
      this.fetchHistory();
    },
    handleDateChange() {
      this.fetchHistory();
    },
    async changePage(page) {
      this.currentPage = page;
      await this.fetchHistory();
    },
    async fetchHistory() {
      try {
        const params = {
          page: this.currentPage,
          sortBy: this.sortBy,
          order: this.sortOrder,
          ...(this.filters.name && { name: this.filters.name }),
          ...(this.filters.startDate && { startDate: this.filters.startDate }),
          ...(this.filters.endDate && { endDate: this.filters.endDate })
        };

        const response = await axios.get('/api/history', { params });
        this.history = response.data.history;
        this.currentPage = response.data.pagination.page;
        this.totalPages = response.data.pagination.totalPages;
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    },
    async clearHistory() {
      if (this.clearConfirmText !== 'clear') return;
      
      try {
        await axios.delete('/api/history');
        this.history = [];
        this.showClearModal = false;
        this.clearConfirmText = '';
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    },
    cancelClear() {
      this.showClearModal = false;
      this.clearConfirmText = '';
    }
  },
  watch: {
    sortBy() {
      this.fetchHistory();
    },
    sortOrder() {
      this.fetchHistory();
    }
  },
  mounted() {
    this.fetchHistory();
  }
};
</script>

<style>
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.input-group {
  position: relative;
}

.input-label {
  font-size: 0.875rem;
  color: inherit;
  margin-bottom: 0.25rem;
  display: block;
}

.order-people {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.page-info {
  color: inherit;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: inherit;
}

.clear-history {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.confirm-dialog {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 5px;
  background-color: var(--form-bg, #f8f9fa);
}

.confirm-actions {
  display: flex;
  gap: 0.5rem;
}

.button-danger {
  background-color: #dc3545;
  color: white;
}

.button-danger:hover {
  background-color: #c82333;
}

.button-danger:disabled {
  background-color: #dc354580;
  cursor: not-allowed;
}

.button-secondary {
  background-color: #6c757d;
  color: white;
}

.button-secondary:hover {
  background-color: #5a6268;
}

/* Responsive styles */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .order-people {
    font-size: 0.9rem;
  }
}

.success-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #28a745;
  color: white;
  padding: 1rem;
  border-radius: 5px;
  animation: fadeIn 0.3s ease-in;
  z-index: 100;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--form-bg, #f8f9fa);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #dc3545;
}

.modal-text {
  color: inherit;
  margin-bottom: 1rem;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Dark mode styles */
.dark .modal-content {
  --form-bg: #1a202c;
  border: 1px solid #4a5568;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-content {
  animation: modalFadeIn 0.3s ease-out;
}
</style>