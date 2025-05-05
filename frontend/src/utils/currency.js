export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatInput = (value) => {
  if (!value) return '';
  // Remove any non-digit characters
  const number = value.toString().replace(/\D/g, '');
  // Format with thousand separators
  return 'Rp ' + number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseCurrencyInput = (value) => {
  if (!value) return null;
  // Remove currency symbol, dots, and other non-digit characters
  return parseInt(value.toString().replace(/[^\d]/g, ''), 10) || null;
};