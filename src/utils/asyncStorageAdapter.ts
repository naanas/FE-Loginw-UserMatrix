import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistStorage } from 'zustand/middleware';

const asyncStorageAdapter: PersistStorage<any> = {
  getItem: async (name: string) => {
    const json = await AsyncStorage.getItem(name);
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      // fallback kalau json invalid
      return null;
    }
  },
  setItem: async (name: string, value: any) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

export default asyncStorageAdapter;
