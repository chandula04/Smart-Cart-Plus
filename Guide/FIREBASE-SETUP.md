# Firebase Setup Guide for PDSA Project

## 🔥 Firebase Services You Can Use

### 1. **Firebase Authentication** (Recommended)
- **Purpose**: User login/signup for customers and staff
- **APIs Needed**:
  - Email/Password Authentication
  - Google Sign-In (optional)
  - Role-based access (customer vs staff)

### 2. **Cloud Firestore** (Database - Recommended)
- **Purpose**: Store all product data, user carts, purchase history
- **Collections Structure**:
  ```
  /products
    - id, name, price, category, aisle, expiryDate, quantity, inStock
  
  /users
    - id, email, role (customer/staff), cart, preferences
  
  /purchases
    - userId, products[], timestamp, totalAmount
  
  /inventory-alerts
    - productId, alertDate, status, handledBy
  ```

### 3. **Firebase Storage** (Optional)
- **Purpose**: Store product images
- **Usage**: Upload and retrieve product photos

### 4. **Firebase Cloud Functions** (Optional)
- **Purpose**: Backend logic for notifications
- **Use Cases**:
  - Send expiry alerts to staff
  - Calculate recommendations
  - Update inventory automatically

---

## 📦 Installation Steps

### Step 1: Install Firebase SDK
```bash
npm install firebase
```

### Step 2: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Enter project name: "pdsa-shopping-system"
4. Enable Google Analytics (optional)
5. Create project

### Step 3: Register Your App
1. In Firebase Console, click "Web" icon (</>)
2. Register app name: "PDSA Shopping App"
3. Copy the configuration object

### Step 4: Enable Services
1. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create Database"
   - Start in Test Mode
   
2. **Authentication**:
   - Go to Authentication
   - Click "Get Started"
   - Enable "Email/Password"

---

## 🛠️ Configuration Files to Create

### File 1: `src/lib/firebase.ts`
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

### File 2: `src/lib/firestore-services.ts`
```typescript
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '@/types';

// Product Services
export const addProduct = async (product: Omit<Product, 'id'>) => {
  const docRef = await addDoc(collection(db, 'products'), {
    ...product,
    expiryDate: product.expiryDate.toISOString(),
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

export const getProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, 'products'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    expiryDate: new Date(doc.data().expiryDate)
  })) as Product[];
};

export const getProductsByCategory = async (category: string) => {
  const q = query(
    collection(db, 'products'), 
    where('category', '==', category)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateProduct = async (productId: string, data: Partial<Product>) => {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, data);
};

export const deleteProduct = async (productId: string) => {
  await deleteDoc(doc(db, 'products', productId));
};

// Purchase History Services
export const recordPurchase = async (userId: string, products: any[], total: number) => {
  await addDoc(collection(db, 'purchases'), {
    userId,
    products,
    totalAmount: total,
    timestamp: new Date().toISOString()
  });
};

export const getUserPurchases = async (userId: string) => {
  const q = query(
    collection(db, 'purchases'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

---

## 🔑 Environment Variables

Create `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Update `src/lib/firebase.ts` to use env variables:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
```

---

## 📱 Which Firebase APIs to Use

### **For Your PDSA Project, I Recommend:**

✅ **1. Firestore Database** - Store products, users, purchases
✅ **2. Authentication** - User login (staff vs customers)
✅ **3. Storage** (Optional) - Product images

❌ **Skip These for Now:**
- Cloud Functions (too advanced for this project)
- Realtime Database (Firestore is better)
- Cloud Messaging (not needed)

---

## 🎯 Integration Plan

### What Changes with Firebase:

1. **Products Page**: 
   - Load products from Firestore instead of hardcoded data
   - Real-time updates

2. **Staff Dashboard**:
   - Store expiry alerts in Firestore
   - Track which staff member handled alerts

3. **User Authentication**:
   - Login page for staff
   - Customer accounts (optional)

4. **Shopping Cart**:
   - Save cart to user's Firestore document
   - Persist across sessions

---

## ⚠️ Important Notes

- **Free Tier**: Firebase free tier is generous (50k reads/day)
- **Security Rules**: Set up Firestore security rules
- **Offline Support**: Firestore works offline automatically
- **Real-time**: Data updates automatically across all clients

---

## 🚀 Next Steps

1. Install Firebase: `npm install firebase`
2. Create Firebase project
3. I'll help you integrate it into your app
4. Test with real data

**Do you want me to integrate Firebase now?**
