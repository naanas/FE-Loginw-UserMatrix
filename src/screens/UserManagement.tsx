// UserManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView, // Use SafeAreaView for better layout on notched devices
  KeyboardAvoidingView, // Use KeyboardAvoidingView to handle keyboard overlap
  Platform,
  ActivityIndicator, // Use ActivityIndicator for loading states
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for navigation
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user'); // Default role
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true); // Set loading to true when fetching users
    try {
      const token = await AsyncStorage.getItem('userToken'); // Retrieve token from AsyncStorage
      const response = await fetch('http://10.0.2.2:5000/manage/users', {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false); // Set loading to false when fetching is complete
    }
  };

  const addUser = async () => {
    if (!newUserId || !newPassword) {
      Alert.alert('Error', 'User ID and Password are required');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken'); // Retrieve token from AsyncStorage
      const response = await fetch('http://10.0.2.2:5000/manage/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include token in headers
        },
        body: JSON.stringify({
          userId: newUserId,
          password: newPassword,
          role: newRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      Alert.alert('Success', 'User added successfully');
      setNewUserId('');
      setNewPassword('');
      setNewRole('user');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Failed to add user:', error);
      Alert.alert('Error', `Failed to add user: ${error.message}`);
    }
  };

  const updateUser = async () => {
    if (!selectedUser) {
      Alert.alert('Error', 'No user selected for update');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken'); // Retrieve token from AsyncStorage
      const response = await fetch(`http://10.0.2.2:5000/manage/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include token in headers
        },
        body: JSON.stringify({
          userId: newUserId,
          password: newPassword,
          role: newRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      Alert.alert('Success', 'User updated successfully');
      setIsEditing(false);
      setSelectedUser(null);
      setNewUserId('');
      setNewPassword('');
      setNewRole('user');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Failed to update user:', error);
      Alert.alert('Error', `Failed to update user: ${error.message}`);
    }
  };

  const deleteUser = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken'); // Retrieve token from AsyncStorage
              const response = await fetch(`http://10.0.2.2:5000/manage/users/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`, // Include token in headers
                },
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
              }

              Alert.alert('Success', 'User deleted successfully');
              fetchUsers(); // Refresh the user list
            } catch (error) {
              console.error('Failed to delete user:', error);
              Alert.alert('Error', `Failed to delete user: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.listItem, selectedUser?.id === item.id && styles.selectedListItem]}
      onPress={() => {
        setSelectedUser(item);
        setNewUserId(item.userId);
        setNewPassword(item.password); // Set password to state
        setNewRole(item.role);
        setIsEditing(true);
      }}
    >
      <Text style={styles.listItemText}>{item.userId} ({item.role})</Text>
      <TouchableOpacity onPress={() => deleteUser(item.id)}>
        <Text style={styles.deleteButton}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>User Management</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="User ID"
            value={newUserId}
            onChangeText={setNewUserId}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor="#888"
          />
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Role:</Text>
            <TouchableOpacity
              style={[styles.roleButton, newRole === 'user' && styles.selectedRoleButton]}
              onPress={() => setNewRole('user')}
            >
              <Text style={[styles.roleText, newRole === 'user' && styles.selectedRoleText]}>User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, newRole === 'admin' && styles.selectedRoleButton]}
              onPress={() => setNewRole('admin')}
            >
              <Text style={[styles.roleText, newRole === 'admin' && styles.selectedRoleText]}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={isEditing ? updateUser : addUser}
          >
            <Text style={styles.buttonText}>{isEditing ? 'Add User' : 'Update User'}</Text>
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                setSelectedUser(null);
                setNewUserId('');
                setNewPassword('');
                setNewRole('user');
              }}
            >
            <Text style={styles.buttonText}>Cancel Edit</Text>
          </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005bac" />
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f27431', // Match the background color in the image
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent', // Make container transparent
  },
  header: {
    backgroundColor: 'transparent', // No header background color
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 0, // Remove the border
    shadowColor: 'transparent', // Remove the shadow
    shadowOffset: { width: 0, height: 0 }, // Remove shadow
    shadowOpacity: 0, // Remove shadow
    shadowRadius: 0, // Remove shadow
    elevation: 0, // Remove shadow (Android)
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the header text
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white', // White header text
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
    padding: 15,
    borderRadius: 10,
    borderWidth: 1, // Add a border
    borderColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white border
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // More transparent white
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
    color: '#333',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleLabel: {
    marginRight: 10,
    fontSize: 16,
    color: 'white', // White role label
  },
  roleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedRoleButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Darker transparent
  },
  roleText: {
    fontSize: 16,
    color: 'white', // White role text
  },
  selectedRoleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'column', // Vertically Stack Buttons
    marginBottom: 20,
    justifyContent: 'center', // Center horizontally
  },
  button: {
    padding: 12,
    borderRadius: 5,
    marginBottom: 10, // Space Between Buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#34a0a4', // Success Colour
  },
  cancelButton: {
    backgroundColor: '#e5383b', // Red Color for Delete/Cancel
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Semi-transparent white
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedListItem: {
    borderColor: '#fff', // White Border for Selected
    borderWidth: 2,
  },
  listItemText: {
    fontSize: 16,
    color: 'white', // White list item text
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    color: '#ddd', // Light Grey
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default UserManagement;