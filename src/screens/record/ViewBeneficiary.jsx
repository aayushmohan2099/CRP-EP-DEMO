// src/screens/record/ViewBeneficiary.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';
import BurgerMenu from '../BurgerMenu';
import HamburgerIcon from '../../../assets/hamburger.png';

// Beneficiary fields to display
const BENEFICIARY_FIELDS = [
  'name', 'dob', 'gender', 'phone', 'other_contact', 'shg_joining_date',
  'marital_status', 'education', 'parent_spouce_name', 'relation', 'religion',
  'social_category', 'remarks',
];

// ExistingEnterprise fields (same as before)
const EXISTING_ENTERPRISE_FIELDS = [
  'enterprise_name','enterprise_type','ownership_type','year_of_establishment',
  'raw_material','machinery_equipment','workplace_type','electricity_available',
  'water_available','transportation_facility','initial_investment','source_of_investment',
  'working_capital_monthly','annual_turnover','profit_percentage','loan_details',
  'main_product_service','product_features','production_capacity','packaging_branding_status',
  'certification_registration','target_customers','marketing_channels','monthly_sales',
  'marketing_strategy','marketing_challenges','training_received','skills_acquired',
  'future_training_requirements','institutional_support','financial_coordination',
  'market_linkage','mentorship_support','expansion_plan','required_support',
  'photo_enterprise','photo_entrepreneur','photo_product','certificate_docs',
  'recorded_by_user_id','created_at','updated_at','deleted_at'
];

// NewEnterprise fields
const NEW_ENTERPRISE_FIELDS = [
  'interested_business','has_arranged_place','arranged_place_address','is_trained','training_details',
  'skill_training_support','entre_dev_training_support','credit_linkage_support','market_linkage_support',
  'machinery_support','worksite_support','digital_support','other_support',
  'recorded_by_user_id','created_at','updated_at','deleted_at'
];

const LABELS = {
  en: {
    beneficiaryHeader: 'Beneficiary',
    enterpriseDetails: 'Enterprise Details',
    editEnterprise: 'Edit Enterprise',
    recordEnterprise: 'Record Enterprise',
    noEnterprise: 'No enterprise record found for this beneficiary.',
    existingHeader: 'Existing Enterprise',
    newHeader: 'Interest / New Enterprise',
  },
  hi: {
    beneficiaryHeader: 'लाभार्थी',
    enterpriseDetails: 'उद्यम विवरण',
    editEnterprise: 'उद्यम संपादित करें',
    recordEnterprise: 'उद्यम रिकॉर्ड करें',
    noEnterprise: 'इस लाभार्थी के लिए कोई उद्यम रिकॉर्ड नहीं मिला।',
    existingHeader: 'मौजूदा उद्यम',
    newHeader: 'नया उद्यम / रुचि',
  },
};

// simple image heuristic
function looksLikeImage(url) {
  if (!url || typeof url !== 'string') return false;
  const lower = url.split('?')[0].split('#')[0].toLowerCase();
  return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(lower);
}

function fmtDate(val) {
  if (!val) return '';
  const d = new Date(val);
  return !isNaN(d.getTime()) ? d.toLocaleString() : String(val);
}

function renderRow(label, value, styles) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return (
    <View style={styles.row} key={label + String(value).slice(0, 20)}>
      <Text style={styles.label}>{label.replace(/_/g, ' ')}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );
}

