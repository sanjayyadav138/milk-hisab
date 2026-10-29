from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
import os
import shutil
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from pydantic import BaseModel
from typing import Optional, List
import datetime
from ..database import get_db
from ..models import User, Customer, DailyLog, Payment, CustomerSubUser, CustomerMessage, MilkRequest, ContactInquiry
from ..schemas import MilkRequestCreate, MilkRequestResponse, VendorPublicProfile, ContactInquiryCreate
from ..services.notifications import (
    generate_random_pin,
    format_welcome_whatsapp_message,
    get_whatsapp_share_url,
    send_welcome_email,
    send_welcome_sms
)

router = APIRouter(prefix="/api/portal", tags=["Portal & Auth"])

class SendOtpRequest(BaseModel):
    phone: str
    role: Optional[str] = "vendor"

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str
    role: Optional[str] = "vendor"

OTP_STORE = {}

class LoginRequest(BaseModel):
    phone: str
    pin: Optional[str] = "1234"
    role: str  # "vendor" or "customer"

class SessionValidateRequest(BaseModel):
    token: Optional[str] = None
    role: str
    id: int

class ChangePinRequest(BaseModel):
    role: str  # "vendor" or "customer"
    id: int
    current_pin: Optional[str] = None
    new_pin: str

class UpdateVendorProfileRequest(BaseModel):
    id: int
    name: str
    phone: str
    business_name: str
    upi_id: Optional[str] = None
    avatar_url: Optional[str] = None
    pin: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    pincode: Optional[str] = None
    service_areas: Optional[str] = None
    price_cow: Optional[float] = None
    price_buffalo: Optional[float] = None
    morning_time: Optional[str] = None
    evening_time: Optional[str] = None

class UpdateCustomerProfileRequest(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    default_quantity: Optional[float] = None
    milk_type: Optional[str] = None
    price_per_liter: Optional[float] = None
    avatar_url: Optional[str] = None
    customer_type: Optional[str] = None
    pin: Optional[str] = None
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
    email: Optional[str] = None
    address: str
    default_quantity: float = 1.0
    milk_type: str = "Cow"
    price_per_liter: float = 60.0
    customer_type: Optional[str] = "BUYER"
    vendor_id: Optional[int] = None
    pin: Optional[str] = None

class ForgotPinRequest(BaseModel):
    phone: str
    role: str  # "vendor" or "customer"

class DisputeCreateRequest(BaseModel):
    log_id: int
    reason: str
    actual_quantity: Optional[float] = None

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

@router.post("/auth/send-otp")
def send_otp(req: SendOtpRequest, db: Session = Depends(get_db)):
    clean_phone = req.phone.strip().replace(" ", "").replace("+91", "").replace("-", "")
    if len(clean_phone) < 4:
        raise HTTPException(status_code=400, detail="Invalid mobile number. Please enter a valid 10-digit number.")
    
    otp = "1234"
    OTP_STORE[clean_phone] = {
        "otp": otp,
        "timestamp": datetime.datetime.utcnow()
    }
    return {
        "success": True,
        "message": f"OTP successfully sent to {clean_phone} (Demo OTP: {otp})",
        "phone": clean_phone,
        "otp_preview": otp
    }

@router.post("/auth/verify-otp")
def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    clean_phone = req.phone.strip().replace(" ", "").replace("+91", "").replace("-", "")
    req_otp = req.otp.strip()
    
    stored = OTP_STORE.get(clean_phone)
    if req_otp != "1234" and (not stored or stored.get("otp") != req_otp):
        raise HTTPException(status_code=400, detail="Invalid OTP! Please enter 1234.")
    
    login_req = LoginRequest(phone=clean_phone, pin="1234", role=req.role or "vendor")
    return login(login_req, db)

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
            raise HTTPException(status_code=404, detail="दूधिया (Vendor) खाता नहीं मिला। कृपया सही मोबाइल नंबर डालें।")

        # Verify password/PIN
        if vendor.password_hash and req_pin != vendor.password_hash and req_pin != "1234":
            raise HTTPException(status_code=401, detail="गलत पासवर्ड (Wrong Password)! कृपया सही पासवर्ड दर्ज करें।")

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
                "avatar_url": vendor.avatar_url,
                "city": vendor.city or "Gurugram",
                "area": vendor.area or "Jamalpur / Sohna Road",
                "pincode": vendor.pincode or "122001",
                "service_areas": vendor.service_areas or "All nearby sectors and colonies",
                "price_cow": vendor.price_cow or 60.0,
                "price_buffalo": vendor.price_buffalo or 70.0,
                "morning_time": vendor.morning_time or "6:00 AM - 8:00 AM",
                "evening_time": vendor.evening_time or "5:30 PM - 7:30 PM"
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
            raise HTTPException(status_code=404, detail="ग्राहक खाता नहीं मिला। कृपया अपना पंजीकृत मोबाइल नंबर डालें।")

        if customer.pin and req_pin != customer.pin and req_pin != "1234":
            raise HTTPException(status_code=401, detail="गलत पासवर्ड / पिन! कृपया सही पिन दर्ज करें।")

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
                "avatar_url": customer.avatar_url,
                "customer_type": getattr(customer, "customer_type", "BUYER") or "BUYER"
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
                "avatar_url": vendor.avatar_url,
                "city": vendor.city or "Gurugram",
                "area": vendor.area or "Jamalpur / Sohna Road",
                "pincode": vendor.pincode or "122001",
                "service_areas": vendor.service_areas or "All nearby sectors and colonies",
                "price_cow": vendor.price_cow or 60.0,
                "price_buffalo": vendor.price_buffalo or 70.0,
                "morning_time": vendor.morning_time or "6:00 AM - 8:00 AM",
                "evening_time": vendor.evening_time or "5:30 PM - 7:30 PM"
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
                "avatar_url": customer.avatar_url,
                "customer_type": getattr(customer, "customer_type", "BUYER") or "BUYER"
            }
        }
    raise HTTPException(status_code=400, detail="Invalid role specified")


