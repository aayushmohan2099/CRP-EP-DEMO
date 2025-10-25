// src/screens/record/SelectGP.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, ActivityIndicator } from 'react-native';
import gsApi from '../../api/gsApi';
import { getUser } from '../../utils/auth';

export default function SelectGP({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [panchayats, setPanchayats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const u = await getUser();
        if (u && u.assigned_clf_id && !route.params?.adminDistrictId) {
          // ask server; if server gives usable list, use it; otherwise fallback to client join + compute counts
          const res = await gsApi.panchayatsByClf(u.assigned_clf_id);
          if (Array.isArray(res) && res.length > 0 && res.every(p => p && (p.recorded_count !== undefined))) {
            setPanchayats(res);
          } else {
            // fallback: client-side join
            const mapping = await gsApi.list('PanchayatsUnderCLF') || [];
            const allPanch = await gsApi.list('Panchayat') || [];
            const targetClf = String(u.assigned_clf_id).trim();

            let matched = mapping.filter(row => Object.keys(row).some(k => {
              const v = row[k];
              return v !== undefined && v !== null && String(v).trim() === targetClf;
            }));
            if (matched.length === 0) {
              matched = mapping.filter(row => Object.keys(row).some(k => {
                const v = row[k];
                return v !== undefined && v !== null && String(v).indexOf(targetClf) !== -1;
              }));
            }

            const panchayatIds = new Set();
            matched.forEach(r => {
              ['panchayat_id','panchayatid','panchayat','panchayatId','panchayat_id '].forEach(col => {
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

            // if server had panchayats but no counts, merge server data (if any) but compute counts client-side
            if (Array.isArray(res) && res.length > 0) {
              // map res by id
              const byId = {};
              res.forEach(r => { if (r && r.id) byId[String(r.id)] = r; });
              // use union of ids
              const unionIds = new Set(final.map(p => String(p.id)));
              Object.keys(byId).forEach(id => unionIds.add(id));
              final = Array.from(unionIds).map(id => {
                const p = (allPanch.find(x => String(x.id) === String(id))) || byId[id] || { id };
                return p;
              });
            }

            // compute recorded_count per panchayat by summing villages' recorded_count
            const withCounts = await Promise.all(final.map(async (p) => {
              try {
                const villages = await gsApi.villagesByPanchayat(p.id);
                // villages may already include recorded_count; otherwise compute per-village
                let sum = 0;
                if (Array.isArray(villages) && villages.length > 0) {
                  sum = villages.reduce((acc, v) => acc + (Number(v.recorded_count || 0)), 0);
                } else {
                  // fallback: 0
                  sum = 0;
                }
                return Object.assign({}, p, { recorded_count: sum });
              } catch (err) {
                return Object.assign({}, p, { recorded_count: 0 });
              }
            }));

            if (withCounts.length > 0) setPanchayats(withCounts);
            else {
              Alert.alert('No Panchayats found', `Mapping rows: ${mapping.length}. Matched mapping rows: ${matched.length}.`);
              setPanchayats([]);
            }
          }
        } else if (route.params?.adminDistrictId) {
          const all = await gsApi.list('Panchayat') || [];
          const filtered = (all || []).filter(p => String(p.district_id) === String(route.params.adminDistrictId));
          // compute counts quickly
          const enriched = await Promise.all(filtered.map(async p => {
            try {
              const villages = await gsApi.villagesByPanchayat(p.id);
              const sum = (Array.isArray(villages) ? villages.reduce((acc, v) => acc + (Number(v.recorded_count || 0)), 0) : 0);
              return Object.assign({}, p, { recorded_count: sum });
            } catch (e) { return Object.assign({}, p, { recorded_count: 0 }); }
          }));
          setPanchayats(enriched);
        } else {
          const all = await gsApi.list('Panchayat') || [];
          // compute counts for all (might be heavy; but used only when no clf)
          const enriched = await Promise.all(all.map(async p => {
            try {
              const villages = await gsApi.villagesByPanchayat(p.id);
              const sum = (Array.isArray(villages) ? villages.reduce((acc, v) => acc + (Number(v.recorded_count || 0)), 0) : 0);
              return Object.assign({}, p, { recorded_count: sum });
            } catch (e) { return Object.assign({}, p, { recorded_count: 0 }); }
          }));
          setPanchayats(enriched);
        }
      } catch (err) {
        console.warn('SelectGP load error', err);
        Alert.alert('Error', String(err));
        setPanchayats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = panchayats.filter(p => p && p.name && p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={{ flex:1, padding:12 }}>
      <TextInput placeholder="Search Panchayat" value={query} onChangeText={setQuery} style={{ borderWidth:1, padding:8, marginBottom:12 }} />
      {loading ? <ActivityIndicator style={{ marginTop:12 }} size="large" /> : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          renderItem={({item}) => (
            <View style={{ padding:8, borderBottomWidth:1 }}>
              <Text>{item.name} — Recorded: {item.recorded_count ?? 0}</Text>
              <Button title="Open" onPress={() => navigation.navigate('VillageList', { panchayat: item, viewOnly: route.params?.viewOnly })} />
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#666', marginTop: 12 }}>No Panchayats found.</Text>}
        />
      )}
    </View>
  );
}
