// // src/screens/screensProductionApp/FormSections/ExistingEnterpriseProductServicesSection.jsx
// import React from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   PermissionsAndroid,
//   Platform,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
// import { useState } from 'react';

// // Option Arrays
// const PRODUCT_TYPE_OPTIONS = [
//   'Food Products', 'Handicrafts & Artisan Products', 'Textiles & Apparel Products',
//   'Agriculture & Allied Products', 'Dairy Products', 'Animal Products',
//   'Beauty, Wellness & Personal Products', 'Cleaning & Hygiene Products',
//   'Packaging Utility Products', 'Digital Service Products', 'Others'
// ];
// const RAW_MATERIAL_OPTIONS = [
//   'Grains / Cereals', 'Pulses', 'Vegetables / Fruits', 'Spices & Condiments',
//   'Milk & Milk Products', 'Packaging Material', 'Chemicals / Cleaning Agents',
//   'Fabric / Textile', 'Wood / Bamboo / Cane', 'Others'
// ];
// const MACHINERY_OPTIONS = [
//   'Mixer / Grinder', 'Sealing Machine', 'Oven / Baking Unit', 'Packing Machine',
//   'Stitching / Sewing Machine', 'Grinding / Milling Machine', 'Cutting / Chopping Machine',
//   'Printing / Labelling Machine', 'Others'
// ];
// const TARGET_CUSTOMERS_OPTIONS = [
//   'Local consumers', 'Shopkeepers and market sellers', 'Urban consumers',
//   'Online customers', 'Institutional buyers', 'Others'
// ];
// const SALES_AREA_OPTIONS = [
// //  'In my Local Area','In my Village','In my Panchayat','In my District','In my State',
// 'Village', 'Block', 'District','State','Other State','Other Country'
// ];
// const MARKETING_STRATEGY_OPTIONS = [
//   'Word of Mouth / Door-to-Door Selling',
//   'Selling in Local Markets (Haat/Bazaar)',
//   'Using SHG Networks for Promotion',
//   'Display Boards or Posters Near Shop/Workplace',
//   'Others'
// ];
// const MARKETING_CHANNEL_OPTIONS = ['Retail', 'Online', 'Exhibition', 'ESARAS','ONDC','Others'];
// const MARKETING_CHALLENGE_OPTIONS = [
//   'Do you face difficulty finding buyers outside your village?',
//   'Is limited knowledge of digital tools a barrier for marketing?',
//   'Others'
// ];
// const MARKET_LINKAGE_OPTIONS = [
//   'Amazon', 'Flipkart', 'Local Retail Shops / Kirana Stores', 'Exhibition', 'Wholesale Market (Mandi)', 'Others'
// ];
// // ADDED:
// const CHANNEL_SUB_OPTIONS = {
//   Retail: ['Local Retail Shops / Kirana Stores', 'Others'],
//   Online: ['Amazon', 'Flipkart', 'Others'],
//   Exhibition: ['District SARAS', 'State SARAS', 'National SARAS', 'Others'],
//   ESARAS: ['Others'],
//   ONDC: ['Others'],
//   Others: ['Others'],
// };

// const CHANNEL_TO_LINKAGES = {
//   Retail: ['Local Retail Shops / Kirana Stores', 'Wholesale Market (Mandi)', 'Others'],
//   Online: ['Amazon', 'Flipkart', 'Others'],
//   Exhibition: ['Exhibition', 'Others'],
//   ESARAS: ['Others'],
//   ONDC: ['Others'],
//   Others: ['Others'],
// };
// const YES_NO = ['Yes', 'No'];

// // Helpers for multi-select
// const splitMulti = (val) => (val || '').split(',').map(v => v.trim()).filter(Boolean);
// const joinMulti = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join(', ') : '');
// const toggleInCommaString = (current, option) => {
//   const arr = splitMulti(current);
//   if (arr.includes(option)) return joinMulti(arr.filter(i => i !== option));
//   return joinMulti([...arr, option]);
// };

// export default function ExistingEnterpriseProductServicesSection({ existingForm, setExistingForm }) {
//   const products = Array.isArray(existingForm.products) ? existingForm.products : [];

//   const updateProducts = (next) => setExistingForm({ products: next });

