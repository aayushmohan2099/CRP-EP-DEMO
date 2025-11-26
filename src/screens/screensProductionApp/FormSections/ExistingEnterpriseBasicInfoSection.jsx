// src/screens/epsakhi/ExistingEnterpriseBasicInfoSection.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

/**
 * Parent–child multiselect for Enterprise Type, using the tree you specified.
 */
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
  {
    parent: 'Other parent category​',
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
      updated = [...selectedTree, { parent, children: [] }];
    }
    onChange(updated);
  };

  const toggleChild = (parent, child) => {
    const existing = selectedTree.find((row) => row.parent === parent);
    let updated = [...selectedTree];
    if (!existing) {
      updated.push({ parent, children: [child] });
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

  return (
    <View style={{ marginTop: 8 }}>
      {ENTERPRISE_TYPE_TREE.map((group) => {
        const parentSelected = isParentSelected(group.parent);
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
                  <TouchableOpacity
                    key={child}
                    onPress={() => toggleChild(group.parent, child)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
                  >
                    <Text style={{ marginRight: 6 }}>
                      {isChildSelected(group.parent, child) ? '☑' : '☐'}
                    </Text>
                    <Text style={{ flex: 1 }}>{child}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default function ExistingEnterpriseBasicInfoSection({
  existingForm,
  setExistingForm,
}) {
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  const yearOptions = [];
  for (let y = currentYear; y >= startYear; y--) yearOptions.push(y.toString());

  const update = (patch) => setExistingForm(patch);

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>1) Basic Information</Text>

      {/* 1) Enterprise Name */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>What is the name of your Enterprise?</Text>
        <Text style={styles.helpText}>
          Please type the full name of your enterprise as you use it in daily work.
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.enterprise_name || ''}
          onChangeText={(v) => update({ enterprise_name: v })}
        />
      </View>

      {/* 2) Enterprise Type – tree multiselect */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>What is the type of your Enterprise?</Text>
        <Text style={styles.helpText}>
          Please select all relevant sectors and sub-categories. You can choose more than one.
        </Text>
        <EnterpriseTypeTree
          value={existingForm.enterprise_types_tree}
          onChange={(tree) => update({ enterprise_types_tree: tree })}
        />
      </View>

      {/* 3) Ownership type */}
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

      {/* 4) Special category */}
      <View style={styles.fieldBlock}>
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
      </View>

      {/* 5) Year of establishment – modal year picker */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          What year was your Enterprise established in?
        </Text>
        <Text style={styles.helpText}>
          Please select the year when you started this enterprise. If unsure, give your best
          estimate.
        </Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setYearPickerVisible(true)}
        >
          <Text>
            {existingForm.year_of_establishment || 'Select Year'}
          </Text>
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

      {/* 6) UDDYAM AADHAR */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          Please Specify the correct UDDYAM AADHAR NUMBER (If Applicable)
        </Text>
        <Text style={styles.helpText}>
          Please enter the Udyam Aadhar Number carefully. This will be used for verification.
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.uddyam_aadhar || ''}
          onChangeText={(v) => update({ uddyam_aadhar: v })}
        />
      </View>

      {/* 7) Total employees */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          What are the total number of employees working under your Enterprise?
        </Text>
        <Text style={styles.helpText}>
          Please enter the total number of people working in your enterprise. If none, please
          enter 0.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(existingForm.total_emp || '')}
          onChangeText={(v) => update({ total_emp: v })}
        />
      </View>

      {/* 8) SHG employees */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          Are there any SHG members working under your Enterprise?
        </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },
  fieldBlock: {
    marginBottom: 12,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cancelBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
});
