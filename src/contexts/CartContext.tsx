'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { CartItem, Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { observeCart, setCartItem, removeCartItem, clearCartItems, updateProduct, adjustProductStock } from '@/lib/db';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartRef = useRef<CartItem[]>([]);
  const { uid } = useAuth();
  const anonCartRef = useRef<CartItem[]>([]);
  const migratedRef = useRef(false);
  const getDaysUntilExpiry = (d?: Date) => {
    if (!d) return Infinity;
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24));
  };

  // Track anonymous cart while not signed in
  useEffect(() => {
    cartRef.current = cart;
    if (!uid) {
      anonCartRef.current = cart;
    }
  }, [cart, uid]);

  // When uid becomes available, migrate anon cart first, then subscribe to Firestore
  useEffect(() => {
    let unsub: undefined | (() => void);
    let cancelled = false;
    const run = async () => {
      if (!uid) {
        // Keep local (anon) cart intact
        migratedRef.current = false;
        return;
      }

      // Migrate anon cart before subscribing to avoid initial empty snapshot overriding local state
      if (!migratedRef.current && (anonCartRef.current?.length || 0) > 0) {
        try {
          for (const it of anonCartRef.current) {
            await setCartItem(uid, it);
          }
        } catch (err) {
          console.error('Failed to migrate anonymous cart to Firestore:', err);
          // Keep optimistic local cart; subscription may still attach
        } finally {
          migratedRef.current = true;
          anonCartRef.current = [];
        }
      }

      if (cancelled) return;
      unsub = observeCart(uid, (items) => {
        // If Firestore returns empty but we have local optimistic items, keep local
        if (items.length === 0 && cartRef.current.length > 0) {
          return;
        }
        setCart(items);
      });
    };
    run();
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [uid]);

  const addToCart = async (product: Product) => {
    // Guard against invalid products without IDs
    if (!product || !product.id) {
      return;
    }
    // Block adding expired products
    const daysLeft = getDaysUntilExpiry(product.expiryDate);
    if (isFinite(daysLeft) && daysLeft <= 0) {
      alert('This product is expired and cannot be added to the cart.');
      return;
    }
    // Enforce stock limits
    const current = cart.find(c => c.product.id === product.id);
    const currentQty = current ? current.quantity : 0;
    const maxStock = product.quantity ?? Infinity;
    if (currentQty >= maxStock) {
      alert(`Only ${maxStock} in stock. You already have the maximum quantity in your cart.`);
      return;
    }
    // Optimistic local update for instant UI feedback (and reduce local product stock snapshot)
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, maxStock) }
            : item
        );
      }
      return [...prevCart, { product, quantity: Math.min(1, maxStock) }];
    });

    if (uid) {
      try {
        const existing = cart.find(c => c.product.id === product.id);
        const nextQty = Math.min((existing ? existing.quantity + 1 : 1), maxStock);
        await setCartItem(uid, { product, quantity: nextQty });
        // Decrease product stock in Firestore; if reaches 0, mark out of stock
        await adjustProductStock(product.id, -1);
      } catch (err) {
        console.error('Failed to set cart item in Firestore:', err);
        // Keep optimistic state so the user sees the item in the cart; it will sync later
        // Optional: surface a gentle message
        // alert('Added to cart (offline). We\'ll sync when connected.');
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    // Optimistic local removal
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    if (uid) {
      try {
        await removeCartItem(uid, productId);
      } catch (err) {
        console.error('Failed to remove from Firestore:', err);
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const existing = cart.find(c => c.product.id === productId);
    if (!existing) return;
    const maxStock = existing.product.quantity ?? Infinity;
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const clamped = Math.min(quantity, maxStock);
    if (quantity > maxStock) {
      alert(`Only ${maxStock} in stock for ${existing.product.name}.`);
    }
    // Optimistic local update
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: clamped }
          : item
      )
    );
    if (uid) {
      try {
        await setCartItem(uid, { ...existing, quantity: clamped });
        // Adjust stock based on delta
        const delta = clamped - (existing.quantity || 0);
        if (delta !== 0) {
          await adjustProductStock(productId, -delta);
        }
      } catch (err) {
        console.error('Failed to update cart item in Firestore:', err);
      }
    }
  };

  const clearCart = async () => {
    // Optimistic local clear
    setCart([]);
    if (uid) {
      try {
        await clearCartItems(uid);
      } catch (err) {
        console.error('Failed to clear cart items in Firestore:', err);
      }
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
