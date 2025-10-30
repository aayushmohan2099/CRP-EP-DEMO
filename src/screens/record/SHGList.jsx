// // src/screens/record/SHGList.jsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, TextInput, Button, FlatList } from 'react-native';
// import gsApi from '../../api/gsApi';
// import BackButton from '../../components/BackButton';

// export default function SHGList({ navigation, route }) {
//   const { village, viewOnly } = route.params;
//   const [query, setQuery] = useState('');
//   const [shgs, setShgs] = useState([]);

//   useEffect(() => {
//     (async ()=> {
//       const res = await gsApi.shgsByVillage(village.id);
//       setShgs(res || []);
//     })();
//   }, []);

//   const filtered = shgs.filter(s => s.name && s.name.toLowerCase().includes(query.toLowerCase()));
//   return (
//     <View style={{ flex:1, padding:12 }}>
//       <BackButton />
//       <Text style={{ fontWeight:'bold' }}>{village.name}</Text>
//       <TextInput placeholder="Search SHG" value={query} onChangeText={setQuery} style={{ borderWidth:1, padding:8, marginBottom:12 }} />
//       <FlatList data={filtered} keyExtractor={(i)=>String(i.id)} renderItem={({item})=> (
//         <View style={{ padding:8, borderBottomWidth:1 }}>
//           <Text>{item.name} — Recorded: {item.recorded_count}</Text>
//           <Button title="Fetch Beneficiaries" onPress={()=> navigation.navigate('BeneficiaryList', { shg: item, viewOnly })} />
//         </View>
//       )} />
//     </View>
//   );
// }


// src/screens/record/SHGList.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import LoaderModal from '../LoaderModal';
import SearchBar from '../SearchBar';

export default function SHGList({ navigation, route }) {
  const { village, viewOnly } = route.params;
  const [query, setQuery] = useState('');
  const [shgs, setShgs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch SHG data on mount
  useEffect(() => {
    const fetchSHGs = async () => {
      try {
        setLoading(true);
        const res = await gsApi.shgsByVillage(village.id);
        setShgs(res || []);
      } catch (err) {
        console.warn('Error fetching SHGs', err);
        setShgs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSHGs();
  }, [village.id]);

  // ✅ Filter SHGs by search query
  const filtered = shgs.filter(s =>
    s.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Loader */}
      <LoaderModal visible={loading} message="Fetching SHGs..." />

      {/* Header row: Title + Back button */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{village.name}</Text>
        <BackButton />
      </View>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search SHG"
        value={query}
        onChangeText={setQuery}
        style={{ marginBottom: 12 }}
      />

      {/* SHG List */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              {item.name} — Recorded: {item.recorded_count ?? 0}
            </Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() =>
                navigation.navigate('BeneficiaryList', { shg: item, viewOnly })
              }
            >
              <Text style={styles.buttonText}>Beneficiaries</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>No SHGs found.</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    marginTop: 50,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
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
    color: '#222',
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
  emptyText: {
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});
