# SmartCart Plus - Intelligent Shopping System

A modern shopping system implementing advanced data structures and algorithms for optimal user experience. This project demonstrates the practical application of computer science concepts in real-world scenarios.

## 🎯 Project Overview

SmartCart Plus is a comprehensive shopping system that solves modern-day shopping challenges through innovative algorithm implementation:

### Core Features & Algorithms

#### 1. **Binary Search Algorithm** - Product Search
- **Time Complexity**: O(log n)
- **Implementation**: Fast product lookup in sorted databases
- **Features**: Search by name, price range, category

#### 2. **Merge Sort Algorithm** - Product Sorting
- **Time Complexity**: O(n log n)
- **Implementation**: Efficient sorting by price, name, expiry date
- **Features**: Multiple sort criteria with stable sorting

#### 3. **Rush Hour Navigator** (Enhanced Dijkstra's Algorithm)
- **Time Complexity**: O((V + E) log V)
- **Innovation**: Optimal pathfinding within store layout
- **Features**: Path from entrance to destination

#### 4. **Smart Expiry Alert System** (Min-Heap)
- **Time Complexity**: Insert/Extract O(log n)
- **Implementation**: Priority queue for products nearing expiry
- **Features**: Real-time staff alerts, inventory prioritization

#### 5. **Product Recommendation System** (BFS)
- **Time Complexity**: O(V + E)
- **Implementation**: Graph traversal for "frequently bought together"
- **Features**: Cart-based recommendations, trending products

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Algorithm Analysis

### Performance Metrics

| Algorithm | Time Complexity | Space Complexity | Use Case |
|-----------|----------------|------------------|----------|
| Binary Search | O(log n) | O(1) | Product lookup |
| Merge Sort | O(n log n) | O(n) | Product sorting |
| Dijkstra's Enhanced | O((V+E) log V) | O(V) | Navigation |
| Min-Heap | O(log n) | O(n) | Expiry alerts |
| BFS | O(V + E) | O(V) | Recommendations |
# Smart Cart Plus

This repository is a Next.js (App Router) + TypeScript app with Tailwind CSS. It integrates Firebase for real-time data (Auth + Firestore) to manage products, store sections, carts, and expiry alerts.

## Prerequisites
- Node.js 18+
- A Firebase account and a Firebase project (Firestore + Authentication)

## Step-by-step: Create and connect Firebase

1) Create your Firebase project
- Go to https://console.firebase.google.com and click Add project.
- Enter a Project name (e.g., smart-cart-plus) and click Continue.
- Disable Google Analytics for now (optional) and click Create project.
- After creation, click Continue to go to the project dashboard.

