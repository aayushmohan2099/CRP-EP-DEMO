import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { getUser, clearUser } from '../../utils/auth';
import gsApi from '../../api/gsApi';
import LoaderModal from '../../screens/LoaderModal';
import BurgerMenu from '../../screens/BurgerMenu';
import LanguageToggle from '../../components/LanguageToggle';
import { LanguageContext } from '../../components/LanguageContext';
import HamburgerIcon from '../../../assets/hamburger.png';

export default function AdminDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      recordBeneficiaries: 'Record New Beneficiaries Detail',
      viewBeneficiaries: 'View Recorded Beneficiaries',
      logout: 'Logout',
      loadingDistricts: 'Fetching districts...',
      errorFetchingDistricts: 'Error fetching districts. Please try again.',
      userPlaceholder: 'User',
    },
    hi: {
      recordBeneficiaries: 'नए लाभार्थियों का विवरण रिकॉर्ड करें',
      viewBeneficiaries: 'रिकॉर्ड किए गए लाभार्थियों देखें',
      logout: 'लॉग आउट',
      loadingDistricts: 'जिलों को लाया जा रहा है...',
      errorFetchingDistricts: 'जिलों को लाने में त्रुटि। कृपया पुनः प्रयास करें।',
      userPlaceholder: 'उपयोगकर्ता',
    },
  };

  const t = translations[language] || translations.en;

  // Load user on mount
  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u || null);
    })();
  }, []);

  // Handle "View Beneficiaries"
//   const handleViewBeneficiaries = async () => {
//     setLoading(true);
//     try {
//       const districts = await gsApi.getDistricts();

//       if (!districts || !Array.isArray(districts) || districts.length === 0) {
//         Alert.alert(t.errorFetchingDistricts, 'No districts found.');
//         setLoading(false);
//         return;
//       }

//       setLoading(false);
//       navigation.navigate('DistrictList', { districts });
//     } catch (err) {
//       console.error('Error fetching districts:', err);
//       Alert.alert(t.errorFetchingDistricts, err.message || 'Unknown error.');
//       setLoading(false);
//     }
//   };
    const handleViewBeneficiaries = async () => {
    setLoading(true);

    try {
        let res = await gsApi.getDistricts();

        console.log('Raw districts response:', res);

        let districts = [];

        if (typeof res === 'string') {
        res = res.trim();
        if (res.startsWith('{') || res.startsWith('[')) {
            try {
            res = JSON.parse(res);
            } catch (err) {
            console.error('JSON parse error:', err, 'Raw:', res);
            Alert.alert(t.errorFetchingDistricts, 'Invalid JSON response received.');
            setLoading(false);
            return;
            }
        } else {
            console.error('Non-JSON response:', res);
            Alert.alert(t.errorFetchingDistricts, 'Response is not valid JSON.');
            setLoading(false);
            return;
        }
        }

        // API returns object with `results` array
        if (res && Array.isArray(res.results)) {
        districts = res.results;
        } else {
        districts = [];
        }

        setLoading(false);

        if (districts.length === 0) {
        Alert.alert(t.errorFetchingDistricts, 'No districts found.');
        return;
        }

        // Navigate with districts array
        navigation.navigate('SelectDistrict', { districts });
    } catch (err) {
        console.error('Error fetching districts:', err);
        Alert.alert(t.errorFetchingDistricts, err.message || 'Unknown error.');
        setLoading(false);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.userText}>{user ? user.username : t.userPlaceholder}</Text>

        <View style={styles.headerRight}>
          <LanguageToggle />

          <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
            <Image source={HamburgerIcon} style={styles.hamburgerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Record Beneficiaries */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('SelectDistrict')}
      >
        <Text style={styles.primaryButtonText}>{t.recordBeneficiaries}</Text>
      </TouchableOpacity>

      {/* View Beneficiaries */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleViewBeneficiaries}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>{t.viewBeneficiaries}</Text>
      </TouchableOpacity>

      {/* Loader */}
      <LoaderModal visible={loading} message={t.loadingDistricts} />

      {/* Burger Menu */}
      <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hamburgerIcon: {
    width: 28,
    height: 28,
  },
  primaryButton: {
    backgroundColor: '#EE6969',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: '#EE6969',
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#EE6969',
    fontWeight: '500',
  },
});