//   const addProductRow = () => {
//     const newRow = {
//       id: Date.now().toString(),
//       title: 'New Product Detail',
//       expanded: true,
//       main_product_name: '',
//       activity_or_product_type: '',
//       product_type_other: '',
//       product_features: '',
//       production_capacity: '',
//       raw_material: '',
//       raw_material_other: '',
//       machinery_equipment: '',
//       machinery_equipment_other: '',
//       target_customers: '',
//       target_customers_other: '',
//       sales_area: '',
//       packaging_branding_status: '',
//       marketing_strategy: '',
//       marketing_strategy_other: '',
//       marketing_channels: '',
//       marketing_channels_other: '',
//       marketing_challenges: '',
//       marketing_challenges_other: '',
//       market_linkage: '',
//       market_linkage_other: '',
//       accept_digital_payment: '',
//       avg_monthly_sales: '',
//       media: { open_box: [], close_box: [], others: [] },
//     };
//     updateProducts([...products, newRow]);
//   };

//   const removeProductRow = (index) => updateProducts(products.filter((_, i) => i !== index));
//   const updateRow = (index, patch) => updateProducts(products.map((row, i) => (i === index ? { ...row, ...patch } : row)));
//   const toggleExpand = (index) => updateRow(index, { expanded: !products[index].expanded });
//   const onChangeMainProductName = (index, value) => updateRow(index, { main_product_name: value, title: value || 'New Product Detail' });

//   const requestCameraPermission = async () => {
//     if (Platform.OS === 'android') {
//       const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//     return true;
//   };

//   const pickMediaForRow = async (index, typeKey) => {
//     const res = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 3 });
//     if (!res.didCancel) updateRow(index, { media: { ...products[index].media, [typeKey]: res.assets?.slice(0, 3) || [] } });
//   };

//   const openCameraForRow = async (index, typeKey) => {
//     const hasPermission = await requestCameraPermission();
//     if (!hasPermission) return alert('Camera permission denied');
//     const res = await launchCamera({ mediaType: 'photo' });
//     if (!res.didCancel) updateRow(index, { media: { ...products[index].media, [typeKey]: res.assets?.slice(0, 3) || [] } });
//   };

//   const renderYesNo = (current, onChange) => (
//     <View style={styles.yesNoRow}>
//       {YES_NO.map(opt => (
//         <TouchableOpacity
//           key={opt}
//           style={[styles.yesNoBtn, current === opt && styles.yesNoBtnActive]}
//           onPress={() => onChange(opt)}
//         >
//           <Text style={[styles.yesNoText, current === opt && styles.yesNoTextActive]}>{opt}</Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );

//   const renderMultiCheckboxRow = (currentValue, option, onChange) => {
//     const selected = splitMulti(currentValue);
//     const isChecked = selected.includes(option);
//     return (
//       <TouchableOpacity key={option} style={styles.checkboxRow} onPress={() => onChange(toggleInCommaString(currentValue, option))}>
//         <Text style={styles.checkboxIcon}>{isChecked ? '☑' : '☐'}</Text>
//         <Text style={styles.checkboxLabel}>{option}</Text>
//       </TouchableOpacity>
//     );
//   };
  
//   const getAvailableLinkages = (marketingChannels) => {
//     const selectedChannels = splitMulti(marketingChannels);
//     if (!selectedChannels.length) return MARKET_LINKAGE_OPTIONS;

//     const set = new Set();
//     selectedChannels.forEach((ch) => {
//       const opts = CHANNEL_TO_LINKAGES[ch];
//       if (opts) opts.forEach((o) => set.add(o));
//     });
//     // fallback if nothing matched
//     if (set.size === 0) MARKET_LINKAGE_OPTIONS.forEach((o) => set.add(o));
//     return Array.from(set);
//   };

//   return (
//     <View style={styles.sectionContainer}>
//       <Text style={styles.sectionTitle}>Product and Services</Text>
//       <Text style={styles.helpText}>Add each product separately using the "+" button below.</Text>

//       {products.map((row, index) => (
//         <View key={row.id || index} style={styles.card}>
//           <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(index)}>
//             <Text style={styles.cardTitle}>{row.title}</Text>
//             <Text style={styles.cardToggle}>{row.expanded ? '▲' : '▼'}</Text>
//           </TouchableOpacity>