export default function ViewBeneficiary({ navigation, route }) {
  const { language } = useContext(LanguageContext);
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const beneficiary = route?.params?.beneficiary ?? {};

  useEffect(() => {
    const loadEnterprise = async () => {
      if (!beneficiary?.id) return;
      setLoading(true);
      try {
        // prefer ExistingEnterprise
        const ex = await gsApi.read('ExistingEnterprise', 'beneficiary_id', beneficiary.id, { cache: true });
        if (Array.isArray(ex) && ex.length) {
          setEnterprise(Object.assign({}, ex[0], { __sheet: 'ExistingEnterprise' }));
        } else {
          // fallback to NewEnterprise
          const nw = await gsApi.read('NewEnterprise', 'beneficiary_id', beneficiary.id, { cache: true });
          if (Array.isArray(nw) && nw.length) {
            setEnterprise(Object.assign({}, nw[0], { __sheet: 'NewEnterprise' }));
          } else {
            setEnterprise(null);
          }
        }
      } catch (err) {
        console.warn('ViewBeneficiary load enterprise err', err);
        Alert.alert('Error', 'Unable to load enterprise data.');
      } finally {
        setLoading(false);
      }
    };

    loadEnterprise();
  }, [beneficiary?.id]);

  const openUrl = async (url) => {
    if (!url) return Alert.alert('No URL available');
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Cannot open URL');
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  // thumbnail renderer
  function renderThumbnail(url, key) {
    if (!url) return null;
    const first = String(url).split(',')[0].trim();
    return (
      <TouchableOpacity key={key} onPress={() => openUrl(first)} style={styles.thumbWrap}>
        <Image source={{ uri: first }} style={styles.thumb} resizeMode="cover" />
      </TouchableOpacity>
    );
  }

  function renderCertificateDocs(raw) {
    if (!raw) return <Text style={styles.value}>(none)</Text>;
    const urls = String(raw).split(',').map(s => s.trim()).filter(Boolean);
    if (!urls.length) return <Text style={styles.value}>(none)</Text>;
    return (
      <View style={{ marginTop: 6 }}>
        {urls.map((u, i) => {
          const isImg = looksLikeImage(u);
          if (isImg) {
            return (
              <TouchableOpacity key={i} onPress={() => openUrl(u)} style={{ marginBottom: 8 }}>
                <Image source={{ uri: u }} style={styles.certThumb} resizeMode="cover" />
              </TouchableOpacity>
            );
          } else {
            return (
              <TouchableOpacity key={i} onPress={() => openUrl(u)} style={{ marginBottom: 6 }}>
                <Text style={[styles.value, styles.link]} numberOfLines={1}>{u}</Text>
              </TouchableOpacity>
            );
          }
        })}
      </View>
    );
  }

  const menuItems = [
    { label: 'Record New Beneficiary Detail', onPress: () => navigation.popToTop() },
    { label: 'View Recorded Beneficiary', onPress: () => navigation.popToTop() },
    { label: 'Logout', color: '#EE6969', onPress: async () => { const { clearUser } = await import('../../utils/auth'); await clearUser(); navigation.replace('Login'); } },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ gap: 4 }}>
          <LanguageToggle />
          <BackButton />
        </View>

        <Text style={styles.heading}>
          {beneficiary?.name || LABELS[language].beneficiaryHeader}
        </Text>

        <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginRight: 8 }}>
          <Image source={HamburgerIcon} style={{ width: 28, height: 28, tintColor: '#333' }} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Beneficiary card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{LABELS[language].beneficiaryHeader}</Text>
        {BENEFICIARY_FIELDS.map(k => {
          const raw = beneficiary[k];
          const display = (k === 'dob' || k === 'shg_joining_date') ? fmtDate(raw) : raw;
          return renderRow(k, display, styles);
        })}
      </View>

      {/* Enterprise */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{LABELS[language].enterpriseDetails}</Text>

        {loading ? <ActivityIndicator color="#EE6969" /> : enterprise ? (
          <>
            {/* Show header indicating which sheet */}
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>
              {enterprise.__sheet === 'ExistingEnterprise' ? (LABELS[language].existingHeader) : (LABELS[language].newHeader)}
            </Text>

            {enterprise.__sheet === 'ExistingEnterprise' ? (
              <>
                {EXISTING_ENTERPRISE_FIELDS.map(key => {
                  const raw = enterprise[key];
                  if (!raw && raw !== 0) return null;

                  if (['photo_enterprise', 'photo_entrepreneur', 'photo_product'].includes(key)) {
                    return (
                      <View style={styles.photoRow} key={key}>
                        <Text style={styles.label}>{key.replace(/_/g, ' ')}</Text>
                        <View style={styles.photoContainer}>
                          {renderThumbnail(raw, key)}
                        </View>
                      </View>
                    );
                  }

                  if (key === 'certificate_docs') {
                    return (
                      <View style={styles.col} key={key}>
                        <Text style={styles.label}>{key.replace(/_/g, ' ')}</Text>
                        {renderCertificateDocs(raw)}
                      </View>
                    );
                  }

                  if (['created_at','updated_at','deleted_at'].includes(key) && raw) {
                    return renderRow(key, fmtDate(raw), styles);
                  }

                  return renderRow(key, raw, styles);
                })}
              </>
            ) : (
              // NewEnterprise fields rendering
              <>
                {NEW_ENTERPRISE_FIELDS.map(k => {
                  const raw = enterprise[k];
                  if (!raw && raw !== 0) return null;
                  if (['created_at','updated_at','deleted_at'].includes(k) && raw) {
                    return renderRow(k, fmtDate(raw), styles);
                  }
                  return renderRow(k, raw, styles);
                })}
              </>
            )}

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EnterpriseForm', { beneficiary, existingRecord: enterprise })}>
              <Text style={styles.buttonText}>{LABELS[language].editEnterprise}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ color: '#666' }}>{LABELS[language].noEnterprise}</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EnterpriseForm', { beneficiary })}>
              <Text style={styles.buttonText}>{LABELS[language].recordEnterprise}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 50, marginHorizontal: 10 },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  card: { padding: 12, borderWidth: 1, borderColor: '#EE6969', borderRadius: 6, marginBottom: 12, backgroundColor: '#fff' },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' },
  col: { marginBottom: 8 },
  label: { fontWeight: '600', color: '#333', width: '45%', textTransform: 'capitalize' },
  value: { color: '#222', flex: 1, flexShrink: 1 },
  link: { color: '#EE6969', flex: 1, flexShrink: 1 },
  button: { backgroundColor: '#EE6969', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginTop: 10, alignSelf: 'flex-start' },
  buttonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },

  // thumbnails
  thumbWrap: { width: 120, height: 90, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  thumb: { width: '100%', height: '100%' },
  photoRow: { marginBottom: 12 },
  photoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },

  // certificate thumbnails smaller
  certThumb: { width: 140, height: 90, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
});
