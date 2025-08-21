import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '@/navigation/RootNavigation';
import RootNavigator from '@/navigation'; // your main navigator component
import { AuthProvider, useAuth } from '@/context/AuthContext'; // if you have one
import { CartProvider } from '@/context/CartContext';          // optional
import { AddressBookProvider } from '@/context/AddressBook';   // optional
import { setOnLogout } from '@/api/client';

function AppInner() {
  // If you have AuthContext, hook its logout so axios can call it on 401:
  const { logout } = useAuth?.() || { logout: undefined };
  React.useEffect(() => {
    if (logout) setOnLogout(logout);
  }, [logout]);

  return <RootNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AddressBookProvider>
          <NavigationContainer ref={navigationRef}>
            <AppInner />
          </NavigationContainer>
        </AddressBookProvider>
      </CartProvider>
    </AuthProvider>
  );
}
