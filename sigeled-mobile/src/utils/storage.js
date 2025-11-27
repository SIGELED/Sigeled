import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const getItem = async (key) => {
  if (isWeb) {
    try {
      const v = localStorage.getItem(key);
      return v;
    } catch (e) {
      console.warn('[storage] localStorage.getItem error', e);
      return null;
    }
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.warn('[storage] SecureStore.getItemAsync error', e);
    return null;
  }
};

export const setItem = async (key, value) => {
  if (isWeb) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('[storage] localStorage.setItem error', e);
      return false;
    }
  }

  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (e) {
    console.warn('[storage] SecureStore.setItemAsync error', e);
    return false;
  }
};

export const deleteItem = async (key) => {
  if (isWeb) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('[storage] localStorage.removeItem error', e);
      return false;
    }
  }

  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (e) {
    console.warn('[storage] SecureStore.deleteItemAsync error', e);
    return false;
  }
};

export default { getItem, setItem, deleteItem };
