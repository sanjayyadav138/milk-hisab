import React, { createContext, useContext, useState } from 'react';
import { AuthState, Customer } from '../types';
import { setAuthToken, loginApi, registerVendorApi, registerCustomerApi } from '../api/client';

interface AuthContextType {
  auth: AuthState;
  login: (phone: string, role: 'vendor' | 'customer', pin?: string) => Promise<void>;
  registerVendor: (data: { name: string; phone: string; business_name: string; upi_id?: string; pin?: string }) => Promise<void>;
  registerCustomer: (data: { name: string; phone: string; address: string; default_quantity: number; milk_type: string; price_per_liter: number; pin?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  auth: { token: null, role: null },
  login: async () => {},
  registerVendor: async () => {},
  registerCustomer: async () => {},
  logout: () => {},
  loading: false,
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ token: null, role: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (phone: string, role: 'vendor' | 'customer', pin: string = '1234') => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginApi(phone, role, pin);
      setAuthToken(res.token);
      setAuth({
        token: res.token,
        role: res.role,
        user: res.user,
        customer: res.customer,
      });
    } catch (err: any) {
      setError(err.message || 'लॉगिन विफल रहा');
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

  const logout = () => {
    setAuthToken(null);
    setAuth({ token: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, registerVendor, registerCustomer, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
