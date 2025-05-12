import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AppState } from 'react-native';
import { getSession, setSession as setSessionUtil, clearSession as clearSessionUtil } from './sessionUtils';
import { useNavigation } from '@react-navigation/native';

const SessionContext = createContext();

interface SessionContextProps {
    userSession: any;
    setSession: (session: any) => Promise<void>;
    clearSession: () => Promise<void>;
    isLoading: boolean;
    resetInactivityTimeout: () => void;
    timeout: number;
    onSessionTimeout: () => void;
}

export const SessionProvider = ({ children, timeout = 30000, onSessionTimeout }) => {
    const [userSession, setUserSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastActive, setLastActive] = useState(null);
    const navigation = useNavigation();  //Move inside SessionProvider


    useEffect(() => {
        let inactivityTimeout;

        const checkInactivity = () => {
            if (!userSession) {
                console.log("No user session, skipping inactivity check");
                return;
            }
            if (!lastActive) {
                console.log("Last active not set, skipping inactivity check");
                return;
            }

            const now = new Date();
            const timeDiff = now.getTime() - lastActive.getTime();

            if (timeDiff > timeout) {
                console.log("Session timed out due to inactivity.");
                clearSession();
                onSessionTimeout();
            }
        };

        if (userSession && lastActive) {
            console.log("Setting interval for inactivity check");
            inactivityTimeout = setInterval(checkInactivity, 1000);
        }

        // Clear the interval when the component unmounts or the session is cleared
        return () => {
            console.log("Clearing interval for inactivity check");
            clearInterval(inactivityTimeout);
        };
    }, [userSession, lastActive, timeout, clearSession, onSessionTimeout]);

    //reset timer when app comes to foreground
    useEffect(() => {
        const loadSession = async () => {
            try {
                const session = await getSession();
                console.log("SessionContext - Retrieved session data:", session);
                if (session) {
                    setUserSession(session);
                    console.log("SessionContext - Session data set to state:", session);
                }
            } catch (error) {
                console.error('SessionContext - Error loading session:', error);
            } finally {
                setIsLoading(false);
                console.log("SessionContext - setIsLoading(false) called");
            }
        };
        const subscription = AppState.addEventListener('focus', () => {
            resetInactivityTimeout();
            console.log("App came to foreground, resetting inactivity timeout");
        });

        loadSession()

        return () => {
            subscription.remove();
            console.log("Removing AppState listener");
        };
    }, []);

    const setSession = useCallback(async (session) => {
        try {
            await setSessionUtil(session);
            setUserSession(session);
            resetInactivityTimeout();
        } catch (error) {
            console.error('SessionContext - Error setting session:', error);
        }
    }, []);

    const clearSession = useCallback(async () => {
        try {
            await clearSessionUtil();
            setUserSession(null);
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    }, []);

    const resetInactivityTimeout = useCallback(() => {
        setLastActive(new Date());
    }, []);

    const value = React.useMemo(() => ({
        userSession,
        setSession,
        clearSession,
        isLoading,
        resetInactivityTimeout,
        timeout,
        onSessionTimeout
    }), [userSession, setSession, clearSession, isLoading, resetInactivityTimeout, timeout, onSessionTimeout]);

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};