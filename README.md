# Kinetiq AI — Next-Generation Adaptive Fitness & Nutrition Intelligence Platform

![Kinetiq AI](https://img.shields.io/badge/Platform-React%20Native%20%7C%20Expo-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-green)
![Database](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-brightgreen)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

**Kinetiq AI** is an intelligent, full-stack fitness and nutrition application built with React Native / Expo and Express / TypeScript. It delivers hyper-personalized, auto-regulating workout regimens and macro-precision meal plans driven by real-time biometrics, progressive overload tracking, and scientific nutritional algorithms (Mifflin-St Jeor formula).

---

## 🏛️ System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │       Kinetiq Mobile App (Expo)         │
                               │  - React Native 0.88 + Expo 58          │
                               │  - React Navigation (Native Stack+Tabs) │
                               │  - Zustand State Management             │
                               │  - Dark Theme + Cyan Neon Design System │
                               └────────────────────┬────────────────────┘
                                                    │ REST API / Bearer Token
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │         Kinetiq Express API (TS)        │
                               │  - Port 5000                            │
                               │  - JWT Auth + Silent Refresh Interceptor│
                               │  - Security: Helmet, CORS, Rate Limit   │
                               └────────┬──────────────────────┬─────────┘
                                        │                      │
                   ┌────────────────────┴──────┐        ┌──────┴────────────────────┐
                   ▼                           ▼        ▼                           ▼
        ┌───────────────────────┐   ┌───────────────────────┐           ┌───────────────────────┐
        │  Mifflin-St Jeor TDEE │   │ Workout Recommendation│           │ Smart Nutrition &     │
        │  & Macro Engine       │   │ & Split Generator     │           │ Meal Planning Engine  │
        └───────────────────────┘   └───────────────────────┘           └───────────────────────┘
                                                │
                                                ▼
                               ┌─────────────────────────────────────────┐
                               │          MongoDB Atlas / Local          │
                               │  - 19 Normalized Mongoose Models        │
                               │  - 50+ Seeded Exercises, 31 Recipes     │
                               │  - Pre-computed Aggregation Pipelines   │
                               └─────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. Adaptive Metabolism & Calorie Engine
- Calculates basal metabolic rate (BMR) with the scientific **Mifflin-St Jeor equation**:
  $$\text{BMR} = 10 \times \text{weight(kg)} + 6.25 \times \text{height(cm)} - 5 \times \text{age} + s$$
  *(where $s = +5$ for males, $-161$ for females)*
- Computes **Total Daily Energy Expenditure (TDEE)** via personalized PAL (Physical Activity Level) multipliers (1.2 to 1.9).
- Dynamically adjusts caloric targets based on specific fitness objectives:
  - **Fat Loss:** -20% caloric deficit ($1.8\text{g} - 2.2\text{g}$ protein/kg)
  - **Muscle Hypertrophy:** +10% caloric surplus ($1.6\text{g} - 2.0\text{g}$ protein/kg)
  - **Maintenance / Athletic Recomposition:** Caloric balance ($1.4\text{g} - 1.8\text{g}$ protein/kg)

### 2. Rules-Based Adaptive Workout Engine
- Generates 7-day training cycles based on split preference:
  - `Push / Pull / Legs (PPL)`
  - `Upper / Lower`
  - `Full Body`
- Filters exercises based on available equipment (`Full Gym`, `Dumbbells Only`, `Bodyweight / Calisthenics`).
- Integrates Rate of Perceived Exertion (**RPE**) and autoregulation: automatically recommends load progressions when $RPE < 7$ and deload volume adjustments when fatigue accumulates.

### 3. Smart Nutrition & Meal Planning
- Automatically fills daily breakfast, lunch, dinner, and snack slots with balanced recipes meeting precise macro ratios.
- Respects dietary preferences and allergies (`Vegan`, `Vegetarian`, `Keto`, `Paleo`, `Gluten-Free`, `Dairy-Free`, `Nut Allergies`).
- Proportional scaling: algorithms scale recipe ingredient grams dynamically to fit exact remaining calorie deficits.
- Barcode / Image scan adapter with intelligent nutritional fallback estimation.

### 4. Comprehensive Gamification & Consistency Engine
- Daily streak tracking with milestone alerts.
- Automated achievement badge unlocking (e.g., *First Step*, *7-Day Consistency Titan*, *Iron Lifter*, *Clean Fuel Master*).
- Interactive weight logs with percentage delta indicators and progress photo storage.

---

## 📱 Mobile App Screens & Flows

| Flow | Screen | Purpose |
|---|---|---|
| **Auth** | `SplashScreen` | Session verification & silent JWT auto-login |
| | `WelcomeScreen` | Visual onboarding showcase |
| | `LoginScreen` | Credential validation & store initialization |
| | `RegisterScreen` | Account creation with automatic onboarding redirect |
| **Onboarding** | `PersonalInfoScreen` | Age, gender, height, and body weight collection |
| | `FitnessGoalScreen` | Target goal selection (Cut, Bulk, Recomp, Strength) |
| | `FitnessLevelScreen` | Experience rating & weekly commitment |
| | `EquipmentAvailabilityScreen` | Gym gear inventory selection |
| | `DietaryPreferencesScreen` | Nutrition style & allergen exclusion filters |
| | `OnboardingSummaryScreen` | Interactive target calculation & plan initialization |
| **Main Tabs** | `HomeScreen (Dashboard)` | Daily calorie ring, macro splits, today's workout preview & streaks |
| | `WorkoutPlanScreen` | Weekly training regimen, exercise library & split details |
| | `ActiveWorkoutScreen` | Real-time workout logger with timers, set completions, and RPE rating |
| | `ExerciseDetailScreen` | Instruction guide, muscle targeting & video cues |
| | `NutritionPlanScreen` | Daily meal cards, macro breakdown, quick-log integration |
| | `FoodLoggerScreen` | Custom food search, serving size adjustments & manual log |
| | `FoodScannerModal` | Simulated camera barcode & meal snap recognition |
| | `ProgressScreen` | Weight trajectory charts, badges showcase & photo logs |
| | `ProfileScreen` | User profile, biometric editing, target recalculation & settings |

---

## 🗄️ Database Architecture (19 Mongoose Models)

1. `User` — Authentication credentials, role, status.
2. `UserProfile` — Biometrics (height, weight, age, gender, activity level).
3. `UserTarget` — Calculated caloric & macronutrient targets.
4. `DietaryPreference` — Nutrition restrictions, allergies, diet type.
5. `Exercise` — 50+ seeded exercises with muscle groups, equipment, instructions.
6. `WorkoutPlan` — Structured multi-day training templates.
7. `WorkoutSession` — Scheduled & recorded workouts for specific calendar dates.
8. `ExerciseLog` — Performance tracking (sets, reps, weight, RPE).
9. `Recipe` — 31 gourmet, macro-balanced recipes.
10. `MealPlan` — Weekly structured meal assignments.
11. `MealLog` — Realized food and meal intake records.
12. `NutritionItem` — Verified food items and barcode database.
13. `WeightLog` — Historical weigh-ins and notes.
14. `ProgressPhoto` — Secure photo upload records with pose tags.
15. `DailySummary` — Aggregated daily calorie, workout, and sleep telemetry.
16. `Badge` — Master catalog of unlockable awards.
17. `UserBadge` — User-unlocked achievements with earn timestamps.
18. `Streak` — Current and all-time maximum consistency streaks.
19. `NotificationPreference` — Push & email reminder configurations.

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** (v20+ or v22+)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)
- **Expo Go** app on iOS / Android (or Simulator)

