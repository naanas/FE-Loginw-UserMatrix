import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TransitionScreen = () => {
    const navigation = useNavigation();
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimationAndNavigate = async () => {
            Animated.timing(opacityValue, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            }).start(async () => {
                try {
                    const userSessionString = await AsyncStorage.getItem('userSession');
                    const userSession = userSessionString ? JSON.parse(userSessionString) : null;

                    if (userSession) {
                        console.log('TransitionScreen: Session from AsyncStorage:', userSession);

                        // Access the role property safely
                        const role = userSession?.user?.role;

                        if (role) {
                            switch (role) {
                                case 'admin':
                                    navigation.replace('AdminDashboard');
                                    break;
                                case 'pic':
                                    navigation.replace('PicDashboard');
                                    break;
                                default:
                                    navigation.replace('Login');
                            }
                        } else {
                            console.warn('TransitionScreen: userSession.role is undefined');
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
            // No cleanup needed
        };
    }, [navigation, opacityValue]);

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require('../assets/PertaminaLogo.png')}
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
        width: 150,
        height: 150,
    },
});

export default TransitionScreen;