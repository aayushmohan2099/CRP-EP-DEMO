// src/screens/record/BeneficiaryList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import LoaderModal from '../LoaderModal';
import SearchBar from '../SearchBar';
import { useIsFocused } from '@react-navigation/native';

export default function BeneficiaryList({ navigation, route }) {
  const { shg, viewOnly } = route.params;
  const [query, setQuery] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Load once on mount
  useEffect(() => { loadBeneficiaries(); }, []);

  // Reload when screen is focused
  useEffect(() => { if (isFocused) loadBeneficiaries(); }, [isFocused]);

  const filtered = beneficiaries.filter(b =>
    b.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Loader */}
      <LoaderModal visible={loading} message="Fetching Beneficiaries..." />

      {/* Header: SHG name + Back */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{shg.name}</Text>
        <BackButton />
      </View>

      {/* Search */}
      <SearchBar
        placeholder="Search Beneficiary"
        value={query}
        onChangeText={text => setQuery(text)}
        style={{ marginBottom: 12 }}
      />

      {/* Beneficiary List */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listText}>{item.name}</Text>
              <Text style={styles.subText}>SHG: {item.shg_id} • Village: {item.village_id}</Text>
              <Text style={styles.subText}>
                Enterprise Recorded: {item.enterprise_recorded ? 'Yes' : 'No'}
              </Text>
            </View>

            <View style={{ flexDirection: 'column', gap: 6 }}>
              {viewOnly ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('ViewBeneficiary', { beneficiary: item })}
                >
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
              ) : item.enterprise_recorded ? (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('ViewBeneficiary', { beneficiary: item })}
                  >
                    <Text style={styles.buttonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('EnterpriseForm', { beneficiary: item })}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('EnterpriseForm', { beneficiary: item })}
                >
                  <Text style={styles.buttonText}>Record</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>No beneficiaries found.</Text>
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
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EE6969',
    marginBottom: 4,
  },
  listText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  subText: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#EE6969',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});
