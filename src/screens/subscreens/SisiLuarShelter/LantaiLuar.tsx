import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
    TextInput
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

const GrillScreen = () => {
    const navigation = useNavigation();

    const handleGoBack = () => {
        navigation.goBack();
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
            <View style={styles.heroSection}>
                    <Text style={styles.takePhotoButtonText}>Take Photo</Text>
                        </View>
            <View style={styles.container}>
                {/* Photo Section */}
                <View style={styles.photoSection}>
                    <View style={styles.photoRow}>
                        <TouchableOpacity style={[styles.plusButton, styles.borderedPlusButton]}>
                            <Text style={styles.plusButtonText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.plusButton, styles.borderedPlusButton]}>
                            <Text style={styles.plusButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.photoRow}>
                        <TouchableOpacity style={[styles.plusButton, styles.borderedPlusButton]}>
                            <Text style={styles.plusButtonText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.plusButton, styles.borderedPlusButton]}>
                            <Text style={styles.plusButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.photoRow}>
                        <TouchableOpacity style={[styles.plusButton, styles.borderedPlusButton]}>
                            <Text style={styles.plusButtonText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.plusButton, styles.borderedPlusButton]}>
                            <Text style={styles.plusButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Input Fields */}
                <TextInput
                    style={styles.inputField}
                    placeholder="Lokasi"
                />
                <TextInput
                    style={styles.inputField}
                    placeholder="Deskripsi"
                />

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.tempSaveButton}>
                        <Text style={styles.tempSaveButtonText}>Simpan Sementara</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Submit</Text>
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
        marginTop: 10,
        alignItems: 'center',
        padding: moderateScale(20),
    },
    photoSection: {
        width: '100%',
        backgroundColor: '#f0f0f0',
        borderRadius: moderateScale(10),
        padding: moderateScale(10),
        marginBottom: verticalScale(20),
    },
    photoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: verticalScale(10),
    },
    plusButton: {
        backgroundColor: '#ddd',
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusButtonText: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#555',
    },
    takePhotoButton: {
        backgroundColor: '#ddd',
        width: moderateScale(150),
        height: moderateScale(40),
        borderRadius: moderateScale(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    takePhotoButtonText: {
        fontSize: moderateScale(16),
        color: 'white',
    },
    inputField: {
        width: '100%',
        backgroundColor: '#f0f0f0',
        borderRadius: moderateScale(5),
        padding: moderateScale(10),
        marginBottom: verticalScale(10),
    },
    submitButton: {
        backgroundColor: '#ddd',
        width: '48%',
        borderRadius: moderateScale(5),
        padding: moderateScale(12),
        alignItems: 'center',
        marginLeft: moderateScale(5),
    },
    submitButtonText: {
        fontSize: moderateScale(16),
        color: '#555',
    },
    tempSaveButton: {
        backgroundColor: '#ddd',
        width: '48%',
        borderRadius: moderateScale(5),
        padding: moderateScale(12),
        alignItems: 'center',
        marginRight: moderateScale(5),
    },
    tempSaveButtonText: {
        fontSize: moderateScale(16),
        color: '#555',
    },
    borderedPlusButton: {
        borderWidth: 1,
        borderColor: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: verticalScale(10),
    },
        heroSection: {
             color: '#555',
        marginTop: 100,
        alignItems: 'center', // Center items horizontally
    },
});

export default GrillScreen;