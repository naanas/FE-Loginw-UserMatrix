import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen.tsx';
import AdminDashboard from './src/screens/AdminDashboard.tsx'; // Corrected path
import PicDashboard from './src/screens/PicDashboard.tsx'; // Corrected path
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

const App = () => {
    const [initialRouteName, setInitialRouteName] = useState('Login');

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');

                if (token) {
                    const userSession = await AsyncStorage.getItem('userSession');
                    if (userSession) {
                        const parsedSession = JSON.parse(userSession);
                        if (parsedSession.role === 'admin') {
                            setInitialRouteName('AdminDashboard');
                        } else if (parsedSession.role === 'user') {
                            setInitialRouteName('PicDashboard');
                        } else {
                            setInitialRouteName('Login');
                        }
                    } else {
                        setInitialRouteName('Login');
                    }
                } else {
                    setInitialRouteName('Login');
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                setInitialRouteName('Login');
            }
        };

        checkLoginStatus();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
                        <Stack.Screen name="PicDashboard" component={PicDashboard} options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
};

export default App;