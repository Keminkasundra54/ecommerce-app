import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

// If you have your own Root param type, put it here:
export type RootParamList = {
  // Public (auth) stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Tabs (authenticated)
  TabHome: undefined;
  TabOrders: undefined;
  TabCart: undefined;
  TabProfile: undefined;

  // Stacks under tabs (optional to type deeply)
  Home: undefined;
  Category: { id: string; name: string };
  ProductDetails: { id: string };
  Cart: undefined;
  Checkout: undefined;
  AddressForm: { editing?: boolean; address?: any } | undefined;
  Orders: undefined;
  Profile: undefined;
};

export const navigationRef = createNavigationContainerRef<RootParamList>();

export function navigate<T extends keyof RootParamList>(name: T, params?: RootParamList[T]) {
  if (navigationRef.isReady()) {
    // @ts-expect-error types can be broad depending on your navigator nesting
    navigationRef.navigate(name as never, params as never);
  }
}

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Login' as keyof RootParamList } as any],
    });
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.dispatch(StackActions.pop(1));
  }
}