//           <View style={styles.cardHeaderBottom}>
//             <TouchableOpacity style={styles.removeBtn} onPress={() => removeProductRow(index)}>
//               <Text style={styles.removeBtnText}>Delete</Text>
//             </TouchableOpacity>
//           </View>

//           {row.expanded && (
//             <View style={styles.cardBody}>
//               {/* Q1 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>1) Product Name</Text>
//                 <TextInput style={styles.input} placeholder="Enter product name" value={row.main_product_name} onChangeText={v => onChangeMainProductName(index, v)} />
//               </View>

//               {/* Q2 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>2) Type of Product</Text>
//                 <View style={styles.pickerWrapper}>
//                   <Picker selectedValue={row.activity_or_product_type} onValueChange={v => updateRow(index, { activity_or_product_type: v })}>
//                     <Picker.Item label="Select..." value="" />
//                     {PRODUCT_TYPE_OPTIONS.map(opt => <Picker.Item key={opt} label={opt} value={opt} />)}
//                   </Picker>
//                 </View>
//                 {row.activity_or_product_type === 'Others' && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other type" value={row.product_type_other} onChangeText={v => updateRow(index, { product_type_other: v })} />}
//               </View>

//               {/* Q3 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>3) Describe Product Features (If any)</Text>
//                 <TextInput style={styles.input} placeholder="Describe your product" value={row.product_features} onChangeText={v => updateRow(index, { product_features: v })} />
//               </View>

//               {/* Q4 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>4) Production Capacity (Per Month)</Text>
//                 <TextInput style={styles.input} placeholder="Enter production capacity" value={row.production_capacity} onChangeText={v => updateRow(index, { production_capacity: v })} />
//               </View>

//               {/* Q5 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>5) Raw Materials Used</Text>
//                 {RAW_MATERIAL_OPTIONS.map(opt => renderMultiCheckboxRow(row.raw_material, opt, val => updateRow(index, { raw_material: val })))}
//                 {splitMulti(row.raw_material).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other raw materials" value={row.raw_material_other} onChangeText={v => updateRow(index, { raw_material_other: v })} />}
//               </View>

//               {/* Q6 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>6) Machinery/Equipment Used</Text>
//                 {MACHINERY_OPTIONS.map(opt => renderMultiCheckboxRow(row.machinery_equipment, opt, val => updateRow(index, { machinery_equipment: val })))}
//                 {splitMulti(row.machinery_equipment).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other machinery" value={row.machinery_equipment_other} onChangeText={v => updateRow(index, { machinery_equipment_other: v })} />}
//               </View>

//               {/* Q7 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>7) Target Customers</Text>
//                 {TARGET_CUSTOMERS_OPTIONS.map(opt => renderMultiCheckboxRow(row.target_customers, opt, val => updateRow(index, { target_customers: val })))}
//                 {splitMulti(row.target_customers).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other customers" value={row.target_customers_other} onChangeText={v => updateRow(index, { target_customers_other: v })} />}
//               </View>

//               {/* Q8 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>8) Sales Area</Text>
//                 {SALES_AREA_OPTIONS.map(opt => renderMultiCheckboxRow(row.sales_area, opt, val => updateRow(index, { sales_area: val })))}
//               </View>

//               {/* Q9 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>9) Packaging/Branding</Text>
//                 {renderYesNo(row.packaging_branding_status, val => updateRow(index, { packaging_branding_status: val }))}
//               </View>

//               {/* Q10 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>10) Marketing Strategy</Text>
//                 {MARKETING_STRATEGY_OPTIONS.map(opt => renderMultiCheckboxRow(row.marketing_strategy, opt, val => updateRow(index, { marketing_strategy: val })))}
//                 {splitMulti(row.marketing_strategy).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other strategy" value={row.marketing_strategy_other} onChangeText={v => updateRow(index, { marketing_strategy_other: v })} />}
//               </View>

//               {/* Q11 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>11) Marketing Channels</Text>
//                 {MARKETING_CHANNEL_OPTIONS.map(opt => renderMultiCheckboxRow(row.marketing_channels, opt, val => updateRow(index, { marketing_channels: val })))}
//                 {splitMulti(row.marketing_channels).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other channels" value={row.marketing_channels_other} onChangeText={v => updateRow(index, { marketing_channels_other: v })} />}
//               </View>

