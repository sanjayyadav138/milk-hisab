# 🥛 Milk Hisab (मिल्क हिसाब) — Complete Project Context & Architecture

> **Comprehensive reference document capturing product vision, system architecture, database schema, routing logic, deployment pipelines, and operational context.**  
> *Last Updated: October 27, 2026*

---

## 1. 📌 Product Vision & Domain Model

**Milk Hisab (मिल्क हिसाब)** is a specialized SaaS dairy ledger and marketplace platform built for milkmen (दूधिया), dairy suppliers (दूध संकलन / सप्लायर), and household consumers across India.

### Core Domain Capabilities:
1. **Dual-Role Actors (Vendor as Customer / Supplier)**:
   - A single milkman can collect milk from local dairy farmers/suppliers and simultaneously deliver/sell milk to household customers.
   - Customer accounts support multiple categories:
     - `REGULAR` (Household consumer receiving daily milk).
     - `SUPPLIER` (Village cattle owner or collection home supplying milk to the vendor).
2. **Multi-Vendor Household Subscriptions**:
   - Household customers can be registered with multiple independent milkmen (e.g., cow milk from vendor A, buffalo milk from vendor B).
   - The Customer Portal features a vendor switcher allowing customers to review daily deliveries, bills, and history per vendor.
3. **Location-Based Discovery (Find Milkman)**:
   - Customers and visitors can search for local milkmen by village, sector, or PIN code.
   - Filter by milk type (Cow, Buffalo, Both), max rate slider (₹40 - ₹120/L), and delivery timings.
   - 1-click delivery request: If logged in as customer, requests are sent instantly to the vendor's inbox without re-asking contact details.

---

## 2. 🏗️ Tech Stack & Key Files

| Layer | Technologies Used | Key Directories & Files |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons | `frontend/src/App.tsx`<br>`frontend/src/components/`<br>`frontend/src/services/api.ts`<br>`frontend/src/context/LanguageContext.tsx` |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy ORM, SQLite, Pydantic v2 | `backend/app/main.py`<br>`backend/app/models.py`<br>`backend/app/schemas.py`<br>`backend/app/routers/`<br>`backend/app/services/` |
| **Server / Host** | AWS EC2 (Ubuntu 24.04), Nginx Reverse Proxy, Gunicorn + Uvicorn | `/var/www/milkhisab`<br>`/etc/systemd/system/milkhisab.service`<br>`/etc/nginx/sites-available/milkhisab` |
| **Deployment** | Git, Bash, Zero-Downtime Auto-Deploy | `deploy/update.sh`<br>`deploy/setup_ec2.sh` |

---

## 3. 🌐 Routing Architecture & Hash-Based Synchronization

The single-page application (SPA) employs unified hash routing (`window.location.hash`) synchronized via `handleRouteGuard` in `frontend/src/App.tsx`.

