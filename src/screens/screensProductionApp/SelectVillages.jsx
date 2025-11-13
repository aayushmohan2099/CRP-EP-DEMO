import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import gsApi from '../../api/gsApi';
import LoaderModal from '../../screens/LoaderModal';
import BackButton from '../../components/BackButton';
import SearchBar from '../../screens/SearchBar';
import BurgerMenu from '../../screens/BurgerMenu';
import LanguageToggle from '../../components/LanguageToggle';

export default function SelectVillage({ navigation, route }) {
  const { adminPanchayatId } = route.params || {};
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const translations = {
    en: {
      searchPlaceholder: 'Search Village',
      headerTitle: 'Villages',
      open: 'Open',
      noItems: 'No villages found.',
      fetching: 'Loading villages...',
    },
  };

  const t = translations.en;

  useEffect(() => {
    if (!adminPanchayatId) {
      Alert.alert('Error', 'No Panchayat selected.');
      navigation.goBack();
      return;
    }

    const fetchVillages = async () => {
      try {
        setLoading(true);
        const res = await gsApi.getVillagesByPanchayat(adminPanchayatId);
        if (Array.isArray(res)) {
          setVillages(res);
        } else if (Array.isArray(res?.results)) {
          setVillages(res.results);
        } else if (Array.isArray(res?.data)) {
          setVillages(res.data);
        } else {
          setVillages([]);
        }
      } catch (err) {
        console.error('Failed to load villages:', err);
        setVillages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVillages();
  }, [adminPanchayatId]);

  const filteredVillages = Array.isArray(villages)
    ? villages.filter(v =>
        v.village_name?.toLowerCase().trim().includes(query.toLowerCase().trim())
      )
    : [];

    const menuItems = [
    {
      label: 'Logout',
      color: '#EE6969',
      onPress: () => navigation.replace('Login'),
    },
  ];
     useEffect(() => {
        console.log('villages updated:', villages);
        console.log('filteredVillages:', filteredVillages);
        }, [villages]);
          

  

  return (
    <View style={styles.container}>
      <LoaderModal visible={loading} message={t.fetching} />

      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <LanguageToggle />
          <BackButton />
        </View>
        <Text style={styles.title}>{t.headerTitle}</Text>
        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          style={{ marginLeft: 'auto' }}
        >
          <Text style={{ fontSize: 26 }}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <SearchBar
        placeholder={t.searchPlaceholder}
        value={query}
        onChangeText={text => setQuery(text)}
        style={{ marginBottom: 12 }}
      />

      {/* VILLAGE LIST */}
      <FlatList
        data={filteredVillages}
        keyExtractor={item => String(item.village_id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>{item.village_name}</Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() =>
                navigation.navigate('SomeNextScreen', { adminVillageId: item.village_id })
              }
            >
              <Text style={styles.buttonText}>{t.open}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>{t.noItems}</Text>
        }
      />

      <BurgerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={menuItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, marginTop: 50, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, position: 'relative' },
  title: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#333' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EE6969', marginBottom: 4 },
  listText: { flex: 1, fontSize: 15, color: '#222' },
  openButton: { backgroundColor: '#EE6969', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: '#666', marginTop: 12, textAlign: 'center' },
});
