// src/screens/record/ViewBeneficiary.jsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';

/**
 * ViewBeneficiary
 * - Shows all NON-ID fields from Beneficiary sheet
 * - Shows all NON-ID fields from BeneficiaryEnterprise sheet (if recorded)
 * - Photo links are tappable and open via Linking
 *
 * Expects route.params.beneficiary to be provided (object from Beneficiary sheet)
 */

const BENEFICIARY_FIELDS = [
  'name',
  'dob',
  'gender',
  'phone',
  'other_contact',
  'shg_joining_date',
  'marital_status',
  'education',
  'parent_spouce_name',
  'relation',
  'religion',
  'social_category',
  'remarks',
];

const ENTERPRISE_FIELDS = [
  'enterprise_name',
  'enterprise_type',
  'ownership_type',
  'year_of_establishment',
  'raw_material',
  'machinery_equipment',
  'workplace_type',
  'electricity_available',
  'water_available',
  'transportation_facility',
  'initial_investment',
  'source_of_investment',
  'working_capital_monthly',
  'annual_turnover',
  'profit_percentage',
  'loan_details',
  'main_product_service',
  'product_features',
  'production_capacity',
  'packaging_branding_status',
  'certification_registration',
  'target_customers',
  'marketing_channels',
  'monthly_sales',
  'marketing_strategy',
  'marketing_challenges',
  'training_received',
  'skills_acquired',
  'future_training_requirements',
  'institutional_support',
  'financial_coordination',
  'market_linkage',
  'mentorship_support',
  'expansion_plan',
  'required_support',
  'photo_enterprise',
  'photo_entrepreneur',
  'photo_product',
  'certificate_docs',
  'recorded_by_user_id',
  'created_at',
  'updated_at',
  'deleted_at',
];

// friendly labels (optional — you can edit as needed)
const LABELS = {
  // beneficiary
  name: 'Name',
  dob: 'Date of Birth',
  gender: 'Gender',
  phone: 'Phone',
  other_contact: 'Other Contact',
  shg_joining_date: 'SHG Joining Date',
  marital_status: 'Marital Status',
  education: 'Education',
  parent_spouce_name: 'Parent / Spouse Name',
  relation: 'Relation',
  religion: 'Religion',
  social_category: 'Social Category',
  remarks: 'Remarks',
  // enterprise
  enterprise_name: 'Enterprise Name',
  enterprise_type: 'Enterprise Type',
  ownership_type: 'Ownership Type',
  year_of_establishment: 'Year of Establishment',
  raw_material: 'Raw Material',
  machinery_equipment: 'Machinery / Equipment',
  workplace_type: 'Workplace Type',
  electricity_available: 'Electricity (Available?)',
  water_available: 'Water (Available?)',
  transportation_facility: 'Transportation Facility',
  initial_investment: 'Initial Investment',
  source_of_investment: 'Source of Investment',
  working_capital_monthly: 'Working Capital (Monthly)',
  annual_turnover: 'Annual Turnover',
  profit_percentage: 'Profit Percentage',
  loan_details: 'Loan Details',
  main_product_service: 'Main Product / Service',
  product_features: 'Product Features',
  production_capacity: 'Production Capacity',
  packaging_branding_status: 'Packaging / Branding Status',
  certification_registration: 'Certification / Registration',
  target_customers: 'Target Customers',
  marketing_channels: 'Marketing Channels',
  monthly_sales: 'Monthly Sales',
  marketing_strategy: 'Marketing Strategy',
  marketing_challenges: 'Marketing Challenges',
  training_received: 'Training Received',
  skills_acquired: 'Skills Acquired',
  future_training_requirements: 'Future Training Requirements',
  institutional_support: 'Institutional Support',
  financial_coordination: 'Financial Coordination',
  market_linkage: 'Market Linkage',
  mentorship_support: 'Mentorship Support',
  expansion_plan: 'Expansion Plan',
  required_support: 'Required Support',
  photo_enterprise: 'Photo — Enterprise',
  photo_entrepreneur: 'Photo — Entrepreneur',
  photo_product: 'Photo — Product',
  certificate_docs: 'Certificate Documents',
  recorded_by_user_id: 'Recorded By (User ID)',
  created_at: 'Recorded At',
  updated_at: 'Updated At',
  deleted_at: 'Deleted At',
};

