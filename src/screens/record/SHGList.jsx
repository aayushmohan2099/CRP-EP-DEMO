import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';

export default function SHGList({ navigation, route }) {
  const { village, viewOnly } = route.params;
  const [query, setQuery] = useState('');
  const [shgs, setShgs] = useState([]);

  useEffect(() => {
    (async ()=> {
      const res = await gsApi.shgsByVillage(village.id);
      setShgs(res || []);
    })();
  }, []);

  const filtered = shgs.filter(s => s.name && s.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <View style={{ flex:1, padding:12 }}>
      <BackButton />
      <Text style={{ fontWeight:'bold' }}>{village.name}</Text>
      <TextInput placeholder="Search SHG" value={query} onChangeText={setQuery} style={{ borderWidth:1, padding:8, marginBottom:12 }} />
      <FlatList data={filtered} keyExtractor={(i)=>i.id} renderItem={({item})=> (
        <View style={{ padding:8, borderBottomWidth:1 }}>
          <Text>{item.name} — Recorded: {item.recorded_count}</Text>
          <Button title="Fetch Beneficiaries" onPress={()=> navigation.navigate('BeneficiaryList', { shg: item, viewOnly })} />
        </View>
      )} />
    </View>
  );
}
