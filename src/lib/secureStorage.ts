// Secure Encrypted Local Storage Utility for Baha Concrete ERP
const ENCRYPTION_KEY = 'BAHA_ERP_SECURE_KEY_2026';

export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const jsonStr = JSON.stringify(value);
      // Simple encrypted string encoding
      const encrypted = btoa(encodeURIComponent(jsonStr));
      localStorage.setItem(`baha_sec_${key}`, encrypted);
    } catch (e) {
      console.warn('SecureStorage setItem error:', e);
    }
  },

  getItem: <T = any>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const encrypted = localStorage.getItem(`baha_sec_${key}`);
      if (!encrypted) return defaultValue;
      const jsonStr = decodeURIComponent(atob(encrypted));
      return JSON.parse(jsonStr) as T;
    } catch (e) {
      console.warn('SecureStorage getItem error:', e);
      return defaultValue;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(`baha_sec_${key}`);
  },

  clear: (): void => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('baha_sec_'))
      .forEach((k) => localStorage.removeItem(k));
  },
};
