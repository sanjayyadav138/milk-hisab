import { CONFIG } from '../constants/config';
import { Customer, DailyLogItem, BatchLogPayload, CustomerDashboardData } from '../types';

let currentAuthToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentAuthToken = token;
};

export const getAuthToken = () => currentAuthToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed (${response.status})`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// 1. Authentication APIs (Uses exact same database & portal routes as Web)
export async function sendOtpApi(phone: string, role: 'vendor' | 'customer' = 'vendor') {
  return request<{ success: boolean; message: string; phone: string; otp_preview: string }>('/portal/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, role }),
  });
}

export async function verifyOtpApi(phone: string, otp: string, role: 'vendor' | 'customer' = 'vendor') {
  return request<{
    role: 'vendor' | 'customer';
    token: string;
    expires_at: number;
    user?: any;
    customer?: Customer;
  }>('/portal/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp, role }),
  });
}

export async function loginApi(phone: string, role: 'vendor' | 'customer', pin: string = '1234') {
  return request<{
    role: 'vendor' | 'customer';
    token: string;
    expires_at: number;
    user?: any;
    customer?: Customer;
  }>('/portal/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, role, pin }),
  });
}

export async function registerVendorApi(payload: {
  name: string;
  phone: string;
  business_name: string;
  upi_id?: string;
  pin?: string;
}) {
  return request<{ message: string; id: number }>('/portal/auth/register-vendor', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerCustomerApi(payload: {
  name: string;
  phone: string;
  address: string;
  default_quantity: number;
  milk_type: string;
  price_per_liter: number;
  pin?: string;
}) {
  return request<{ message: string; id: number; pin: string }>('/portal/auth/register-customer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// 2. Daily Checklist APIs (Vendor)
export async function fetchDayChecklistApi(date: string) {
  return request<{ date: string; checklist: DailyLogItem[] }>(`/logs/day-view?date=${date}`);
}

export async function submitBatchLogsApi(payload: BatchLogPayload) {
  return request<{ success: boolean; message: string; count: number }>('/logs/batch', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// 3. Customers & Sourcing APIs (Vendor)
export async function fetchCustomersApi() {
  return request<Customer[]>('/customers/');
}

export async function createCustomerApi(data: Partial<Customer>) {
  return request<Customer>('/customers/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 4. Customer Portal APIs (Customer)
export async function fetchCustomerDashboardApi(customerId: number) {
  return request<CustomerDashboardData>(`/portal/customer/${customerId}/dashboard`);
}

export async function raiseDisputeApi(customerId: number, logId: number, reason: string, actualQuantity: number) {
  return request<any>(`/portal/customer/${customerId}/raise-dispute`, {
    method: 'POST',
    body: JSON.stringify({
      log_id: logId,
      reason,
      actual_quantity: actualQuantity,
    }),
  });
}

export async function skipMilkDateApi(customerId: number, date: string, reason?: string) {
  return request<any>(`/portal/customer/${customerId}/skip-date`, {
    method: 'POST',
    body: JSON.stringify({
      date,
      reason: reason || 'Scheduled via mobile app',
    }),
  });
}

// 5. Voice AI Parsing API
export async function parseVoiceCommandApi(transcript: string) {
  return request<any>('/logs/parse-voice', {
    method: 'POST',
    body: JSON.stringify({ text: transcript }),
  });
}
