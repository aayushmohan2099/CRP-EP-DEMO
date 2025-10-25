// src/screens/LoginScreen.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import gsApi from '../api/gsApi';
import { saveUser } from '../utils/auth';

function randomCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { q: `${a} + ${b}`, ans: String(a + b) };
}

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('CRP'); // UI-only
  const [captcha] = useState(randomCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (String(captchaInput).trim() !== String(captcha.ans)) {
      return Alert.alert('Captcha incorrect');
    }
    if (!username || !password) return Alert.alert('Validation', 'Please enter username and password');
    setLoading(true);
    try {
      const res = await gsApi.login(username, password);
      if (res && res.success) {
        await saveUser(res.user);
        const serverRole = String(res.user.role || '').toLowerCase();
        if (serverRole === 'crp') navigation.replace('CRPDashboard');
        else navigation.replace('AdminDashboard');
      } else {
        Alert.alert('Login failed', res.message || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput value={username} onChangeText={setUsername} style={styles.input} placeholder="Enter username" autoCapitalize="none" />

      <Text style={styles.label}>Password</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} style={styles.input} placeholder="Enter password" />

      <Text style={[styles.label, { marginTop: 8 }]}>Role (UI only)</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity style={[styles.roleButton, selectedRole === 'CRP' ? styles.roleButtonActive : null]} onPress={() => setSelectedRole('CRP')}>
          <Text style={selectedRole === 'CRP' ? styles.roleTextActive : styles.roleText}>CRP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleButton, selectedRole === 'Admin' ? styles.roleButtonActive : null]} onPress={() => setSelectedRole('Admin')}>
          <Text style={selectedRole === 'Admin' ? styles.roleTextActive : styles.roleText}>Admin</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Captcha: {captcha.q}</Text>
      <TextInput value={captchaInput} onChangeText={setCaptchaInput} style={styles.input} placeholder="Answer captcha" keyboardType="numeric" />

      <View style={{ marginTop: 12 }}>
        <Button title={loading ? 'Logging in...' : 'Login'} onPress={doLogin} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, justifyContent:'center' },
  title: { fontSize:22, fontWeight:'bold', marginBottom:18, textAlign:'center' },
  label: { marginBottom:6, fontWeight:'600' },
  input: { borderWidth:1, borderColor:'#ccc', marginBottom:12, padding:10, borderRadius:6 },
  roleRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:12 },
  roleButton: { flex:1, paddingVertical:10, marginHorizontal:6, borderWidth:1, borderColor:'#ccc', borderRadius:6, alignItems:'center', backgroundColor:'#fff' },
  roleButtonActive: { backgroundColor:'#007aff', borderColor:'#007aff' },
  roleText: { color:'#333', fontWeight:'600' },
  roleTextActive: { color:'#fff', fontWeight:'700' }
});
