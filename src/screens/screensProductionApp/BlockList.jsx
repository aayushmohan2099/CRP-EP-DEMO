// import React, { useEffect, useState, useContext } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
// import gsApi from '../../api/gsApi';
// import LoaderModal from '../../screens/LoaderModal';
// import BackButton from '../../components/BackButton';
// import SearchBar from '../../screens/SearchBar';
// import BurgerMenu from '../../screens/BurgerMenu';
// import { LanguageContext } from '../../components/LanguageContext';
// import LanguageToggle from '../../components/LanguageToggle';

// export default function BlockList({ navigation, route }) {
//   // Check if 'district' is being passed in route.params
//   const { district } = route.params || {};
//   const { language } = useContext(LanguageContext);

//   const [blocks, setBlocks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [query, setQuery] = useState('');
//   const [menuOpen, setMenuOpen] = useState(false);

//   // If district is not available, show an error message
//   if (!district) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>Error: No district data available!</Text>
//       </View>
//     );
//   }

//   const translations = {
//     en: {
//       searchPlaceholder: 'Search Block',
//       headerTitle: 'Blocks',
//       open: 'Open',
//       noItems: 'No blocks found.',
//       fetching: 'Fetching blocks...',
//     },
//     hi: {
//       searchPlaceholder: 'ब्लॉक खोजें',
//       headerTitle: 'ब्लॉक्स',
//       open: 'खोलें',
//       noItems: 'कोई ब्लॉक नहीं मिला।',
//       fetching: 'ब्लॉक्स लोड हो रहे हैं...',
//     },
//   };

//   const t = translations[language] || translations.en;

//   // Fetch blocks from API
//   useEffect(() => {
//     const fetchBlocks = async () => {
//       try {
//         setLoading(true);
//         const res = await gsApi.getBlocksByDistrict(district.district_id);
//         setBlocks(res || []);
//       } catch (err) {
//         console.warn('Error fetching blocks:', err);
//         setBlocks([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBlocks();
//   }, [district.district_id]);

//   // Filter blocks based on search query
//   const filteredBlocks = blocks.filter(b =>
//     b.block_name_en?.toLowerCase().includes(query.toLowerCase())
//   );

//   const menuItems = [
//     { label: 'Record New Beneficiary Detail', onPress: () => navigation.popToTop() },
//     { label: 'View Recorded Beneficiary', onPress: () => navigation.popToTop() },
//     {
//       label: 'Logout',
//       color: '#EE6969',
//       onPress: async () => {
//         const { clearUser } = await import('../../utils/auth');
//         await clearUser();
//         navigation.replace('Login');
//       },
//     },
//   ];

//   return (
//     <View style={styles.container}>
//       <LoaderModal visible={loading} message={t.fetching} />

//       {/* HEADER */}
//       <View style={styles.headerRow}>
//         <View style={{ gap: 4 }}>
//           <LanguageToggle style={{ marginRight: 10 }} />
//           <BackButton />
//         </View>
//         <Text style={styles.title}>{t.headerTitle}</Text>
//         <View style={styles.rightHeader}>
//           <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginRight: 8 }}>
//             <Text style={{ fontSize: 28 }}>☰</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* SEARCH */}
//       <SearchBar
//         placeholder={t.searchPlaceholder}
//         value={query}
//         onChangeText={setQuery}
//         style={{ marginBottom: 12 }}
//       />

//       {/* BLOCKS LIST */}
//       <FlatList
//         data={filteredBlocks}
//         keyExtractor={item => String(item.block_id)}
//         renderItem={({ item }) => (
//           <View style={styles.listItem}>
//             <Text style={styles.listText}>{item.block_name_en}</Text>
//             <TouchableOpacity
//               style={styles.openButton}
//               onPress={() =>
//                 navigation.navigate('SelectGP', { adminBlockId: item.block_id })
//               }
//             >
//               <Text style={styles.buttonText}>{t.open}</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={
//           !loading && <Text style={styles.emptyText}>{t.noItems}</Text>
//         }
//       />

