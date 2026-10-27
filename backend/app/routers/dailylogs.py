import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date as dt_date
from typing import List, Optional
from pydantic import BaseModel
from ..database import get_db
from ..models import Customer, DailyLog
from ..schemas import DailyLogResponse, DailyBatchSubmit

router = APIRouter(prefix="/api/logs", tags=["Daily Logs"])

class VoiceParseRequest(BaseModel):
    text: str

class VoiceParseResponse(BaseModel):
    matched_customer_id: Optional[int] = None
    matched_customer_name: Optional[str] = None
    extracted_quantity: Optional[float] = None
    action: str  # "set", "add", "skip"
    raw_text: str

@router.get("/day-view")
def get_day_checklist(date_str: Optional[str] = None, date: Optional[str] = None, db: Session = Depends(get_db)):
    """Returns all active customers with their recorded or default delivery status for a specific date."""
    param_date = date or date_str
    if param_date and isinstance(param_date, str):
        target_date = dt_date.fromisoformat(param_date)
    else:
        target_date = dt_date.today()
    customers = db.query(Customer).filter(Customer.is_active == True).all()
    
    # Query logs for this specific date
    logs = db.query(DailyLog).filter(DailyLog.date == target_date).all()
    log_map = {log.customer_id: log for log in logs}

    result = []
    for c in customers:
        ctype = getattr(c, "customer_type", "BUYER") or "BUYER"
        if c.id in log_map:
            log = log_map[c.id]
            result.append({
                "customer_id": c.id,
                "name": c.name,
                "phone": c.phone,
                "address": c.address,
                "default_quantity": c.default_quantity,
                "milk_type": c.milk_type,
                "price_per_liter": c.price_per_liter,
                "customer_type": ctype,
                "log_id": log.id,
                "date": log.date.isoformat(),
                "quantity": log.quantity_delivered,
                "status": log.status,
                "is_recorded": True
            })
        else:
            result.append({
                "customer_id": c.id,
                "name": c.name,
                "phone": c.phone,
                "address": c.address,
                "default_quantity": c.default_quantity,
                "milk_type": c.milk_type,
                "price_per_liter": c.price_per_liter,
                "customer_type": ctype,
                "log_id": None,
                "date": target_date.isoformat(),
                "quantity": c.default_quantity,
                "status": "Pending",  # Not explicitly confirmed yet
                "is_recorded": False
            })
    return {"date": target_date.isoformat(), "checklist": result}

@router.post("/batch")
def submit_batch_logs(batch: DailyBatchSubmit, db: Session = Depends(get_db)):
    """Submit or update status/quantity for multiple customers for a day in one request."""
    updated = []
    for entry in batch.entries:
        existing = db.query(DailyLog).filter(
            DailyLog.customer_id == entry.customer_id,
            DailyLog.date == batch.date
        ).first()

        if existing:
            existing.quantity_delivered = entry.quantity_delivered
            existing.status = entry.status
            existing.notes = entry.notes
            updated.append(existing)
        else:
            new_log = DailyLog(
                customer_id=entry.customer_id,
                date=batch.date,
                quantity_delivered=entry.quantity_delivered,
                status=entry.status,
                notes=entry.notes
            )
            db.add(new_log)
            updated.append(new_log)

    db.commit()
    return {"message": f"Successfully updated {len(updated)} entries for {batch.date}"}

@router.post("/parse-voice", response_model=VoiceParseResponse)
def parse_voice_command(req: VoiceParseRequest, db: Session = Depends(get_db)):
    """
    Parses natural Hindi/Hinglish voice notes like:
    - 'Rakesh ko 2 liter doodh add kar do'
    - 'Sharma ji ko chhutti / skip kar do'
    - 'Dr Sahib 1.5L'
    """
    text_lower = req.text.lower()
    customers = db.query(Customer).filter(Customer.is_active == True).all()

    matched_customer = None
    for c in customers:
        if c.name.lower() in text_lower or (c.name.split()[0].lower() in text_lower):
            matched_customer = c
            break

    # Check for skip / off keywords
    action = "set"
    quantity = None
    if any(k in text_lower for k in ["chhutti", "chhutti", "off", "band", "skip", "nahin", "nahi"]):
        action = "skip"
        quantity = 0.0
    else:
        # Extract quantity (e.g. 2 liter, 2.5 ltr, 1.5)
        match = re.search(r'(\d+(?:\.\d+)?)\s*(?:liter|l|ltr|kg|ser)?', text_lower)
        if match:
            quantity = float(match.group(1))
            if "add" in text_lower or "extra" in text_lower or "jyada" in text_lower:
                action = "add"
            else:
                action = "set"
        elif matched_customer:
            quantity = matched_customer.default_quantity

    return VoiceParseResponse(
        matched_customer_id=matched_customer.id if matched_customer else None,
        matched_customer_name=matched_customer.name if matched_customer else None,
        extracted_quantity=quantity,
        action=action,
        raw_text=req.text
    )
