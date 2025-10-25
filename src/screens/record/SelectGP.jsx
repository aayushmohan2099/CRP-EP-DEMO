import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import gsApi from '../../api/gsApi';
import { getUser } from '../../utils/auth';

export default function SelectGP({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [panchayats, setPanchayats] = useState([]);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (u && u.assigned_clf_id && !route.params?.adminDistrictId) {
        const res = await gsApi.panchayatsByClf(u.assigned_clf_id);
        setPanchayats(res || []);
      } else if (route.params?.adminDistrictId) {
        const all = await gsApi.list('Panchayat');
        const filtered = (all || []).filter(p => String(p.district_id) === String(route.params.adminDistrictId));
        setPanchayats(filtered);
      } else {
        const all = await gsApi.list('Panchayat'); setPanchayats(all || []);
      }
    })();
  }, []);

  const filtered = panchayats.filter(p => p.name && p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={{ flex:1, padding:12 }}>
      <TextInput placeholder="Search Panchayat" value={query} onChangeText={setQuery} style={{ borderWidth:1, padding:8, marginBottom:12 }} />
      <FlatList data={filtered} keyExtractor={(i)=>i.id} renderItem={({item})=> (
        <View style={{ padding:8, borderBottomWidth:1 }}>
          <Text>{item.name} — Recorded: {item.recorded_count}</Text>
          <Button title="Open" onPress={()=> navigation.navigate('VillageList', { panchayat: item, viewOnly: route.params?.viewOnly })} />
        </View>
      )} />
    </View>
  );
}
