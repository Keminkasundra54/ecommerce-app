import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Address = {
  id: string;
  name: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country?: string; // default IN
  isDefault?: boolean;
};

type AddressBookCtx = {
  addresses: Address[];
  addAddress: (a: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, a: Partial<Address>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
};

const KEY = 'addresses:v1';
const Ctx = createContext<AddressBookCtx | undefined>(undefined);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AddressBookProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) setAddresses(JSON.parse(raw));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(addresses)).catch(() => {});
  }, [addresses]);

  const addAddress = async (a: Omit<Address, 'id'>) => {
    const id = uid();
    const next = [...addresses, { ...a, id, country: a.country || 'IN' }];
    // first address becomes default
    if (next.length === 1) next[0].isDefault = true;
    setAddresses(next);
  };

  const updateAddress = async (id: string, a: Partial<Address>) => {
    setAddresses(prev => prev.map(x => (x.id === id ? { ...x, ...a } : x)));
  };

  const removeAddress = async (id: string) => {
    let next = addresses.filter(x => x.id !== id);
    // ensure one default remains
    if (next.length && !next.some(x => x.isDefault)) next[0].isDefault = true;
    setAddresses(next);
  };

  const setDefault = async (id: string) => {
    setAddresses(prev => prev.map(x => ({ ...x, isDefault: x.id === id })));
  };

  return (
    <Ctx.Provider value={{ addresses, addAddress, updateAddress, removeAddress, setDefault }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAddressBook() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAddressBook must be used within AddressBookProvider');
  return ctx;
}
