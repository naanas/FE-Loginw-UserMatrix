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
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from 'react-native-image-resizer'; // Import ImageResizer
import { Spot } from '../../types/user';
import useUserStore from '../../stores/userStores';


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
    scrollContainer: {
        alignItems: 'center',
        paddingBottom: 20,
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
        width: '48%', // Adjusted width
        borderRadius: moderateScale(5),
        padding: moderateScale(12),
        alignItems: 'center',
    },
    saveButton: { // Style for the Save button
        backgroundColor: '#ddd',
        width: '48%', // Adjusted width
        borderRadius: moderateScale(5),
        padding: moderateScale(12),
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: moderateScale(16),
        color: '#555',
    },
    saveButtonText: {
        fontSize: moderateScale(16),
        color: '#555',
    },
    borderedPlusButton: {
        borderWidth: 1,
        borderColor: '#555',
    },
    buttonContainer: {
        width: '100%',
        marginTop: verticalScale(10),
        flexDirection: 'row', // Added to arrange buttons horizontally
        justifyContent: 'space-between', // Added to space buttons evenly
    },
     disabledPlusButton: {
        backgroundColor: '#eee', // or any other style to indicate it's disabled
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
        backgroundColor: '#888',
    },
});

const CreateReportScreen = () => {
    const route = useRoute();
    const {spot} = route.params as {spot: Spot};
    const spotId = spot.id

    const token = useUserStore((state) => state.token);

    const navigation = useNavigation();
    const [photosBefore, setPhotosBefore] = useState([]);
    const [photosAfter, setPhotosAfter] = useState([]);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
    const [afterButtonDisabled, setAfterButtonDisabled] = useState(true);
    const expiryTime = 30; // Default expiry time in minutes (30 seconds)
    const [beforePhotosTaken, setBeforePhotosTaken] = useState(false);

    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'App Camera Permission',
                    message: 'App needs access to your camera so you can take awesome pictures.',
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

    const generateRandomFileName = (type, fileExtension = 'jpg') => {
        const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return `${type}_${randomString}.${fileExtension}`;
    };

   const takePhoto = async (type, index) => {
       if (type === 'before' && beforePhotosTaken[index]) {
           Alert.alert('Info', `Cannot retake Photo Before #${index + 1} after taking it.`);
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
                       const fileExtension = response.assets[0].type ? response.assets[0].type.split('/')[1] : 'jpg'; // Extract extension from MIME type
                       const randomFileName = generateRandomFileName(type, fileExtension);
   
                       const resizedImage = await ImageResizer.createResizedImage(
                           imageUri,
                           800,
                           600,
                           'JPEG',
                           80,
                           0,
                       );
   
                       const newPhoto = {
                           uri: resizedImage.uri,
                           name: randomFileName,
                           type: response.assets[0].type || 'image/jpeg',
                       };
   
                       if (type === 'before') {
                           const updatedPhotosBefore = [...photosBefore];
                           updatedPhotosBefore[index] = newPhoto;
                           setPhotosBefore(updatedPhotosBefore);
   
                           const updatedBeforePhotosTaken = [...beforePhotosTaken];
                           updatedBeforePhotosTaken[index] = true;
                           setBeforePhotosTaken(updatedBeforePhotosTaken);
                       } else {
                           const updatedPhotosAfter = [...photosAfter];
                           updatedPhotosAfter[index] = newPhoto;
                           setPhotosAfter(updatedPhotosAfter);
                       }
   
                   } catch (resizeError) {
                       console.log('Image Resizer Error: ', resizeError);
                       Alert.alert('Error', 'Failed to resize image. Using original.');
   
                       const fileExtension = response.assets[0].type ? response.assets[0].type.split('/')[1] : 'jpg'; // Extract extension from MIME type
                       const randomFileName = generateRandomFileName(type, fileExtension);
   
                       const newPhoto = {
                           uri: imageUri,
                           name: randomFileName,
                           type: response.assets[0].type || 'image/jpeg',
                       };
   
                       if (type === 'before') {
                           const updatedPhotosBefore = [...photosBefore];
                           updatedPhotosBefore[index] = newPhoto;
                           setPhotosBefore(updatedPhotosBefore);
   
                           const updatedBeforePhotosTaken = [...beforePhotosTaken];
                           updatedBeforePhotosTaken[index] = true;
                           setBeforePhotosTaken(updatedBeforePhotosTaken);
                       } else {
                           const updatedPhotosAfter = [...photosAfter];
                           updatedPhotosAfter[index] = newPhoto;
                           setPhotosAfter(updatedPhotosAfter);
                       }
                   }
               }
           }
       } catch (error) {
           console.error('Error launching camera: ', error);
           Alert.alert('Error', 'Failed to launch camera. Please try again.');
       }
   };

    const handleSave = async () => {

        try {
            const now = new Date();
            const expiryDate = new Date(now.getTime() + expiryTime * 60000); // Add expiryTime in minutes to current time

            const saveData = {
                photosBefore: photosBefore,
                photosAfter: photosAfter,
                description: description,
                expiryDate: expiryDate.toISOString(),
            };
            await AsyncStorage.setItem('grillScreenData', JSON.stringify(saveData));
            Alert.alert('Saved', 'Data saved successfully!');
        } catch (error) {
            console.error('Error saving data:', error);
            Alert.alert('Error', 'Failed to save data.');
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('status', 'todo');
            formData.append('spotId', spotId); // Use the extracted spotId
            formData.append('description', description);
            formData.append('category', 'cleanliness');

            photosBefore.forEach((photo, index) => {
                if (photo) {
                    formData.append(`photosBefore`, {  // Appending each "before" photo
                        uri: Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", ""),
                        type: photo.type,
                        name: photo.name,
                    });
                }
            });

            photosAfter.forEach((photo, index) => {
                if (photo) {
                    formData.append(`photosAfter`, {  // Appending each "after" photo
                        uri: Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", ""),
                        type: photo.type,
                        name: photo.name,
                    });
                }
            });

            const response = await fetch('https://ptm-tracker-service.onrender.com/api/v1/report/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('Data berhasil dikirim:', responseData);
                Alert.alert('Sukses', 'Data berhasil dikirim!');

                setPhotosBefore([null, null, null]);
                setPhotosAfter([null, null, null]);
                setDescription('');
                setBeforePhotosTaken([false, false, false]); // Reset the state
            } else {
                console.error('Gagal mengirim data:', responseData);
                Alert.alert('Error', `Gagal mengirim data: ${responseData.message || 'Silakan coba lagi.'}`); // Display the error message from the backend
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Terjadi kesalahan saat mengirim data.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
         const loadSavedData = async () => {
            try {
                const savedData = await AsyncStorage.getItem('grillScreenData');
                if (savedData) {
                    const parsedData = JSON.parse(savedData);

                    if (parsedData.expiryDate) {
                        const expiryDate = new Date(parsedData.expiryDate);
                        if (expiryDate > new Date()) {
                            setPhotosBefore(parsedData.photosBefore);
                            setPhotosAfter(parsedData.photosAfter);
                            setDescription(parsedData.description);
                        } else {
                            await AsyncStorage.removeItem('grillScreenData');
                            Alert.alert('Info', 'Saved data has expired and was removed.');
                        }
                    } else {
                        await AsyncStorage.removeItem('grillScreenData');
                        Alert.alert('Info', 'Saved data has no expiry date and was removed.');
                    }
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        };

        if (Platform.OS === 'android') {
            requestCameraPermission();
        }
        loadSavedData();
    }, []);

    useEffect(() => {
        setAfterButtonDisabled(!photosBefore);
        setSubmitButtonDisabled(!photosBefore || !photosAfter || !description);
    }, [photosBefore, photosAfter, description]);

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
                        <View style={styles.photoContainer}>
                                <Text style={styles.cardLabel}>Photo Before</Text>
                            {photosBefore.map((photo, index) => (
                                <View key={index} style={styles.photoButtonWrapper}>
                                    <TouchableOpacity
                                        style={[styles.plusButton, styles.borderedPlusButton]}
                                        onPress={() => takePhoto('before', index)}
                                        disabled={beforePhotosTaken[index]} // Disable if already taken
                                    >
                                        {photo ? (
                                            <Image source={{ uri: photo.uri }} style={styles.image} />
                                        ) : (
                                            <Text style={styles.plusButtonText}>+</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <View style={styles.photoContainer}>
                            <Text style={styles.cardLabel}>Photo After</Text>
                            {photosAfter.map((photo, index) => (
                                <View key={index} style={styles.photoButtonWrapper}>
                                    <TouchableOpacity
                                        style={[
                                            styles.plusButton,
                                            styles.borderedPlusButton,
                                            afterButtonDisabled && styles.disabledPlusButton, // Apply disabled style
                                        ]}
                                        onPress={() => takePhoto('after', index)}
                                        disabled={afterButtonDisabled}
                                    >
                                        {photo ? (
                                            <Image source={{ uri: photo.uri }} style={styles.image} />
                                        ) : (
                                            <Text style={styles.plusButtonText}>+</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                <TextInput
                    style={styles.inputField}
                    placeholder="Deskripsi"
                    value={description}
                    onChangeText={setDescription}
                />

                <View style={styles.buttonContainer}>
                        <TouchableOpacity
                        style={[styles.saveButton]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.submitButton, submitButtonDisabled && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={submitButtonDisabled || isLoading}
                    >
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>

                    {isLoading && <ActivityIndicator size="small" color="#0000ff" />}
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
    );
};

export default CreateReportScreen;