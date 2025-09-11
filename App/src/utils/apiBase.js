// Simple per-service base URL resolver with cloud/local toggle
// Usage: apiBase('search') + '/search'

const USE_CLOUD = String(import.meta.env.VITE_USE_CLOUD || '').toLowerCase() === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090';

const cloud = {
  user: import.meta.env.VITE_USER_API,
  friend: import.meta.env.VITE_FRIEND_API,
  expense: import.meta.env.VITE_EXPENSE_API,
  group: import.meta.env.VITE_GROUP_API,
  settleup: import.meta.env.VITE_SETTLEUP_API,
  search: import.meta.env.VITE_SEARCH_API,
  bank: import.meta.env.VITE_BANK_API,
};

const local = {
  user: `${API_URL}/api_user/v1`,
  friend: `${API_URL}/api_friend/v1`,
  expense: `${API_URL}/api_expense/v1`,
  group: `${API_URL}/api_group/v1`,
  settleup: `${API_URL}/api_settleup/v1`,
  search: `${API_URL}/api_search/v1`,
  bank: `${API_URL}/api_bank/v1`,
};

export function apiBase(service) {
  const map = USE_CLOUD ? cloud : local;
  return map[service];
}
