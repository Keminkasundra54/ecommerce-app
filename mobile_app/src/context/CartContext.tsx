import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  productId: string;
  name: string;
  sku: string;
  image?: string;
  price: number;
  priceCurrency: string;
  priceUnit: string;
  quantity: number; // in cart
};

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const KEY = 'cart:v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === item.productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i));
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const { totalItems, totalAmount } = useMemo(() => {
    let ti = 0, ta = 0;
    for (const i of items) {
      ti += i.quantity;
      ta += i.price * i.quantity;
    }
    return { totalItems: ti, totalAmount: ta };
  }, [items]);

  const value = { items, totalItems, totalAmount, addToCart, updateQty, removeItem, clearCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
