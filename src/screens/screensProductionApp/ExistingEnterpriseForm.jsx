// src/screens/epsakhi/ExistingEnterpriseForm.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Alert,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import gsApi from '../../api/gsApi';
import {
  getShgListForPanchayat,
  getCrpPanchayats,
  getCrpDetail,
} from '../../utils/tempStore';
import { getUser } from '../../utils/auth';

/**
 * Section-wise field grouping for collapsible UI
 */
const formSections = [
  {
    key: 'basic',
    title: '1) Basic Information',
    fields: [
      'enterprise_name',
      'enterprise_type',
      'ownership_type',
      'year_of_establishment',
      'number_of_employees',
      'sales_area',
      'target_customers',
    ],
  },
  {
    key: 'enterprise_details',
    title: '2) Enterprise Details',
    fields: [
      'workplace_type',
      'electricity_available',
      'water_available',
      'transportation_facility',
      // 'financial_coordination', // intentionally not sent
      'marketing_strategy',
      'marketing_challenges',
    ],
  },
  {
    key: 'product_services',
    title: '3) Product And Services',
    fields: [
      'main_product_name',
      'main_product_service',
      'product_features',
      'production_capacity',
      'raw_material',
      'machinery_equipment',
      'marketing_channels',
      'monthly_sales',
    ],
  },
  {
    key: 'investment',
    title: '4) Investment Details',
    fields: [
      'monthly_income_estimate',
      'initial_investment',
      'source_of_investment',
      'working_capital_monthly',
      'annual_turnover',
      'profit_percentage', // label will be shown as "Gross Profit"
      'government_subsidy',
    ],
  },
  {
    key: 'training',
    title: '5) Training / Skills Related',
    fields: [
      'training_received',
      // 'training_details',
      'skills_acquired',
      'future_training_requirements',
      'institutional_support',
      'financial_linkage',
      'market_linkage',
    ],
  },
  {
    key: 'loan',
    title: '6) Loan Details',
    fields: ['loan_details'],
  },
  {
    key: 'support',
    title: '7) Support Required',
    fields: ['required_support', 'expansion_plan'],
  },
  {
    key: 'media',
    title: '8) Media Upload',
    // IMPORTANT: these map directly to EnterpriseMedia model fields
    fields: [
      'photo_entrepreneur',
      'photo_enterprise',
      'open_box_photo',
      'close_box_photo',
      'others',
      'certificates',
    ],
  },
  {
    key: 'declaration',
    title: '9) Declaration',
    fields: ['declaration_confirmed', 'declaration_date', 'verifier_name'],
  },
];

// Dropdown options
const enterpriseTypeOptions = [
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Service', value: 'Service' },
  { label: 'Trading', value: 'Trading' },
  { label: 'Agri-based', value: 'Agri-based' },
  { label: 'Animal Husbandry', value: 'Animal Husbandry' },
  { label: 'Home-based', value: 'Home-based' },
  { label: 'Others', value: 'Others' },
];
const ownershipTypeOptions = [
  { label: 'Individual', value: 'Individual' },
  { label: 'Partnership', value: 'Partnership' },
  { label: 'SHG-based', value: 'SHG-based' },
  { label: 'Family-owned', value: 'Family-owned' },
  { label: 'Women Entrepreneur', value: 'Women Entrepreneur' },
  { label: 'Others', value: 'Others' },
];
const productServicesOptions = [
  { label: 'Tailoring/Embroidery', value: 'Tailoring/Embroidery' },
  { label: 'Food Products', value: 'Food Products' },
  { label: 'Handicrafts', value: 'Handicrafts' },
  { label: 'Beauty/Wellness', value: 'Beauty/Wellness' },
  { label: 'Dairy', value: 'Dairy' },
  { label: 'Agriculture Products', value: 'Agriculture Products' },
  { label: 'Digital Services', value: 'Digital Services' },
  { label: 'Home Décor', value: 'Home Décor' },
  { label: 'Others', value: 'Others' },
];
const rawMaterialTypeOptions = [
  { label: 'Cloth', value: 'Cloth' },
  { label: 'Wood', value: 'Wood' },
  { label: 'Metal', value: 'Metal' },
  { label: 'Plastic', value: 'Plastic' },
  { label: 'Food Items', value: 'Food Items' },
  { label: 'Paper', value: 'Paper' },
  { label: 'Clay/Ceramic', value: 'Clay/Ceramic' },
  { label: 'Natural/Organic', value: 'Natural/Organic' },
  { label: 'Others', value: 'Others' },
];
const machineryEquipmentOptions = [
  { label: 'Tailoring Machine', value: 'Tailoring Machine' },
  { label: 'Cutter/Folding Machine', value: 'Cutter/Folding Machine' },
  { label: 'Grinder/Mixer', value: 'Grinder/Mixer' },
  { label: 'Packaging Machine', value: 'Packaging Machine' },
  { label: 'Printing Machine', value: 'Printing Machine' },
  { label: 'Flour Mill', value: 'Flour Mill' },
  { label: 'Handy Tools', value: 'Handy Tools' },
  { label: 'Digital Equipment', value: 'Digital Equipment' },
  { label: 'Others', value: 'Others' },
];
const workplaceTypeOptions = [
  { label: 'Home-based', value: 'Home-based' },
  { label: 'Rented Place', value: 'Rented Place' },
  { label: 'Own Workplace', value: 'Own Workplace' },
  { label: 'SHG Center', value: 'SHG Center' },
  { label: 'Community Workplace', value: 'Community Workplace' },
  { label: 'Mobile/Itinerant', value: 'Mobile/Itinerant' },
  { label: 'Others', value: 'Others' },
];
const institutionOptions = [
  { label: 'Bank', value: 'Bank' },
  { label: 'Microfinance', value: 'Microfinance' },
  { label: 'NBFC', value: 'NBFC' },
  { label: 'Cooperative Society', value: 'Cooperative Society' },
  { label: 'Others', value: 'Others' },
];
const repaymentOptions = [
  { label: 'Ongoing', value: 'Ongoing' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Default / Pending', value: 'Default / Pending' },
  { label: 'Others', value: 'Others' },
];
const marketingChannelOptions = [
  { label: 'Retail', value: 'Retail' },
  { label: 'Online', value: 'Online' },
  { label: 'Exhibition', value: 'Exhibition' },
  { label: 'Others', value: 'Others' },
];
const yesNoOptions = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];
const institutionalSupportOptions = [
  { label: 'NRLM', value: 'NRLM' },
  { label: 'SRLM', value: 'SRLM' },
  { label: 'Others', value: 'Others' },
];
const financialLinkageOptions = [
  { label: 'Bank', value: 'Bank' },
  { label: 'Micro Finance', value: 'Micro Finance' },
  { label: 'NBFC', value: 'NBFC' },
  { label: 'Others', value: 'Others' },
];
const marketLinkageOptions = [
  { label: 'ONDC', value: 'ONDC' },
  { label: 'E-Commerce', value: 'E-Commerce' },
  { label: 'Exhibition', value: 'Exhibition' },
  { label: 'Others', value: 'Others' },
];
const requiredSupportOptions = [
  { label: 'Finance', value: 'Finance' },
  { label: 'Training', value: 'Training' },
  { label: 'Advertisement / Promotion', value: 'Advertisement / Promotion' },
  { label: 'Equipment', value: 'Equipment' },
  { label: 'Others', value: 'Others' },
];
const expansionPlanOptions = [
  { label: 'New Product', value: 'New Product' },
  { label: 'E-commerce', value: 'E-commerce' },
  { label: 'Employment Generation', value: 'Employment Generation' },
  { label: 'Others', value: 'Others' },
];

// NEW: Target customers options
const targetCustomersOptions = [
  { label: 'Retail', value: 'Retail' },
  { label: 'Business', value: 'Business' },
  { label: 'Govt.', value: 'Govt.' },
  { label: 'Others', value: 'Others' },
];

// NEW: Marketing challenges options
const marketingChallengesOptions = [
  { label: 'Lack of Market Awareness', value: 'Lack of Market Awareness' },
  { label: 'No Digital Access', value: 'No Digital Access' },
  { label: 'Lack of Social Media Marketting', value: 'Lack of Social Media Marketting' },
  { label: 'Others', value: 'Others' },
];

// Helper to compute age from DOB string (YYYY-MM-DD)
const computeAgeFromDob = (dobStr) => {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

// ===== Camera permission helper (for Android) =====
const requestCameraPermissionIfNeeded = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'We need access to your camera to capture photos.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
        buttonNeutral: 'Ask Me Later',
      }
    );

    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    console.warn('Camera permission error', e);
    return false;
  }
};

