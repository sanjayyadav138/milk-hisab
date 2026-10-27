from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Customer, User
from ..schemas import CustomerCreate, CustomerUpdate, CustomerResponse
from ..services.notifications import (
    generate_random_pin,
    format_welcome_whatsapp_message,
    get_whatsapp_share_url,
    send_welcome_email,
    send_welcome_sms
)

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("/", response_model=List[CustomerResponse])
def get_customers(
    skip: int = 0, 
    limit: int = 100, 
    customer_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Customer).filter(Customer.is_active == True)
    if customer_type and isinstance(customer_type, str):
        query = query.filter(Customer.customer_type == customer_type)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    # Automatically generate a secure 4-digit PIN if not explicitly supplied
    pin = customer.pin.strip() if customer.pin and customer.pin.strip() else generate_random_pin()
    
    customer_dict = customer.model_dump()
    customer_dict["pin"] = pin
    db_customer = Customer(**customer_dict)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)

    # Fetch vendor info for personalized notification
    vendor = db.query(User).filter(User.id == db_customer.vendor_id).first()
    vendor_name = vendor.name if vendor else "Milk Hisab Partner"
    business_name = vendor.business_name if vendor else None

    # 1. WhatsApp Welcome & Share Intent
    wa_msg = format_welcome_whatsapp_message(
        name=db_customer.name,
        phone=db_customer.phone or "",
        pin=pin,
        vendor_name=vendor_name,
        business_name=business_name
    )
    wa_url = get_whatsapp_share_url(db_customer.phone or "", wa_msg) if db_customer.phone else None

    # 2. Email Notification (if email provided)
    if getattr(db_customer, 'email', None):
        send_welcome_email(
            to_email=db_customer.email,
            name=db_customer.name,
            phone=db_customer.phone or "",
            pin=pin,
            vendor_name=vendor_name,
            business_name=business_name
        )

    # 3. SMS Notification (if phone provided)
    if db_customer.phone:
        send_welcome_sms(
            phone=db_customer.phone,
            pin=pin,
            vendor_name=business_name or vendor_name
        )

    response = CustomerResponse.model_validate(db_customer)
    response.whatsapp_share_url = wa_url
    response.whatsapp_message = wa_msg
    return response

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer_update: CustomerUpdate, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = customer_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)
        
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    # Soft delete
    db_customer.is_active = False
    db.commit()
    return {"message": f"Customer {db_customer.name} marked inactive"}