//       {/* BURGER MENU */}
//       <BurgerMenu
//         visible={menuOpen}
//         onClose={() => setMenuOpen(false)}
//         menuItems={menuItems}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 12, marginTop: 50, backgroundColor: '#fff' },
//   centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   errorText: { fontSize: 16, color: 'red' },
//   headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, position: 'relative' },
//   title: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#333' },
//   rightHeader: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
//   listItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EE6969',
//     marginBottom: 4,
//   },
//   listText: { flex: 1, fontSize: 15, color: '#222' },
//   openButton: { backgroundColor: '#EE6969', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
//   buttonText: { color: '#fff', fontWeight: '600' },
//   emptyText: { color: '#666', marginTop: 12, textAlign: 'center' },
// });


// screens/BlockList.jsx
// import React, { useEffect, useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import gsApi from '../../api/gsApi';
// import LoaderModal from '../../screens/LoaderModal';
// import BackButton from '../../components/BackButton';
// import SearchBar from '../../screens/SearchBar';
// import BurgerMenu from '../../screens/BurgerMenu';
// import { LanguageContext } from '../../components/LanguageContext';
// import LanguageToggle from '../../components/LanguageToggle';

// export default function BlockList({ navigation, route }) {
//   const { adminDistrictId } = route.params || {}; // ✅ get district ID
//   const { language } = useContext(LanguageContext);

//   const [blocks, setBlocks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [query, setQuery] = useState('');
//   const [menuOpen, setMenuOpen] = useState(false);

//   const translations = {
//     en: {
//       searchPlaceholder: 'Search Block',
//       headerTitle: 'Blocks',
//       open: 'Open',
//       noItems: 'No blocks found.',
//       fetching: 'Fetching blocks...',
//     },
//     hi: {
//       searchPlaceholder: 'ब्लॉक खोजें',
//       headerTitle: 'ब्लॉक्स',
//       open: 'खोलें',
//       noItems: 'कोई ब्लॉक नहीं मिला।',
//       fetching: 'ब्लॉक्स लोड हो रहे हैं...',
//     },
//   };

//   const t = translations[language] || translations.en;

//   // 🚨 Check if district ID is available
//   useEffect(() => {
//     if (!adminDistrictId) return;

//     const fetchBlocks = async () => {
//       try {
//         setLoading(true);
//         const res = await gsApi.getBlocksByDistrict(adminDistrictId);
//         setBlocks(res || []);
//       } catch (err) {
//         console.warn('Error fetching blocks:', err);
//         setBlocks([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBlocks();
//   }, [adminDistrictId]);

//   const filteredBlocks = blocks.filter(b =>
//     b.block_name_en?.toLowerCase().includes(query.toLowerCase())
//   );

//   const menuItems = [
//     {
//       label: 'Logout',
//       color: '#EE6969',
//       onPress: async () => {
//         const { clearUser } = await import('../../utils/auth');
//         await clearUser();
//         navigation.replace('Login');
//       },
//     },
//   ];

//   return (
//     <View style={styles.container}>
//       <LoaderModal visible={loading} message={t.fetching} />

//       {/* HEADER */}
//       <View style={styles.headerRow}>
//         <View style={{ gap: 4, flexDirection: 'row' }}>
//           <LanguageToggle />
//           <BackButton />
//         </View>
//         <Text style={styles.title}>{t.headerTitle}</Text>
//         <View style={styles.rightHeader}>
//           <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginRight: 8 }}>
//             <Text style={{ fontSize: 28 }}>☰</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* SEARCH */}
//       <SearchBar
//         placeholder={t.searchPlaceholder}
//         value={query}
//         onChangeText={setQuery}
//         style={{ marginBottom: 12 }}
//       />

//       {/* BLOCKS LIST */}
//       <FlatList
//         data={filteredBlocks}
//         keyExtractor={item => String(item.block_id)}
//         renderItem={({ item }) => (
//           <View style={styles.listItem}>
//             <Text style={styles.listText}>{item.block_name_en}</Text>
//             <TouchableOpacity
//               style={styles.openButton}
//               onPress={() =>
//                 navigation.navigate('SelectGP', { adminBlockId: item.block_id })
//               }
//             >
//               <Text style={styles.buttonText}>{t.open}</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={
//           !loading && <Text style={styles.emptyText}>{t.noItems}</Text>
//         }
//       />

