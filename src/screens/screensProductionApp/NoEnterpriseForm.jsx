// src/screens/epsakhi/NoEnterpriseForm.jsx
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
} from 'react-native';
import gsApi from '../../api/gsApi';
import {
  getShgListForPanchayat,
  getCrpPanchayats,
  getCrpDetail,
} from '../../utils/tempStore';
import { getUser } from '../../utils/auth';

// ========= Helpers (copied/adapted from NewEnterpriseForm) =========

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

// ========= Training sector config =========

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
  {
    parent: 'Others',
    children: ['Others'],
  },
];

// ========= Reusable UI pieces =========

const YesNoToggle = ({ value, onChange }) => (
  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
    <TouchableOpacity
      style={[styles.smallBtn, value === 'Yes' && { backgroundColor: '#EE6969' }]}
      onPress={() => onChange('Yes')}
    >
      <Text style={{ color: value === 'Yes' ? '#fff' : '#333', fontWeight: '600' }}>
        Yes
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.smallBtn, value === 'No' && { backgroundColor: '#EE6969' }]}
      onPress={() => onChange('No')}
    >
      <Text style={{ color: value === 'No' ? '#fff' : '#333', fontWeight: '600' }}>
        No
      </Text>
    </TouchableOpacity>
  </View>
);

const CheckboxRow = ({ label, checked, onPress }) => (
  <TouchableOpacity style={styles.checkboxRow} onPress={onPress}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]} />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

// ========= Main component =========

