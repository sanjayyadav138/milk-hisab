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

// 1. Authentication APIs
export async function loginVendorApi(phone: string, pin: string) {
  return request<{ access_token: string; token_type: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, pin }),
  });
}

export async function loginCustomerApi(phone: string, pin: string) {
  return request<{ access_token: string; token_type: string; customer: Customer }>('/auth/customer/login', {
    method: 'POST',
    body: JSON.stringify({ phone, pin }),
  });
}

// 2. Daily Checklist APIs (Vendor)
export async function fetchDayChecklistApi(date: string) {
  return request<{ date: string; checklist: DailyLogItem[] }>(`/logs/checklist?date=${date}`);
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
  return request<CustomerDashboardData>(`/customer/dashboard/${customerId}`);
}

export async function raiseDisputeApi(customerId: number, logId: number, reason: string, reportedQty: number) {
  return request<any>(`/customer/dispute/${customerId}`, {
    method: 'POST',
    body: JSON.stringify({
      log_id: logId,
      dispute_reason: reason,
      reported_quantity: reportedQty,
    }),
  });
}

export async function skipMilkDateApi(customerId: number, date: string, reason?: string) {
  return request<any>(`/customer/skip/${customerId}`, {
    method: 'POST',
    body: JSON.stringify({
      skip_date: date,
      reason: reason || 'Scheduled via mobile app',
    }),
  });
}

// 5. Voice AI Parsing API
export async function parseVoiceCommandApi(transcript: string) {
  return request<any>('/ai/parse-voice', {
    method: 'POST',
    body: JSON.stringify({ transcript }),
  });
}
