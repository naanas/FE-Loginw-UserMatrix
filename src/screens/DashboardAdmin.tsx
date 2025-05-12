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
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSession } from './SessionContext';

const DashboardAdmin = () => {
  const navigation = useNavigation();
  const { userSession, clearSession, isLoading: sessionLoading } = useSession();
  // Pastikan userSession dan userSession.userId tidak null
  const userId = userSession && userSession.userId ? userSession.userId : 'Guest';
  const [users, setUsers] = useState([]);
  const [apiLoading, setApiLoading] = useState(true); // Add loading state
  

  const handleLogout = useCallback(async () => {
    await clearSession();
    navigation.replace('Login');
  }, [clearSession, navigation]);

  const handleProfile = () => {
    navigation.navigate('Profile');
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setApiLoading(true); // Set loading state to true
    try {
      const endpoint = 'http://10.0.2.2:5000/manage/users';
      console.log('DashboardAdmin: Hitting endpoint:', endpoint); // Log endpoint

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('DashboardAdmin: Response data:', data); // Log response data
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setApiLoading(false); // Set loading state to false
    }
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
              {/* Tampilkan ActivityIndicator jika sessionLoading true */}
              {sessionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.greeting}>Hello, {userId}!</Text>
              )}
            </View>
          </TouchableOpacity>
          {/* Add Logout Button Here */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
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

          {/* Grid Section - Displaying User Data */}
          <View style={styles.gridContainer}>
            <Text style={styles.sectionTitle}>User Data</Text>

            {apiLoading ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <View style={styles.gridRow}>
                {users.map((user, index) => (
                  <GridItem
                    key={index}
                    title={user.userId}
                    description={`Role: ${user.role}`} // added dynamic description
                    //imageSource={require('../assets/user_placeholder.png')} // PlaceHolder Image
                  />
                ))}
              </View>
            )}
          </View>
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <BottomNav />
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
        {/* <NavItem iconSource={require('../assets/message.png')} text="Messages" active={false} /> */}
        <NavItem
          iconSource={require('../assets/profile.png')}
          text="User Management"
          active={false}
          onPress={navigateToUserManagement}
        />
      </View>
    </View>
  );
};

const NavItem = ({ iconSource, text, active, onPress }) => {
  const buttonStyle = [
    styles.navItem,
    active ? styles.activeNavItem : {}
  ];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      <Image
        source={iconSource}
        style={[
          styles.navItemIcon,
          active ? styles.activeNavItemIcon : {}
        ]}
      />
      <Text style={[
        styles.navItemText,
        active ? styles.activeNavItemText : {}
      ]}>{text}</Text>
    </TouchableOpacity>
  );
};

const GridItem = ({ title, description, imageSource }) => (
  <View style={styles.gridItem}>
    {imageSource && (
      <Image
        source={imageSource}
        style={styles.itemImage}
      />
    )}
    <Text style={styles.itemTitle}>{title}</Text>
    <Text style={styles.itemDescription}>{description}</Text>
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
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Distribute items
    alignItems: 'center', // Vertically center items
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
    flex: 1,
    padding: 10,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow items to wrap to the next line
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent
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
    color: 'white',
  },
  itemDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)', // Lighter text
    marginTop: 5,
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
    textAlign: 'center'
  },
  navItemIcon: {
    width: 30,
    height: 30,
    tintColor: 'black',
  },
  activeNavItem: {
  },
  activeNavItemText: {
    color: '#4a86e8',
    fontWeight: 'bold',
  },
  activeNavItemIcon: {
    tintColor: '#4a86e8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
    animation: {
        width: 200, // Sesuaikan ukuran gambar
        height: 200,
    },
});

export default DashboardAdmin;