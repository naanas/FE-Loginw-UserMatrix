import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { moderateScale, verticalScale } from '../component/ResponsiveSize';

const { width } = Dimensions.get('window');

interface SidebarProps {
    sidebarAnimation: Animated.Value;
    isSidebarOpen: boolean;
    onCloseSidebar: () => void;
    handleLogout: () => void; // Add handleLogout prop
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarAnimation, isSidebarOpen, onCloseSidebar, handleLogout }) => {
    const sidebarWidth = width * 0.7;

    const sidebarTranslateX = sidebarAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-sidebarWidth, 0],
    });

    return (
        <Animated.View
            style={[
                styles.sidebar,
                {
                    width: sidebarWidth,
                    transform: [{ translateX: sidebarTranslateX }],
                },
            ]}
        >
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 20,
        paddingTop: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(4),
        elevation: 5,
        backgroundColor: '#e4572e',
    },
    blurContainer: {
        position: 'relative',
        flex: 1,
    },
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    logoutButton: {
        marginLeft:20,
        marginRight:20,
        backgroundColor: '#FFFFFF',
        paddingVertical: verticalScale(5),
        paddingHorizontal: moderateScale(10),
        borderRadius: moderateScale(15),
    },
    logoutButtonText: {
        marginLeft:20,
        color: '#e4572e',
        fontSize: moderateScale(14),
        fontWeight: 'bold',
    },
});

export default Sidebar;