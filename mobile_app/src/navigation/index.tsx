import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Image, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

// Screens
import HomeScreen from '@/screens/HomeScreen';
import CategoryScreen from '@/screens/CategoryScreen';
import ProductDetailsScreen from '@/screens/ProductDetailsScreen';
import CartScreen from '@/screens/CartScreen';
import CheckoutScreen from '@/screens/CheckoutScreen';
import AddressFormScreen from '@/screens/AddressFormScreen';
import OrdersScreen from '@/screens/OrdersScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';

/** STACK PARAMS */
export type HomeStackParamList = {
  Home: undefined;
  Category: { id: string; name: string };
  ProductDetails: { id: string };
};
export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  AddressForm: { editing?: boolean; address?: any } | undefined;
};
export type OrdersStackParamList = {
  Orders: undefined;
};
export type ProfileStackParamList = {
  Profile: undefined;
};

/** TAB PARAMS */
export type TabParamList = {
  TabHome: undefined;
  TabOrders: undefined;
  TabCart: undefined;
  TabProfile: undefined;
};

/** AUTH STACK PARAMS (public) */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

/** Sub-stacks used inside tabs */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={require('../assets/logo.jpg')}
                  style={{ width: 30, height: 30, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Shipper</Text>
              </View>
            ),
            headerTitleAlign: 'center', // center title in header
          }}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Categories' }} />
      <HomeStack.Screen name="Category" component={CategoryScreen} options={({ route }) => ({ title: route.params.name })} />
      <HomeStack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product' }} />
    </HomeStack.Navigator>
  );
}

function OrdersStackNavigator() {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Your Orders' }} />
    </OrdersStack.Navigator>
  );
}

function CartStackNavigator() {
  return (
    <CartStack.Navigator>
      <CartStack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <CartStack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: 'Address' }} />
    </CartStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </ProfileStack.Navigator>
  );
}

/** Tabs with badge on Cart */
function AppTabs() {
  const { totalItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: false,  
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="TabHome"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <Text>{focused ? '🏠' : '🏡'}</Text>,
        }}
      />
      <Tab.Screen
        name="TabOrders"
        component={OrdersStackNavigator}
        options={{
          title: 'Orders',
          tabBarIcon: () => <Text>📦</Text>,
        }}
      />
      <Tab.Screen
        name="TabCart"
        component={CartStackNavigator}
        options={{
          title: 'Cart',
          tabBarIcon: () => <Text>🛒</Text>,
          tabBarBadge: totalItems > 0 ? `${totalItems}` : undefined,
        }}
      />
      <Tab.Screen
        name="TabProfile"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

/** Public (unauthenticated) stack */
function PublicAuth() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot password' }} />
    </AuthStack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  return user ? <AppTabs /> : <PublicAuth />;
}
