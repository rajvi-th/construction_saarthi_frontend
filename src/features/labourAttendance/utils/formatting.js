/**
 * Utility functions for formatting data in labour attendance feature
 */

export function formatCurrencyINR(amount) {
  const value = Number(amount || 0);
  if (Number.isNaN(value)) return '₹0';
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatDate(dateValue) {
  if (!dateValue) return '-';
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(d.getTime())) return String(dateValue);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || '';
  const b = parts[1]?.[0] || '';
  return (a + b).toUpperCase() || 'NA';
}

export function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

