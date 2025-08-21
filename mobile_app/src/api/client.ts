import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const DEFAULT = 'http://localhost:5001/api';
const API_BASE_URL =
  (Constants.expoConfig?.extra as any)?.API_BASE_URL ||
  (Constants.manifest2?.extra as any)?.API_BASE_URL ||
  DEFAULT;

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
