import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TransitionScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (session) {
          const userSession = JSON.parse(session);
          console.log('Session from AsyncStorage (Transition):', userSession);

          // Check if session has expired
          const sessionExpiry = userSession.expiry;
          const now = new Date().getTime();
           if (sessionExpiry && now > sessionExpiry) {
            console.log('Session expired, clearing AsyncStorage');
            await AsyncStorage.removeItem('userSession');
            navigation.replace('Login');
            return;
          }

          switch (userSession.role) {
            case 'admin':
              navigation.replace('DashboardAdmin');
              break;
            case 'user':
              navigation.replace('DashboardUser');
              break;
            default:
              navigation.replace('Login');
          }
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error:', error);
        navigation.replace('Login');
      }
    };

    checkSession();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#005bac" />
      <Text>Loading...</Text>
    </View>
  );
};

export default TransitionScreen;