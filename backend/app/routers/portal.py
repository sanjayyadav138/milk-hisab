from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import extract
from pydantic import BaseModel
from typing import Optional, List
import datetime
from ..database import get_db
from ..models import User, Customer, DailyLog, Payment, CustomerSubUser, CustomerMessage

router = APIRouter(prefix="/api/portal", tags=["Portal & Auth"])

class LoginRequest(BaseModel):
    phone: str
    pin: Optional[str] = "1234"
    role: str  # "vendor" or "customer"

class SessionValidateRequest(BaseModel):
    token: Optional[str] = None
    role: str
    id: int

class UpdateVendorProfileRequest(BaseModel):
    id: int
    name: str
    phone: str
    business_name: str
    upi_id: Optional[str] = None
    avatar_url: Optional[str] = None
    pin: Optional[str] = None

class UpdateCustomerProfileRequest(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    default_quantity: Optional[float] = None
    milk_type: Optional[str] = None
    price_per_liter: Optional[float] = None
    avatar_url: Optional[str] = None
    pin: Optional[str] = None

class RegisterVendorRequest(BaseModel):
    name: str
    phone: str
    business_name: str
    upi_id: Optional[str] = None
    pin: Optional[str] = "1234"

class RegisterCustomerRequest(BaseModel):
    name: str
    phone: str
    address: str
    default_quantity: float = 1.0
    milk_type: str = "Cow"
    price_per_liter: float = 60.0
    vendor_id: Optional[int] = None
    pin: Optional[str] = "1234"

class DisputeCreateRequest(BaseModel):
    log_id: int
    reason: str

class ResolveDisputeRequest(BaseModel):
    log_id: int
    resolved_quantity: float
    resolution_note: Optional[str] = None

class SkipDateRequest(BaseModel):
    date: str  # YYYY-MM-DD
    reason: Optional[str] = None

class VendorReplyMessageRequest(BaseModel):
    customer_id: int
    message: str

class SubUserCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    relation: str = "Family Member"

class MessageCreate(BaseModel):
    sender_name: str
    sender_role: str = "customer"  # "customer" or "vendor"
    message: str

@router.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    clean_phone = req.phone.strip().replace(" ", "").replace("+91", "").replace("-", "")
    req_pin = (req.pin or "").strip()
    
    if req.role == "vendor":
        # Search by phone/username
        vendor = db.query(User).filter(
            (User.phone == clean_phone) | (User.phone.contains(clean_phone))
        ).first()

        # If user typed '1234' or 'vendor' or 'admin' or Sanjay's numbers, fallback to the default vendor
        if not vendor and clean_phone in ["1234", "admin", "vendor", "9971880670", "8053278764", "9876543210"]:
            vendor = db.query(User).first()

        if not vendor:
            raise HTTPException(status_code=404, detail="दूधिया (Vendor) खाता नहीं मिला। यूज़रनेम में '1234' डालें।")

        # Verify password/PIN
        if vendor.password_hash and req_pin != vendor.password_hash and req_pin != "1234":
            raise HTTPException(status_code=401, detail="गलत पासवर्ड (Wrong Password)! कृपया '1234' डालें।")

        now_ts = int(datetime.datetime.utcnow().timestamp())
        expires_at = int((datetime.datetime.utcnow() + datetime.timedelta(days=30)).timestamp() * 1000)

        return {
            "role": "vendor",
            "token": f"vendor_token_{vendor.id}_{now_ts}",
            "expires_at": expires_at,
            "user": {
                "id": vendor.id,
                "name": vendor.name,
                "phone": vendor.phone,
                "business_name": vendor.business_name,
                "upi_id": vendor.upi_id,
                "avatar_url": vendor.avatar_url
            }
        }
    else:
        # Customer Login
        customer = db.query(Customer).filter(
            (Customer.phone == clean_phone) | (Customer.phone.contains(clean_phone))
        ).first()

        if not customer:
            subuser = db.query(CustomerSubUser).filter(CustomerSubUser.phone.contains(clean_phone)).first()
            if subuser:
                customer = db.query(Customer).filter(Customer.id == subuser.customer_id).first()

        # If user typed '1234' or 'customer', fallback to the first customer (Sharma Ji)
        if not customer and clean_phone in ["1234", "customer", "sharma", "9811122233"]:
            customer = db.query(Customer).first()

        if not customer:
            raise HTTPException(status_code=404, detail="ग्राहक खाता नहीं मिला। यूज़रनेम में '1234' डालें।")

        if customer.pin and req_pin != customer.pin and req_pin != "1234":
            raise HTTPException(status_code=401, detail="गलत पासवर्ड / पिन! कृपया '1234' डालें।")

        now_ts = int(datetime.datetime.utcnow().timestamp())
        expires_at = int((datetime.datetime.utcnow() + datetime.timedelta(days=30)).timestamp() * 1000)

        return {
            "role": "customer",
            "token": f"customer_token_{customer.id}_{now_ts}",
            "expires_at": expires_at,
            "customer": {
                "id": customer.id,
                "name": customer.name,
                "phone": customer.phone,
                "address": customer.address,
                "default_quantity": customer.default_quantity,
                "milk_type": customer.milk_type,
                "price_per_liter": customer.price_per_liter,
                "avatar_url": customer.avatar_url
            }
        }

@router.post("/auth/validate-session")
def validate_session(req: SessionValidateRequest, db: Session = Depends(get_db)):
    if req.role == "vendor":
        vendor = db.query(User).filter(User.id == req.id).first()
        if not vendor:
            raise HTTPException(status_code=401, detail="सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।")
        return {
            "valid": True,
            "role": "vendor",
            "user": {
                "id": vendor.id,
                "name": vendor.name,
                "phone": vendor.phone,
                "business_name": vendor.business_name,
                "upi_id": vendor.upi_id,
                "avatar_url": vendor.avatar_url
            }
        }
    elif req.role == "customer":
        customer = db.query(Customer).filter(Customer.id == req.id).first()
        if not customer:
            raise HTTPException(status_code=401, detail="सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।")
        return {
            "valid": True,
            "role": "customer",
            "customer": {
                "id": customer.id,
                "name": customer.name,
                "phone": customer.phone,
                "address": customer.address,
                "default_quantity": customer.default_quantity,
                "milk_type": customer.milk_type,
                "price_per_liter": customer.price_per_liter,
                "avatar_url": customer.avatar_url
            }
        }
    raise HTTPException(status_code=400, detail="Invalid role specified")

@router.put("/profile/vendor")
def update_vendor_profile(req: UpdateVendorProfileRequest, db: Session = Depends(get_db)):
    vendor = db.query(User).filter(User.id == req.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.name = req.name.strip()
    vendor.phone = req.phone.strip()
    vendor.business_name = req.business_name.strip()
    if req.upi_id is not None:
        vendor.upi_id = req.upi_id.strip()
    if req.avatar_url is not None:
        vendor.avatar_url = req.avatar_url.strip() or None
    if req.pin and req.pin.strip():
        vendor.password_hash = req.pin.strip()

    db.commit()
    db.refresh(vendor)
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": vendor.id,
            "name": vendor.name,
            "phone": vendor.phone,
            "business_name": vendor.business_name,
            "upi_id": vendor.upi_id,
            "avatar_url": vendor.avatar_url
        }
    }

