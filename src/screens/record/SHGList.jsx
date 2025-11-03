// src/screens/record/SHGList.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import LoaderModal from '../LoaderModal';
import SearchBar from '../SearchBar';
import BurgerMenu from '../BurgerMenu';
import HamburgerIcon from '../../../assets/hamburger.png'; // adjust path

export default function SHGList({ navigation, route }) {
  const { village, viewOnly } = route.params;
  const [query, setQuery] = useState('');
  const [shgs, setShgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const filtered = shgs.filter(s =>
    s.name?.toLowerCase().includes(query.toLowerCase())
  );

  // Burger menu items
  const menuItems = [
    {
      label: 'Record New Beneficiary Detail',
      onPress: () => navigation.popToTop(),
    },
    {
      label: 'View Recorded Beneficiary',
      onPress: () => navigation.popToTop(),
    },
    {
      label: 'Logout',
      color: '#EE6969',
      onPress: async () => {
        const { clearUser } = await import('../../utils/auth');
        await clearUser();
        navigation.replace('Login');
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Loader */}
      <LoaderModal visible={loading} message="Fetching SHGs..." />

      {/* Header row: Title + Back + Menu */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{village.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BackButton />
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
            <Image
              source={HamburgerIcon}
              style={{ width: 28, height: 28, tintColor: '#333' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
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
          !loading && <Text style={styles.emptyText}>No SHGs found.</Text>
        }
      />

      {/* Burger Menu */}
      <BurgerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={menuItems}
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
