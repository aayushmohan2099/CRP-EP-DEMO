// src/screens/screensProductionApp/FormSections/ExistingEnterpriseBasicInfoSection.jsx
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,AppState,  } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import LicenseSelector from './BasicInformationSectionLicenseSelector'
const ENTERPRISE_TYPE_TREE = [
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
      'Jaggery Production',
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
      'Mobile recharge shop / bill payment kiosk',
      'Jan Aushadhi/Medical Store',
      'PET shop and disposable alternatives distribution​',
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
    parent: 'FMCG',
    children: [
      'Handwash',
      'Soap',
      'Floor Cleaner',
      'Detergents',
      'Air fresheners',
      'Face wash & creams',
      'Shampoo & conditioner',
      'Sponges',
      'Toothpaste & toothbrushes',
      'Broom',
      'Others',
    ],
  },
   {
    parent: 'Transport',
    children: [
      'Loader',
      'E-Rikshaw',
      'Taxi',
      'Auto',
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
    parent: 'Prerna Canteen',
    children: [
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
  {
  parent: 'EDP|Entrepreneurship Development Programme',
   children: [
   ],
  },
  {
    parent: 'Other​',
    children: ['Others'],
  },
];
const OWNERSHIP_OPTIONS = [
  { label: 'Individual', value: 'Individual' },
  { label: 'Partnership', value: 'Partnership' },
  { label: 'SHG-based enterprise', value: 'SHG-based enterprise' },
  { label: 'Family-run enterprise', value: 'Family-run enterprise' },
  { label: 'Others', value: 'Others' },
];

const EnterpriseTypeTree = ({ value, onChange }) => {
  const selectedTree = Array.isArray(value) ? value : [];

  const toggleParent = (parent) => {
    const exists = selectedTree.find((row) => row.parent === parent);
    let updated;
    if (exists) {
      updated = selectedTree.filter((row) => row.parent !== parent);
    } else {
      updated = [...selectedTree, { parent, children: [], parentOtherText: '' }];
    }
    onChange(updated);
  };

  const toggleChild = (parent, child) => {
    const existing = selectedTree.find((row) => row.parent === parent);
    let updated = [...selectedTree];
    if (!existing) {
      updated.push({ parent, children: [child], childOtherText: {} });
    } else {
      const children = existing.children || [];
      const has = children.includes(child);
      const newChildren = has
        ? children.filter((c) => c !== child)
        : [...children, child];
      updated = updated.map((row) =>
        row.parent === parent ? { ...row, children: newChildren } : row
      );
    }
    onChange(updated);
  };

  const isParentSelected = (parent) =>
    !!selectedTree.find((row) => row.parent === parent);

  const isChildSelected = (parent, child) => {
    const row = selectedTree.find((r) => r.parent === parent);
    return !!row && row.children?.includes(child);
  };

  const updateParentOtherText = (parent, text) => {
    const updated = selectedTree.map((row) =>
      row.parent === parent ? { ...row, parentOtherText: text } : row
    );
    onChange(updated);
  };

  const updateChildOtherText = (parent, child, text) => {
    const updated = selectedTree.map((row) => {
      if (row.parent === parent) {
        return {
          ...row,
          childOtherText: { ...(row.childOtherText || {}), [child]: text },
        };
      }
      return row;
    });
    onChange(updated);
  };

  return (
    <View style={{ marginTop: 8 }}>
      {ENTERPRISE_TYPE_TREE.map((group) => {
        const parentSelected = isParentSelected(group.parent);
        const rowData = selectedTree.find((r) => r.parent === group.parent) || {};
        return (
          <View
            key={group.parent}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 8,
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => toggleParent(group.parent)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', flex: 1 }}>{group.parent}</Text>
              <Text>{parentSelected ? '☑' : '☐'}</Text>
            </TouchableOpacity>

            {parentSelected && (
              <View style={{ marginTop: 8, paddingLeft: 8 }}>
                {group.children.map((child) => (
                  <View key={child}>
                    <TouchableOpacity
                      onPress={() => toggleChild(group.parent, child)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ marginRight: 6 }}>
                        {isChildSelected(group.parent, child) ? '☑' : '☐'}
                      </Text>
                      <Text style={{ flex: 1 }}>{child}</Text>
                    </TouchableOpacity>

                    {/* Child "Others → Specify" field */}
                    {isChildSelected(group.parent, child) && child === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginBottom: 6, marginLeft: 20 }]}
                        placeholder="Please specify"
                        value={(rowData.childOtherText && rowData.childOtherText[child]) || ''}
                        onChangeText={(text) => updateChildOtherText(group.parent, child, text)}
                      />
                    )}
                  </View>
                ))}

                {/* Parent "Others → Specify" field */}
                
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};
// const BASIC_INFO_DRAFT_KEY = 'EXISTING_ENTERPRISE_BASIC_INFO_DRAFT';
export default function ExistingEnterpriseBasicInfoSection({ existingForm, setExistingForm }) {
const { language } = useContext(LanguageContext);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
//  const [draftLoaded, setDraftLoaded] = useState(false); // ADDED
  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  const yearOptions = [];
  for (let y = currentYear; y >= startYear; y--) yearOptions.push(y.toString());

 
  //    useEffect(() => {
  //   const loadDraft = async () => {
  //     try {
  //       const saved = await AsyncStorage.getItem(BASIC_INFO_DRAFT_KEY);
  //       if (saved) {
  //         setExistingForm(JSON.parse(saved)); //  FIXED
  //       }
  //     } catch (e) {
  //       console.log('Draft load failed', e);
  //     } finally {
  //       setDraftLoaded(true); // ADDED
  //     }
  //   };

  //   loadDraft();
  // }, []); // CHANGED (removed dependency on setExistingForm)

  /* =====================================================
     FIX 2: Auto-save ONLY AFTER draft is loaded
  ===================================================== */
  // useEffect(() => {
  //   if (!draftLoaded) return; // CRITICAL FIX

  //   AsyncStorage.setItem(
  //     BASIC_INFO_DRAFT_KEY,
  //     JSON.stringify(existingForm)
  //   );
  // }, [existingForm, draftLoaded]); // CHANGED

  /* =====================================================
     FIX 3: Save draft when app goes background
  ===================================================== */
  // useEffect(() => {
  //   const sub = AppState.addEventListener('change', state => {
  //     if (state !== 'active' && draftLoaded) {
  //       AsyncStorage.setItem(
  //         BASIC_INFO_DRAFT_KEY,
  //         JSON.stringify(existingForm)
  //       );
  //     }
  //   });

  //   return () => sub.remove();
  // }, [existingForm, draftLoaded]); //  CHANGED

  /* =====================================================
      FIX 4: PATCH update (NO functional updater)
  ===================================================== */
  const update = (patch) => setExistingForm(patch); // CORRECT
  return (
    <View style={styles.sectionContainer}>
    <View
  style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  }}
>
  <Text style={styles.sectionTitle}>
    {language === 'hi' ? '1) बुनियादी जानकारी' : '1) Basic Information'}
  </Text>

  <LanguageToggle />
</View>
      {/* Enterprise Name */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}> {language === 'hi'
      ? 'आपके उद्यम का नाम क्या है?'
      : 'What is the name of your Enterprise?'}</Text>
        <Text style={styles.helpText}>
          Please type the full name of your enterprise as you use it in daily work.
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.enterprise_name || ''}
          onChangeText={(v) => update({ enterprise_name: v })}
        />
      </View>

      {/* Enterprise Type */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>What is the type of your Enterprise?</Text>
        <Text style={styles.helpText}>
          Please select all relevant sectors and sub-categories. You can choose more than one.
        </Text>
        <EnterpriseTypeTree
          value={existingForm.enterprise_types_tree || []}
          onChange={(tree) => update({ enterprise_types_tree: tree })}
        />
      </View>

      {/* Ownership type */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>What is your Enterprise Ownership type?</Text>
        <Text style={styles.helpText}>
          Please select who owns this enterprise. If not sure, choose Others and specify.
        </Text>
        <View style={[styles.input, { paddingHorizontal: 0, paddingVertical: 0 }]}>
          <Picker
               selectedValue={existingForm.ownership_type || ''}
            onValueChange={(v) => update({ ownership_type: v })}
          >
            <Picker.Item label="Select..." value="" />
            {OWNERSHIP_OPTIONS.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
        {existingForm.ownership_type === 'Others' && (
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder="Please specify"
            value={existingForm.ownership_type_other || ''}
            onChangeText={(v) => update({ ownership_type_other: v })}
          />
        )}
      </View>

      {/* Special category */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          Please specify your special category (If applicable)
        </Text>
        <Text style={styles.helpText}>
          Please mention if you belong to any special category (e.g., widow, PwD, etc.).
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.owner_special_category || ''}
          onChangeText={(v) => update({ owner_special_category: v })}
        />
      </View> */}

      {/* Year of establishment */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Which year was your Enterprise established in?</Text>
        <Text style={styles.helpText}>
          Please select the year when you started this enterprise. If unsure, give your best estimate.
        </Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setYearPickerVisible(true)}
        >
          <Text>{existingForm.year_of_establishment || 'Select Year'}</Text>
        </TouchableOpacity>

        <Modal visible={yearPickerVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 8 }}>
                Select Year of Establishment
              </Text>
              <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6 }}>
                <Picker
                  selectedValue={existingForm.year_of_establishment || ''}
                  onValueChange={(val) => {
                    update({ year_of_establishment: val });
                    setYearPickerVisible(false);
                  }}
                >
                  <Picker.Item label="Select..." value="" />
                  {yearOptions.map((y) => (
                    <Picker.Item key={y} label={y} value={y} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setYearPickerVisible(false)}
              >
                <Text style={{ color: '#EE6969', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      <View><LicenseSelector/></View>
        
      {/* UDDYAM AADHAR */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>Please Specify the correct UDDYAM AADHAR NUMBER (If any)</Text>
        <Text style={styles.helpText}>
          Please enter the Udyam Aadhar Number carefully. This will be used for verification.
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.uddyam_aadhar || ''}
          onChangeText={(v) => update({ uddyam_aadhar: v })}
        />
      </View> */}

      {/* Total employees */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>What are the total number of employees working under your Enterprise?</Text>
        <Text style={styles.helpText}>
          Please enter the total number of people working in your enterprise. If none, please enter 0.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(existingForm.total_emp || '')}
          onChangeText={(v) => update({ total_emp: v })}
        />
      </View>

      {/* SHG employees */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Are there any SHG members working under your Enterprise?</Text>
        <Text style={styles.helpText}>
          Please enter the number of SHG members working here. If none, please enter 0.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(existingForm.number_of_shg_emp || '')}
          onChangeText={(v) => update({ number_of_shg_emp: v })}
        />
      </View>
      {/* Special category */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          Please specify your special category (If applicable)
        </Text>
        <Text style={styles.helpText}>
          Please mention if you belong to any special category (e.g., widow, PwD, etc.).
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.owner_special_category || ''}
          onChangeText={(v) => update({ owner_special_category: v })}
        />
      </View> */}


      {/* cadre selection */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>Are you involved in any cadre activity?</Text>
  <Text style={styles.helpText}>Select your cadre activity</Text>

  {[
    'Lakhpati CRP',
'Krishi Ajeevika Sakhi',
'Krishi Udyog Sakhi', 
'Mahila Kisan',
'CRP- EP',
'BC sakhi',
'Vidyut Sakhi',
'Bank Sakhi',
'Fnhw Swasth sakhi',
'THR/Dry ration worker',
'Samuh Sakhi',
'MGNREGA MATE',
    'Other',
  ].map((opt) => {
    const selected =
      Array.isArray(existingForm.owner_cadre_activity) &&
      existingForm.owner_cadre_activity.includes(opt);

    return (
      <TouchableOpacity
        key={opt}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
        onPress={() => {
          let updated = [...(existingForm.owner_cadre_activity || [])];

          if (selected) {
            // remove
            updated = updated.filter((i) => i !== opt);
          } else {
            // add
            updated.push(opt);
          }

          update({ owner_cadre_activity: updated });
        }}
      >
        <View
          style={[
            styles.checkbox,
            selected && styles.checkboxChecked,
          ]}
        />
        <Text style={{ marginLeft: 8 }}>{opt}</Text>
      </TouchableOpacity>
    );
  })}

  {/* If "Other" selected → show textbox */}
  {existingForm.owner_cadre_activity?.includes('Other') && (
    <TextInput
      style={[styles.input, { marginTop: 6 }]}
      placeholder="Please specify"
      value={existingForm.owner_cadre_activity_other || ''}
      onChangeText={(v) =>
        update({ owner_cadre_activity_other: v })
      }
    />
  )}
</View>

 {/* Designation in your SHG */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>What is your designation in your SHG?</Text>
  <Text style={styles.helpText}>Select your designation</Text>

  {[
    'President',
    'Secretary',
    'Treasurer',
    'Book-Keeper',
    'Member',
  ].map((opt) => {
    const selected =
      Array.isArray(existingForm.owner_designation) &&
      existingForm.owner_designation.includes(opt);

    return (
      <TouchableOpacity
        key={opt}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
        onPress={() => {
          let updated = [...(existingForm.owner_designation || [])];

          if (selected) {
            // remove
            updated = updated.filter((i) => i !== opt);
          } else {
            // add
            updated.push(opt);
          }

          update({ owner_designation: updated });
        }}
      >
        <View
          style={[
            styles.checkbox,
            selected && styles.checkboxChecked,
          ]}
        />
        <Text style={{ marginLeft: 8 }}>{opt}</Text>
      </TouchableOpacity>
    );
  })}
</View>


      {/* Special category */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>Please specify your special category (If applicable)</Text>
  <Text style={styles.helpText}>
    Select if you belong to any special category. This is optional.
  </Text>

  {['Divyang', 'Widow', 'Unmarried', 'Other'].map((opt) => (
    <TouchableOpacity
      key={opt}
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
      onPress={() => update({ owner_special_category: opt })}
    >
      <View
        style={[
          styles.checkbox,
          existingForm.owner_special_category === opt && styles.checkboxChecked,
        ]}
      />
      <Text style={{ marginLeft: 8 }}>{opt}</Text>
    </TouchableOpacity>
  ))}

  {/* if user selects Other → show textbox */}
  {existingForm.owner_special_category === 'Other' && (
    <TextInput
      style={[styles.input, { marginTop: 6 }]}
      placeholder="Please specify"
      value={existingForm.owner_special_category_other || ''}
      onChangeText={(v) => update({ owner_special_category_other: v })}
    />
  )}
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#222' },
  fieldBlock: { marginBottom: 12 },
  label: { fontWeight: 'bold', marginBottom: 4, color: '#333' },
  helpText: { fontSize: 12, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgyba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 16, borderRadius: 8, backgroundColor: '#fff' },
  cancelBtn: { marginTop: 12, alignSelf: 'flex-end' },
  checkbox: {
  width: 18,
  height: 18,
  borderWidth: 1,
  borderColor: '#444',
  borderRadius: 3,
},
checkboxChecked: {
  backgroundColor: '#EE6969',
},

});
