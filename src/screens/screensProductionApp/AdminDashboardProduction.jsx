import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { getUser, clearUser } from '../../utils/auth';
import gsApi from '../../api/gsApi';
import LoaderModal from '../LoaderModal';
import BurgerMenu from '../BurgerMenu';
import LanguageToggle from '../../components/LanguageToggle';
import { LanguageContext } from '../../components/LanguageContext';
import { clearAllTemp } from '../../utils/tempStore';

export default function AdminDashboardProduction({ navigation }) {
  const [user, setUser] = useState(null);
  const [districtAnalytics, setDistrictAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      headerTitle: 'Admin Dashboard',
      logout: 'Logout',
      loading: 'Fetching district analytics...',
      totalLabel: 'Total beneficiaries recorded',
      openHierarchy: 'View block / GP / village hierarchy',
    },
    hi: {
      headerTitle: 'एडमिन डैशबोर्ड',
      logout: 'लॉग आउट',
      loading: 'जिला एनालिटिक्स प्राप्त किए जा रहे हैं...',
      totalLabel: 'कुल लाभार्थी रिकॉर्डेड',
      openHierarchy: 'ब्लॉक / जीपी / गांव सूची देखें',
    },
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) {
        navigation.replace('Login');
        return;
      }
      setUser(u);
      if (u.access) {
        gsApi.setAuthToken?.(u.access);
      }
      await loadDistrictAnalytics();
    })();
  }, []);

  const loadDistrictAnalytics = async () => {
    try {
      setLoading(true);
      // group_by=district_id from recorded-beneficiaries
      const res = await gsApi.getRecordedBeneficiaries({
        group_by: 'district_id',
        page_size: 1000,
      });
      const data = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      const rows = data.map((row) => ({
        district_id: row.group?.district_id ?? row.district_id,
        count: row.count ?? 0,
      }));

      // Enrich with district names
      const lookup = await gsApi.getDistricts(1, '');
      const lookupRows = Array.isArray(lookup?.results)
        ? lookup.results
        : Array.isArray(lookup)
        ? lookup
        : [];
      const nameById = {};
      lookupRows.forEach((d) => {
        nameById[d.district_id] = d.district_name_en;
      });

      const merged = rows.map((r) => ({
        ...r,
        district_name_en: nameById[r.district_id] || `District ${r.district_id}`,
      }));

      setDistrictAnalytics(merged);
    } catch (err) {
      console.error('Admin analytics error', err);
    } finally {
      setLoading(false);
    }
  };

  const total = districtAnalytics.reduce((acc, r) => acc + (r.count || 0), 0);

  const handleLogout = async () => {
    clearAllTemp();
    await clearUser();
    gsApi.setAuthToken?.(null);
    navigation.replace('Login');
  };

  const menuItems = [
    {
      label: t.logout,
      color: '#EE6969',
      onPress: handleLogout,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LoaderModal visible={loading} message={t.loading} />

      <View style={styles.header}>
        <LanguageToggle />
        <View style={styles.headerRight}>
          <Text style={styles.userText}>{user?.username || 'Admin'}</Text>
          <TouchableOpacity
            style={{ marginLeft: 12 }}
            onPress={() => setMenuOpen(true)}
          >
            <Text style={{ fontSize: 26 }}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>{t.headerTitle}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.totalLabel}</Text>
        <Text style={styles.totalNumber}>{total}</Text>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
        District-wise analytics
      </Text>
      {districtAnalytics.map((row) => (
        <TouchableOpacity
          key={row.district_id}
          style={styles.analyticsRow}
          onPress={() =>
            navigation.navigate('BlockList', {
              adminDistrictId: row.district_id,
            })
          }
        >
          <Text style={styles.analyticsName}>{row.district_name_en}</Text>
          <Text style={styles.analyticsValue}>{row.count}</Text>
        </TouchableOpacity>
      ))}

      <View style={{ marginTop: 30 }}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SelectDistrict')}
        >
          <Text style={styles.secondaryButtonText}>{t.openHierarchy}</Text>
        </TouchableOpacity>
      </View>

      <BurgerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={menuItems}
      />
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
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'left',
    color: '#EE6969',
  },
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#F9ECEC',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#555',
  },
  totalNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#EE6969',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  analyticsName: { fontSize: 14, flex: 1, paddingRight: 8 },
  analyticsValue: { fontSize: 14, fontWeight: '600', color: '#333' },
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