@router.post("/upload/avatar")
async def upload_avatar(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1].lower() if file.filename and "." in file.filename else "jpg"
    if ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
        raise HTTPException(status_code=400, detail="Only image files (JPG, PNG, WebP) are allowed")

    unique_name = f"avatar_{uuid.uuid4().hex[:12]}.{ext}"
    uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
    os.makedirs(uploads_dir, exist_ok=True)
    target_path = os.path.join(uploads_dir, unique_name)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/uploads/{unique_name}", "filename": unique_name}

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
    if req.city is not None:
        vendor.city = req.city.strip()
    if req.area is not None:
        vendor.area = req.area.strip()
    if req.pincode is not None:
        vendor.pincode = req.pincode.strip()
    if req.service_areas is not None:
        vendor.service_areas = req.service_areas.strip()
    if req.price_cow is not None:
        vendor.price_cow = req.price_cow
    if req.price_buffalo is not None:
        vendor.price_buffalo = req.price_buffalo
    if req.morning_time is not None:
        vendor.morning_time = req.morning_time.strip()
    if req.evening_time is not None:
        vendor.evening_time = req.evening_time.strip()

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
            "avatar_url": vendor.avatar_url,
            "city": vendor.city,
            "area": vendor.area,
            "pincode": vendor.pincode,
            "service_areas": vendor.service_areas,
            "price_cow": vendor.price_cow,
            "price_buffalo": vendor.price_buffalo,
            "morning_time": vendor.morning_time,
            "evening_time": vendor.evening_time
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
    if req.customer_type is not None:
        customer.customer_type = req.customer_type
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
            "avatar_url": customer.avatar_url,
            "customer_type": getattr(customer, "customer_type", "BUYER") or "BUYER"
        }
    }

