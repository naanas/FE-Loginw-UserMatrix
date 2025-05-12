import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import DashboardAdmin from './src/screens/DashboardAdmin';
import DashboardUser from './src/screens/DashboardUser';
import UserManagement from './src/screens/UserManagement';
import { AppState } from 'react-native';
import { SessionProvider } from './src/screens/SessionContext';
import { getSession, clearSession, checkSessionExpiry } from './src/screens/sessionUtils';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const Stack = createNativeStackNavigator();

const Navigator = () => {
  const navigation = useNavigation();

  const handleSessionTimeout = useCallback(() => {
    // Arahkan pengguna ke layar login
    navigation.replace('Login');
  }, [navigation]);

  return (
    <SessionProvider onSessionTimeout={handleSessionTimeout}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DashboardAdmin" component={DashboardAdmin} options={{ headerShown: false }} />
        <Stack.Screen name="DashboardUser" component={DashboardUser} options={{ headerShown: false }} />
        <Stack.Screen name="UserManagement" component={UserManagement} options={{ headerShown: false }} />
      </Stack.Navigator>
    </SessionProvider>
  );
};

const App = () => {
  const [initialRouteName, setInitialRouteName] = useState('Login');

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userSession = await getSession();
        if (userSession) {
          console.log('Session from AsyncStorage (App.tsx):', userSession);

          // Check if session has expired
          if (checkSessionExpiry(userSession)) {
            console.log('Session expired, clearing AsyncStorage');
            await clearSession();
            setInitialRouteName('Login');
            return;
          }

          if (userSession.role === 'admin') {
            setInitialRouteName('DashboardAdmin');
          } else if (userSession.role === 'user') {
            setInitialRouteName('DashboardUser');
          } else {
            setInitialRouteName('Login');
          }
        } else {
          setInitialRouteName('Login');
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
        setInitialRouteName('Login');
      }
    };

    checkUserSession();

    // AppState listener (optional)
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('App is going to the background, you might want to clear session here');
        // You can add AsyncStorage.removeItem('userSession') here, but it is not recommended
        // Clearing the session here will automatically log out the user when they switch apps
      }
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };

  }, []);

  return (
    <NavigationContainer>
      <Navigator />
    </NavigationContainer>
  );
};

export default App;