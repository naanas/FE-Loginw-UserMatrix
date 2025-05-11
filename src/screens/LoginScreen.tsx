import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: email,
          password: password,
        }),
      });

      const data = await response.json();

      console.log('Full API response:', data);

      if (!response.ok) {
        const errorMessage = data?.message || `An error occurred: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('Login successful', data);

      const now = new Date().getTime();
      const expiry = now + 24 * 60 * 60 * 1000; // Session expires in 24 hours

      try {
        await AsyncStorage.setItem(
          'userSession',
          JSON.stringify({
            userId: data.userId,
            role: data.role,
            expiry: expiry, // Include expiry timestamp
          })
        );
        console.log('Session saved to AsyncStorage (LoginScreen):', { userId: data.userId, role: data.role, expiry: expiry });
      } catch (e) {
        console.error('Failed to save user session:', e);
        Alert.alert('Error', 'Failed to save session data.');
        return;
      }

      // Navigate directly to the dashboard
      if (data.role === 'admin') {
        navigation.replace('DashboardAdmin');
      } else if (data.role === 'user') {
        navigation.replace('DashboardUser');
      } else {
        console.warn('Unknown role:', data.role);
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Login Failed', error.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  }, [email, password, navigation]);

  const handleGuestLogin = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        'userSession',
        JSON.stringify({
          userId: 'guest',
          role: 'guest',
        })
      );
      navigation.replace('GuestDashboard'); // Navigate to guest dashboard
    } catch (error) {
      console.error('Failed to login as guest:', error);
      Alert.alert('Error', 'Failed to login as guest.');
    }
  }, [navigation]);

  const accessibilityHidden = typeof loading === 'boolean' ? loading : false;

  return (
    <View style={styles.container}>
      {/* Logo Pertamina atas */}
      <Image
        source={require('../assets/LogoLogin.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Judul */}
      <Text style={styles.title}>5R-TRACKER</Text>
      <Text style={styles.subtitle}>DSP Plumpang</Text>

      {/* Input Email */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="User ID"
          placeholderTextColor="#888"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
      </View>

      {/* Input Password */}
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

      {/* Tombol Login */}
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

      {/* Tombol Login as Guest */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGuestLogin}
        disabled={loading}
        accessibilityElementsHidden={accessibilityHidden}
      >
        <LinearGradient
          colors={['#6a1b9a', '#7b1fa2', '#8e24aa']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>LOGIN AS GUEST</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Links untuk Forgot Password dan Register */}
      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Logo Pertamina bawah */}
      <Image
        source={require('../assets/PertaminaLogo.png')}
        style={styles.bottomLogo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: width * 0.05,
    marginTop: height * 0.1,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: height * 0.01,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#000',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#333',
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: height * 0.01,
  },
  input: {
    width: '100%',
    height: height * 0.07,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: width * 0.04,
    backgroundColor: '#FFFFFF',
    fontSize: width * 0.04,
  },
  button: {
    borderRadius: 10,
    width: '100%',
    height: height * 0.07,
    marginTop: height * 0.01,
    marginBottom: height * 0.02,
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
  linkContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: height * 0.01,
  },
  linkText: {
    color: '#005bac',
    fontSize: width * 0.035,
    marginVertical: height * 0.005,
  },
  bottomLogo: {
    width: width * 0.25,
    height: height * 0.05,
    marginBottom: height * 0.02,
  },
});

export default LoginScreen;