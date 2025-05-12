import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const SessionContext = createContext();

interface SessionContextProps {
  userSession: any;
  setSession: (session: any) => Promise<void>;
  clearSession: () => Promise<void>;
  isLoading: boolean;
  resetInactivityTimeout: () => void;
  timeout: number;
}

export const SessionProvider = ({ children, timeout = 30000 }) => {
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActive, setLastActive] = useState(null);

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

  const setSession = useCallback(async (session) => {
    try {
      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      setUserSession(session);
      resetInactivityTimeout(); // reset timeout when setting a session
    } catch (error) {
      console.error('Error setting session:', error);
    }
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      setUserSession(null);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }, []);

  const resetInactivityTimeout = useCallback(() => {
    setLastActive(new Date());
  }, []);

  useEffect(() => {
    let inactivityTimeout;

    const checkInactivity = () => {
      if (!userSession) return; // dont clear when there is no user
      if (!lastActive) return; // dont clear if you have not reset timeout

      const now = new Date();
      const timeDiff = now.getTime() - lastActive.getTime();

      if (timeDiff > timeout) {
        console.log("Session timed out due to inactivity.");
      }
    };

    if (userSession && lastActive) {
      inactivityTimeout = setInterval(checkInactivity, 1000); // Check every 1 second
    }

    // Clear the interval when the component unmounts or the session is cleared
    return () => clearInterval(inactivityTimeout);
  }, [userSession, lastActive, timeout]);

  //reset timer when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('focus', () => {
      resetInactivityTimeout();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const value = React.useMemo<SessionContextProps>(() => ({
    userSession,
    setSession,
    clearSession,
    isLoading,
    resetInactivityTimeout,
    timeout
  }), [userSession, setSession, clearSession, isLoading, resetInactivityTimeout, timeout]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext) as SessionContextProps;