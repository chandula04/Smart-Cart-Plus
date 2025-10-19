export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  section: string; // Changed from 'aisle' to 'section' (e.g., "Dairy & Eggs", "Bakery")
  expiryDate?: Date; // Made optional for products without expiry dates
  description?: string;
  image?: string;
  inStock: boolean;
  quantity: number;
  expiryHandled?: boolean; // Whether expiry alert was handled (persisted in Firestore)
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreSection {
  id: string;
  name: string;
  icon: string;
  x?: number;  // Grid position X (optional for flexibility)
  y?: number;  // Grid position Y (optional for flexibility)
  position?: Position;  // Alternative position format
  products?: Product[];
  description?: string;
  shelfNumber?: number; // Shelf number label (1-10 for product sections, 0 or undefined for counters)
}

export interface StoreLayout {
  sections: StoreSection[];
  entrances: Position[];
  exits: Position[];
}

export interface Aisle {
  id: string;
  name: string;
  position: Position;
  products: Product[];
  // congestionLevel removed with traffic feature
}

export interface Position {
  x: number;
  y: number;
}

export interface NavigationPath {
  path: Position[];
  totalDistance: number;
  estimatedTime: number;
  // congestionLevel removed with traffic feature
}

export interface ExpiryAlert {
  product: Product;
  daysUntilExpiry: number;
  priority: number;
}

export interface SearchResult {
  products: Product[];
  totalResults: number;
  searchTime: number;
}

export interface Recommendation {
  product: Product;
  reason: string;
  confidence: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  currentPosition?: Position;
  cart: CartItem[];
  preferences: string[];
}

// TrafficData removed with traffic feature

export interface RemovalLog {
  id?: string;
  productId: string;
  name: string;
  category?: string;
  section?: string;
  price: number;
  quantity: number;
  expiryDate?: Date;
  removedAt: Date;
  reason: string;
}