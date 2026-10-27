# 🥛 Milk Hisab (मिल्क हिसाब)
> **Modern TypeScript (React + Vite) & Python (FastAPI) Platform for Milkmen & Household Families Across India**

---

## 🌟 Features & Highlights

1. **Digital Ledger & Daily Delivery Checklist**:
   - 1-tap daily delivery logging with automatic quantity prefill.
   - Voice entry recognition for quick entries while on the go.
   - Monthly billing with WhatsApp sharing & automated UPI payment links.

2. **Session Management & Persistence**:
   - Long-lived persistent authentication on app relaunch.
   - Inactivity detection and token expiration handling.
   - Instant 1-click demo login & secure logout flow.

3. **Header Profile & Settings**:
   - Dynamic user profile pill with initials/avatar preview.
   - Profile management modal for editing business name, UPI ID, delivery lane, milk preferences, and PIN.

4. **Role-Based Protected Routing**:
   - **Vendor Control Panel (`#/vendor/dashboard`)**: Daily delivery checklist, customer directory, payment records.
   - **Customer Portal (`#/customer/dashboard`)**: Today's delivery status, monthly milk breakdown, family sub-users, direct dairy messaging, and UPI payment.
   - Automatic guard protecting vendor and customer routes against unauthorized access.

5. **Outdoor High-Contrast UI & Bilingual Support**:
   - Built on a **Trust & Purity Palette** (Dairy Blue `#2563EB`, Milky White `#F9FAFB`, Fresh Ledger Green `#10B981`, Cash Amber `#F59E0B`).
   - Full bilingual support (हिन्दी & English) with an instant header switcher.

---

## 🚀 How to Run & Deploy

### Quick Production Build & Deploy (Recommended)

#### Option A: Linux / macOS / Git Bash (Shell Script)
```bash
# 1. Compile and build both Frontend and Backend
bash build.sh

# 2. Launch production server (serves API + React SPA unified on port 8000)
bash start.sh
```
* Or run both in 1-click: `bash deploy.sh`

#### Option B: Windows Native (.bat)
* Double-click or run: `build.bat` followed by `start.bat`

#### Option C: Docker & Docker Compose (Any Cloud / VPS)
```bash
docker compose up --build -d
```
* Access Web App: [http://localhost:8000](http://localhost:8000)
* Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Local Development Mode

#### 1. Launch FastAPI Backend
```powershell
cd backend
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```
* Interactive API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

#### 2. Launch React (TypeScript + Vite) Frontend
```powershell
cd frontend
npm run dev
```
* Web App: [http://localhost:5173](http://localhost:5173)

---

## 📞 Support & Contact
* **Founder & Lead:** Sanjay Yadav
* **Primary & WhatsApp:** +91 9971880670
* **Alternate Number:** 8053278764