// Helper: normalize SHG object to location fields
function extractLocationFromShg(shg) {
  if (!shg) return null;
  // support both UPSRLM camelCase and snake_case from other sources
  const district_id = shg.districtId ?? shg.district_id ?? null;
  const block_id = shg.blockId ?? shg.block_id ?? null;
  const panchayat_id = shg.panchayatId ?? shg.panchayat_id ?? null;
  const village_id = shg.villageId ?? shg.village_id ?? null;
  const lokos_shg_code = shg.code ?? shg.shg_code ?? shg.lokos_shg_code ?? null;
  return { district_id, block_id, panchayat_id, village_id, lokos_shg_code };
}

export default function ExistingEnterpriseForm({ route, navigation }) {
  const recordedBenef = route?.params?.recordedBenef || null; // BeneficiaryRecorded row (if already created)
  const beneficiary = route?.params?.beneficiary || null; // UPSRLM member row
  const existingEnterprise = route?.params?.existingEnterprise || null;
  const lokosShgCode =
    route?.params?.lokos_shg_code ||
    route?.params?.lokosShgCode ||
    route?.params?.tempShg?.code ||
    route?.params?.shg?.code ||
    null;
  const tempShg = route?.params?.tempShg || null;
  const crpUserId =
    route?.params?.crpUserId ||
    route?.params?.user_id ||
    route?.params?.username ||
    null;

  const [existingForm, setExistingForm] = useState({
    enterprise_name: '',
    enterprise_type: '',
    enterprise_type_other: '',
    ownership_type: '',
    ownership_type_other: '',
    year_of_establishment: '',
    number_of_employees: '',
    main_product_name: '',
    main_product_service: '',
    main_product_service_other: '',
    product_features: '',
    production_capacity: '',
    raw_material: '',
    raw_material_other: '',
    machinery_equipment: '',
    machinery_equipment_other: '',
    workplace_type: '',
    workplace_type_other: '',
    packaging_branding_status: '',
    certification_registration: '',
    sales_area: '',
    monthly_income_estimate: '',
    initial_investment: '',
    source_of_investment: '',
    source_of_investment_specify: '',
    working_capital_monthly: '',
    annual_turnover: '',
    profit_percentage: '',
    has_taken_loan: false,
    target_customers: '',
    target_customers_other: '',
    marketing_channels: [],
    marketing_channels_other_specify: '',
    monthly_sales: '',
    marketing_strategy: '',
    marketing_challenges: [], // now an array of selected challenges
    marketing_challenges_other: '',
    electricity_available: '',
    electricity_more_detail: '',
    electricity_specify: '',
    water_available: '',
    water_more_detail: '',
    water_specify: '',
    transportation_facility: '',
    can_transport_clf: '',
    government_subsidy: '',
    subsidy_department: '',
    subsidy_scheme: '',
    loan_details: [], // nested loans array for UI only
    // financial_coordination: '', // intentionally not in state for sending
    training_received: '',
    training_details: '',
    skills_acquired: '',
    additional_training_required: '',
    training_skill_name: '',
    training_type: '',
    training_institution: '',
    institutional_support: '',
    institutional_support_other: '',
    financial_linkage: '',
    financial_linkage_other: '',
    market_linkage: [],
    market_linkage_other: '',
    required_support: [],
    required_support_other: '',
    expansion_plan: [],
    expansion_plan_other: '',
    declaration_confirmed: false,
    declaration_date: '',
    verifier_name: '',
    // If editing, hydrate from existingEnterprise (only overlapping keys)
    ...(existingEnterprise || {}),
  });

  const [loans, setLoans] = useState([]);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // NEW: media state (multiple files per field)
  const [mediaFiles, setMediaFiles] = useState({
    photo_entrepreneur: [],
    photo_enterprise: [],
    open_box_photo: [],
    close_box_photo: [],
    others: [],
    certificates: [],
  });

  // Collapsible sections state (all open by default)
  const [openSections, setOpenSections] = useState(
    formSections.reduce((acc, s) => ({ ...acc, [s.key]: true }), {})
  );

  // NEW: loggedUser to compute created_by numeric id
  const [loggedUser, setLoggedUser] = useState(null);

  // Declaration date modal (calendar style via pickers)
  const [declarationDateModalVisible, setDeclarationDateModalVisible] =
    useState(false);
  const [declDay, setDeclDay] = useState(null);
  const [declMonth, setDeclMonth] = useState(null);
  const [declYear, setDeclYear] = useState(null);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Year picker options
  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  const yearOptions = [];
  for (let y = currentYear; y >= startYear; y--) yearOptions.push(y.toString());

  // Init loans from existingForm.loan_details (if any)
  useEffect(() => {
    const ld = existingForm.loan_details;
    try {
      if (Array.isArray(ld)) {
        setLoans(ld);
      } else if (typeof ld === 'string' && ld.trim()) {
        const parsed = JSON.parse(ld);
        if (Array.isArray(parsed)) setLoans(parsed);
        else setLoans([]);
      } else {
        setLoans([]);
      }
    } catch (e) {
      console.error('Error parsing loan_details:', e);
      setLoans([]);
    }
  }, [existingForm.loan_details]);

  // Load logged user for created_by logic
  useEffect(() => {
    (async () => {
      try {
        const u = await getUser();
        if (u) {
          setLoggedUser(u);
          if (u.access) {
            gsApi.setAuthToken?.(u.access, u.refresh);
          }
        }
      } catch (e) {
        console.warn('Unable to load user in ExistingEnterpriseForm', e);
      }
    })();
  }, []);

  // Keep decl pickers in sync when existingForm.declaration_date changes
  useEffect(() => {
    const d = existingForm.declaration_date;
    if (!d) {
      setDeclDay(null);
      setDeclMonth(null);
      setDeclYear(null);
      return;
    }

    // Handle formats: 'YYYY-MM-DD' or ISO timestamp (e.g. '2025-11-20T00:00:00Z')
    try {
      let parsed;
      if (typeof d === 'string' && d.includes('-') && d.split('-').length >= 3) {
        // Try to extract yyyy-mm-dd prefix
        const parts = d.split('T')[0].split('-'); // ensures ISO and plain date both work
        if (parts.length === 3) {
          parsed = { y: parts[0], m: String(parseInt(parts[1], 10)), day: String(parseInt(parts[2], 10)) };
        }
      }
      if (!parsed) {
        const asDate = new Date(d);
        if (!Number.isNaN(asDate.getTime())) {
          parsed = { y: String(asDate.getFullYear()), m: String(asDate.getMonth() + 1), day: String(asDate.getDate()) };
        }
      }
      if (parsed) {
        setDeclYear(parsed.y);
        setDeclMonth(parsed.m);
        setDeclDay(parsed.day);
      }
    } catch (e) {
      // ignore - leave pickers null
      console.warn('Failed to parse declaration_date', e);
    }
  }, [existingForm.declaration_date]);

  const updateLoans = (newLoans) => {
    setLoans(newLoans);
    setExistingForm((f) => ({
      ...f,
      loan_details: newLoans,
      has_taken_loan: newLoans.length > 0,
    }));
  };

  const addLoanEntry = () => {
    updateLoans([
      ...loans,
      {
        institution: '',
        institutionOther: '',
        amount: '',
        repayment: '',
        repaymentOther: '',
      },
    ]);
  };

  const updateLoanEntry = (index, updatedEntry) => {
    const updated = [...loans];
    updated[index] = updatedEntry;
    updateLoans(updated);
  };

  const deleteLoanEntry = (index) => {
    const updated = loans.filter((_, i) => i !== index);
    updateLoans(updated);
  };

  // MEDIA HELPERS (multiple files per field)
  const addMediaAsset = (fieldKey, asset) => {
    if (!asset?.uri) return;
    setMediaFiles((prev) => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), asset],
    }));
  };

  const removeMediaAsset = (fieldKey, index) => {
    setMediaFiles((prev) => ({
      ...prev,
      [fieldKey]: (prev[fieldKey] || []).filter((_, i) => i !== index),
    }));
  };

  const pickMedia = async (fieldKey) => {
    try {
      setUploading(true);
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 0, // allow multiple selection if supported
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('ImagePicker error:', result.errorMessage || result.errorCode);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
        return;
      }

      const assets = result.assets || [];
      assets.forEach((asset) => addMediaAsset(fieldKey, asset));
    } catch (e) {
      console.error('pickMedia error', e);
      Alert.alert('Error', 'Unable to pick image from gallery.');
    } finally {
      setUploading(false);
    }
  };

  const takeMediaPhoto = async (fieldKey) => {
    try {
      // ✅ ensure CAMERA permission on Android
      const ok = await requestCameraPermissionIfNeeded();
      if (!ok) {
        Alert.alert('Permission required', 'Camera permission is required to capture photos.');
        return;
      }

      setUploading(true);
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('Camera error:', result.errorMessage || result.errorCode);
        Alert.alert('Error', 'Failed to capture image. Please try again.');
        return;
      }

      const asset = result.assets && result.assets[0];
      if (asset) addMediaAsset(fieldKey, asset);
    } catch (e) {
      console.error('takeMediaPhoto error', e);
      Alert.alert('Error', 'Unable to capture image from camera.');
    } finally {
      setUploading(false);
    }
  };

  const renderPickerWithSpecify = (
    label,
    selectedValue,
    onValueChange,
    options,
    specifyValue,
    onSpecifyChange
  ) => (
    <View key={label} style={{ marginBottom: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(itemValue) => {
          onValueChange(itemValue);
          if (itemValue !== 'Others' && specifyValue) {
            onSpecifyChange('');
          }
        }}
        style={styles.input}
      >
        <Picker.Item label="Select..." value="" />
        {options.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
      {selectedValue === 'Others' && (
        <TextInput
          value={specifyValue || ''}
          onChangeText={onSpecifyChange}
          placeholder="Specify"
          style={[styles.input, { marginTop: 6 }]}
        />
      )}
    </View>
  );

  const renderYesNoToggle = (label, selectedValue, onChange) => (
    <View key={label} style={{ marginBottom: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {yesNoOptions.map(({ label: l, value }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.smallBtn,
              selectedValue === value && { backgroundColor: '#EE6969' },
            ]}
            onPress={() => onChange(value)}
          >
            <Text
              style={{
                color: selectedValue === value ? '#fff' : '#333',
                fontWeight: '600',
              }}
            >
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const LoanEntry = ({ entry, index, onUpdate, onDelete, allowDelete }) => (
    <View key={index} style={styles.loanEntryContainer}>
      <Text style={styles.label}>Loan Entry {index + 1}</Text>

      <Picker
        selectedValue={entry.institution}
        onValueChange={(val) =>
          onUpdate({
            ...entry,
            institution: val,
            institutionOther: val === 'Others' ? entry.institutionOther : '',
          })
        }
        style={styles.input}
      >
        <Picker.Item label="Select Institution" value="" />
        {institutionOptions.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
      {entry.institution === 'Others' && (
        <TextInput
          placeholder="Specify Institution"
          style={styles.input}
          value={entry.institutionOther}
          onChangeText={(val) => onUpdate({ ...entry, institutionOther: val })}
        />
      )}

      <TextInput
        placeholder="Loan Amount"
        style={styles.input}
        keyboardType="numeric"
        value={String(entry.amount ?? '')}
        onChangeText={(val) =>
          onUpdate({ ...entry, amount: val.replace(/[^0-9]/g, '') })
        }
      />

      <Picker
        selectedValue={entry.repayment}
        onValueChange={(val) =>
          onUpdate({
            ...entry,
            repayment: val,
            repaymentOther: val === 'Others' ? entry.repaymentOther : '',
          })
        }
        style={styles.input}
      >
        <Picker.Item label="Select Repayment Status" value="" />
        {repaymentOptions.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
      {entry.repayment === 'Others' && (
        <TextInput
          placeholder="Specify Repayment Status"
          style={styles.input}
          value={entry.repaymentOther}
          onChangeText={(val) =>
            onUpdate({ ...entry, repaymentOther: val })
          }
        />
      )}

      {allowDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Delete Loan
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const toggleMarketingChannel = (value) => {
    const currentChannels = Array.isArray(existingForm.marketing_channels)
      ? [...existingForm.marketing_channels]
      : [];
    let updatedChannels;
    let updatedMarketingOtherSpecify =
      existingForm.marketing_channels_other_specify;

    if (currentChannels.includes(value)) {
      updatedChannels = currentChannels.filter((item) => item !== value);
      if (value === 'Others') {
        updatedMarketingOtherSpecify = '';
      }
    } else {
      updatedChannels = [...currentChannels, value];
    }

    setExistingForm({
      ...existingForm,
      marketing_channels: updatedChannels,
      marketing_channels_other_specify: updatedMarketingOtherSpecify,
    });
  };

  const toggleMarketingChallenge = (value) => {
    const current = Array.isArray(existingForm.marketing_challenges)
      ? [...existingForm.marketing_challenges]
      : [];
    let updated;
    if (current.includes(value)) {
      updated = current.filter((c) => c !== value);
      if (value === 'Others') {
        setExistingForm((f) => ({ ...f, marketing_challenges_other: '' }));
      }
    } else {
      updated = [...current, value];
    }
    setExistingForm((f) => ({ ...f, marketing_challenges: updated }));
  };

  const multilineFields = [
    'product_features',
    'marketing_strategy',
    'marketing_challenges',
    'training_details',
    'skills_acquired',
    // 'financial_coordination',
  ];

  const renderMediaField = (k) => {
    const labelMap = {
      photo_entrepreneur: 'Photo – Entrepreneur',
      photo_enterprise: 'Photo – Enterprise',
      open_box_photo: 'Photo – Open Box',
      close_box_photo: 'Photo – Close Box',
      others: 'Photo – Others',
      certificates: 'Certificates',
    };
    const label = labelMap[k] || k;
    const files = mediaFiles[k] || [];

    return (
      <View key={k} style={{ marginBottom: 10 }}>
        <Text style={styles.label}>{label}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => pickMedia(k)}
          >
            <Text style={styles.smallBtnText}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => takeMediaPhoto(k)}
          >
            <Text style={styles.smallBtnText}>Camera</Text>
          </TouchableOpacity>
        </View>
        {files.length === 0 ? (
          <Text style={{ color: '#666', fontSize: 12 }}>(none selected)</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {files.map((asset, idx) => (
              <View key={`${k}-${idx}`} style={styles.thumbWrapper}>
                <Image
                  source={{ uri: asset.uri }}
                  style={styles.thumb}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.thumbRemove}
                  onPress={() => removeMediaAsset(k, idx)}
                >
                  <Text style={{ color: '#fff', fontSize: 10 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        <Text style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
          You can select multiple images, MAX 3.
        </Text>
      </View>
    );
  };

  const renderField = (k) => {
    // Dropdown-like fields
    if (k === 'enterprise_type')
      return renderPickerWithSpecify(
        'Enterprise Type (उद्यम प्रकार)',
        existingForm.enterprise_type,
        (v) => setExistingForm((f) => ({ ...f, enterprise_type: v })),
        enterpriseTypeOptions,
        existingForm.enterprise_type_other,
        (v) => setExistingForm((f) => ({ ...f, enterprise_type_other: v }))
      );

    if (k === 'ownership_type')
      return renderPickerWithSpecify(
        'Ownership Type (स्वामित्व प्रकार)',
        existingForm.ownership_type,
        (v) => setExistingForm((f) => ({ ...f, ownership_type: v })),
        ownershipTypeOptions,
        existingForm.ownership_type_other,
        (v) => setExistingForm((f) => ({ ...f, ownership_type_other: v }))
      );

    if (k === 'main_product_service')
      return renderPickerWithSpecify(
        'Product / Services (उत्पाद / सेवाएँ)',
        existingForm.main_product_service,
        (v) =>
          setExistingForm((f) => ({ ...f, main_product_service: v })),
        productServicesOptions,
        existingForm.main_product_service_other,
        (v) =>
          setExistingForm((f) => ({
            ...f,
            main_product_service_other: v,
          }))
      );

    if (k === 'raw_material')
      return renderPickerWithSpecify(
        'Raw Material Type (कच्चा माल प्रकार)',
        existingForm.raw_material,
        (v) => setExistingForm((f) => ({ ...f, raw_material: v })),
        rawMaterialTypeOptions,
        existingForm.raw_material_other,
        (v) =>
          setExistingForm((f) => ({ ...f, raw_material_other: v }))
      );

    if (k === 'machinery_equipment')
      return renderPickerWithSpecify(
        'Machinery & Equipment (मशीनरी / उपकरण)',
        existingForm.machinery_equipment,
        (v) =>
          setExistingForm((f) => ({ ...f, machinery_equipment: v })),
        machineryEquipmentOptions,
        existingForm.machinery_equipment_other,
        (v) =>
          setExistingForm((f) => ({
            ...f,
            machinery_equipment_other: v,
          }))
      );

    if (k === 'workplace_type')
      return renderPickerWithSpecify(
        'Workplace Type (कार्यस्थल प्रकार)',
        existingForm.workplace_type,
        (v) => setExistingForm((f) => ({ ...f, workplace_type: v })),
        workplaceTypeOptions,
        existingForm.workplace_type_other,
        (v) =>
          setExistingForm((f) => ({ ...f, workplace_type_other: v }))
      );

    if (k === 'year_of_establishment') {
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Year of Establishment</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'center', height: 44 }]}
            onPress={() => setYearPickerVisible(true)}
          >
            <Text>
              {existingForm.year_of_establishment || 'Select Year'}
            </Text>
          </TouchableOpacity>
          <Modal
            visible={yearPickerVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setYearPickerVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                <Text style={[styles.label, { textAlign: 'center' }]}>
                  Select Year
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    margin: 8,
                  }}
                >
                  <Picker
                    selectedValue={existingForm.year_of_establishment}
                    onValueChange={(itemValue) => {
                      setExistingForm((f) => ({
                        ...f,
                        year_of_establishment: itemValue,
                      }));
                      setYearPickerVisible(false);
                    }}
                  >
                    {yearOptions.map((year) => (
                      <Picker.Item
                        label={year}
                        value={year}
                        key={year}
                      />
                    ))}
                  </Picker>
                </View>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setYearPickerVisible(false)}
                >
                  <Text
                    style={{ color: '#EE6969', fontWeight: '600' }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      );
    }

    if (k === 'electricity_available') {
      const elec = existingForm.electricity_available || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Electricity Availability</Text>
          <Picker
            selectedValue={elec}
            onValueChange={(v) =>
              setExistingForm((f) => ({
                ...f,
                electricity_available: v,
                electricity_more_detail:
                  v === 'Yes' ? f.electricity_more_detail : '',
                electricity_specify: '',
              }))
            }
            style={styles.input}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>

          {elec === 'Yes' && (
            <>
              <Picker
                selectedValue={existingForm.electricity_more_detail || ''}
                onValueChange={(v) =>
                  setExistingForm((f) => ({
                    ...f,
                    electricity_more_detail: v,
                    electricity_specify:
                      v === 'Others' ? f.electricity_specify : '',
                  }))
                }
                style={[styles.input, { marginTop: 6 }]}
              >
                <Picker.Item label="Select..." value="" />
                <Picker.Item
                  label="Partial / Irregular"
                  value="Partial / Irregular"
                />
                <Picker.Item label="Others" value="Others" />
              </Picker>

              {existingForm.electricity_more_detail === 'Others' && (
                <TextInput
                  placeholder="Specify"
                  value={existingForm.electricity_specify || ''}
                  onChangeText={(text) =>
                    setExistingForm((f) => ({
                      ...f,
                      electricity_specify: text,
                    }))
                  }
                  style={[styles.input, { marginTop: 6 }]}
                />
              )}
            </>
          )}
        </View>
      );
    }

    if (k === 'water_available') {
      const water = existingForm.water_available || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Water Availability</Text>
          <Picker
            selectedValue={water}
            onValueChange={(v) =>
              setExistingForm((f) => ({
                ...f,
                water_available: v,
                water_more_detail: v === 'Yes' ? f.water_more_detail : '',
                water_specify: '',
              }))
            }
            style={styles.input}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>

          {water === 'Yes' && (
            <>
              <Picker
                selectedValue={existingForm.water_more_detail || ''}
                onValueChange={(v) =>
                  setExistingForm((f) => ({
                    ...f,
                    water_more_detail: v,
                    water_specify:
                      v === 'Others' ? f.water_specify : '',
                  }))
                }
                style={[styles.input, { marginTop: 6 }]}
              >
                <Picker.Item label="Select..." value="" />
                <Picker.Item label="Limited" value="Limited" />
                <Picker.Item label="Others" value="Others" />
              </Picker>

              {existingForm.water_more_detail === 'Others' && (
                <TextInput
                  placeholder="Specify"
                  value={existingForm.water_specify || ''}
                  onChangeText={(text) =>
                    setExistingForm((f) => ({
                      ...f,
                      water_specify: text,
                    }))
                  }
                  style={[styles.input, { marginTop: 6 }]}
                />
              )}
            </>
          )}
        </View>
      );
    }

    if (k === 'transportation_facility') {
      const transport = existingForm.transportation_facility || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Transport Availability</Text>
          <Picker
            selectedValue={transport}
            onValueChange={(v) =>
              setExistingForm((f) => ({
                ...f,
                transportation_facility: v,
                can_transport_clf: v === 'Yes' ? f.can_transport_clf : '',
              }))
            }
            style={styles.input}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
            <Picker.Item label="Need Help" value="Need Help" />
          </Picker>

          {transport === 'Yes' && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>
                Can you transport/supply the product to Bijnor CLF?
              </Text>
              <Picker
                selectedValue={existingForm.can_transport_clf || ''}
                onValueChange={(v) =>
                  setExistingForm((f) => ({
                    ...f,
                    can_transport_clf: v,
                  }))
                }
                style={styles.input}
              >
                <Picker.Item label="Select..." value="" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>
          )}
        </View>
      );
    }

    if (k === 'source_of_investment') {
      const source = existingForm.source_of_investment || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Source of Investment</Text>
          <Picker
            selectedValue={source}
            onValueChange={(v) =>
              setExistingForm((f) => ({
                ...f,
                source_of_investment: v,
                source_of_investment_specify:
                  v === 'Others' ? f.source_of_investment_specify : '',
              }))
            }
            style={styles.input}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="CCL" value="CCL" />
            <Picker.Item label="CIF" value="CIF" />
            <Picker.Item label="Livelihood Fund" value="Livelihood Fund" />
            <Picker.Item label="CEF" value="CEF" />
            <Picker.Item label="Others" value="Others" />
          </Picker>
          {existingForm.source_of_investment === 'Others' && (
            <TextInput
              placeholder="Specify"
              value={existingForm.source_of_investment_specify || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({
                  ...f,
                  source_of_investment_specify: text,
                }))
              }
              style={[styles.input, { marginTop: 6 }]}
            />
          )}
        </View>
      );
    }

    if (k === 'government_subsidy') {
      const subsidy = existingForm.government_subsidy || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>
            Have you received any government subsidy / financial assistance?
          </Text>
          <Picker
            selectedValue={subsidy}
            onValueChange={(v) =>
              setExistingForm((f) => ({
                ...f,
                government_subsidy: v,
                subsidy_department: v === 'Yes' ? f.subsidy_department : '',
                subsidy_scheme: v === 'Yes' ? f.subsidy_scheme : '',
              }))
            }
            style={styles.input}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>
          {subsidy === 'Yes' && (
            <>
              <TextInput
                placeholder="Department Name"
                value={existingForm.subsidy_department || ''}
                onChangeText={(text) =>
                  setExistingForm((f) => ({
                    ...f,
                    subsidy_department: text,
                  }))
                }
                style={[styles.input, { marginTop: 6 }]}
              />
              <TextInput
                placeholder="Scheme Name"
                value={existingForm.subsidy_scheme || ''}
                onChangeText={(text) =>
                  setExistingForm((f) => ({
                    ...f,
                    subsidy_scheme: text,
                  }))
                }
                style={[styles.input, { marginTop: 6 }]}
              />
            </>
          )}
        </View>
      );
    }

    if (k === 'loan_details') {
      const loanAnswer =
        loans.length > 0 || existingForm.has_taken_loan
          ? 'Yes'
          : existingEnterprise
          ? 'No'
          : '';

      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Have you taken any loan?</Text>
          <Picker
            selectedValue={loanAnswer}
            onValueChange={(v) => {
              if (v === 'No') {
                updateLoans([]);
              } else if (v === 'Yes') {
                if (loans.length === 0) {
                  addLoanEntry();
                }
              } else {
                updateLoans([]);
              }
            }}
            style={styles.input}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>

          {loanAnswer === 'Yes' && (
            <>
              {loans.map((loanEntry, idx) => (
                <LoanEntry
                  key={`loan-${idx}`}
                  index={idx}
                  entry={loanEntry}
                  onUpdate={(updated) => updateLoanEntry(idx, updated)}
                  onDelete={() => deleteLoanEntry(idx)}
                  allowDelete={loans.length > 1}
                />
              ))}
              <TouchableOpacity
                style={styles.addBtn}
                onPress={addLoanEntry}
              >
                <Text
                  style={{ color: '#EE6969', fontWeight: 'bold' }}
                >
                  ➕ Add Another Loan
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    }

    if (k === 'marketing_channels') {
      const selected = Array.isArray(existingForm.marketing_channels)
        ? existingForm.marketing_channels
        : [];
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Marketing Channels</Text>
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
          >
            {marketingChannelOptions.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.smallBtn,
                  selected.includes(value) && {
                    backgroundColor: '#EE6969',
                  },
                ]}
                onPress={() => toggleMarketingChannel(value)}
              >
                <Text
                  style={{
                    color: selected.includes(value) ? '#fff' : '#333',
                    fontWeight: '600',
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selected.includes('Others') && (
            <TextInput
              placeholder="Specify Other Channels"
              style={[styles.input, { marginTop: 6 }]}
              value={
                existingForm.marketing_channels_other_specify || ''
              }
              onChangeText={(text) =>
                setExistingForm((f) => ({
                  ...f,
                  marketing_channels_other_specify: text,
                }))
              }
            />
          )}
        </View>
      );
    }

    // NEW: Target Customers dropdown with Others specify
    if (k === 'target_customers') {
      const val = existingForm.target_customers || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Target Customers</Text>
          <Picker
            selectedValue={val}
            onValueChange={(v) =>
              setExistingForm((f) => ({
                ...f,
                target_customers: v,
                target_customers_other: v === 'Others' ? f.target_customers_other : '',
              }))
            }
            style={styles.input}
          >
            <Picker.Item label="Select..." value="" />
            {targetCustomersOptions.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
          {existingForm.target_customers === 'Others' && (
            <TextInput
              placeholder="Please specify"
              style={[styles.input, { marginTop: 6 }]}
              value={existingForm.target_customers_other || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({ ...f, target_customers_other: text }))
              }
            />
          )}
        </View>
      );
    }

    // NEW: Marketing Challenges multi-select
    if (k === 'marketing_challenges') {
      const selected = Array.isArray(existingForm.marketing_challenges)
        ? existingForm.marketing_challenges
        : [];

      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Marketing Challenges</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {marketingChallengesOptions.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.smallBtn,
                  selected.includes(value) && { backgroundColor: '#EE6969' },
                ]}
                onPress={() => toggleMarketingChallenge(value)}
              >
                <Text
                  style={{
                    color: selected.includes(value) ? '#fff' : '#333',
                    fontWeight: '600',
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selected.includes('Others') && (
            <TextInput
              placeholder="Please specify other marketing challenges"
              style={[styles.input, { marginTop: 6 }]}
              value={existingForm.marketing_challenges_other || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({ ...f, marketing_challenges_other: text }))
              }
            />
          )}
        </View>
      );
    }

    if (k === 'future_training_requirements') {
      const val = existingForm.additional_training_required || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          {renderYesNoToggle(
            'Will you require additional training in the future?',
            val,
            (v) => {
              setExistingForm((f) => ({
                ...f,
                additional_training_required: v,
                training_skill_name: v === 'No' ? '' : f.training_skill_name,
                training_type: v === 'No' ? '' : f.training_type,
                training_institution:
                  v === 'No' ? '' : f.training_institution,
              }));
            }
          )}

          {val === 'Yes' && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>
                Please provide details of the required training:
              </Text>

              <TextInput
                placeholder="Skill name"
                style={styles.input}
                value={existingForm.training_skill_name || ''}
                onChangeText={(text) =>
                  setExistingForm((f) => ({
                    ...f,
                    training_skill_name: text,
                  }))
                }
              />

              <TextInput
                placeholder="Type of training (Technical / Business / Digital, etc.)"
                style={styles.input}
                value={existingForm.training_type || ''}
                onChangeText={(text) =>
                  setExistingForm((f) => ({
                    ...f,
                    training_type: text,
                  }))
                }
              />

              <TextInput
                placeholder="Specific institution or department requirement (if applicable)"
                style={styles.input}
                value={existingForm.training_institution || ''}
                onChangeText={(text) =>
                  setExistingForm((f) => ({
                    ...f,
                    training_institution: text,
                  }))
                }
              />
            </View>
          )}
        </View>
      );
    }

    if (k === 'training_received') {
      const val = existingForm.training_received || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          {renderYesNoToggle(
            'Have you received any training before?',
            val,
            (v) =>
              setExistingForm((f) => ({
                ...f,
                training_received: v,
                training_details: v === 'No' ? '' : f.training_details,
              }))
          )}

          {val === 'Yes' && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Training Details</Text>
              <TextInput
                placeholder="Describe training received (institutions / duration / skills)"
                style={[styles.input, { minHeight: 80 }]}
                value={existingForm.training_details || ''}
                onChangeText={(text) =>
                  setExistingForm((f) => ({ ...f, training_details: text }))
                }
                multiline
              />
            </View>
          )}
        </View>
      );
    }

    if (k === 'institutional_support') {
      const val = existingForm.institutional_support || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Institutional Support</Text>
          <Picker
            selectedValue={val}
            onValueChange={(v) =>
              setExistingForm((f) => ({
                ...f,
                institutional_support: v,
                institutional_support_other:
                  v === 'Others' ? f.institutional_support_other : '',
              }))
            }
            style={styles.input}
          >
            <Picker.Item label="Select..." value="" />
            {institutionalSupportOptions.map((opt) => (
              <Picker.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
              />
            ))}
          </Picker>

          {val === 'Others' && (
            <TextInput
              placeholder="Please enter the name/details of the institution."
              value={existingForm.institutional_support_other || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({
                  ...f,
                  institutional_support_other: text,
                }))
              }
              style={[styles.input, { marginTop: 6 }]}
            />
          )}
        </View>
      );
    }

    if (k === 'financial_linkage') {
      const val = existingForm.financial_linkage || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Financial Linkage</Text>
          <Picker
            selectedValue={val}
            onValueChange={(v) =>
              setExistingForm((f) => ({
                ...f,
                financial_linkage: v,
                financial_linkage_other:
                  v === 'Others' ? f.financial_linkage_other : '',
              }))
            }
            style={styles.input}
          >
            <Picker.Item label="Select..." value="" />
            {financialLinkageOptions.map((opt) => (
              <Picker.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
              />
            ))}
          </Picker>

          {val === 'Others' && (
            <TextInput
              placeholder="Specify"
              value={existingForm.financial_linkage_other || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({
                  ...f,
                  financial_linkage_other: text,
                }))
              }
              style={[styles.input, { marginTop: 6 }]}
            />
          )}
        </View>
      );
    }

    if (k === 'required_support') {
      const selected = Array.isArray(existingForm.required_support)
        ? existingForm.required_support
        : [];

      const toggleOption = (value) => {
        let updated = [...selected];
        if (updated.includes(value)) {
          updated = updated.filter((v) => v !== value);
        } else {
          updated.push(value);
        }
        setExistingForm((f) => ({ ...f, required_support: updated }));
        if (value === 'Others' && updated.indexOf('Others') === -1) {
          setExistingForm((f) => ({
            ...f,
            required_support_other: '',
          }));
        }
      };

      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Required Support</Text>
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
          >
            {requiredSupportOptions.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.smallBtn,
                  selected.includes(value) && {
                    backgroundColor: '#EE6969',
                  },
                ]}
                onPress={() => toggleOption(value)}
              >
                <Text
                  style={{
                    color: selected.includes(value) ? '#fff' : '#333',
                    fontWeight: '600',
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selected.includes('Others') && (
            <TextInput
              placeholder="Specify"
              style={[styles.input, { marginTop: 6 }]}
              value={existingForm.required_support_other || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({
                  ...f,
                  required_support_other: text,
                }))
              }
            />
          )}
        </View>
      );
    }

    if (k === 'expansion_plan') {
      const selected = Array.isArray(existingForm.expansion_plan)
        ? existingForm.expansion_plan
        : [];

      const toggleOption = (value) => {
        let updated = [...selected];
        if (updated.includes(value)) {
          updated = updated.filter((v) => v !== value);
        } else {
          updated.push(value);
        }
        setExistingForm((f) => ({ ...f, expansion_plan: updated }));
        if (value === 'Others' && updated.indexOf('Others') === -1) {
          setExistingForm((f) => ({ ...f, expansion_plan_other: '' }));
        }
      };

      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Expansion Plan</Text>
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
          >
            {expansionPlanOptions.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.smallBtn,
                  selected.includes(value) && {
                    backgroundColor: '#EE6969',
                  },
                ]}
                onPress={() => toggleOption(value)}
              >
                <Text
                  style={{
                    color: selected.includes(value) ? '#fff' : '#333',
                    fontWeight: '600',
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selected.includes('Others') && (
            <TextInput
              placeholder="Specify"
              style={[styles.input, { marginTop: 6 }]}
              value={existingForm.expansion_plan_other || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({
                  ...f,
                  expansion_plan_other: text,
                }))
              }
            />
          )}
        </View>
      );
    }

    if (k === 'market_linkage') {
      const selected = Array.isArray(existingForm.market_linkage)
        ? existingForm.market_linkage
        : [];

      const toggleOption = (value) => {
        let updated = [...selected];
        if (updated.includes(value)) {
          updated = updated.filter((v) => v !== value);
        } else {
          updated.push(value);
        }
        setExistingForm((f) => ({ ...f, market_linkage: updated }));
        if (value === 'Others' && updated.indexOf('Others') === -1) {
          setExistingForm((f) => ({
            ...f,
            market_linkage_other: '',
          }));
        }
      };

      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Market Linkages</Text>
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
          >
            {marketLinkageOptions.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.smallBtn,
                  selected.includes(value) && {
                    backgroundColor: '#EE6969',
                  },
                ]}
                onPress={() => toggleOption(value)}
              >
                <Text
                  style={{
                    color: selected.includes(value) ? '#fff' : '#333',
                    fontWeight: '600',
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selected.includes('Others') && (
            <TextInput
              placeholder="Specify"
              style={[styles.input, { marginTop: 6 }]}
              value={existingForm.market_linkage_other || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({
                  ...f,
                  market_linkage_other: text,
                }))
              }
            />
          )}
        </View>
      );
    }

    if (k === 'certification_registration') {
      return renderYesNoToggle(
        'Certification / Registration?',
        existingForm.certification_registration,
        (v) =>
          setExistingForm((f) => ({
            ...f,
            certification_registration: v,
          }))
      );
    }

    // MEDIA FIELDS (multi-file)
    if (
      [
        'photo_entrepreneur',
        'photo_enterprise',
        'open_box_photo',
        'close_box_photo',
        'others',
        'certificates',
      ].includes(k)
    ) {
      return renderMediaField(k);
    }

    if (k === 'declaration_confirmed') {
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          {renderYesNoToggle(
            'I confirm the declaration is read and agreed.',
            existingForm.declaration_confirmed ? 'Yes' : 'No',
            (v) =>
              setExistingForm((f) => ({
                ...f,
                declaration_confirmed: v === 'Yes',
              }))
          )}
        </View>
      );
    }

    if (k === 'declaration_date' || k === 'verifier_name') {
      if (k === 'declaration_date') {
        return (
          <View key={k} style={{ marginBottom: 8 }}>
            <Text style={styles.label}>Declaration Date</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center', height: 44 }]}
              onPress={() => {
                // initialize pickers if value exists
                const existing = existingForm.declaration_date;
                let initYear = null;
                let initMonth = null;
                let initDay = null;

                if (existing && typeof existing === 'string') {
                  // If contains T (ISO) or plain yyyy-mm-dd, attempt parsing
                  try {
                    const isoPart = existing.split('T')[0]; // works for both
                    const parts = isoPart.split('-'); // yyyy-mm-dd
                    if (parts.length === 3) {
                      initYear = parts[0];
                      initMonth = String(parseInt(parts[1], 10));
                      initDay = String(parseInt(parts[2], 10));
                    }
                  } catch (e) {
                    // ignore
                  }
                }

                // if parsing above didn't work, try Date constructor
                if (!initYear) {
                  const dt = new Date(existing || Date.now());
                  if (!Number.isNaN(dt.getTime())) {
                    initYear = String(dt.getFullYear());
                    initMonth = String(dt.getMonth() + 1);
                    initDay = String(dt.getDate());
                  }
                }

                // fallback to today
                if (!initYear) {
                  const dt = new Date();
                  initYear = String(dt.getFullYear());
                  initMonth = String(dt.getMonth() + 1);
                  initDay = String(dt.getDate());
                }

                setDeclYear(initYear);
                setDeclMonth(initMonth);
                setDeclDay(initDay);

                setDeclarationDateModalVisible(true);
              }}
            >
              <Text>
                {existingForm.declaration_date || 'Select date'}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={declarationDateModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setDeclarationDateModalVisible(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={[styles.modalContent, { padding: 12 }]}>
                  <Text style={[styles.label, { textAlign: 'center' }]}>
                    Select Declaration Date
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                    {/* Day picker */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, marginBottom: 4 }}>Day</Text>
                      <Picker
                        selectedValue={declDay ?? '1'}
                        onValueChange={(v) => setDeclDay(String(v))}
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <Picker.Item key={d} label={String(d)} value={String(d)} />
                        ))}
                      </Picker>
                    </View>

                    {/* Month picker */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, marginBottom: 4 }}>Month</Text>
                      <Picker
                        selectedValue={declMonth ?? '1'}
                        onValueChange={(v) => setDeclMonth(String(v))}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <Picker.Item key={m} label={String(m)} value={String(m)} />
                        ))}
                      </Picker>
                    </View>

                    {/* Year picker */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, marginBottom: 4 }}>Year</Text>
                      <Picker
                        selectedValue={declYear ?? String(currentYear)}
                        onValueChange={(v) => setDeclYear(String(v))}
                      >
                        {yearOptions.map((y) => (
                          <Picker.Item key={y} label={y} value={y} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                    <TouchableOpacity
                      style={[styles.cancelBtn, { paddingHorizontal: 16 }]}
                      onPress={() => setDeclarationDateModalVisible(false)}
                    >
                      <Text style={{ color: '#EE6969', fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallBtn, { paddingHorizontal: 16 }]}
                      onPress={() => {
                        // normalize to YYYY-MM-DD
                        const dd = String(declDay ?? '1').padStart(2, '0');
                        const mm = String(declMonth ?? '1').padStart(2, '0');
                        const yyyy = String(declYear ?? currentYear);
                        const iso = `${yyyy}-${mm}-${dd}`;
                        setExistingForm((f) => ({ ...f, declaration_date: iso }));
                        setDeclarationDateModalVisible(false);
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '600' }}>Set</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        );
      } else {
        // verifier_name
        return (
          <View key={k} style={{ marginBottom: 8 }}>
            <Text style={styles.label}>Verifier Name</Text>
            <TextInput
              value={String(existingForm[k] ?? '')}
              onChangeText={(v) =>
                setExistingForm((prev) => ({ ...prev, [k]: v }))
              }
              style={styles.input}
            />
          </View>
        );
      }
    }

    // Specific label change: profit_percentage shows 'Gross Profit'
    if (k === 'profit_percentage') {
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Gross Profit</Text>
          <TextInput
            value={String(existingForm.profit_percentage ?? '')}
            onChangeText={(v) =>
              setExistingForm((prev) => ({ ...prev, profit_percentage: v }))
            }
            style={styles.input}
            keyboardType="numeric"
          />
        </View>
      );
    }

    // Default text field
    return (
      <View key={k} style={{ marginBottom: 8 }}>
        <Text style={styles.label}>{k.replace(/_/g, ' ')}</Text>
        <TextInput
          value={String(existingForm[k] ?? '')}
          onChangeText={(v) =>
            setExistingForm((prev) => ({ ...prev, [k]: v }))
          }
          style={styles.input}
          multiline={multilineFields.includes(k)}
          keyboardType={
            [
              'initial_investment',
              'working_capital_monthly',
              'annual_turnover',
              'profit_percentage',
              'monthly_sales',
              'monthly_income_estimate',
              'number_of_employees',
            ].includes(k)
              ? 'numeric'
              : 'default'
          }
        />
      </View>
    );
  };

  // ----------------- Fallback helpers for recorded beneficiary creation -----------------
  async function findShgAcrossCachedPanchayats(shgCode) {
    if (!shgCode) return null;
    try {
      // First try temp cache by panchayat (if CRP panchayats available)
      const gps = getCrpPanchayats ? getCrpPanchayats() || [] : [];
      for (const gp of gps) {
        const pid = gp?.panchayat_id || gp?.panchayatId;
        if (!pid) continue;
        const cached = getShgListForPanchayat(pid) || [];
        const found = cached.find((s) => {
          const code = s.code ?? s.shg_code ?? s.lokos_shg_code ?? s.code;
          return String(code) === String(shgCode);
        });
        if (found) return extractLocationFromShg(found);
      }
      // Not found in local cache
      return null;
    } catch (e) {
      console.warn('findShgAcrossCachedPanchayats error', e);
      return null;
    }
  }

  // ---------- SUBMIT FLOW ----------
  // 1) Create RecordedBeneficiary from UPSRLM row (if not already created)
  // 2) Create/Update ExistingEnterprise with recorded_benef_id
  // 3) Patch RecordedBeneficiary.enterprise_id with created enterprise id
  // 4) Create child rows: loans, support, training, media
  const ensureRecordedBeneficiary = async () => {
    let recordedBenefId =
      recordedBenef?.TH_urid || recordedBenef?.TH_URID || recordedBenef?.id || null;

    if (recordedBenefId) return recordedBenefId;

    // If not present, create one from UPSRLM beneficiary row
    if (!beneficiary) {
      throw new Error(
        'Beneficiary data missing. Cannot create recorded beneficiary.'
      );
    }

    const addr =
      Array.isArray(beneficiary.member_addresses) &&
      beneficiary.member_addresses.length > 0
        ? beneficiary.member_addresses[0]
        : null;

    const phone =
      Array.isArray(beneficiary.member_phones) &&
      beneficiary.member_phones.length > 0
        ? beneficiary.member_phones[0]
        : null;

    const addressText =
      (addr?.address_line1 && String(addr.address_line1).trim()) ||
      (addr?.address_line2 && String(addr.address_line2).trim()) ||
      '';

    const age = computeAgeFromDob(beneficiary.dob);

    // Primary mapping from member row
    let district_id = addr?.district_id ?? addr?.districtId ?? null;
    let block_id = addr?.block_id ?? addr?.blockId ?? null;
    let panchayat_id = addr?.panchayat_id ?? addr?.panchayatId ?? null;
    let village_id = addr?.village_id ?? addr?.villageId ?? null;
    let member_mobile = phone?.phone_no ?? phone?.mobile ?? phone?.number ?? null;
    let marital_status = beneficiary.marital_status ?? beneficiary.maritalStatus ?? '';
    let father_husband_name = beneficiary.father_husband ?? beneficiary.father_husband_name ?? beneficiary.relation_name ?? '';

    // lokos_shg_code may be present in local tempShg or member; try those first
    let lokos_shg_code = lokosShgCode || beneficiary.shg_code || beneficiary.lokos_shg_code || null;

    // If any critical location fields missing, try to extract from tempShg (passed in route)
    if ((!district_id || !block_id || !panchayat_id || !village_id || !lokos_shg_code) && tempShg) {
      const loc = extractLocationFromShg(tempShg);
      if (loc) {
        district_id = district_id || loc.district_id || null;
        block_id = block_id || loc.block_id || null;
        panchayat_id = panchayat_id || loc.panchayat_id || null;
        village_id = village_id || loc.village_id || null;
        lokos_shg_code = lokos_shg_code || loc.lokos_shg_code || null;
      }
    }

    // If still missing, try cached SHG lists for CRP panchayats
    if ((!district_id || !block_id || !panchayat_id || !village_id || !lokos_shg_code) && (beneficiary.shg_code || lokos_shg_code)) {
      const fallback = await findShgAcrossCachedPanchayats(beneficiary.shg_code || lokos_shg_code);
      if (fallback) {
        district_id = district_id || fallback.district_id || null;
        block_id = block_id || fallback.block_id || null;
        panchayat_id = panchayat_id || fallback.panchayat_id || null;
        village_id = village_id || fallback.village_id || null;
        lokos_shg_code = lokos_shg_code || fallback.lokos_shg_code || null;
      }
    }

    // As a last resort, if block_id can be inferred from CRP detail, try on-demand fetch for that panchayat
    if ((!district_id || !block_id || !panchayat_id || !village_id) && lokos_shg_code) {
      try {
        const crpDetail = getCrpDetail ? getCrpDetail() : null;
        const cbid = crpDetail?.block_id ?? crpDetail?.blockId ?? null;
        if (cbid) {
          // try to find in block's SHG list (panchayat filter omitted to get broader results)
          const shgRes = await gsApi.getUpsrlmShgList(cbid, { page_size: 5000 });
          const shgRows = Array.isArray(shgRes?.data)
            ? shgRes.data
            : Array.isArray(shgRes?.results)
            ? shgRes.results
            : Array.isArray(shgRes)
            ? shgRes
            : [];
          const found = shgRows.find((s) => {
            const code = s.code ?? s.shg_code ?? s.lokos_shg_code ?? s.code;
            return String(code) === String(lokos_shg_code);
          });
          if (found) {
            const loc = extractLocationFromShg(found);
            district_id = district_id || loc.district_id || null;
            block_id = block_id || loc.block_id || null;
            panchayat_id = panchayat_id || loc.panchayat_id || null;
            village_id = village_id || loc.village_id || null;
            lokos_shg_code = lokos_shg_code || loc.lokos_shg_code || null;
          }
        }
      } catch (e) {
        // ignore failures here — we already tried other fallbacks
        console.warn('on-demand SHG list fallback failed', e);
      }
    }

    // created_by: prefer loggedUser numeric PK; fallback to crpUserId if numeric
    let created_by_to_send = null;
    const candidate =
      loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? crpUserId ?? null;
    if (candidate !== null && candidate !== undefined) {
      if (typeof candidate === 'number') {
        created_by_to_send = candidate;
      } else if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
        created_by_to_send = parseInt(candidate.trim(), 10);
      } else {
        created_by_to_send = null;
      }
    }

    const recordedPayload = {
      lokos_member_code: beneficiary.member_code || beneficiary.nic_member_code || null,
      applicant_name: beneficiary.member_name || '',
      age: age,
      gender: beneficiary.gender || '',
      marital_status: marital_status,
      father_husband_name: father_husband_name,
      category: beneficiary.social_category || beneficiary.socialCategory || '',
      education: beneficiary.education || '',
      address: addressText,
      district_id: district_id || null,
      block_id: block_id || null,
      panchayat_id: panchayat_id || null,
      village_id: village_id || null,
      mobile: member_mobile || null,
      email: beneficiary.email || null,
      lokos_shg_code: lokos_shg_code || null,
      // enterprise_id will be set after enterprise is created
    };

    if (created_by_to_send !== null) {
      recordedPayload.created_by = created_by_to_send;
    }

    const recRes = await gsApi.createRecordedBeneficiary(recordedPayload);

    recordedBenefId =
      recRes?.TH_urid || recRes?.TH_URID || recRes?.id || null;

    if (!recordedBenefId) {
      throw new Error(
        'Recorded beneficiary created but ID missing in response.'
      );
    }

    return recordedBenefId;
  };

  const handleSubmit = async () => {
    if (!existingForm.enterprise_name) {
      Alert.alert('Validation', 'Please enter enterprise name.');
      return;
    }

    try {
      setLoading(true);

      // ----- Step 1: ensure we have a Recorded Beneficiary ID -----
      const recordedBenefId = await ensureRecordedBeneficiary();

      // ----- Step 2: create/update ExistingEnterprise, linked to recorded_benef_id -----
      const mainPayload = {
        recorded_benef_id: recordedBenefId,
        enterprise_name: existingForm.enterprise_name,
        year_of_establishment: existingForm.year_of_establishment
          ? parseInt(existingForm.year_of_establishment, 10)
          : null,
        enterprise_type:
          existingForm.enterprise_type === 'Others'
            ? existingForm.enterprise_type_other || 'Others'
            : existingForm.enterprise_type || null,
        ownership_type:
          existingForm.ownership_type === 'Others'
            ? existingForm.ownership_type_other || 'Others'
            : existingForm.ownership_type || null,
        number_of_employees: existingForm.number_of_employees
          ? parseInt(existingForm.number_of_employees, 10)
          : null,
        activity_or_product_type:
          existingForm.main_product_service === 'Others'
            ? existingForm.main_product_service_other || ''
            : existingForm.main_product_service || '',
        main_product_name: existingForm.main_product_name || '',
        product_features: existingForm.product_features || '',
        production_capacity: existingForm.production_capacity || '',
        raw_material:
          existingForm.raw_material === 'Others'
            ? existingForm.raw_material_other || ''
            : existingForm.raw_material || '',
        machinery_equipment:
          existingForm.machinery_equipment === 'Others'
            ? existingForm.machinery_equipment_other || ''
            : existingForm.machinery_equipment || '',
        workplace_type:
          existingForm.workplace_type === 'Others'
            ? existingForm.workplace_type_other || ''
            : existingForm.workplace_type || '',
        packaging_branding_status:
          existingForm.packaging_branding_status || '',
        certification_registration:
          existingForm.certification_registration || '',
        sales_area: existingForm.sales_area || '',
        monthly_income_estimate: existingForm.monthly_income_estimate
          ? parseFloat(existingForm.monthly_income_estimate)
          : null,
        initial_investment: existingForm.initial_investment
          ? parseFloat(existingForm.initial_investment)
          : null,
        source_of_investment:
          existingForm.source_of_investment === 'Others'
            ? existingForm.source_of_investment_specify || ''
            : existingForm.source_of_investment || '',
        working_capital_monthly: existingForm.working_capital_monthly
          ? parseFloat(existingForm.working_capital_monthly)
          : null,
        annual_turnover: existingForm.annual_turnover
          ? parseFloat(existingForm.annual_turnover)
          : null,
        profit_percentage: existingForm.profit_percentage
          ? parseFloat(existingForm.profit_percentage)
          : null,
        has_taken_loan: loans.length > 0,
        // DO NOT send financial_coordination (kept out intentionally)
        // financial_coordination: null,
        target_customers:
          existingForm.target_customers === 'Others'
            ? existingForm.target_customers_other || ''
            : existingForm.target_customers || '',
        marketing_channels: Array.isArray(existingForm.marketing_channels)
          ? existingForm.marketing_channels.join(',')
          : existingForm.marketing_channels || '',
        monthly_sales: existingForm.monthly_sales
          ? parseFloat(existingForm.monthly_sales)
          : null,
        marketing_strategy: existingForm.marketing_strategy || '',
        marketing_challenges: Array.isArray(existingForm.marketing_challenges)
          ? existingForm.marketing_challenges.join(', ')
          : existingForm.marketing_challenges || '',
        electricity_available:
          existingForm.electricity_available === 'Yes',
        water_available: existingForm.water_available === 'Yes',
        transportation_facility:
          existingForm.transportation_facility || '',
        can_send_to_bijnor_clf:
          existingForm.can_transport_clf === 'Yes',
        need_transport_help:
          existingForm.transportation_facility === 'Need Help',
        has_received_any_scheme_support:
          existingForm.government_subsidy === 'Yes',
        is_training_received:
          existingForm.training_received === 'Yes',
        training_details: existingForm.training_details || '',
        skills_acquired: existingForm.skills_acquired || '',
        expansion_plan: Array.isArray(existingForm.expansion_plan)
          ? existingForm.expansion_plan.join(',')
          : existingForm.expansion_plan || '',
        declaration_confirmed: !!existingForm.declaration_confirmed,
        declaration_date:
          existingForm.declaration_date || null,
        verifier_name: existingForm.verifier_name || '',
      };

      // IMPORTANT: we do NOT send nested children here (Option B).
      const payload = {
        ...mainPayload,
      };

      let enterpriseRes;
      if (existingEnterprise?.TH_urid) {
        enterpriseRes = await gsApi.updateExistingEnterprise(
          existingEnterprise.TH_urid,
          payload
        );
      } else {
        enterpriseRes = await gsApi.createExistingEnterprise(payload);
      }

      const enterpriseId =
        enterpriseRes?.TH_urid ||
        enterpriseRes?.TH_URID ||
        enterpriseRes?.id ||
        null;

      if (!enterpriseId) {
        throw new Error(
          'Enterprise saved but ID missing in response.'
        );
      }

      // ----- Step 3: Patch RecordedBeneficiary.enterprise_id with enterpriseId -----
      try {
        if (recordedBenefId) {
          await gsApi.updateRecordedBeneficiary(recordedBenefId, {
            enterprise_id: enterpriseId,
          });
        }
      } catch (e) {
        console.error('Failed to update recorded beneficiary enterprise_id', e);
        // keep going; not fatal
      }

      // ----- Step 4: Create loan details via /enterprise-loan-details/ -----
      if (loans && loans.length) {
        for (const l of loans) {
          const institution_name =
            l.institution === 'Others'
              ? l.institutionOther || 'Others'
              : l.institution || '';
          const loan_amount = l.amount ? parseFloat(l.amount) : null;
          const repayment_status =
            l.repayment === 'Others'
              ? l.repaymentOther || 'Others'
              : l.repayment || '';

          // date_taken not captured in UI; leave null
          try {
            await gsApi.createEnterpriseLoanDetail({
              enterprise_id: enterpriseId,
              institution_name,
              loan_amount,
              date_taken: null,
              repayment_status,
            });
          } catch (e) {
            console.warn('createEnterpriseLoanDetail failed', e);
          }
        }
      }

      // ----- Step 5: Create support detail via /enterprise-support-details/ -----
      const reqSupportArray = Array.isArray(existingForm.required_support)
        ? existingForm.required_support
        : [];
      const required_support_bool = reqSupportArray.length > 0;

      const supportPayload = {
        enterprise_id: enterpriseId,
        department_name: existingForm.subsidy_department || null,
        scheme_name: existingForm.subsidy_scheme || null,
        date_taken: null,
        institutional_support: !!existingForm.institutional_support,
        mentorship_support: false,
        required_support: required_support_bool,
        what_req_support: reqSupportArray.join(', '),
        is_skill_training_needed: reqSupportArray.includes('Training'),
        is_entrepreneurship_training_needed: reqSupportArray.includes(
          'Training'
        ),
        is_financial_assistance_needed: reqSupportArray.includes('Finance'),
        is_market_branding_needed: reqSupportArray.includes(
          'Advertisement / Promotion'
        ),
        is_infrastructure_needed: reqSupportArray.includes('Equipment'),
        is_digital_emarket_needed: reqSupportArray.includes('E-commerce'),
        other_support: existingForm.required_support_other || '',
      };

      try {
        if (
          supportPayload.department_name ||
          supportPayload.scheme_name ||
          required_support_bool
        ) {
          await gsApi.createEnterpriseSupportDetail(supportPayload);
        }
      } catch (e) {
        console.warn('createEnterpriseSupportDetail failed', e);
      }

      // ----- Step 6: Create training requirement via /enterprise-training-reqs/ -----
      if (existingForm.additional_training_required === 'Yes') {
        const hasTrainingData =
          existingForm.training_skill_name ||
          existingForm.training_type ||
          existingForm.training_institution;
        if (hasTrainingData) {
          try {
            await gsApi.createEnterpriseTrainingReq({
              enterprise_id: enterpriseId,
              skill_name: existingForm.training_skill_name || '',
              training_type: existingForm.training_type || '',
              any_specific_scheme: null,
              any_specific_department: existingForm.training_institution || '',
            });
          } catch (e) {
            console.warn('createEnterpriseTrainingReq failed', e);
          }
        }
      }

      // ----- Step 7: Media upload via /enterprise-media/ (multipart, grouped rows) -----
      const m = mediaFiles;
      const arrs = {
        photo_entrepreneur: m.photo_entrepreneur || [],
        photo_enterprise: m.photo_enterprise || [],
        open_box_photo: m.open_box_photo || [],
        close_box_photo: m.close_box_photo || [],
        others: m.others || [],
        certificates: m.certificates || [],
      };

      const maxLen = Math.max(
        arrs.photo_entrepreneur.length,
        arrs.photo_enterprise.length,
        arrs.open_box_photo.length,
        arrs.close_box_photo.length,
        arrs.others.length,
        arrs.certificates.length
      );

      const fileKeys = Object.keys(arrs);

      const toFilePart = (asset) => ({
        uri: asset.uri,
        name: asset.fileName || 'upload.jpg',
        type: asset.type || 'image/jpeg',
      });

      for (let i = 0; i < maxLen; i++) {
        const formData = new FormData();
        formData.append('enterprise_id', enterpriseId);

        let hasAnyFile = false;
        for (const key of fileKeys) {
          const arr = arrs[key];
          if (i < arr.length && arr[i]) {
            hasAnyFile = true;
            formData.append(key, toFilePart(arr[i]));
          }
        }

        if (!hasAnyFile) continue;

        try {
          await gsApi.uploadEnterpriseMedia(formData);
        } catch (e) {
          console.warn('uploadEnterpriseMedia failed for index', i, e);
        }
      }

      Alert.alert('Success', 'Existing enterprise saved successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error('ExistingEnterprise submit error', err);
      const msg =
        err?.data?.detail ||
        err?.message ||
        'Failed to save enterprise. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const benefName =
    beneficiary?.member_name ||
    beneficiary?.name ||
    recordedBenef?.applicant_name ||
    '';

  return (
    <View style={{ padding: 12, flex: 1, backgroundColor: '#fff' }}>
      <Text
        style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}
      >
        Existing Enterprise — {benefName}
      </Text>

      <ScrollView nestedScrollEnabled>
        {formSections.map((section) => (
          <View key={section.key} style={styles.sectionContainer}>
            <TouchableOpacity
              onPress={() => toggleSection(section.key)}
              style={styles.sectionHeader}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionToggle}>
                {openSections[section.key] ? '−' : '+'}
              </Text>
            </TouchableOpacity>

            {openSections[section.key] && (
              <View style={styles.sectionBody}>
                {section.fields.map((fieldKey) => renderField(fieldKey))}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading || uploading}
        >
          {loading || uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              Save Existing Enterprise
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#EE6969',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  smallBtn: {
    backgroundColor: '#EEE',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    minWidth: 70,
  },
  smallBtnText: { color: '#333', fontWeight: '600' },
  submitButton: {
    backgroundColor: '#EE6969',
    padding: 14,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  loanEntryContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#FCFBF4',
  },
  addBtn: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  deleteBtn: {
    backgroundColor: '#EE6969',
    marginTop: 8,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 250,
    paddingBottom: 15,
    paddingTop: 10,
  },
  cancelBtn: { padding: 10, alignItems: 'center', marginTop: 8 },

  // Sections
  sectionContainer: {
    borderWidth: 1,
    borderColor: '#f0c5c5',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FFEAEA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#AA2E2E',
  },
  sectionToggle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#AA2E2E',
  },
  sectionBody: {
    padding: 8,
    backgroundColor: '#FFF',
  },

  // Media thumbnails
  thumbWrapper: {
    width: 64,
    height: 64,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
