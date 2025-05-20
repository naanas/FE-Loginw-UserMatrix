// src/screens/LoginScreen.js
import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogoLogin, PertaminaLogo } from '../components/atoms/Image';
import LoginArea from '../components/organisms/LoginArea';

const { width, height } = Dimensions.get('window');

// const API_URL = 'https://ptm-tracker-service.onrender.com/api/v1/auth';
const API_URL = 'http://10.22.10.202:3000/api/v1/auth';

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        alignItems: 'center',
        justifyContent: 'flex-start', // Changed to flex-start
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.1, // Added paddingTop
    },
});

const LoginScreen = () => {
    const navigation = useNavigation();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = useCallback(async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            const endpoint = `${API_URL}/login`;
            console.log('Login: Hitting endpoint:', endpoint);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userCode: userId,
                    password: password,
                }),
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    errorData = { message: `Login failed: ${response.status} ${response.statusText}` };
                }

                const message = errorData?.message || `Login failed: ${response.status} ${response.statusText}`;
                setErrorMessage(message);
                throw new Error(message);
            }

            const data = await response.json();
            console.log('Login: Response data:', data);

            if (data.status === "success") {
                await AsyncStorage.setItem('userSession', JSON.stringify(data.data));
                await AsyncStorage.setItem('userToken', data.data.token);

                switch (data.data.user.role) {
                    case 'admin':
                        navigation.replace('TransitionScreen');
                        break;
                    case 'pic':
                        navigation.replace('TransitionScreen');
                        break;
                    default:
                        console.warn('Unknown role:', data.data.user.role);
                        navigation.replace('Login');
                }
            } else {
                setErrorMessage(data.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(error.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    }, [userId, password, navigation]);

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                {/* Logo */}
                <LogoLogin />

                {/* Login Area */}
                <LoginArea
                    userId={userId}
                    setPassword={setPassword}
                    password={password}
                    setUserId={setUserId}
                    loading={loading}
                    errorMessage={errorMessage}
                    handleLogin={handleLogin}
                />

                {/* Bottom Logo */}
                <PertaminaLogo />
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;