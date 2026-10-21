# 🌟 LifeLine — Multi-Directional Lifecycle & Cultural Navigator

> An ultra-clean, production-ready phone app centered on an interactive **Line with Big Dots**. Features **User-Selectable Line Direction** (↕ Vertical, ~ S-Curve River Path, ↔ Horizontal Scrubber), **Live Flowing Animations**, **Default Landing on Today (Age 32 · Oct 2026)**, **Universal US Demographics & Cultural Intelligence** (Navratri Garba, Durga Puja, Diwali, Los Gatos Halloween on Tait Ave, Hanukkah, Lunar New Year, Día de los Muertos), **Master PIN (`2019`) security**, and native mobile touch haptics. Zero ads.

---

## 🧭 Multi-Directional Timeline Layouts

Users can toggle their preferred layout direction at any time from the top layout switcher:

1. **↕ Vertical Line**: Utilizes the full height of the mobile phone screen. Features alternating left/right cards and a central luminous beam with continuous gradient shimmer.
2. **~ S-Curve River Path**: A flowing serpentine Bézier river path with a continuous animated energy pulse (`flowEnergy`), glowing curve anchors, and cards tucked cleanly into each river meander with zero overlap.
3. **↔ Horizontal Scrubber**: Horizontal timeline with semantic zoom, year ticks (ages 18 to 72), and alternating top/bottom cards.

---

## 🎯 Default Landing: "Today" (Age 32 · Oct 2026)

- Upon unlocking the app with PIN `2019`, the viewport automatically centers directly on **Today (Age 32 · Oct 2026)**.
- Features a **live expanding radar ping beacon** in emerald green.
- Tapping the **Today · Oct 2026** pill in the top navigation bar immediately returns and centers on the current day in any layout direction.

---

## 🌐 Universal US Demographics & Multi-Cultural Celebrations

Tailored specifically to active user demographics across the US:

- **Heritage & Festivals**:
  - 🇮🇳 **Indian**: Navratri Garba (Santa Clara Convention Center, Fremont), Durga Puja (Cupertino, San Mateo, Fremont), Diwali Lights (Santana Row, San Jose).
  - 🇺🇸 **American / Local Bay Area**: Halloween on Tait Ave (Los Gatos historic Almond Grove), Silicon Valley Turkey Trot & Black Friday, Vasona Park Fantasy of Lights.
  - 🕎 **Jewish**: Hanukkah Menorah Lightings (Santana Row, SF Union Square).
  - 🏮 **East Asian**: Lunar New Year & Chinatown Grand Parade (San Francisco, Cupertino).
  - 🇲🇽 **Hispanic**: Día de los Muertos Altares & Procession (San Jose, SF Mission).
  - 🌐 **All**: Displays all cultural traditions together.
- **Regions (US)**: SF Bay Area, Southern California, New York / Tri-State, Texas, Seattle, US General.
- **Gender & Focus**: All, Female, Male.
- **Birth Year Control**: Dynamically recalculates both Age and Calendar Year for every milestone.

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
