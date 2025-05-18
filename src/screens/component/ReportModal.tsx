import React, { useState, useCallback } from 'react';
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
    Alert
} from 'react-native';
import { BlurView } from '@react-native-community/blur';


// Responsive Design Helpers
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const ReportModal = ({ modalVisible, selectedReport, comment, setComment, closeModal, handleSendComment }) => {
    const [imageSources, setImageSources] = useState([
        require('../../assets/assetsmodals/beforedrum.jpg'),
        require('../../assets/assetsmodals/afterdrum.jpg'),
        require('../../assets/assetsmodals/beforedebu.jpg'),
        require('../../assets/assetsmodals/afterdebu.jpg'),
        require('../../assets/assetsmodals/beforengemper.jpg'),
        require('../../assets/assetsmodals/afterngemper.jpg')],
    );
    const [selectedImage, setSelectedImage] = useState(null);

    const openImage = useCallback((source) => {
        setSelectedImage(source);
    }, []);

    const closeImage = useCallback(() => {
        setSelectedImage(null);
    }, []);

    const downloadImage = useCallback(async (uri) => {
        try {
            // Check if the URI is a local file path or a network URL
            if (uri.startsWith('http')) {
                // For network URLs, you can directly use Linking
                Linking.openURL(uri);
            } else {
                // For local URIs (e.g., from require), you might need a different approach
                // You can copy the file to a temporary directory and then share/download it
                Alert.alert('Download', 'Downloading local images is not directly supported. You may need additional libraries.');
            }
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
                        {selectedReport && (
                            <>
                                {/* Image Section */}
                                <View style={styles.imageSection}>
                                    <Text style={styles.sectionTitle}>Before & After</Text>
                                    <View style={styles.imageGridContainer}>
                                        <View style={styles.columnLabels}>
                                            <Text style={styles.columnLabelText}>Before</Text>
                                            <Text style={styles.columnLabelText}>After</Text>
                                        </View>
                                        {imageSources.map((source, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.imageSlot}
                                                onPress={() => openImage(source)}
                                            >
                                                <Image
                                                    source={source}
                                                    style={styles.image}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Divider Line */}
                                <View style={styles.divider} />

                                {/* Modified Report Details Section */}
                                {renderReportItem("ID", selectedReport.id)}
                                {renderReportItem("Reporter", selectedReport.reporter || selectedReport.Reporter)}
                                {renderReportItem("Location", selectedReport.location)}
                                {renderReportItem("Description", selectedReport.description)}
                                {renderReportItem("Category", selectedReport.category)}
                                {renderReportItem("Created At", selectedReport.createdAt)}

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
                            source={selectedImage}
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
        justifyContent: 'space-between', // Changed to space-between
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
        width: '48%', // Adjusted width for 2 columns with slight spacing
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
    formRow: {
        marginBottom: verticalScale(10),
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#BDBDBD',
        paddingBottom: verticalScale(5),
    },
    formLabel: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#333',
        width: '35%',
        paddingRight: scale(5),
    },
    formValueLabel: {
        fontSize: moderateScale(16),
        color: '#333',
        marginBottom: verticalScale(5),
    },
    formValue: {
        fontSize: moderateScale(16),
        color: '#555',
        width: '65%',
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
        zIndex: 10, // Pastikan tombol berada di atas elemen lain
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
        color: '#333',
        width: '35%', // Set a fixed width for the label
    },
    reportItemValue: {
        fontSize: moderateScale(16),
        color: '#555',
        flex: 1, // Allow the value to take up remaining space
        marginLeft: scale(20), // Add some left margin for spacing
    },
});

export default ReportModal;