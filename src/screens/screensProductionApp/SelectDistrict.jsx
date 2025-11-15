// import React, { useEffect, useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import LoaderModal from '../LoaderModal';
// import SearchBar from '../SearchBar';
// import BackButton from '../../components/BackButton';
// import { LanguageContext } from '../../components/LanguageContext';
// import LanguageToggle from '../../components/LanguageToggle';
// import BurgerMenu from '../BurgerMenu';

// export default function SelectDistrict({ navigation, route }) {
//   const [query, setQuery] = useState('');
//   const [districts, setDistricts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const pageSize = 10; // adjust as needed

//   const { language } = useContext(LanguageContext);

//   const translations = {
//     en: {
//       title: 'Select District',
//       searchPlaceholder: 'Search District',
//       loading: 'Loading Districts...',
//       noItems: 'No Districts found.',
//       recorded: 'Recorded',
//       open: 'Open',
//       prev: 'Previous',
//       next: 'Next',
//     },
//     hi: {
//       title: 'जिला चुनें',
//       searchPlaceholder: 'जिला खोजें',
//       loading: 'जिलों को लोड किया जा रहा है...',
//       noItems: 'कोई जिला नहीं मिला।',
//       recorded: 'रिकॉर्डेड',
//       open: 'खोलें',
//       prev: 'पिछला',
//       next: 'अगला',
//     },
//   };

//   const t = translations[language] || translations.en;

//   // Load districts from route params
//   useEffect(() => {
//     const { districts: paramDistricts } = route.params || {};
//     if (paramDistricts && Array.isArray(paramDistricts)) {
//       setDistricts(paramDistricts);
//     } else {
//       Alert.alert('Error', 'No district data received.');
//     }
//     setLoading(false);
//   }, [route.params]);

//   const filtered = districts.filter(d => d.district_name_en?.toLowerCase().includes(query.toLowerCase()));
//   const totalPages = Math.ceil(filtered.length / pageSize);
//   const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

//   const menuItems = [
//     { label: 'Logout', color: '#EE6969', onPress: () => navigation.replace('Login') },
//   ];

//   return (
//     <View style={{ flex: 1, padding: 12 }}>
//       {/* HEADER */}
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 50 }}>
//         <View style={{ flexDirection: 'row', gap: 4 }}>
//           <LanguageToggle />
//           <BackButton />
//         </View>
//         <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{t.title}</Text>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
//             <Text style={{ fontWeight: 'bold', fontSize: 18 }}>☰</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* SEARCH */}
//       <SearchBar
//         placeholder={t.searchPlaceholder}
//         value={query}
//         onChangeText={text => { setQuery(text); setPage(1); }}
//         style={{ marginBottom: 12 }}
//       />

//       <LoaderModal visible={loading} message={t.loading} />

//       {!loading && (
//         <>
//           <FlatList
//             data={paginated}
//             keyExtractor={item => String(item.district_id)}
//             renderItem={({ item }) => (
//               <View style={styles.listItem}>
//                 <Text style={styles.listText}>
//                   {item.district_name_en} ({item.district_short_name_en})
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.openButton}
//                onPress={() => navigation.navigate('BlockList', { adminDistrictId: item.district_id })}
//                 >
//                   <Text style={styles.buttonText}>{t.open}</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//             ListEmptyComponent={<Text style={{ color: '#666', marginTop: 12 }}>{t.noItems}</Text>}
//           />

//           {totalPages > 1 && (
//             <View style={styles.pagination}>
//               <TouchableOpacity
//                 disabled={page <= 1}
//                 onPress={() => setPage(prev => Math.max(prev - 1, 1))}
//                 style={[styles.pageButton, page <= 1 && styles.disabledButton]}
//               >
//                 <Text style={styles.buttonText}>{t.prev}</Text>
//               </TouchableOpacity>

//               <Text style={{ alignSelf: 'center' }}>{page} / {totalPages}</Text>

//               <TouchableOpacity
//                 disabled={page >= totalPages}
//                 onPress={() => setPage(prev => Math.min(prev + 1, totalPages))}
//                 style={[styles.pageButton, page >= totalPages && styles.disabledButton]}
//               >
//                 <Text style={styles.buttonText}>{t.next}</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </>
//       )}

//       <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
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
//   listText: { flex: 1, fontSize: 15 },
//   openButton: { backgroundColor: '#EE6969', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
//   pageButton: { padding: 8, backgroundColor: '#EE6969', borderRadius: 6 },
//   disabledButton: { backgroundColor: '#ccc' },
//   buttonText: { color: '#fff', fontWeight: '600' },
//   pagination: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
// });


