import React, { useEffect, useState, useContext } from 'react';
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

export default function SelectGP({ navigation, route }) {
  const { adminBlockId } = route.params || {};
  const [panchayat, setPanchayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const translations = {
    en: {
      searchPlaceholder: 'Search Gram Panchayat',
      headerTitle: 'Gram Panchayats',
      open: 'Open',
      noItems: 'No Gram Panchayats found.',
      fetching: 'Loading Gram Panchayats...',
    },
  };

  const t = translations.en;

  useEffect(() => {
    if (!adminBlockId) {
      Alert.alert('Error', 'No block selected.');
      navigation.goBack();
      return;
    }

    const fetchGPs = async () => {
      try {
        setLoading(true);
        const res = await gsApi.getPanchayatsByBlock(adminBlockId);
        if (Array.isArray(res)) {
          setPanchayat(res);
        } else if (Array.isArray(res?.results)) {
          setPanchayat(res.results);
        } else if (Array.isArray(res?.data)) {
          setPanchayat(res.data);
        } else {
          setPanchayat([]);
        }
      } catch (err) {
        console.error('Failed to load Panchayats:', err);
        setPanchayat([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGPs();
  }, [adminBlockId]);

  const filteredGPs = Array.isArray(panchayat)
    ? panchayat.filter(p =>
        p.panchayat_name_en?.toLowerCase().trim().includes(query.toLowerCase().trim())
      )
    : [];

  const menuItems = [
    {
      label: 'Logout',
      color: '#EE6969',
      onPress: () => navigation.replace('Login'),
    },
  ];

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

      {/* GP LIST */}
      <FlatList
        data={filteredGPs}
        keyExtractor={item => String(item.panchayat_id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>{item.panchayat_name_en}</Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() =>
                navigation.navigate('SelectVillages', { adminPanchayatId: item.panchayat_id })
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
