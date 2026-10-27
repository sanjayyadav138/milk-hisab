import os
import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import User, Customer, DailyLog
from .routers import customers, dailylogs, billing, portal

# Create database tables
Base.metadata.create_all(bind=engine)

def run_migrations():
    """Ensure newly added columns exist in SQLite database without losing data."""
    try:
        raw_conn = engine.raw_connection()
        cursor = raw_conn.cursor()
        
        # 1. users table columns
        user_cols = {row[1] for row in cursor.execute("PRAGMA table_info(users)").fetchall()}
        columns_to_add_users = [
            ("city", "VARCHAR(100) DEFAULT 'Gurugram'"),
            ("area", "VARCHAR(150) DEFAULT 'Jamalpur / Sohna Road'"),
            ("pincode", "VARCHAR(20) DEFAULT '122001'"),
            ("service_areas", "VARCHAR(255) DEFAULT 'Gali 1-5, Main Market, Mandir Road, Sector 47-49'"),
            ("price_cow", "FLOAT DEFAULT 60.0"),
            ("price_buffalo", "FLOAT DEFAULT 70.0"),
            ("morning_time", "VARCHAR(50) DEFAULT '6:00 AM - 8:00 AM'"),
            ("evening_time", "VARCHAR(50) DEFAULT '5:30 PM - 7:30 PM'"),
        ]
        for col_name, col_def in columns_to_add_users:
            if col_name not in user_cols:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}")
                
        # 2. customers table columns
        cust_cols = {row[1] for row in cursor.execute("PRAGMA table_info(customers)").fetchall()}
        if "customer_type" not in cust_cols:
            cursor.execute("ALTER TABLE customers ADD COLUMN customer_type VARCHAR(20) DEFAULT 'BUYER'")
        if "email" not in cust_cols:
            cursor.execute("ALTER TABLE customers ADD COLUMN email VARCHAR(100)")
            
        raw_conn.commit()
        cursor.close()
        raw_conn.close()
    except Exception as e:
        print(f"Migration warning: {e}")

run_migrations()

def seed_db():
    """Seed default vendor, sample customers, and suppliers (collection homes)."""
    db = SessionLocal()
    try:
        vendor = db.query(User).first()
        if not vendor:
            vendor = User(
                name="Sanjay Yadav",
                phone="1234",  # Dummy login username (also supports 9971880670)
                business_name="Milk Hisab Dairy & Supply",
                upi_id="9971880670@upi",
                password_hash="1234",  # Dummy login password
                city="Gurugram",
                area="Jamalpur / Sohna Road",
                pincode="122001",
                service_areas="Jamalpur, Gali 1-5, Mandir Chowk, Sector 47-49",
                price_cow=60.0,
                price_buffalo=70.0,
                morning_time="6:00 AM - 8:00 AM",
                evening_time="5:30 PM - 7:30 PM"
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
                    price_per_liter=60.0,
                    customer_type="BUYER"
                ),
                Customer(
                    vendor_id=vendor.id,
                    name="Dr. Sahib",
                    phone="9822233344",
                    pin="1234",
                    address="Clinic Road, Near Shiv Mandir",
                    default_quantity=2.0,
                    milk_type="Buffalo",
                    price_per_liter=70.0,
                    customer_type="BUYER"
                ),
                Customer(
                    vendor_id=vendor.id,
                    name="Rakesh Master",
                    phone="9833344455",
                    pin="1234",
                    address="Main Bazaar, Opp. Post Office",
                    default_quantity=1.0,
                    milk_type="Cow",
                    price_per_liter=60.0,
                    customer_type="BUYER"
                ),
                Customer(
                    vendor_id=vendor.id,
                    name="Gupta General Store",
                    phone="9844455566",
                    pin="1234",
                    address="Chowk Bazar",
                    default_quantity=3.0,
                    milk_type="Mixed",
                    price_per_liter=65.0,
                    customer_type="BUYER"
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
            # Update vendor location fields if empty
            if not vendor.city or not vendor.area:
                vendor.city = "Gurugram"
                vendor.area = "Jamalpur / Sohna Road"
                vendor.pincode = "122001"
                vendor.service_areas = "Jamalpur, Gali 1-5, Mandir Chowk, Sector 47-49"
                vendor.price_cow = 60.0
                vendor.price_buffalo = 70.0
                vendor.morning_time = "6:00 AM - 8:00 AM"
                vendor.evening_time = "5:30 PM - 7:30 PM"
                db.commit()

        # Check if 4 sample suppliers / collection homes exist for Sanjay
        supplier_count = db.query(Customer).filter(Customer.customer_type == "SUPPLIER").count()
        if supplier_count == 0:
            sample_suppliers = [
                Customer(
                    vendor_id=vendor.id,
                    name="Ramu Kaka (घर 1 - संकलन)",
                    phone="9811100001",
                    pin="1234",
                    address="ढाणी, रामपुरा रोड (House #1)",
                    default_quantity=5.0,
                    milk_type="Cow",
                    price_per_liter=50.0,
                    customer_type="SUPPLIER"
                ),
                Customer(
                    vendor_id=vendor.id,
                    name="Desi Dairy Farm (घर 2 - संकलन)",
                    phone="9811100002",
                    pin="1234",
                    address="नियर नहर पुलिया (House #2)",
                    default_quantity=8.0,
                    milk_type="Buffalo",
                    price_per_liter=58.0,
                    customer_type="SUPPLIER"
                ),
                Customer(
                    vendor_id=vendor.id,
                    name="Kishan Singh (घर 3 - संकलन)",
                    phone="9811100003",
                    pin="1234",
                    address="पुरानी चौपाल के पास (House #3)",
                    default_quantity=3.5,
                    milk_type="Cow",
                    price_per_liter=50.0,
                    customer_type="SUPPLIER"
                ),
                Customer(
                    vendor_id=vendor.id,
                    name="Pandit Ji Dairy (घर 4 - संकलन)",
                    phone="9811100004",
                    pin="1234",
                    address="शिव मंदिर वाली गली (House #4)",
                    default_quantity=4.0,
                    milk_type="Buffalo",
                    price_per_liter=58.0,
                    customer_type="SUPPLIER"
                ),
            ]
            db.add_all(sample_suppliers)
            db.commit()

            # Seed past collection logs for these 4 homes
            today = datetime.date.today()
            for s in sample_suppliers:
                for i in range(1, 4):
                    past_date = today - datetime.timedelta(days=i)
                    db.add(DailyLog(
                        customer_id=s.id,
                        date=past_date,
                        quantity_delivered=s.default_quantity,
                        status="Delivered"
                    ))
            db.commit()

        # Ensure demo user 1234 credentials
        if "(Jamalpur)" in vendor.name or vendor.phone != "1234":
            vendor.name = "Sanjay Yadav"
            vendor.phone = "1234"
            vendor.password_hash = "1234"
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
