import datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    business_name = Column(String(150), default="Krishna Dairy & Milk Supply")
    upi_id = Column(String(100), nullable=True)  # E.g., vendor@okhdfcbank
    avatar_url = Column(String(500), nullable=True)
    password_hash = Column(String(100), default="1234")  # Simple pin/pass for MVP
    city = Column(String(100), default="Gurugram")
    area = Column(String(150), default="Jamalpur / Sohna Road")
    pincode = Column(String(20), default="122001")
    service_areas = Column(String(255), default="Gali 1-5, Main Market, Mandir Road, Sector 47-49")
    price_cow = Column(Float, default=60.0)
    price_buffalo = Column(Float, default=70.0)
    morning_time = Column(String(50), default="6:00 AM - 8:00 AM")
    evening_time = Column(String(50), default="5:30 PM - 7:30 PM")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customers = relationship("Customer", back_populates="vendor")
    milk_requests = relationship("MilkRequest", back_populates="vendor", cascade="all, delete-orphan")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)
    name = Column(String(100), nullable=False, index=True)
    phone = Column(String(20), nullable=True, index=True)
    pin = Column(String(20), default="1234")  # Simple access PIN for household login
    address = Column(String(255), nullable=True)
    default_quantity = Column(Float, default=1.0)  # in Liters (e.g., 1.5)
    milk_type = Column(String(20), default="Cow")   # Cow / Buffalo / Mixed
    price_per_liter = Column(Float, default=60.0)  # Price in INR
    avatar_url = Column(String(500), nullable=True)
    customer_type = Column(String(20), default="BUYER")  # "BUYER" (दूध लेने वाला) or "SUPPLIER" (दूध देने वाला / संकलन)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    vendor = relationship("User", back_populates="customers")
    daily_logs = relationship("DailyLog", back_populates="customer", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="customer", cascade="all, delete-orphan")
    subusers = relationship("CustomerSubUser", back_populates="customer", cascade="all, delete-orphan")
    messages = relationship("CustomerMessage", back_populates="customer", cascade="all, delete-orphan")

class MilkRequest(Base):
    __tablename__ = "milk_requests"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    address = Column(String(255), nullable=False)
    locality = Column(String(100), nullable=True)
    city = Column(String(100), default="Gurugram")
    pincode = Column(String(20), default="122001")
    milk_type = Column(String(20), default="Cow")  # Cow / Buffalo / Mixed
    quantity = Column(Float, default=1.0)  # in Liters
    delivery_time = Column(String(50), default="Morning")  # Morning / Evening / Both
    start_date = Column(String(20), nullable=True)  # YYYY-MM-DD
    notes = Column(String(255), nullable=True)
    status = Column(String(20), default="Pending")  # "Pending", "Accepted", "Rejected"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    vendor = relationship("User", back_populates="milk_requests")

class CustomerSubUser(Base):
    __tablename__ = "customer_subusers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    relation = Column(String(50), default="Family Member")  # Wife, Son, Brother, Roommate
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="subusers")

class CustomerMessage(Base):
    __tablename__ = "customer_messages"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    sender_name = Column(String(100), nullable=False)
    sender_role = Column(String(20), default="customer")  # "customer" or "vendor"
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="messages")

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    quantity_delivered = Column(Float, default=0.0)  # 0 if skipped, or actual liters
    status = Column(String(20), default="Delivered")  # "Delivered", "Skipped", "Extra", "Disputed", "Resolved"
    notes = Column(String(255), nullable=True)
    dispute_status = Column(String(20), default="None")  # "None", "Pending", "Resolved"
    dispute_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="daily_logs")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    month_year = Column(String(7), nullable=False)  # Format: "YYYY-MM" (e.g. "2026-10")
    amount_paid = Column(Float, nullable=False)
    payment_mode = Column(String(20), default="Cash")  # "Cash", "UPI", "Online"
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="payments")

class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    location = Column(String(150), nullable=False)
    comments = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
