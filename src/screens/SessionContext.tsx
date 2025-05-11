import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (session) {
          setUserSession(JSON.parse(session));
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const setSession = async (session) => {
    try {
      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      setUserSession(session);
    } catch (error) {
      console.error('Error setting session:', error);
    }
  };

  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      setUserSession(null);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  return (
    <SessionContext.Provider value={{ userSession, setSession, clearSession, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);