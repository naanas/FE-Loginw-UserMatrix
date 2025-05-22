import React, { useState, useCallback, useRef, useEffect } from 'react';
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
    Alert,
    Keyboard,
    Animated,
    Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserStore from '../stores/userStores';
import { transformAccessMenu } from '../utils/transform';
import { BlurView } from '@react-native-community/blur';

// Import local icons
import EyeIcon from '../assets/eye24.png'; // Path to the eye icon
import EyeSlashIcon from '../assets/eyeclose24.png'; // Path to the eye-slash icon

const { width, height } = Dimensions.get('window');

const API_URL = 'https://ptm-tracker-service.onrender.com/api/v1/auth';
// const API_URL = 'http://10.21.10.202:3000/api/v1/auth';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const [showPassword, setShowPassword] = useState(false);

    const passwordInputRef = useRef(null);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                Animated.timing(slideAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.ease,
                    useNativeDriver: false,
                }).start();
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.ease,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const setLoginData = useUserStore(state => state.setLoginData);

    const handleLogin = useCallback(async () => {
        setLoading(true);
        setErrorMessage('');

        if (!userId.trim() || !password.trim()) {
            setErrorMessage('User ID dan Password harus diisi.');
            setLoading(false);
            return;
        }

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
                Alert.alert('Login Failed', message);
                throw new Error(message);
            }

            const data = await response.json();
            console.log('Login: Response data:', data);

            if (data.status === "success") {
                const user = data.data.user;
                const token = data.data.token;
                const transformedAccessMenu = transformAccessMenu(user.accessMenu as AccessMenuItem[]);

                const userData = {
                token: token,
                user: {
                    ...user,
                    accessMenu: transformedAccessMenu,
                }
                };

                setLoginData(userData);
                await AsyncStorage.setItem('userSession', JSON.stringify(data.data));
                await AsyncStorage.setItem('userToken', data.data.token);

                switch (data.data.user.role) {
                    case 'admin':
                        navigation.replace('AdminDashboard');
                        break;
                    case 'pic':
                        navigation.replace('TransitionScreen');
                        break;
                    default:
                        console.warn('Unknown role:', data.data.user.role);
                        navigation.replace('Login');
                        Alert.alert('Unknown Role', 'Peran pengguna tidak dikenal.');
                }
            } else {
                setErrorMessage(data.message || 'Login failed.');
                Alert.alert('Login Failed', data.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(error.message || 'Login failed.');
            Alert.alert('Login Error', error.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    }, [userId, password, navigation]);

    const handleGuestLogin = useCallback(() => {
        // Implementasi login sebagai guest di sini
        console.log('Login as Guest pressed');
        // Misalnya, navigasi ke dashboard atau halaman utama
        navigation.replace(''); // Ganti dengan halaman yang sesuai
    }, [navigation]);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const accessibilityHidden = typeof loading === 'boolean' ? loading : false;

    const formTranslateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height * 0.25], // Adjust this value to lift the card higher
    });

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                {/* Blur Background */}
                {isKeyboardVisible && (
                    <BlurView
                        style={styles.blurView}
                        blurType="light"
                        blurAmount={20}
                        reducedTransparencyFallbackColor="white"
                    />
                )}

                {/* Logo */}
                <Image
                    source={require('../assets/LogoLogin.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* Card Container */}
                <Animated.View style={[styles.cardContainer, { transform: [{ translateY: formTranslateY }] }]}>
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
                                returnKeyType="next"
                                onSubmitEditing={() => passwordInputRef.current.focus()}
                                blurOnSubmit={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="#888"
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    editable={!loading}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                    ref={passwordInputRef}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={toggleShowPassword}
                                >
                                    <Image
                                        source={showPassword ? EyeIcon : EyeSlashIcon}
                                        style={styles.iconImage}
                                    />
                                </TouchableOpacity>
                            </View>
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

                    {/* Login as Guest Button */}
                    <TouchableOpacity

                        style={styles.button}
                        onPress={handleGuestLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#4c669f', '#3b5998', '#192f6a']}
                            style={styles.gradient}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 0, y: 0 }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Login as Guest</Text>
                            )}
                        </LinearGradient>


                    </TouchableOpacity>
                </Animated.View>

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
        justifyContent: 'flex-start',
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.1,
    },
    logo: {
        width: width * 0.7,
        height: width * 0.55,
        marginBottom: height * 0.02,
    },
    cardContainer: {
        width: width * 0.9, // Adjust card width as needed
        backgroundColor: 'white', // Card background color
        borderRadius: 20, // Card border radius
        padding: width * 0.05, // Card padding
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 2, // Ensure the card is above the blur
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: height * 0.03,
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
        marginBottom: height * 0.02,
    },
    input: {
        width: '100%',
        height: height * 0.05,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: width * 0.04,
        backgroundColor: '#FFFFFF',
        fontSize: width * 0.04,
        color: '#000',
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: height * 0.05,
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
    guestButton: {
        marginTop: height * 0.02,
        paddingVertical: height * 0.015,
        paddingHorizontal: width * 0.05,
        backgroundColor: '#ddd', // Warna latar belakang tombol Guest
        borderRadius: 10,
        alignItems: 'center',
    },
    guestButtonText: {
        color: '#333', // Warna teks tombol Guest
        fontWeight: 'bold',
        fontSize: width * 0.04,
    },
    bottomLogo: {
        width: width * 0.25,
        height: height * 0.05,
        marginTop: height * 0.09, // Reduced marginTop to move the logo up
        marginBottom: height * 0.01,
    },
    errorText: {
        color: 'red',
        marginBottom: height * 0.02,
        textAlign: 'center',
    },
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1, // Make sure the blur view is behind the card
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eyeIcon: {
        position: 'absolute',
        right: width * 0.04,
    },
    iconImage: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
});

export default LoginScreen;