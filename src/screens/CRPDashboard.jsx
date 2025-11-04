// // src/screens/CRPDashboard.jsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, ScrollView, ActivityIndicator, Alert } from 'react-native';
// import { getUser, clearUser } from '../utils/auth';
// import gsApi from '../api/gsApi';

// export default function CRPDashboard({ navigation }) {
//   const [user, setUser] = useState(null);
//   const [panchayats, setPanchayats] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const u = await getUser();
//         setUser(u || null);
//         if (u && u.assigned_clf_id) {
//           const res = await gsApi.panchayatsByClf(u.assigned_clf_id);
//           if (Array.isArray(res)) setPanchayats(res);
//           else setPanchayats([]);
//         } else {
//           setPanchayats([]);
//         }
//       } catch (err) {
//         console.warn('CRPDashboard load error', err);
//         Alert.alert('Error', String(err));
//         setPanchayats([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const logout = async () => { await clearUser(); navigation.replace('Login'); };

//   return (
//     <ScrollView style={{ flex: 1, padding: 16 }}>
//       <Text style={{ fontSize: 20 }}>Welcome {user ? user.username : ''}</Text>

//       <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Analytics (Your CLF)</Text>

//       {loading ? (
//         <View style={{ marginVertical: 20, alignItems: 'center' }}>
//           <ActivityIndicator size="large" />
//         </View>
//       ) : (
//         <>
//           {panchayats.length === 0 ? (
//             <Text style={{ marginVertical: 12, color: '#666' }}>No Panchayats found or no data recorded yet.</Text>
//           ) : (
//             panchayats.map(p => (
//               <View key={p.id} style={{ padding: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
//                 <Text>{p.name} — Recorded: {p.recorded_count ?? 0}</Text>
//               </View>
//             ))
//           )}
//         </>
//       )}

//       <View style={{ marginTop: 20 }}>
//         <Button title="Record new Beneficiary Enterprise" onPress={() => navigation.navigate('SelectGP')} />
//       </View>

//       <View style={{ marginTop: 12 }}>
//         <Button title="View Recorded Beneficiaries" onPress={() => navigation.navigate('SelectGP', { viewOnly: true })} />
//       </View>

//       <View style={{ marginTop: 12 }}>
//         <Button title="Logout" onPress={logout} color="red" />
//       </View>

//       <View style={{ height: 24 }} />
//     </ScrollView>
//   );
// }


import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { getUser, clearUser } from '../utils/auth';
import gsApi from '../api/gsApi';
import LoaderModal from './LoaderModal';
import HamburgerIcon from '../../assets/hamburger.png';
import BurgerMenu from './BurgerMenu';
import LanguageToggle from '../components/LanguageToggle'; // <- import the toggle component

export default function CRPDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [language, setLanguage] = useState('en'); // default language

  const translations = {
    en: {
      recordBeneficiaries: "Record New Beneficiaries Detail",
      viewBeneficiaries: "View Recorded Beneficiaries",
      logout: "Logout",
      openingBeneficiaries: "Opening recorded beneficiaries",
      userPlaceholder: "User",
    },
    hi: {
      recordBeneficiaries: "नए लाभार्थियों का विवरण रिकॉर्ड करें",
      viewBeneficiaries: "रिकॉर्ड किए गए लाभार्थियों देखें",
      logout: "लॉग आउट",
      openingBeneficiaries: "रिकॉर्ड किए गए लाभार्थियों को खोल रहे हैं",
      userPlaceholder: "उपयोगकर्ता",
    },
  };
  const t = translations[language];

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u || null);
    })();
  }, []);

  const handleViewBeneficiaries = () => {
    setViewModalOpen(true);
    setTimeout(() => {
      setViewModalOpen(false);
      navigation.navigate('SelectGP', { viewOnly: true });
    }, 1500);
  };

  const menuItems = [
    {
      label: t.logout,
      onPress: async () => {
        await clearUser();
        navigation.replace('Login');
      },
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userText}>{user ? user.username : t.userPlaceholder}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Language toggle */}
          <LanguageToggle language={language} setLanguage={setLanguage} />
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
            <Image source={HamburgerIcon} style={{ width: 28, height: 28 }} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('SelectGP')}
      >
        <Text style={styles.primaryButtonText}>{t.recordBeneficiaries}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleViewBeneficiaries}>
        <Text style={styles.secondaryButtonText}>{t.viewBeneficiaries}</Text>
      </TouchableOpacity>

      <LoaderModal visible={viewModalOpen} message={t.openingBeneficiaries} />

      <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, paddingTop: 50, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  userText: { fontSize: 16, fontWeight: '600' },
  primaryButton: { backgroundColor: '#EE6969', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: { borderColor: '#EE6969', borderWidth: 1, padding: 12, borderRadius: 6, alignItems: 'center' },
  secondaryButtonText: { color: '#EE6969', fontWeight: '500' },
});
