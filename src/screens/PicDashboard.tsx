import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    RefreshControl,
    Animated,
    TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Import Komponen ButtonNavigation
import ButtonNavigation from '../screens/component/BottomNavigationBar';
import Header from '../screens/component/Header'; // Import Header component
import Sidebar from '../screens/component/Sidebar'; // Import Sidebar component
import { moderateScale, verticalScale } from '../screens/component/ResponsiveSize'; // Adjust path if needed
import useUserStore from '../stores/userStores';
import { AccessMenu, Spot } from '../types/user';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

const { width, height } = Dimensions.get('window');

// Import Local Image
const menuIcon = require('../assets/menu.png');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SpotScreen'>;
const PicDashboard = () => {

    const navigation = useNavigation<NavigationProp>();
    const [user, setUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [accessMenu, setAccessMenu] = useState([]);
    const [selectedTab, setSelectedTab] = useState('Home'); // Track the selected tab
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarAnimation = useRef(new Animated.Value(0)).current;  // Initialize with useRef
    

    const accessMenuBro = useUserStore(state => state).user?.accessMenu;

    const imageZones = [
        require('../assets/SisiLuarShelter.jpg'),
        require('../assets/AreaDalamShelter.jpg'),
        require('../assets/DindingShelter.jpg'),
        require('../assets/Sarfas.jpg'),
    ]
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
                //    setAccessMenu(userSession.user.accessMenu); // Set the entire accessMenu
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

    const handleOnMenuPress = (menu: AccessMenu) => {
        console.log('Menu Pressed');
        navigation.navigate('SpotScreen', { menu: menu});
    };


    const renderMenuItem = ({ item,index }:{ item: AccessMenu, index: number }) => {
        return (
            <TouchableOpacity
                style={styles.gridItem}
                onPress={() => handleOnMenuPress(item)}
            >
                <Image source={imageZones[index]} style={styles.itemImage} />
                <Text style={styles.itemTitle}>{item.menu.name}</Text>
                <Text style={styles.itemDescription}>{item.menu.name}</Text>
            </TouchableOpacity>
        );
    }

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

    const navigateToTab = (tabName) => {
        setSelectedTab(tabName);
        // You can add navigation logic here if needed
        console.log(`Navigating to: ${tabName}`);
    };

    const closeSidebar = () => {
        Animated.timing(sidebarAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsSidebarOpen(false);
        });
    };

    const toggleSidebar = () => {
        const toValue = isSidebarOpen ? 0 : 1;

        Animated.timing(sidebarAnimation, {
            toValue: toValue,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsSidebarOpen(!isSidebarOpen);
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#e4572e' }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

            {/* Header */}
            <Header
                toggleSidebar={toggleSidebar}
                menuIcon={menuIcon}
                iconColor="white" // Add this line
            />

            {/* Sidebar */}
            <Sidebar
                sidebarAnimation={sidebarAnimation}
                handleLogout={handleLogout}
            />

            {/* Overlay */}
            {isSidebarOpen && (
                <TouchableWithoutFeedback onPress={closeSidebar}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}

            {/* Hero Section */}
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

            {/* Grid Items */}
            <FlatList
                data={accessMenuBro}
                renderItem={renderMenuItem}
                keyExtractor={(item, index) => item.menu.id || index.toString()}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
                }
            />

            {/* Modal Detail Data dengan BlurView */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>

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

            {/* Bottom Navigation Bar */}
            <ButtonNavigation
                selectedTab={selectedTab}
                navigateToTab={navigateToTab}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative', // Ensure the container is positioned relative
    },
    heroSection: {
        marginTop: '5',
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
    bottomNavigationBar: {
        backgroundColor: 'transparent',
        height: verticalScale(70),
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 0,
    },
    navBarContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100%',
    },
    navItem: {
        flex: 1,
        display: 'flex',
        height: '100%',
        paddingTop: verticalScale(10),
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    navIcon: {
        width: moderateScale(25),
        height: moderateScale(25),
        marginBottom: verticalScale(2),
        resizeMode: 'contain',
    },
    navLabel: {
        fontSize: moderateScale(12),
        fontWeight: '500',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
        zIndex: 10, // Below the sidebar but above other content
    },
});

export default PicDashboard;