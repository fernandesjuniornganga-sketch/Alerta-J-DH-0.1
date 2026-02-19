# Replit.md

## Overview

This is **Alerta Já DH** — a privacy-focused SOS emergency and violence prevention platform for Angola, disguised as everyday utility apps (calculator, notes, clock). Built with **Expo/React Native** frontend and **Express/PostgreSQL** backend. The app targets domestic violence / human rights situations where discretion is critical.

Key features:
- **Disguise System**: Three disguise modes (Calculator, Notes, Clock) hide the app's true purpose
- **SOS Emergency Alerts**: Send alerts via SMS, WhatsApp, Telegram with GPS location
- **Safe Stations Directory**: Real hospitals, police stations, NGOs, shelters in Angola
- **Educational Resources**: Prevention content about gender violence, legal rights, safety planning
- **Anonymous Reporting**: Report violence cases anonymously to the database
- **Angola-specific**: 21 provinces (updated Jan 2025 division), emergency numbers (113, 190, 145, 180)

## User Preferences

Preferred communication style: Simple, everyday language (Portuguese/Angolan context).

## System Architecture

### Frontend (Expo/React Native)
- **Framework**: Expo SDK 54 with React Native 0.81, `expo-router` for routing
- **State**: React Context (`lib/app-context.tsx`) + AsyncStorage for local data
- **UI**: Custom dark theme with red/orange accents, `react-native-reanimated` animations
- **Navigation**: Single screen (`app/index.tsx`) with state-based screen switching

### Disguise System
1. **Calculator** (`CalculatorDisguise.tsx`): PIN + `=` unlocks
2. **Notes** (`NotesDisguise.tsx`): PIN + `#AJ` in text unlocks
3. **Clock** (`ClockDisguise.tsx`): Long-press (2s) + PIN unlocks
- Uses `useRef` (not useState) for sequence tracking to avoid stale closures

### App Screens
- **Onboarding** (`OnboardingFlow.tsx`): Age, province, PIN, contacts, disguise selection
- **SOS Dashboard** (`SOSDashboard.tsx`): Emergency button with countdown, quick actions
- **Settings** (`SettingsScreen.tsx`): Manage contacts, change PIN
- **Safe Stations** (`SafeStationsScreen.tsx`): Directory of safe locations
- **Resources** (`ResourcesScreen.tsx`): Educational content about gender violence prevention
- **Anonymous Report** (`ReportScreen.tsx`): Multi-step anonymous violence reporting form
- **Disguise Switcher** (`DisguiseSwitcher.tsx`): Change active disguise mode

### Backend (Express + PostgreSQL)
- **Server**: Express 5 on port 5000
- **Database**: PostgreSQL via Drizzle ORM + `@neondatabase/serverless`
- **Tables**: `users`, `sos_alerts`, `anonymous_reports`, `safe_stations`, `educational_resources`
- **API Routes**:
  - `POST/GET /api/sos` - SOS alert records
  - `POST/GET /api/reports` - Anonymous violence reports
  - `GET/POST /api/safe-stations` - Safe station directory
  - `GET /api/resources` - Educational content
  - `GET /api/stats` - Dashboard statistics
- **Seed**: `server/seed.ts` populates safe stations and educational resources on startup

### Angola Administrative Division (21 Provinces, Jan 2025)
Bengo, Benguela, Bié, Cabinda, Cuando, Cubango, Cuanza Norte, Cuanza Sul, Cunene, Huambo, Huíla, Icolo e Bengo, Luanda, Lunda Norte, Lunda Sul, Malanje, Moxico, Moxico Leste, Namibe, Uíge, Zaire

### Emergency Numbers
- Polícia: 113
- Bombeiros: 190
- Linha da Criança (INAC): 145
- Linha da Mulher: 180

## Development Setup
- Two workflows: `Start Backend` (Express) + `Start Frontend` (Expo)
- Database migrations: `npm run db:push`
- Expo web on port 8081, Express API on port 5000

## Key Libraries
- Expo SDK 54, expo-location, expo-crypto, expo-haptics
- Drizzle ORM + drizzle-zod + @neondatabase/serverless
- @tanstack/react-query, react-native-reanimated
- ws (WebSocket for Neon)
