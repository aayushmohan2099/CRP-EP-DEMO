import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import LoaderModal from '../LoaderModal';
import SearchBar from '../SearchBar';

export default function VillageList({ navigation, route }) {
  const { panchayat, viewOnly } = route.params;
  const [query, setQuery] = useState('');
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await gsApi.villagesByPanchayat(panchayat.id);
        setVillages(res || []);
      } catch (err) {
        console.warn('Error fetching villages', err);
        setVillages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = villages.filter(v =>
    v.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={{ flex: 1, padding: 12, marginTop: 50 }}>
      <LoaderModal visible={loading} message="Loading villages..." />
      {/* <BackButton />
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>{panchayat.name}</Text> */}
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{panchayat.name}</Text>
  <BackButton />
</View>
      <SearchBar
        placeholder="Search Village"
        value={query}
        onChangeText={text => setQuery(text)}
        style={{ marginBottom: 12 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              {item.name} — Recorded: {item.recorded_count ?? 0}
            </Text>

            <TouchableOpacity
              style={styles.openButton}
              onPress={() =>
                navigation.navigate('SHGList', { village: item, viewOnly })
              }
            >
              <Text style={styles.buttonText}>SHGs</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#666', marginTop: 12 }}>No villages found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EE6969',
    marginBottom: 4,
  },
  listText: {
    flex: 1,
    fontSize: 15,
  },
  openButton: {
    backgroundColor: '#EE6969',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
