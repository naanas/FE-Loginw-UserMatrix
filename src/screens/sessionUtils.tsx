import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'userSession';

export const getSession = async () => {
  try {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    if (session) {
      return JSON.parse(session);
    }
    return null;
  } catch (error) {
    console.error('Error loading session:', error);
    return null;
  }
};

export const setSession = async (session) => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error setting session:', error);
  }
};

export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

export const checkSessionExpiry = (session) => {
  if (!session || !session.expiry) {
    return false;
  }
  const now = new Date().getTime();
  return now > session.expiry;
};