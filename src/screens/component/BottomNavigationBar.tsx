import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { BlurView } from "@react-native-community/blur";

// Responsive Design Helpers (Import the responsive design helpers)
import {
    width,
    height,
    scale,
    verticalScale,
    moderateScale
} from './ResponsiveSize'; // Update the path if necessary


const BottomNavigationBar = ({ selectedTab, navigateToTab }) => {
    return (
        <View style={[styles.bottomNavigationBar, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
            <View style={styles.navBarContent}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigateToTab('Home')}
                >
                    <Image
                        source={ selectedTab === 'Home' ? require('../../assets/home.png') : require('../../assets/home.png')} // Replace with your home icon
                        style={styles.navIcon}
                        tintColor={selectedTab === 'Home' ? '#0083ee' : 'gray'}
                    />
                    <Text style={[styles.navLabel, { color: selectedTab === 'Home' ? '#0083ee' : 'gray' }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigateToTab('Map')}
                >
                    <Image
                        source={selectedTab === 'Map' ? require('../../assets/history.png') : require('../../assets/history.png')} // Replace with your map icon
                        style={styles.navIcon}
                        tintColor={selectedTab === 'Map' ? '#0083ee' : 'gray'}
                    />
                    <Text style={[styles.navLabel, { color: selectedTab === 'Map' ? '#0083ee' : 'gray' }]}>Timeline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigateToTab('Settings')}
                >
                    <Image
                        source={selectedTab === 'Settings' ? require('../../assets/profile.png') : require('../../assets/profile.png')} // Replace with your settings icon
                        style={styles.navIcon}
                         tintColor={selectedTab === 'Settings' ? '#0083ee' : 'gray'}
                    />
                    <Text style={[styles.navLabel, { color: selectedTab === 'Settings' ? '#0083ee' : 'gray' }]}>Profile</Text>
                </TouchableOpacity>
                
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default BottomNavigationBar;