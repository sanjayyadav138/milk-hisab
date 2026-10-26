import { 
  Customer, DailyLogItem, MonthlyBill, 
  CustomerDashboardData, SubUser, CustomerMessage,
  VendorDisputeItem, VendorMessageThread, VendorInfo
} from '../types';

const API_BASE = "http://localhost:8000/api";

// --- Auth Endpoints ---
export async function loginApi(phone: string, role: 'vendor' | 'customer', pin: string = '1234') {
  const res = await fetch(`${API_BASE}/portal/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, role, pin })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "लॉगिन विफल रहा" }));
    throw new Error(err.detail || "लॉगिन विफल रहा");
  }
  return res.json();
}

export async function validateSessionApi(role: 'vendor' | 'customer', id: number, token?: string | null) {
  const res = await fetch(`${API_BASE}/portal/auth/validate-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, id, token })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Session expired or invalid" }));
    throw new Error(err.detail || "Session expired or invalid");
  }
  return res.json();
}

export async function updateVendorProfileApi(payload: {
  id: number;
  name: string;
  phone: string;
  business_name: string;
  upi_id?: string;
  avatar_url?: string;
  pin?: string;
}) {
  const res = await fetch(`${API_BASE}/portal/profile/vendor`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "प्रोफ़ाइल अपडेट करने में त्रुटि आई" }));
    throw new Error(err.detail || "प्रोफ़ाइल अपडेट करने में त्रुटि आई");
  }
  return res.json();
}

export async function updateCustomerProfileApi(payload: {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  default_quantity?: number;
  milk_type?: string;
  price_per_liter?: number;
  avatar_url?: string;
  pin?: string;
}) {
  const res = await fetch(`${API_BASE}/portal/profile/customer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "प्रोफ़ाइल अपडेट करने में त्रुटि आई" }));
    throw new Error(err.detail || "प्रोफ़ाइल अपडेट करने में त्रुटि आई");
  }
  return res.json();
}

export async function registerVendorApi(payload: {
  name: string;
  phone: string;
  business_name: string;
  upi_id?: string;
  pin?: string;
}) {
  const res = await fetch(`${API_BASE}/portal/auth/register-vendor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "रजिस्ट्रेशन विफल रहा" }));
    throw new Error(err.detail || "रजिस्ट्रेशन विफल रहा");
  }
  return res.json();
}

