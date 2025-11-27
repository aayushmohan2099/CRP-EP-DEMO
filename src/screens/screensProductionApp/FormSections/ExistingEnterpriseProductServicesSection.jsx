// src/screens/screensProductionApp/FormSections/ExistingEnterpriseProductServicesSection.jsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';

const PRODUCT_TYPE_OPTIONS = [
  'Food Products',
  'Handicrafts & Artisan Products',
  'Textiles & Apparel Products',
  'Agriculture & Allied Products',
  'Dairy Products',
  'Animal Products',
  'Beauty, Wellness & Personal Products',
  'Cleaning & Hygiene Products',
  'Packaging Utility Products',
  'Digital Service Products',
  'Others',
];

const RAW_MATERIAL_OPTIONS = [
  'Grains / Cereals',
  'Pulses',
  'Vegetables / Fruits',
  'Spices & Condiments',
  'Milk & Milk Products',
  'Packaging Material',
  'Chemicals / Cleaning Agents',
  'Fabric / Textile',
  'Wood / Bamboo / Cane',
  'Others',
];

const MACHINERY_OPTIONS = [
  'Mixer / Grinder',
  'Sealing Machine',
  'Oven / Baking Unit',
  'Packing Machine',
  'Stitching / Sewing Machine',
  'Grinding / Milling Machine',
  'Cutting / Chopping Machine',
  'Printing / Labelling Machine',
  'Others',
];

const TARGET_CUSTOMERS_OPTIONS = [
  'Local consumers',
  'Shopkeepers and market sellers',
  'Urban consumers',
  'Online customers',
  'Institutional buyers',
  'Others',
];

const SALES_AREA_OPTIONS = [
  'In my State',
  'In my District',
  'In my Panchayat',
  'In my Village',
  'In my Local Area',
];

const MARKETING_STRATEGY_OPTIONS = [
  'Word of Mouth / Door-to-Door Selling',
  'Selling in Local Markets (Haat/Bazaar)',
  'Using SHG Networks for Promotion',
  'Display Boards or Posters Near Shop/Workplace',
  'Others',
];

const MARKETING_CHANNEL_OPTIONS = [
  'Retail',
  'Online',
  'Exhibition',
  'Others',
];

const MARKETING_CHALLENGE_OPTIONS = [
  'Do you face difficulty finding buyers outside your village?',
  'Does lack of transport stop you from selling more?',
  'Is limited knowledge of digital tools a barrier for marketing?',
  'Do you find it hard to get loans or money for your business?',
  'Are middlemen reducing your profits when selling products?',
  'Others',
];

const MARKET_LINKAGE_OPTIONS = [
  'Amazon',
  'Flipkart',
  'Local Retail Shops / Kirana Stores',
  'Exhibition',
  'Wholesale Market (Mandi)',
  'Others',
];

const YES_NO = ['Yes', 'No'];