export default function NoEnterpriseForm({ route, navigation }) {
  const recordedBenef = route?.params?.recordedBenef || null; // may be null
  const beneficiary = route?.params?.beneficiary || null; // UPSRLM member row
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

  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  // ---------------- NoEnterprise main form state ----------------
  const [activityOption, setActivityOption] = useState(''); // Q1 dropdown
  const [activitySpecify, setActivitySpecify] = useState('');

  const [noInterestOption, setNoInterestOption] = useState(''); // Q2 dropdown
  const [noInterestSpecify, setNoInterestSpecify] = useState('');
  const [wageInterestYesNo, setWageInterestYesNo] = useState(''); // Yes/No under "Interested in Wage Employment?"

  // Wage sub-form
  const [wageEmpTypes, setWageEmpTypes] = useState([]); // type_of_emp (multi)
  const [wagePlacementSectors, setWagePlacementSectors] = useState([]); // placement_sector (multi)
  const [wageExpSalary, setWageExpSalary] = useState(''); // exp_salary
  const [wageLocationChoice, setWageLocationChoice] = useState(''); // which button clicked
  const [wageDesiredLocationText, setWageDesiredLocationText] = useState(''); // for Desired State/District

  // Training requirement (Q3 on main)
  const [trainingRequiredYesNo, setTrainingRequiredYesNo] = useState(''); // is_training_required: "Yes"/"No"

  // Training sub-form
  const [trainingDepartmentOption, setTrainingDepartmentOption] = useState(''); // dropdown
  const [trainingDepartmentOtherText, setTrainingDepartmentOtherText] = useState('');
  const [selectedTrainingParents, setSelectedTrainingParents] = useState([]); // list of parent names
  const [trainingChildrenByParent, setTrainingChildrenByParent] = useState({}); // { parent: { child: true, otherText?: string } }
  const [trainingDuration, setTrainingDuration] = useState(''); // duration
  const [trainingLocationState, setTrainingLocationState] = useState('');
  const [trainingLocationDistrict, setTrainingLocationDistrict] = useState('');
  const [trainingLocationBlock, setTrainingLocationBlock] = useState('');
  const [trainingExpectedIncome, setTrainingExpectedIncome] = useState(''); // expected_income

  // Q4/Q5 on main form
  const [futureWillingYesNo, setFutureWillingYesNo] = useState('');
  const [hasShgCifYesNo, setHasShgCifYesNo] = useState('');
  const [cifAmount, setCifAmount] = useState('');

  // ---------------- Effects: load user and auth token ----------------

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
        console.warn('Unable to load user in NoEnterpriseForm', e);
      }
    })();
  }, []);

  // ---------------- SHG + recorded-benef helper logic ----------------

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
    let marital_status =
      beneficiary.marital_status ?? beneficiary.maritalStatus ?? '';
    let father_husband_name =
      beneficiary.father_husband ??
      beneficiary.father_husband_name ??
      beneficiary.relation_name ??
      '';

    let lokos_shg =
      lokosShgCode || beneficiary.shg_code || beneficiary.lokos_shg_code || null;

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

    // last resort: on-demand fetch from CRP block (if available)
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

    // created_by: prefer loggedUser numeric PK; fallback to routeCrpUserId if numeric
    let created_by_to_send = null;
    const candidate =
      loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? routeCrpUserId;
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
      enterprise_type: 'noep',
    };

    if (created_by_to_send !== null) {
      recordedPayload.created_by = created_by_to_send;
    }

    const recRes = await gsApi.createRecordedBeneficiary(recordedPayload);

    recordedBenefId =
      recRes?.TH_urid || recRes?.TH_URID || recRes?.id || null;

    if (!recordedBenefId) {
      throw new Error('Recorded beneficiary created but ID missing in response.');
    }

    return recordedBenefId;
  };

  // ---------------- Wage helpers ----------------

  const toggleMultiSelect = (value, listSetter, currentList) => {
    if (currentList.includes(value)) {
      listSetter(currentList.filter((x) => x !== value));
    } else {
      listSetter([...currentList, value]);
    }
  };

  const wageLocationToFields = () => {
    // Returns { location_scope, location } based on wageLocationChoice and wageDesiredLocationText
    if (!wageLocationChoice) return { location_scope: null, location: null };

    if (wageLocationChoice === 'Other Countries') {
      return { location_scope: 'International', location: 'Other Countries' };
    }

    if (wageLocationChoice === 'In my Country') {
      return { location_scope: 'National', location: 'In my Country' };
    }

    if (wageLocationChoice === 'In my State') {
      return { location_scope: 'National', location: 'In my State' };
    }

    if (wageLocationChoice === 'In my District') {
      return { location_scope: 'National', location: 'In my District' };
    }

    if (wageLocationChoice === 'Desired State') {
      const txt = (wageDesiredLocationText || '').trim();
      return {
        location_scope: 'National',
        location: txt ? `Desired State, ${txt}` : 'Desired State',
      };
    }

    if (wageLocationChoice === 'Desired District') {
      const txt = (wageDesiredLocationText || '').trim();
      return {
        location_scope: 'National',
        location: txt ? `Desired District, ${txt}` : 'Desired District',
      };
    }

    return { location_scope: null, location: null };
  };

  // ---------------- Training selection helpers ----------------

  const toggleTrainingParent = (parent) => {
    setSelectedTrainingParents((prev) => {
      if (prev.includes(parent)) {
        // remove parent & its children
        const next = prev.filter((p) => p !== parent);
        setTrainingChildrenByParent((old) => {
          const copy = { ...old };
          delete copy[parent];
          return copy;
        });
        return next;
      }
      return [...prev, parent];
    });
  };

  const toggleTrainingChild = (parent, child) => {
    setTrainingChildrenByParent((prev) => {
      const forParent = prev[parent] || {};
      const newForParent = { ...forParent };
      if (newForParent[child]) {
        delete newForParent[child];
      } else {
        newForParent[child] = true;
      }
      return { ...prev, [parent]: newForParent };
    });
  };

  const setTrainingOtherChildText = (parent, text) => {
    setTrainingChildrenByParent((prev) => {
      const forParent = prev[parent] || {};
      return { ...prev, [parent]: { ...forParent, __otherText: text } };
    });
  };

  const buildTrainingSectorFields = () => {
    // sector: comma-separated selected parent sectors
    // training_module_name: "[Parent: child1, child2], [Parent2: childA, childB]" text
    const chosenParents = selectedTrainingParents;
    if (!chosenParents.length) return { sector: null, training_module_name: null };

    const sector = chosenParents.join(', ');

    const chunks = [];
    for (const parent of chosenParents) {
      const conf = TRAINING_SECTORS.find((s) => s.parent === parent);
      const kidsState = trainingChildrenByParent[parent] || {};
      const childNames = [];

      (conf?.children || []).forEach((child) => {
        if (child === 'Others') {
          if (kidsState['Others']) {
            const otherText = (kidsState.__otherText || '').trim();
            if (otherText) {
              childNames.push(otherText);
            } else {
              childNames.push('Others');
            }
          }
        } else if (kidsState[child]) {
          childNames.push(child);
        }
      });

      if (parent === 'Others') {
        // special final parent; allow just __otherText
        const otherText = (kidsState.__otherText || '').trim();
        if (otherText) {
          childNames.push(otherText);
        }
      }

      if (childNames.length) {
        chunks.push(`[${parent}: ${childNames.join(', ')}]`);
      }
    }

    const training_module_name = chunks.length ? chunks.join(', ') : null;
    return { sector, training_module_name };
  };

  const buildTrainingLocation = () => {
    const parts = [
      trainingLocationState || '',
      trainingLocationDistrict || '',
      trainingLocationBlock || '',
    ]
      .map((x) => x.trim())
      .filter(Boolean);
    if (!parts.length) return null;
    return parts.join(', ');
  };

  // ---------------- Submit handler ----------------

  const handleSubmit = async () => {
    // Basic validations
    if (!activityOption) {
      Alert.alert(
        'Validation',
        'Please answer "Are you involved in any activity currently?"'
      );
      return;
    }

    if (!noInterestOption) {
      Alert.alert(
        'Validation',
        'Please answer "Why are you not interested in opening an enterprise?"'
      );
      return;
    }

    if (
      noInterestOption === 'Interested in Wage Employment?' &&
      !wageInterestYesNo
    ) {
      Alert.alert(
        'Validation',
        'Please select Yes / No for "Interested in Wage Employment?"'
      );
      return;
    }

    if (!trainingRequiredYesNo) {
      Alert.alert(
        'Validation',
        'Please answer "Do you require any training?"'
      );
      return;
    }

    if (!futureWillingYesNo) {
      Alert.alert(
        'Validation',
        'Please answer "Are you willing to start a business in future?"'
      );
      return;
    }

    if (!hasShgCifYesNo) {
      Alert.alert(
        'Validation',
        'Please answer "Has your SHG received CIF Funds?"'
      );
      return;
    }

    // Some extra validations for sub-forms
    const wantsWageForm =
      noInterestOption === 'Interested in Wage Employment?' &&
      wageInterestYesNo === 'Yes';

    if (wantsWageForm) {
      if (!wageEmpTypes.length) {
        Alert.alert(
          'Validation',
          'Please select at least one option for "What type of Wage Employment are you interested in?"'
        );
        return;
      }
      if (!wagePlacementSectors.length) {
        Alert.alert(
          'Validation',
          'Please select at least one option for "What type of Placement Sector have you thought of?"'
        );
        return;
      }
      if (!wageExpSalary) {
        Alert.alert(
          'Validation',
          'Please select "What is your expected Salary?"'
        );
        return;
      }
      const { location_scope, location } = wageLocationToFields();
      if (!location_scope || !location) {
        Alert.alert(
          'Validation',
          'Please answer "What location are you comfortable with?"'
        );
        return;
      }
    }

    const wantsTrainingForm = trainingRequiredYesNo === 'Yes';

    if (wantsTrainingForm) {
      if (!trainingDepartmentOption) {
        Alert.alert(
          'Validation',
          'Please select your preferred department for training.'
        );
        return;
      }
      const { sector, training_module_name } = buildTrainingSectorFields();
      if (!sector || !training_module_name) {
        Alert.alert(
          'Validation',
          'Please select at least one sector and training module.'
        );
        return;
      }
      if (!trainingDuration) {
        Alert.alert(
          'Validation',
          'Please select how many days of training you are comfortable with.'
        );
        return;
      }
      if (!buildTrainingLocation()) {
        Alert.alert(
          'Validation',
          'Please fill State, District or Block for preferred training location.'
        );
        return;
      }
      if (!trainingExpectedIncome) {
        Alert.alert(
          'Validation',
          'Please select expected salary after training.'
        );
        return;
      }
    }

    try {
      setLoading(true);

      // STEP 1: ensure recorded beneficiary exists
      const recordedBenefId = await ensureRecordedBeneficiary();

      // STEP 2: build NoEnterpriseForm payload

      // Q1: if_shg_member_inv
      const activityFullValue = activityOption
        ? `${activityOption}${activitySpecify ? `, ${activitySpecify}` : ''}`
        : '';

      // Q2: no_int_reason
      let noIntReasonValue = '';
      if (noInterestOption === 'Personal Reasons') {
        noIntReasonValue = 'Personal Reasons';
      } else if (noInterestOption === 'Family Business') {
        noIntReasonValue = 'Family Business';
      } else if (noInterestOption === 'Others') {
        noIntReasonValue = noInterestSpecify || '';
      } else if (noInterestOption === 'Interested in Wage Employment?') {
        if (wageInterestYesNo === 'Yes') {
          noIntReasonValue = 'Interested in Wage Employment';
        } else if (wageInterestYesNo === 'No') {
          noIntReasonValue = 'Not interested in Wage Employment';
        }
      }

      const isTrainingRequiredField = trainingRequiredYesNo; // "Yes" / "No" as asked

      // created_by: prefer loggedUser numeric PK; fallback to routeCrpUserId if numeric
      let created_by_to_send = null;
      const candidate =
        loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? routeCrpUserId;
      if (candidate !== null && candidate !== undefined) {
        if (typeof candidate === 'number') {
          created_by_to_send = candidate;
        } else if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
          created_by_to_send = parseInt(candidate.trim(), 10);
        } else {
          created_by_to_send = null;
        }
      }

      const payloadNoEnterprise = {
        recorded_benef_id: recordedBenefId,
        if_shg_member_inv: activityFullValue || null,
        no_int_reason: noIntReasonValue || null,
        is_training_required: isTrainingRequiredField || null,
        future_willing: futureWillingYesNo === 'Yes',
        has_shg_cif: hasShgCifYesNo === 'Yes',
        cif_fund_amt: cifAmount || null,
      };

      if (created_by_to_send !== null) {
        payloadNoEnterprise.created_by = created_by_to_send;
      }

      // STEP 3: create NoEnterpriseForm
      const noEpRes = await gsApi.createNoEnterpriseForm(payloadNoEnterprise);

      const noEpId =
        noEpRes?.TH_urid || noEpRes?.TH_URID || noEpRes?.id || null;

      if (!noEpId) {
        throw new Error(
          'No Enterprise form saved but ID missing in response.'
        );
      }

      // STEP 4: link recorded-beneficiaries.enterprise_id
      try {
        await gsApi.updateRecordedBeneficiary(recordedBenefId, {
          enterprise_id: noEpId,
        });
      } catch (e) {
        console.warn(
          'Failed to update recorded beneficiary enterprise_id for NoEnterpriseForm',
          e
        );
      }

      // STEP 5: create sub-forms (wage / training) if required

      if (wantsWageForm) {
        const { location_scope, location } = wageLocationToFields();

        // created_by: prefer loggedUser numeric PK; fallback to routeCrpUserId if numeric
        let created_by_to_send = null;
        const candidate =
          loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? routeCrpUserId;
        if (candidate !== null && candidate !== undefined) {
          if (typeof candidate === 'number') {
            created_by_to_send = candidate;
          } else if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
            created_by_to_send = parseInt(candidate.trim(), 10);
          } else {
            created_by_to_send = null;
          }
        }

        const payloadWage = {
          enterprise_id: noEpId,
          type_of_emp: wageEmpTypes.join(', '),
          placement_sector: wagePlacementSectors.join(', '),
          exp_salary: wageExpSalary,
          location_scope,
          location,
        };

        if (created_by_to_send !== null) {
          payloadWage.created_by = created_by_to_send;
        }

        try {
          await gsApi.createNoEnterpriseWage(payloadWage);
        } catch (e) {
          console.warn('Failed to create NoEnterpriseWage', e);
        }
      }

      if (wantsTrainingForm) {
        const actualDepartment =
          trainingDepartmentOption === 'Others'
            ? trainingDepartmentOtherText || 'Others'
            : trainingDepartmentOption;

        const { sector, training_module_name } = buildTrainingSectorFields();
        const trainingLocation = buildTrainingLocation();

        const payloadTraining = {
          enterprise_id: noEpId,
          form_type: 'req',
          department: actualDepartment || null,
          sector: sector || null,
          training_module_name: training_module_name || null,
          duration: trainingDuration || null,
          location: trainingLocation || null,
          expected_income: trainingExpectedIncome || null,
        };

        // created_by: prefer loggedUser numeric PK; fallback to routeCrpUserId if numeric
        let created_by_to_send = null;
        const candidate =
          loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? routeCrpUserId;
        if (candidate !== null && candidate !== undefined) {
          if (typeof candidate === 'number') {
            created_by_to_send = candidate;
          } else if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
            created_by_to_send = parseInt(candidate.trim(), 10);
          } else {
            created_by_to_send = null;
          }
        }

        if (created_by_to_send !== null) {
          payloadTraining.created_by = created_by_to_send;
        }

        try {
          await gsApi.createEnterpriseTrainingReq(payloadTraining);
        } catch (e) {
          console.warn('Failed to create EnterpriseTrainingReq for NoEnterpriseForm', e);
        }
      }

      Alert.alert('Success', 'Details saved successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error('NoEnterpriseForm submit error', err);
      const serverMsg =
        err?.data?.detail ||
        (err?.data && typeof err.data === 'object'
          ? JSON.stringify(err.data)
          : null) ||
        err?.message ||
        'Failed to save details. Please try again.';
      Alert.alert('Error', serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const benefName =
    beneficiary?.member_name ||
    beneficiary?.name ||
    recordedBenef?.applicant_name ||
    '';

  // ========= Render =========

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>No Enterprise — {benefName}</Text>

      {/* Q1: Are you involved in any activity currently? */}
      <Text style={styles.sectionHeading}>Current Activity</Text>
      <Text style={styles.label}>
        Are you involved in any activity currently?
      </Text>
      <Text style={styles.helpText}>
        Please select the type of activity you are involved in and specify brief details.
      </Text>

      {[
        'SHG related Activity',
        'Employed Full time',
        'Employed Part time',
        'Others',
      ].map((opt) => (
        <CheckboxRow
          key={opt}
          label={opt}
          checked={activityOption === opt}
          onPress={() => setActivityOption(opt)}
        />
      ))}

      {activityOption ? (
        <TextInput
          style={[styles.input, { minHeight: 60, marginTop: 6 }]}
          placeholder="Please specify the details of your activity"
          multiline
          value={activitySpecify}
          onChangeText={setActivitySpecify}
        />
      ) : null}

      {/* Q2: Why are you not interested in opening an enterprise? */}
      <Text style={styles.sectionHeading}>Reason for Not Opening Enterprise</Text>
      <Text style={styles.label}>
        Why are you not interested in opening an enterprise?
      </Text>

      {[
        'Personal Reasons',
        'Family Business',
        'Interested in Wage Employment?',
        'Others',
      ].map((opt) => (
        <CheckboxRow
          key={opt}
          label={opt}
          checked={noInterestOption === opt}
          onPress={() => {
            setNoInterestOption(opt);
            // reset wage options when changing
            if (opt !== 'Interested in Wage Employment?') {
              setWageInterestYesNo('');
            }
          }}
        />
      ))}

      {noInterestOption === 'Others' && (
        <TextInput
          style={[styles.input, { minHeight: 60, marginTop: 6 }]}
          placeholder="Please specify your reason"
          multiline
          value={noInterestSpecify}
          onChangeText={setNoInterestSpecify}
        />
      )}

      {noInterestOption === 'Interested in Wage Employment?' && (
        <>
          <Text style={[styles.label, { marginTop: 10 }]}>
            Are you interested in Wage Employment?
          </Text>
          <YesNoToggle
            value={wageInterestYesNo}
            onChange={setWageInterestYesNo}
          />

          {wageInterestYesNo === 'Yes' && (
            <>
              {/* Wage sub-form */}
              <Text style={styles.sectionHeading}>
                Wage Employment Preference
              </Text>

              {/* 1) type_of_emp */}
              <Text style={styles.label}>
                What type of Wage Employment are you interested in?
              </Text>
              <Text style={styles.helpText}>
                You can select one or more options.
              </Text>
              {['Full Time', 'Part Time'].map((opt) => (
                <CheckboxRow
                  key={opt}
                  label={opt}
                  checked={wageEmpTypes.includes(opt)}
                  onPress={() =>
                    toggleMultiSelect(opt, setWageEmpTypes, wageEmpTypes)
                  }
                />
              ))}

              {/* 2) placement_sector */}
              <Text style={[styles.label, { marginTop: 10 }]}>
                What type of Placement Sector have you thought of?
              </Text>
              <Text style={styles.helpText}>
                You can select one or more options.
              </Text>
              {[
                'Manufacturing Based Jobs',
                'Service Based Jobs',
                'Agriculture Based Jobs',
              ].map((opt) => (
                <CheckboxRow
                  key={opt}
                  label={opt}
                  checked={wagePlacementSectors.includes(opt)}
                  onPress={() =>
                    toggleMultiSelect(opt, setWagePlacementSectors, wagePlacementSectors)
                  }
                />
              ))}

              {/* 3) exp_salary */}
              <Text style={[styles.label, { marginTop: 10 }]}>
                What is your expected Salary?
              </Text>
              <Text style={styles.helpText}>
                Please select your expected monthly salary range.
              </Text>
              {[
                'Under 10,000',
                '10,000 - 20,000',
                '20,000 - 30,000',
                'Above 30,000',
              ].map((opt) => (
                <CheckboxRow
                  key={opt}
                  label={opt}
                  checked={wageExpSalary === opt}
                  onPress={() => setWageExpSalary(opt)}
                />
              ))}

              {/* 4) location_scope & location */}
              <Text style={[styles.label, { marginTop: 10 }]}>
                What location are you comfortable with?
              </Text>
              <Text style={styles.helpText}>
                Please select where you would be comfortable working.
              </Text>

              {[
                'In my State',
                'Desired State',
                'In my District',
                'Desired District',
                'In my Country',
                'Other Countries',
              ].map((opt) => (
                <CheckboxRow
                  key={opt}
                  label={opt}
                  checked={wageLocationChoice === opt}
                  onPress={() => {
                    setWageLocationChoice(opt);
                    if (
                      opt !== 'Desired State' &&
                      opt !== 'Desired District'
                    ) {
                      setWageDesiredLocationText('');
                    }
                  }}
                />
              ))}

              {(wageLocationChoice === 'Desired State' ||
                wageLocationChoice === 'Desired District') && (
                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder={
                    wageLocationChoice === 'Desired State'
                      ? 'Please specify desired State'
                      : 'Please specify desired District'
                  }
                  value={wageDesiredLocationText}
                  onChangeText={setWageDesiredLocationText}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Q3: Training requirement */}
      <Text style={styles.sectionHeading}>Training Requirement</Text>
      <Text style={styles.label}>Do you require any training?</Text>
      <YesNoToggle
        value={trainingRequiredYesNo}
        onChange={setTrainingRequiredYesNo}
      />

      {trainingRequiredYesNo === 'Yes' && (
        <>
          {/* Department */}
          <Text style={[styles.label, { marginTop: 10 }]}>
            Which is your preferred department for training?
          </Text>
          {['NRLM', 'RCT', 'NABARD', 'UPSDM', 'Others'].map((opt) => (
            <CheckboxRow
              key={opt}
              label={opt}
              checked={trainingDepartmentOption === opt}
              onPress={() => setTrainingDepartmentOption(opt)}
            />
          ))}
          {trainingDepartmentOption === 'Others' && (
            <TextInput
              style={[styles.input, { marginTop: 6 }]}
              placeholder="Please specify the department"
              value={trainingDepartmentOtherText}
              onChangeText={setTrainingDepartmentOtherText}
            />
          )}

          {/* Sectors / modules */}
          <Text style={styles.sectionHeading}>
            Preferred Sector for Training
          </Text>
          <Text style={styles.helpText}>
            First select parent sectors. After selecting a parent sector, choose
            the related business / activity under it.
          </Text>

          {TRAINING_SECTORS.map(({ parent, children }) => {
            const parentSelected = selectedTrainingParents.includes(parent);
            const kidsState = trainingChildrenByParent[parent] || {};
            const hasOthersChild = children.includes('Others');
            return (
              <View key={parent} style={{ marginTop: 10 }}>
                <CheckboxRow
                  label={parent}
                  checked={parentSelected}
                  onPress={() => toggleTrainingParent(parent)}
                />
                {parentSelected && (
                  <View style={{ marginLeft: 16, marginTop: 4 }}>
                    {children.map((child) => {
                      if (child === 'Others') {
                        return (
                          <View key={`${parent}-${child}`} style={{ marginTop: 6 }}>
                            <CheckboxRow
                              label="Others (Please specify)"
                              checked={!!kidsState['Others']}
                              onPress={() => toggleTrainingChild(parent, 'Others')}
                            />
                            {kidsState['Others'] && (
                              <TextInput
                                style={[styles.input, { marginTop: 4 }]}
                                placeholder="Please specify"
                                value={kidsState.__otherText || ''}
                                onChangeText={(txt) =>
                                  setTrainingOtherChildText(parent, txt)
                                }
                              />
                            )}
                          </View>
                        );
                      }
                      return (
                        <CheckboxRow
                          key={`${parent}-${child}`}
                          label={child}
                          checked={!!kidsState[child]}
                          onPress={() => toggleTrainingChild(parent, child)}
                        />
                      );
                    })}
                    {parent === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginTop: 4 }]}
                        placeholder="Please specify sub-sector"
                        value={kidsState.__otherText || ''}
                        onChangeText={(txt) =>
                          setTrainingOtherChildText(parent, txt)
                        }
                      />
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {/* Duration */}
          <Text style={[styles.label, { marginTop: 12 }]}>
            How many days of training are you comfortable with?
          </Text>
          {[
            'Under 7 days',
            '7 days',
            '15 days',
            '30 days',
            'Over 30 days',
          ].map((opt) => (
            <CheckboxRow
              key={opt}
              label={opt}
              checked={trainingDuration === opt}
              onPress={() => setTrainingDuration(opt)}
            />
          ))}

          {/* Training location */}
          <Text style={[styles.label, { marginTop: 12 }]}>
            What is your preferred training location?
          </Text>
          <Text style={styles.helpText}>
            Please fill your preferred State, District and Block.
          </Text>

          <Text style={[styles.smallLabel, { marginTop: 4 }]}>State</Text>
          <TextInput
            style={styles.input}
            value={trainingLocationState}
            onChangeText={setTrainingLocationState}
            placeholder="Please enter State"
          />
          <Text style={[styles.smallLabel, { marginTop: 8 }]}>District</Text>
          <TextInput
            style={styles.input}
            value={trainingLocationDistrict}
            onChangeText={setTrainingLocationDistrict}
            placeholder="Please enter District"
          />
          <Text style={[styles.smallLabel, { marginTop: 8 }]}>Block</Text>
          <TextInput
            style={styles.input}
            value={trainingLocationBlock}
            onChangeText={setTrainingLocationBlock}
            placeholder="Please enter Block"
          />

          {/* Expected income after training */}
          <Text style={[styles.label, { marginTop: 12 }]}>
            What is your expected Salary after training?
          </Text>
          {[
            'Under 10,000',
            '10,000 - 20,000',
            '20,000 - 30,000',
            'Above 30,000',
          ].map((opt) => (
            <CheckboxRow
              key={opt}
              label={opt}
              checked={trainingExpectedIncome === opt}
              onPress={() => setTrainingExpectedIncome(opt)}
            />
          ))}
        </>
      )}

      {/* Q4: future_willing */}
      <Text style={styles.sectionHeading}>Future Plans</Text>
      <Text style={styles.label}>
        Are you willing to start a business in future?
      </Text>
      <YesNoToggle
        value={futureWillingYesNo}
        onChange={setFutureWillingYesNo}
      />

      {/* Q5: CIF */}
      <Text style={styles.sectionHeading}>CIF Details</Text>
      <Text style={styles.label}>Has your SHG received CIF Funds?</Text>
      <YesNoToggle
        value={hasShgCifYesNo}
        onChange={setHasShgCifYesNo}
      />
      {hasShgCifYesNo === 'Yes' && (
        <>
          <Text style={[styles.label, { marginTop: 8 }]}>
            Please specify the amount of financial assistance your SHG received
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter CIF amount"
            value={cifAmount}
            onChangeText={setCifAmount}
          />
        </>
      )}

      {/* Submit button */}
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

// ========= Styles =========

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
    marginTop: 6,
    marginBottom: 4,
  },
  smallLabel: {
    fontSize: 13,
    color: '#555555',
  },
  helpText: {
    fontSize: 12,
    color: '#777',
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
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 4,
    marginRight: 8,
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
  smallBtn: {
    backgroundColor: '#EEE',
    padding: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
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
});
