import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import User, Customer, DailyLog
from .routers import customers, dailylogs, billing, portal

# Create database tables
Base.metadata.create_all(bind=engine)

def seed_db():
    """Seed default vendor and sample customers if database is newly initialized."""
    db = SessionLocal()
    try:
        vendor = db.query(User).first()
        if not vendor:
            vendor = User(
                name="Sanjay Yadav",
                phone="1234",  # Dummy login username (also supports 9971880670)
                business_name="Milk Hisab Dairy & Supply",
                upi_id="9971880670@upi",
                password_hash="1234"  # Dummy login password
            )
            db.add(vendor)
            db.commit()
            db.refresh(vendor)

            # Sample customers from the prompt
            sample_customers = [
                Customer(
                    vendor_id=vendor.id,
                    name="Sharma Ji",
                    phone="1234",  # Dummy customer username
                    pin="1234",    # Dummy customer password
                    address="H.No 12, Gali No. 3",
                    default_quantity=1.5,
                    milk_type="Cow",
                    price_per_liter=60.0
                ),
                Customer(
                    vendor_id=vendor.id,
                    name="Dr. Sahib",
                    phone="9822233344",
                    pin="1234",
                    address="Clinic Road, Near Shiv Mandir",
                    default_quantity=2.0,
                    milk_type="Buffalo",
                    price_per_liter=70.0
                ),
                Customer(
                    vendor_id=vendor.id,
                    name="Rakesh Master",
                    phone="9833344455",
                    pin="1234",
                    address="Main Bazaar, Opp. Post Office",
                    default_quantity=1.0,
                    milk_type="Cow",
                    price_per_liter=60.0
                ),
                Customer(
                    vendor_id=vendor.id,
                    name="Gupta General Store",
                    phone="9844455566",
                    pin="1234",
                    address="Chowk Bazar",
                    default_quantity=3.0,
                    milk_type="Mixed",
                    price_per_liter=65.0
                ),
            ]
            db.add_all(sample_customers)
            db.commit()

            # Seed past days of delivery
            c_sharma = sample_customers[0]
            c_doctor = sample_customers[1]
            c_rakesh = sample_customers[2]

            today = datetime.date.today()
            for i in range(1, 4):
                past_date = today - datetime.timedelta(days=i)
                db.add(DailyLog(customer_id=c_sharma.id, date=past_date, quantity_delivered=1.5, status="Delivered"))
                db.add(DailyLog(customer_id=c_doctor.id, date=past_date, quantity_delivered=2.0, status="Delivered"))
                if i == 2:
                    db.add(DailyLog(customer_id=c_rakesh.id, date=past_date, quantity_delivered=0.0, status="Skipped"))
                else:
                    db.add(DailyLog(customer_id=c_rakesh.id, date=past_date, quantity_delivered=1.0, status="Delivered"))
            db.commit()
        else:
            # Ensure existing database has 1234 credentials updated and common names
            if "(Jamalpur)" in vendor.name or vendor.phone != "1234":
                vendor.name = "Ramesh Yadav"
                vendor.phone = "1234"
                vendor.password_hash = "1234"
                db.commit()
            cust1 = db.query(Customer).first()
            if cust1:
                if cust1.phone != "1234" or "Jamalpur" in (cust1.address or ""):
                    cust1.phone = "1234"
                    cust1.pin = "1234"
                    cust1.address = "H.No 12, Gali No. 3"
                    db.commit()
    finally:
        db.close()

# Run seed immediately
seed_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_db()
    yield

app = FastAPI(
    title="Milk Hisab API",
    description="B2B SaaS Backend for Milkmen / Dudhiyas",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Include Routers
app.include_router(customers.router)
app.include_router(dailylogs.router)
app.include_router(billing.router)
app.include_router(portal.router)

# Production SPA / Frontend Static Serving
frontend_dist = os.getenv(
    "FRONTEND_DIST_DIR",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
)

if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str = ""):
        # Avoid intercepting API or docs routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        target_file = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": "Milk Hisab API",
            "status": "online",
            "docs_url": "/docs"
        }
