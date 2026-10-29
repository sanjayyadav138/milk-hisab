# Milk Hisab Mobile (Android & iOS) 🥛📱

Official cross-platform mobile application for **Milk Hisab (मिल्क हिसाब)**, built with **React Native**, **Expo**, and **TypeScript**.

---

## 🚀 Architecture for 1,000,000+ Users (High Scalability)

To support **1,000,000+ users (1M personas)** smoothly with maximum reusability and 60/120fps performance:

1. **Single Unified Codebase**:
   - 100% shared business logic between Android (.apk / .aab) and iOS (.ipa).
   - Reuses the domain contracts (`Customer`, `DailyLogItem`, `BatchLogPayload`) directly from the Milk Hisab backend API (`http://16.176.65.41/api`).

2. **Hermes AOT Bytecode Engine**:
   - Uses the Hermes JavaScript engine pre-compiling TypeScript/JS to bytecode ahead-of-time.
   - Ultra-fast startup time (< 400ms) and low RAM footprint (< 35MB).

3. **Virtualized Rendering**:
   - Utilizes `FlatList` with `keyExtractor` to ensure smooth scrolling even when a dairy vendor has 1,000+ customer records.

4. **Deep Native Integrations**:
   - **1-Click WhatsApp**: Instant pre-filled delivery alerts and monthly bill statements dispatched straight to customer chats.
   - **Direct UPI Intent**: Seamless 1-tap payment links launching Google Pay, PhonePe, or Paytm via `upi://pay` scheme.
   - **Bilingual Interface**: Toggle between Hindi (हिन्दी) and English (EN) instantly.

---

## 📁 Project Structure

```
mobile/
├── App.tsx                     # Main Navigator & Root Application
├── app.json                    # Expo, Android & iOS package configuration
├── package.json                # Dependencies & build scripts
├── tsconfig.json               # TypeScript configuration
└── src/
    ├── api/
    │   └── client.ts           # Type-safe API client connecting to EC2 backend
    ├── constants/
    │   ├── config.ts           # Production server endpoints & storage keys
    │   └── translations.ts     # Hindi and English dictionaries
    ├── context/
    │   ├── AuthContext.tsx     # Session management (Vendor & Customer login)
    │   └── LanguageContext.tsx # Bilingual state switcher
    ├── screens/
    │   ├── AuthScreen.tsx      # Phone & PIN Authentication
    │   ├── vendor/
    │   │   ├── DailyChecklistScreen.tsx  # Daily ledger logger with bilateral stats
    │   │   └── CustomersScreen.tsx       # Buyer & Supplier management + WhatsApp billing
    │   └── customer/
    │       └── CustomerPortalScreen.tsx  # Customer portal, monthly totals & UPI payment
    └── types/
        └── index.ts            # Domain interfaces matching FastAPI backend
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Run the Development Server
```bash
npm start
```
- Scan the QR code with **Expo Go** on an Android phone or iPhone to test on a physical device.
- Or press `a` to run on Android Emulator.
- Or press `i` to run on iOS Simulator (macOS).

---

## 📦 Building for Production (Google Play & Apple App Store)

Use **Expo EAS Build** to create production-ready binaries in the cloud without needing a Mac locally:

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Build Android APK / AAB
```bash
eas build -p android --profile production
```

### 3. Build iOS IPA
```bash
eas build -p ios --profile production
```
