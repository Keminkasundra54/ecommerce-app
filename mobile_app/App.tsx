import { AddressBookProvider } from '@/context/AddressBook';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import RootNavigator from '@/navigation';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AddressBookProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AddressBookProvider>
      </CartProvider>
    </AuthProvider>
  );
}
