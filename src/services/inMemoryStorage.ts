import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persistent key-value storage (AsyncStorage) for auth tokens and user data.
 */
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async multiRemove(keys: string[]): Promise<void> {
    await AsyncStorage.multiRemove(keys);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },

  async getAllKeys(): Promise<string[]> {
    return AsyncStorage.getAllKeys();
  },
};

export default storage;
