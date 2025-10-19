'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  // Sync cart from Firestore when signed in
  useEffect(() => {
    if (!uid) return;
    const unsub = observeCart(uid, (items) => setCart(items));
    return () => unsub();
  }, [uid]);

  const addToCart = async (product: Product) => {
    if (uid) {
      const existing = cart.find(c => c.product.id === product.id);
      const nextQty = existing ? existing.quantity + 1 : 1;
      await setCartItem(uid, { product, quantity: nextQty });
    } else {
      setCart(prevCart => {
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
    }
  };

  const removeFromCart = async (productId: string) => {
    if (uid) {
      await removeCartItem(uid, productId);
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
        await setCartItem(uid, { ...existing, quantity });
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
      await clearCartItems(uid);
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
