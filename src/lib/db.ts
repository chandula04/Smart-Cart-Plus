import { db } from './firebase';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, addDoc, deleteDoc, getDocs, serverTimestamp, where, QuerySnapshot, DocumentData, DocumentReference, orderBy, increment, runTransaction } from 'firebase/firestore';
import { Product, StoreSection, CartItem, RemovalLog } from '@/types';

// Collections
const productsCol = () => collection(db, 'products');
const sectionsCol = () => collection(db, 'sections');
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

/**
 * Atomically adjust product stock by delta (negative to reduce).
 * Also sets inStock depending on the resulting quantity if provided by caller.
 */
export const adjustProductStock = async (id: string, delta: number) => {
  // Use Firestore atomic increment; cannot compute inStock atomically here without a transaction,
  // but we can set inStock to false optimistically if delta is negative and may cross zero.
  await updateDoc(doc(db, 'products', id), { quantity: increment(delta) } as any);
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

/**
 * Atomically checkout the cart: decrement product stocks by cart quantities and clear the cart.
 * Fails if any item has insufficient stock at commit time.
 */
export const checkoutCartTxn = async (uid: string, items: CartItem[]) => {
  if (!uid) throw new Error('UID is required for checkout');
  if (!items || items.length === 0) return;

  await runTransaction(db, async (tx) => {
    // Validate and update products
    for (const it of items) {
      const pid = it.product.id;
      if (!pid) throw new Error('Product ID missing during checkout');
      const pRef = doc(db, 'products', pid);
      const snap = await tx.get(pRef);
      if (!snap.exists()) {
        throw new Error(`Product not found: ${it.product.name || pid}`);
      }
      const data = snap.data() as any;
      const currentQty = Number(data.quantity || 0);
      const newQty = currentQty - Number(it.quantity || 0);
      if (newQty < 0) {
        throw new Error(`Insufficient stock for ${data.name || pid}. Available: ${currentQty}, requested: ${it.quantity}`);
      }
      tx.update(pRef, { quantity: newQty, inStock: newQty > 0 });
    }

    // Clear cart items
    for (const it of items) {
      const pid = it.product.id;
      if (!pid) continue;
      const cRef = doc(db, 'carts', uid, 'items', pid);
      tx.delete(cRef);
    }
  });
};
