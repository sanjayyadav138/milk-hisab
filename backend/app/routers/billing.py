import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime, date
from ..database import get_db
from ..models import Customer, DailyLog, Payment, User
from ..schemas import CustomerMonthlyBill, PaymentCreate, PaymentResponse

router = APIRouter(prefix="/api/billing", tags=["Billing & Ledger"])

@router.get("/summary", response_model=List[CustomerMonthlyBill])
def get_monthly_bills(
    month_year: Optional[str] = Query(None, description="Format YYYY-MM, e.g. 2026-10"),
    db: Session = Depends(get_db)
):
    if not month_year:
        month_year = datetime.today().strftime("%Y-%m")
        
    year, month = map(int, month_year.split("-"))
    customers = db.query(Customer).filter(Customer.is_active == True).all()
    vendor = db.query(User).first()
    vendor_upi = vendor.upi_id if vendor and vendor.upi_id else "9971880670@upi"
    business_name = vendor.business_name if vendor else "Milk Hisab Dairy"

    summaries = []
    for c in customers:
        # Fetch logs for the customer in the target month
        logs = db.query(DailyLog).filter(
            DailyLog.customer_id == c.id,
            extract('year', DailyLog.date) == year,
            extract('month', DailyLog.date) == month
        ).all()

        total_liters = sum(l.quantity_delivered for l in logs)
        delivered_days = sum(1 for l in logs if l.quantity_delivered > 0)
        skipped_days = sum(1 for l in logs if l.status == "Skipped" or l.quantity_delivered == 0)

        total_amount = round(total_liters * c.price_per_liter, 2)

        # Fetch payments made
        payments = db.query(Payment).filter(
            Payment.customer_id == c.id,
            Payment.month_year == month_year
        ).all()
        amount_paid = sum(p.amount_paid for p in payments)
        balance_due = round(total_amount - amount_paid, 2)

        # UPI Intent Link
        upi_pay_link = f"upi://pay?pa={vendor_upi}&pn={urllib.parse.quote(business_name)}&am={balance_due}&cu=INR"

        # WhatsApp Message
        wa_msg = (
            f"🥛 *{business_name} - मासिक दूध बिल ({month_year})*\n\n"
            f"आदरणीय {c.name} जी,\n"
            f"आपके दूध का मासिक विवरण इस प्रकार है:\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"• कुल दूध: *{total_liters:.1f} लीटर*\n"
            f"• दूध प्रकार: *{c.milk_type}*\n"
            f"• दर (Rate): *₹{c.price_per_liter:.0f} /लीटर*\n"
            f"• कुल दिन सप्लाई: {delivered_days} दिन\n"
            f"• छुट्टी / बंद दिन: {skipped_days} दिन\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"• कुल रकम: *₹{total_amount:.0f}*\n"
            f"• जमा राशि: ₹{amount_paid:.0f}\n"
            f"• *कुल बकाया: ₹{balance_due:.0f}*\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"📲 Google Pay / PhonePe / Paytm से भुगतान करें:\n"
            f"UPI ID: `{vendor_upi}`\n\n"
            f"धन्यवाद! 🙏"
        )

        phone_num = c.phone.replace("+", "").replace(" ", "").replace("-", "") if c.phone else ""
        if phone_num and len(phone_num) == 10:
            phone_num = "91" + phone_num

        wa_url = f"https://wa.me/{phone_num}?text={urllib.parse.quote(wa_msg)}" if phone_num else None

        summaries.append(CustomerMonthlyBill(
            customer_id=c.id,
            customer_name=c.name,
            phone=c.phone,
            month_year=month_year,
            total_liters=total_liters,
            price_per_liter=c.price_per_liter,
            total_amount=total_amount,
            delivered_days=delivered_days,
            skipped_days=skipped_days,
            amount_paid=amount_paid,
            balance_due=balance_due,
            upi_link=upi_pay_link,
            whatsapp_message=wa_msg,
            whatsapp_url=wa_url
        ))

    return summaries

@router.post("/payment", response_model=PaymentResponse)
def record_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    db_payment = Payment(**payment.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment
