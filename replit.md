# Replit.md

## Overview

This is **Alerta Já DH** — a personal safety app for Angola disguised as everyday utility apps (calculator, notes, clock). The app is built with **Expo/React Native** for cross-platform mobile support and uses a disguise mechanism where users enter a secret PIN through a fake calculator, notes app, or clock to unlock an SOS dashboard. Once unlocked, users can send emergency alerts (SMS, calls, WhatsApp, Telegram) to pre-configured emergency contacts, view safe stations (hospitals, police, NGOs, shelters), and manage settings. The app targets domestic violence / human rights situations where discretion is critical.

The project has an Express backend server and a PostgreSQL database configured via Drizzle ORM, though the backend is minimal — most app state is stored locally via AsyncStorage on the device.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo/React Native)
- **Framework**: Expo SDK 54 with React Native 0.81, using `expo-router` for file-based routing
- **State Management**: React Context (`lib/app-context.tsx`) provides global app state; `@tanstack/react-query` is available for server data fetching
- **Local Storage**: `@react-native-async-storage/async-storage` stores all sensitive user data on-device (PIN, contacts, profile, disguise preference, SOS history, safe stations)
- **Routing**: Single main screen (`app/index.tsx`) that conditionally renders different components based on app state (onboarding → disguise lock screen → SOS dashboard/settings)
- **UI**: No component library; all custom components with `StyleSheet`. Dark theme with red/orange accent colors defined in `constants/colors.ts`
- **Animations**: `react-native-reanimated` for SOS button animations
- **Haptics**: `expo-haptics` for tactile feedback throughout the app

### Disguise System
The core feature — three disguise modes that hide the app's true purpose:
1. **Calculator** (`CalculatorDisguise.tsx`): Fully functional calculator; typing PIN followed by `=` unlocks
2. **Notes** (`NotesDisguise.tsx`): Functional notepad; typing PIN followed by `#AJ` in text unlocks
3. **Clock** (`ClockDisguise.tsx`): World clock display; long-press (2s) then enter PIN to unlock

### Key App Flows
- **Onboarding** (`OnboardingFlow.tsx`): Multi-step wizard collecting age range, province, PIN setup, emergency contacts, and disguise selection
- **SOS Dashboard** (`SOSDashboard.tsx`): Emergency alert sending with location, contact management, SOS history
- **Settings** (`SettingsScreen.tsx`): Manage contacts and change PIN
- **Safe Stations** (`SafeStationsScreen.tsx`): Directory of nearby safe locations (hospitals, police, NGOs, shelters)
- **Alerts** (`lib/alerts.ts`): Uses `Linking` API to trigger SMS, phone calls, WhatsApp messages, and Telegram messages

### Backend (Express)
- **Server**: Express 5 (`server/index.ts`) with CORS configured for Replit domains
- **Routes**: Minimal — `server/routes.ts` is essentially empty, ready for API endpoints
- **Storage**: In-memory storage (`server/storage.ts`) with a `MemStorage` class implementing basic user CRUD — currently unused by the app
- **Database**: PostgreSQL via Drizzle ORM configured in `drizzle.config.ts`; schema in `shared/schema.ts` only has a `users` table
- **Build**: Production build uses `esbuild` to bundle server code; Expo web build handled by custom `scripts/build.js`

### Development Setup
- Two concurrent processes needed: Expo dev server (`expo:dev`) and Express server (`server:dev`)
- Express server runs on port 5000 (production) with proxy middleware for development
- Database migrations via `drizzle-kit push` (`db:push` script)

## External Dependencies

### Database
- **PostgreSQL** via Drizzle ORM — requires `DATABASE_URL` environment variable
- Schema defined in `shared/schema.ts` with Drizzle table definitions
- Currently minimal schema (just `users` table); most data stored client-side in AsyncStorage

### Key Libraries
- **Expo SDK 54**: Core mobile framework with plugins for fonts, location, image picker, haptics, crypto
- **expo-location**: GPS coordinates for SOS alerts
- **expo-crypto**: UUID generation for records
- **Drizzle ORM + drizzle-zod**: Database ORM with Zod schema validation
- **@tanstack/react-query**: Server state management (infrastructure ready, lightly used)
- **react-native-reanimated**: Animations
- **react-native-gesture-handler**: Touch gestures
- **react-native-keyboard-controller**: Keyboard-aware scrolling

### External Services (via device APIs)
- **SMS**: Via `Linking` API (`sms:` URL scheme)
- **Phone Calls**: Via `Linking` API (`tel:` URL scheme)
- **WhatsApp**: Via `wa.me` deep links
- **Telegram**: Via Telegram deep links
- **Google Maps**: Location sharing via `maps.google.com` URLs

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required for server/db)
- `REPLIT_DEV_DOMAIN`: Auto-set by Replit for development
- `EXPO_PUBLIC_DOMAIN`: Set to Replit domain for API calls from client