function fmtDate(val) {
  if (!val) return '';
  // If it's already ISO-like or a number, try to parse
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toLocaleString();
  return String(val);
}

function renderRow(label, value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return (
    <View style={styles.row} key={label + String(value).slice(0, 20)}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );
}

export default function ViewBeneficiary({ navigation, route }) {
  const beneficiary = route?.params?.beneficiary || {};
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // read returns an array of rows matching beneficiary_id
        const rows = await gsApi.read('BeneficiaryEnterprise', 'beneficiary_id', beneficiary.id);
        const found = Array.isArray(rows) && rows.length ? rows[0] : null;
        setEnterprise(found);
      } catch (err) {
        console.warn('ViewBeneficiary: load enterprise err', err);
        Alert.alert('Error', 'Unable to load enterprise data.');
      } finally {
        setLoading(false);
      }
    })();
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />

      <Text style={styles.heading}>{beneficiary?.name || 'Beneficiary'}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Beneficiary Details</Text>
        {BENEFICIARY_FIELDS.map((key) => {
          const raw = beneficiary?.[key];
          let display = raw;
          if (key === 'dob' || key === 'shg_joining_date') display = fmtDate(raw);
          return renderRow(LABELS[key] || key, display);
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Enterprise Details</Text>
        {loading ? (
          <ActivityIndicator />
        ) : enterprise ? (
          <>
            {ENTERPRISE_FIELDS.map((key) => {
              const raw = enterprise?.[key];
              if (!raw && raw !== 0 && raw !== '0') return null;

              // photos and certificate docs: make clickable
              if (key === 'photo_enterprise' || key === 'photo_entrepreneur' || key === 'photo_product') {
                return (
                  <View style={styles.row} key={key}>
                    <Text style={styles.label}>{LABELS[key] || key}</Text>
                    <TouchableOpacity onPress={() => openUrl(raw)}>
                      <Text style={[styles.value, styles.link]} numberOfLines={1}>{String(raw)}</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              if (key === 'certificate_docs') {
                const urls = String(raw).split(',').map(u => u.trim()).filter(Boolean);
                return (
                  <View style={styles.col} key={key}>
                    <Text style={styles.label}>{LABELS[key] || key}</Text>
                    {urls.length === 0 ? <Text style={styles.value}>(none)</Text> : urls.map((u, i) => (
                      <TouchableOpacity key={i} onPress={() => openUrl(u)}>
                        <Text style={[styles.value, styles.link]} numberOfLines={1}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              }

              // format created_at / updated_at nicely
              if ((key === 'created_at' || key === 'updated_at' || key === 'deleted_at') && raw) {
                return renderRow(LABELS[key] || key, fmtDate(raw));
              }

              return renderRow(LABELS[key] || key, raw);
            })}

            <View style={{ marginTop: 10 }}>
              <Button title="Edit Enterprise" onPress={() => navigation.navigate('EnterpriseForm', { beneficiary })} />
            </View>
          </>
        ) : (
          <>
            <Text style={{ color: '#666' }}>No enterprise record found for this beneficiary.</Text>
            <View style={{ marginTop: 10 }}>
              <Button title="Record Enterprise" onPress={() => navigation.navigate('EnterpriseForm', { beneficiary })} />
            </View>
          </>
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  card: { padding: 12, borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 6, marginBottom: 12, backgroundColor: '#fff' },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  col: { marginBottom: 8 },
  label: { fontWeight: '600', color: '#333', width: '45%' },
  value: { color: '#222', width: '55%' },
  link: { color: '#0a66ff' },
});