@router.post("/auth/change-pin")
def change_pin(req: ChangePinRequest, db: Session = Depends(get_db)):
    clean_pin = req.new_pin.strip() if req.new_pin else ""
    if not clean_pin or len(clean_pin) < 4:
        raise HTTPException(status_code=400, detail="पिन कम से कम 4 अंकों का होना चाहिए (PIN must be at least 4 digits)")

    if req.role == "vendor":
        vendor = db.query(User).filter(User.id == req.id).first()
        if not vendor:
            raise HTTPException(status_code=404, detail="दूधिया खाता नहीं मिला (Vendor not found)")
        if req.current_pin and req.current_pin.strip():
            c_pin = req.current_pin.strip()
            if vendor.password_hash and c_pin != vendor.password_hash and c_pin != "1234":
                raise HTTPException(status_code=400, detail="वर्तमान पासवर्ड/पिन गलत है (Incorrect current PIN)")
        vendor.password_hash = clean_pin
        db.commit()
        return {"message": "पिन सफलतापूर्वक बदल गया!", "success": True}
    elif req.role == "customer":
        customer = db.query(Customer).filter(Customer.id == req.id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="ग्राहक खाता नहीं मिला (Customer not found)")
        if req.current_pin and req.current_pin.strip():
            c_pin = req.current_pin.strip()
            if customer.pin and c_pin != customer.pin and c_pin != "1234":
                raise HTTPException(status_code=400, detail="वर्तमान पासवर्ड/पिन गलत है (Incorrect current PIN)")
        customer.pin = clean_pin
        db.commit()
        return {"message": "पिन सफलतापूर्वक बदल गया!", "success": True}
    raise HTTPException(status_code=400, detail="Invalid role specified")

@router.post("/auth/forgot-pin")
def forgot_pin(req: ForgotPinRequest, db: Session = Depends(get_db)):
    clean_phone = req.phone.replace(" ", "").replace("+91", "").replace("-", "").strip()
    if not clean_phone:
        raise HTTPException(status_code=400, detail="कृपया पंजीकृत मोबाइल नंबर दर्ज करें")

    new_pin = generate_random_pin()

    if req.role == "vendor":
        vendor = db.query(User).filter(
            (User.phone == clean_phone) | (User.phone.contains(clean_phone))
        ).first()
        if not vendor:
            raise HTTPException(status_code=404, detail="इस नंबर से कोई दूधिया (Vendor) खाता नहीं मिला")
        
        vendor.password_hash = new_pin
        db.commit()

        msg = f"Milk Hisab - Password Reset: Namaste {vendor.name}, Your new PIN is: {new_pin}. Login at https://milkhisab.in"
        wa_url = get_whatsapp_share_url(vendor.phone, msg)
        send_welcome_sms(vendor.phone, new_pin, "Milk Hisab")

        return {
            "success": True,
            "message": "नया पिन सफलतापूर्वक जनरेट हो गया है!",
            "pin": new_pin,
            "phone": vendor.phone,
            "whatsapp_share_url": wa_url
        }
    else:
        customer = db.query(Customer).filter(
            Customer.is_active == True,
            (Customer.phone == clean_phone) | (Customer.phone.contains(clean_phone))
        ).first()
        if not customer:
            raise HTTPException(status_code=404, detail="इस नंबर से कोई ग्राहक (Customer) खाता नहीं मिला")
        
        customer.pin = new_pin
        db.commit()

        vendor = db.query(User).filter(User.id == customer.vendor_id).first()
        display_vendor = vendor.business_name if vendor else "Milk Hisab"

        msg = f"Milk Hisab - Password Reset: Namaste {customer.name}, Your new PIN is: {new_pin}. Login at https://milkhisab.in. Vendor: {display_vendor}"
        wa_url = get_whatsapp_share_url(customer.phone, msg)

        if getattr(customer, 'email', None):
            send_welcome_email(
                to_email=customer.email,
                name=customer.name,
                phone=customer.phone,
                pin=new_pin,
                vendor_name=vendor.name if vendor else "Milk Hisab",
                business_name=vendor.business_name if vendor else None
            )
        send_welcome_sms(customer.phone, new_pin, display_vendor)

        return {
            "success": True,
            "message": "नया पिन सफलतापूर्वक जनरेट हो गया है!",
            "pin": new_pin,
            "phone": customer.phone,
            "whatsapp_share_url": wa_url
        }

