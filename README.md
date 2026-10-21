# 🌟 LifeLine — The Human Lifecycle Phone App

> An ultra-clean, production-ready phone app centered on an interactive **Line with Big Dots**. Features **Semantic Multi-Level Zoom** with zero label collisions, **Master PIN (`2019`) security**, offline PWA caching, and native mobile touch haptics.

---

## 📱 How to Install on Your Phone (iOS & Android)

### On iPhone & iPad (Safari)
1. Open **[https://sachinpthigale.github.io/lifecycle-app/](https://sachinpthigale.github.io/lifecycle-app/)** in **Safari**.
2. Tap the **Share** button (the box with an upward arrow at the bottom).
3. Scroll down and tap **Add to Home Screen**.
4. The **LifeLine** app icon will appear directly on your home screen. When launched, it opens full-screen without any browser address bar.

### On Android (Chrome)
1. Open **[https://sachinpthigale.github.io/lifecycle-app/](https://sachinpthigale.github.io/lifecycle-app/)** in **Chrome**.
2. Tap the **three dots menu (⋮)** in the top right.
3. Tap **Install app** (or **Add to Home screen**).
4. Launches standalone with the LifeLine icon and native splash screen.

---

## 🔒 Security Gate (Master PIN)

- **Master PIN**: `2019` (same as Freya App)
- **Security Standard**: Verified client-side with SHA-256 hash (`023e33504ab909cf87a6f4e4e545090e40bdc0a2153e5b68b19f7fad2b737904`).
- **Features**:
  - Tactile numeric keypad with gentle haptic vibration.
  - 4 indicator dots with shake feedback on incorrect entries.
  - Quick **🔒 Lock** button in the top navigation bar.

---

## 🔍 Semantic Multi-Level Zoom (Zero Overlap)

- **Macro (1x Zoom)**: 4 major life epochs (*18 Adulthood*, *30 Family Launch*, *45 Mid-Career Health*, *65 Retirement*).
- **Decade (2x Zoom)**: 11 core 5-to-10 year milestones with alternating top/bottom stems.
- **Detailed (3x Zoom)**: Expands track to **4,800px+**, giving 92px width per year to comfortably fit granular milestones (*Daycare waitlist 31*, *529 Plan 32*, *Will & Guardianship 33*, *Preschool 35*, *Extracurriculars 38*, *College tours 48*, *Eldercare 55*, *Medicare countdown 64½*).

---

## 🛠️ Native App Packaging (Capacitor / Xcode / Android Studio)

A [`capacitor.config.json`](./capacitor.config.json) is included in the repository. To build a native iOS IPA or Android APK:

```bash
# 1. Initialize Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# 2. Add native mobile platforms
npx cap add ios
npx cap add android

# 3. Open in Xcode or Android Studio
npx cap open ios
npx cap open android
```
