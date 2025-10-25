import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Button } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';

export default function BeneficiaryList({ navigation, route }) {
  const { shg, viewOnly } = route.params;
  const [query, setQuery] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await gsApi.beneficiariesByShg(
        shg.id,
        viewOnly ? 'true' : 'false',
      );
      setBeneficiaries(res || []);
    })();
  }, []);

  const filtered = beneficiaries.filter(
    b => b.name && b.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <BackButton />
      <Text style={{ fontWeight: 'bold' }}>{shg.name}</Text>
      <TextInput
        placeholder="Search Beneficiary"
        value={query}
        onChangeText={setQuery}
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={{ padding: 8, borderBottomWidth: 1 }}>
            <Text>
              {item.name} — Enterprise Recorded:{' '}
              {item.enterprise_recorded ? 'Yes' : 'No'}
            </Text>
            <Button
              title={item.enterprise_recorded ? 'Open' : 'Record'}
              onPress={() =>
                navigation.navigate('EnterpriseForm', {
                  beneficiary: item,
                  viewOnly,
                  onSaved: async () => {
                    // re-fetch beneficiaries after save/delete
                    const res = await gsApi.beneficiariesByShg(
                      shg.id,
                      viewOnly ? 'true' : 'false',
                    );
                    setBeneficiaries(res || []);
                  },
                })
              }
            />
          </View>
        )}
      />
    </View>
  );
}