export async function registerCustomerApi(payload: {
  name: string;
  phone: string;
  address: string;
  default_quantity: number;
  milk_type: string;
  price_per_liter: number;
  vendor_id?: number;
  pin?: string;
}) {
  const res = await fetch(`${API_BASE}/portal/auth/register-customer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "ग्राहक रजिस्ट्रेशन विफल रहा" }));
    throw new Error(err.detail || "ग्राहक रजिस्ट्रेशन विफल रहा");
  }
  return res.json();
}

// --- Customer Portal Endpoints ---
export async function fetchCustomerDashboard(customerId: number, monthYear?: string): Promise<CustomerDashboardData> {
  const url = monthYear 
    ? `${API_BASE}/portal/customer/${customerId}/dashboard?month_year=${monthYear}`
    : `${API_BASE}/portal/customer/${customerId}/dashboard`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("ग्राहक डैशबोर्ड लोड नहीं हो सका");
  return res.json();
}

export async function fetchSubUsers(customerId: number): Promise<SubUser[]> {
  const res = await fetch(`${API_BASE}/portal/customer/${customerId}/subusers`);
  if (!res.ok) throw new Error("उपभोक्ता सदस्य लोड नहीं हो सके");
  return res.json();
}

export async function addSubUserApi(customerId: number, payload: { name: string; phone?: string; relation: string }): Promise<SubUser> {
  const res = await fetch(`${API_BASE}/portal/customer/${customerId}/subusers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("सदस्य जोड़ने में त्रुटि आई");
  return res.json();
}

export async function fetchMessages(customerId: number): Promise<CustomerMessage[]> {
  const res = await fetch(`${API_BASE}/portal/customer/${customerId}/messages`);
  if (!res.ok) throw new Error("संदेश लोड नहीं हो सके");
  return res.json();
}

export async function sendMessageApi(customerId: number, payload: { sender_name: string; sender_role: 'customer' | 'vendor'; message: string }): Promise<CustomerMessage> {
  const res = await fetch(`${API_BASE}/portal/customer/${customerId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("संदेश भेजने में त्रुटि आई");
  return res.json();
}

// --- Vendor Operations Endpoints ---
export async function fetchDayChecklist(dateStr?: string): Promise<{ date: string; checklist: DailyLogItem[] }> {
  const url = dateStr ? `${API_BASE}/logs/day-view?date=${dateStr}` : `${API_BASE}/logs/day-view`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("दैनिक लिस्ट लोड नहीं हो सकी");
  return res.json();
}

export async function submitBatchLogs(payload: {
  date: string;
  entries: Array<{
    customer_id: number;
    quantity_delivered: number;
    status: string;
    notes?: string | null;
  }>;
}) {
  const res = await fetch(`${API_BASE}/logs/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("हिसाब दर्ज करने में त्रुटि आई");
  return res.json();
}

export async function parseVoiceText(text: string) {
  const res = await fetch(`${API_BASE}/logs/parse-voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("आवाज़ समझने में त्रुटि आई");
  return res.json();
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/customers/`);
  if (!res.ok) throw new Error("ग्राहक सूची लोड नहीं हो सकी");
  return res.json();
}

export async function createCustomer(customerData: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  if (!res.ok) throw new Error("ग्राहक जोड़ने में त्रुटि आई");
  return res.json();
}

export async function fetchMonthlyBills(monthYear?: string): Promise<MonthlyBill[]> {
  const url = monthYear ? `${API_BASE}/billing/summary?month_year=${monthYear}` : `${API_BASE}/billing/summary`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("मासिक बिल लोड नहीं हो सके");
  return res.json();
}

export async function recordPayment(paymentData: {
  customer_id: number;
  month_year: string;
  amount_paid: number;
  payment_mode: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/billing/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });
  if (!res.ok) throw new Error("पेमेंट दर्ज करने में त्रुटि आई");
  return res.json();
}

// --- Module 1: Vendors List (AUT-03) ---
export async function fetchVendorsList(): Promise<VendorInfo[]> {
  const res = await fetch(`${API_BASE}/portal/vendors-list`);
  if (!res.ok) throw new Error("दूधिया सूची लोड नहीं हो सकी");
  return res.json();
}

// --- Module 4: Dispute & Query Resolution (DIS-01, DIS-02) ---
export async function raiseDisputeApi(customerId: number, logId: number, reason: string) {
  const res = await fetch(`${API_BASE}/portal/customer/${customerId}/raise-dispute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ log_id: logId, reason })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "आपत्ति दर्ज नहीं हो सकी" }));
    throw new Error(err.detail || "आपत्ति दर्ज नहीं हो सकी");
  }
  return res.json();
}

export async function fetchVendorDisputesApi(): Promise<VendorDisputeItem[]> {
  const res = await fetch(`${API_BASE}/portal/vendor/disputes`);
  if (!res.ok) throw new Error("आपत्ति सूची लोड नहीं हो सकी");
  return res.json();
}

export async function resolveDisputeApi(logId: number, resolvedQuantity: number, resolutionNote?: string) {
  const res = await fetch(`${API_BASE}/portal/vendor/resolve-dispute`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ log_id: logId, resolved_quantity: resolvedQuantity, resolution_note: resolutionNote })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "आपत्ति का निवारण नहीं हो सका" }));
    throw new Error(err.detail || "आपत्ति का निवारण नहीं हो सका");
  }
  return res.json();
}

// --- Module 6: Delivery Pause / Skip Feature (SKP-01, SKP-02) ---
export async function skipMilkDateApi(customerId: number, date: string, reason?: string) {
  const res = await fetch(`${API_BASE}/portal/customer/${customerId}/skip-date`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, reason })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "छुट्टी दर्ज नहीं हो सकी" }));
    throw new Error(err.detail || "छुट्टी दर्ज नहीं हो सकी");
  }
  return res.json();
}

// --- Module 5: Vendor Message Management (MSG-02) ---
export async function fetchVendorMessageThreadsApi(): Promise<VendorMessageThread[]> {
  const res = await fetch(`${API_BASE}/portal/vendor/all-messages`);
  if (!res.ok) throw new Error("संदेश लोड नहीं हो सके");
  return res.json();
}

export async function vendorReplyMessageApi(customerId: number, message: string) {
  const res = await fetch(`${API_BASE}/portal/vendor/send-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id: customerId, message })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "उत्तर भेजने में त्रुटि आई" }));
    throw new Error(err.detail || "उत्तर भेजने में त्रुटि आई");
  }
  return res.json();
}
