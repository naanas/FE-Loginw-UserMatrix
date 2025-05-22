import React, { useState, useCallback, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    Linking,
    Alert,
    ActivityIndicator
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const API_ENDPOINT = 'https://ptm-tracker-service.onrender.com/api/v1';

const ReportModal = ({ modalVisible, selectedReport, comment, setComment, closeModal, handleSendComment }) => {
    const [reportDetails, setReportDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [signedImageUrls, setSignedImageUrls] = useState({});

    const fetchSignedImageUrl = useCallback(async (imageKey) => {
        try {
            const authToken = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${API_ENDPOINT}/image/signed-url?key=${imageKey}`, { // Adjust endpoint if needed
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch signed URL for ${imageKey}: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Signed URL for ${imageKey}:`, data.url); // Log the URL
            return data.url;
        } catch (error) {
            console.error(`Error fetching signed URL for ${imageKey}:`, error);
            return null;
        }
    }, []);

    const fetchReportDetails = useCallback(async (reportId) => {
        setLoading(true);
        setError(null);
        try {
            const authToken = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${API_ENDPOINT}/report/${reportId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch report details: ${response.status}`);
            }

            const data = await response.json();
            console.log('Report Details:', data);
            setReportDetails(data.data);
        } catch (error) {
            console.error('Error fetching report details:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedReport && selectedReport.id) {
            fetchReportDetails(selectedReport.id);
        }
    }, [selectedReport, fetchReportDetails]);

    useEffect(() => {
        const loadSignedUrls = async () => {
            if (reportDetails && reportDetails.photoBefore && reportDetails.photoAfter) {
                const beforeUrls = {};
                for (const photo of reportDetails.photoBefore) {
                    const url = await fetchSignedImageUrl(photo);
                    if (url) {
                        beforeUrls[photo] = url;
                    }
                }

                const afterUrls = {};
                for (const photo of reportDetails.photoAfter) {
                    const url = await fetchSignedImageUrl(photo);
                    if (url) {
                        afterUrls[photo] = url;
                    }
                }

                setSignedImageUrls({
                    photoBefore: beforeUrls,
                    photoAfter: afterUrls,
                });
            }
        };

        loadSignedUrls();
    }, [reportDetails, fetchSignedImageUrl]);

    const openImage = useCallback((source) => {
        setSelectedImage(source);
    }, []);

    const closeImage = useCallback(() => {
        setSelectedImage(null);
    }, []);

    const downloadImage = useCallback(async (uri) => {
        try {
            Linking.openURL(uri);
        } catch (error) {
            console.error('Error downloading image:', error);
            Alert.alert('Error', 'Could not download image.');
        }
    }, []);

    const renderReportItem = (label, value) => (
        <View style={styles.reportItemContainer}>
            <Text style={styles.reportItemLabel}>{label}</Text>
            <Text style={styles.reportItemValue}>{value}</Text>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
        >
            <View style={styles.modalOverlay}>
                <BlurView
                    style={styles.blurView}
                    blurType="light"
                    blurAmount={10}
                    reducedTransparencyFallbackColor="white"
                />
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Report Details</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {loading && <ActivityIndicator size="large" color="#e4572e" />}
                        {error && <Text style={{ color: 'red' }}>Error: {error.message}</Text>}

                        {reportDetails ? (
                            <>
                                {/* Image Section */}
                                <View style={styles.imageSection}>
                                    <Text style={styles.sectionTitle}>Before & After</Text>
                                    <View style={styles.imageGridContainer}>
                                        <View style={styles.columnLabels}>
                                            <Text style={styles.columnLabelText}>Before</Text>
                                            <Text style={styles.columnLabelText}>After</Text>
                                        </View>
                                        {/* Display Before Images */}
                                        {reportDetails.photoBefore && reportDetails.photoBefore.map((photo, index) => {
                                            const signedUrl = signedImageUrls.photoBefore && signedImageUrls.photoBefore[photo];
                                            return (
                                                <TouchableOpacity
                                                    key={`before-${index}`}
                                                    style={styles.imageSlot}
                                                    onPress={() => openImage(signedUrl)}
                                                >
                                                    {signedUrl ? (
                                                        <Image
                                                            source={{ uri: signedUrl }}
                                                            style={styles.image}
                                                        />
                                                    ) : (
                                                        <ActivityIndicator color="#e4572e" />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}

                                        {/* Display After Images */}
                                        {reportDetails.photoAfter && reportDetails.photoAfter.map((photo, index) => {
                                            const signedUrl = signedImageUrls.photoAfter && signedImageUrls.photoAfter[photo];
                                            return (
                                                <TouchableOpacity
                                                    key={`after-${index}`}
                                                    style={styles.imageSlot}
                                                    onPress={() => openImage(signedUrl)}
                                                >
                                                    {signedUrl ? (
                                                        <Image
                                                            source={{ uri: signedUrl }}
                                                            style={styles.image}
                                                        />
                                                    ) : (
                                                        <ActivityIndicator color="#e4572e" />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* Divider Line */}
                                <View style={styles.divider} />

                                {/* Report Details Section */}
                                {renderReportItem("ID", reportDetails.id)}
                                {renderReportItem("Reporter", reportDetails.createdBy || 'N/A')}
                                {renderReportItem("Location", reportDetails.spotName || 'N/A')}
                                {renderReportItem("Description", reportDetails.description)}
                                {renderReportItem("Category", reportDetails.category)}
                                {renderReportItem("Created At", reportDetails.createdAt)}

                                <View style={styles.commentSection}>
                                    <Text style={styles.commentTitle}>Add Comment:</Text>
                                    <TextInput
                                        style={styles.commentInput}
                                        placeholder="Write your comment here..."
                                        placeholderTextColor="#757575"
                                        value={comment}
                                        onChangeText={setComment}
                                        multiline={true}
                                        textAlignVertical="top"
                                    />
                                </View>
                            </>
                        ) : (
                            <Text>No report selected.</Text>
                        )}
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSendComment}
                        >
                            <Text style={styles.sendButtonText}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeModal}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Full Screen Image Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={selectedImage !== null}
                onRequestClose={closeImage}
            >
                <View style={styles.fullScreenOverlay}>
                    <BlurView
                        style={styles.fullScreenBlur}
                        blurType="dark"
                        blurAmount={20}
                        reducedTransparencyFallbackColor="black"
                    />
                    <View style={styles.fullScreenContainer}>
                        <TouchableOpacity
                            style={styles.closeButtonFullScreen}
                            onPress={closeImage}
                        >
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={() => downloadImage(selectedImage)}
                        >
                            <Text style={styles.downloadButtonText}>Download</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(8),
        margin: moderateScale(20),
        padding: moderateScale(35),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: moderateScale(4),
        elevation: 5,
        width: '90%',
        maxHeight: '90%',
    },
    modalTitle: {
        marginBottom: verticalScale(20),
        textAlign: 'center',
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#e4572e',
    },
    imageSection: {
        marginBottom: verticalScale(20),
        width: '100%',
    },
    sectionTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: verticalScale(10),
        textAlign: 'center',
    },
    imageGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: '100%',
    },
    columnLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: scale(10),
        marginBottom: verticalScale(5),
    },
    columnLabelText: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#555',
        width: '50%',
        textAlign: 'center',
    },
    imageSlot: {
        width: '45%',
        height: verticalScale(100),
        marginBottom: verticalScale(10),
        borderRadius: moderateScale(8),
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#BDBDBD',
        marginBottom: verticalScale(20),
    },
    reportItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#BDBDBD',
    },
    reportItemLabel: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#333',
        width: '35%',
    },
    reportItemValue: {
        fontSize: moderateScale(16),
        color: '#555',
        flex: 1,
        marginLeft: scale(20),
    },
    commentSection: {
        marginTop: verticalScale(25),
    },
    commentTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: verticalScale(10),
    },
    commentInput: {
        width: '100%',
        minHeight: verticalScale(120),
        borderColor: '#BDBDBD',
        borderWidth: 1,
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        fontSize: moderateScale(16),
        color: '#333',
        backgroundColor: '#FAFAFA',
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: verticalScale(20),
        width: '100%',
    },
    sendButton: {
        borderRadius: moderateScale(10),
        paddingVertical: verticalScale(12),
        paddingHorizontal: moderateScale(20),
        elevation: 2,
        backgroundColor: '#4CAF50',
    },
    sendButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: moderateScale(16),
        textAlign: "center",
    },
    closeButton: {
        borderRadius: moderateScale(10),
        paddingVertical: verticalScale(12),
        paddingHorizontal: moderateScale(20),
        elevation: 2,
        backgroundColor: '#e4572e',
    },
    closeButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: moderateScale(16),
        textAlign: "center",
    },
    fullScreenOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    fullScreenBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    fullScreenContainer: {
        alignItems: 'center',
    },
    fullScreenImage: {
        width: width * 0.9,
        height: height * 0.7,
    },
    closeButtonFullScreen: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: moderateScale(15),
        padding: moderateScale(10),
        zIndex: 10,
    },
    downloadButton: {
        marginTop: verticalScale(20),
        backgroundColor: '#4CAF50',
        paddingVertical: verticalScale(12),
        paddingHorizontal: moderateScale(20),
        borderRadius: moderateScale(10),
    },
    downloadButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: moderateScale(16),
        textAlign: "center",
    },
    reportItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#BDBDBD',
    },
    reportItemLabel: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#333',
        width: '35%',
    },
    reportItemValue: {
        fontSize: moderateScale(16),
        color: '#555',
        flex: 1,
        marginLeft: scale(20),
    },
});

export default ReportModal;