@router.put("/profile/customer")
def update_customer_profile(req: UpdateCustomerProfileRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == req.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.name = req.name.strip()
    if req.phone is not None:
        customer.phone = req.phone.strip()
    if req.address is not None:
        customer.address = req.address.strip()
    if req.default_quantity is not None:
        customer.default_quantity = req.default_quantity
    if req.milk_type is not None:
        customer.milk_type = req.milk_type
    if req.price_per_liter is not None:
        customer.price_per_liter = req.price_per_liter
    if req.avatar_url is not None:
        customer.avatar_url = req.avatar_url.strip() or None
    if req.pin and req.pin.strip():
        customer.pin = req.pin.strip()

    db.commit()
    db.refresh(customer)
    return {
        "message": "Profile updated successfully",
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address,
            "default_quantity": customer.default_quantity,
            "milk_type": customer.milk_type,
            "price_per_liter": customer.price_per_liter,
            "avatar_url": customer.avatar_url
        }
    }

@router.post("/auth/register-vendor")
def register_vendor(req: RegisterVendorRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == req.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="इस फोन नंबर से पहले ही खाता बना है।")
    vendor = User(
        name=req.name,
        phone=req.phone,
        business_name=req.business_name,
        upi_id=req.upi_id,
        password_hash=req.pin or "1234"
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return {"message": "Vendor registered successfully", "id": vendor.id}

@router.post("/auth/register-customer")
def register_customer(req: RegisterCustomerRequest, db: Session = Depends(get_db)):
    if req.vendor_id:
        vendor = db.query(User).filter(User.id == req.vendor_id).first()
        vendor_id = vendor.id if vendor else 1
    else:
        default_vendor = db.query(User).first()
        vendor_id = default_vendor.id if default_vendor else 1

    cust = Customer(
        vendor_id=vendor_id,
        name=req.name,
        phone=req.phone,
        address=req.address,
        default_quantity=req.default_quantity,
        milk_type=req.milk_type,
        price_per_liter=req.price_per_liter,
        pin=req.pin or "1234"
    )
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return {"message": "Customer registered successfully", "id": cust.id}

@router.get("/vendors-list")
def get_vendors_list(db: Session = Depends(get_db)):
    vendors = db.query(User).all()
    return [{"id": v.id, "name": v.name, "business_name": v.business_name, "phone": v.phone} for v in vendors]

@router.get("/customer/{customer_id}/dashboard")
def get_customer_dashboard(customer_id: int, month_year: Optional[str] = None, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    vendor = db.query(User).filter(User.id == customer.vendor_id).first()
    if not month_year:
        month_year = datetime.date.today().strftime("%Y-%m")

    year, month = map(int, month_year.split("-"))

    logs = db.query(DailyLog).filter(
        DailyLog.customer_id == customer_id,
        extract('year', DailyLog.date) == year,
        extract('month', DailyLog.date) == month
    ).order_by(DailyLog.date.desc()).all()

    total_liters = sum(l.quantity_delivered for l in logs)
    delivered_days = sum(1 for l in logs if l.quantity_delivered > 0)
    skipped_days = sum(1 for l in logs if l.quantity_delivered == 0 or l.status == "Skipped")
    total_amount = round(total_liters * customer.price_per_liter, 2)

    payments = db.query(Payment).filter(
        Payment.customer_id == customer_id,
        Payment.month_year == month_year
    ).all()
    amount_paid = sum(p.amount_paid for p in payments)
    balance_due = round(total_amount - amount_paid, 2)

    today = datetime.date.today()
    today_log = db.query(DailyLog).filter(
        DailyLog.customer_id == customer_id,
        DailyLog.date == today
    ).first()

    return {
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address,
            "default_quantity": customer.default_quantity,
            "milk_type": customer.milk_type,
            "price_per_liter": customer.price_per_liter,
            "avatar_url": customer.avatar_url
        },
        "vendor": {
            "name": vendor.name if vendor else "Sanjay Yadav",
            "business_name": vendor.business_name if vendor else "Milk Hisab Dairy & Supply",
            "phone": vendor.phone if vendor else "+91 9971880670",
            "upi_id": vendor.upi_id if vendor else "9971880670@upi",
            "avatar_url": vendor.avatar_url if vendor else None
        },
        "month_summary": {
            "month_year": month_year,
            "total_liters": total_liters,
            "delivered_days": delivered_days,
            "skipped_days": skipped_days,
            "total_amount": total_amount,
            "amount_paid": amount_paid,
            "balance_due": balance_due
        },
        "today_status": {
            "is_recorded": today_log is not None,
            "quantity": today_log.quantity_delivered if today_log else customer.default_quantity,
            "status": today_log.status if today_log else "Pending Delivery"
        },
        "recent_logs": [
            {
                "id": l.id,
                "date": l.date.isoformat(),
                "quantity": l.quantity_delivered,
                "status": l.status,
                "dispute_status": getattr(l, 'dispute_status', 'None') or 'None',
                "dispute_reason": getattr(l, 'dispute_reason', None),
                "notes": l.notes
            } for l in logs
        ]
    }

@router.get("/customer/{customer_id}/subusers")
def get_subusers(customer_id: int, db: Session = Depends(get_db)):
    subusers = db.query(CustomerSubUser).filter(CustomerSubUser.customer_id == customer_id).all()
    return subusers

@router.post("/customer/{customer_id}/subusers")
def add_subuser(customer_id: int, req: SubUserCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    subuser = CustomerSubUser(
        customer_id=customer_id,
        name=req.name,
        phone=req.phone,
        relation=req.relation
    )
    db.add(subuser)
    db.commit()
    db.refresh(subuser)
    return subuser

@router.get("/customer/{customer_id}/messages")
def get_messages(customer_id: int, db: Session = Depends(get_db)):
    msgs = db.query(CustomerMessage).filter(
        CustomerMessage.customer_id == customer_id
    ).order_by(CustomerMessage.created_at.asc()).all()
    return msgs

@router.post("/customer/{customer_id}/messages")
def send_message(customer_id: int, req: MessageCreate, db: Session = Depends(get_db)):
    msg = CustomerMessage(
        customer_id=customer_id,
        sender_name=req.sender_name,
        sender_role=req.sender_role,
        message=req.message
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

# --- Module 4: Dispute & Query Endpoints (DIS-01, DIS-02) ---
@router.post("/customer/{customer_id}/raise-dispute")
def raise_dispute(customer_id: int, req: DisputeCreateRequest, db: Session = Depends(get_db)):
    log = db.query(DailyLog).filter(DailyLog.id == req.log_id, DailyLog.customer_id == customer_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Delivery log entry not found")

    log.dispute_status = "Pending"
    log.dispute_reason = req.reason.strip()
    log.status = "Disputed"
    db.commit()
    db.refresh(log)
    return {
        "message": "Dispute query raised successfully",
        "log": {
            "id": log.id,
            "date": log.date.isoformat(),
            "quantity": log.quantity_delivered,
            "status": log.status,
            "dispute_status": log.dispute_status,
            "dispute_reason": log.dispute_reason,
            "notes": log.notes
        }
    }

@router.put("/vendor/resolve-dispute")
def resolve_dispute(req: ResolveDisputeRequest, db: Session = Depends(get_db)):
    log = db.query(DailyLog).filter(DailyLog.id == req.log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Delivery log entry not found")

    log.quantity_delivered = req.resolved_quantity
    log.dispute_status = "Resolved"
    log.status = "Resolved" if req.resolved_quantity > 0 else "Skipped"
    if req.resolution_note:
        log.notes = f"Resolved: {req.resolution_note.strip()}"
    db.commit()
    db.refresh(log)
    return {
        "message": "Dispute resolved successfully",
        "log": {
            "id": log.id,
            "date": log.date.isoformat(),
            "quantity": log.quantity_delivered,
            "status": log.status,
            "dispute_status": log.dispute_status,
            "notes": log.notes
        }
    }

@router.get("/vendor/disputes")
def get_vendor_disputes(db: Session = Depends(get_db)):
    logs = db.query(DailyLog).filter(DailyLog.dispute_status == "Pending").order_by(DailyLog.date.desc()).all()
    results = []
    for l in logs:
        cust = db.query(Customer).filter(Customer.id == l.customer_id).first()
        results.append({
            "log_id": l.id,
            "customer_id": l.customer_id,
            "customer_name": cust.name if cust else "Unknown Customer",
            "customer_phone": cust.phone if cust else "",
            "date": l.date.isoformat(),
            "quantity": l.quantity_delivered,
            "status": l.status,
            "dispute_reason": l.dispute_reason,
            "notes": l.notes
        })
    return results

# --- Module 6: Delivery Pause / Skip Feature (SKP-01, SKP-02) ---
@router.post("/customer/{customer_id}/skip-date")
def customer_skip_date(customer_id: int, req: SkipDateRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    try:
        skip_date = datetime.date.fromisoformat(req.date.strip())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    today = datetime.date.today()
    if skip_date <= today:
        raise HTTPException(
            status_code=400,
            detail="आज के दिन या पुरानी तारीख की छुट्टी ऐप से नहीं हो सकती क्योंकि सप्लाई शुरू हो चुकी है। कृपया सीधे दूधिया से संपर्क करें।"
        )

    # Check if a log entry already exists for this future date
    existing_log = db.query(DailyLog).filter(
        DailyLog.customer_id == customer_id,
        DailyLog.date == skip_date
    ).first()

    skip_note = req.reason.strip() if req.reason else "ग्राहक द्वारा पूर्व सूचना: छुट्टी (Skipped)"

    if existing_log:
        existing_log.quantity_delivered = 0.0
        existing_log.status = "Skipped"
        existing_log.notes = skip_note
    else:
        new_log = DailyLog(
            customer_id=customer_id,
            date=skip_date,
            quantity_delivered=0.0,
            status="Skipped",
            notes=skip_note
        )
        db.add(new_log)

    db.commit()
    return {"message": "Milk skip scheduled successfully", "date": skip_date.isoformat()}

# --- Module 5: Vendor Messaging (MSG-02) ---
@router.get("/vendor/all-messages")
def get_vendor_messages(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    threads = []
    for c in customers:
        msgs = db.query(CustomerMessage).filter(CustomerMessage.customer_id == c.id).order_by(CustomerMessage.created_at.asc()).all()
        if msgs:
            threads.append({
                "customer_id": c.id,
                "customer_name": c.name,
                "customer_phone": c.phone or "",
                "address": c.address or "",
                "last_message": msgs[-1].message,
                "last_time": msgs[-1].created_at.isoformat(),
                "messages": [
                    {
                        "id": m.id,
                        "sender_name": m.sender_name,
                        "sender_role": m.sender_role,
                        "message": m.message,
                        "created_at": m.created_at.isoformat()
                    } for m in msgs
                ]
            })
    return threads

@router.post("/vendor/send-message")
def vendor_send_message(req: VendorReplyMessageRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == req.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    vendor = db.query(User).filter(User.id == customer.vendor_id).first()
    vendor_name = vendor.name if vendor else "दूधिया"

    msg = CustomerMessage(
        customer_id=req.customer_id,
        sender_name=vendor_name,
        sender_role="vendor",
        message=req.message.strip()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "customer_id": msg.customer_id,
        "sender_name": msg.sender_name,
        "sender_role": msg.sender_role,
        "message": msg.message,
        "created_at": msg.created_at.isoformat()
    }
