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
      'enterprise_aadhar_code',
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
      // (all new conditional training / skills placeholders are rendered inside training_received block)
      'future_training_requirements',
      'institutional_support',
    ],
  },
  {
    key: 'loan',
    title: '6) Loan Details',
    fields: ['loan_details', 'financial_linkage', 'market_linkage'],
  },
  {
    key: 'support',
    title: '7) Support Required',
    fields: ['required_support', 'expansion_plan', 'govt_scheme_info'],
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
  {
    label: 'Lack of Social Media Marketting',
    value: 'Lack of Social Media Marketting',
  },
  { label: 'Others', value: 'Others' },
];

// NEW: Skills acquired multi-selector options
const skillsAcquiredMultiOptions = [
  { label: 'ITI', value: 'ITI' },
  { label: 'UPSDM', value: 'UPSDM' },
  { label: 'DDU-GKY', value: 'DDU-GKY' },
  { label: 'PMKVY', value: 'PMKVY' },
  { label: 'NABARD', value: 'NABARD' },
  { label: 'RSETI', value: 'RSETI' },
  { label: 'Vishwakarma', value: 'Vishwakarma' },
  { label: 'Others', value: 'Others' },
];

// NEW: Training sector dropdown options
const trainingSectorOptions = [
  {
    label: 'Food Processing (Pickles, Papad, Bakery, etc.)',
    value: 'Food Processing (Pickles, Papad, Bakery, etc.)',
  },
  { label: 'Tailoring / Garment Manufacturing', value: 'Tailoring / Garment Manufacturing' },
  { label: 'Beauty and Wellness', value: 'Beauty and Wellness' },
  {
    label: 'Handicrafts / Terracotta / Jute / Bamboo-based Work',
    value: 'Handicrafts / Terracotta / Jute / Bamboo-based Work',
  },
  { label: 'Retail Trade / Grocery Store', value: 'Retail Trade / Grocery Store' },
  { label: 'Dairy / Goat Rearing / Poultry', value: 'Dairy / Goat Rearing / Poultry' },
  {
    label: 'Solar Product Installation / Repair (Suryasakhii)',
    value: 'Solar Product Installation / Repair (Suryasakhii)',
  },
  {
    label: 'Agriculture-based Enterprise (Nursery, Manure)',
    value: 'Agriculture-based Enterprise (Nursery, Manure)',
  },
  { label: 'Others', value: 'Others' },
];

