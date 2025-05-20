<template>
    <div class="shared-result">
        <LoadingSpinner
            v-if="loading"
            :text="t('loadingResult')"
        />
        <div v-else-if="error" class="error">
            {{ t('resultNotFound') }}
        </div>
        <div v-else class="result-container">
            <h2>{{ t('shareTitle') }}</h2>
            
            <div class="summary">
                <div class="total-item">
                    <span>{{ t('subtotal') }}:</span>
                    <span>{{ formatCurrency(result.subtotal) }}</span>
                </div>
                <div class="total-item">
                    <span>{{ t('deliveryFee') }}:</span>
                    <span>{{ formatCurrency(result.deliveryFee) }}</span>
                </div>
                <div class="total-item">
                    <span>{{ t('totalDiscount') }}:</span>
                    <span>{{ formatCurrency(result.totalDiscount) }}</span>
                </div>
            </div>

            <table class="results-table">
                <thead>
                    <tr>
                        <th>{{ t('person') }}</th>
                        <th>{{ t('orderAmount') }}</th>
                        <th>{{ t('discountShare') }}</th>
                        <th>{{ t('finalOwed') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-for="person in result.orders" 
                        :key="person.name"
                        :class="{ 
                            'highlight': person.discountShare === maxDiscountShare 
                        }"
                    >
                        <td>{{ person.name }}</td>
                        <td>{{ formatCurrency(person.amount) }}</td>
                        <td>{{ formatCurrency(person.discountShare) }}</td>
                        <td>{{ formatCurrency(person.finalOwed) }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="total">
                <strong>{{ t('totalPaid') }}:</strong> {{ formatCurrency(calculateTotal()) }}
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { formatCurrency } from '../utils/currency';
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LoadingSpinner from './LoadingSpinner.vue';

export default {
  name: 'SharedResult',
  components: {
    LoadingSpinner
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },  setup(props) {
    const { t } = useI18n();
    const loading = ref(true);
    const error = ref(false);
    const result = ref(null);

    const maxDiscountShare = computed(() => {
      if (!result.value?.orders) return 0;
      return Math.max(...result.value.orders.map(p => p.discountShare));
    });

    const calculateTotal = () => {
      if (!result.value?.orders) return 0;
      return result.value.orders.reduce((sum, person) => sum + person.finalOwed, 0);
    };

    const fetchResult = async () => {
      try {
        loading.value = true;
        const response = await axios.get(`/api/calculate/${props.id}`);
        result.value = response.data.data;
      } catch (err) {
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchResult();
    });

    return {
      t,
      loading,
      error,
      result,
      formatCurrency,
      maxDiscountShare,
      calculateTotal
    };  }
};
</script>

<style>
.shared-result {
  background: var(--form-bg, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 800px;
  margin: 2rem auto;
  width: 100%;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: inherit;
}

.error {
  color: #dc3545;
}

.result-container h2 {
  margin-bottom: 1.5rem;
  color: inherit;
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: var(--header-bg, #f8f9fa);
  padding: 1rem;
  border-radius: 6px;
}

.total-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 4px;
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
  background: var(--header-bg, #f8f9fa);
}

.highlight td {
  background-color: rgba(40, 167, 69, 0.1);
}

.total {
  text-align: right;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--header-bg, #f8f9fa);
  border-radius: 6px;
}

@media (max-width: 768px) {
  .shared-result {
    padding: 1rem;
    margin: 1rem;
  }

  .summary {
    grid-template-columns: 1fr;
  }

  .results-table {
    font-size: 0.875rem;
  }

  .results-table th,
  .results-table td {
    padding: 0.5rem;
  }
}
</style>
