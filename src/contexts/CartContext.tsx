'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { CartItem, Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { observeCart, setCartItem, removeCartItem, clearCartItems } from '@/lib/db';

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
  const { uid } = useAuth();
  const anonCartRef = useRef<CartItem[]>([]);
  const migratedRef = useRef(false);

  // Sync cart from Firestore when signed in
  useEffect(() => {
    if (!uid) {
      setCart([]); // Clear local cart when no user
      migratedRef.current = false;
      return;
    }
    const unsub = observeCart(uid, (items) => {
      setCart(items);
    });
    return () => {
      unsub();
    };
  }, [uid]);

  // Track anonymous cart while not signed in
  useEffect(() => {
    if (!uid) {
      anonCartRef.current = cart;
    }
  }, [cart, uid]);

  // Migrate anonymous cart to Firestore once when uid becomes available
  useEffect(() => {
    const migrate = async () => {
      if (!uid) return;
      if (migratedRef.current) return;
      const items = anonCartRef.current || [];
      if (!items.length) {
        migratedRef.current = true;
        return;
      }
      try {
        for (const it of items) {
          await setCartItem(uid, it);
        }
      } catch (err) {
        console.error('Failed to migrate anonymous cart to Firestore:', err);
      } finally {
        migratedRef.current = true;
        anonCartRef.current = [];
      }
    };
    migrate();
  }, [uid]);

  const addToCart = async (product: Product) => {
    // Guard against invalid products without IDs
    if (!product || !product.id) {
      return;
    }
    // Optimistic local update for instant UI feedback
    let rollback: CartItem[] | null = null;
    setCart(prevCart => {
      rollback = prevCart;
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });

    if (uid) {
      try {
        const existing = cart.find(c => c.product.id === product.id);
        const nextQty = existing ? existing.quantity + 1 : 1;
        await setCartItem(uid, { product, quantity: nextQty });
      } catch (err) {
        console.error('Failed to set cart item in Firestore:', err);
        // Rollback optimistic change on failure
        if (rollback) setCart(rollback);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    if (uid) {
      try {
        await removeCartItem(uid, productId);
      } catch (err) {
        console.error('Failed to remove from Firestore:', err);
      }
    } else {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    if (uid) {
      const existing = cart.find(c => c.product.id === productId);
      if (existing) {
        try {
          await setCartItem(uid, { ...existing, quantity });
        } catch (err) {
          console.error('Failed to update cart item in Firestore:', err);
        }
      }
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (uid) {
      try {
        await clearCartItems(uid);
      } catch (err) {
        console.error('Failed to clear cart items in Firestore:', err);
      }
    } else {
      setCart([]);
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
