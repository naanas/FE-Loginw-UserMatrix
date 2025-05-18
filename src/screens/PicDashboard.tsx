import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    SafeAreaView,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Modal,
    StatusBar,
    Platform,
    RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from "@react-native-community/blur";

const { width, height } = Dimensions.get('window');

// Responsive Design Helpers
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const PicDashboard = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [accessMenu, setAccessMenu] = useState([]);

    const hardcodedGridItems = [
        {
            id: '1',
            title: 'Sisi Luar Shelter',
            subtitle: 'Items Cleaning: Grill & Lantai Luar',
            imageSource: require('../assets/SisiLuarShelter.jpg'),
            onPress: () => navigation.navigate('SisiLuarShelter')
        },
        {
            id: '2',
            title: 'Area Dalam Shelter',
            subtitle: 'Items Cleaning: Produk Level L, Pelindung H-Beam & Lantai Dalam Shelter',
            imageSource: require('../assets/AreaDalamShelter.jpg'),
            onPress: () => navigation.navigate('AreaDalamShelter')
        },
        {
            id: '3',
            title: 'Dinding Shelter',
            subtitle: 'Items Cleaning: Dinding Luar & Dinding Dalam',
            imageSource: require('../assets/DindingShelter.jpg'),
            onPress: () => navigation.navigate('')
        },
        {
            id: '4',
            title: 'Sarfas',
            subtitle: 'Items Cleaning: Forklift & Shelter Forklift',
            imageSource: require('../assets/Sarfas.jpg'),
            onPress: () => navigation.navigate('')
        },
    ];

    const fetchProfile = async () => {
        try {
            const userSessionString = await AsyncStorage.getItem('userSession');
            if (userSessionString) {
                const userSession = JSON.parse(userSessionString);
                console.log("Fetched user profile from session:", userSession);
                setUser(userSession.user);
                // Extract accessMenu
                //if (userSession.user && userSession.user.accessMenu) {
                 //   setAccessMenu(userSession.user.accessMenu); // Set the entire accessMenu
                //}
                if (userSession.user && userSession.user.accessCode) {
                  setAccessMenu(hardcodedGridItems); // Load the hardcoded menu
                }
            } else {
                console.log("No user session found, navigating to Login");
                navigation.replace('Login');
            }
        } catch (error) {
            console.error('Error fetching profile from session:', error);
            navigation.replace('Login');
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile().then(() => setRefreshing(false));
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userSession');
            navigation.replace('Login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleMenuItemPress = (menuItem) => {
        console.log('Menu Item Pressed:', menuItem.title);
        menuItem.onPress();
    };

    const renderGridItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.gridItem}
                onPress={() => handleMenuItemPress(item)}
            >
                <Image source={item.imageSource} style={styles.itemImage} />
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.subtitle}</Text>
            </TouchableOpacity>
        )
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#e4572e' }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

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
                        <Text style={styles.greeting}>Hello, {user ? user.name : 'Guest'}!</Text>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>
                    Zonasi 5R Area Shelter Drum
                </Text>
                <Text style={styles.heroTitle}>
                    DSP Plumpang
                </Text>
                <Image
                    source={require('../assets/headerimage.jpg')}
                    style={styles.heroImage}
                />
            </View>

            <FlatList
                data={accessMenu}
                renderItem={renderGridItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
                }
            />

            <View style={{ height: verticalScale(80) }} />

            {/* Modal Detail Data dengan BlurView */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView
                        style={styles.blurView}
                        blurType="dark"
                        blurAmount={10}
                    />
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Detail Data</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Tutup</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginTop: verticalScale(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileImage: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        marginRight: moderateScale(10),
    },
    greeting: {
        color: 'white',
        fontSize: moderateScale(16),
        fontWeight: '600',
        flex: 1,
    },
    logoutButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingVertical: verticalScale(5),
        paddingHorizontal: moderateScale(10),
        borderRadius: moderateScale(15),
    },
    logoutButtonText: {
        color: 'white',
        fontSize: moderateScale(14),
        fontWeight: 'bold',
    },
    heroSection: {
        marginTop: '70',
        padding: moderateScale(20),
        alignItems: 'center',
    },
    heroImage: {
        width: '100%',
        height: verticalScale(150),
        borderRadius: moderateScale(12),
        marginTop: verticalScale(10),
    },
    heroTitle: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    gridContainer: {
        flexGrow: 1,
        padding: moderateScale(10),
        alignItems: 'center', // Center items horizontally
        justifyContent: 'center', // Center items vertically
        paddingBottom: moderateScale(100)
    },
    gridItem: {
        width: '48%', // Adjusted for two items per row
        backgroundColor: 'white',
        borderRadius: moderateScale(12),
        padding: moderateScale(10),
        marginBottom: moderateScale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
        alignItems: 'center',
        marginHorizontal: moderateScale(5), // Horizontal margin for spacing
    },
    itemImage: {
        width: '100%',
        height: verticalScale(80),
        borderRadius: moderateScale(10),
    },
    itemTitle: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        marginTop: verticalScale(5),
        color: '#333',
        textAlign: 'center',
        height: verticalScale(40)
    },
    itemDescription: {
        fontSize: moderateScale(10),
        color: 'gray',
        marginTop: verticalScale(5),
        textAlign: 'center',
        height: verticalScale(30)
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(10),
        padding: moderateScale(20),
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(4),
        elevation: 5,
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: verticalScale(15),
    },
    closeButton: {
        backgroundColor: '#e4572e',
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        marginTop: verticalScale(20),
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: moderateScale(16),
    },
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});

export default PicDashboard;