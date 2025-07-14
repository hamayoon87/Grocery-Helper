import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, TextInput, Button,
  FlatList, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:4000'; // replace with your Pi's local IP

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auth states
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Grocery states
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (token) fetchItems();
  }, [token]);

  async function loadToken() {
    const savedToken = await AsyncStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }

  async function saveToken(t) {
    await AsyncStorage.setItem('token', t);
    setToken(t);
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUsername('');
    setPassword('');
    setItems([]);
  }

  async function loginSignup() {
    if (!username || !password) {
      Alert.alert('Validation', 'Please enter username and password');
      return;
    }
    setLoading(true);
    const endpoint = isLogin ? 'login' : 'signup';

    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await saveToken(data.token);
        setUsername('');
        setPassword('');
      } else {
        Alert.alert('Error', data.message || 'Failed to authenticate');
      }
    } catch {
      Alert.alert('Error', 'Server not reachable');
    }
    setLoading(false);
  }

  async function fetchItems() {
    try {
      const res = await fetch(`${API_URL}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data);
    } catch {
      Alert.alert('Error', 'Failed to fetch items');
    }
  }

  async function addItem() {
    if (!newItem.trim()) return;
    try {
      const res = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newItem }),
      });
      if (res.ok) {
        setNewItem('');
        fetchItems();
      } else {
        Alert.alert('Error', 'Failed to add item');
      }
    } catch {
      Alert.alert('Error', 'Server error');
    }
  }

  async function toggleDone(id) {
    try {
      await fetch(`${API_URL}/items/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch {
      Alert.alert('Error', 'Failed to update item');
    }
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>
        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Button title={isLogin ? 'Login' : 'Sign Up'} onPress={loginSignup} />
        )}
        <Button
          title={isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
          onPress={() => setIsLogin(!isLogin)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Grocery List</Text>
      <Button title="Logout" onPress={logout} color="red" />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Add grocery item"
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addItem}
        />
        <Button title="Add" onPress={addItem} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleDone(item._id)}
            style={styles.listItem}
          >
            <Text style={[styles.itemText, item.done && styles.doneItem]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No items</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  inputContainer: { flexDirection: 'row', marginVertical: 15 },
  listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 18 },
  doneItem: { textDecorationLine: 'line-through', color: '#888' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
});