// import React, { useEffect, useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import LoaderModal from '../LoaderModal';
// import SearchBar from '../SearchBar';
// import BackButton from '../../components/BackButton';
// import { LanguageContext } from '../../components/LanguageContext';
// import LanguageToggle from '../../components/LanguageToggle';
// import BurgerMenu from '../BurgerMenu';
// import gsApi from '../../api/gsApi';  // Assuming gsApi is your API file

// export default function SelectDistrict({ navigation, route }) {
//   const [query, setQuery] = useState('');
//   const [districts, setDistricts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const pageSize = 10; // Set the number of districts per page

//   const { language } = useContext(LanguageContext);

//   // Translations for different languages (English and Hindi)
//   const translations = {
//     en: {
//       title: 'Select District',
//       searchPlaceholder: 'Search District',
//       loading: 'Loading Districts...',
//       noItems: 'No Districts found.',
//       recorded: 'Recorded',
//       open: 'Open',
//       prev: 'Previous',
//       next: 'Next',
//     },
//     hi: {
//       title: 'जिला चुनें',
//       searchPlaceholder: 'जिला खोजें',
//       loading: 'जिलों को लोड किया जा रहा है...',
//       noItems: 'कोई जिला नहीं मिला।',
//       recorded: 'रिकॉर्डेड',
//       open: 'खोलें',
//       prev: 'पिछला',
//       next: 'अगला',
//     },
//   };

//   const t = translations[language] || translations.en;

//   // Fetch districts from the API when the page number or search query changes
//   useEffect(() => {
//     const fetchDistricts = async () => {
//       setLoading(true);
//       try {
//         const data = await gsApi.getDistricts(page);  // Get districts based on the current page
//         setDistricts(data.results);  // Assuming `results` contains the list of districts
//         // const totalPages = (data.count / 10);
//         // setTotalPages(totalPages);  // Assuming `total_pages` gives the total number of pages

//         const total = data.count || 0; // Get the total count of districts
//         setTotalPages(Math.ceil(total / pageSize));  // Calculate total pages
//       } catch (error) {
//         console.error('Error fetching districts:', error);
//         Alert.alert('Error', 'Failed to load districts.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDistricts();
//   }, [page, query]);  // Fetch districts on page change or query change

//   // Filter districts based on the search query
//   const filteredDistricts = districts.filter(d =>
//     d.district_name_en?.toLowerCase().includes(query.toLowerCase())
//   );

//   // Paginated data based on the current page and page size
//   const paginatedDistricts = filteredDistricts.slice((page - 1) * pageSize, page * pageSize);

//   const handleSearchChange = (text) => {
//     setQuery(text);
//     setPage(1);  // Reset to first page when search query changes
//   };

//   // Menu items for the burger menu
//   const menuItems = [
//     { label: 'Logout', color: '#EE6969', onPress: () => navigation.replace('Login') },
//   ];

//   return (
//     <View style={{ flex: 1, padding: 12 }}>
//       {/* HEADER */}
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 50 }}>
//         <View style={{ flexDirection: 'row', gap: 4 }}>
//           <LanguageToggle />
//           <BackButton />
//         </View>
//         <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{t.title}</Text>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
//             <Text style={{ fontWeight: 'bold', fontSize: 18 }}>☰</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* SEARCH BAR */}
//       <SearchBar
//         placeholder={t.searchPlaceholder}
//         value={query}
//         onChangeText={handleSearchChange}
//         style={{ marginBottom: 12 }}
//       />

//       {/* LOADER MODAL */}
//       <LoaderModal visible={loading} message={t.loading} />

//       {/* DISTRICT LIST */}
//       {!loading && (
//         <>
//           <FlatList
//             data={paginatedDistricts}
//             keyExtractor={(item) => String(item.district_id)}
//             renderItem={({ item }) => (
//               <View style={styles.listItem}>
//                 <Text style={styles.listText}>
//                   {item.district_name_en} ({item.district_short_name_en})
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.openButton}
//                   onPress={() => navigation.navigate('BlockList', { adminDistrictId: item.district_id })}
//                 >
//                   <Text style={styles.buttonText}>{t.open}</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//             ListEmptyComponent={<Text style={{ color: '#666', marginTop: 12 }}>{t.noItems}</Text>}
//           />

//           {/* PAGINATION */}
//           {totalPages > 1 && (
//             <View style={styles.pagination}>
//               <TouchableOpacity
//                 disabled={page <= 1 || loading}
//                 onPress={() => setPage(prev => Math.max(prev - 1, 1))}
//                 style={[styles.pageButton, page <= 1 && styles.disabledButton]}
//               >
//                 <Text style={styles.buttonText}>{t.prev}</Text>
//               </TouchableOpacity>

//               <Text style={{ alignSelf: 'center' }}>
//                 {page} / {totalPages}
//               </Text>

