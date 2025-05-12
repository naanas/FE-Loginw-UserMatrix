import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AppState } from 'react-native';
import { getSession, setSession as setSessionUtil, clearSession as clearSessionUtil } from './sessionUtils'; // Import fungsi utilitas

const SessionContext = createContext();

interface SessionContextProps {
  userSession: any;
  setSession: (session: any) => Promise<void>;
  clearSession: () => Promise<void>;
  isLoading: boolean;
  resetInactivityTimeout: () => void;
  timeout: number;
  onSessionTimeout: () => void; // Tambahkan callback function
}

export const SessionProvider = ({ children, timeout = 30000, onSessionTimeout }) => {
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActive, setLastActive] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getSession(); // Gunakan fungsi utilitas untuk mendapatkan sesi
        if (session) {
          setUserSession(session);
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
      await setSessionUtil(session); // Gunakan fungsi utilitas untuk menyimpan sesi
      setUserSession(session);
      resetInactivityTimeout(); // reset timeout when setting a session
    } catch (error) {
      console.error('Error setting session:', error);
    }
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await clearSessionUtil(); // Gunakan fungsi utilitas untuk menghapus sesi
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
        clearSession(); // Hapus sesi saat timeout
        onSessionTimeout(); // Panggil callback function
      }
    };

    if (userSession && lastActive) {
      inactivityTimeout = setInterval(checkInactivity, 1000); // Check every 1 second
    }

    // Clear the interval when the component unmounts or the session is cleared
    return () => clearInterval(inactivityTimeout);
  }, [userSession, lastActive, timeout, clearSession, onSessionTimeout]); // Tambahkan onSessionTimeout sebagai dependensi

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
    timeout,
    onSessionTimeout // Sertakan callback function dalam value
  }), [userSession, setSession, clearSession, isLoading, resetInactivityTimeout, timeout, onSessionTimeout]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext) as SessionContextProps;