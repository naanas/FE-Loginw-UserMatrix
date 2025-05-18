import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const API_URL = 'https://ptm-tracker-service.onrender.com/api/v1/auth';
// const API_URL = 'http://10.22.10.202:3000/api/v1/auth';


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

    const accessibilityHidden = typeof loading === 'boolean' ? loading : false;

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                {/* Logo */}
                <Image
                    source={require('../assets/LogoLogin.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* Title and Subtitle */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>5R-TRACKER</Text>
                    <Text style={styles.subtitle}>DSP Plumpang</Text>
                </View>

                {/* Input Fields */}
                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="User ID"
                            placeholderTextColor="#888"
                            style={styles.input}
                            value={userId}
                            onChangeText={setUserId}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#888"
                            secureTextEntry
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Error Message */}
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                {/* Login Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                    accessibilityElementsHidden={accessibilityHidden}
                >
                    <LinearGradient
                        colors={['#4c669f', '#3b5998', '#192f6a']}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>LOGIN</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Bottom Logo */}
                <Image
                    source={require('../assets/PertaminaLogo.png')}
                    style={styles.bottomLogo}
                    resizeMode="contain"
                />
            </View>
        </KeyboardAvoidingView>
    );
};

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
    logo: {
        width: width * 0.7,
        height: width * 0.55, // Adjusted height
        marginBottom: height * 0.02,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: height * 0.03, // Added spacing
    },
    title: {
        fontSize: width * 0.06,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: width * 0.045,
        color: '#333',
        textAlign: 'center',
    },
    inputWrapper: {
        width: '100%',
    },
    inputContainer: {
        width: '100%',
        marginBottom: height * 0.02, // Consistent spacing
    },
    input: {
        width: '100%',
        height: height * 0.07,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: width * 0.04,
        backgroundColor: '#FFFFFF',
        fontSize: width * 0.04,
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: height * 0.07,
        marginTop: height * 0.02,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: width * 0.05,
    },
    bottomLogo: {
        width: width * 0.25,
        height: height * 0.05,
        marginTop: height * 0.18, // Added marginTop
        marginBottom: height * 0.02,
    },
    errorText: {
        color: 'red',
        marginBottom: height * 0.02,
        textAlign: 'center',
    },
});

export default LoginScreen;