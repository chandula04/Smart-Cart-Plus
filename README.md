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
- **Innovation**: Dynamic edge weights based on real-time aisle congestion
- **Features**: Crowd-avoiding pathfinding, alternative route suggestions

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

This repository is a Next.js (App Router) + TypeScript app with Tailwind CSS. It integrates Firebase for real-time data (Auth + Firestore) to manage products, store sections, traffic, carts, and expiry alerts.

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
      storageBucket: "...",
      messagingSenderId: "...",
      appId: "...",
   };
   ```
- Copy those values.

3) Enable Authentication (Anonymous)
- In the Firebase console, go to Build > Authentication.
- Click Get started.
- Go to the Sign-in method tab, click Add new provider, choose Anonymous, enable it, and Save.

4) Enable Cloud Firestore
- Go to Build > Firestore Database.
- Click Create database.
- Start in Test mode (for development), choose the default location, and click Enable.

5) Configure environment variables
- In this repo, copy `.env.local.example` to `.env.local`.
- Paste your keys from the firebaseConfig into these variables:
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID

These keys are used by `src/lib/firebase.ts` at runtime.

6) Install dependencies
If not already installed:

```cmd
npm install
```

7) Run the app in development
```cmd
npm run dev
```
Open http://localhost:3000 in your browser.

## Firestore data model (collections)
The app expects the following collections (created automatically on first write):
- `products` (documents: Product)
- `sections` (documents: StoreSection)
- `traffic` (documents keyed by sectionId)
- `carts/{uid}/items` (documents: CartItem)

Product document (example):
```json
{
   "name": "Organic Milk",
   "price": 450,
   "category": "Dairy",
   "section": "Dairy & Eggs",
   "expiryDate": { "_seconds": 1739923200, "_nanoseconds": 0 },
   "description": "Fresh organic whole milk",
   "inStock": true,
   "quantity": 25,
   "expiryHandled": false,
   "createdAt": { "_seconds": 1739923200, "_nanoseconds": 0 }
}
```

Section document (example):
```json
{
   "name": "Dairy & Eggs",
   "x": 1,
   "y": 0,
   "icon": "🥛",
   "shelfNumber": 1,
   "createdAt": { "_seconds": 1739923200, "_nanoseconds": 0 }
}
```

Traffic document (keyed by sectionId, created when you add a section):
```json
{
   "sectionId": "<sections doc id>",
   "sectionName": "Dairy & Eggs",
   "currentPeople": 0,
   "maxCapacity": 25,
   "congestionLevel": 0,
   "lastUpdated": { "_seconds": 1739923200, "_nanoseconds": 0 }
}
```

Cart item document (under `carts/{uid}/items/{productId}`):
```json
{
   "product": { "id": "...", "name": "...", "price": 450, ... },
   "quantity": 1
}
```

## Where Firebase is used in the code
- `src/lib/firebase.ts`: Initializes Firebase app (Auth + Firestore) from env vars
- `src/lib/db.ts`: Firestore helper functions (observeProducts/sections/traffic, add/update, carts)
- `src/contexts/AuthContext.tsx`: Anonymous sign-in on app load
- `src/contexts/CartContext.tsx`: Cart synced with Firestore for logged-in user
- `src/app/staff/page.tsx`: Live products/sections/traffic; add product/section; update traffic; expiry alerts
- `src/app/products/page.tsx`: Product listing from Firestore
- `src/app/page.tsx`: Home: search, suggestions, expiry alerts from Firestore; mark handled writes to Firestore
- `src/app/navigation/page.tsx`: Staff navigation: sections from Firestore; suggestions from Firestore products

## Optional: Seed sample data
You can add products/sections from the Staff page to quickly populate Firestore. If you want a script-based seeder, tell me and I’ll add one.

## Troubleshooting
- If you see Missing or insufficient permissions, you may need to relax dev security rules.
- Ensure Anonymous auth is enabled.
- Ensure `.env.local` exists and values are correct. Restart dev server after changing env vars.
- Timestamps: You can use the Firestore Console date picker; code normalizes Timestamp to JS Date.