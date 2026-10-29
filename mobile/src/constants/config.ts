export const CONFIG = {
  // Production Backend on AWS EC2
  API_BASE_URL: 'http://16.176.65.41/api',
  
  // Storage keys for offline persistence & session caching
  STORAGE_KEYS: {
    AUTH_TOKEN: 'milk_hisab_auth_token',
    AUTH_ROLE: 'milk_hisab_auth_role',
    USER_PROFILE: 'milk_hisab_user_profile',
    LANGUAGE: 'milk_hisab_language',
    OFFLINE_LOGS_QUEUE: 'milk_hisab_offline_logs',
    CACHED_CUSTOMERS: 'milk_hisab_cached_customers',
  },

  // Default dairy config
  DEFAULT_LANGUAGE: 'hi' as 'hi' | 'en',
  APP_NAME: 'Milk Hisab (मिल्क हिसाब)',
  SUPPORT_PHONE: '918076646872',
  SUPPORT_EMAIL: 'info@milkhisab.in',
};
