import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToLogin } from '@/navigation/RootNavigation';

// Optional: allow AuthContext to plug a logout function here (see Auth section below)
let onLogout: (() => void) | null = null;
export function setOnLogout(handler: () => void) { onLogout = handler; }

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://157.245.104.196:5001/api',
  withCredentials: false, // mobile: using Bearer token, not cookies
});

// Attach token on every request
api.interceptors.request.use(async (config: any) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<any>) => {
    const status = err.response?.status;
    if (status === 401) {
      // clear token and any other persisted auth
      try { await AsyncStorage.removeItem('token'); } catch {}
      // let AuthContext clean up (if wired)
      try { onLogout?.(); } catch {}

      // send user to Login
      resetToLogin();
    }
    return Promise.reject(err);
  }
);

export { api };
