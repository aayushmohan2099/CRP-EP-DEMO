import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';

export default function VillageList({ navigation, route }) {
  const { panchayat, viewOnly } = route.params;
  const [query, setQuery] = useState('');
  const [villages, setVillages] = useState([]);

  useEffect(() => {
    (async ()=> {
      const res = await gsApi.villagesByPanchayat(panchayat.id);
      setVillages(res || []);
    })();
  }, []);

  const filtered = villages.filter(v => v.name && v.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <View style={{ flex:1, padding:12 }}>
      <BackButton />
      <Text style={{ fontWeight:'bold' }}>{panchayat.name}</Text>
      <TextInput placeholder="Search Village" value={query} onChangeText={setQuery} style={{ borderWidth:1, padding:8, marginBottom:12 }} />
      <FlatList data={filtered} keyExtractor={(i)=>i.id} renderItem={({item})=> (
        <View style={{ padding:8, borderBottomWidth:1 }}>
          <Text>{item.name} — Recorded: {item.recorded_count}</Text>
          <Button title="Fetch SHGs" onPress={()=> navigation.navigate('SHGList', { village: item, viewOnly })} />
        </View>
      )} />
    </View>
  );
}