// -------- helpers to handle comma-separated multi-select values --------
const splitMulti = (val) =>
  (val || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const joinMulti = (arr) =>
  Array.isArray(arr) ? arr.filter(Boolean).join(', ') : '';

const toggleInCommaString = (current, option) => {
  const arr = splitMulti(current);
  if (arr.includes(option)) {
    return joinMulti(arr.filter((i) => i !== option));
  }
  return joinMulti([...arr, option]);
};

export default function ExistingEnterpriseProductServicesSection({
  existingForm,
  setExistingForm,
}) {
  const products = Array.isArray(existingForm.products)
    ? existingForm.products
    : [];

  const updateProducts = (next) => {
    setExistingForm({ products: next });
  };

  const addProductRow = () => {
    const newRow = {
      id: Date.now().toString(),
      title: 'New Product Detail',
      expanded: true,
      main_product_name: '',
      activity_or_product_type: '',
      product_features: '',
      production_capacity: '',
      raw_material: '',
      raw_material_other: '',
      machinery_equipment: '',
      machinery_equipment_other: '',
      target_customers: '',
      target_customers_other: '',
      sales_area: '',
      packaging_branding_status: '',
      marketing_strategy: '',
      marketing_strategy_other: '',
      marketing_channels: '',
      marketing_channels_other: '',
      marketing_challenges: '',
      marketing_challenges_other: '',
      market_linkage: '',
      market_linkage_other: '',
      accept_digital_payment: '',
      avg_monthly_sales: '',
      media: {
        open_box: [],
        close_box: [],
        others: [],
      },
    };
    updateProducts([...products, newRow]);
  };

  const removeProductRow = (index) => {
    const next = products.filter((_, i) => i !== index);
    updateProducts(next);
  };

  const updateRow = (index, patch) => {
    const next = products.map((row, i) =>
      i === index ? { ...row, ...patch } : row
    );
    updateProducts(next);
  };

  const toggleExpand = (index) => {
    const row = products[index];
    updateRow(index, { expanded: !row.expanded });
  };

  const onChangeMainProductName = (index, value) => {
    updateRow(index, {
      main_product_name: value,
      title: value || 'New Product Detail',
    });
  };

  const pickMediaForRow = async (index, typeKey) => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 3,
      });

      if (res.didCancel) return;
      const assets = res.assets || [];
      const row = products[index];
      const currentMedia = row.media || { open_box: [], close_box: [], others: [] };

      const nextMedia = {
        ...currentMedia,
        [typeKey]: assets.slice(0, 3), // ensure max 3
      };

      updateRow(index, { media: nextMedia });
    } catch (err) {
      console.warn('Media pick failed', err);
    }
  };

  const renderYesNo = (current, onChange) => (
    <View style={styles.yesNoRow}>
      {YES_NO.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.yesNoBtn,
            current === opt && styles.yesNoBtnActive,
          ]}
          onPress={() => onChange(opt)}
        >
          <Text
            style={[
              styles.yesNoText,
              current === opt && styles.yesNoTextActive,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMultiCheckboxRow = (currentValue, option, onChange) => {
    const selected = splitMulti(currentValue);
    const isChecked = selected.includes(option);
    return (
      <TouchableOpacity
        key={option}
        style={styles.checkboxRow}
        onPress={() => onChange(toggleInCommaString(currentValue, option))}
      >
        <Text style={styles.checkboxIcon}>{isChecked ? '☑' : '☐'}</Text>
        <Text style={styles.checkboxLabel}>{option}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>2) Product and Services Section</Text>

      <Text style={styles.helpText}>
        Please add each product separately. You can add multiple products using the
        "+" button below. Each row can be expanded to fill detailed information.
      </Text>

      {products.map((row, index) => (
        <View key={row.id || index} style={styles.card}>
          {/* Header row with title, expand and delete */}
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => toggleExpand(index)}
          >
            <Text style={styles.cardTitle}>{row.title || 'New Product Detail'}</Text>
            <Text style={styles.cardToggle}>{row.expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          <View style={styles.cardHeaderBottom}>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeProductRow(index)}
            >
              <Text style={styles.removeBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>

          {row.expanded && (
            <View style={styles.cardBody}>
              {/* 1) Product Name */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>1) What is the name of your Product?</Text>
                <Text style={styles.helpText}>
                  Please type the full name of this product as you sell it.
                </Text>
                <TextInput
                  style={styles.input}
                  value={row.main_product_name || ''}
                  onChangeText={(v) => onChangeMainProductName(index, v)}
                />
              </View>

              {/* 2) Product Type */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>2) What is the type of your Product?</Text>
                <Text style={styles.helpText}>
                  Please choose the category that best describes this product.
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={row.activity_or_product_type || ''}
                    onValueChange={(v) =>
                      updateRow(index, { activity_or_product_type: v })
                    }
                  >
                    <Picker.Item label="Select..." value="" />
                    {PRODUCT_TYPE_OPTIONS.map((opt) => (
                      <Picker.Item key={opt} label={opt} value={opt} />
                    ))}
                  </Picker>
                </View>
                {row.activity_or_product_type === 'Others' && (
                  <TextInput
                    style={[styles.input, { marginTop: 6 }]}
                    placeholder="Please specify other product type"
                    value={row.product_type_other || ''}
                    onChangeText={(v) =>
                      updateRow(index, { product_type_other: v })
                    }
                  />
                )}
              </View>

              {/* 3) Product Features */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  3) Please specify the features of your Product in brief
                </Text>
                <Text style={styles.helpText}>
                  Please describe what makes this product special (taste, design,
                  quality, etc.).
                </Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  multiline
                  value={row.product_features || ''}
                  onChangeText={(v) => updateRow(index, { product_features: v })}
                />
              </View>

              {/* 4) Production Capacity */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  4) What is your Enterprise&apos;s Production Capacity for this product in a month?
                </Text>
                <Text style={styles.helpText}>
                  Please enter how much you can produce in one month (with units, e.g. kg,
                  pieces, litres).
                </Text>
                <TextInput
                  style={styles.input}
                  value={row.production_capacity || ''}
                  onChangeText={(v) => updateRow(index, { production_capacity: v })}
                />
              </View>

              {/* 5) Raw Materials (multi-select + others) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  5) Please Specify What Raw Materials are you using for this Product
                </Text>
                <Text style={styles.helpText}>
                  Please select all raw materials used. You can also type any other
                  raw materials in the box below.
                </Text>
                {RAW_MATERIAL_OPTIONS.map((opt) =>
                  renderMultiCheckboxRow(
                    row.raw_material,
                    opt,
                    (val) => updateRow(index, { raw_material: val })
                  )
                )}
                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder="If Others, please specify (comma separated if multiple)"
                  value={row.raw_material_other || ''}
                  onChangeText={(v) => updateRow(index, { raw_material_other: v })}
                />
              </View>

              {/* 6) Machinery / Equipment */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  6) Please Specify What Machinery Equipment are you using for this Product
                </Text>
                <Text style={styles.helpText}>
                  Please select all machines/equipment used. You can also type other
                  machinery in the box below.
                </Text>
                {MACHINERY_OPTIONS.map((opt) =>
                  renderMultiCheckboxRow(
                    row.machinery_equipment,
                    opt,
                    (val) => updateRow(index, { machinery_equipment: val })
                  )
                )}
                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder="If Others, please specify (comma separated if multiple)"
                  value={row.machinery_equipment_other || ''}
                  onChangeText={(v) =>
                    updateRow(index, { machinery_equipment_other: v })
                  }
                />
              </View>

              {/* 7) Target Customers (multi-select) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  7) What kind of customers do you aim to Target for your product?
                </Text>
                <Text style={styles.helpText}>
                  Please select all types of customers you mainly sell or want to sell to.
                </Text>
                {TARGET_CUSTOMERS_OPTIONS.map((opt) =>
                  renderMultiCheckboxRow(
                    row.target_customers,
                    opt,
                    (val) => updateRow(index, { target_customers: val })
                  )
                )}
                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder="If Others, please specify (comma separated if multiple)"
                  value={row.target_customers_other || ''}
                  onChangeText={(v) =>
                    updateRow(index, { target_customers_other: v })
                  }
                />
              </View>

              {/* 8) Sales Area */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  8) What is your common Sales Area for your Product?
                </Text>
                <Text style={styles.helpText}>
                  Please select the area where you mostly sell this product.
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={row.sales_area || ''}
                    onValueChange={(v) => updateRow(index, { sales_area: v })}
                  >
                    <Picker.Item label="Select..." value="" />
                    {SALES_AREA_OPTIONS.map((opt) => (
                      <Picker.Item key={opt} label={opt} value={opt} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* 9) Packaging / Branding */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  9) Is your Product Branded and packaged?
                </Text>
                <Text style={styles.helpText}>
                  Please select Yes if your product has a printed name/logo and proper
                  packaging.
                </Text>
                {renderYesNo(row.packaging_branding_status, (val) =>
                  updateRow(index, { packaging_branding_status: val })
                )}
              </View>

              {/* 10) Marketing Strategy (multi-select) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  10) What Marketing Strategies do you use for this Product?
                </Text>
                <Text style={styles.helpText}>
                  Please select all ways you promote or sell this product.
                </Text>
                {MARKETING_STRATEGY_OPTIONS.map((opt) =>
                  renderMultiCheckboxRow(
                    row.marketing_strategy,
                    opt,
                    (val) => updateRow(index, { marketing_strategy: val })
                  )
                )}
                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder="If Others, please specify"
                  value={row.marketing_strategy_other || ''}
                  onChangeText={(v) =>
                    updateRow(index, { marketing_strategy_other: v })
                  }
                />
              </View>

              {/* 11) Marketing Channels */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  11) What Marketing Channels do you use for this Product?
                </Text>
                <Text style={styles.helpText}>
                  Please select all channels you use to sell this product.
                </Text>
                {MARKETING_CHANNEL_OPTIONS.map((opt) =>
                  renderMultiCheckboxRow(
                    row.marketing_channels,
                    opt,
                    (val) => updateRow(index, { marketing_channels: val })
                  )
                )}
                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder="If Others, please specify"
                  value={row.marketing_channels_other || ''}
                  onChangeText={(v) =>
                    updateRow(index, { marketing_channels_other: v })
                  }
                />
              </View>

              {/* 12) Marketing Challenges */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  12) What Marketing Challenges do you face for this Product?
                </Text>
                <Text style={styles.helpText}>
                  Please select all challenges you regularly face while selling this product.
                </Text>
                {MARKETING_CHALLENGE_OPTIONS.map((opt) =>
                  renderMultiCheckboxRow(
                    row.marketing_challenges,
                    opt,
                    (val) => updateRow(index, { marketing_challenges: val })
                  )
                )}
                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder="If Others, please specify"
                  value={row.marketing_challenges_other || ''}
                  onChangeText={(v) =>
                    updateRow(index, { marketing_challenges_other: v })
                  }
                />
              </View>

              {/* 13) Market Linkages */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  13) Please specify the Market Linkages for this Product
                </Text>
                <Text style={styles.helpText}>
                  Please select all platforms or markets through which you are selling.
                </Text>
                {MARKET_LINKAGE_OPTIONS.map((opt) =>
                  renderMultiCheckboxRow(
                    row.market_linkage,
                    opt,
                    (val) => updateRow(index, { market_linkage: val })
                  )
                )}
                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder="If Others, please specify"
                  value={row.market_linkage_other || ''}
                  onChangeText={(v) =>
                    updateRow(index, { market_linkage_other: v })
                  }
                />
              </View>

              {/* 14) Digital Payment */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  14) Do you accept Digital Payment for this Product?
                </Text>
                <Text style={styles.helpText}>
                  Please select Yes if you accept payments through UPI, card, wallet etc.
                </Text>
                {renderYesNo(row.accept_digital_payment, (val) =>
                  updateRow(index, { accept_digital_payment: val })
                )}
              </View>

              {/* 15) Average Monthly Sales */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  15) What are your Average Monthly Sale from this Product?
                </Text>
                <Text style={styles.helpText}>
                  Please enter your average income from this product per month (with units if needed).
                </Text>
                <TextInput
                  style={styles.input}
                  value={row.avg_monthly_sales || ''}
                  onChangeText={(v) =>
                    updateRow(index, { avg_monthly_sales: v })
                  }
                />
              </View>

              {/* 16) Product Photos – open / close / others */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  16) Please upload Pictures of your Product
                </Text>
                <Text style={[styles.helpText, { marginBottom: 8 }]}>
                  You can upload up to 3 files in each category. Files may be photos or PDFs. These will
                  be linked with this product and saved as enterprise media.
                </Text>

                {/* Open Box */}
                <View style={styles.mediaBlock}>
                  <Text style={styles.mediaLabel}>
                    With Open Box (1 compulsory, max 3)
                  </Text>
                  <TouchableOpacity
                    style={styles.mediaBtn}
                    onPress={() => pickMediaForRow(index, 'open_box')}
                  >
                    <Text style={styles.mediaBtnText}>Select Files</Text>
                  </TouchableOpacity>
                  {row.media?.open_box?.length > 0 && (
                    <Text style={styles.mediaInfo}>
                      Selected: {row.media.open_box.length} file(s)
                    </Text>
                  )}
                </View>

                {/* Close Box */}
                <View style={styles.mediaBlock}>
                  <Text style={styles.mediaLabel}>
                    With Closed Box (1 compulsory, max 3)
                  </Text>
                  <TouchableOpacity
                    style={styles.mediaBtn}
                    onPress={() => pickMediaForRow(index, 'close_box')}
                  >
                    <Text style={styles.mediaBtnText}>Select Files</Text>
                  </TouchableOpacity>
                  {row.media?.close_box?.length > 0 && (
                    <Text style={styles.mediaInfo}>
                      Selected: {row.media.close_box.length} file(s)
                    </Text>
                  )}
                </View>

                {/* Others */}
                <View style={styles.mediaBlock}>
                  <Text style={styles.mediaLabel}>
                    Others (1 compulsory, max 3)
                  </Text>
                  <TouchableOpacity
                    style={styles.mediaBtn}
                    onPress={() => pickMediaForRow(index, 'others')}
                  >
                    <Text style={styles.mediaBtnText}>Select Files</Text>
                  </TouchableOpacity>
                  {row.media?.others?.length > 0 && (
                    <Text style={styles.mediaInfo}>
                      Selected: {row.media.others.length} file(s)
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={addProductRow}>
        <Text style={styles.addBtnText}>+ Add Product Detail</Text>
      </TouchableOpacity>
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
    marginBottom: 8,
    color: '#222',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: '#fafafa',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },
  cardToggle: {
    fontSize: 16,
    marginLeft: 8,
  },
  cardBody: {
    marginTop: 8,
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f3d0d0',
    borderRadius: 6,
  },
  removeBtnText: {
    fontSize: 12,
    color: '#a03333',
    fontWeight: '600',
  },
  fieldBlock: {
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
  },
  yesNoRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  yesNoBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  yesNoBtnActive: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
  },
  yesNoText: {
    fontSize: 14,
    color: '#333',
  },
  yesNoTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  checkboxIcon: {
    width: 20,
    fontSize: 16,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#444',
  },
  mediaBlock: {
    marginTop: 8,
  },
  mediaLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  mediaBtn: {
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  mediaBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  mediaInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2b7',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#2b7',
    fontWeight: '700',
    fontSize: 14,
  },
});
