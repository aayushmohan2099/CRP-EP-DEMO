// src/screens/epsakhi/NewEnterpriseForm.jsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Modal,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import gsApi from '../../api/gsApi';
import {
  getShgListForPanchayat,
  getCrpPanchayats,
  getCrpDetail,
} from '../../utils/tempStore';
import { getUser } from '../../utils/auth';

/**
 * NewEnterpriseForm.jsx
 *
 * New flow:
 *  1) Ensure / create RecordedBeneficiary from SHG member.
 *  2) Create NewEnterprise (/api/v1/new-enterprise/).
 *  3) Update recorded_beneficiaries.enterprise_id.
 *  4) Create sub-forms:
 *     - /enterprise-types/ (enterprise type + categories)
 *     - /enterprise-training-reqs/ (form_type = "rec" for received, "req" for required)
 *     - /enterprise-media/ (form_type = "newep" for certificates + applicant signature)
 *
 * All child calls include created_by where possible.
 */

// ---------- Constants & helpers ----------

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

// normalize SHG location info
function extractLocationFromShg(shg) {
  if (!shg) return null;
  const district_id = shg.districtId ?? shg.district_id ?? null;
  const block_id = shg.blockId ?? shg.block_id ?? null;
  const panchayat_id = shg.panchayatId ?? shg.panchayat_id ?? null;
  const village_id = shg.villageId ?? shg.village_id ?? null;
  const lokos_shg_code = shg.code ?? shg.shg_code ?? shg.lokos_shg_code ?? null;
  return { district_id, block_id, panchayat_id, village_id, lokos_shg_code };
}

// Android camera permission helper
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
        message: 'We need access to your camera.',
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

// NOTE: these header values duplicate those in your gsApi file.
const MULTIPART_X_API_ID = 'TH_EPS.BDOuser_test.co.in';
const MULTIPART_X_API_KEY = 'wFR8IpSeNMawCF4RPLXit1POGuQAJTSmRexBBOwO';
const BASE_URL = 'http://66.116.207.88:8088';

// ---------- Enterprise Category (Parent / Child) ----------

const ENTERPRISE_TYPE_CATEGORIES = [
  {
    parent: 'Food Processing Sector',
    children: [
      'Spice manufacturing',
      'Pickles, preserves (murabba), papad',
      'Savoury snacks, bhujiya, namkeen',
      'Instant mixes (idli mix, gram flour mix, kheer mix)',
      'Bakery items (cookies, cake, bread)',
      'Millet-based products (jowar, bajra cookies, snacks)',
      'Cold-pressed oils (mustard/sesame)',
      'Honey processing',
      'Jam–jelly–squash',
      'Ready-to-eat products',
      'Whole grain/pulses/flour sorting–grading–packaging unit​',
      'Others',
    ],
  },
  {
    parent: 'Handicraft & Artisan Sector',
    children: [
      'Zari and zardozi work',
      'Chikankari embroidery',
      'Woodwork',
      'Terracotta / clay products',
      'Bamboo / cane craft',
      'Handmade jewellery (terracotta jewellery, oxidised jewellery)',
      'Handmade candles',
      'Crochet / woollen products',
      'Paper craft, greeting cards',
      'Handbags, jute bags, embroidered bags',
      'Ration/vegetable/shopping bags (non-woven alternatives)​',
      'Others',
    ],
  },
  {
    parent: 'Textile & Apparel Sector',
    children: [
      'Boutique unit (stitching–cutting–embellishment)',
      'School uniform stitching unit',
      'Ladies’ garments',
      'Bedsheet/quilt/pillow cover unit',
      'ODOP textile-based products (Varanasi saree, Bhadohi carpet finishing etc.)',
      'Home linen (curtains, table cloth, sofa covers)',
      'Jute/cotton carry bags',
      'Mask/apron/hospital gown manufacturing​',
      'Others',
    ],
  },
  {
    parent: 'Agriculture & Allied Sector',
    children: [
      'Vegetable cultivation and group supply',
      'Flower cultivation (marigold, rose)',
      'Mushroom production',
      'Nursery (fruit/flower/vegetable saplings)',
      'Beekeeping (honey production)',
      'Organic manure/vermi-compost',
      'Animal feed unit',
      'Mini mill (flour/pulse grinding)',
      'Fruit–vegetable dehydration unit',
      'Fish farming',
      'Others',
    ],
  },
  {
    parent: 'Dairy & Animal Husbandry Sector',
    children: [
      'Dairy unit (2–10 cows/buffaloes)',
      'Milk collection centre',
      'Paneer/khoya/curd/ghee manufacturing',
      'Goat rearing',
      'Poultry unit (egg/broiler)',
      'Pig rearing (in specific areas)',
      'Fodder production',
      'Milk packaging and branding unit​',
      'Others',
    ],
  },
  {
    parent: 'Beauty, Wellness & Personal Services',
    children: [
      'Beauty parlour',
      'Mehndi (henna) training and services',
      'Spa / therapy unit',
      'Home-care services (home nursing, baby care training)',
      'Mobile salon / village-based services',
      'Fitness group / yoga classes​',
      'Others',
    ],
  },
  {
    parent: 'Retail & Micro Trading Sector',
    children: [
      'Grocery/provision store',
      'Stationery / general store',
      'Group sale of vegetables/fruits',
      'Fast food cart',
      'Mobile recharge / bill payment kiosk',
      'Jan Aushadhi (generic medicine) centre (as per eligibility)',
      'PET bottles and disposable alternatives distribution​',
      'Others',
    ],
  },
  {
    parent: 'Cleaning & Hygiene Products Sector',
    children: [
      'Phenyl/detergent manufacturing',
      'Liquid handwash',
      'Sanitizer',
      'Incense sticks and dhoop sticks',
      'Napkin / sanitary pad unit',
      'Biodegradable plate and bowl manufacturing​',
      'Others',
    ],
  },
  {
    parent: 'Packaging & Utility Products Sector',
    children: [
      'Paper bag unit',
      'Jute bag unit',
      'Box manufacturing',
      'Recycled paper packaging unit',
      'Food-grade packaging​',
      'Others',
    ],
  },
  {
    parent: 'Digital & Service Sector',
    children: [
      'Data entry / digital services',
      'CSC (Common Service Center) operations',
      'Online product sales (e-commerce)',
      'SHG product branding',
      'Social media management for local shops​',
      'Others',
    ],
  },
  {
    parent: 'Solid Waste & Green Sector',
    children: [
      'Plastic waste sorting',
      'Fuel/briquettes from waste',
      'Composting unit',
      'Recycled paper products',
      'E-waste collection micro centre​',
      'Others',
    ],
  },
  {
    parent: 'Construction & Fabrication Micro Enterprises',
    children: [
      'Brick and tiles cleaning/polishing unit',
      'Interior decoration (fabric, flowers, décor)',
      'Painting/plumbing/carpentry group',
      'POP artwork / wall decoration',
      'Others',
    ],
  },
];

const ENTERPRISE_TYPE_OTHER_PARENT_KEY = 'Other parent category​';

// ---------- Training Sectors (Parent / Child) ----------

