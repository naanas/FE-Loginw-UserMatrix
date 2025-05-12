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
} from 'react-native';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user'); // Default role
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/manage/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    }
  };

  const addUser = async () => {
    if (!newUserId || !newPassword) {
      Alert.alert('Error', 'User ID and Password are required');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:5000/manage/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(`http://10.0.2.2:5000/manage/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
              const response = await fetch(`http://10.0.2.2:5000/manage/users/${id}`, {
                method: 'DELETE',
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
        setNewRole(item.role);
        setIsEditing(true);
      }}
    >
      <Text>{item.userId} ({item.role})</Text>
      <TouchableOpacity onPress={() => deleteUser(item.id)}>
        <Text style={styles.deleteButton}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Management</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="User ID"
          value={newUserId}
          onChangeText={setNewUserId}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
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
          style={styles.addButton}
          onPress={isEditing ? updateUser : addUser}
        >
          <Text style={styles.buttonText}>{isEditing ? 'Update User' : 'Add User'}</Text>
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

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  roleButton: {
    backgroundColor: '#ddd',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedRoleButton: {
    backgroundColor: '#4a86e8',
  },
  roleText: {
    fontSize: 16,
    color: 'black',
  },
  selectedRoleText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
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
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedListItem: {
    borderColor: '#4a86e8',
    borderWidth: 2,
  },
  deleteButton: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default UserManagement;