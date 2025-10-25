// src/screens/record/BeneficiaryList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Button, ActivityIndicator } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import { useIsFocused } from '@react-navigation/native';

export default function BeneficiaryList({ navigation, route }) {
  const { shg, viewOnly } = route.params;
  const [query, setQuery] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  const loadBeneficiaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await gsApi.beneficiariesByShg(shg.id, viewOnly ? 'true' : 'false');
      setBeneficiaries(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('loadBeneficiaries', err);
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  }, [shg?.id, viewOnly]);

  useEffect(() => { loadBeneficiaries(); }, []);

  useEffect(() => { if (isFocused) loadBeneficiaries(); }, [isFocused]);

  const filtered = beneficiaries.filter(b => b.name && b.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <BackButton />
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{shg.name}</Text>

      <TextInput
        placeholder="Search Beneficiary"
        value={query}
        onChangeText={setQuery}
        style={{ borderWidth: 1, padding: 8, marginVertical: 12 }}
      />

      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <View style={{ padding: 8, borderBottomWidth: 1 }}>
              <Text style={{ marginBottom: 6, fontWeight:'600' }}>{item.name}</Text>
              <Text style={{ marginBottom: 6 }}>SHG: {item.shg_id} • Village: {item.village_id}</Text>
              <Text style={{ marginBottom: 6 }}>Enterprise Recorded: {item.enterprise_recorded ? 'Yes' : 'No'}</Text>

              {viewOnly ? (
                // viewOnly: show only recorded beneficiaries; button opens read-only view
                <Button title="View" onPress={() => navigation.navigate('ViewBeneficiary', { beneficiary: item })} />
              ) : (
                <>
                  {item.enterprise_recorded ? (
                    <View style={{ flexDirection:'row', gap:8 }}>
                      <Button title="View" onPress={() => navigation.navigate('ViewBeneficiary', { beneficiary: item })} />
                      <View style={{ height:8 }} />
                      <Button title="Edit" onPress={() => navigation.navigate('EnterpriseForm', { beneficiary: item })} />
                    </View>
                  ) : (
                    <Button title="Record" onPress={() => navigation.navigate('EnterpriseForm', { beneficiary: item })} />
                  )}
                </>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={{ color:'#666', marginTop:12 }}>No beneficiaries found.</Text>}
        />
      )}
    </View>
  );
}
