import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image,
    Alert,
    Platform,
    PermissionsAndroid,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from 'react-native-image-resizer';

const { width, height } = Dimensions.get('window');

// Responsive Design Helpers (customize as needed)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

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
    scrollContainer: { // Style for ScrollView content
        alignItems: 'center',
        paddingBottom: 20, // Add some padding at the bottom
    },
    container: {
        width: '100%',
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
        width: moderateScale(140),
        height: moderateScale(110),
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
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: moderateScale(5),
    },
    photoContainer: {
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#555',
        marginBottom: verticalScale(5),
        textAlign: 'center',
    },
    disabledButton: {
        backgroundColor: '#888', // Greyed out color
    },
    checkStorageButton: {
        backgroundColor: '#4CAF50',
        padding: moderateScale(12),
        borderRadius: moderateScale(5),
        alignItems: 'center',
        marginTop: verticalScale(10),
    },
    checkStorageButtonText: {
        fontSize: moderateScale(16),
        color: 'white',
    },
    disabledPlusButton: {  // Style for disabled plus buttons
        backgroundColor: '#eee',
        borderColor: '#999',
    },
    disabledPlusButtonText: {  // Style for disabled plus button text
        color: '#999',
    },
});

const GrillScreen = () => {
    const navigation = useNavigation();
    const [imageUris, setImageUris] = useState(Array(6).fill(null));
    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
    const [lokasi, setLokasi] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isTempSaved, setIsTempSaved] = useState(false); // New state to track if images are temporarily saved
    const [photoDisabled, setPhotoDisabled] = useState(Array(6).fill(false)); // Track disabled state for each photo

    useEffect(() => {
        if (Platform.OS === 'android') {
            requestCameraPermission();
        }
        loadImages();
    }, []);

    useEffect(() => {
        const hasImages = imageUris.some(uri => uri !== null);
        setIsSaveButtonDisabled(!hasImages);
    }, [imageUris]);

    useEffect(() => {
        const isLokasiFilled = lokasi.trim() !== '';
        const isDeskripsiFilled = deskripsi.trim() !== '';
        const areAllPhotosTaken = imageUris.every(uri => uri !== null);

        setIsSubmitButtonDisabled(!(isLokasiFilled && isDeskripsiFilled && areAllPhotosTaken));
    }, [lokasi, deskripsi, imageUris]);

    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'App Camera Permission',
                    message: 'App needs access to your camera ' +
                        'so you can take awesome pictures.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('You can use the camera');
            } else {
                console.log('Camera permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

   const takePhoto = async (index) => {
        if (isTempSaved && photoDisabled[index]) {
            Alert.alert('Info', 'Cannot replace this image after saving temporarily.');
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 200,
            maxWidth: 200,
        };

        try {
            const response = await launchCamera(options);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                Alert.alert('Error', 'Failed to capture image. Please try again.');
            } else {
                let imageUri = response.assets && response.assets[0]?.uri;
                if (imageUri) {
                    try {
                        const resizedImage = await ImageResizer.createResizedImage(
                            imageUri,
                            800,
                            600,
                            'JPEG',
                            80,
                            0,
                        );
                        const newImageUris = [...imageUris];
                        newImageUris[index] = resizedImage.uri;
                        setImageUris(newImageUris);

                    } catch (resizeError) {
                        console.log('Image Resizer Error: ', resizeError);
                        Alert.alert('Error', 'Failed to resize image. Using original.');
                        const newImageUris = [...imageUris];
                        newImageUris[index] = imageUri;
                        setImageUris(newImageUris);
                    }
                }
            }
        } catch (error) {
            console.error('Error launching camera: ', error);
            Alert.alert('Error', 'Failed to launch camera. Please try again.');
        }
    };


    const saveImages = async () => {
        try {
            const now = new Date().getTime();
            const data = {
                imageUris: imageUris,
                timestamp: now,
            };
            const jsonValue = JSON.stringify(data);
            await AsyncStorage.setItem('savedImages', jsonValue);
            Alert.alert('Images Saved', 'Images saved successfully!');
            setIsTempSaved(true);
            // Disable all photo containers after temp save
            setPhotoDisabled(Array(6).fill(true));
        } catch (e) {
            console.error('Error saving images:', e);
            Alert.alert('Error', 'Failed to save images.');
        }
    };

    const loadImages = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('savedImages');
            if (jsonValue != null) {
                const data = JSON.parse(jsonValue);
                const savedTimestamp = data.timestamp;
                const now = new Date().getTime();
                const expirationTime = 30 * 60 * 1000;

                if (now - savedTimestamp < expirationTime) {
                    setImageUris(data.imageUris);
                     setPhotoDisabled(data.imageUris.map(uri => uri !== null)); // Disable if there's a URI
                    setIsTempSaved(true);
                } else {
                    setImageUris(Array(6).fill(null));
                    await AsyncStorage.removeItem('savedImages');
                    console.log('Saved images expired and cleared.');
                    setIsTempSaved(false);
                    setPhotoDisabled(Array(6).fill(false)); // Enable all if expired
                }
            }
        } catch (e) {
            console.error('Error loading images:', e);
        }
    };

    const getAllAsyncStorageData = async () => {
        let keys = [];
        try {
            keys = await AsyncStorage.getAllKeys();
        } catch (e) {
            console.log('Error getting all keys: ', e);
        }

        let result = [];
        try {
            result = await AsyncStorage.multiGet(keys);
        } catch (e) {
            console.log('Error getting data: ', e);
        }

        console.log(result);
        Alert.alert(
            'AsyncStorage Contents',
            JSON.stringify(result),
        );
    };

     const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const sessionData = await AsyncStorage.getItem('userToken');
             console.log('Session Data:', sessionData);

            if (!sessionData) {
                Alert.alert('Error', 'Session data not found. Please login again.');
                setIsLoading(false);
                return;
            }

            let session;
            try {
                session = sessionData;
                 console.log('Parsed Session Data:', session);
            } catch (e) {
                console.error('Error parsing session data:', e);
                Alert.alert('Error', 'Failed to parse session data. Please login again.');
                setIsLoading(false);
                return;
            }

            const sessionToken = session;

            if (!sessionToken) {
                Alert.alert('Error', 'Token not found in session data. Please login again.');
                setIsLoading(false);
                return;
            }

            // Get User Data
             const userDataString = await AsyncStorage.getItem('userData');
             console.log('User Data String:', userDataString);
              let userData = null;
              if (userDataString) {
                try {
                  userData = JSON.parse(userDataString);
                   console.log('Parsed User Data:', userData);
                } catch (e) {
                  console.error('Error parsing user data:', e);
                  Alert.alert('Error', 'Failed to parse user data.');
                  setIsLoading(false);
                  return;
                }
              }

           // Get Spot ID from User Data
            let spotId = ''; // Default empty
            if (userData && userData.user && userData.user.spots && userData.user.spots[0] && userData.user.spots[0].id) {
              spotId = userData.user.spots[0].id;
              console.log('Spot ID:', spotId);
            } else {
              console.warn('Spot ID not found in user data.');
              Alert.alert('Error', 'Spot ID not found, try to re-login.');
               setIsLoading(false);
               return;
            }

            const payload = new FormData();

            payload.append('status', 'todo');
             console.log('Status:', 'todo');
            payload.append('spotId', spotId);
            console.log('Spot ID:', spotId);
           if (deskripsi) {
                payload.append('description', deskripsi); // Use state value
                console.log('Description:', deskripsi);
            }
            payload.append('category', 'cleanliness');
             console.log('Category:', 'cleanliness');

            const appendImage = (uri, fieldName) => {
                if (uri) {
                    const filename = uri.split('/').pop();
                    const match = /\.(jpe?g|png|gif)$/i.exec(filename);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;
                    payload.append(fieldName, {
                        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
                        type: type,
                        name: filename || `${fieldName}.jpg`,
                    });
                     console.log(`Appended image ${fieldName}:`, uri);
                }
            };

            // Conditionally append images based on existence
            if (imageUris[1]) appendImage(imageUris[1], 'photoBefore');
            if (imageUris[2]) appendImage(imageUris[2], 'photoAfter');

            console.log('Payload being sent:', payload);

            const response = await fetch('https://ptm-tracker-service.onrender.com/api/v1/report/create', {
                method: 'POST',
                body: payload,
                 headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP error:', response.status, errorText);
                Alert.alert('HTTP Error', `Request failed with status ${response.status}: ${errorText}`);
                setIsLoading(false);
                return;
            }

            const responseData = await response.json();
            console.log('Response from server: ', responseData);

            Alert.alert(
                'Submission Successful',
                `Data submitted successfully!`
            );

            setImageUris(Array(6).fill(null));
            setLokasi('');
            setDeskripsi('');

        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Fetch Error', `Failed to submit data: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const labels = ['Photo Issue', 'Photo Before', 'Photo After', 'Photo Extra 1', 'Photo Extra 2', 'Photo Extra 3'];

    return (
        <SafeAreaView style={styles.safeArea}>
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
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <View style={styles.photoSection}>
                        <View style={styles.photoRow}>
                            {[0, 1].map(index => (
                                <View key={index} style={styles.photoContainer}>
                                    <Text style={styles.cardLabel}>{labels[index]}</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.plusButton,
                                            styles.borderedPlusButton,
                                            (isTempSaved && photoDisabled[index]) ? styles.disabledPlusButton : null,
                                        ]}
                                        onPress={() => takePhoto(index)}
                                        disabled={isTempSaved && photoDisabled[index]}
                                    >
                                        {imageUris[index] ? (
                                            <Image source={{ uri: imageUris[index] }} style={styles.image} />
                                        ) : (
                                            <Text style={[
                                                styles.plusButtonText,
                                                (isTempSaved && photoDisabled[index]) ? styles.disabledPlusButtonText : null,
                                            ]}>+</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <View style={styles.photoRow}>
                            {[2, 3].map(index => (
                                <View key={index} style={styles.photoContainer}>
                                    <Text style={styles.cardLabel}>{labels[index]}</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.plusButton,
                                            styles.borderedPlusButton,
                                            (isTempSaved && photoDisabled[index]) ? styles.disabledPlusButton : null,
                                        ]}
                                        onPress={() => takePhoto(index)}
                                        disabled={isTempSaved && photoDisabled[index]}
                                    >
                                        {imageUris[index] ? (
                                            <Image source={{ uri: imageUris[index] }} style={styles.image} />
                                        ) : (
                                            <Text style={[
                                                styles.plusButtonText,
                                                (isTempSaved && photoDisabled[index]) ? styles.disabledPlusButtonText : null,
                                            ]}>+</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <View style={styles.photoRow}>
                            {[4, 5].map(index => (
                                <View key={index} style={styles.photoContainer}>
                                    <Text style={styles.cardLabel}>{labels[index]}</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.plusButton,
                                            styles.borderedPlusButton,
                                            (isTempSaved && photoDisabled[index]) ? styles.disabledPlusButton : null,
                                        ]}
                                        onPress={() => takePhoto(index)}
                                        disabled={isTempSaved && photoDisabled[index]}
                                    >
                                        {imageUris[index] ? (
                                            <Image source={{ uri: imageUris[index] }} style={styles.image} />
                                        ) : (
                                            <Text style={[
                                                styles.plusButtonText,
                                                (isTempSaved && photoDisabled[index]) ? styles.disabledPlusButtonText : null,
                                            ]}>+</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    <TextInput
                        style={styles.inputField}
                        placeholder="Lokasi"
                        value={lokasi}
                        onChangeText={setLokasi}
                    />
                    <TextInput
                        style={styles.inputField}
                        placeholder="Deskripsi"
                        value={deskripsi}
                        onChangeText={setDeskripsi}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.tempSaveButton,
                                isSaveButtonDisabled && styles.disabledButton
                            ]}
                            onPress={saveImages}
                            disabled={isSaveButtonDisabled}
                        >
                            <Text style={styles.tempSaveButtonText}>Simpan Sementara</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isSubmitButtonDisabled && styles.disabledButton
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitButtonDisabled || isLoading}
                        >
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                        {isLoading && <ActivityIndicator size="small" color="#0000ff" />}
                    </View>
                    <TouchableOpacity style={styles.checkStorageButton} onPress={getAllAsyncStorageData}>
                        <Text style={styles.checkStorageButtonText}>Check AsyncStorage</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default GrillScreen;