@router.get("/customer/accounts-by-phone")
def get_customer_accounts_by_phone(phone: str, db: Session = Depends(get_db)):
    clean_phone = phone.replace(" ", "").replace("+91", "").replace("-", "").strip()
    if not clean_phone:
        return []

    customers = db.query(Customer).filter(
        Customer.is_active == True,
        (Customer.phone == clean_phone) | (Customer.phone.contains(clean_phone))
    ).all()

    results = []
    for c in customers:
        v = db.query(User).filter(User.id == c.vendor_id).first()
        results.append({
            "customer_id": c.id,
            "customer_name": c.name,
            "customer_type": getattr(c, "customer_type", "BUYER") or "BUYER",
            "milk_type": c.milk_type,
            "default_quantity": c.default_quantity,
            "price_per_liter": c.price_per_liter,
            "address": c.address,
            "vendor_id": v.id if v else c.vendor_id,
            "vendor_name": v.name if v else "दूधिया",
            "business_name": v.business_name if v else "Dairy Supply",
            "vendor_phone": v.phone if v else "",
            "vendor_upi": v.upi_id if v else "",
            "vendor_city": v.city if v else "Gurugram",
            "vendor_area": v.area if v else "Jamalpur"
        })
    return results

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

    pin = req.pin.strip() if req.pin and req.pin.strip() else generate_random_pin()
    cust_type = req.customer_type or "BUYER"

    cust = Customer(
        vendor_id=vendor_id,
        name=req.name.strip(),
        phone=req.phone.strip(),
        email=req.email.strip() if req.email else None,
        address=req.address.strip() if req.address else "",
        default_quantity=req.default_quantity,
        milk_type=req.milk_type,
        price_per_liter=req.price_per_liter,
        customer_type=cust_type,
        pin=pin
    )
    db.add(cust)
    db.commit()
    db.refresh(cust)

    vendor = db.query(User).filter(User.id == vendor_id).first()
    v_name = vendor.name if vendor else "Milk Hisab"
    v_biz = vendor.business_name if vendor else None

    # WhatsApp intent
    wa_msg = format_welcome_whatsapp_message(cust.name, cust.phone, pin, v_name, v_biz)
    wa_url = get_whatsapp_share_url(cust.phone, wa_msg)

    # Email
    if cust.email:
        send_welcome_email(cust.email, cust.name, cust.phone, pin, v_name, v_biz)

    # SMS
    send_welcome_sms(cust.phone, pin, v_biz or v_name)

    return {
        "message": "Account registered successfully",
        "id": cust.id,
        "pin": pin,
        "customer_type": cust_type,
        "whatsapp_share_url": wa_url
    }

@router.get("/vendors-list")
def get_vendors_list(db: Session = Depends(get_db)):
    vendors = db.query(User).all()
    return [{"id": v.id, "name": v.name, "business_name": v.business_name, "phone": v.phone} for v in vendors]

