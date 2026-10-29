import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, Customer } from '../types';
import { 
  setAuthToken, 
  loginApi, 
  sendOtpApi, 
  verifyOtpApi, 
  registerVendorApi, 
  registerCustomerApi 
} from '../api/client';

const STORAGE_KEY = '@milk_hisab_auth_session';

interface AuthContextType {
  auth: AuthState;
  login: (phone: string, role: 'vendor' | 'customer', pin?: string) => Promise<void>;
  sendOtp: (phone: string, role: 'vendor' | 'customer') => Promise<{ success: boolean; message: string; otp_preview: string }>;
  verifyOtp: (phone: string, otp: string, role: 'vendor' | 'customer') => Promise<void>;
  registerVendor: (data: { name: string; phone: string; business_name: string; upi_id?: string; pin?: string }) => Promise<void>;
  registerCustomer: (data: { name: string; phone: string; address: string; default_quantity: number; milk_type: string; price_per_liter: number; pin?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  auth: { token: null, role: null },
  login: async () => {},
  sendOtp: async () => ({ success: false, message: '', otp_preview: '' }),
  verifyOtp: async () => {},
  registerVendor: async () => {},
  registerCustomer: async () => {},
  logout: async () => {},
  loading: false,
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ token: null, role: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persistent Session: Hydrate on startup from AsyncStorage
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.token && parsed.role) {
            setAuthToken(parsed.token);
            setAuth(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load persisted session from AsyncStorage:', e);
      }
    };
    hydrateSession();
  }, []);

  const saveSession = async (sessionData: AuthState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Failed to save session to AsyncStorage:', e);
    }
  };

  const login = async (phone: string, role: 'vendor' | 'customer', pin: string = '1234') => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginApi(phone, role, pin);
      setAuthToken(res.token);
      const newAuth: AuthState = {
        token: res.token,
        role: res.role,
        user: res.user,
        customer: res.customer,
      };
      setAuth(newAuth);
      await saveSession(newAuth);
    } catch (err: any) {
      setError(err.message || 'लॉगिन विफल रहा');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (phone: string, role: 'vendor' | 'customer') => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendOtpApi(phone, role);
      return res;
    } catch (err: any) {
      setError(err.message || 'ओटीपी भेजने में विफल');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string, role: 'vendor' | 'customer') => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOtpApi(phone, otp, role);
      setAuthToken(res.token);
      const newAuth: AuthState = {
        token: res.token,
        role: res.role,
        user: res.user,
        customer: res.customer,
      };
      setAuth(newAuth);
      await saveSession(newAuth);
    } catch (err: any) {
      setError(err.message || 'ओटीपी सत्यापन विफल');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerVendor = async (data: { name: string; phone: string; business_name: string; upi_id?: string; pin?: string }) => {
    setLoading(true);
    setError(null);
    try {
      await registerVendorApi(data);
      // Auto login after registration
      await login(data.phone, 'vendor', data.pin || '1234');
    } catch (err: any) {
      setError(err.message || 'रजिस्ट्रेशन विफल रहा');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerCustomer = async (data: { name: string; phone: string; address: string; default_quantity: number; milk_type: string; price_per_liter: number; pin?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerCustomerApi(data);
      // Auto login with created or generated PIN
      await login(data.phone, 'customer', res.pin || data.pin || '1234');
    } catch (err: any) {
      setError(err.message || 'रजिस्ट्रेशन विफल रहा');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthToken(null);
      setAuth({ token: null, role: null });
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing session:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      auth, 
      login, 
      sendOtp, 
      verifyOtp, 
      registerVendor, 
      registerCustomer, 
      logout, 
      loading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
