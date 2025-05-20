<template>
  <div class="form-container">
    <!-- Header section -->
    <div class="header-section">
      <h2 class="form-title">{{ t('orderHistory') }}</h2>
      <button 
        v-if="history.length > 0" 
        @click="showClearModal = true" 
        class="button button-danger"
      >
        {{ t('clearHistory') }}
      </button>
    </div>

    <!-- Filter toggle button (visible on mobile) -->
    <button 
      @click="toggleFilters" 
      class="button button-secondary filter-toggle"
      :class="{ 'active': showFilters }"
    >
      <span>{{ showFilters ? t('hideFilters') : t('showFilters') }}</span>
      <svg 
        class="icon" 
        :class="{ 'rotated': showFilters }"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <!-- Filters Section -->
    <div class="filters-wrapper" :class="{ 'expanded': showFilters }">
      <div class="filters">
        <div class="input-group">
          <label class="input-label">{{ t('searchByName') }}</label>
          <input
            v-model="filters.name"
            :placeholder="t('searchByName')"
            class="input"
            @input="handleNameInput"
          />
        </div>
        <div class="dates-group">
          <div class="input-group">
            <label class="input-label">{{ t('startDate') }}</label>
            <input
              type="date"
              v-model="filters.startDate"
              class="input"
              @change="handleDateChange"
            />
          </div>
          <div class="input-group">
            <label class="input-label">{{ t('endDate') }}</label>
            <input
              type="date"
              v-model="filters.endDate"
              class="input"
              @change="handleDateChange"
            />
          </div>
        </div>
        <div class="sort-group">
          <select v-model="sortBy" class="input">
            <option value="createdAt">{{ t('date') }}</option>
            <option value="subtotal">{{ t('subtotal') }}</option>
          </select>
          <select v-model="sortOrder" class="input">
            <option value="desc">{{ t('newestFirst') }}</option>
            <option value="asc">{{ t('oldestFirst') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results Table -->
    <div class="table-wrapper">
      <div class="results" v-if="history.length">
        <table class="results-table">
          <thead>
            <tr>
              <th>{{ t('date') }}</th>
              <th>{{ t('person') }}</th>
              <th>{{ t('subtotal') }}</th>
              <th>{{ t('deliveryFee') }}</th>
              <th>{{ t('discount') }}</th>
              <th>{{ t('finalTotal') }}</th>
              <th>{{ t('totalPaid') }}</th>
              <th>{{ t('remainingAmount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in history" :key="order._id">
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>
                <ul class="order-people">
                  <li v-for="person in order.orders" :key="person.name">
                    {{ person.name }}: {{ formatCurrency(person.finalOwed) }}
                    <span :class="['payment-badge', person.paid ? 'paid' : 'unpaid']">
                      {{ t(person.paid ? 'paid' : 'unpaid') }}
                    </span>
                  </li>
                </ul>
              </td>
              <td>{{ formatCurrency(order.subtotal) }}</td>
              <td>{{ formatCurrency(order.deliveryFee) }}</td>
              <td>{{ formatCurrency(order.totalDiscount) }}</td>
              <td>{{ formatCurrency(calculateFinalTotal(order)) }}</td>
              <td>{{ formatCurrency(getTotalPaid(order)) }}</td>
              <td>{{ formatCurrency(getRemainingAmount(order)) }}</td>
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
            {{ t('previous') }}
          </button>
          <span class="page-info">
            {{ t('page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}
          </span>
          <button 
            class="button"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            {{ t('next') }}
          </button>
        </div>
      </div>
      <div v-else class="no-results">
        {{ t('noOrders') }}
      </div>
    </div>

    <!-- Clear History Modal -->
    <div v-if="showClearModal" class="modal-overlay" @click="cancelClear">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">{{ t('clearHistory') }}</h3>
        <p class="modal-text">{{ t('clearConfirmation') }}</p>
        <div class="modal-body">
          <input
            v-model="clearConfirmText"
            :placeholder="t('clearConfirmation')"
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
            {{ t('confirmClear') }}
          </button>
          <button 
            @click="cancelClear" 
            class="button button-secondary"
          >
            {{ t('cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="showSuccessMessage" class="success-message">
      {{ t('clearedSuccess') }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { formatCurrency } from '../utils/currency';
import { inject } from 'vue';

export default {
  setup() {
    const t = inject('t');
    return { t };
  },
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
      showSuccessMessage: false,
      showFilters: false
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
    getTotalPaid(order) {
      return order.orders.reduce((sum, person) => 
        sum + (person.paid ? person.finalOwed : 0), 0);
    },
    getRemainingAmount(order) {
      const total = order.orders.reduce((sum, person) => sum + person.finalOwed, 0);
      return total - this.getTotalPaid(order);
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
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
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
.form-container {
  background: var(--form-bg, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: inherit;
}

.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.button-danger {
  background: #dc3545;
  color: white;
}

.button-danger:hover {
  background: #c82333;
}

.button-secondary {
  background: #6c757d;
  color: white;
}

.button-secondary:hover {
  background: #5a6268;
}

.filter-toggle {
  width: 100%;
  display: none;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  background: var(--header-bg, #f8f9fa);
}

.filters-wrapper {
  margin-bottom: 2rem;
}

.filters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--header-bg, #f8f9fa);
  border-radius: 6px;
  align-items: start;
}

.dates-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.sort-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sort-group select {
  width: 100%;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input {
  padding: 0.75rem;
  border: 1px solid var(--border-color, #ced4da);
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
  background: var(--form-bg, #ffffff);
  color: inherit;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.input-label {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: inherit;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background: var(--form-bg, #ffffff);
}

.results-table th,
.results-table td {
  padding: 1rem;
  text-align: left;
  border: 1px solid var(--border-color, #dee2e6);
}

.results-table th {
  background: var(--header-bg, #f8f9fa);
  font-weight: 600;
}

.results-table tr:hover {
  background: var(--header-bg, #f8f9fa);
}

.order-people {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-people li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--header-bg, #f8f9fa);
  border-radius: 4px;
}

.payment-badge {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-weight: 500;
}

.payment-badge.paid {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.payment-badge.unpaid {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background: var(--header-bg, #f8f9fa);
  border-radius: 6px;
}

.page-info {
  font-weight: 500;
}

.success-message {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #28a745;
  color: white;
  padding: 1rem 2rem;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
}

@keyframes slideIn {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--form-bg, #ffffff);
  border-radius: 8px;
  padding: 2rem;
}

.modal-title {
  color: #dc3545;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-text {
  margin: 1rem 0;
  color: inherit;
}

@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
  }

  .filter-toggle {
    display: flex;
  }

  .filters-wrapper {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
  }

  .filters-wrapper.expanded {
    max-height: 1000px;
  }

  .filters {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .dates-group {
    grid-template-columns: 1fr;
  }

  .results-table {
    font-size: 0.875rem;
  }

  .results-table th,
  .results-table td {
    padding: 0.75rem;
  }

  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }

  .success-message {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    text-align: center;
  }
}
</style>