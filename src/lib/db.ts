import { db } from './firebase';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, addDoc, deleteDoc, getDocs, serverTimestamp, where, QuerySnapshot, DocumentData, DocumentReference, orderBy } from 'firebase/firestore';
import { Product, StoreSection, TrafficData, CartItem, RemovalLog } from '@/types';

// Collections
const productsCol = () => collection(db, 'products');
const sectionsCol = () => collection(db, 'sections');
const trafficCol = () => collection(db, 'traffic');
const cartsCol = (uid: string) => collection(db, 'carts', uid, 'items');

// Helper to normalize various Firestore date shapes to JS Date
const normalizeDate = (value: any): Date | undefined => {
    if (!value) return undefined;
    try {
      if (typeof value?.toDate === 'function') return value.toDate();
      if (typeof value === 'string') {
        const d = new Date(value);
        return isNaN(d.getTime()) ? undefined : d;
      }
      if (typeof value === 'number') {
        // Assume milliseconds epoch
        const d = new Date(value);
        return isNaN(d.getTime()) ? undefined : d;
      }
    } catch {}
    return undefined;
  };

const mapDocToProduct = (docu: any): Product => {
  const data = docu.data() as any;
  return {
    id: docu.id,
    name: data.name ?? '',
    price: typeof data.price === 'number' ? data.price : parseFloat(data.price ?? '0') || 0,
    category: data.category ?? 'General',
    section: data.section ?? '',
    expiryDate: normalizeDate(data.expiryDate),
    description: data.description,
    image: data.image,
    inStock: typeof data.inStock === 'boolean' ? data.inStock : true,
    quantity: typeof data.quantity === 'number' ? data.quantity : parseInt(data.quantity ?? '0') || 0,
    expiryHandled: data.expiryHandled ?? false,
  } as Product;
};

export const fetchProductsOnce = async (): Promise<Product[]> => {
  const snap = await getDocs(productsCol());
  return snap.docs.map((d) => mapDocToProduct(d));
};

// Products
export const observeProducts = (cb: (items: Product[]) => void) => {
  return onSnapshot(
    productsCol(),
    (snap: QuerySnapshot<DocumentData>) => {
      const list: Product[] = snap.docs.map((d) => mapDocToProduct(d));
      cb(list);
    },
    async (error) => {
      console.error('observeProducts: Firestore subscription error', error);
      try {
        const once = await fetchProductsOnce();
        cb(once);
      } catch (e) {
        console.error('observeProducts: fallback fetch failed', e);
        cb([]);
      }
    }
  );
};

export const addProduct = async (p: Omit<Product, 'id'>): Promise<DocumentReference> => {
  return addDoc(productsCol(), { ...p, createdAt: serverTimestamp() });
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  if (!id) {
    throw new Error('Product ID is required for update');
  }
  await updateDoc(doc(db, 'products', id), data as any);
};

export const deleteProduct = async (id: string) => {
  if (!id) {
    throw new Error('Product ID is required for deletion');
  }
  if (typeof id !== 'string') {
    throw new Error('Product ID must be a string');
  }
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    throw error;
  }
};

// Sections
export const observeSections = (cb: (items: StoreSection[]) => void) => {
  return onSnapshot(sectionsCol(), (snap: QuerySnapshot<DocumentData>) => {
    const list: StoreSection[] = [];
    snap.forEach((docu) => list.push({ id: docu.id, ...(docu.data() as any) } as StoreSection));
    cb(list);
  });
};

export const addSection = async (s: Omit<StoreSection, 'id'>): Promise<DocumentReference> => {
  return addDoc(sectionsCol(), { ...s, createdAt: serverTimestamp() });
};

// Traffic
export const observeTraffic = (cb: (items: TrafficData[]) => void) => {
  return onSnapshot(trafficCol(), (snap: QuerySnapshot<DocumentData>) => {
    const list: TrafficData[] = [];
    snap.forEach((docu) => list.push({ sectionId: docu.id, ...(docu.data() as any) } as TrafficData));
    cb(list);
  });
};

export const updateTraffic = async (sectionId: string, newData: Partial<TrafficData>) => {
  await updateDoc(doc(db, 'traffic', sectionId), { ...newData, lastUpdated: serverTimestamp() });
};

export const addTrafficRecord = async (sectionId: string, sectionName: string) => {
  await setDoc(doc(db, 'traffic', sectionId), {
    sectionId,
    sectionName,
    currentPeople: 0,
    maxCapacity: 25,
    congestionLevel: 0,
    lastUpdated: serverTimestamp(),
  });
};

// Cart
export const observeCart = (uid: string, cb: (items: CartItem[]) => void) => {
  return onSnapshot(cartsCol(uid), (snap: QuerySnapshot<DocumentData>) => {
    const list: CartItem[] = [];
    snap.forEach((docu) => list.push(docu.data() as CartItem));
    cb(list);
  });
};

export const setCartItem = async (uid: string, item: CartItem) => {
  if (!uid) {
    throw new Error('UID is required for cart operations');
  }
  if (!item.product.id) {
    throw new Error('Product ID is required for cart item');
  }
  await setDoc(doc(db, 'carts', uid, 'items', item.product.id), item);
};

export const removeCartItem = async (uid: string, productId: string) => {
  if (!uid) {
    throw new Error('UID is required for cart operations');
  }
  if (!productId) {
    throw new Error('Product ID is required to remove cart item');
  }
  await deleteDoc(doc(db, 'carts', uid, 'items', productId));
};

export const clearCartItems = async (uid: string) => {
  const q = await getDocs(cartsCol(uid));
  const deletions = q.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletions);
};

// Removal logs
const removalLogsCol = () => collection(db, 'removalLogs');

export const addRemovalLog = async (log: Omit<RemovalLog, 'id'>) => {
  await addDoc(removalLogsCol(), {
    ...log,
    removedAt: serverTimestamp(),
  } as any);
};

export const observeRemovalLogs = (cb: (items: RemovalLog[]) => void) => {
  const q = query(removalLogsCol(), orderBy('removedAt', 'desc'));
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const list: RemovalLog[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      list.push({
        id: d.id,
        ...data,
        removedAt: data.removedAt?.toDate ? data.removedAt.toDate() : data.removedAt,
        expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate() : data.expiryDate,
      } as RemovalLog);
    });
    cb(list);
  });
};
