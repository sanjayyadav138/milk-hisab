from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    default_quantity: float = 1.0
    milk_type: str = "Cow"  # Cow, Buffalo, Mixed
    price_per_liter: float = 60.0
    avatar_url: Optional[str] = None
    customer_type: str = "BUYER"  # "BUYER" (दूध लेने वाला) or "SUPPLIER" (दूध देने वाला)
    is_active: bool = True

class CustomerCreate(CustomerBase):
    pin: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    default_quantity: Optional[float] = None
    milk_type: Optional[str] = None
    price_per_liter: Optional[float] = None
    avatar_url: Optional[str] = None
    customer_type: Optional[str] = None
    is_active: Optional[bool] = None
    pin: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    vendor_id: int
    pin: Optional[str] = None
    whatsapp_share_url: Optional[str] = None
    whatsapp_message: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Daily Log Schemas ---
class DailyLogBase(BaseModel):
    customer_id: int
    date: date
    quantity_delivered: float
    status: str = "Delivered"  # Delivered, Skipped, Extra
    notes: Optional[str] = None

class DailyLogCreate(DailyLogBase):
    pass

class DailyLogResponse(DailyLogBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DailyBatchItem(BaseModel):
    customer_id: int
    quantity_delivered: float
    status: str = "Delivered"  # Delivered, Skipped, Extra
    notes: Optional[str] = None

class DailyBatchSubmit(BaseModel):
    date: date
    entries: List[DailyBatchItem]

# --- Payment Schemas ---
class PaymentCreate(BaseModel):
    customer_id: int
    month_year: str  # Format: "YYYY-MM"
    amount_paid: float
    payment_mode: str = "Cash"  # Cash, UPI, Online
    notes: Optional[str] = None

class PaymentResponse(PaymentCreate):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Billing & Ledger Schemas ---
class DayBreakdown(BaseModel):
    date: date
    quantity: float
    status: str

class CustomerMonthlyBill(BaseModel):
    customer_id: int
    customer_name: str
    phone: Optional[str] = None
    month_year: str
    customer_type: str = "BUYER"
    total_liters: float
    price_per_liter: float
    total_amount: float
    delivered_days: int
    skipped_days: int
    amount_paid: float
    balance_due: float
    upi_link: Optional[str] = None
    whatsapp_message: str
    whatsapp_url: Optional[str] = None

# --- Milk Requests & Search Schemas ---
class MilkRequestCreate(BaseModel):
    customer_name: str
    customer_phone: str
    address: str
    locality: Optional[str] = None
    city: Optional[str] = "Gurugram"
    pincode: Optional[str] = "122001"
    milk_type: str = "Cow"
    quantity: float = 1.0
    delivery_time: str = "Morning"
    start_date: Optional[str] = None
    notes: Optional[str] = None

class MilkRequestResponse(BaseModel):
    id: int
    vendor_id: int
    customer_name: str
    customer_phone: str
    address: str
    locality: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    milk_type: str
    quantity: float
    delivery_time: str
    start_date: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class VendorPublicProfile(BaseModel):
    id: int
    name: str
    phone: str
    business_name: str
    upi_id: Optional[str] = None
    avatar_url: Optional[str] = None
    city: str
    area: str
    pincode: str
    service_areas: str
    price_cow: float
    price_buffalo: float
    morning_time: str
    evening_time: str
    active_customers_count: int = 0
    model_config = ConfigDict(from_attributes=True)

# --- Contact Inquiry Schema ---
class ContactInquiryCreate(BaseModel):
    name: str
    phone: str
    email: str
    location: str
    comments: str

class ContactInquiryResponse(ContactInquiryCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
