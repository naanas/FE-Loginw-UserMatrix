import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const TransitionScreen = () => {
    const navigation = useNavigation();
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimationAndNavigate = async () => {
            // Mulai animasi perubahan opacity
            Animated.timing(opacityValue, {
                toValue: 1,
                duration: 3000, // Durasi animasi (dalam milidetik)
                useNativeDriver: true,
            }).start(async () => {
                // Setelah animasi selesai, periksa sesi dan navigasi
                try {
                    const userSessionString = await AsyncStorage.getItem('userSession');
                    const userSession = userSessionString ? JSON.parse(userSessionString) : null;

                    if (userSession) {
                        console.log('TransitionScreen: Session from AsyncStorage:', userSession);

                        switch (userSession.role) {
                            case 'admin':
                                navigation.replace('AdminDashboard');
                                break;
                            case 'user':
                                navigation.replace('PicDashboard');
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
        };

        startAnimationAndNavigate();

        return () => {
            // Tidak ada yang perlu dibersihkan
        };
    }, [navigation, opacityValue]);

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
        width: 150, // Ukuran logo diperbesar
        height: 150,
    },
});

export default TransitionScreen;