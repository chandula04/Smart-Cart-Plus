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
  congestionLevel?: number; // 1-5 scale (real-time traffic)
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
  congestionLevel: number; // 1-10 scale
}

export interface Position {
  x: number;
  y: number;
}

export interface NavigationPath {
  path: Position[];
  totalDistance: number;
  estimatedTime: number;
  congestionLevel: number;
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

export interface TrafficData {
  sectionId: string;  // Section identifier
  sectionName: string;
  position?: Position;  // Optional position
  currentPeople: number;
  maxCapacity: number;
  congestionLevel: number; // Calculated: currentPeople / maxCapacity
  lastUpdated: Date;  // Changed from timestamp to lastUpdated for clarity
}