2) Add a Web App (get config keys)
- In your Firebase project console, click the Web icon (</>) to "Add app".
- Enter an app nickname (e.g., smart-cart-plus-web) and click Register app.
- On the next screen, you'll see your Firebase SDK config:
   ```js
   const firebaseConfig = {
      apiKey: "...",
      authDomain: "...",
      projectId: "...",
      # SmartCart Plus

      A Next.js + TypeScript app with Tailwind CSS and Firebase that demonstrates practical data structures and algorithms in a modern shopping workflow. It includes real-time inventory via Firestore, anonymous auth, expiry alerts, and a robust cart synced to the user.

      ## Features

      - Products
         - Live product catalog from Firestore
         - Search by name and price range (Binary Search)
         - Sort by name, price, or expiry date (Merge Sort)
         - Per-product stock and optional expiry dates

      - Cart
         - Anonymous cart with automatic migration once uid is available
         - Optimistic add/remove/update for snappy UX, then sync to Firestore
         - Enforces stock limits and blocks expired items
         - Clear cart after checkout flow

      - Expiry Alerts (Staff + Home)
         - Min-Heap powered priority queue (SmartExpiryAlert)
         - Only items with daysUntilExpiry <= 5 are shown
         - Priority mapping: Critical (<= 2 days), High (3–5 days)
         - Day rounding: floor positive durations so 5.x shows as 5

      - Sections (Staff)
         - Add new sections (grid 4x3 positions) with optional emoji and shelf number
         - Live shelf availability (1–10) to avoid duplicates; 0 for counters
         - “Mark Handled” deletes products and writes a removal log

      - Algorithms included
         - Binary Search: search by name/price
         - Merge Sort: sorting utility
         - Smart Expiry Alert: min-heap
         - Rush Hour Navigator: enhanced Dijkstra (used locally; no traffic data)

      ## Tech Stack

      - Next.js (App Router) + React 18 + TypeScript
      - Tailwind CSS
      - Firebase (Auth: Anonymous, Firestore)

      ## Getting Started

      1) Install dependencies

      ```cmd
      npm install
      ```

      2) Environment variables

      Create `.env.local` and set the following (from your Firebase web app config):

      - NEXT_PUBLIC_FIREBASE_API_KEY
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID
      - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      - NEXT_PUBLIC_FIREBASE_APP_ID

      These are used by `src/lib/firebase.ts`.

      3) Enable Firebase services

      - Authentication → enable Anonymous provider
      - Firestore Database → create database

      4) Start the app

      ```cmd
      npm run dev
      ```

      Open http://localhost:3000

      ## Firestore Security Rules

      Use rules similar to the following during development. Adjust for production as needed.

      ```javascript
      rules_version = '2';
      service cloud.firestore {
         match /databases/{database}/documents {
            function isSignedIn() { return request.auth != null; }

            match /products/{id} {
               allow read: if true;
               allow write: if isSignedIn();
            }

            match /sections/{id} {
               allow read: if true;
               allow write: if isSignedIn();
            }

            match /removalLogs/{id} {
               allow read: if true;
               allow write: if isSignedIn();
            }

            match /carts/{userId} {
               allow read, write: if isSignedIn() && request.auth.uid == userId;
               match /items/{itemId} {
                  allow read, write: if isSignedIn() && request.auth.uid == userId;
               }
            }
         }
      }
      ```

      ## Data Model

      - products (collection)
         - name: string
         - price: number
         - category: string
         - section: string
         - expiryDate: Timestamp | string | number (normalized to Date in code)
         - description?: string
         - inStock: boolean
         - quantity: number
         - expiryHandled?: boolean
         - createdAt: Timestamp

      - sections (collection)
         - name: string
         - x: number
         - y: number
         - icon: string
         - shelfNumber?: number
         - createdAt: Timestamp

      - removalLogs (collection)
         - productId: string
         - name: string
         - category?: string
         - section?: string
         - price: number
         - quantity: number
         - expiryDate?: Timestamp
         - removedAt: Timestamp
         - reason: string

      - carts/{uid}/items (subcollection)
         - product: Product snapshot
         - quantity: number

      ## Project Structure

      - src/
         - algorithms/
            - binarySearch.ts
            - mergeSort.ts
            - productRecommendation.ts
            - rushHourNavigator.ts
            - smartExpiryAlert.ts
         - app/
            - page.tsx (Home: search, recommendations, expiry alerts)
            - products/page.tsx (Catalog + add to cart)
            - staff/page.tsx (Staff dashboard: sections, expiry, products, logs)
            - globals.css, layout.tsx
         - contexts/
            - AuthContext.tsx (anonymous sign-in)
            - CartContext.tsx (optimistic cart + Firestore sync)
         - lib/
            - firebase.ts (Firebase init)
            - db.ts (Firestore CRUD and observers)
         - types/
            - index.ts (shared types)

      ## NPM Scripts

      - dev: Start dev server
      - build: Production build
      - start: Start production server
      - lint: Run Next.js ESLint

      ## Troubleshooting

      - Missing or insufficient permissions
         - Ensure Anonymous auth is enabled
         - Apply the security rules above

      - Products not visible
         - Check Firestore data; verify you’re signed in anonymously (uid present)
         - Ensure `expiryDate` fields are valid (code normalizes different shapes)

      - Cart not syncing
         - Writes occur only when uid is present; local optimistic updates still show
         - Verify `carts/{uid}/items` rules and that the doc paths match

      - Expiry alerts
         - Only items with daysUntilExpiry <= 5 are shown
         - Critical: <= 2 days; High: 3–5 days

      ## License

      This project is for educational purposes. Add your preferred license if needed.