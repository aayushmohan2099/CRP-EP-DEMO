import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { getUser, clearUser } from '../utils/auth';
import gsApi from '../api/gsApi';

export default function CRPDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [panchayats, setPanchayats] = useState([]);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
      if (u && u.assigned_clf_id) {
        const res = await gsApi.panchayatsByClf(u.assigned_clf_id);
        setPanchayats(res || []);
      }
    })();
  }, []);

  const logout = async () => { await clearUser(); navigation.replace('Login'); };

  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20 }}>Welcome {user ? user.username : ''}</Text>

      <Text style={{ marginTop:12, fontWeight:'bold' }}>Analytics (Your CLF)</Text>
      {panchayats.map(p => (
        <View key={p.id} style={{ padding:8, borderBottomWidth:1, borderColor:'#eee' }}>
          <Text>{p.name} — Recorded: {p.recorded_count}</Text>
        </View>
      ))}

      <Button title="Record new Beneficiary Enterprise" onPress={() => navigation.navigate('SelectGP')} />
      <Button title="View Recorded Beneficiaries" onPress={() => navigation.navigate('SelectGP', { viewOnly: true })} />
      <Button title="Logout" onPress={logout} color='red' />
    </ScrollView>
  );
}