@router.get("/customer/{customer_id}/dashboard")
def get_customer_dashboard(customer_id: int, month_year: Optional[str] = None, selected_date: Optional[str] = None, db: Session = Depends(get_db)):
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
    if selected_date:
        try:
            sel_d = datetime.date.fromisoformat(selected_date)
        except Exception:
            sel_d = today
    else:
        sel_d = today

    sel_log = db.query(DailyLog).filter(
        DailyLog.customer_id == customer_id,
        DailyLog.date == sel_d
    ).first()

    today_log = db.query(DailyLog).filter(
        DailyLog.customer_id == customer_id,
        DailyLog.date == today
    ).first()

    sel_reported_qty = None
    if sel_log and sel_log.notes and sel_log.notes.startswith("CUSTOMER_REPORTED:"):
        try:
            sel_reported_qty = float(sel_log.notes.split(":", 2)[1])
        except Exception:
            pass

    return {
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address,
            "default_quantity": customer.default_quantity,
            "milk_type": customer.milk_type,
            "price_per_liter": customer.price_per_liter,
            "avatar_url": customer.avatar_url,
            "customer_type": getattr(customer, "customer_type", "BUYER") or "BUYER"
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
        "selected_date_status": {
            "date": sel_d.isoformat(),
            "is_recorded": sel_log is not None,
            "quantity": sel_log.quantity_delivered if sel_log else customer.default_quantity,
            "status": sel_log.status if sel_log else "Pending Delivery",
            "dispute_status": getattr(sel_log, 'dispute_status', 'None') or 'None' if sel_log else "None",
            "dispute_reason": getattr(sel_log, 'dispute_reason', None) if sel_log else None,
            "reported_quantity": sel_reported_qty,
            "log_id": sel_log.id if sel_log else None,
            "notes": sel_log.notes if sel_log else None
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

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    vendor_id = customer.vendor_id if (customer and customer.vendor_id) else 1
    cust_name = customer.name if customer else "ग्राहक"

    log.dispute_status = "Pending"
    claimed_str = f" (दावा: {req.actual_quantity}L)" if req.actual_quantity is not None else ""
    log.dispute_reason = f"{req.reason.strip()}{claimed_str}"
    log.status = "Disputed"
    if req.actual_quantity is not None:
        log.notes = f"CUSTOMER_REPORTED:{req.actual_quantity}:{req.reason.strip()}"

    # Automated notification message to Vendor (Vice Versa Notification)
    try:
        claimed_info = f"{req.actual_quantity}L" if req.actual_quantity is not None else "अलग मात्रा"
        notify_msg = CustomerMessage(
            customer_id=customer_id,
            vendor_id=vendor_id,
            sender="CUSTOMER",
            message=f"⚠️ दूध मात्रा आपत्ति ({log.date.isoformat()}): {cust_name} ने दर्ज {log.quantity_delivered}L के बदले {claimed_info} बताया। कारण: {req.reason.strip()}"
        )
        db.add(notify_msg)
    except Exception as e:
        print("Could not create customer dispute message:", e)

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

    customer = db.query(Customer).filter(Customer.id == log.customer_id).first()
    vendor_id = customer.vendor_id if (customer and customer.vendor_id) else 1
    vendor = db.query(User).filter(User.id == vendor_id).first()
    vendor_name = vendor.name if vendor else "दूधिया"

    old_qty = log.quantity_delivered
    log.quantity_delivered = req.resolved_quantity
    log.dispute_status = "Resolved"
    log.status = "Resolved" if req.resolved_quantity > 0 else "Skipped"
    res_note = req.resolution_note.strip() if req.resolution_note else "मात्रा स्वीकृत"
    log.notes = f"सुलझाया गया: {req.resolved_quantity}L ({res_note})"

    # Automated notification message to Customer (Vice Versa Notification)
    if customer:
        try:
            res_msg = CustomerMessage(
                customer_id=customer.id,
                vendor_id=vendor_id,
                sender="VENDOR",
                message=f"✓ दूध हिसाब अपडेट ({log.date.isoformat()}): {vendor_name} ने हिसाब {old_qty}L से संशोधित करके {req.resolved_quantity}L कर दिया है। ({res_note})"
            )
            db.add(res_msg)
        except Exception as e:
            print("Could not create resolution notification:", e)

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
        reported_qty = None
        if l.notes and l.notes.startswith("CUSTOMER_REPORTED:"):
            try:
                reported_qty = float(l.notes.split(":", 2)[1])
            except Exception:
                pass
        results.append({
            "log_id": l.id,
            "customer_id": l.customer_id,
            "customer_name": cust.name if cust else "Unknown Customer",
            "customer_phone": cust.phone if cust else "",
            "date": l.date.isoformat(),
            "quantity": l.quantity_delivered,
            "status": l.status,
            "dispute_reason": l.dispute_reason,
            "reported_quantity": reported_qty,
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

# --- Module 10: Location-Based Milkman Discovery & Milk Requests ---

@router.get("/vendors/search")
def search_vendors(
    q: Optional[str] = None,
    city: Optional[str] = None,
    pincode: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if q and isinstance(q, str) and q.strip():
        term = f"%{q.strip().lower()}%"
        query = query.filter(
            func.lower(User.name).like(term) |
            func.lower(User.business_name).like(term) |
            func.lower(User.area).like(term) |
            func.lower(User.city).like(term) |
            func.lower(User.pincode).like(term) |
            func.lower(User.service_areas).like(term)
        )
    if city and city.strip():
        query = query.filter(func.lower(User.city) == city.strip().lower())
    if pincode and pincode.strip():
        query = query.filter(User.pincode == pincode.strip())

    vendors = query.all()
    results = []
    for v in vendors:
        active_cust_count = db.query(Customer).filter(
            Customer.vendor_id == v.id,
            Customer.is_active == True,
            Customer.customer_type == "BUYER"
        ).count()
        results.append({
            "id": v.id,
            "name": v.name,
            "phone": v.phone,
            "business_name": v.business_name,
            "upi_id": v.upi_id,
            "avatar_url": v.avatar_url,
            "city": v.city or "Gurugram",
            "area": v.area or "Jamalpur / Sohna Road",
            "pincode": v.pincode or "122001",
            "service_areas": v.service_areas or "All nearby sectors and colonies",
            "price_cow": v.price_cow or 60.0,
            "price_buffalo": v.price_buffalo or 70.0,
            "morning_time": v.morning_time or "6:00 AM - 8:00 AM",
            "evening_time": v.evening_time or "5:30 PM - 7:30 PM",
            "active_customers_count": active_cust_count
        })
    return results

@router.post("/vendors/{vendor_id}/request", response_model=MilkRequestResponse)
def create_milk_request(vendor_id: int, req: MilkRequestCreate, db: Session = Depends(get_db)):
    vendor = db.query(User).filter(User.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="दूधिया (Milkman) नहीं मिला।")

    db_req = MilkRequest(
        vendor_id=vendor_id,
        customer_name=req.customer_name.strip(),
        customer_phone=req.customer_phone.strip(),
        address=req.address.strip(),
        locality=req.locality.strip() if req.locality else None,
        city=req.city.strip() if req.city else "Gurugram",
        pincode=req.pincode.strip() if req.pincode else "122001",
        milk_type=req.milk_type,
        quantity=req.quantity,
        delivery_time=req.delivery_time,
        start_date=req.start_date,
        notes=req.notes.strip() if req.notes else None,
        status="Pending"
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

@router.get("/vendors/{vendor_id}/requests")
def get_vendor_requests(vendor_id: int, status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MilkRequest).filter(MilkRequest.vendor_id == vendor_id)
    if status_filter:
        query = query.filter(MilkRequest.status == status_filter)
    return query.order_by(MilkRequest.created_at.desc()).all()

@router.post("/requests/{request_id}/accept")
def accept_milk_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(MilkRequest).filter(MilkRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="अनुरोध नहीं मिला।")

    req.status = "Accepted"
    
    # Check if customer already exists under this vendor
    clean_phone = req.customer_phone.replace(" ", "").replace("+91", "").replace("-", "")
    existing = db.query(Customer).filter(
        Customer.vendor_id == req.vendor_id,
        (Customer.phone == clean_phone) | (Customer.phone == req.customer_phone)
    ).first()

    vendor = db.query(User).filter(User.id == req.vendor_id).first()
    price = vendor.price_cow if req.milk_type == "Cow" else vendor.price_buffalo if req.milk_type == "Buffalo" else 65.0

    full_addr = req.address
    if req.locality:
        full_addr += f", {req.locality}"

    if existing:
        existing.is_active = True
        existing.default_quantity = req.quantity
        existing.milk_type = req.milk_type
        existing.price_per_liter = price
        existing.address = full_addr
        new_customer = existing
    else:
        new_customer = Customer(
            vendor_id=req.vendor_id,
            name=req.customer_name,
            phone=clean_phone or req.customer_phone,
            pin="1234",
            address=full_addr,
            default_quantity=req.quantity,
            milk_type=req.milk_type,
            price_per_liter=price,
            customer_type="BUYER",
            is_active=True
        )
        db.add(new_customer)
        db.commit()
        db.refresh(new_customer)

    # Add welcome message in conversation
    welcome_msg = CustomerMessage(
        customer_id=new_customer.id,
        sender_name=vendor.name if vendor else "दूधिया",
        sender_role="vendor",
        message=f"नमस्ते {req.customer_name} जी! आपका दूध अनुरोध स्वीकार कर लिया गया है। कल से {req.quantity}L ({req.milk_type}) की सप्लाई शुरू होगी।"
    )
    db.add(welcome_msg)
    db.commit()

    return {
        "message": "अनुरोध स्वीकार कर लिया गया और नया ग्राहक आपकी सूची में जुड़ गया!",
        "customer_id": new_customer.id
    }

@router.post("/requests/{request_id}/reject")
def reject_milk_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(MilkRequest).filter(MilkRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="अनुरोध नहीं मिला।")
    req.status = "Rejected"
    db.commit()
    return {"message": "अनुरोध अस्वीकार कर दिया गया"}

@router.post("/contact")
def submit_contact_inquiry(inquiry: ContactInquiryCreate, db: Session = Depends(get_db)):
    db_inquiry = ContactInquiry(
        name=inquiry.name.strip(),
        phone=inquiry.phone.strip(),
        email=inquiry.email.strip(),
        location=inquiry.location.strip(),
        comments=inquiry.comments.strip()
    )
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)
    return {
        "status": "success",
        "message": "आपकी पूछताछ सफलतापूर्वक दर्ज कर ली गई है। हमारी टीम शीघ्र संपर्क करेगी।",
        "id": db_inquiry.id
    }
