// Reused domain interfaces directly from Milk Hisab Web Core
export interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
  default_quantity: number;
  milk_type: string;
  price_per_liter: number;
  customer_type?: 'BUYER' | 'SUPPLIER';
  active?: boolean;
}

export interface DailyLogItem {
  customer_id: number;
  customer_name: string;
  address?: string;
  default_quantity: number;
  milk_type: string;
  price_per_liter: number;
  customer_type?: 'BUYER' | 'SUPPLIER';
  quantity: number;
  status: 'Delivered' | 'Skipped' | 'Extra';
  notes?: string;
  dispute_id?: number | null;
  dispute_status?: 'Pending' | 'Resolved' | 'Rejected' | null;
  dispute_reason?: string | null;
  reported_quantity?: number | null;
}

export interface BatchLogEntry {
  customer_id: number;
  quantity_delivered: number;
  status: string;
  notes?: string | null;
}

export interface BatchLogPayload {
  date: string;
  entries: BatchLogEntry[];
}

export interface SubUser {
  id: number;
  name: string;
  phone: string;
  relation: string;
}

export interface CustomerMessage {
  id: number;
  sender_name: string;
  sender_role: 'vendor' | 'customer';
  message: string;
  timestamp: string;
}

export interface CustomerDashboardData {
  customer: Customer;
  vendor: {
    name: string;
    phone: string;
    business_name: string;
    upi_id?: string;
  };
  month_summary: {
    total_liters: number;
    total_amount: number;
    days_delivered: number;
    days_skipped: number;
  };
  today_status: {
    delivered: boolean;
    quantity: number;
    status: string;
  };
  recent_logs: Array<{
    id: number;
    date: string;
    quantity: number;
    status: string;
    amount: number;
    dispute_status?: 'Pending' | 'Resolved' | 'Rejected' | null;
    dispute_reason?: string | null;
    reported_quantity?: number | null;
  }>;
}

export interface AuthState {
  token: string | null;
  role: 'vendor' | 'customer' | null;
  user?: {
    id: number;
    name: string;
    phone: string;
    business_name: string;
    upi_id?: string;
  };
  customer?: Customer;
}
