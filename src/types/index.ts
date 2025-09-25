export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  aisle: string;
  expiryDate: Date;
  description?: string;
  image?: string;
  inStock: boolean;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreLayout {
  aisles: Aisle[];
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