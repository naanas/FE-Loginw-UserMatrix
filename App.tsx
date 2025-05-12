// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import DashboardAdmin from './src/screens/DashboardAdmin';
import DashboardUser from './src/screens/DashboardUser';
import UserManagement from './src/screens/UserManagement';
import { AppState } from 'react-native';
import { SessionProvider } from './src/screens/SessionContext';

const Stack = createNativeStackNavigator();

const App = () => {
  const [initialRouteName, setInitialRouteName] = useState('Login');

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userSession = await AsyncStorage.getItem('userSession');
        if (userSession) {
          const session = JSON.parse(userSession);
          console.log('Session from AsyncStorage (App.tsx):', session);

          // Check if session has expired (e.g., 24 hours)
          const sessionExpiry = session.expiry;
          const now = new Date().getTime();
          if (sessionExpiry && now > sessionExpiry) {
            console.log('Session expired, clearing AsyncStorage');
            await AsyncStorage.removeItem('userSession');
            setInitialRouteName('Login');
            return;
          }

          if (session.role === 'admin') {
            setInitialRouteName('DashboardAdmin');
          } else if (session.role === 'user') {
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
    <SessionProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRouteName}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="DashboardAdmin" component={DashboardAdmin} options={{ headerShown: false }} />
          <Stack.Screen name="DashboardUser" component={DashboardUser} options={{ headerShown: false }} />
          <Stack.Screen name="UserManagement" component={UserManagement} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
};

export default App;