import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import DashboardAdmin from './src/screens/DashboardAdmin';
import DashboardUser from './src/screens/DashboardUser';
import UserManagement from './src/screens/UserManagement';
import TransitionScreen from './src/screens/TransitionScreen';
import { SessionProvider} from './src/screens/SessionContext';
import { getSession, clearSession, checkSessionExpiry } from './sessionUtils';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const Navigator = () => {
    const navigation = useNavigation();

    const handleSessionTimeout = useCallback(() => {
        navigation.replace('Login');
    }, [navigation]);



    return (
        <SessionProvider onSessionTimeout={handleSessionTimeout}>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="DashboardAdmin" component={DashboardAdmin} options={{ headerShown: false }} />
                <Stack.Screen name="DashboardUser" component={DashboardUser} options={{ headerShown: false }} />
                <Stack.Screen name="UserManagement" component={UserManagement} options={{ headerShown: false }} />
                <Stack.Screen name="TransitionScreen" component={TransitionScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </SessionProvider>
    );
};


const App = () => {
    return (
        <NavigationContainer>
            <Navigator />
        </NavigationContainer>
    );
};

export default App;