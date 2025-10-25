import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import gsApi from '../api/gsApi';
import { saveUser } from '../utils/auth';

function randomCaptcha() {
  const a = Math.floor(Math.random()*9)+1;
  const b = Math.floor(Math.random()*9)+1;
  return { q: `${a} + ${b}`, ans: String(a+b) };
}

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha] = useState(randomCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');

  const doLogin = async () => {
    if (String(captchaInput).trim() !== String(captcha.ans)) return Alert.alert('Captcha incorrect');
    const res = await gsApi.login(username, password);
    if (res && res.success) {
      await saveUser(res.user);
      if (String(res.user.role).toLowerCase() === 'crp') navigation.replace('CRPDashboard');
      else navigation.replace('AdminDashboard');
    } else {
      Alert.alert('Login failed', res.message || 'Invalid credentials');
    }
  };

  return (
    <View style={{ flex:1, padding:16, justifyContent:'center' }}>
      <Text>Username</Text>
      <TextInput value={username} onChangeText={setUsername} style={{ borderWidth:1, marginBottom:12, padding:8 }} />
      <Text>Password</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth:1, marginBottom:12, padding:8 }} />
      <Text>Captcha: {captcha.q}</Text>
      <TextInput value={captchaInput} onChangeText={setCaptchaInput} style={{ borderWidth:1, marginBottom:12, padding:8 }} keyboardType='numeric' />
      <Button title="Login" onPress={doLogin} />
    </View>
  );
}
