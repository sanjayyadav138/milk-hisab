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
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customers = relationship("Customer", back_populates="vendor")

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
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    vendor = relationship("User", back_populates="customers")
    daily_logs = relationship("DailyLog", back_populates="customer", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="customer", cascade="all, delete-orphan")
    subusers = relationship("CustomerSubUser", back_populates="customer", cascade="all, delete-orphan")
    messages = relationship("CustomerMessage", back_populates="customer", cascade="all, delete-orphan")

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