### Route Map:
- `#/` : Public Landing Page (Unauthenticated) or auto-redirect to active dashboard.
- `#/vendor/dashboard` : Milkman Control Panel (Daily Checklist, Customer Directory, Billing & Ledger, Inbox).
- `#/customer/dashboard` : Household Customer Portal (Today's status, calendar breakdown, billing summary, UPI pay).
- `#/find-milkman` : 2-column dedicated marketplace page with query support (e.g., `#/find-milkman?q=Jamalpur`).
- `#/profile` : Dedicated Profile Settings page (device photo upload, rates, timings, coverage areas).
- `#/about` : Public About Us page (Established 2026, corporate details, no personal names).
- `#/contact` : Public Contact Us page with contact form + Head Office address.
- `#/terms` : Terms & Conditions.
- `#/privacy` : Privacy Policy.

### Route Guard & View State Sync:
- When any route change occurs (Navbar click, Logo click, Browser Back/Forward), `handleRouteGuard()` resets `isFindMilkmanPage` and `isProfilePage` to `false` and mounts the target view.
- Unauthenticated users attempting to access `#/vendor/*`, `#/customer/*`, or `#/profile` are redirected to `#/` and prompted with the authentication dialog.

---

## 4. 🗄️ Database Schema & Storage

The database is powered by SQLite (`backend/doodh_ledger.db`):

### Key Tables:
1. **`users` (Vendors / Milkmen)**:
   - `id`, `name`, `phone` (unique), `pin_hash`, `business_name`, `avatar_url`, `delivery_lanes`, `upi_id`, `rate_cow`, `rate_buffalo`, `delivery_time_morning`, `delivery_time_evening`.
2. **`customers` (Household Consumers & Suppliers)**:
   - `id`, `vendor_id` (Foreign Key to `users.id`), `name`, `phone`, `email`, `pin_hash`, `customer_type` (`REGULAR` | `SUPPLIER`), `milk_type`, `default_quantity`, `rate_per_liter`, `delivery_lane`, `avatar_url`.
3. **`ledger_entries` (Daily Milk Deliveries)**:
   - `id`, `customer_id`, `vendor_id`, `date`, `shift` (`MORNING` | `EVENING`), `milk_type`, `quantity`, `rate_per_liter`, `amount`, `status` (`DELIVERED` | `SKIPPED` | `EXTRA`).
4. **`milk_requests` (Discovery Inquiries)**:
   - `id`, `vendor_id`, `customer_name`, `customer_phone`, `address`, `locality`, `milk_type`, `quantity`, `delivery_time`, `status` (`PENDING` | `ACCEPTED` | `REJECTED`).
5. **Static File Uploads (`/uploads`)**:
   - User profile images uploaded via `POST /api/portal/upload/avatar` are written to `backend/uploads/` with UUID-generated filenames and served publicly via FastAPI `StaticFiles(directory=uploads_dir)`.

---

## 5. 🔐 Authentication, PIN Management & Notifications

1. **Unified PIN Management**:
   - All PIN updates ("Change PIN") are unified exclusively inside the top Navbar user dropdown.
   - Duplicate buttons inside dashboard cards have been eliminated.
2. **Auto-Generated PIN on Customer Registration**:
   - When a vendor adds a customer, a secure random 4-digit PIN is generated.
   - The UI immediately presents a modal with a 1-click **"Send via WhatsApp"** button.
3. **Forgot PIN Recovery**:
   - `POST /api/portal/auth/forgot-pin` supports both vendors and customers.
   - Dispatches a direct WhatsApp intent link and triggers SMS notification.
4. **Email & Contact Specifications**:
   - Official System Mailer: `info@milkhisab.in`.
   - Head Office: **Near Post Office, Jamalpur, Gurgaon, Haryana 122503**.
   - Established Year: **2026**.

---

## 6. 🎨 Visual Design & UI System

1. **Color Palette (Trust & Purity)**:
   - Primary: Dairy Blue (`#2563EB`)
   - Surface: Milky Off-White (`#F9FAFB` / `#F8FAFC`)
   - Accent / Success: Fresh Ledger Green (`#10B981`)
   - Warning / Due Cash: Cash Amber (`#F59E0B`)
2. **Navbar & User Dropdown**:
   - Pill trigger with circular avatar, live online status dot, clean truncated name, and chevron.
   - Elevated dropdown card with rounded-2xl styling and clear icon dividers.
3. **Save Daily Ledger Button**:
   - Centered floating action pill displaying active customer count and tactile hover effect.
   - Secondary inline save button in the header bar beside the date picker.
4. **Bilingual Engine**:
   - Clean Hindi (हिन्दी) & English selector in top Navbar.
   - Fully synchronized translation dictionary across all forms, ledger, navigation, and billing terms.

---

## 7. 🚀 Production Infrastructure & EC2 Operations

### Server Details:
- **Host IP**: `16.176.65.41`
- **User**: `ubuntu`
- **SSH Key**: `D:\Sanjay\workspace\milkhisab-key.pem`
- **Server Path**: `/var/www/milkhisab`
- **GitHub Repository**: `https://github.com/sanjayyadav138/milk-hisab.git` (Branch: `main`)

### Connecting via SSH:
```bash
ssh -i "milkhisab-key.pem" ubuntu@16.176.65.41
```

### Zero-Downtime Update Command:
```bash
bash /var/www/milkhisab/deploy/update.sh
```

### What `update.sh` Does:
1. `git pull origin main` in `/var/www/milkhisab`.
2. Updates Python virtualenv dependencies: `./venv/bin/pip install -r requirements.txt`.
3. Runs database schema migrations automatically on FastAPI startup.
4. Compiles production frontend assets via `npm run build` in `/var/www/milkhisab/frontend`.
5. Restarts backend daemon (`sudo systemctl restart milkhisab`).
6. Reloads Nginx reverse proxy (`sudo systemctl reload nginx`).

---

## 8. 📋 Local Development Quickstart

### 1. Backend (FastAPI):
```powershell
cd D:\Sanjay\workspace\doodh-ledger\backend
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger Docs: `http://localhost:8000/docs`

### 2. Frontend (React + Vite):
```powershell
cd D:\Sanjay\workspace\doodh-ledger\frontend
npm.cmd run dev
```
- Web Application: `http://localhost:5173`

### 3. Production Frontend Build:
```powershell
cd D:\Sanjay\workspace\doodh-ledger\frontend
npm.cmd run build
```
