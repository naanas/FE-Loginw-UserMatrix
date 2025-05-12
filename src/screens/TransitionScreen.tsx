import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearSession, getSession, checkSessionExpiry } from './sessionUtils'; // Import fungsi utilitas

const TransitionScreen = () => {
  const navigation = useNavigation();
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Mulai animasi perubahan opacity
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 2000, // Durasi animasi (dalam milidetik)
      useNativeDriver: true,
    }).start(async () => {
      // Setelah animasi selesai, periksa sesi dan navigasi
      try {
        const userSession = await getSession();

        if (userSession) {
          console.log('TransitionScreen: Session from AsyncStorage:', userSession);

          // Check if session has expired
          if (checkSessionExpiry(userSession)) {
            console.log('TransitionScreen: Session expired, clearing AsyncStorage');
            await clearSession();
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
        console.error('TransitionScreen: Error loading session:', error);
        Alert.alert('Error', 'Failed to load session. Please try again.');
        navigation.replace('Login');
      }
    });

    return () => {
      // Tidak ada yang perlu dibersihkan
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/PertaminaLogo.png')} // Ganti dengan path gambar Anda
        style={[styles.logo, { opacity: opacityValue }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 200, // Ukuran logo diperbesar
    height: 200,
  },
});

export default TransitionScreen;