import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

// Responsive Design Helpers (customize as needed)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const SisiLuarShelter = () => {
    const navigation = useNavigation();

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleNavigateToProdukLv1 = () => {
        navigation.navigate('ProdukLv1'); // Navigate to the 'ProdukLv1' screen
    };

    const handleNavigateToPerlindunganHBeam = () => {
        navigation.navigate('PerlindunganH_beam'); // Navigate to the 'PerlindunganHBeam' screen
    };
     const handleNavigateToLantaiDalam = () => {
        navigation.navigate('LantaiDalamShelter'); // Navigate to the 'LantaiDalam' screen
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['rgba(0, 131, 238, 0.9)', 'rgba(62, 167, 253, 0.6)', 'transparent']}
                    style={styles.header}
                >
                    <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Area Dalam Shelter</Text>

                    <Text style={styles.sectionTitle}>CARA MELAKUKAN</Text>
                    <Text style={styles.description}>
                        Bersihkan dengan sapu, kemoceng & majun
                    </Text>

                    <Text style={styles.sectionTitle}>STANDARD</Text>
                    <Text style={styles.description}>
                        Tidak ada sampah & tidak ada debu
                    </Text>
                </View>

                {/* Blue Buttons Below Card */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.blueButton} onPress={handleNavigateToProdukLv1}>
                        <Text style={styles.blueButtonText}>Produk Lv 1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.blueButton} onPress={handleNavigateToPerlindunganHBeam}>
                        <Text style={styles.blueButtonText}>Perlindungan H-Beam</Text>
                    </TouchableOpacity>
                     <TouchableOpacity style={styles.blueButton} onPress={handleNavigateToLantaiDalam}>
                        <Text style={styles.blueButtonText}>Lantai Dalam Shelter</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
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
        paddingTop: 50,
        backgroundColor: 'transparent',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: 'white',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    backButton: {
        padding: moderateScale(10),
    },
    backButtonText: {
        color: 'white',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        marginTop: 200,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: moderateScale(20),
    },
    card: {
        backgroundColor: 'white',
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        width: '100%',
        maxWidth: moderateScale(400),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: moderateScale(4),
        elevation: 5,
    },
    title: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        marginBottom: verticalScale(20),
        color: '#333',
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        marginTop: verticalScale(15),
        color: '#333',
        textAlign: 'center',
    },
    description: {
        fontSize: moderateScale(16),
        marginTop: verticalScale(5),
        color: '#555',
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        maxWidth: moderateScale(400),
        flexDirection: 'column', // Arrange buttons vertically
        alignItems: 'stretch', // Make buttons stretch to full width
        marginTop: verticalScale(20),
    },
    blueButton: {
        backgroundColor: '#0056b3',
        paddingVertical: verticalScale(12),
        paddingHorizontal: moderateScale(30),
        borderRadius: moderateScale(15),
        marginBottom: verticalScale(10), // Add margin between buttons
    },
    blueButtonText: {
        color: 'white',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default SisiLuarShelter;