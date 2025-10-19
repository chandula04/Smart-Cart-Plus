import { db } from './firebase';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, addDoc, deleteDoc, getDocs, serverTimestamp, where, QuerySnapshot, DocumentData, DocumentReference } from 'firebase/firestore';
import { Product, StoreSection, TrafficData, CartItem } from '@/types';

// Collections
const productsCol = () => collection(db, 'products');
const sectionsCol = () => collection(db, 'sections');
const trafficCol = () => collection(db, 'traffic');
const cartsCol = (uid: string) => collection(db, 'carts', uid, 'items');

// Products
export const observeProducts = (cb: (items: Product[]) => void) => {
  return onSnapshot(productsCol(), (snap: QuerySnapshot<DocumentData>) => {
    const list: Product[] = [];
    snap.forEach((docu) => list.push({ id: docu.id, ...(docu.data() as any) } as Product));
    cb(list);
  });
};

export const addProduct = async (p: Omit<Product, 'id'>): Promise<DocumentReference> => {
  return addDoc(productsCol(), { ...p, createdAt: serverTimestamp() });
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  await updateDoc(doc(db, 'products', id), data as any);
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
  await setDoc(doc(db, 'carts', uid, 'items', item.product.id), item);
};

export const removeCartItem = async (uid: string, productId: string) => {
  await deleteDoc(doc(db, 'carts', uid, 'items', productId));
};

export const clearCartItems = async (uid: string) => {
  const q = await getDocs(cartsCol(uid));
  const deletions = q.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletions);
};
