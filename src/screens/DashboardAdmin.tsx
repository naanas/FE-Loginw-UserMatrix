import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert, // Import Alert component
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // Import hook useNavigation
import { useSession } from './SessionContext'; // Import useSession hook

const DashboardAdmin = () => {
  const navigation = useNavigation(); // Inisialisasi hook useNavigation
  const { userSession, clearSession } = useSession(); // Access the user session from the context
  const userId = userSession ? userSession.userId : 'Guest'; // Get userId from session, default to 'Guest'

  const handleLogout = useCallback(async () => {
    await clearSession(); // Clear the session
    navigation.replace('Login'); // Navigate to Login screen
  }, [clearSession, navigation]);

  const handleProfile = () => {
    navigation.navigate('Profile'); // Navigate ke halaman profile
  };

  const showLogoutAlert = () => {
    Alert.alert(
      "Options",
      "Choose an action",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Profile",
          onPress: handleProfile
        },
        {
          text: "Logout",
          onPress: () => handleLogout()
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['rgba(0, 131, 238, 0.9)', 'rgba(62, 167, 253, 0.6)', 'transparent']}
          style={styles.header}
        >
          <TouchableOpacity onPress={showLogoutAlert}>
            <View style={styles.profileContainer}>
              <Image
                source={require('../assets/Profile1.png')}
                style={styles.profileImage}
              />
              <Text style={styles.greeting}>Hello, {userId}!</Text> {/* Display the userId */}
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      
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

        {/* Grid Section */}
        {/* <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <GridItem
              title="Sisi Luar Shelter"
              description="Items Cleaning: Grill & Lantai Luar"
              imageSource={require('../assets/SisiLuarShelter.jpg')}
              onPress={() => navigation.navigate('SisiLuarShelter')}
            />
            <GridItem
              title="Area Dalam Shelter"
              description="Items Cleaning: Produk Level L, Pelindung H-Beam & Lantai Dalam Shelter"
              imageSource={require('../assets/AreaDalamShelter.jpg')}
              onPress={() => navigation.navigate('areadalamshelter')}
            />
          </View>

          <View style={styles.gridRow}>
            <GridItem
              title="Dinding Shelter"
              description="Items Cleaning: Dinding Luar & Dinding Dalam"
              imageSource={require('../assets/DindingShelter.jpg')}
              onPress={() => navigation.navigate('dindingshelter')}
            />
            <GridItem
              title="Sarfas"
              description="Items Cleaning: Forklift & Shelter Forklift"
              imageSource={require('../assets/Sarfas.jpg')}
              onPress={() => navigation.navigate('sharfas')}
            />
          </View>
        </View> */}
        <View style={{ height: 80 }} />
      

      {/* Bottom Navigation */}
      <BottomNav  />
    </SafeAreaView>
  );
};

const BottomNav = () => {
    const navigation = useNavigation();

    const navigateToUserManagement = useCallback(() => {
        navigation.navigate('UserManagement');
    }, [navigation]);

    return (
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <NavItem iconSource={require('../assets/home.png')} text="Home" active={true} />
          <NavItem iconSource={require('../assets/message.png')} text="Messages" active={false} />
          <NavItem
            iconSource={require('../assets/profile.png')}
            text="User Management"
            active={false}
            onPress={navigateToUserManagement} // Navigate to UserManagement
          />
          {/* <NavItem iconSource={require('../assets/profile.png')} text="Profile" active={false} /> */}
        </View>
      </View>
    );
  };
  
  const NavItem = ({ iconSource, text, active, onPress }) => {
    const buttonStyle = [
      styles.navItem,
      active ? styles.activeNavItem : {} // Conditional styling for active state
    ];
  
    return (
      <TouchableOpacity style={buttonStyle} onPress={onPress}>
        <Image
          source={iconSource}
          style={[
            styles.navItemIcon,
            active ? styles.activeNavItemIcon : {} // Conditional styling for active state
          ]}
        />
        <Text style={[
          styles.navItemText,
          active ? styles.activeNavItemText : {} // Conditional styling for active state
        ]}>{text}</Text>
      </TouchableOpacity>
    );
  };

const GridItem = ({ title, description, imageSource, onPress }) => (
  <View style={styles.gridItem}>
    <Image
      source={imageSource}
      style={styles.itemImage}
    />
    <Text style={styles.itemTitle}>{title}</Text>
    <Text style={styles.itemDescription}>{description}</Text>
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <Text style={styles.addButtonText}>+</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4572e',
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
  content: {
    marginTop: 110, // Tinggi header
  },
    scrollViewContent: {
    paddingBottom: 80, // Tinggi bottom navigation
  },
  time: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  profileContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  heroSection: {
    top:110,
    padding: 20,
  },
  heroImage: {
    width: '100%',
    height: 130,
    borderRadius: 10,
  },
  heroTitle: {
    marginTop: -20,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  gridContainer: {
    top:100,
    flex: 1,
    padding: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  itemImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  itemDescription: {
    fontSize: 10, // Ukuran font yang disesuaikan
    color: 'gray',
    marginTop: 5,
    marginRight: 40,
  },
  addButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#4a86e8',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 80,
  },
  navItemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemText: {
    color: 'black',
    fontSize: 10,
    marginTop: 5,
    textAlign:'center'
  },
    navItemIcon: {
        width: 30,
        height: 30,
        tintColor:'black',
    },

  // Style for the active state
  activeNavItem: {
    // Example: Change background color or add a border
    // backgroundColor: '#e0e0e0',
  },
  activeNavItemText: {
    // Example: Change text color
    color: '#4a86e8',
    fontWeight: 'bold',
  },
    activeNavItemIcon: {
    // Example: Change icon color
    tintColor: '#4a86e8',
  },
});

export default DashboardAdmin;