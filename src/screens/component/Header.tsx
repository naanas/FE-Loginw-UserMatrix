import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { moderateScale } from '../component/ResponsiveSize';

const Header = ({ toggleSidebar, menuIcon, profileImage, iconColor }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
                <Image
                    source={menuIcon}
                    style={[styles.menuIcon, { tintColor: iconColor }]} // Apply tintColor here
                />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Image source={profileImage} style={styles.profileImage} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: moderateScale(10),
        paddingHorizontal: moderateScale(20),
        marginTop: moderateScale(25),
    },
    menuButton: {
        padding: moderateScale(10),
    },
    menuIcon: {
        width: moderateScale(30),
        height: moderateScale(30),
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: 'white',
    },
    profileImage: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
    },
});

export default Header;