import React, { createContext, useContext, useState } from 'react';
import { AuthState, Customer } from '../types';
import { setAuthToken, loginVendorApi, loginCustomerApi } from '../api/client';

interface AuthContextType {
  auth: AuthState;
  loginVendor: (phone: string, pin: string) => Promise<void>;
  loginCustomer: (phone: string, pin: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  auth: { token: null, role: null },
  loginVendor: async () => {},
  loginCustomer: async () => {},
  logout: () => {},
  loading: false,
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ token: null, role: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginVendor = async (phone: string, pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginVendorApi(phone, pin);
      setAuthToken(res.access_token);
      setAuth({
        token: res.access_token,
        role: 'vendor',
        user: res.user,
      });
    } catch (err: any) {
      setError(err.message || 'Vendor login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginCustomer = async (phone: string, pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginCustomerApi(phone, pin);
      setAuthToken(res.access_token);
      setAuth({
        token: res.access_token,
        role: 'customer',
        customer: res.customer,
      });
    } catch (err: any) {
      setError(err.message || 'Customer login failed');
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
    <AuthContext.Provider value={{ auth, loginVendor, loginCustomer, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
