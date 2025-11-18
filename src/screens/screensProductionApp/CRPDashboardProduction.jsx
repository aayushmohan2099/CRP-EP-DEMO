import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { getUser, clearUser } from '../../utils/auth';
import gsApi from '../../api/gsApi';
import {
  setCrpDetail,
  getCrpDetail,
  setCrpPanchayats,
  getCrpPanchayats,
  setCrpRecordedBeneficiaries,
  getCrpRecordedBeneficiaries,
  setShgListForBlock,
  clearAllTemp,
} from '../../utils/tempStore';
import LoaderModal from '../LoaderModal';
import BurgerMenu from '../BurgerMenu';
import LanguageToggle from '../../components/LanguageToggle';
import { LanguageContext } from '../../components/LanguageContext';

export default function CRPDashboardProduction({ navigation }) {
  const { language } = useContext(LanguageContext);
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const translations = {
    en: {
      headerTitle: 'CRP Dashboard',
      recordNew: 'Record New Beneficiary Enterprise Detail',
      viewRecorded: 'View Recorded Beneficiaries',
      logout: 'Logout',
      loading: 'Loading analytics...',
      noData: 'No beneficiaries recorded yet.',
      totalLabel: 'Total recorded in your GPs',
    },
    hi: {
      headerTitle: 'सीआरपी डैशबोर्ड',
      recordNew: 'नया लाभार्थी उद्यम विवरण रिकॉर्ड करें',
      viewRecorded: 'रिकॉर्ड किए गए लाभार्थी देखें',
      logout: 'लॉग आउट',
      loading: 'एनालिटिक्स लोड हो रहा है...',
      noData: 'अभी तक कोई लाभार्थी रिकॉर्ड नहीं है।',
      totalLabel: 'आपके ग्राम पंचायतों में कुल रिकॉर्डिंग',
    },
  };

  const t = translations[language] || translations.en;

  // Safely extract userId from saved user object
  const getUserIdFromAuth = (u) => {
    if (!u) return null;
    // Login API: { access, refresh, user: { id: 1993, ... } }
    // Stored payload (from LoginForm): flattened, so u.id is present
    if (u.user && u.user.id) return u.user.id;
    if (u.id) return u.id;
    if (u.user_id) return u.user_id;
    if (u.master_user_id) return u.master_user_id;
    return null;
  };

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

      await bootstrapCrpData(u);
    })();
  }, []);

  const bootstrapCrpData = async (u) => {
    try {
      setLoading(true);

      const userId = getUserIdFromAuth(u);
      if (!userId) {
        Alert.alert(
          'Error',
          'Unable to determine user ID from login data. Please login again.'
        );
        return;
      }

      // 1) CRP detail (for block_id)
      let detail = getCrpDetail();
      if (!detail) {
        const res = await gsApi.getCrpDetailByUserId(userId);
        // CRP detail API returns direct object:
        // { id, name, block_id, ... }
        detail = res;
        setCrpDetail(detail);
      }

      const blockId = detail?.block_id;
      if (!blockId) {
        Alert.alert('Error', 'No block mapped to CRP. Please contact admin.');
        return;
      }

      // 2) Panchayats under CRP
      let crpPanchayats = getCrpPanchayats();
      if (!crpPanchayats.length) {
        const panRes = await gsApi.getPanchayatsUnderCrpByUserId(userId);
        // Panchayat API response:
        // { meta: {...}, data: [ {panchayat_id, panchayat_name_en, ...}, ... ] }
        if (Array.isArray(panRes?.data)) {
          crpPanchayats = panRes.data;
        } else if (Array.isArray(panRes)) {
          crpPanchayats = panRes;
        } else if (Array.isArray(panRes?.results)) {
          // backward safety if handleResponse had wrapped differently
          crpPanchayats = panRes.results;
        } else {
          crpPanchayats = [];
        }
        setCrpPanchayats(crpPanchayats);
      }

      const panchayatIds = crpPanchayats
        .map((p) => p.panchayat_id)
        .filter(Boolean);

      if (!panchayatIds.length) {
        setAnalytics([]);
        return;
      }

      // 3) Recorded beneficiaries for those panchayats
      let recorded = getCrpRecordedBeneficiaries();
      if (!recorded.length) {
        const res = await gsApi.getRecordedBeneficiaries({
          panchayat_multi: panchayatIds.join(','),
          page_size: 5000,
        });
        // recorded-beneficiaries API is DRF style: { count, next, previous, results: [...] }
        recorded = Array.isArray(res?.results)
          ? res.results
          : Array.isArray(res)
          ? res
          : [];
        setCrpRecordedBeneficiaries(recorded);
      }

      // 4) Also cache SHG list for CRP's block (used later in flow)
      const shgList = await gsApi.getUpsrlmShgList(blockId, { page_size: 5000 });
      // SHG list API response:
      // { meta: {...}, data: [ { blockId, code, name, panchayatId, villageId, ... }, ... ] }
      const shgRows = Array.isArray(shgList?.data)
        ? shgList.data
        : Array.isArray(shgList?.results)
        ? shgList.results
        : Array.isArray(shgList)
        ? shgList
        : [];
      setShgListForBlock(blockId, shgRows);

      // Build analytics per Panchayat
      const countsByPanchayat = {};
      recorded.forEach((row) => {
        const pid = row.panchayat_id;
        if (!pid) return;
        countsByPanchayat[pid] = (countsByPanchayat[pid] || 0) + 1;
      });

      const analyticsRows = crpPanchayats.map((p) => ({
        panchayat_id: p.panchayat_id,
        panchayat_name_en:
          p.panchayat_name_en || p.name || `Panchayat ${p.panchayat_id}`,
        total_recorded: countsByPanchayat[p.panchayat_id] || 0,
      }));

      setAnalytics(analyticsRows);
    } catch (err) {
      console.error('CRP analytics error', err);
      Alert.alert('Error', 'Failed to load CRP analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const total = analytics.reduce(
    (acc, row) => acc + (row.total_recorded || 0),
    0
  );

  const headerUsername =
    user?.user?.username || user?.username || 'CRP';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LoaderModal visible={loading} message={t.loading} />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LanguageToggle />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.userText}>{headerUsername}</Text>
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
        Gram Panchayat-wise analytics
      </Text>
      {analytics.length === 0 ? (
        <Text style={{ marginTop: 8, color: '#666' }}>{t.noData}</Text>
      ) : (
        analytics.map((row) => (
          <View key={row.panchayat_id} style={styles.analyticsRow}>
            <Text style={styles.analyticsName}>{row.panchayat_name_en}</Text>
            <Text style={styles.analyticsValue}>{row.total_recorded}</Text>
          </View>
        ))
      )}

      <View style={{ marginTop: 32, gap: 12 }}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('CRPRecordFlow')}
        >
          <Text style={styles.primaryButtonText}>{t.recordNew}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('CRPViewRecorded')}
        >
          <Text style={styles.secondaryButtonText}>{t.viewRecorded}</Text>
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
  primaryButton: {
    backgroundColor: '#EE6969',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
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
