import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    SafeAreaView,
    ScrollView,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const AdminDashboard = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfileFromSession = async () => {
            try {
                const userSession = await AsyncStorage.getItem('userSession');
                if (userSession) {
                    const userData = JSON.parse(userSession);
                    console.log("Fetched user profile from session:", userData);
                    setUser(userData);
                } else {
                    console.log("No user session found, navigating to Login");
                    navigation.replace('Login');
                }
            } catch (error) {
                console.error('Error fetching profile from session:', error);
                navigation.replace('Login');
            }
        };

        fetchProfileFromSession();
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['rgba(0, 131, 238, 0.9)', 'rgba(62, 167, 253, 0.6)', 'transparent']}
                    style={styles.header}
                >
                    <View style={styles.profileContainer}>
                        <Image
                            source={require('../assets/Profile1.png')}
                            style={styles.profileImage}
                        />
                        <Text style={styles.greeting}>Welcome, {user?.user?.name || 'Guest'}!</Text>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
            <ScrollView style={styles.scrollView}>
                <View style={styles.page}>
                    <Text style={styles.headerText}>Admin Dashboard</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#e4572e',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    header: {
        padding: 20,
        paddingTop: 30,
        backgroundColor: 'transparent',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
    },
    profileContainer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 50,
        marginRight: 10,
    },
    greeting: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
        flex: 1,
    },
    logoutButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    buttonLogout: {
        marginLeft: 'auto',
    },
    headerImage: {
        width: '100%',
        height: 130,
        borderRadius: 10,
    },
    scrollView: {
        flex: 1,
    },
    page: {
        width: width,
        justifyContent: 'center', // Align items to the top
        alignItems: 'center',
        paddingTop: 100, // Add some padding at the top
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white',
    }
});

export default AdminDashboard;