//               {/* Q12 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>12) Marketing Challenges</Text>
//                 {MARKETING_CHALLENGE_OPTIONS.map(opt => renderMultiCheckboxRow(row.marketing_challenges, opt, val => updateRow(index, { marketing_challenges: val })))}
//                 {splitMulti(row.marketing_challenges).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other challenges" value={row.marketing_challenges_other} onChangeText={v => updateRow(index, { marketing_challenges_other: v })} />}
//               </View>

//               {/* Q13 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>13) Market Linkages</Text>
//                 {MARKET_LINKAGE_OPTIONS.map(opt => renderMultiCheckboxRow(row.market_linkage, opt, val => updateRow(index, { market_linkage: val })))}
//                 {splitMulti(row.market_linkage).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other linkages" value={row.market_linkage_other} onChangeText={v => updateRow(index, { market_linkage_other: v })} />}
//               </View>

//               {/* Q14 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>14) Accept Digital Payment</Text>
//                 {renderYesNo(row.accept_digital_payment, val => updateRow(index, { accept_digital_payment: val }))}
//               </View>

//               {/* Q15 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>15) Average Monthly Sales (INR)</Text>
//                 <TextInput style={styles.input} keyboardType="numeric" placeholder="Enter sales amount" value={row.avg_monthly_sales} onChangeText={v => updateRow(index, { avg_monthly_sales: v })} />
//               </View>

//               {/* Q16 */}
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>16) Upload Product Photos</Text>
//                 {['open_box', 'close_box', 'others'].map(typeKey => (
//                   <View key={typeKey} style={styles.mediaBlock}>
//                     <Text style={styles.mediaLabel}>
//                       {typeKey === 'open_box' ? 'Open Box (1-3)' : typeKey === 'close_box' ? 'Closed Box (1-3)' : 'Others (1-3)'}
//                     </Text>
//                     <View style={{ flexDirection: 'row', gap: 8 }}>
//                       <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMediaForRow(index, typeKey)}>
//                         <Text style={styles.mediaBtnText}>Upload</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity style={styles.mediaBtn} onPress={() => openCameraForRow(index, typeKey)}>
//                         <Text style={styles.mediaBtnText}>Camera</Text>
//                       </TouchableOpacity>
//                     </View>
//                     {row.media?.[typeKey]?.length > 0 && <Text style={styles.mediaInfo}>Selected: {row.media[typeKey].length} file(s)</Text>}
//                   </View>
//                 ))}
//               </View>

//             </View>
//           )}
//         </View>
//       ))}

//       <TouchableOpacity style={styles.addBtn} onPress={addProductRow}>
//         <Text style={styles.addBtnText}>+ Add Product Detail</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: { marginBottom: 24 },
//   sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#222' },
//   helpText: { fontSize: 12, color: '#666', marginBottom: 6 },
//   card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, marginTop: 10, backgroundColor: '#fafafa' },
//   cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   cardHeaderBottom: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
//   cardTitle: { fontWeight: '700', fontSize: 15, flex: 1 },
//   cardToggle: { fontSize: 16, marginLeft: 8 },
//   cardBody: { marginTop: 8 },
//   removeBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#f3d0d0', borderRadius: 6 },
//   removeBtnText: { fontSize: 12, color: '#a03333', fontWeight: '600' },
//   fieldBlock: { marginBottom: 12 },
//   label: { fontWeight: 'bold', marginBottom: 4, color: '#333' },
//   input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, backgroundColor: '#fff' },
//   pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, overflow: 'hidden' },
//   yesNoRow: { flexDirection: 'row', marginTop: 4 },
//   yesNoBtn: { flex: 1, borderWidth: 1, borderColor: '#ccc', paddingVertical: 6, borderRadius: 6, alignItems: 'center', marginRight: 6 },
//   yesNoBtnActive: { backgroundColor: '#EE6969', borderColor: '#EE6969' },
//   yesNoText: { fontSize: 14, color: '#333' },
//   yesNoTextActive: { color: '#fff', fontWeight: '700' },
//   checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 2 },
//   checkboxIcon: { width: 20, fontSize: 16 },
//   checkboxLabel: { flex: 1, fontSize: 13, color: '#444' },
//   mediaBlock: { marginTop: 8 },
//   mediaLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
//   mediaBtn: { borderWidth: 1, borderColor: '#777', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start' },
//   mediaBtnText: { fontSize: 13, fontWeight: '600', color: '#333' },
//   mediaInfo: { fontSize: 12, color: '#666', marginTop: 4 },
//   addBtn: { marginTop: 12, borderWidth: 1, borderColor: '#2b7', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
//   addBtnText: { color: '#2b7', fontWeight: '700', fontSize: 14 },
// });



