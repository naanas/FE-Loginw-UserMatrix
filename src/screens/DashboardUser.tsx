import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSession } from './SessionContext';
import { useNavigation } from '@react-navigation/native';

const DashboardUser = () => {
  const { clearSession } = useSession();
  const navigation = useNavigation();

  const handleLogout = useCallback(async () => {
    await clearSession();
    navigation.replace('Login');
  }, [clearSession, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Dashboard</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardUser;