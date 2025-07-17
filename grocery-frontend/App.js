import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, TextInput, Button,
  FlatList, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from './i18n';

const API_URL = 'https://grocery-helper.onrender.com';

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
      Alert.alert(i18n.t('validationMessage'));
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
      if (res.ok && data.token) {
        await saveToken(data.token);
        setUsername('');
        setPassword('');
      } else {
        Alert.alert(i18n.t('error'), data.message || i18n.t('failedToAuth'));
      }
    } catch {
      Alert.alert(i18n.t('error'), i18n.t('serverUnreachable'));
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
      Alert.alert(i18n.t('error'), i18n.t('fetchFailed'));
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
        Alert.alert(i18n.t('error'), i18n.t('addItemError'));
      }
    } catch {
      Alert.alert(i18n.t('error'), i18n.t('serverError'));
    }
  }

  async function deleteItem(id) {
    try {
      const res = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchItems(); // Refresh the list
      } else {
        Alert.alert(i18n.t('error'), 'Failed to delete item.');
      }
    } catch {
      Alert.alert(i18n.t('error'), i18n.t('serverError'));
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
      Alert.alert(i18n.t('error'), i18n.t('updateItemError'));
    }
  }

  const colors = darkMode
    ? {
        background: '#121212',
        text: '#EEE',
        inputBackground: '#1E1E1E',
        inputBorder: '#444',
        placeholder: '#888',
        button: '#BB86FC',
      }
    : {
        background: '#f5f5f5',
        text: '#333',
        inputBackground: '#fff',
        inputBorder: '#ccc',
        placeholder: '#aaa',
        button: '#2196F3',
      };

  if (!token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <Text style={[styles.title, { color: colors.text }]}>{isLogin ? i18n.t('login') : i18n.t('signup')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.text, marginRight: 8 }}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{i18n.t('username')}</Text>
          <TextInput
            placeholder={i18n.t('username')}
            placeholderTextColor={colors.placeholder}
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{i18n.t('password')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              placeholder={i18n.t('password')}
              placeholderTextColor={colors.placeholder}
              style={[styles.input, { flex: 1, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Button title={showPassword ? 'Hide' : 'Show'} onPress={() => setShowPassword(!showPassword)} />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.text} />
        ) : (
          <Button
            title={isLogin ? i18n.t('login') : i18n.t('signup')}
            onPress={loginSignup}
            color={colors.button}
          />
        )}

        <View style={{ marginTop: 10 }}>
          <Button
            title={isLogin ? i18n.t('switchToSignup') : i18n.t('switchToLogin')}
            onPress={() => setIsLogin(!isLogin)}
            color={colors.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={[styles.title, { color: colors.text }]}>{i18n.t('groceryList')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: colors.text, marginRight: 8 }}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>
      <Button title={i18n.t('logout')} onPress={logout} color="red" />

      <View style={[styles.inputContainer, { marginVertical: 15 }]}>
        <TextInput
          placeholder={i18n.t('addItemPlaceholder')}
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { flex: 1, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addItem}
        />
        <Button title={i18n.t('add')} onPress={addItem} color={colors.button} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleDone(item._id)}
            style={[styles.listItem, { backgroundColor: colors.inputBackground }]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.itemText, item.done && styles.doneItem, { color: colors.text }]}>
                {item.name}
              </Text>
              <TouchableOpacity onPress={() => deleteItem(item._id)}>
                <Text style={{ color: 'red', marginLeft: 10 }}>✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.text }]}>{i18n.t('noItems')}</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listItem: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
  },
  doneItem: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
