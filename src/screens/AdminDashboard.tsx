import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Animated,
    RefreshControl,
    TouchableWithoutFeedback,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportModal from './component/ReportModal';
import ButtonNavigation from './component/BottomNavigationBar';
import Header from '../screens/component/Header';
import Sidebar from '../screens/component/Sidebar';
import useUserStore from '../stores/userStores';

const menuIcon = require('../assets/menu.png');

const { width, height } = Dimensions.get('window');


const API_ENDPOINT = 'https://ptm-tracker-service.onrender.com/api/v1'; // Replace with your actual API endpoint
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const ReportCard = ({ report, onPress }) => (
    <TouchableOpacity onPress={onPress}>
        <View style={styles.reportCard}>
            <View style={styles.reportTextContainer}>
                <Text style={styles.reportText}>ID: {report.id}</Text>
                <View style={styles.transparentCard} />
            </View>

            <View style={styles.reportTextContainer}>
                <Text style={styles.reportText}>Reporter: {report.createdBy || 'N/A'}</Text>
                <View style={styles.transparentCard} />
            </View>

            <View style={styles.reportTextContainer}>
                <Text style={styles.reportText}>Location: {report.spotName || 'N/A'}</Text>
                <View style={styles.transparentCard} />
            </View>

            <View style={styles.reportTextContainer}>
                <Text style={styles.reportText}>Description: {report.description}</Text>
                <View style={styles.transparentCard} />
            </View>

            <View style={styles.reportTextContainer}>
                <Text style={styles.reportText}>Category: {report.category}</Text>
                <View style={styles.transparentCard} />
            </View>

             <View style={styles.reportTextContainer}>
                <Text style={styles.reportText}>Created At: {report.createdAt}</Text>
                <View style={styles.transparentCard} />
            </View>

            {/* Display Photo Before Images */}
            
        </View>
    </TouchableOpacity>
);