const TRAINING_SECTORS = [
  {
    parent: 'Agriculture and Allied Activities',
    children: [
      'Organic Farming',
      'Dairy Farming',
      'Poultry Farming',
      'Mushroom Cultivation',
      'Beekeeping and Honey Production',
      'Goat Rearing',
      'Vermicomposting',
      'Fish Farming',
      'Floriculture (Flower Cultivation)',
      'Medicinal Plant Cultivation',
      'Others',
    ],
  },
  {
    parent: 'Food Processing and Snacks Business',
    children: [
      'Pickle and Papad Making',
      'Bakery and Cake Production',
      'Spice Powder Making',
      'Flour Mill',
      'Dairy Product Manufacturing (Paneer, Ghee)',
      'Ready-to-Eat Food Preparation',
      'Herbal Tea Manufacturing',
      'Jam and Jelly Production',
      'Frozen Food Business',
      'Edible Oil Extraction',
      'Others',
    ],
  },
  {
    parent: 'Handicrafts and Traditional Skills',
    children: [
      'Banarasi Saree Weaving',
      'Chikankari Embroidery',
      'Wooden Handicrafts',
      'Terracotta Pottery',
      'Jute Bag Manufacturing',
      'Handmade Jewelry',
      'Toy Manufacturing',
      'Paper Mache Art',
      'Bamboo Craft',
      'Leather Product Manufacturing',
      'Others',
    ],
  },
  {
    parent: 'Service-Based Businesses',
    children: [
      'Catering Service',
      'Tailoring and Garment Making',
      'Event Decoration',
      'Beautician and Salon',
      'Coaching Classes',
      'Mobile Repairing',
      'Home Cleaning Services',
      'Photography Studio',
      'Cyber Café',
      'Wedding Planning',
      'Others',
    ],
  },
  {
    parent: 'Waste Management and Eco-Friendly Ventures',
    children: [
      'Paper Bag Manufacturing',
      'Cloth Bag Manufacturing',
      'Plastic Recycling',
      'E-waste Recycling',
      'Compost Manufacturing',
      'Others',
    ],
  },
  {
    parent: 'Government Assisted Enterprises',
    children: [
      'Solar Lamp Assembly',
      'Rural Tourism and Homestay',
      'Organic Fertilizer Production',
      'Ayurvedic Medicine Manufacturing',
      'Handloom Weaving Cooperative Society',
      'Others',
    ],
  },
  {
    parent: 'Home and Personal Care Products',
    children: [
      'Candle Manufacturing',
      'Incense Stick Making',
      'Soap and Detergent Manufacturing',
      'Bindi and Nail Polish Manufacturing',
      'Herbal Shampoo and Cosmetic Products',
      'Others',
    ],
  },
  {
    parent: 'Low-Scale Production',
    children: [
      'Paper Plate and Cup Manufacturing',
      'LED Bulb Assembly',
      'Stationery Production',
      'Environment-Friendly Disposable Cutlery',
      'Chalk and Whiteboard Marker Manufacturing',
      'Others',
    ],
  },
  {
    parent: 'Textile and Apparel Business',
    children: [
      'Wool Weaving and Sweater Production',
      'Bedsheet and Curtain Stitching',
      'T-shirt Printing',
      'School Uniform Manufacturing',
      'Handloom Carpet Weaving',
      'Others',
    ],
  },
  {
    parent: 'Animal Husbandry and Agri-Based Enterprises',
    children: [
      'Pig Rearing',
      'Emu Farming',
      'Duck Rearing',
      'Organic Fruit and Vegetable Farming',
      'Poultry Egg Incubation',
      'Others',
    ],
  },
  {
    parent: 'E-commerce and Online Business',
    children: [
      'Online Handicraft Selling',
      'Home-Based Bakery on Food Delivery Platforms',
      'Dropshipping Business',
      'Print-on-Demand T-shirts',
      'YouTube Channel (DIY or Tutorials)',
      'Others',
    ],
  },
  {
    parent: 'Renewable Energy and Environment-Friendly Enterprises',
    children: [
      'Solar Panel Installation Services',
      'Bio-Gas Plant Setup',
      'Electric Vehicle Charging Station',
      'Waste Paper Recycling',
      'Bamboo Toothbrush and Cutlery Manufacturing',
      'Others',
    ],
  },
  {
    parent: 'Tourism and Local Experience Businesses',
    children: [
      'Homestays for Tourists',
      'Heritage Walk Guide Services',
      'Rural Adventure Camps',
      'Boat Tours on Ganges',
      'Organic Farm Tour Business',
      'Others',
    ],
  },
  {
    parent: 'Transport and Logistics Business',
    children: [
      'E-rickshaw Rental Service',
      'Pack and Move Services',
      'Small Courier Delivery Service',
      'Bike Rental Business',
      'Agricultural Equipment Rental Service',
      'Others',
    ],
  },
  {
    parent: 'Miscellaneous and Innovative Businesses',
    children: [
      'Toy Library for Children',
      'DIY Craft Kit Shop and Classes',
      'Community Kitchen',
      'Custom Gift Box Manufacturing',
      'Pet Grooming Services',
      'Digital Marketing for Local Businesses',
      'Document and Resume Writing Services',
      'Resale of Used Goods',
      'Organic Soap Manufacturing Kit Shop',
      'Wedding Invitation Card Designing',
      'Others',
    ],
  },
];

const TRAINING_OTHER_PARENT_KEY = 'Others (Custom Sector Group)';

// representation of multi-select value:
// {
//   [parentName]: {
//      selected: boolean,
//      children: { [childName]: boolean },
//      otherText?: string
//   },
//   [SPECIAL_OTHER_PARENT_KEY]: { selected, otherText }
// }

// encode to requested text: parentCSV, dictString "[Parent: child1, child2], [Parent2: childX]"
const encodeParentChildSelection = (selection) => {
  const parentNames = [];
  const dictParts = [];

  Object.entries(selection || {}).forEach(([parent, obj]) => {
    if (!obj || !obj.selected) return;

    parentNames.push(parent);

    const childNames = [];
    Object.entries(obj.children || {}).forEach(([child, checked]) => {
      if (!checked) return;
      if (child === 'Others') {
        if (obj.otherText && obj.otherText.trim()) {
          childNames.push(obj.otherText.trim());
        }
      } else {
        childNames.push(child);
      }
    });

    if (parent === ENTERPRISE_TYPE_OTHER_PARENT_KEY || parent === TRAINING_OTHER_PARENT_KEY) {
      if (obj.otherText && obj.otherText.trim()) {
        childNames.push(obj.otherText.trim());
      }
    }

    const inner = childNames.length ? childNames.join(', ') : '';
    dictParts.push(`[${parent}: ${inner}]`);
  });

  const parentCSV = parentNames.join(', ');
  const dictString = dictParts.join(', ');
  return { parentCSV, dictString };
};

// small Yes/No control
const YesNoToggle = ({ value, onChange }) => (
  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
    <TouchableOpacity
      style={[styles.smallBtn, value === 'Yes' && { backgroundColor: '#EE6969' }]}
      onPress={() => onChange('Yes')}
    >
      <Text style={{ color: value === 'Yes' ? '#fff' : '#333', fontWeight: '600' }}>Yes</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.smallBtn, value === 'No' && { backgroundColor: '#EE6969' }]}
      onPress={() => onChange('No')}
    >
      <Text style={{ color: value === 'No' ? '#fff' : '#333', fontWeight: '600' }}>No</Text>
    </TouchableOpacity>
  </View>
);

