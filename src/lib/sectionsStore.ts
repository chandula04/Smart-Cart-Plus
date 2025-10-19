import { StoreSection } from '@/types';

const STORAGE_KEY = 'smartcart_sections_v1';

// Minimal persisted shape
export type PersistedSection = Pick<StoreSection, 'id' | 'name' | 'icon' | 'x' | 'y' | 'shelfNumber'>;

export const defaultPersistedSections: PersistedSection[] = [
  { id: 'entrance', name: 'Entrance', x: 0, y: 0, icon: '🚪', shelfNumber: 0 },
  { id: 'dairy', name: 'Dairy & Eggs', x: 1, y: 0, icon: '🥛', shelfNumber: 1 },
  { id: 'bakery', name: 'Bakery', x: 2, y: 0, icon: '🍞', shelfNumber: 2 },
  { id: 'fruits', name: 'Fresh Fruits', x: 3, y: 0, icon: '🍎', shelfNumber: 3 },
  { id: 'vegetables', name: 'Vegetables', x: 0, y: 1, icon: '🥬', shelfNumber: 4 },
  { id: 'service', name: 'Customer Service', x: 1, y: 1, icon: 'ℹ️', shelfNumber: 0 },
  { id: 'beverages', name: 'Beverages', x: 2, y: 1, icon: '🥤', shelfNumber: 5 },
  { id: 'meat', name: 'Meat & Seafood', x: 3, y: 1, icon: '🍖', shelfNumber: 6 },
  { id: 'frozen', name: 'Frozen Foods', x: 0, y: 2, icon: '🧊', shelfNumber: 7 },
  { id: 'snacks', name: 'Snacks & Sweets', x: 1, y: 2, icon: '🍪', shelfNumber: 8 },
  { id: 'household', name: 'Household Items', x: 2, y: 2, icon: '🧹', shelfNumber: 9 },
  { id: 'checkout', name: 'Checkout Counter', x: 3, y: 2, icon: '💳', shelfNumber: 0 }
];

export function loadSections(): PersistedSection[] {
  if (typeof window === 'undefined') return defaultPersistedSections;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPersistedSections;
    const parsed = JSON.parse(raw) as PersistedSection[];
    if (!Array.isArray(parsed)) return defaultPersistedSections;
    return parsed;
  } catch {
    return defaultPersistedSections;
  }
}

export function saveSections(sections: PersistedSection[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  } catch {
    // ignore
  }
}