---

### 1. Backend Setup & Seeding

```bash
cd backend

# Install dependencies
npm install

# Configure environment (or copy .env.example)
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/kinetiq_ai
# JWT_SECRET=kinetiq_super_secret_jwt_access_token_key_2026
# JWT_REFRESH_SECRET=kinetiq_super_secret_jwt_refresh_token_key_2026

# Seed database with 50+ exercises, 31 recipes, badges, and demo user:
npm run seed

# Start development server:
npm run dev
```

The API will be live at:
- **Health Check:** `http://localhost:5000/health`
- **API Base:** `http://localhost:5000/api/v1`

---

### 2. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo dev server
npx expo start
```

- Press `a` for Android Emulator
- Press `i` for iOS Simulator
- Press `w` for Web preview
- Scan the displayed QR code with your phone using **Expo Go**

---

## 🔑 Pre-Seeded Demo Account

Use these credentials to log in immediately with pre-loaded workout history, nutrition logs, and badges:

- **Email:** `demo@kinetiq.ai`
- **Password:** `Password123!`

---

## 🧪 Automated End-to-End Verification

To verify the complete auth, dashboard, workout logging, meal logging, and gamification lifecycle:

```bash
node backend/scratch/test-flow.js
```

All 6 automated stages will execute and report:
- ✅ Authentication & JWT generation
- ✅ Weekly dashboard telemetry retrieval
- ✅ Active workout completion with RPE
- ✅ Meal macro logging (Breakfast Oatmeal Bowl)
- ✅ Body weight log recording
- ✅ Gamification streak calculation & badge audit

---

## 🎨 Design Philosophy & Tokens

Kinetiq AI adopts an **Elite Athletic Dark Mode** aesthetic:
- **Primary Background:** `#0B0E14` (Deep Obsidian)
- **Card Background:** `#141A23` (Refined Slate with `#1E293B` borders)
- **Neon Accent:** `#00E5FF` (Cyan Electric for active metrics & progress)
- **Energy Accent:** `#FF6B00` (Thermal Orange for calories & workouts)
- **Success Accent:** `#10B981` (Emerald for completed sets & positive macros)
- **Typography:** Modern clean sans-serif with strong tabular numeric figures for weights & reps.
