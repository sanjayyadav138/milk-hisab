export interface User {
  id: number;
  name: string;
  phone: string;
  business_name: string;
  upi_id?: string;
  avatar_url?: string;
}

export interface Customer {
  id: number;
  vendor_id?: number;
  name: string;
  phone?: string;
  address?: string;
  default_quantity: number;
  milk_type: string;
  price_per_liter: number;
  avatar_url?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface DailyLogItem {
  customer_id: number;
  name: string;
  phone?: string;
  address?: string;
  default_quantity: number;
  milk_type: string;
  price_per_liter: number;
  log_id?: number | null;
  date: string;
  quantity: number;
  status: string; // "Delivered" | "Skipped" | "Extra" | "Pending"
  is_recorded: boolean;
}

export interface MonthlyBill {
  customer_id: number;
  customer_name: string;
  phone?: string;
  month_year: string;
  total_liters: number;
  price_per_liter: number;
  total_amount: number;
  delivered_days: number;
  skipped_days: number;
  amount_paid: number;
  balance_due: number;
  upi_link?: string;
  whatsapp_message: string;
  whatsapp_url?: string;
}

export interface SubUser {
  id?: number;
  customer_id: number;
  name: string;
  phone?: string;
  relation: string;
  created_at?: string;
}

export interface CustomerMessage {
  id?: number;
  customer_id: number;
  sender_name: string;
  sender_role: "customer" | "vendor";
  message: string;
  created_at?: string;
}

export interface CustomerDashboardData {
  customer: Customer;
  vendor: {
    name: string;
    business_name: string;
    phone: string;
    upi_id: string;
  };
  month_summary: {
    month_year: string;
    total_liters: number;
    delivered_days: number;
    skipped_days: number;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
  };
  today_status: {
    is_recorded: boolean;
    quantity: number;
    status: string;
  };
  recent_logs: Array<{
    id: number;
    date: string;
    quantity: number;
    status: string;
    dispute_status?: string;
    dispute_reason?: string;
    notes?: string;
  }>;
}

export interface VendorDisputeItem {
  log_id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  date: string;
  quantity: number;
  status: string;
  dispute_reason?: string;
  notes?: string;
}

export interface VendorMessageThread {
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  address: string;
  last_message: string;
  last_time: string;
  messages: Array<{
    id: number;
    sender_name: string;
    sender_role: 'customer' | 'vendor';
    message: string;
    created_at: string;
  }>;
}

export interface VendorInfo {
  id: number;
  name: string;
  business_name: string;
  phone: string;
}

export type AuthRole = 'vendor' | 'customer' | null;

export interface AuthState {
  role: AuthRole;
  user: User | null;
  customer: Customer | null;
  token?: string | null;
  expires_at?: number | null;
  last_active_at?: number | null;
}
