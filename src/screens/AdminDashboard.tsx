import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AdminDashboard = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const response = await fetch('http://10.0.2.2:5000/api/users/profile', { // Replace with your profile endpoint
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    console.error('Failed to fetch profile:', response.status);
                    // Handle error (e.g., token expired, invalid token)
                    await AsyncStorage.removeItem('userToken');
                    navigation.replace('Login');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                // Handle error (e.g., network issue)
                await AsyncStorage.removeItem('userToken');
                navigation.replace('Login');
            }
        };

        fetchProfile();
    }, [navigation]);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userSession');
            navigation.replace('Login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text>Welcome, Admin {user.userId}!</Text>
            {/* Add user list and CRUD components here */}
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});

export default AdminDashboard;