//               <TouchableOpacity
//                 disabled={page >= totalPages || loading}
//                 onPress={() => setPage(prev => Math.min(prev + 1, totalPages))}
//                 style={[styles.pageButton, page >= totalPages && styles.disabledButton]}
//               >
//                 <Text style={styles.buttonText}>{t.next}</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </>
//       )}

//       {/* BURGER MENU */}
//       <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
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
//   listText: { flex: 1, fontSize: 15 },
//   openButton: { backgroundColor: '#EE6969', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
//   pageButton: { padding: 8, backgroundColor: '#EE6969', borderRadius: 6 },
//   disabledButton: { backgroundColor: '#ccc' },
//   buttonText: { color: '#fff', fontWeight: '600' },
//   pagination: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
// });




import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import LoaderModal from '../LoaderModal';
import SearchBar from '../SearchBar';
import BackButton from '../../components/BackButton';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';
import BurgerMenu from '../BurgerMenu';
import gsApi from '../../api/gsApi'; // Assuming gsApi is your API file

export default function SelectDistrict({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const pageSize = 10; // Set the number of districts per page

  const { language } = useContext(LanguageContext);

  // Translations for different languages (English and Hindi)
  const translations = {
    en: {
      title: 'Select District',
      searchPlaceholder: 'Search District',
      loading: 'Loading Districts...',
      noItems: 'No Districts found.',
      recorded: 'Recorded',
      open: 'Open',
      prev: 'Previous',
      next: 'Next',
    },
    hi: {
      title: 'जिला चुनें',
      searchPlaceholder: 'जिला खोजें',
      loading: 'जिलों को लोड किया जा रहा है...',
      noItems: 'कोई जिला नहीं मिला।',
      recorded: 'रिकॉर्डेड',
      open: 'खोलें',
      prev: 'पिछला',
      next: 'अगला',
    },
  };

  const t = translations[language] || translations.en;

  // Fetch districts from the API when page or query changes
  useEffect(() => {
    const fetchDistricts = async () => {
      setLoading(true);
      try {
        // Pass page and query to server, so it returns filtered and paginated results
        const data = await gsApi.getDistricts(page, query);
        setDistricts(data.results); // Directly show districts from API
        const total = data.count || 0; // Total count from API
        setTotalPages(Math.ceil(total / pageSize)); // Calculate total pages
      } catch (error) {
        console.error('Error fetching districts:', error);
        Alert.alert('Error', 'Failed to load districts.');
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, [page, query]);

  const handleSearchChange = (text) => {
    setQuery(text);
    setPage(1); // Reset to first page when query changes
  };

  // Menu items for the burger menu
  const menuItems = [
    { label: 'Logout', color: '#EE6969', onPress: () => navigation.replace('Login') },
  ];

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: 'white' }}>
      {/* HEADER */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 50 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <LanguageToggle />
          <BackButton />
        </View>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{t.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH BAR */}
      <SearchBar
        placeholder={t.searchPlaceholder}
        value={query}
        onChangeText={handleSearchChange}
        style={{ marginBottom: 12 }}
      />

      {/* LOADER MODAL */}
      <LoaderModal visible={loading} message={t.loading} />

      {/* DISTRICT LIST */}
      {!loading && (
        <>
          <FlatList
            data={districts} // Use districts fetched for the current page!
            keyExtractor={(item) => String(item.district_id)}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listText}>
                  {item.district_name_en} ({item.district_short_name_en})
                </Text>
                <TouchableOpacity
                  style={styles.openButton}
                  onPress={() => navigation.navigate('BlockList', { adminDistrictId: item.district_id })}
                >
                  <Text style={styles.buttonText}>{t.open}</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#666', marginTop: 12 }}>{t.noItems}</Text>}
          />

          {/* PAGINATION */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                disabled={page <= 1 || loading}
                onPress={() => setPage(prev => Math.max(prev - 1, 1))}
                style={[styles.pageButton, page <= 1 && styles.disabledButton]}
              >
                <Text style={styles.buttonText}>{t.prev}</Text>
              </TouchableOpacity>

              <Text style={{ alignSelf: 'center' }}>
                {page} / {totalPages}
              </Text>

              <TouchableOpacity
                disabled={page >= totalPages || loading}
                onPress={() => setPage(prev => Math.min(prev + 1, totalPages))}
                style={[styles.pageButton, page >= totalPages && styles.disabledButton]}
              >
                <Text style={styles.buttonText}>{t.next}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* BURGER MENU */}
      <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
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
  listText: { flex: 1, fontSize: 15 },
  openButton: { backgroundColor: '#EE6969', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  pageButton: { padding: 8, backgroundColor: '#EE6969', borderRadius: 6 },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '600' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});
