// src/screens/record/SelectGP.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import gsApi from '../../api/gsApi';
import { getUser } from '../../utils/auth';
import LoaderModal from '../LoaderModal';
import SearchBar from '../SearchBar';

export default function SelectGP({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [panchayats, setPanchayats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 2;

  useEffect(() => {
    const fetchPanchayats = async () => {
      setLoading(true);
      try {
        const u = await getUser();
        let data = [];

        if (u && u.assigned_clf_id && !route.params?.adminDistrictId) {
          const res = await gsApi.panchayatsByClf(u.assigned_clf_id);
          data = Array.isArray(res) ? res : [];

          if (!data.length || !data.every(p => p.recorded_count !== undefined)) {
            const mapping = (await gsApi.list('PanchayatsUnderCLF')) || [];
            const allPanch = (await gsApi.list('Panchayat')) || [];
            const targetClf = String(u.assigned_clf_id).trim();

            let matched = mapping.filter(row =>
              Object.keys(row).some(k => row[k] !== undefined && String(row[k]).trim() === targetClf)
            );
            if (!matched.length) {
              matched = mapping.filter(row =>
                Object.keys(row).some(k => row[k] !== undefined && String(row[k]).includes(targetClf))
              );
            }

            const panchayatIds = new Set();
            matched.forEach(r => {
              ['panchayat_id', 'panchayatid', 'panchayat', 'panchayatId', 'panchayat_id '].forEach(col => {
                if (r[col]) String(r[col]).split(',').forEach(v => panchayatIds.add(String(v).trim()));
              });
              Object.keys(r).forEach(k => {
                const val = r[k];
                if (val) {
                  const s = String(val).trim();
                  if (s && /^\d+$/.test(s) && s !== targetClf) panchayatIds.add(s);
                }
              });
            });

            let final = allPanch.filter(p => p && p.id && panchayatIds.has(String(p.id).trim()));

            if (Array.isArray(res) && res.length > 0) {
              const byId = {};
              res.forEach(r => { if (r && r.id) byId[String(r.id)] = r; });
              const unionIds = new Set(final.map(p => String(p.id)));
              Object.keys(byId).forEach(id => unionIds.add(id));
              final = Array.from(unionIds).map(id => allPanch.find(x => String(x.id) === String(id)) || byId[id] || { id });
            }

            const withCounts = await Promise.all(final.map(async p => {
              try {
                const villages = await gsApi.villagesByPanchayat(p.id);
                const sum = Array.isArray(villages) ? villages.reduce((acc, v) => acc + (Number(v.recorded_count || 0)), 0) : 0;
                return { ...p, recorded_count: sum };
              } catch {
                return { ...p, recorded_count: 0 };
              }
            }));

            data = withCounts;
          }
        } else {
          const all = (await gsApi.list('Panchayat')) || [];
          const filtered = route.params?.adminDistrictId
            ? all.filter(p => String(p.district_id) === String(route.params.adminDistrictId))
            : all;

          const enriched = await Promise.all(filtered.map(async p => {
            try {
              const villages = await gsApi.villagesByPanchayat(p.id);
              const sum = Array.isArray(villages) ? villages.reduce((acc, v) => acc + (Number(v.recorded_count || 0)), 0) : 0;
              return { ...p, recorded_count: sum };
            } catch {
              return { ...p, recorded_count: 0 };
            }
          }));
          data = enriched;
        }

        setPanchayats(data);
      } catch (err) {
        console.warn('SelectGP load error', err);
        Alert.alert('Error', String(err));
        setPanchayats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPanchayats();
  }, [route.params]);

  const filtered = panchayats.filter(p => p.name?.toLowerCase().includes(query.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <SearchBar
  placeholder="Search Panchayat"
  value={query}
  onChangeText={text => { setQuery(text); setPage(1); }}
  style={{ marginTop: 50, marginBottom: 12 }}
/>

      <LoaderModal visible={loading} message="Loading Panchayats..." />

      {!loading && (
        <>
          <FlatList
            data={paginated}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listText}>
                  {item.name} — Recorded: {item.recorded_count ?? 0}
                </Text>

                <TouchableOpacity
                  style={styles.openButton}
                  onPress={() => navigation.navigate('VillageList', { panchayat: item, viewOnly: route.params?.viewOnly })}
                >
                  <Text style={styles.buttonText}>Open</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#666', marginTop: 12 }}>No Panchayats found.</Text>}
          />

          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                disabled={page <= 1}
                onPress={() => setPage(prev => Math.max(prev - 1, 1))}
                style={[styles.pageButton, page <= 1 && styles.disabledButton]}
              >
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>

              <Text style={{ alignSelf: 'center' }}>{page} / {totalPages}</Text>

              <TouchableOpacity
                disabled={page >= totalPages}
                onPress={() => setPage(prev => Math.min(prev + 1, totalPages))}
                style={[styles.pageButton, page >= totalPages && styles.disabledButton]}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    borderWidth: 1,
    borderColor: '#EE6969',
    padding: 8,
    marginBottom: 12,
    borderRadius: 6,
    marginTop: 50,
  },
  listItem: {
    flexDirection: 'row', // 🔥 make text & button on same line
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
  pageButton: {
    padding: 8,
    backgroundColor: '#EE6969',
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
