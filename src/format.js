function parseDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }
  return new Date(value);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parseDate(value));
}

export function formatShortDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseDate(value));
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parseDate(value));
}

export function formatMoney(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatAccount(value) {
  return String(value).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function fullName(customer) {
  return [customer.title, customer.firstName, customer.lastName].filter(Boolean).join(' ');
}

export function normaliseReference(value) {
  return String(value || '').replace(/\s+/g, '').toUpperCase();
}

export function accountFromReference(reference) {
  const digits = reference.replace(/\D/g, '').padStart(10, '0').slice(-10);
  return {
    accountNumber: `45${digits}`,
    maskedPan: `4539 12•• •••• ${digits.slice(-4)}`,
  };
}

export function formatMonth(value) {
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(date);
}