// src/screens/screensProductionApp/FormSections/ExistingEnterpriseProductServicesSection.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// Option Arrays
const PRODUCT_TYPE_OPTIONS = [
  'Food Products', 'Handicrafts & Artisan Products', 'Textiles & Apparel Products',
  'Agriculture & Allied Products', 'Dairy Products', 'Animal Products',
  'Beauty, Wellness & Personal Products', 'Cleaning & Hygiene Products',
  'Packaging Utility Products', 'Digital Service Products', 'Others'
];
const RAW_MATERIAL_OPTIONS = [
  'Grains / Cereals', 'Pulses', 'Vegetables / Fruits', 'Spices & Condiments',
  'Milk & Milk Products', 'Packaging Material', 'Chemicals / Cleaning Agents',
  'Fabric / Textile', 'Wood / Bamboo / Cane', 'Others'
];
const MACHINERY_OPTIONS = [
  'Mixer / Grinder', 'Sealing Machine', 'Oven / Baking Unit', 'Packing Machine',
  'Stitching / Sewing Machine', 'Grinding / Milling Machine', 'Cutting / Chopping Machine',
  'Printing / Labelling Machine', 'Others'
];
const TARGET_CUSTOMERS_OPTIONS = [
  'Local consumers', 'Shopkeepers and market sellers', 'Urban consumers',
  'Online customers', 'Institutional buyers', 'Others'
];
const SALES_AREA_OPTIONS = [
  'Village', 'Block', 'District','State','Other State','Other Country'
];
const MARKETING_STRATEGY_OPTIONS = [
  'Word of Mouth / Door-to-Door Selling',
  'Selling in Local Markets (Haat/Bazaar)',
  'Using SHG Networks for Promotion',
  'Display Boards or Posters Near Shop/Workplace',
  'Others'
];
const MARKETING_CHANNEL_OPTIONS = ['Retail', 'Online', 'Exhibition', 'ESARAS','Others'];
const MARKETING_CHALLENGE_OPTIONS = [
  'Do you face difficulty finding buyers outside your village?',
  'Is limited knowledge of digital tools a barrier for marketing?',
  'Others'
];
const CHANNEL_SUB_OPTIONS = {
  Retail: ['Local Retail Shops', 'Kirana Stores', 'Others'],
  Online: ['Amazon', 'Flipkart', 'ONDC', 'WhatsApp Marketing', 'Others'],
  Exhibition: ['District SARAS', 'State SARAS', 'National SARAS', 'Existing Product Marketing', 'Others'],
  Others: ['Others'],
};
const YES_NO = ['Yes', 'No'];

// Helpers for multi-select
const splitMulti = (val) => (val || '').split(',').map(v => v.trim()).filter(Boolean);
const joinMulti = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join(', ') : '');
const toggleInCommaString = (current, option) => {
  const arr = splitMulti(current);
  if (arr.includes(option)) return joinMulti(arr.filter(i => i !== option));
  return joinMulti([...arr, option]);
};

