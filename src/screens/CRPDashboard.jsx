import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { getUser, clearUser } from '../utils/auth';
import gsApi from '../api/gsApi';

export default function CRPDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [panchayats, setPanchayats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const u = await getUser();
        setUser(u || null);
        if (u && u.assigned_clf_id) {
          const res = await gsApi.panchayatsByClf(u.assigned_clf_id);
          // Defensive handling: make sure res is an array
          if (Array.isArray(res)) {
            setPanchayats(res);
          } else {
            // If API returned an error diagnostic or wrapper, surface it
            if (res && res.__parse_error) {
              Alert.alert('Server error', 'Invalid server response: ' + (res.text ? res.text.slice(0,300) : ''));
            } else if (res && res.__error) {
              Alert.alert('Network error', res.message || 'Unknown network error');
            } else if (res && res.error) {
              Alert.alert('Server error', res.error);
            } else {
              // fallback: set empty array
              setPanchayats([]);
            }
          }
        } else {
          setPanchayats([]);
        }
      } catch (err) {
        console.warn('CRPDashboard load error', err);
        Alert.alert('Error', String(err));
        setPanchayats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    await clearUser();
    navigation.replace('Login');
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20 }}>Welcome {user ? user.username : ''}</Text>

      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Analytics (Your CLF)</Text>

      {loading ? (
        <View style={{ marginVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          {panchayats.length === 0 ? (
            <Text style={{ marginVertical: 12, color: '#666' }}>No Panchayats found or no data recorded yet.</Text>
          ) : (
            panchayats.map(p => (
              <View key={p.id} style={{ padding: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
                <Text>{p.name} — Recorded: {p.recorded_count ?? 0}</Text>
              </View>
            ))
          )}
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Record new Beneficiary Enterprise" onPress={() => navigation.navigate('SelectGP')} />
      </View>

      <View style={{ marginTop: 12 }}>
        <Button title="View Recorded Beneficiaries" onPress={() => navigation.navigate('SelectGP', { viewOnly: true })} />
      </View>

      <View style={{ marginTop: 12 }}>
        <Button title="Logout" onPress={logout} color="red" />
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