// Generic Parent / Child multi-select block
const ParentChildMultiSelect = ({
  title,
  description,
  items,
  value,
  onChange,
  otherParentKey,
}) => {
  // ensure structure is safe
  const ensureParentObj = (parent) => {
    return value && value[parent]
      ? value[parent]
      : { selected: false, children: {}, otherText: '' };
  };

  const toggleParent = (parent) => {
    const current = ensureParentObj(parent);
    const updated = {
      ...current,
      selected: !current.selected,
    };
    onChange({
      ...(value || {}),
      [parent]: updated,
    });
  };

  const toggleChild = (parent, child) => {
    const current = ensureParentObj(parent);
    const children = { ...(current.children || {}) };
    children[child] = !children[child];
    const updated = { ...current, children };
    onChange({
      ...(value || {}),
      [parent]: updated,
    });
  };

  const setOtherText = (parent, text) => {
    const current = ensureParentObj(parent);
    const updated = { ...current, otherText: text };
    onChange({
      ...(value || {}),
      [parent]: updated,
    });
  };

  const list = [...items];
  if (otherParentKey) {
    list.push({ parent: otherParentKey, children: ['Others'] });
  }

  return (
    <View style={{ marginTop: 10 }}>
      {title ? <Text style={styles.label}>{title}</Text> : null}
      {description ? (
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
          {description}
        </Text>
      ) : null}

      {list.map(({ parent, children }) => {
        const po = ensureParentObj(parent);
        const showChildren = po.selected;

        return (
          <View key={parent} style={{ marginBottom: 8 }}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => toggleParent(parent)}
            >
              <View
                style={[
                  styles.checkbox,
                  po.selected && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>{parent}</Text>
            </TouchableOpacity>

            {showChildren && Array.isArray(children) && (
              <View style={{ paddingLeft: 26 }}>
                {children.map((child) => (
                  <View key={child} style={{ marginBottom: 4 }}>
                    {child === 'Others' ? (
                      <>
                        <TextInput
                          style={[styles.input, { marginTop: 4 }]}
                          placeholder="Others (please specify)"
                          value={po.otherText}
                          onChangeText={(t) => setOtherText(parent, t)}
                        />
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => toggleChild(parent, child)}
                      >
                        <View
                          style={[
                            styles.checkboxSmall,
                            po.children && po.children[child] && styles.checkboxChecked,
                          ]}
                        />
                        <Text style={styles.checkboxLabel}>{child}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

// ---------- Main component ----------

export default function NewEnterpriseForm({ route, navigation }) {
  const recordedBenef = route?.params?.recordedBenef || null;
  const beneficiary = route?.params?.beneficiary || null;
  const tempShg = route?.params?.tempShg || null;
  const routeCrpUserId =
    route?.params?.crpUserId ||
    route?.params?.user_id ||
    route?.params?.username ||
    null;

  const lokosShgCode =
    route?.params?.lokos_shg_code ||
    route?.params?.lokosShgCode ||
    tempShg?.code ||
    tempShg?.shg_code ||
    null;

  // ----------------- Form State -----------------

  const [form, setForm] = useState({
    // 1) Special category
    applicant_special_category: '',

    // 3) Preferred location (UI-level pieces)
    prefered_location_choice: '',
    prefered_location_extra: '',

    // 4) CIF
    has_shg_cif: '',
    cif_fund_amt: '',

    // 5) Training received?
    is_training_received: '',

    // 6) Training required?
    is_training_required: '',

    // When training required = "No"
    nearest_skill_centre_known: '',
    nearest_skill_centre_name: '',
    skill_centre_loc: '',
    nearest_industry_known: '',
    nearest_industry_name: '',
    industry_loc: '',

    // Support Required
    mentorship_support: '',
    financial_support_type: '',
    financial_support_other_text: '',
    loan_amount_range: '',
    market_linkage_type: '',
    market_linkage_detail: '',
    is_promo_ad_req_type: '',
    is_promo_ad_req_detail: '',
    infrastructure_support_type: '',
    infrastructure_support_detail: '',
    digital_emarket_support: '',
    other_support: '',

    // Declarations
    declaration_confirmed: false,
    declaration_date: '',
  });

  // Enterprise type (parent/child)
  const [enterpriseTypeSelection, setEnterpriseTypeSelection] = useState({});

  // Training received rows (form_type = "rec")
  const [trainingReceivedRows, setTrainingReceivedRows] = useState([]);

  // Training required (single set, form_type = "req")
  const [trainingReqDept, setTrainingReqDept] = useState('');
  const [trainingReqSectors, setTrainingReqSectors] = useState({});
  const [trainingReqDuration, setTrainingReqDuration] = useState('');
  const [trainingReqLocationState, setTrainingReqLocationState] = useState('');
  const [trainingReqLocationDistrict, setTrainingReqLocationDistrict] = useState('');
  const [trainingReqLocationBlock, setTrainingReqLocationBlock] = useState('');
  const [trainingReqExpectedIncome, setTrainingReqExpectedIncome] = useState('');

  // Files
  const [signatureAsset, setSignatureAsset] = useState(null); // applicant signature
  const [trainingCertificateAssets, setTrainingCertificateAssets] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  // Declaration date modal
  const [declarationDateModalVisible, setDeclarationDateModalVisible] = useState(false);
  const [declDay, setDeclDay] = useState(null);
  const [declMonth, setDeclMonth] = useState(null);
  const [declYear, setDeclYear] = useState(null);
  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  const yearOptions = [];
  for (let y = currentYear; y >= startYear; y--) yearOptions.push(String(y));

  // load logged user, sync token to gsApi
  useEffect(() => {
    (async () => {
      try {
        const u = await getUser();
        if (u) {
          setLoggedUser(u);
          if (u.access) gsApi.setAuthToken?.(u.access, u.refresh);
        }
      } catch (e) {
        console.warn('Unable to load user', e);
      }
    })();
  }, []);

  // sync declaration_date into pickers if prefilled
  useEffect(() => {
    const d = form.declaration_date;
    if (!d) {
      setDeclDay(null);
      setDeclMonth(null);
      setDeclYear(null);
      return;
    }
    try {
      const isoPart = typeof d === 'string' ? d.split('T')[0] : '';
      const parts = isoPart.split('-');
      if (parts.length === 3) {
        setDeclYear(parts[0]);
        setDeclMonth(String(parseInt(parts[1], 10)));
        setDeclDay(String(parseInt(parts[2], 10)));
        return;
      }
      const dt = new Date(d);
      if (!Number.isNaN(dt.getTime())) {
        setDeclYear(String(dt.getFullYear()));
        setDeclMonth(String(dt.getMonth() + 1));
        setDeclDay(String(dt.getDate()));
      }
    } catch (e) {
      console.warn('Failed to parse declaration_date', e);
    }
  }, [form.declaration_date]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const getCreatedByNumeric = () => {
    const candidate =
      loggedUser?.id ??
      loggedUser?.user_id ??
      loggedUser?.pk ??
      routeCrpUserId;
    if (candidate == null) return null;
    if (typeof candidate === 'number') return candidate;
    if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
      return parseInt(candidate.trim(), 10);
    }
    return null;
  };

  // ---------- Signature & certificates pickers ----------

  const pickSignatureFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('launchImageLibrary error', result.errorMessage || result.errorCode);
        Alert.alert('Error', 'Failed to pick image.');
        return;
      }
      const asset = result.assets && result.assets[0];
      if (asset) {
        setSignatureAsset(asset);
      }
    } catch (e) {
      console.error('pickSignatureFromGallery', e);
      Alert.alert('Error', 'Unable to pick signature.');
    }
  };

  const takeSignaturePhoto = async () => {
    try {
      const ok = await requestCameraPermissionIfNeeded();
      if (!ok) {
        Alert.alert('Permission required', 'Camera permission is required to capture signature.');
        return;
      }
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('launchCamera error', result.errorMessage || result.errorCode);
        Alert.alert('Error', 'Failed to capture image.');
        return;
      }
      const asset = result.assets && result.assets[0];
      if (asset) {
        setSignatureAsset(asset);
      }
    } catch (e) {
      console.error('takeSignaturePhoto', e);
      Alert.alert('Error', 'Unable to capture signature.');
    }
  };

  const pickTrainingCertificates = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        quality: 0.8,
        selectionLimit: 0, // multi
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('launchImageLibrary cert error', result.errorMessage || result.errorCode);
        Alert.alert('Error', 'Failed to pick files.');
        return;
      }
      const assets = result.assets || [];
      if (assets.length) {
        setTrainingCertificateAssets((prev) => [...prev, ...assets]);
      }
    } catch (e) {
      console.error('pickTrainingCertificates', e);
      Alert.alert('Error', 'Unable to pick certificates.');
    }
  };

  // ---------- SHG helper for recorded beneficiary ----------

  const findShgAcrossCachedPanchayats = async (shgCode) => {
    if (!shgCode) return null;
    try {
      if (tempShg && (tempShg.code === shgCode || tempShg.shg_code === shgCode)) {
        return extractLocationFromShg(tempShg);
      }
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
      return null;
    } catch (e) {
      console.warn('findShgAcrossCachedPanchayats error', e);
      return null;
    }
  };

  // Ensure Recorded Beneficiary exists (same core logic as older file, adapted to new models)
  const ensureRecordedBeneficiary = async () => {
    let recordedBenefId =
      recordedBenef?.TH_urid ||
      recordedBenef?.TH_URID ||
      recordedBenef?.id ||
      null;

    if (recordedBenefId) return recordedBenefId;

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

    let district_id = addr?.district_id ?? addr?.districtId ?? null;
    let block_id = addr?.block_id ?? addr?.blockId ?? null;
    let panchayat_id = addr?.panchayat_id ?? addr?.panchayatId ?? null;
    let village_id = addr?.village_id ?? addr?.villageId ?? null;
    let member_mobile = phone?.phone_no ?? phone?.mobile ?? phone?.number ?? null;
    let marital_status = beneficiary.marital_status ?? beneficiary.maritalStatus ?? '';
    let father_husband_name =
      beneficiary.father_husband ??
      beneficiary.father_husband_name ??
      beneficiary.relation_name ??
      '';

    let lokos_shg = lokosShgCode || beneficiary.shg_code || beneficiary.lokos_shg_code || null;

    // tempShg fallback
    if ((!district_id || !block_id || !panchayat_id || !village_id || !lokos_shg) && tempShg) {
      const loc = extractLocationFromShg(tempShg);
      if (loc) {
        district_id = district_id || loc.district_id;
        block_id = block_id || loc.block_id;
        panchayat_id = panchayat_id || loc.panchayat_id;
        village_id = village_id || loc.village_id;
        lokos_shg = lokos_shg || loc.lokos_shg_code;
      }
    }

    // cached SHG lists fallback
    if ((!district_id || !block_id || !panchayat_id || !village_id || !lokos_shg) && lokos_shg) {
      const fallback = await findShgAcrossCachedPanchayats(lokos_shg);
      if (fallback) {
        district_id = district_id || fallback.district_id;
        block_id = block_id || fallback.block_id;
        panchayat_id = panchayat_id || fallback.panchayat_id;
        village_id = village_id || fallback.village_id;
        lokos_shg = lokos_shg || fallback.lokos_shg_code;
      }
    }

    // last resort: on-demand fetch from CRP block
    if ((!district_id || !block_id || !panchayat_id || !village_id) && lokos_shg) {
      try {
        const crpDetail = getCrpDetail ? getCrpDetail() : null;
        const cbid = crpDetail?.block_id ?? crpDetail?.blockId ?? null;
        if (cbid) {
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
            return String(code) === String(lokos_shg);
          });
          if (found) {
            const loc = extractLocationFromShg(found);
            district_id = district_id || loc.district_id || null;
            block_id = block_id || loc.block_id || null;
            panchayat_id = panchayat_id || loc.panchayat_id || null;
            village_id = village_id || loc.village_id || null;
            lokos_shg = lokos_shg || loc.lokos_shg_code || null;
          }
        }
      } catch (e) {
        console.warn('on-demand SHG list fallback failed', e);
      }
    }

    const createdBy = getCreatedByNumeric();

    const recordedPayload = {
      lokos_member_code: beneficiary.member_code || beneficiary.nic_member_code || null,
      applicant_name: beneficiary.member_name || '',
      age,
      gender: beneficiary.gender || '',
      marital_status,
      father_husband_name,
      category: beneficiary.social_category || beneficiary.socialCategory || '',
      education: beneficiary.education || '',
      address: addressText,
      district_id: district_id || null,
      block_id: block_id || null,
      panchayat_id: panchayat_id || null,
      village_id: village_id || null,
      mobile: member_mobile || null,
      email: beneficiary.email || null,
      lokos_shg_code: lokos_shg || null,
    };

    if (createdBy !== null) {
      recordedPayload.created_by = createdBy;
    }

    const recRes = await gsApi.createRecordedBeneficiary(recordedPayload);
    recordedBenefId =
      recRes?.TH_urid || recRes?.TH_URID || recRes?.id || null;

    if (!recordedBenefId) {
      throw new Error('Recorded beneficiary created but ID missing in response.');
    }

    return recordedBenefId;
  };

  // ---------- NewEnterprise creation (multipart for signature) ----------

  const performMultipartCreateNewEnterprise = async (payloadObj, signature) => {
    const token = gsApi.getAuthToken ? gsApi.getAuthToken() : null;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    headers['X-API-ID'] = MULTIPART_X_API_ID;
    headers['X-API-KEY'] = MULTIPART_X_API_KEY;

    const url = `${BASE_URL}/api/v1/new-enterprise/`;
    const formData = new FormData();

    Object.keys(payloadObj).forEach((k) => {
      const v = payloadObj[k];
      formData.append(k, v === null || v === undefined ? '' : String(v));
    });

    if (signature && signature.uri) {
      formData.append('applicant_signature', {
        uri: signature.uri,
        name: signature.fileName || `signature_${Date.now()}.jpg`,
        type: signature.type || 'image/jpeg',
      });
    }

    const res = await fetch(url, { method: 'POST', headers, body: formData });
    const text = await res.text();
    try {
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw { status: res.status, data };
      return data;
    } catch (e) {
      if (!res.ok) throw { status: res.status, data: text || null };
      return text;
    }
  };

  // ---------- Sub-form API helpers (direct fetch) ----------

  const authHeadersJson = () => {
    const token = gsApi.getAuthToken ? gsApi.getAuthToken() : null;
    const h = {
      'Content-Type': 'application/json',
      'X-API-ID': MULTIPART_X_API_ID,
      'X-API-KEY': MULTIPART_X_API_KEY,
    };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const createEnterpriseTypeRecord = async (enterpriseId) => {
    const { parentCSV, dictString } = encodeParentChildSelection(
      enterpriseTypeSelection
    );
    if (!enterpriseId || !parentCSV) return;

    const payload = {
      enterprise_id: enterpriseId,
      form_type: 'new',
      parent_category: parentCSV,
      sub_category: dictString,
    };

    const createdBy = getCreatedByNumeric();
    if (createdBy !== null) payload.created_by = createdBy;

    const res = await fetch(`${BASE_URL}/api/v1/enterprise-types/`, {
      method: 'POST',
      headers: authHeadersJson(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('enterprise-types create failed', res.status, text);
    }
  };

  const createTrainingReceivedRows = async (enterpriseId) => {
    if (!enterpriseId) return;
    const createdBy = getCreatedByNumeric();

    for (const row of trainingReceivedRows) {
      if (!row.department) continue;

      const { parentCSV, dictString } = encodeParentChildSelection(row.sectors);
      const payload = {
        enterprise_id: enterpriseId,
        form_type: 'rec',
        department: row.department,
        sector: parentCSV || null,
        training_module_name: dictString || null,
        duration: null,
        location: null,
        expected_income: null,
      };
      if (createdBy !== null) payload.created_by = createdBy;

      const res = await fetch(`${BASE_URL}/api/v1/enterprise-training-reqs/`, {
        method: 'POST',
        headers: authHeadersJson(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn('training-rec create failed', res.status, text);
      }
    }
  };

  const createTrainingRequired = async (enterpriseId) => {
    if (!enterpriseId) return;
    if (form.is_training_required !== 'Yes') return;

    if (!trainingReqDept && !Object.keys(trainingReqSectors || {}).length) {
      // nothing meaningful
      return;
    }

    const { parentCSV, dictString } = encodeParentChildSelection(
      trainingReqSectors
    );

    const location = [
      trainingReqLocationState || '',
      trainingReqLocationDistrict || '',
      trainingReqLocationBlock || '',
    ]
      .filter(Boolean)
      .join(', ');

    const payload = {
      enterprise_id: enterpriseId,
      form_type: 'req',
      department: trainingReqDept || null,
      sector: parentCSV || null,
      training_module_name: dictString || null,
      duration: trainingReqDuration || null,
      location: location || null,
      expected_income: trainingReqExpectedIncome || null,
    };

    const createdBy = getCreatedByNumeric();
    if (createdBy !== null) payload.created_by = createdBy;

    const res = await fetch(`${BASE_URL}/api/v1/enterprise-training-reqs/`, {
      method: 'POST',
      headers: authHeadersJson(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('training-req create failed', res.status, text);
    }
  };

  const uploadMediaFile = async (enterpriseId, fileAsset, fieldName, formType = 'newep') => {
    if (!enterpriseId || !fileAsset || !fileAsset.uri) return;

    const token = gsApi.getAuthToken ? gsApi.getAuthToken() : null;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    headers['X-API-ID'] = MULTIPART_X_API_ID;
    headers['X-API-KEY'] = MULTIPART_X_API_KEY;

    const formData = new FormData();
    formData.append('enterprise_id', enterpriseId);
    formData.append('form_type', formType);

    const createdBy = getCreatedByNumeric();
    if (createdBy !== null) formData.append('created_by', String(createdBy));

    formData.append(fieldName, {
      uri: fileAsset.uri,
      name: fileAsset.fileName || `${fieldName}_${Date.now()}`,
      type: fileAsset.type || 'application/octet-stream',
    });

    const res = await fetch(`${BASE_URL}/api/v1/enterprise-media/`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('enterprise-media upload failed', res.status, text);
    }
  };

  const uploadTrainingCertificatesMedia = async (enterpriseId) => {
    for (const asset of trainingCertificateAssets) {
      await uploadMediaFile(enterpriseId, asset, 'certificates', 'newep');
    }
  };

  const uploadSignatureMedia = async (enterpriseId) => {
    if (!signatureAsset || !signatureAsset.uri) return;
    // store signature also in enterprise-media. Field "others" as per spec.
    await uploadMediaFile(enterpriseId, signatureAsset, 'others', 'newep');
  };

  // ---------- UI helpers ----------

  const openDeclarationModal = () => {
    const existing = form.declaration_date;
    let initYear = null;
    let initMonth = null;
    let initDay = null;

    if (existing && typeof existing === 'string') {
      try {
        const isoPart = existing.split('T')[0];
        const parts = isoPart.split('-');
        if (parts.length === 3) {
          initYear = parts[0];
          initMonth = String(parseInt(parts[1], 10));
          initDay = String(parseInt(parts[2], 10));
        }
      } catch (e) {}
    }

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
  };

  const buildPreferedLocationValue = () => {
    const choice = form.prefered_location_choice;
    const extra = (form.prefered_location_extra || '').trim();
    if (!choice) return '';
    if (
      choice.startsWith('Desired') &&
      extra
    ) {
      return `${choice}, ${extra}`;
    }
    return choice;
  };

  const formatFinancialSupport = () => {
    const t = form.financial_support_type;
    const extra = (form.financial_support_other_text || '').trim();

    if (!t) return '';
    if (t === 'Cash') {
      return extra ? `Cash (${extra})` : 'Cash';
    }
    if (t === 'Loan') {
      if (form.loan_amount_range) {
        return `Loan (${form.loan_amount_range})`;
      }
      return 'Loan';
    }
    if (t === 'Others') {
      return extra ? `Others (${extra})` : 'Others';
    }
    return t;
  };

  // Training received rows controls
  const addTrainingReceivedRow = () => {
    setTrainingReceivedRows((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        open: true,
        department: '',
        sectors: {},
      },
    ]);
  };

  const removeTrainingReceivedRow = (id) => {
    setTrainingReceivedRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateTrainingRow = (id, patch) => {
    setTrainingReceivedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  const benefName =
    beneficiary?.member_name ||
    beneficiary?.name ||
    recordedBenef?.applicant_name ||
    '';

  // ---------- Submit ----------

  const handleSubmit = async () => {
    if (!beneficiary && !recordedBenef) {
      Alert.alert(
        'Error',
        'Beneficiary data missing. Please go back and start recording again.'
      );
      return;
    }

    if (!form.is_training_received) {
      Alert.alert('Validation', 'Please answer "Have you received any training?"');
      return;
    }
    if (!form.is_training_required) {
      Alert.alert('Validation', 'Please answer "Do you require any training?"');
      return;
    }

    try {
      setLoading(true);

      // Step 1: ensure Recorded Beneficiary
      const recordedBenefId = await ensureRecordedBeneficiary();

      // Step 2: build NewEnterprise payload
      const prefered_location = buildPreferedLocationValue();
      const has_shg_cif = form.has_shg_cif === 'Yes';
      const is_training_received = form.is_training_received === 'Yes';
      const is_training_required = form.is_training_required === 'Yes';
      const mentorship_support =
        form.mentorship_support === 'Yes' ? 'Yes' : (form.mentorship_support || '');
      const financial_support = formatFinancialSupport();
      const digital_emarket_support = form.digital_emarket_support === 'Yes';

      let nearest_skill_centre = null;
      let skill_centre_loc = null;
      let nearest_industry = null;
      let industry_loc = null;

      if (form.is_training_required === 'No') {
        if (form.nearest_skill_centre_known === 'Yes') {
          nearest_skill_centre = form.nearest_skill_centre_name || 'Yes';
          skill_centre_loc = form.skill_centre_loc || null;
        } else if (form.nearest_skill_centre_known === 'No') {
          nearest_skill_centre = 'No';
        }

        if (form.nearest_industry_known === 'Yes') {
          nearest_industry = form.nearest_industry_name || 'Yes';
          industry_loc = form.industry_loc || null;
        } else if (form.nearest_industry_known === 'No') {
          nearest_industry = 'No';
        }
      }

      const payloadObj = {
        recorded_benef_id: recordedBenefId,
        applicant_special_category: form.applicant_special_category || null,
        prefered_location: prefered_location || null,
        has_shg_cif,
        cif_fund_amt: form.cif_fund_amt || null,
        is_training_received,
        is_training_required,
        nearest_skill_centre,
        skill_centre_loc,
        nearest_industry,
        industry_loc,
        mentorship_support: mentorship_support || null,
        financial_support: financial_support || null,
        loan_amount: form.loan_amount_range || null,
        market_linkage_type: form.market_linkage_type || null,
        market_linkage_detail: form.market_linkage_detail || null,
        is_promo_ad_req_type: form.is_promo_ad_req_type || null,
        is_promo_ad_req_detail: form.is_promo_ad_req_detail || null,
        infrastructure_support_type: form.infrastructure_support_type || null,
        infrastructure_support_detail: form.infrastructure_support_detail || null,
        digital_emarket_support,
        enterprise_type: 'newep',
        other_support: form.other_support || null,
        declaration_confirmed: !!form.declaration_confirmed,
        declaration_date: form.declaration_date || null,
      };

      // Step 3: create NewEnterprise
      let enterpriseRes;
      try {
        enterpriseRes = await performMultipartCreateNewEnterprise(
          payloadObj,
          signatureAsset
        );
      } catch (e) {
        console.warn('Multipart new-enterprise failed, trying JSON create', e);
        enterpriseRes = await gsApi.createNewEnterprise(payloadObj);
      }

      const enterpriseId =
        enterpriseRes?.TH_urid || enterpriseRes?.TH_URID || enterpriseRes?.id || null;

      if (!enterpriseId) {
        throw new Error('New enterprise saved but ID missing in response.');
      }

      // Step 4: link recorded_beneficiaries.enterprise_id
      try {
        await gsApi.updateRecordedBeneficiary(recordedBenefId, {
          enterprise_id: enterpriseId,
        });
      } catch (e) {
        console.error('Failed to update recorded beneficiary enterprise_id', e);
      }

      // Step 5: sub-forms
      // 5a) Enterprise type
      await createEnterpriseTypeRecord(enterpriseId);

      // 5b) Training received (rows)
      if (form.is_training_received === 'Yes') {
        await createTrainingReceivedRows(enterpriseId);
      }

      // 5c) Training required
      await createTrainingRequired(enterpriseId);

      // 5d) Training certificates
      await uploadTrainingCertificatesMedia(enterpriseId);

      // 5e) Applicant signature into enterprise-media (others)
      await uploadSignatureMedia(enterpriseId);

      Alert.alert('Success', 'New enterprise saved successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error('NewEnterprise submit error', err);
      const serverMsg =
        err?.data?.detail ||
        (err?.data && typeof err.data === 'object' ? JSON.stringify(err.data) : null) ||
        err?.message ||
        'Failed to save new enterprise. Please try again.';
      Alert.alert('Error', serverMsg);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>New Enterprise — {benefName}</Text>

      {/* ========= SECTION: Basic Information ========= */}
      <Text style={styles.sectionHeading}>Basic Information</Text>

      {/* 1) Special category */}
      <Text style={styles.label}>Please specify your special category (If applicable)</Text>
      <TextInput
        style={styles.input}
        value={form.applicant_special_category}
        onChangeText={(v) => setField('applicant_special_category', v)}
        placeholder="e.g. Divyang, Widow, Single Woman, etc."
      />

      {/* 2) Enterprise Type (subform /enterprise-types/) */}
      <ParentChildMultiSelect
        title="What kind of Enterprise are you interested in opening?"
        description="Please select one or more categories and sub-categories."
        items={ENTERPRISE_TYPE_CATEGORIES}
        value={enterpriseTypeSelection}
        onChange={setEnterpriseTypeSelection}
        otherParentKey={ENTERPRISE_TYPE_OTHER_PARENT_KEY}
      />

      {/* 3) Preferred location */}
      <Text style={[styles.label, { marginTop: 16 }]}>
        What location are you comfortable with for starting your enterprise?
      </Text>
      {[
        'In my State',
        'Desired State',
        'In my District',
        'Desired District',
        'In my Panchayat',
        'Desired Panchayat',
        'In my Village',
        'Desired Village',
      ].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('prefered_location_choice', opt)}
        >
          <View
            style={[
              styles.checkbox,
              form.prefered_location_choice === opt && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{opt}</Text>
        </TouchableOpacity>
      ))}

      {form.prefered_location_choice.startsWith('Desired') && (
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          placeholder="Please specify the desired location"
          value={form.prefered_location_extra}
          onChangeText={(v) => setField('prefered_location_extra', v)}
        />
      )}

      {/* 4) CIF Funds */}
      <Text style={[styles.sectionHeading, { marginTop: 20 }]}>CIF Support</Text>
      <Text style={styles.label}>Has your SHG received CIF Funds?</Text>
      <YesNoToggle
        value={form.has_shg_cif}
        onChange={(v) => setField('has_shg_cif', v)}
      />
      {form.has_shg_cif === 'Yes' && (
        <>
          <Text style={styles.label}>
            Please specify the amount of financial assistance your SHG received
          </Text>
          <TextInput
            style={styles.input}
            value={form.cif_fund_amt}
            onChangeText={(v) => setField('cif_fund_amt', v)}
            keyboardType="numeric"
            placeholder="Enter amount"
          />
        </>
      )}

      {/* ========= SECTION: Trainings Received ========= */}
      <Text style={styles.sectionHeading}>Trainings Received</Text>

      <Text style={styles.label}>Have you received any training?</Text>
      <YesNoToggle
        value={form.is_training_received}
        onChange={(v) => setField('is_training_received', v)}
      />

      {form.is_training_received === 'Yes' && (
        <>
          <Text style={[styles.label, { marginTop: 6 }]}>
            Please add details of each training received
          </Text>
          <TouchableOpacity style={styles.smallBtn} onPress={addTrainingReceivedRow}>
            <Text style={{ fontWeight: '600' }}>+ Add Training Detail</Text>
          </TouchableOpacity>

          {trainingReceivedRows.map((row) => (
            <View
              key={row.id}
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: '#DDD',
                borderRadius: 8,
                backgroundColor: '#FAFAFA',
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 8,
                  alignItems: 'center',
                }}
                onPress={() => updateTrainingRow(row.id, { open: !row.open })}
              >
                <Text style={{ fontWeight: '600', color: '#333' }}>
                  {row.department || 'New Training Detail'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text>{row.open ? '-' : '+'}</Text>
                  <TouchableOpacity onPress={() => removeTrainingReceivedRow(row.id)}>
                    <Text style={{ color: '#EE6969' }}>x</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              {row.open && (
                <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                  <Text style={styles.label}>Which department did you receive the training from?</Text>
                  {['NRLM', 'RCT', 'NABARD', 'UPSDM', 'Others'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.checkboxRow}
                      onPress={() => updateTrainingRow(row.id, { department: opt })}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          row.department === opt && styles.checkboxChecked,
                        ]}
                      />
                      <Text style={styles.checkboxLabel}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                  {row.department === 'Others' && (
                    <TextInput
                      style={styles.input}
                      placeholder="Please specify department"
                      value={row.department_other || ''}
                      onChangeText={(t) =>
                        updateTrainingRow(row.id, { department: t })
                      }
                    />
                  )}

                  <ParentChildMultiSelect
                    title="Please select all sectors in which you have received trainings"
                    items={TRAINING_SECTORS}
                    value={row.sectors}
                    onChange={(sel) => updateTrainingRow(row.id, { sectors: sel })}
                    otherParentKey={TRAINING_OTHER_PARENT_KEY}
                  />
                </View>
              )}
            </View>
          ))}

          {/* Certificates upload */}
          <Text style={[styles.label, { marginTop: 12 }]}>
            Please upload if you have any certificates for your trainings
          </Text>
          <TouchableOpacity style={styles.smallBtn} onPress={pickTrainingCertificates}>
            <Text style={{ fontWeight: '600' }}>Upload Certificates</Text>
          </TouchableOpacity>
          {trainingCertificateAssets.length > 0 && (
            <Text style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
              {trainingCertificateAssets.length} file(s) selected
            </Text>
          )}
        </>
      )}

      {/* ========= SECTION: Trainings Required ========= */}
      <Text style={styles.sectionHeading}>Training Requirement</Text>

      <Text style={styles.label}>Do you require any training?</Text>
      <YesNoToggle
        value={form.is_training_required}
        onChange={(v) => setField('is_training_required', v)}
      />

      {form.is_training_required === 'Yes' && (
        <>
          <Text style={styles.label}>Which is your preferred department for training?</Text>
          {['NRLM', 'RCT', 'NABARD', 'UPSDM', 'Others'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.checkboxRow}
              onPress={() => setTrainingReqDept(opt)}
            >
              <View
                style={[
                  styles.checkbox,
                  trainingReqDept === opt && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>{opt}</Text>
            </TouchableOpacity>
          ))}
          {trainingReqDept === 'Others' && (
            <TextInput
              style={styles.input}
              placeholder="Please specify department"
              value={trainingReqDept === 'Others' ? '' : trainingReqDept}
              onChangeText={(t) => setTrainingReqDept(t)}
            />
          )}

          <ParentChildMultiSelect
            title="Which is your preferred sector for training?"
            description="Select sector(s) and sub sectors for which you want training."
            items={TRAINING_SECTORS}
            value={trainingReqSectors}
            onChange={setTrainingReqSectors}
            otherParentKey={TRAINING_OTHER_PARENT_KEY}
          />

          <Text style={styles.label}>How many days of training are you comfortable with?</Text>
          {['Under 7 days', '7 days', '15 days', '30 days', 'Over 30 days'].map(
            (opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.checkboxRow}
                onPress={() => setTrainingReqDuration(opt)}
              >
                <View
                  style={[
                    styles.checkbox,
                    trainingReqDuration === opt && styles.checkboxChecked,
                  ]}
                />
                <Text style={styles.checkboxLabel}>{opt}</Text>
              </TouchableOpacity>
            )
          )}

          <Text style={styles.label}>What is your preferred training location?</Text>
          <Text style={styles.label}>Desired State</Text>          
          <TextInput
            style={styles.input}
            placeholder="State"
            value={trainingReqLocationState}
            onChangeText={setTrainingReqLocationState}
          />
          <Text style={styles.label}>Desired District</Text>          
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder="District"
            value={trainingReqLocationDistrict}
            onChangeText={setTrainingReqLocationDistrict}
          />
          <Text style={styles.label}>Desired Block</Text>          
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder="Block"
            value={trainingReqLocationBlock}
            onChangeText={setTrainingReqLocationBlock}
          />

          <Text style={styles.label}>What is your expected Salary after training?</Text>
          {[
            'Under 10,000',
            '10,000 - 20,000',
            '20,000 - 30,000',
            'Above 30,000',
          ].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.checkboxRow}
              onPress={() => setTrainingReqExpectedIncome(opt)}
            >
              <View
                style={[
                  styles.checkbox,
                  trainingReqExpectedIncome === opt && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {form.is_training_required === 'No' && (
        <>
          {/* When training not required → ask about known centres / industries */}
          <Text style={styles.sectionHeading}>Existing Exposure to Centres / Industries</Text>

          <Text style={styles.label}>Do you know of any Skill Centres near you?</Text>
          <YesNoToggle
            value={form.nearest_skill_centre_known}
            onChange={(v) => setField('nearest_skill_centre_known', v)}
          />
          {form.nearest_skill_centre_known === 'Yes' && (
            <>
              <Text style={styles.label}>Please tell its name</Text>
              <TextInput
                style={styles.input}
                value={form.nearest_skill_centre_name}
                onChangeText={(v) => setField('nearest_skill_centre_name', v)}
                placeholder="Skill centre name"
              />
              <Text style={styles.label}>Please tell its location</Text>
              <TextInput
                style={styles.input}
                value={form.skill_centre_loc}
                onChangeText={(v) => setField('skill_centre_loc', v)}
                placeholder="Location"
              />
            </>
          )}

          <Text style={[styles.label, { marginTop: 10 }]}>
            Do you know of any Industries / Industrial Sectors near you?
          </Text>
          <YesNoToggle
            value={form.nearest_industry_known}
            onChange={(v) => setField('nearest_industry_known', v)}
          />
          {form.nearest_industry_known === 'Yes' && (
            <>
              <Text style={styles.label}>Please tell its name</Text>
              <TextInput
                style={styles.input}
                value={form.nearest_industry_name}
                onChangeText={(v) => setField('nearest_industry_name', v)}
                placeholder="Industry / Industrial sector name"
              />
              <Text style={styles.label}>Please tell its location</Text>
              <TextInput
                style={styles.input}
                value={form.industry_loc}
                onChangeText={(v) => setField('industry_loc', v)}
                placeholder="Location"
              />
            </>
          )}
        </>
      )}

      {/* ========= SECTION: Support Required ========= */}
      <Text style={styles.sectionHeading}>Support Required</Text>

      <Text style={styles.label}>Do you require Mentorship support?</Text>
      <YesNoToggle
        value={form.mentorship_support}
        onChange={(v) => setField('mentorship_support', v)}
      />

      <Text style={styles.label}>Do you require Financial Assistance?</Text>
      {['Cash', 'Loan', 'Others'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('financial_support_type', opt)}
        >
          <View
            style={[
              styles.checkbox,
              form.financial_support_type === opt && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{opt}</Text>
        </TouchableOpacity>
      ))}

      {(form.financial_support_type === 'Cash' ||
        form.financial_support_type === 'Others') && (
        <TextInput
          style={styles.input}
          placeholder="Please specify details"
          value={form.financial_support_other_text}
          onChangeText={(v) => setField('financial_support_other_text', v)}
        />
      )}

      {form.financial_support_type === 'Loan' && (
        <>
          <Text style={styles.label}>What loan amount range do you require?</Text>
          {[
            '50,000 - 1,00,000',
            '1,00,000 - 2,00,000',
            '2,00,000 - 5,00,000',
          ].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.checkboxRow}
              onPress={() => setField('loan_amount_range', opt)}
            >
              <View
                style={[
                  styles.checkbox,
                  form.loan_amount_range === opt && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <Text style={styles.label}>
        What type of Market Linkage Assistance you require?
      </Text>
      {['Retail', 'Business', 'Govt', 'Others'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('market_linkage_type', opt)}
        >
          <View
            style={[
              styles.checkbox,
              form.market_linkage_type === opt && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{opt}</Text>
        </TouchableOpacity>
      ))}
      {form.market_linkage_type && (
        <TextInput
          style={styles.input}
          placeholder="Please specify details"
          value={form.market_linkage_detail}
          onChangeText={(v) => setField('market_linkage_detail', v)}
        />
      )}

      <Text style={styles.label}>
        What type of Branding Promotion Assistance you require?
      </Text>
      {['Physical', 'Online', 'Others'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('is_promo_ad_req_type', opt)}
        >
          <View
            style={[
              styles.checkbox,
              form.is_promo_ad_req_type === opt && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{opt}</Text>
        </TouchableOpacity>
      ))}
      {form.is_promo_ad_req_type && (
        <TextInput
          style={styles.input}
          placeholder="Please specify details"
          value={form.is_promo_ad_req_detail}
          onChangeText={(v) => setField('is_promo_ad_req_detail', v)}
        />
      )}

      <Text style={styles.label}>
        What type of Infrastructure support you require?
      </Text>
      {['Equipments', 'Machinery', 'Place of Business', 'Others'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('infrastructure_support_type', opt)}
        >
          <View
            style={[
              styles.checkbox,
              form.infrastructure_support_type === opt && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{opt}</Text>
        </TouchableOpacity>
      ))}
      {form.infrastructure_support_type && (
        <TextInput
          style={styles.input}
          placeholder="Please specify details"
          value={form.infrastructure_support_detail}
          onChangeText={(v) => setField('infrastructure_support_detail', v)}
        />
      )}

      <Text style={styles.label}>Do you require Digital E-Market support?</Text>
      <YesNoToggle
        value={form.digital_emarket_support}
        onChange={(v) => setField('digital_emarket_support', v)}
      />

      <Text style={styles.label}>Do you require any other support?</Text>
      <TextInput
        style={[styles.input, { minHeight: 60 }]}
        multiline
        value={form.other_support}
        onChangeText={(v) => setField('other_support', v)}
        placeholder="Please describe any other support required"
      />

      {/* ========= SECTION: Declarations ========= */}
      <Text style={styles.sectionHeading}>Declarations</Text>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() =>
          setField('declaration_confirmed', !form.declaration_confirmed)
        }
      >
        <View
          style={[
            styles.checkbox,
            form.declaration_confirmed && styles.checkboxChecked,
          ]}
        />
        <Text style={styles.checkboxLabel}>
          I hereby declare that all information provided above is correct and checked by me.
        </Text>
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 10 }]}>Declaration Date</Text>
      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center', height: 44 }]}
        onPress={openDeclarationModal}
      >
        <Text>{form.declaration_date || 'Select date'}</Text>
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
              {/* Day */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>Day</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                  }}
                >
                  <ScrollView style={{ maxHeight: 120 }}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setDeclDay(String(d))}
                        style={{ padding: 8 }}
                      >
                        <Text
                          style={{
                            color:
                              declDay === String(d) ? '#EE6969' : '#333',
                          }}
                        >
                          {String(d)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Month */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>Month</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                  }}
                >
                  <ScrollView style={{ maxHeight: 120 }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setDeclMonth(String(m))}
                        style={{ padding: 8 }}
                      >
                        <Text
                          style={{
                            color:
                              declMonth === String(m) ? '#EE6969' : '#333',
                          }}
                        >
                          {String(m)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Year */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>Year</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                  }}
                >
                  <ScrollView style={{ maxHeight: 120 }}>
                    {yearOptions.map((y) => (
                      <TouchableOpacity
                        key={y}
                        onPress={() => setDeclYear(y)}
                        style={{ padding: 8 }}
                      >
                        <Text
                          style={{
                            color: declYear === y ? '#EE6969' : '#333',
                          }}
                        >
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 12,
              }}
            >
              <TouchableOpacity
                style={[styles.cancelBtn, { paddingHorizontal: 16 }]}
                onPress={() => setDeclarationDateModalVisible(false)}
              >
                <Text style={{ color: '#EE6969', fontWeight: '600' }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallBtn, { paddingHorizontal: 16 }]}
                onPress={() => {
                  const dd = String(declDay ?? '1').padStart(2, '0');
                  const mm = String(declMonth ?? '1').padStart(2, '0');
                  const yyyy = String(declYear ?? currentYear);
                  const iso = `${yyyy}-${mm}-${dd}`;
                  setField('declaration_date', iso);
                  setDeclarationDateModalVisible(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={[styles.label, { marginTop: 12 }]}>Applicant Signature</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity style={styles.smallBtn} onPress={pickSignatureFromGallery}>
          <Text style={{ fontWeight: '600' }}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallBtn} onPress={takeSignaturePhoto}>
          <Text style={{ fontWeight: '600' }}>Camera</Text>
        </TouchableOpacity>
        {signatureAsset?.uri && (
          <Text style={{ marginLeft: 8, flex: 1 }} numberOfLines={1}>
            {signatureAsset.fileName || signatureAsset.uri}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#555555',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#000000',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxSmall: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 3,
    marginRight: 6,
  },
  checkboxChecked: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#FFCC00',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  smallBtn: {
    backgroundColor: '#EEE',
    padding: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  cancelBtn: {
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 300,
    paddingBottom: 15,
    paddingTop: 10,
  },
});