//       {/* BURGER MENU */}
//       <BurgerMenu
//         visible={menuOpen}
//         onClose={() => setMenuOpen(false)}
//         menuItems={menuItems}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 12, marginTop: 50, backgroundColor: '#fff' },
//   headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, position: 'relative' },
//   title: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#333' },
//   rightHeader: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
//   listItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EE6969',
//     marginBottom: 4,
//   },
//   listText: { flex: 1, fontSize: 15, color: '#222' },
//   openButton: { backgroundColor: '#EE6969', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
//   buttonText: { color: '#fff', fontWeight: '600' },
//   emptyText: { color: '#666', marginTop: 12, textAlign: 'center' },
// });


import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import gsApi from '../../api/gsApi';
import LoaderModal from '../../screens/LoaderModal';
import BackButton from '../../components/BackButton';
import SearchBar from '../../screens/SearchBar';
import BurgerMenu from '../../screens/BurgerMenu';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function BlockList({ navigation, route }) {
  const { adminDistrictId } = route.params || {}; // ✅ Get district ID
  const { language } = useContext(LanguageContext);

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const translations = {
    en: {
      searchPlaceholder: 'Search Block',
      headerTitle: 'Blocks',
      open: 'Open',
      noItems: 'No blocks found.',
      fetching: 'Fetching blocks...',
    },
    hi: {
      searchPlaceholder: 'ब्लॉक खोजें',
      headerTitle: 'ब्लॉक्स',
      open: 'खोलें',
      noItems: 'कोई ब्लॉक नहीं मिला।',
      fetching: 'ब्लॉक्स लोड हो रहे हैं...',
    },
  };

  const t = translations[language] || translations.en;

  // Fetch blocks when district ID changes
    useEffect(() => {
    if (!adminDistrictId) return;

    const fetchBlocks = async () => {
        try {
        setLoading(true);
        const res = await gsApi.getBlocksByDistrict(adminDistrictId);
        console.log('Raw blocks response:', res);

        if (Array.isArray(res)) {
            setBlocks(res); // use res directly
        } else if (Array.isArray(res?.results)) {
            setBlocks(res.results);
        } else {
            setBlocks([]);
        }
        } catch (err) {
        console.warn('Error fetching blocks:', err);
        setBlocks([]);
        } finally {
        setLoading(false);
        }
    };

    fetchBlocks();
    }, [adminDistrictId]);

  // Filter blocks based on search query
  const filteredBlocks = Array.isArray(blocks)
    ? blocks.filter(b =>
        b.block_name_en?.toLowerCase().trim().includes(query.toLowerCase().trim())
      )
    : [];

  const menuItems = [
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
    useEffect(() => {
    console.log('blocks updated:', blocks);
    console.log('filteredBlocks:', filteredBlocks);
    }, [blocks]);
      

  return (
    <View style={styles.container}>
      <LoaderModal visible={loading} message={t.fetching} />

      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={{ gap: 4, flexDirection: 'row' }}>
          <LanguageToggle />
          <BackButton />
        </View>
        <Text style={styles.title}>{t.headerTitle}</Text>
        <View style={styles.rightHeader}>
          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            style={{ marginRight: 8 }}
          >
            <Text style={{ fontSize: 28 }}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH */}
      <SearchBar
        placeholder={t.searchPlaceholder}
        value={query}
        onChangeText={text => setQuery(text)}
        style={{ marginBottom: 12 }}
      />

      {/* BLOCKS LIST */}
      <FlatList
        data={filteredBlocks}
        keyExtractor={item => String(item.block_id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>{item.block_name_en}</Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() =>
                navigation.navigate('SelectGP', { adminBlockId: item.block_id })
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

      {/* BURGER MENU */}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  rightHeader: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
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
  listText: { flex: 1, fontSize: 15, color: '#222' },
  openButton: {
    backgroundColor: '#EE6969',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: '#666', marginTop: 12, textAlign: 'center' },
});