export default function ExistingEnterpriseProductServicesSection({ existingForm, setExistingForm }) {
  const products = Array.isArray(existingForm.products) ? existingForm.products : [];

  const updateProducts = (next) => setExistingForm({ products: next });

  const addProductRow = () => {
    const newRow = {
      id: Date.now().toString(),
      title: 'New Product Detail',
      expanded: true,
      main_product_name: '',
      activity_or_product_type: '',
      product_type_other: '',
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
      accept_digital_payment: '',
      avg_monthly_sales: '',
      gross_profit:'',
      media: { open_box: [], close_box: [], others: [] },
    };
    updateProducts([...products, newRow]);
  };

  const removeProductRow = (index) => updateProducts(products.filter((_, i) => i !== index));
  const updateRow = (index, patch) => updateProducts(products.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const toggleExpand = (index) => updateRow(index, { expanded: !products[index].expanded });
  const onChangeMainProductName = (index, value) => updateRow(index, { main_product_name: value, title: value || 'New Product Detail' });

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const pickMediaForRow = async (index, typeKey) => {
    const res = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 3 });
    if (!res.didCancel) updateRow(index, { media: { ...products[index].media, [typeKey]: res.assets?.slice(0, 3) || [] } });
  };

  const openCameraForRow = async (index, typeKey) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return alert('Camera permission denied');
    const res = await launchCamera({ mediaType: 'photo' });
    if (!res.didCancel) updateRow(index, { media: { ...products[index].media, [typeKey]: res.assets?.slice(0, 3) || [] } });
  };

  const renderYesNo = (current, onChange) => (
    <View style={styles.yesNoRow}>
      {YES_NO.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.yesNoBtn, current === opt && styles.yesNoBtnActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.yesNoText, current === opt && styles.yesNoTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMultiCheckboxRow = (currentValue, option, onChange) => {
    const selected = splitMulti(currentValue);
    const isChecked = selected.includes(option);
    return (
      <TouchableOpacity key={option} style={styles.checkboxRow} onPress={() => onChange(toggleInCommaString(currentValue, option))}>
        <Text style={styles.checkboxIcon}>{isChecked ? '☑' : '☐'}</Text>
        <Text style={styles.checkboxLabel}>{option}</Text>
      </TouchableOpacity>
    );
  };

  const renderMarketingChannelsWithSubOptions = (index) => {
    const row = products[index];
    return (
      <View>
        {/* Main Marketing Channels */}
        {MARKETING_CHANNEL_OPTIONS.map(channel => (
          <View key={channel} style={styles.nestedSection}>
            {renderMultiCheckboxRow(row.marketing_channels, channel, val => updateRow(index, { marketing_channels: val }))}
            
            {/* Sub-options for this channel */}
            {splitMulti(row.marketing_channels).includes(channel) && (
              <View style={styles.subOptionsContainer}>
                {CHANNEL_SUB_OPTIONS[channel]?.map(subOpt => (
                  <View key={subOpt} style={styles.nestedCheckbox}>
                    {renderMultiCheckboxRow(row.marketing_channels_other, subOpt, val => updateRow(index, { marketing_channels_other: val }))}
                  </View>
                ))}
                {splitMulti(row.marketing_channels_other).some(opt => 
                  CHANNEL_SUB_OPTIONS[channel]?.includes(opt)
                ) && (
                  <TextInput 
                    style={[styles.input, { marginTop: 6 }]} 
                    placeholder="Specify other details" 
                    value={row.marketing_channels_other_input || ''} 
                    onChangeText={v => updateRow(index, { marketing_channels_other_input: v })}
                  />
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Product and Services</Text>
      <Text style={styles.helpText}>Add each product separately using the "+" button below.</Text>

      {products.map((row, index) => (
        <View key={row.id || index} style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(index)}>
            <Text style={styles.cardTitle}>{row.title}</Text>
            <Text style={styles.cardToggle}>{row.expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          <View style={styles.cardHeaderBottom}>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeProductRow(index)}>
              <Text style={styles.removeBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>

          {row.expanded && (
            <View style={styles.cardBody}>
              {/* Q1 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>1) Product Name</Text>
                <TextInput style={styles.input} placeholder="Enter product name" value={row.main_product_name} onChangeText={v => onChangeMainProductName(index, v)} />
              </View>

              {/* Q2 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>2) Type of Product</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={row.activity_or_product_type} onValueChange={v => updateRow(index, { activity_or_product_type: v })}>
                    <Picker.Item label="Select..." value="" />
                    {PRODUCT_TYPE_OPTIONS.map(opt => <Picker.Item key={opt} label={opt} value={opt} />)}
                  </Picker>
                </View>
                {row.activity_or_product_type === 'Others' && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other type" value={row.product_type_other} onChangeText={v => updateRow(index, { product_type_other: v })} />}
              </View>

              {/* Q3 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>3) Describe Product Features (If any)</Text>
                <TextInput style={styles.input} placeholder="Describe your product" value={row.product_features} onChangeText={v => updateRow(index, { product_features: v })} />
              </View>

              {/* Q4 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>4) Production Capacity (Per Month)</Text>
                <TextInput style={styles.input} placeholder="Enter production capacity" value={row.production_capacity} onChangeText={v => updateRow(index, { production_capacity: v })} />
              </View>

              {/* Q5 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>5) Raw Materials Used</Text>
                {RAW_MATERIAL_OPTIONS.map(opt => renderMultiCheckboxRow(row.raw_material, opt, val => updateRow(index, { raw_material: val })))}
                {splitMulti(row.raw_material).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other raw materials" value={row.raw_material_other} onChangeText={v => updateRow(index, { raw_material_other: v })} />}
              </View>

              {/* Q6 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>6) Machinery/Equipment Used</Text>
                {MACHINERY_OPTIONS.map(opt => renderMultiCheckboxRow(row.machinery_equipment, opt, val => updateRow(index, { machinery_equipment: val })))}
                {splitMulti(row.machinery_equipment).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other machinery" value={row.machinery_equipment_other} onChangeText={v => updateRow(index, { machinery_equipment_other: v })} />}
              </View>

              {/* Q7 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>7) Target Customers</Text>
                {TARGET_CUSTOMERS_OPTIONS.map(opt => renderMultiCheckboxRow(row.target_customers, opt, val => updateRow(index, { target_customers: val })))}
                {splitMulti(row.target_customers).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other customers" value={row.target_customers_other} onChangeText={v => updateRow(index, { target_customers_other: v })} />}
              </View>

              {/* Q8 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>8) Sales Area</Text>
                {SALES_AREA_OPTIONS.map(opt => renderMultiCheckboxRow(row.sales_area, opt, val => updateRow(index, { sales_area: val })))}
              </View>

              {/* Q9 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>9) Packaging/Branding</Text>
                {renderYesNo(row.packaging_branding_status, val => updateRow(index, { packaging_branding_status: val }))}
              </View>

              {/* Q10 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>10) Marketing Strategy</Text>
                {MARKETING_STRATEGY_OPTIONS.map(opt => renderMultiCheckboxRow(row.marketing_strategy, opt, val => updateRow(index, { marketing_strategy: val })))}
                {splitMulti(row.marketing_strategy).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other strategy" value={row.marketing_strategy_other} onChangeText={v => updateRow(index, { marketing_strategy_other: v })} />}
              </View>

              {/* Q11 - Updated Marketing Channels with nested sub-options (Merged Q13) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>11) Marketing Channels & Linkages</Text>
                {renderMarketingChannelsWithSubOptions(index)}
              </View>

              {/* Q12 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>12) Marketing Challenges</Text>
                {MARKETING_CHALLENGE_OPTIONS.map(opt => renderMultiCheckboxRow(row.marketing_challenges, opt, val => updateRow(index, { marketing_challenges: val })))}
                {splitMulti(row.marketing_challenges).includes('Others') && <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="Specify other challenges" value={row.marketing_challenges_other} onChangeText={v => updateRow(index, { marketing_challenges_other: v })} />}
              </View>

              {/* Q14 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>13) Accept Digital Payment</Text>
                {renderYesNo(row.accept_digital_payment, val => updateRow(index, { accept_digital_payment: val }))}
              </View>

              {/* Q15 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>14) Average Monthly Sales (INR)</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="Enter sales amount" value={row.avg_monthly_sales} onChangeText={v => updateRow(index, { avg_monthly_sales: v })} />
              </View>

              {/* <View style={styles.fieldBlock}>
                      <Text style={styles.label}>15) What is your Gross Profit?</Text>
                      <Text style={styles.helpText}>
                        Please enter your gross profit (income minus direct expenses) as you understand it.
                        You may put an approximate value.
                      </Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={existingForm.gross_profit || ''}
                        onChangeText={(v) => updateRow({ gross_profit: v })}
                      />
                    </View> */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>15) What is your annual sale?</Text>
  <Text style={styles.helpText}>
    Please enter your monthly annual sale.
    You may put an approximate value.
  </Text>
  <TextInput
    style={styles.input}
    keyboardType="numeric"
    value={row.annual_sale || ''}  // ✅ Always STRING
    onChangeText={(v) => {
      updateRow(index, { annual_sale: v });  // ✅ Correct index usage
    }}
    placeholder="Enter monthly amount"
  />
  
  {/* Fixed Display - Parse ONLY for display, not value */}
  {/* {row.gross_profit && row.gross_profit.trim() !== '' && (
    <View style={styles.estimatedContainer}>
      <Text style={styles.estimatedLabel}>Estimated Annual Turn Over:</Text>
      <Text style={styles.estimatedValue}>
        ₹{parseFloat(row.gross_profit || '0').toLocaleString('en-IN')} × 12 = 
        ₹{(parseFloat(row.gross_profit || '0') * 12).toLocaleString('en-IN')}
      </Text>
    </View>
  )} */}
</View>


              {/* Q16 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>16) Upload Product Photos</Text>
                {['open_box', 'close_box', 'others'].map(typeKey => (
                  <View key={typeKey} style={styles.mediaBlock}>
                    <Text style={styles.mediaLabel}>
                      {typeKey === 'open_box' ? 'Open Box (1-3)' : typeKey === 'close_box' ? 'Closed Box (1-3)' : 'Others (1-3)'}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMediaForRow(index, typeKey)}>
                        <Text style={styles.mediaBtnText}>Upload</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.mediaBtn} onPress={() => openCameraForRow(index, typeKey)}>
                        <Text style={styles.mediaBtnText}>Camera</Text>
                      </TouchableOpacity>
                    </View>
                    {row.media?.[typeKey]?.length > 0 && <Text style={styles.mediaInfo}>Selected: {row.media[typeKey].length} file(s)</Text>}
                  </View>
                ))}
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
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#222' },
  helpText: { fontSize: 12, color: '#666', marginBottom: 6 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, marginTop: 10, backgroundColor: '#fafafa' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderBottom: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  cardTitle: { fontWeight: '700', fontSize: 15, flex: 1 },
  cardToggle: { fontSize: 16, marginLeft: 8 },
  cardBody: { marginTop: 8 },
  removeBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#f3d0d0', borderRadius: 6 },
  removeBtnText: { fontSize: 12, color: '#a03333', fontWeight: '600' },
  fieldBlock: { marginBottom: 12 },
  label: { fontWeight: 'bold', marginBottom: 4, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, backgroundColor: '#fff' },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, overflow: 'hidden' },
  yesNoRow: { flexDirection: 'row', marginTop: 4 },
  yesNoBtn: { flex: 1, borderWidth: 1, borderColor: '#ccc', paddingVertical: 6, borderRadius: 6, alignItems: 'center', marginRight: 6 },
  yesNoBtnActive: { backgroundColor: '#EE6969', borderColor: '#EE6969' },
  yesNoText: { fontSize: 14, color: '#333' },
  yesNoTextActive: { color: '#fff', fontWeight: '700' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 2 },
  checkboxIcon: { width: 20, fontSize: 16 },
  checkboxLabel: { flex: 1, fontSize: 13, color: '#444' },
  nestedSection: { marginBottom: 8 },
  subOptionsContainer: { 
    marginLeft: 15, 
    marginTop: 4, 
    padding: 8, 
    backgroundColor: '#f9f9f9', 
    borderRadius: 6,
    // borderLeftWidth: 3,
  },
  nestedCheckbox: { marginVertical: 1 },
  mediaBlock: { marginTop: 8 },
  mediaLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  mediaBtn: { borderWidth: 1, borderColor: '#777', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start' },
  mediaBtnText: { fontSize: 13, fontWeight: '600', color: '#333' },
  mediaInfo: { fontSize: 12, color: '#666', marginTop: 4 },
  addBtn: { marginTop: 12, borderWidth: 1, borderColor: '#2b7', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  addBtnText: { color: '#2b7', fontWeight: '700', fontSize: 14 },
  estimatedContainer: {
  marginTop: 12,
  padding: 16,
  backgroundColor: '#e8f5e8',
  borderRadius: 8,
  borderLeftWidth: 4,
  borderLeftColor: '#28a745',
},
estimatedLabel: {
  fontSize: 14,
  fontWeight: '500',
  color: '#28a745',
  marginBottom: 4,
},
estimatedValue: {
  fontSize: 18,
  fontWeight: '700',
  color: '#1e7e34',
},

});
