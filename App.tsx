// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import DashboardAdmin from './src/screens/DashboardAdmin';
import DashboardUser from './src/screens/DashboardUser';
import TransitionScreen from './src/screens/TransitionScreen';
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
          if (session.role === 'admin') {
            setInitialRouteName('DashboardAdmin');
          } else {
            setInitialRouteName('DashboardUser');
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
  }, []);

  return (
    <SessionProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRouteName}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="DashboardAdmin" component={DashboardAdmin} options={{ headerShown: false }} />
          <Stack.Screen name="DashboardUser" component={DashboardUser} options={{ headerShown: false }} />
          <Stack.Screen name="Transition" component={TransitionScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
};

export default App;