// NEW: Govt schemes dropdown options (placeholder only)
const govtSchemeOptions = [
  { label: 'PMEGP (Prime Minister Employment Generation Program)', value: 'PMEGP' },
  { label: 'ODOP (One District One Product)', value: 'ODOP' },
  { label: 'Chief Minister Youth Entrepreneurship Scheme', value: 'CMYES' },
  { label: 'NRLM Livelihood Fund', value: 'NRLM Livelihood Fund' },
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
    enterprise_aadhar_code: '',

    // NEW: placeholder training / skills fields (UI-only)
    training_duration: '',
    work_started_after_training: '',
    work_started_after_training_details: '',
    skills_sufficient_for_livelihood: '',
    skills_acquired_multi: [],
    skills_acquired_multi_other: '',
    future_training_required_preferred_duration: '',
    future_training_required_sector: '',
    future_training_required_sector_other: '',
    future_training_required_location: '',
    start_business_after_training: '',
    start_business_after_training_detail: '',
    expected_monthly_income_after_training: '',
    know_skill_centers_nearby: '',
    skill_center_location: '',
    know_nearest_industry: '',
    nearest_industries: [],

    // NEW: govt scheme info placeholder (Support Required)
    govt_scheme_info: '',
    govt_scheme_info_other: '',

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

  // NEW: industry rows (placeholder only)
  const addIndustryRow = () => {
    setExistingForm((f) => ({
      ...f,
      nearest_industries: [
        ...(Array.isArray(f.nearest_industries) ? f.nearest_industries : []),
        { industry_name: '', work_type: '' },
      ],
    }));
  };

  const updateIndustryRow = (index, field, value) => {
    setExistingForm((f) => {
      const arr = Array.isArray(f.nearest_industries)
        ? [...f.nearest_industries]
        : [];
      if (!arr[index]) {
        arr[index] = { industry_name: '', work_type: '' };
      }
      arr[index] = { ...arr[index], [field]: value };
      return { ...f, nearest_industries: arr };
    });
  };

  const removeIndustryRow = (index) => {
    setExistingForm((f) => {
      const arr = Array.isArray(f.nearest_industries)
        ? [...f.nearest_industries]
        : [];
      const filtered = arr.filter((_, i) => i !== index);
      return { ...f, nearest_industries: filtered };
    });
  };

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
          parsed = {
            y: parts[0],
            m: String(parseInt(parts[1], 10)),
            day: String(parseInt(parts[2], 10)),
          };
        }
      }
      if (!parsed) {
        const asDate = new Date(d);
        if (!Number.isNaN(asDate.getTime())) {
          parsed = {
            y: String(asDate.getFullYear()),
            m: String(asDate.getMonth() + 1),
            day: String(asDate.getDate()),
          };
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
        Alert.alert(
          'Permission required',
          'Camera permission is required to capture photos.'
        );
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
      <Text style={styles.helpText}>
        Please select the correct option for this field. If you are not sure,
        please choose 'Others' and then specify below. Thank you.
      </Text>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(itemValue) => {
          onValueChange(itemValue);
          if (itemValue !== 'Others' && specifyValue) {
            onSpecifyChange('');
          }
        }}
        style={[styles.input, styles.dropdown]}
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
        style={[styles.input, styles.dropdown]}
      >
        <Picker.Item label="Select Institution" value="" />
        {institutionOptions.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
      {entry.institution === 'Others' && (
        <TextInput
          placeholder="Specify Institution"
          style={[styles.input, styles.dropdown]}
          value={entry.institutionOther}
          onChangeText={(val) => onUpdate({ ...entry, institutionOther: val })}
        />
      )}

      <TextInput
        placeholder="Loan Amount"
        style={[styles.input, styles.dropdown]}
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
        style={[styles.input, styles.dropdown]}
      >
        <Picker.Item label="Select Repayment Status" value="" />
        {repaymentOptions.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
      {entry.repayment === 'Others' && (
        <TextInput
          placeholder="Specify Repayment Status"
          style={[styles.input, styles.dropdown]}
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

  const toggleSkillsAcquiredMulti = (value) => {
    const current = Array.isArray(existingForm.skills_acquired_multi)
      ? [...existingForm.skills_acquired_multi]
      : [];
    let updated;
    if (current.includes(value)) {
      updated = current.filter((c) => c !== value);
      if (value === 'Others') {
        setExistingForm((f) => ({ ...f, skills_acquired_multi_other: '' }));
      }
    } else {
      updated = [...current, value];
    }
    setExistingForm((f) => ({ ...f, skills_acquired_multi: updated }));
  };

  const multilineFields = [
    'product_features',
    'marketing_strategy',
    'marketing_challenges',
    'training_details',
    'skills_acquired',
    // 'financial_coordination',
    'training_duration',
    'work_started_after_training_details',
    'skills_acquired_multi_other',
    'future_training_required_preferred_duration',
    'future_training_required_sector_other',
    'future_training_required_location',
    'start_business_after_training_detail',
    'expected_monthly_income_after_training',
    'skill_center_location',
    'govt_scheme_info_other',
  ];

  // Polite help-texts for fields (suitable for non-technical users)
  const fieldHelp = {
    enterprise_name: 'Please enter the name of the enterprise. Thank you.',
    enterprise_type:
      'Please choose the main type of the enterprise. If unsure, select Others and specify.',
    ownership_type:
      'Please select the ownership type. If unsure, pick the closest option.',
    year_of_establishment:
      'Please select the year when the enterprise started. If you are not sure, give your best estimate.',
    enterprise_aadhar_code:
      'Please enter the Enterprise Aadhar Code carefully. This is used for record-keeping.',
    number_of_employees:
      'Please enter how many people work here. If none, enter 0.',
    sales_area:
      'Please describe where you sell (local market, nearby town, online, etc.).',
    target_customers:
      'Please select who your main customers are. If many, choose the main one.',
    declaration_date:
      'Please enter the date of declaration in YYYY-MM-DD format (for example: 2025-11-21).',
  };

  const getHelpText = (k) =>
    fieldHelp[k] || 'Please provide the information for this field. Thank you.';

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

    if (k === 'enterprise_aadhar_code') {
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Uddyam Aadhar Number (If Available)</Text>
          <Text style={styles.helpText}>
            Please enter the Enterprise Aadhar Code (digits). This will
            be used for verification and kept secure. Please type
            carefully.
          </Text>
          <TextInput
            value={String(existingForm.enterprise_aadhar_code || '')}
            onChangeText={(v) =>
              setExistingForm((prev) => ({
                ...prev,
                enterprise_aadhar_code: v,
              }))
            }
            style={styles.input}
            keyboardType="default"
          />
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
            style={[styles.input, styles.dropdown]}
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
            style={[styles.input, styles.dropdown]}
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
            style={[styles.input, styles.dropdown]}
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
                style={[styles.input, styles.dropdown]}
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
            style={[styles.input, styles.dropdown]}
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
            style={[styles.input, styles.dropdown]}
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
            style={[styles.input, styles.dropdown]}
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
                target_customers_other:
                  v === 'Others' ? f.target_customers_other : '',
              }))
            }
            style={[styles.input, styles.dropdown]}
          >
            <Picker.Item label="Select..." value="" />
            {targetCustomersOptions.map((opt) => (
              <Picker.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
              />
            ))}
          </Picker>
          {existingForm.target_customers === 'Others' && (
            <TextInput
              placeholder="Please specify"
              style={[styles.input, { marginTop: 6 }]}
              value={existingForm.target_customers_other || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({
                  ...f,
                  target_customers_other: text,
                }))
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
                setExistingForm((f) => ({
                  ...f,
                  marketing_challenges_other: text,
                }))
              }
            />
          )}
        </View>
      );
    }

    if (k === 'future_training_requirements') {
      const val = existingForm.additional_training_required || '';
      const showFutureBlock = val === 'Yes';

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
                training_institution: v === 'No' ? '' : f.training_institution,

                future_training_required_preferred_duration:
                  v === 'No'
                    ? ''
                    : f.future_training_required_preferred_duration,
                future_training_required_sector:
                  v === 'No' ? '' : f.future_training_required_sector,
                future_training_required_sector_other:
                  v === 'No'
                    ? ''
                    : f.future_training_required_sector_other,
                future_training_required_location:
                  v === 'No'
                    ? ''
                    : f.future_training_required_location,
              }));
            }
          )}

          {showFutureBlock && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>
                How many days of training you want?
              </Text>

              {/* Preferred Training Duration (No. of Days) */}
              <TextInput
                placeholder="Preferred Training Duration (No. of Days)"
                style={[styles.input, styles.dropdown]}
                value={
                  existingForm.future_training_required_preferred_duration ||
                  ''
                }
                onChangeText={(text) =>
                  setExistingForm((f) => ({
                    ...f,
                    future_training_required_preferred_duration: text,
                  }))
                }
              />

              {/* Training Sector dropdown (with Others -> textarea) */}
              <Text style={[styles.label, { marginTop: 8 }]}>
                What type of training are you interested in? (Training Sector)
              </Text>
              <Picker
                selectedValue={
                  existingForm.future_training_required_sector || ''
                }
                onValueChange={(v) =>
                  setExistingForm((f) => ({
                    ...f,
                    future_training_required_sector: v,
                    future_training_required_sector_other:
                      v === 'Others'
                        ? f.future_training_required_sector_other
                        : '',
                  }))
                }
                style={[styles.input, styles.dropdown]}
              >
                <Picker.Item label="Select..." value="" />
                {trainingSectorOptions.map((opt) => (
                  <Picker.Item
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                  />
                ))}
              </Picker>
              {existingForm.future_training_required_sector === 'Others' && (
                <TextInput
                  placeholder="Please specify Training Sector"
                  style={[styles.input, { marginTop: 6 }]}
                  value={
                    existingForm.future_training_required_sector_other ||
                    ''
                  }
                  onChangeText={(text) =>
                    setExistingForm((f) => ({
                      ...f,
                      future_training_required_sector_other: text,
                    }))
                  }
                  multiline
                />
              )}

              {/* Preferred Training Location */}
              <Text style={[styles.label, { marginTop: 8 }]}>
                Preferred Training Location
              </Text>
              <TextInput
                placeholder="Preferred Training Location"
                style={[styles.input, styles.dropdown]}
                value={
                  existingForm.future_training_required_location || ''
                }
                onChangeText={(text) =>
                  setExistingForm((f) => ({
                    ...f,
                    future_training_required_location: text,
                  }))
                }
                multiline
              />
            </View>
          )}
        </View>
      );
    }

    if (k === 'training_received') {
      const val = existingForm.training_received || '';
      const showTrainingBlock = val === 'Yes';

      const skillsSufficient = existingForm.skills_sufficient_for_livelihood;
      const skillsSufficientYes = skillsSufficient === 'Yes';
      const skillsSufficientNo = skillsSufficient === 'No';

      const showSkillsAcquiredMulti =
        skillsSufficientYes && Array.isArray(existingForm.skills_acquired_multi);

      const additionalTrainingAnswer =
        existingForm.additional_training_required || '';

      const workStarted = existingForm.work_started_after_training || '';
      const workStartedYes = workStarted === 'Yes';

      const startBusiness = existingForm.start_business_after_training || '';
      const startBusinessYes = startBusiness === 'Yes';

      const knowSkillCenters = existingForm.know_skill_centers_nearby || '';
      const knowSkillCentersYes = knowSkillCenters === 'Yes';

      const knowNearestIndustry = existingForm.know_nearest_industry || '';
      const knowNearestIndustryYes = knowNearestIndustry === 'Yes';

      const selectedSkillsAcquiredMulti =
        Array.isArray(existingForm.skills_acquired_multi) &&
        existingForm.skills_acquired_multi.length > 0
          ? existingForm.skills_acquired_multi
          : [];

      const showSkillsAcquiredMultiOther =
        selectedSkillsAcquiredMulti.includes('Others');

      const industryRows = Array.isArray(existingForm.nearest_industries)
        ? existingForm.nearest_industries
        : [];

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

                training_duration: v === 'No' ? '' : f.training_duration,
                work_started_after_training:
                  v === 'No' ? '' : f.work_started_after_training,
                work_started_after_training_details:
                  v === 'No' ? '' : f.work_started_after_training_details,
                skills_sufficient_for_livelihood:
                  v === 'No' ? '' : f.skills_sufficient_for_livelihood,
                skills_acquired_multi:
                  v === 'No' ? [] : f.skills_acquired_multi || [],
                skills_acquired_multi_other:
                  v === 'No' ? '' : f.skills_acquired_multi_other,

                start_business_after_training:
                  v === 'No' ? '' : f.start_business_after_training,
                start_business_after_training_detail:
                  v === 'No'
                    ? ''
                    : f.start_business_after_training_detail,
                expected_monthly_income_after_training:
                  v === 'No'
                    ? ''
                    : f.expected_monthly_income_after_training,
                know_skill_centers_nearby:
                  v === 'No' ? '' : f.know_skill_centers_nearby,
                skill_center_location:
                  v === 'No' ? '' : f.skill_center_location,
                know_nearest_industry:
                  v === 'No' ? '' : f.know_nearest_industry,
                nearest_industries:
                  v === 'No' ? [] : f.nearest_industries || [],
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
                  setExistingForm((f) => ({
                    ...f,
                    training_details: text,
                  }))
                }
                multiline
              />

              {/* Duration of Training (placeholder) */}
              <Text style={[styles.label, { marginTop: 8 }]}>
                Duration of Training
              </Text>
              <TextInput
                placeholder="Enter training duration"
                style={[styles.input, { minHeight: 40 }]}
                value={existingForm.training_duration || ''}
                onChangeText={(text) =>
                  setExistingForm((f) => ({
                    ...f,
                    training_duration: text,
                  }))
                }
                multiline
              />

              {/* Did you start any work after the training? */}
              {renderYesNoToggle(
                'Did you start any work after the training?',
                workStarted,
                (v) =>
                  setExistingForm((f) => ({
                    ...f,
                    work_started_after_training: v,
                    work_started_after_training_details:
                      v === 'Yes'
                        ? f.work_started_after_training_details
                        : '',
                  }))
              )}

              {workStartedYes && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>
                    Specify what work you started
                  </Text>
                  <TextInput
                    placeholder="Specify what work you started"
                    style={[styles.input, { minHeight: 60 }]}
                    value={
                      existingForm.work_started_after_training_details ||
                      ''
                    }
                    onChangeText={(text) =>
                      setExistingForm((f) => ({
                        ...f,
                        work_started_after_training_details: text,
                      }))
                    }
                    multiline
                  />
                </View>
              )}

              {/* Are your current skills sufficient for your livelihood? */}
              {renderYesNoToggle(
                'Are your current skills sufficient for your livelihood?',
                skillsSufficient,
                (v) =>
                  setExistingForm((f) => ({
                    ...f,
                    skills_sufficient_for_livelihood: v,

                    // reset both sides when toggled
                    skills_acquired_multi:
                      v === 'Yes' ? f.skills_acquired_multi || [] : [],
                    skills_acquired_multi_other:
                      v === 'Yes' ? f.skills_acquired_multi_other : '',
                    additional_training_required:
                      v === 'No'
                        ? f.additional_training_required
                        : '',
                    future_training_required_preferred_duration:
                      v === 'No'
                        ? f.future_training_required_preferred_duration
                        : '',
                    future_training_required_sector:
                      v === 'No'
                        ? f.future_training_required_sector
                        : '',
                    future_training_required_sector_other:
                      v === 'No'
                        ? f.future_training_required_sector_other
                        : '',
                    future_training_required_location:
                      v === 'No'
                        ? f.future_training_required_location
                        : '',
                  }))
              )}

              {/* If Yes -> Skills Acquired multi-selector */}
              {skillsSufficientYes && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>Skills Acquired</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    {skillsAcquiredMultiOptions.map(
                      ({ label, value }) => (
                        <TouchableOpacity
                          key={value}
                          style={[
                            styles.smallBtn,
                            selectedSkillsAcquiredMulti.includes(
                              value
                            ) && { backgroundColor: '#EE6969' },
                          ]}
                          onPress={() =>
                            toggleSkillsAcquiredMulti(value)
                          }
                        >
                          <Text
                            style={{
                              color:
                                selectedSkillsAcquiredMulti.includes(
                                  value
                                )
                                  ? '#fff'
                                  : '#333',
                              fontWeight: '600',
                            }}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  {showSkillsAcquiredMultiOther && (
                    <TextInput
                      placeholder="Specify Other Skills Acquired"
                      style={[styles.input, { marginTop: 6 }]}
                      value={
                        existingForm.skills_acquired_multi_other || ''
                      }
                      onChangeText={(text) =>
                        setExistingForm((f) => ({
                          ...f,
                          skills_acquired_multi_other: text,
                        }))
                      }
                      multiline
                    />
                  )}
                </View>
              )}

              {/* If No -> future training requirements block already handled by k === 'future_training_requirements' */}

              {/* Start own business after training? */}
              {renderYesNoToggle(
                'Do you want to start your own business after training?',
                startBusiness,
                (v) =>
                  setExistingForm((f) => ({
                    ...f,
                    start_business_after_training: v,
                    start_business_after_training_detail:
                      v === 'Yes'
                        ? f.start_business_after_training_detail
                        : '',
                  }))
              )}

              {startBusinessYes && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>Business Detail</Text>
                  <TextInput
                    placeholder="Describe the business you want to start"
                    style={[styles.input, { minHeight: 60 }]}
                    value={
                      existingForm.start_business_after_training_detail ||
                      ''
                    }
                    onChangeText={(text) =>
                      setExistingForm((f) => ({
                        ...f,
                        start_business_after_training_detail: text,
                      }))
                    }
                    multiline
                  />
                </View>
              )}

              {/* Expected Monthly Income after Training (₹) */}
              <Text style={[styles.label, { marginTop: 8 }]}>
                Expected Monthly Income after Training (₹)
              </Text>
              <TextInput
                placeholder="Expected Monthly Income after Training (₹)"
                style={[styles.input, { minHeight: 40 }]}
                keyboardType="numeric"
                value={
                  existingForm.expected_monthly_income_after_training ||
                  ''
                }
                onChangeText={(text) =>
                  setExistingForm((f) => ({
                    ...f,
                    expected_monthly_income_after_training: text,
                  }))
                }
                multiline
              />

              {/* Know skill centers nearby? */}
              {renderYesNoToggle(
                'Do you know about any Skill Centers near you?',
                knowSkillCenters,
                (v) =>
                  setExistingForm((f) => ({
                    ...f,
                    know_skill_centers_nearby: v,
                    skill_center_location:
                      v === 'Yes' ? f.skill_center_location : '',
                  }))
              )}

              {knowSkillCentersYes && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>Center Location</Text>
                  <TextInput
                    placeholder="Center Location"
                    style={[styles.input, { minHeight: 60 }]}
                    value={existingForm.skill_center_location || ''}
                    onChangeText={(text) =>
                      setExistingForm((f) => ({
                        ...f,
                        skill_center_location: text,
                      }))
                    }
                    multiline
                  />
                </View>
              )}

              {/* Know nearest industry? */}
              {renderYesNoToggle(
                'Do you know about any nearest Industry?',
                knowNearestIndustry,
                (v) =>
                  setExistingForm((f) => ({
                    ...f,
                    know_nearest_industry: v,
                    nearest_industries:
                      v === 'Yes' ? f.nearest_industries || [] : [],
                  }))
              )}

              {knowNearestIndustryYes && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>Nearest Industries</Text>

                  {industryRows.length === 0 && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#666',
                        marginBottom: 4,
                      }}
                    >
                      Please add details of nearby industries.
                    </Text>
                  )}

                  {industryRows.map((row, idx) => (
                    <View
                      key={`industry-${idx}`}
                      style={[
                        styles.loanEntryContainer,
                        { marginVertical: 6 },
                      ]}
                    >
                      <Text style={styles.label}>
                        Industry {idx + 1}
                      </Text>

                      <TextInput
                        placeholder="Industry name"
                        style={[styles.input, { marginTop: 4 }]}
                        value={row.industry_name || ''}
                        onChangeText={(text) =>
                          updateIndustryRow(
                            idx,
                            'industry_name',
                            text
                          )
                        }
                      />

                      <TextInput
                        placeholder="Work Type"
                        style={[styles.input, { marginTop: 4 }]}
                        value={row.work_type || ''}
                        onChangeText={(text) =>
                          updateIndustryRow(
                            idx,
                            'work_type',
                            text
                          )
                        }
                      />

                      <TouchableOpacity
                        style={[
                          styles.deleteBtn,
                          { marginTop: 8, paddingVertical: 4 },
                        ]}
                        onPress={() => removeIndustryRow(idx)}
                      >
                        <Text
                          style={{
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        >
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={addIndustryRow}
                  >
                    <Text
                      style={{
                        color: '#EE6969',
                        fontWeight: 'bold',
                      }}
                    >
                      ➕ Add Industry
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
            style={[styles.input, styles.dropdown]}
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
            style={[styles.input, styles.dropdown]}
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

// continuation of renderField function and following components and styles...

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
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
              placeholder="Specify Your Expansion Plan"
              style={[styles.input, { marginTop: 6 }]}
              value={existingForm.expansion_plan_other || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({ ...f, expansion_plan_other: text }))
              }
            />
          )}
        </View>
      );
    }

    // NEW: Government Schemes info dropdown in Support section
    if (k === 'govt_scheme_info') {
      const val = existingForm.govt_scheme_info || '';
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>
            Do you want to know Information about Government Schemes?
          </Text>
          <Picker
            selectedValue={val}
            onValueChange={(v) =>
              setExistingForm((f) => ({
                ...f,
                govt_scheme_info: v,
                govt_scheme_info_other: v === 'Others' ? f.govt_scheme_info_other : '',
              }))
            }
            style={[styles.input, styles.dropdown]}
          >
            <Picker.Item label="Select..." value="" />
            {govtSchemeOptions.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>

          {val === 'Others' && (
            <TextInput
              placeholder="Specify"
              style={[styles.input, { marginTop: 6 }]}
              value={existingForm.govt_scheme_info_other || ''}
              onChangeText={(text) =>
                setExistingForm((f) => ({ ...f, govt_scheme_info_other: text }))
              }
              multiline
            />
          )}
        </View>
      );
    }

    // Generic text inputs and textareas
    if (multilineFields.includes(k))
      return (
        <View key={k} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>{k.replace(/_/g, ' ').toUpperCase()}</Text>
          <TextInput
            value={existingForm[k] || ''}
            onChangeText={(text) =>
              setExistingForm((f) => ({ ...f, [k]: text }))
            }
            placeholder={k.replace(/_/g, ' ').toUpperCase()}
            style={[styles.input, { minHeight: 80 }]}
            multiline
            textAlignVertical="top"
          />
        </View>
      );

    // Default: simple text input
    return (
      <View key={k} style={{ marginBottom: 8 }}>
        <Text style={styles.label}>{k.replace(/_/g, ' ').toUpperCase()}</Text>
        <TextInput
          value={existingForm[k] || ''}
          onChangeText={(text) =>
            setExistingForm((f) => ({ ...f, [k]: text }))
          }
          placeholder={k.replace(/_/g, ' ').toUpperCase()}
          style={styles.input}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {formSections.map((section) => (
        <View key={section.key} style={{ marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => toggleSection(section.key)}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionToggle}>
              {openSections[section.key] ? '▼' : '►'}
            </Text>
          </TouchableOpacity>
          {openSections[section.key] &&
            section.fields.map((fieldKey) => renderField(fieldKey))}
        </View>
      ))}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => Alert.alert('Submit pressed')}
      >
        <Text style={styles.submitBtnText}>Submit Form</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#fff' },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  dropdown: {
    height: 44,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 22,
    minWidth: 80,
    alignItems: 'center',
  },
  smallBtnText: {
    color: '#333',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  sectionToggle: {
    fontWeight: '700',
    fontSize: 18,
  },
  loanEntryContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  deleteBtn: {
    backgroundColor: '#EE6969',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  addBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  submitBtn: {
    backgroundColor: '#EE6969',
    paddingVertical: 14,
    marginVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#0009',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '75%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  cancelBtn: {
    marginTop: 12,
    alignSelf: 'center',
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 6,
  },
  thumbRemove: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#EB5757',
    width: 18,
    height: 18,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
