import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen.tsx';
import AdminDashboard from './src/screens/AdminDashboard.tsx';
import PicDashboard from './src/screens/PicDashboard.tsx';
import TransitionScreen from './src/screens/TransitionScreen'; // Import TransitionScreen
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SisiLuarShelter from './src/screens/MenuScreens/SisiLuarShelter.tsx';
import Grill from './src/screens/subscreens/SisiLuarShelter/Grill.tsx';
import LantaiLuar from './src/screens/subscreens/SisiLuarShelter/LantaiLuar.tsx';
import AreaDalamShelter from './src/screens/MenuScreens/AreaDalamShelter.tsx';
import ProdukLv1 from './src/screens/subscreens/AreaDalamShelter/Produklv1.tsx';
import PerlindunganH_beam from './src/screens/subscreens/AreaDalamShelter/PerlindunganH_beam.tsx';
import LantaiDalamShelter from './src/screens/subscreens/AreaDalamShelter/LantaiDalamShelter.tsx';
import SpotScreen from './src/screens/SpotScreen/SpotScreen.tsx';
import { RootStackParamList } from './src/types/navigation.ts';
import CreateReportScreen from './src/screens/Report/CreateReportScreen.tsx';

const Stack = createStackNavigator<RootStackParamList | any>();

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
                        <Stack.Screen name="TransitionScreen" component={TransitionScreen} options={{ headerShown: false }} />{/* Added TransitionScreen */}
                        <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
                        <Stack.Screen name="PicDashboard" component={PicDashboard} options={{ headerShown: false }} />
                        <Stack.Screen name="SisiLuarShelter" component={SisiLuarShelter} options={{ headerShown: false }} />
                        <Stack.Screen name="Grill" component={Grill} options={{ headerShown: false }} />
                        <Stack.Screen name="LantaiLuar" component={LantaiLuar} options={{ headerShown: false }} />
                        <Stack.Screen name="AreaDalamShelter" component={AreaDalamShelter} options={{ headerShown: false }} />
                        <Stack.Screen name="ProdukLv1" component={ProdukLv1} options={{ headerShown: false }} />
                        <Stack.Screen name="PerlindunganH_beam" component={PerlindunganH_beam} options={{ headerShown: false }} />
                        <Stack.Screen name="LantaiDalamShelter" component={LantaiDalamShelter} options={{ headerShown: false }} />
                        <Stack.Screen name="SpotScreen" component={SpotScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="CreateReportScreen" component={CreateReportScreen} options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
};

export default App;