const AdminDashboard = () => {
    const toket = useUserStore((state) => state.token);
    const navigation = useNavigation();
    const scrollViewRef = useRef();
    const [scrollX] = useState(new Animated.Value(0));
    const [refreshing, setRefreshing] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [comment, setComment] = useState('');
    const [selectedTab] = useState('Home');
    const [sidebarAnimation] = useState(new Animated.Value(0));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const logout = useUserStore(state => state.logout)
    const [kebersihanReports, setKebersihanReports] = useState([]);
    const [keluhanReports, setKeluhanReports] = useState([]);
    const [loadingKebersihan, setLoadingKebersihan] = useState(false);
    const [loadingKeluhan, setLoadingKeluhan] = useState(false);
    const [errorKebersihan, setErrorKebersihan] = useState(null);
    const [errorKeluhan, setErrorKeluhan] = useState(null);


    const openReportModal = (report) => {
        setSelectedReport(report);
        setComment('');
        setModalVisible(true);
    };

    const closeReportModal = () => {
        setSelectedReport(null);
        setModalVisible(false);
    };

    const handleSendComment = () => {
        if (selectedReport) {
            console.log(`Comment "${comment}" sent for Report ID: ${selectedReport.id}`);
            setComment('');
            closeReportModal();
        }
    };

 const fetchData = async (category) => {
    const status = 'todo'; // Assuming 'todo' is the default status
    let page = DEFAULT_PAGE;
    let limit = DEFAULT_LIMIT;
    let setReports, setLoading, setError;

    if (category === 'cleanliness') {
        setReports = setKebersihanReports;
        setLoading = setLoadingKebersihan;
        setError = setErrorKebersihan;
    } else if (category === 'complaint') {
        setReports = setKeluhanReports;
        setLoading = setLoadingKeluhan;
        setError = setErrorKeluhan;
    } else {
        console.error('Invalid category:', category);
        return;
    }

    setLoading(true);
    setError(null);

    try {
        // Construct the URL with the category parameter
        const url = `${API_ENDPOINT}/report/list?page=${page}&limit=${limit}&category=${category}&status=${status}`;

        // Retrieve the authentication token from AsyncStorage
      

        // Define headers, including the authentication token
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${toket}`,
        };
        console.log('Request Headers:', headers);

        // Make the API request
        const response = await fetch(url, { headers });

        // Check if the response was successful
        if (!response.ok) {
            let errorBody;
            try {
                errorBody = await response.json();
            } catch (jsonError) {
                errorBody = { message: `Failed to parse error response: ${jsonError}` };
            }
            const errorMessage = errorBody?.message || `HTTP error! Status: ${response.status} ${response.statusText}`;
            console.error('API Error:', errorMessage);
            setError(new Error(errorMessage));
            throw new Error(errorMessage);
        }

        // Parse the JSON response
        const data = await response.json();
        console.log('API Response Data:', data);

        // **Robustly handle inconsistent API responses**
        let reportData = [];

        if (data && data.data && Array.isArray(data.data)) {
            // Scenario 1: data.data is an array (older format?)
            reportData = data.data;
        } else if (data && data.data && data.data.listData && Array.isArray(data.data.listData)) {
            // Scenario 2: data.data.listData is an array (newer format?)
            reportData = data.data.listData;
        } else {
            // Scenario 3: No data found
            console.warn('API Response: No report data found or invalid format');
            setError(new Error('No report data found or invalid format'));
        }

        // Filter the report data based on category
        const filteredData = reportData.filter(report => report.category === category);
        setReports(filteredData);

    } catch (error) {
        console.error('Error fetching data:', error);
        setError(error);
    } finally {
        setLoading(false);
    }
};

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // No need for setTimeout anymore, fetchData will handle the loading state
        fetchData('cleanliness');
        fetchData('complaint');
        setRefreshing(false); //reset refreshing to false AFTER the data has been fetched
    }, []);

    useEffect(() => {
        fetchData('cleanliness');
        fetchData('complaint');
    }, [refreshing]);

    const navigateToTab = (tabName) => {
        console.log(`Navigating to: ${tabName}`);
    };

    const toggleSidebar = () => {
        const toValue = isSidebarOpen ? 0 : 1;

        Animated.timing(sidebarAnimation, {
            toValue,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsSidebarOpen(!isSidebarOpen);
        });
    };

    const closeSidebar = () => {
      Animated.timing(sidebarAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
      }).start(() => {
          setIsSidebarOpen(false);
      });
    };

   const handleLogout = async () => {
        try {
            logout()
            await AsyncStorage.removeItem('authToken');
            console.log('Auth token removed');
            // Use reset to navigate back to Login and clear the navigation stack
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error removing token:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Header
                toggleSidebar={toggleSidebar}
                menuIcon={menuIcon}
                iconColor="white"
            />
             {/* Render the overlay only when the sidebar is open */}
             {isSidebarOpen && (
                 <TouchableWithoutFeedback onPress={closeSidebar}>
                     <Animated.View style={styles.overlay} />
                 </TouchableWithoutFeedback>
             )}
            <Sidebar
                sidebarAnimation={sidebarAnimation}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={closeSidebar}
                handleLogout={handleLogout} // Pass handleLogout to Sidebar
            />

            <Animated.ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                ref={scrollViewRef}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
            >
                <View style={styles.page}>
                    <Text style={styles.listTitle}>Data Laporan Kebersihan</Text>
                    <ScrollView
                        contentContainerStyle={styles.dataScrollView}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="white"
                            />
                        }
                    >
                        {loadingKebersihan && <ActivityIndicator size="large" color="white" />}
                        {errorKebersihan && <Text style={{ color: 'red' }}>Error: {errorKebersihan.message}</Text>}
                        {kebersihanReports.length > 0 ? (
                            kebersihanReports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onPress={() => openReportModal(report)}
                                />
                            ))
                        ) : (
                            <Text style={{ color: 'white' }}>No Data</Text>
                        )}
                    </ScrollView>
                </View>

                <View style={styles.page}>
                    <Text style={styles.listTitle}>Data Laporan Keluhan</Text>
                    <ScrollView
                         contentContainerStyle={styles.dataScrollView}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="white"
                            />
                        }
                    >
                        {loadingKeluhan && <ActivityIndicator size="large" color="white" />}
                        {errorKeluhan && <Text style={{ color: 'red' }}>Error: {errorKeluhan.message}</Text>}
                        {keluhanReports.length > 0 ? (
                            keluhanReports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onPress={() => openReportModal(report)}
                                />
                            ))
                        ) : (
                            <Text style={{ color: 'white' }}>No Data</Text>
                        )}
                    </ScrollView>
                </View>
            </Animated.ScrollView>

            <ReportModal
                modalVisible={modalVisible}
                selectedReport={selectedReport}
                comment={comment}
                setComment={setComment}
                closeModal={closeReportModal}
                handleSendComment={handleSendComment}
            />

            <ButtonNavigation
                selectedTab={selectedTab}
                navigateToTab={navigateToTab}
            />
        </View>
    );
};

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e4572e',
    },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
        },
    scrollView: {
        flex: 1,
    },
    page: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(0),
        paddingHorizontal: moderateScale(10),
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: moderateScale(20),
        color: 'white',
    },
    listContainer: {
        flex: 1,
        width: '100%',
        padding: moderateScale(10),
    },
    reportCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: moderateScale(8),
        padding: moderateScale(15),
        marginBottom: moderateScale(10),
        width: scale(319),
    },
    reportText: {
        color: 'white',
        fontSize: moderateScale(14),
        marginBottom: verticalScale(3),
    },
      reportTextContainer: {
        marginBottom: verticalScale(3),
        
    },
    transparentCard: {
        backgroundColor: 'transparent',
        height: verticalScale(2),
        width: '100%',
        marginBottom: verticalScale(5),
    },
    listTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: 'white',
        padding: moderateScale(10)
    },
    dataScrollView: {
        flexGrow: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingBottom: verticalScale(20),
    },
});

export default AdminDashboard;