// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   Modal,
//   Platform,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';

// export default function ExistingEnterpriseForm({
//   beneficiary,
//   existingForm,
//   setExistingForm,
//   certDocs,
//   addCertificateDoc,
//   removeCertificateDoc,
//   pickAndUpload,
//   takePhotoAndUploadLocal,
//   loading,
//   uploading,
//   handleSubmit,
// }) {
//   // Dropdown options
//  const enterpriseTypeOptions = [
//   { label: 'Manufacturing', value: 'Manufacturing' },
//   { label: 'Service', value: 'Service' },
//   { label: 'Trading', value: 'Trading' },
//   { label: 'Agri-based', value: 'Agri-based' },
//   { label: 'Animal Husbandry', value: 'Animal Husbandry' },
//   { label: 'Home-based', value: 'Home-based' },
//   { label: 'Others', value: 'Others' },
// ];

// const ownershipTypeOptions = [
//   { label: 'Individual', value: 'Individual' },
//   { label: 'Partnership', value: 'Partnership' },
//   { label: 'SHG-based', value: 'SHG-based' },
//   { label: 'Family-owned', value: 'Family-owned' },
//   { label: 'Women Entrepreneur', value: 'Women Entrepreneur' },
//   { label: 'Others', value: 'Others' },
// ];

// const productServicesOptions = [
//   { label: 'Tailoring/Embroidery', value: 'Tailoring/Embroidery' },
//   { label: 'Food Products', value: 'Food Products' },
//   { label: 'Handicrafts', value: 'Handicrafts' },
//   { label: 'Beauty/Wellness', value: 'Beauty/Wellness' },
//   { label: 'Dairy', value: 'Dairy' },
//   { label: 'Agriculture Products', value: 'Agriculture Products' },
//   { label: 'Digital Services', value: 'Digital Services' },
//   { label: 'Home Décor', value: 'Home Décor' },
//   { label: 'Others', value: 'Others' },
// ];

// const rawMaterialTypeOptions = [
//   { label: 'Cloth', value: 'Cloth' },
//   { label: 'Wood', value: 'Wood' },
//   { label: 'Metal', value: 'Metal' },
//   { label: 'Plastic', value: 'Plastic' },
//   { label: 'Food Items', value: 'Food Items' },
//   { label: 'Paper', value: 'Paper' },
//   { label: 'Clay/Ceramic', value: 'Clay/Ceramic' },
//   { label: 'Natural/Organic', value: 'Natural/Organic' },
//   { label: 'Others', value: 'Others' },
// ];

// const machineryEquipmentOptions = [
//   { label: 'Tailoring Machine', value: 'Tailoring Machine' },
//   { label: 'Cutter/Folding Machine', value: 'Cutter/Folding Machine' },
//   { label: 'Grinder/Mixer', value: 'Grinder/Mixer' },
//   { label: 'Packaging Machine', value: 'Packaging Machine' },
//   { label: 'Printing Machine', value: 'Printing Machine' },
//   { label: 'Flour Mill', value: 'Flour Mill' },
//   { label: 'Handy Tools', value: 'Handy Tools' },
//   { label: 'Digital Equipment', value: 'Digital Equipment' },
//   { label: 'Others', value: 'Others' },
// ];

// const workplaceTypeOptions = [
//   { label: 'Home-based', value: 'Home-based' },
//   { label: 'Rented Place', value: 'Rented Place' },
//   { label: 'Own Workplace', value: 'Own Workplace' },
//   { label: 'SHG Center', value: 'SHG Center' },
//   { label: 'Community Workplace', value: 'Community Workplace' },
//   { label: 'Mobile/Itinerant', value: 'Mobile/Itinerant' },
//   { label: 'Others', value: 'Others' },
// ];

// const institutionOptions = [
//   { label: 'Bank', value: 'Bank' },
//   { label: 'Microfinance', value: 'Microfinance' },
//   { label: 'NBFC', value: 'NBFC' },
//   { label: 'Cooperative Society', value: 'Cooperative Society' },
//   { label: 'Others', value: 'Others' },
// ];

// const repaymentOptions = [
//   { label: 'Ongoing', value: 'Ongoing' },
//   { label: 'Completed', value: 'Completed' },
//   { label: 'Default / Pending', value: 'Default / Pending' },
//   { label: 'Others', value: 'Others' },
// ];

// const marketingChannelOptions = [
//   { label: 'Retail', value: 'Retail' },
//   { label: 'Online', value: 'Online' },
//   { label: 'Exhibition', value: 'Exhibition' },
//   { label: 'Others', value: 'Others' },
// ];



//   const yesNoOptions = [
//     { label: 'Yes', value: 'Yes' },
//     { label: 'No', value: 'No' },
//   ];

//   const institutionalSupportOptions = [
//   { label: 'NRLM', value: 'NRLM' },
//   { label: 'SRLM', value: 'SRLM' },
//   { label: 'Others', value: 'Others' },
// ];

// const financialLinkageOptions = [
//   { label: 'Bank', value: 'Bank' },
//   { label: 'Micro Finance', value: 'Micro Finance' },
//   { label: 'NBFC', value: 'NBFC' },
//   { label: 'Others', value: 'Others' },
// ];


// const marketLinkageOptions = [
//   { label: 'ONDC', value: 'ONDC' },
//   { label: 'E-Commerce', value: 'E-Commerce' },
//   { label: 'Exhibition', value: 'Exhibition' },
//   { label: 'Others', value: 'Others' },
// ];

// const requiredSupportOptions = [
//   { label: 'Finance', value: 'Finance' },
//   { label: 'Training', value: 'Training' },
//   { label: 'Advertisement / Promotion', value: 'Advertisement / Promotion' },
//   { label: 'Equipment', value: 'Equipment' },
//   { label: 'Others', value: 'Others' },
// ];

// const expansionPlanOptions = [
//   { label: 'New Product', value: 'New Product' },
//   { label: 'E-commerce', value: 'E-commerce' },
//   { label: 'Employment Generation', value: 'Employment Generation' },
//   { label: 'Others', value: 'Others' },
// ];

//   // YEAR PICKER
//   const [yearPickerVisible, setYearPickerVisible] = useState(false);
//   const currentYear = new Date().getFullYear();
//   const startYear = 1950;
//   const yearOptions = [];
//   for (let y = currentYear; y >= startYear; y--) yearOptions.push(y.toString());

//  const [loans, setLoans] = useState(() => {
//     try {
//       if (existingForm.loan_details) {
//         return JSON.parse(existingForm.loan_details);
//       }
//       return [];
//     } catch {
//       return [];
//     }
//   });

//   // ---------------------------------------
//   // UPDATE LOANS IN BOTH LOCAL + PARENT FORM
//   // ---------------------------------------
//   const updateLoans = (newLoans) => {
//     setLoans(newLoans);
//     setExistingForm((f) => ({
//       ...f,
//       loan_details: JSON.stringify(newLoans),    // <-- FIXED
//     }));
//   };

//   const updateLoanEntry = (index, updatedEntry) => {
//     const updated = [...loans];
//     updated[index] = updatedEntry;
//     updateLoans(updated);
//   };

//   const deleteLoanEntry = (index) => {
//     const updated = loans.filter((_, i) => i !== index);
//     updateLoans(updated);
//   };

//   const addLoanEntry = () => {
//     updateLoans([
//       ...loans,
//       {
//         institution: '',
//         institutionOther: '',
//         amount: '',
//         repayment: '',
//         repaymentOther: '',
//       },
//     ]);
//   };


//   // Helper to render dropdown selector with "Specify" input if Others selected
//   const renderPickerWithSpecify = (
//     label,
//     selectedValue,
//     onValueChange,
//     options,
//     specifyValue,
//     onSpecifyChange
//   ) => (
//     <View style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>{label}</Text>
//       <Picker
//         selectedValue={selectedValue}
//         onValueChange={onValueChange}
//         style={styles.input}
//       >
//         <Picker.Item label="Select..." value="" />
//         {options.map((opt) => (
//           <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//         ))}
//       </Picker>
//       {selectedValue === 'Others' && (
//         <TextInput
//           value={specifyValue || ''}
//           onChangeText={onSpecifyChange}
//           placeholder="Specify"
//           style={[styles.input, { marginTop: 6 }]}
//         />
//       )}
//     </View>
//   );

//   const renderYesNoToggle = (label, selectedValue, onChange) => (
//     <View style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>{label}</Text>
//       <View style={{ flexDirection: 'row', gap: 12 }}>
//         {yesNoOptions.map(({ label: l, value }) => (
//           <TouchableOpacity
//             key={value}
//             style={[
//               styles.smallBtn,
//               selectedValue === value && { backgroundColor: '#EE6969' },
//             ]}
//             onPress={() => onChange(value)}
//           >
//             <Text
//               style={{
//                 color: selectedValue === value ? '#fff' : '#333',
//                 fontWeight: '600',
//               }}
//             >
//               {l}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );

//   const LoanEntry = ({ entry, index, onUpdate, onDelete, allowDelete }) => (
//   <View style={styles.loanEntryContainer}>
//     <Text style={styles.label}>Loan Entry {index + 1}</Text>

//     {/* Institution Name (Dropdown) */}
//     <Picker
//       selectedValue={entry.institution}
//       onValueChange={val =>
//         onUpdate({
//           ...entry,
//           institution: val,
//           institutionOther: val === 'Others' ? entry.institutionOther : ''
//         })
//       }
//       style={styles.input}
//     >
//       <Picker.Item label="Select Institution" value="" />
//       {institutionOptions.map(opt => (
//         <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//       ))}
//     </Picker>
//     {entry.institution === 'Others' && (
//       <TextInput
//         placeholder="Specify Institution"
//         style={styles.input}
//         value={entry.institutionOther}
//         onChangeText={val => onUpdate({ ...entry, institutionOther: val })}
//       />
//     )}

//     {/* Loan Amount */}
//     <TextInput
//       placeholder="Loan Amount"
//       style={styles.input}
//       keyboardType="numeric"
//       value={entry.amount}
//       onChangeText={val =>
//         onUpdate({ ...entry, amount: val.replace(/[^0-9]/g, '') })
//       }
//     />

//     {/* Repayment Status (Dropdown) */}
//     <Picker
//       selectedValue={entry.repayment}
//       onValueChange={val =>
//         onUpdate({
//           ...entry,
//           repayment: val,
//           repaymentOther: val === 'Others' ? entry.repaymentOther : ''
//         })
//       }
//       style={styles.input}
//     >
//       <Picker.Item label="Select Repayment Status" value="" />
//       {repaymentOptions.map(opt => (
//         <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//       ))}
//     </Picker>
//     {entry.repayment === 'Others' && (
//       <TextInput
//         placeholder="Specify Repayment Status"
//         style={styles.input}
//         value={entry.repaymentOther}
//         onChangeText={val => onUpdate({ ...entry, repaymentOther: val })}
//       />
//     )}

//     {allowDelete && (
//       <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
//         <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete Loan</Text>
//       </TouchableOpacity>
//     )}
//   </View>
// );


// // const toggleMarketingChannel = (value) => {
// //   let current = existingForm.marketing_channels || [];
// //   if (current.includes(value)) {
// //     current = current.filter(x => x !== value);
// //   } else {
// //     current.push(value);
// //   }
// //   setExistingForm(f => ({ ...f, marketing_channels: current }));
// // };


// const toggleMarketingChannel = (value) => {
//   // Ensure marketing_channels is always an array
//   const currentChannels = Array.isArray(existingForm.marketing_channels)
//     ? [...existingForm.marketing_channels]
//     : [];

//   if (currentChannels.includes(value)) {
//     // Remove value if already selected
//     const updatedChannels = currentChannels.filter((item) => item !== value);
//     setExistingForm({
//       ...existingForm,
//       marketing_channels: updatedChannels,
//     });
//   } else {
//     // Add value if not already selected
//     setExistingForm({
//       ...existingForm,
//       marketing_channels: [...currentChannels, value],
//     });
//   }
// };


//   const multilineFields = [
//     'product_features',
//     'marketing_strategy',
//     'marketing_challenges',
//     'training_received',
//     'skills_acquired',
//     'future_training_requirements',
//     'required_support',
//   ];

//   const renderField = (k) => {
//     if (k === 'enterprise_type')
//       return renderPickerWithSpecify('Enterprise Type (उद्यम प्रकार)', existingForm.enterprise_type, (v) => setExistingForm((f) => ({ ...f, enterprise_type: v })), enterpriseTypeOptions, existingForm.enterprise_type_other, (v) => setExistingForm((f) => ({ ...f, enterprise_type_other: v })));
//     if (k === 'ownership_type')
//       return renderPickerWithSpecify('Ownership Type (स्वामित्व प्रकार)', existingForm.ownership_type, (v) => setExistingForm((f) => ({ ...f, ownership_type: v })), ownershipTypeOptions, existingForm.ownership_type_other, (v) => setExistingForm((f) => ({ ...f, ownership_type_other: v })));
//     if (k === 'main_product_service')
//       return renderPickerWithSpecify('Product / Services (उत्पाद / सेवाएँ)', existingForm.main_product_service, (v) => setExistingForm((f) => ({ ...f, main_product_service: v })), productServicesOptions, existingForm.main_product_service_other, (v) => setExistingForm((f) => ({ ...f, main_product_service_other: v })));
//     if (k === 'raw_material')
//       return renderPickerWithSpecify('Raw Material Type (कच्चा माल प्रकार)', existingForm.raw_material, (v) => setExistingForm((f) => ({ ...f, raw_material: v })), rawMaterialTypeOptions, existingForm.raw_material_other, (v) => setExistingForm((f) => ({ ...f, raw_material_other: v })));
//     if (k === 'machinery_equipment')
//       return renderPickerWithSpecify('Machinery & Equipment (मशीनरी / उपकरण)', existingForm.machinery_equipment, (v) => setExistingForm((f) => ({ ...f, machinery_equipment: v })), machineryEquipmentOptions, existingForm.machinery_equipment_other, (v) => setExistingForm((f) => ({ ...f, machinery_equipment_other: v })));
//     if (k === 'workplace_type')
//       return renderPickerWithSpecify('Workplace Type (कार्यस्थल प्रकार)', existingForm.workplace_type, (v) => setExistingForm((f) => ({ ...f, workplace_type: v })), workplaceTypeOptions, existingForm.workplace_type_other, (v) => setExistingForm((f) => ({ ...f, workplace_type_other: v })));

//     // Year Picker Modal
//     if (k === 'year_of_establishment') {
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Year of Establishment</Text>
//           <TouchableOpacity
//             style={[styles.input, { justifyContent: 'center', height: 44 }]}
//             onPress={() => setYearPickerVisible(true)}
//           >
//             <Text>{existingForm.year_of_establishment || 'Select Year'}</Text>
//           </TouchableOpacity>
//           <Modal
//             visible={yearPickerVisible}
//             transparent
//             animationType="slide"
//             onRequestClose={() => setYearPickerVisible(false)}
//           >
//             <View style={styles.modalBackdrop}>
//               <View style={styles.modalContent}>
//                 <Text style={[styles.label, { textAlign: 'center' }]}>Select Year</Text>
//                 <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, backgroundColor: '#fff', margin: 8 }}>
//                   <Picker
//                     selectedValue={existingForm.year_of_establishment}
//                     onValueChange={(itemValue) => {
//                       setExistingForm((f) => ({ ...f, year_of_establishment: itemValue }));
//                       setYearPickerVisible(false);
//                     }}
//                   >
//                     {yearOptions.map(year => (
//                       <Picker.Item label={year} value={year} key={year} />
//                     ))}
//                   </Picker>
//                 </View>
//                 <TouchableOpacity style={styles.cancelBtn} onPress={() => setYearPickerVisible(false)}>
//                   <Text style={{ color: '#EE6969', fontWeight: '600' }}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Modal>
//         </View>
//       );
//     }
// if (k === 'electricity_available') {
//   const elec = existingForm.electricity_available || '';
//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Electricity Availability</Text>

//       <Picker
//         selectedValue={elec}
//         onValueChange={v => setExistingForm(f => ({
//           ...f,
//           electricity_available: v,
//           electricity_more_detail: v === 'Yes' ? f.electricity_more_detail : '',
//           electricity_specify: '',
//         }))}
//         style={styles.input}
//       >
//         <Picker.Item label="Select..." value="" />
//         <Picker.Item label="Yes" value="Yes" />
//         <Picker.Item label="No" value="No" />
//       </Picker>

//       {elec === 'Yes' && (
//         <>
//           <Picker
//             selectedValue={existingForm.electricity_more_detail || ''}
//             onValueChange={v => setExistingForm(f => ({
//               ...f,
//               electricity_more_detail: v,
//               electricity_specify: v === 'Others' ? f.electricity_specify : '',
//             }))}
//             style={[styles.input, { marginTop: 6 }]}
//           >
//             <Picker.Item label="Select..." value="" />
//             <Picker.Item label="Partial / Irregular" value="Partial / Irregular" />
//             <Picker.Item label="Others" value="Others" />
//           </Picker>

//           {existingForm.electricity_more_detail === 'Others' && (
//             <TextInput
//               placeholder="Specify"
//               value={existingForm.electricity_specify || ''}
//               onChangeText={text => setExistingForm(f => ({
//                 ...f,
//                 electricity_specify: text,
//               }))}
//               style={[styles.input, { marginTop: 6 }]}
//             />
//           )}
//         </>
//       )}
//     </View>
//   );
// }

// if (k === 'water_available') {
//   const water = existingForm.water_available || '';
//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Water Availability</Text>

//       {/* Main Water Availability Picker */}
//       <Picker
//         selectedValue={water}
//         onValueChange={v => setExistingForm(f => ({
//           ...f,
//           water_available: v,
//           water_more_detail: v === 'Yes' ? f.water_more_detail : '',
//           water_specify: '',
//         }))}
//         style={styles.input}
//       >
//         <Picker.Item label="Select..." value="" />
//         <Picker.Item label="Yes" value="Yes" />
//         <Picker.Item label="No" value="No" />
//       </Picker>

//       {/* Show these only if Yes is selected */}
//       {water === 'Yes' && (
//         <>
//           <Picker
//             selectedValue={existingForm.water_more_detail || ''}
//             onValueChange={v => setExistingForm(f => ({
//               ...f,
//               water_more_detail: v,
//               water_specify: v === 'Others' ? f.water_specify : '',
//             }))}
//             style={[styles.input, { marginTop: 6 }]}
//           >
//             <Picker.Item label="Select..." value="" />
//             <Picker.Item label="Limited" value="Limited" />
//             <Picker.Item label="Others" value="Others" />
//           </Picker>

//           {/* Show specify input only if Others selected */}
//           {existingForm.water_more_detail === 'Others' && (
//             <TextInput
//               placeholder="Specify"
//               value={existingForm.water_specify || ''}
//               onChangeText={text => setExistingForm(f => ({
//                 ...f,
//                 water_specify: text,
//               }))}
//               style={[styles.input, { marginTop: 6 }]}
//             />
//           )}
//         </>
//       )}
//     </View>
//   );
// }

// if (k === 'transportation_facility') {
//   const transport = existingForm.transportation_facility || '';
//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Transport Availability</Text>
//       <Picker
//         selectedValue={transport}
//         onValueChange={v => setExistingForm(f => ({
//           ...f,
//           transportation_facility: v,
//           can_transport_clf: v === 'Yes' ? f.can_transport_clf : '',
//         }))}
//         style={styles.input}
//       >
//         <Picker.Item label="Select..." value="" />
//         <Picker.Item label="Yes" value="Yes" />
//         <Picker.Item label="No" value="No" />
//         <Picker.Item label="Need Help" value="Need Help" />
//       </Picker>

//       {transport === 'Yes' && (
//         <View style={{ marginTop: 8 }}>
//           <Text style={styles.label}>Can you transport/supply the product to the CLF?</Text>
//           <Picker
//             selectedValue={existingForm.can_transport_clf || ''}
//             onValueChange={v => setExistingForm(f => ({ ...f, can_transport_clf: v }))}
//             style={styles.input}
//           >
//             <Picker.Item label="Select..." value="" />
//             <Picker.Item label="Yes" value="Yes" />
//             <Picker.Item label="No" value="No" />
//           </Picker>
//         </View>
//       )}
//     </View>
//   );
// }
// if (k === 'source_of_investment') {
//   const source = existingForm.source_of_investment || '';
//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Source of Investment</Text>
//       <Picker
//         selectedValue={source}
//         onValueChange={(v) => setExistingForm(f => ({
//           ...f,
//           source_of_investment: v,
//           source_of_investment_specify: v === 'Others' ? f.source_of_investment_specify : '',
//         }))}
//         style={styles.input}
//       >
//         <Picker.Item label="Select..." value="" />
//         <Picker.Item label="CCL" value="CCL" />
//         <Picker.Item label="CIF" value="CIF" />
//         <Picker.Item label="Livelihood Fund" value="Livelihood Fund" />
//         <Picker.Item label="CEF" value="CEF" />
//         <Picker.Item label="Others" value="Others" />
//       </Picker>
//       {existingForm.source_of_investment === 'Others' && (
//         <TextInput
//           placeholder="Specify"
//           value={existingForm.source_of_investment_specify || ''}
//           onChangeText={text => setExistingForm(f => ({
//             ...f,
//             source_of_investment_specify: text,
//           }))}
//           style={[styles.input, { marginTop: 6 }]}
//         />
//       )}
//     </View>
//   );
// }

// if (k === 'government_subsidy') {
//   const subsidy = existingForm.government_subsidy || '';
//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>
//         Have you received any government subsidy / financial assistance?
//       </Text>
//       <Picker
//         selectedValue={subsidy}
//         onValueChange={(v) => setExistingForm(f => ({
//           ...f,
//           government_subsidy: v,
//           subsidy_department: v === 'Yes' ? f.subsidy_department : '',
//           subsidy_scheme: v === 'Yes' ? f.subsidy_scheme : '',
//         }))}
//         style={styles.input}
//       >
//         <Picker.Item label="Select..." value="" />
//         <Picker.Item label="Yes" value="Yes" />
//         <Picker.Item label="No" value="No" />
//       </Picker>
//       {subsidy === 'Yes' && (
//         <>
//           <TextInput
//             placeholder="Department Name"
//             value={existingForm.subsidy_department || ''}
//             onChangeText={text => setExistingForm(f => ({ ...f, subsidy_department: text }))}
//             style={[styles.input, { marginTop: 6 }]}
//           />
//           <TextInput
//             placeholder="Scheme Name"
//             value={existingForm.subsidy_scheme || ''}
//             onChangeText={text => setExistingForm(f => ({ ...f, subsidy_scheme: text }))}
//             style={[styles.input, { marginTop: 6 }]}
//           />
//         </>
//       )}
//     </View>
//   );
// }

// if (k === 'loan_details') {
//   // loan_details may be:
//   // "Yes", "No", or a JSON string of the array
//   const raw = existingForm.loan_details;

//   const loanAnswer = raw === "Yes" || raw === "No"
//     ? raw
//     : (Array.isArray(loans) && loans.length ? "Yes" : "");

//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Have you taken any loan?</Text>

//       <Picker
//         selectedValue={loanAnswer}
//         onValueChange={(v) => {
//           // Update Yes/No state
//           setExistingForm(f => ({
//             ...f,
//             loan_details: v === "No" ? "No" : "Yes"
//           }));

//           if (v === "No") {
//             // Reset loans if user chooses No
//             setLoans([]);
//             setExistingForm(f => ({
//               ...f,
//               loan_details: JSON.stringify([])
//             }));
//           }
//         }}
//         style={styles.input}
//       >
//         <Picker.Item label="Select..." value="" />
//         <Picker.Item label="Yes" value="Yes" />
//         <Picker.Item label="No" value="No" />
//       </Picker>

//       {/* If Yes → show loan entries */}
//       {loanAnswer === "Yes" && (
//         <>
//           {loans.map((loanEntry, idx) => (

//             <LoanEntry
//     key={idx}
//     index={idx}
//     entry={loanEntry}
//     onUpdate={(updated) => {
//       const newLoans = [...loans];
//       newLoans[idx] = updated;
//       setLoans(newLoans);
//       setExistingForm(f => ({
//         ...f,
//         loan_details: JSON.stringify(newLoans)
//       }));
//     }}
//     onDelete={() => deleteLoanEntry(idx)}
//     allowDelete={loans.length > 1}
//   />
//             // <LoanEntry
//             //   key={idx}
//             //   index={idx}
//             //   entry={loanEntry}
//             //   onUpdate={(updated) => {
//             //     const newLoans = [...loans];
//             //     newLoans[idx] = updated;
//             //     setLoans(newLoans);
//             //     setExistingForm(f => ({
//             //       ...f,
//             //       loan_details: JSON.stringify(newLoans)
//             //     }));
//             //   }}
//             //   onDelete={() => {
//             //     const newLoans = loans.filter((_, i) => i !== idx);
//             //     setLoans(newLoans);
//             //     setExistingForm(f => ({
//             //       ...f,
//             //       loan_details: JSON.stringify(newLoans)
//             //     }));
//             //   }}
//             //   allowDelete={loans.length > 1}
//             // />
//           ))}

//           <TouchableOpacity
//             style={styles.addBtn}
//             onPress={() => {
//               const updated = [
//                 ...loans,
//                 {
//                   institution: "",
//                   institutionOther: "",
//                   amount: "",
//                   repayment: "",
//                   repaymentOther: ""
//                 }
//               ];
//               setLoans(updated);
//               setExistingForm(f => ({
//                 ...f,
//                 loan_details: JSON.stringify(updated)
//               }));
//             }}
//           >
//             <Text style={{ color: "#EE6969", fontWeight: "bold" }}>
//               ➕ Add Another Loan
//             </Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// }



// if (k === 'marketing_channels') {
//   const selected = existingForm.marketing_channels || [];
//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Marketing Channels</Text>
//       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//         {marketingChannelOptions.map(({ label, value }) => (
//           <TouchableOpacity
//             key={value}
//             style={[
//               styles.smallBtn,
//               selected.includes(value) && { backgroundColor: '#EE6969' },
//             ]}
//             onPress={() => toggleMarketingChannel(value)}
//           >
//             <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>{label}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//       {selected.includes('Others') && (
//         <TextInput
//           placeholder="Specify Other Channels"
//           style={[styles.input, { marginTop: 6 }]}
//           value={existingForm.marketing_channels_other_specify || ''}
//           onChangeText={text => setExistingForm(f => ({ ...f, marketing_channels_other_specify: text }))}
//         />
//       )}
//     </View>
//   );
// }



//     if (k === 'future_training_requirements') {
//       const val = existingForm.additional_training_required || '';
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           {renderYesNoToggle(
//             'Will you require additional training in the future?',
//             val,
//             (v) => setExistingForm((f) => ({ ...f, additional_training_required: v }))
//           )}

//           {val === 'Yes' && (
//             <View style={{ marginTop: 8 }}>
//               <Text style={styles.label}>Please provide details of the required training:</Text>

//               <TextInput
//                 placeholder="Skill name"
//                 style={styles.input}
//                 value={existingForm.training_skill_name || ''}
//                 onChangeText={(text) =>
//                   setExistingForm((f) => ({ ...f, training_skill_name: text }))
//                 }
//               />

//               <TextInput
//                 placeholder="Type of training (Technical / Business / Digital, etc.)"
//                 style={styles.input}
//                 value={existingForm.training_type || ''}
//                 onChangeText={(text) =>
//                   setExistingForm((f) => ({ ...f, training_type: text }))
//                 }
//               />

//               <TextInput
//                 placeholder="Specific institution or department requirement (if applicable)"
//                 style={styles.input}
//                 value={existingForm.training_institution || ''}
//                 onChangeText={(text) =>
//                   setExistingForm((f) => ({ ...f, training_institution: text }))
//                 }
//               />
//             </View>
//           )}
//         </View>
//       );
//     }

//     if (k === 'institutional_support') {
//   const val = existingForm.institutional_support || '';
//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Institutional Support</Text>
//       <Picker
//         selectedValue={val}
//         onValueChange={(v) => setExistingForm(f => ({
//           ...f,
//           institutional_support: v,
//           institutional_support_other: v === 'Others' ? f.institutional_support_other : '',
//         }))}
//         style={styles.input}
//       >
//         <Picker.Item label="Select..." value="" />
//         {institutionalSupportOptions.map(opt => (
//           <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//         ))}
//       </Picker>

//       {val === 'Others' && (
//         <TextInput
//           placeholder="Please enter the name/details of the institution."
//           value={existingForm.institutional_support_other || ''}
//           onChangeText={text => setExistingForm(f => ({ ...f, institutional_support_other: text }))}
//           style={[styles.input, { marginTop: 6 }]}
//         />
//       )}
//     </View>
//   );
// }

// if (k === 'financial_linkage') {
//   const val = existingForm.financial_linkage || '';
//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Financial Linkage</Text>
//       <Picker
//         selectedValue={val}
//         onValueChange={(v) =>
//           setExistingForm(f => ({
//             ...f,
//             financial_linkage: v,
//             financial_linkage_other: v === 'Others' ? f.financial_linkage_other : '',
//           }))
//         }
//         style={styles.input}
//       >
//         <Picker.Item label="Select..." value="" />
//         {financialLinkageOptions.map(opt => (
//           <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//         ))}
//       </Picker>

//       {val === 'Others' && (
//         <TextInput
//           placeholder="Specify"
//           value={existingForm.financial_linkage_other || ''}
//           onChangeText={text =>
//             setExistingForm(f => ({ ...f, financial_linkage_other: text }))
//           }
//           style={[styles.input, { marginTop: 6 }]}
//         />
//       )}
//     </View>
//   );
// }

// if (k === 'required_support') {
//   const selected = Array.isArray(existingForm.required_support) ? existingForm.required_support : [];

//   const toggleOption = (value) => {
//     let updated = [...selected];
//     if (updated.includes(value)) {
//       updated = updated.filter(v => v !== value);
//     } else {
//       updated.push(value);
//     }
//     setExistingForm(f => ({ ...f, required_support: updated }));
//     // Clear 'others' text if Others unchecked
//     if (value === 'Others' && updated.indexOf('Others') === -1) {
//       setExistingForm(f => ({ ...f, required_support_other: '' }));
//     }
//   };

//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Required Support</Text>
//       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//         {requiredSupportOptions.map(({ label, value }) => (
//           <TouchableOpacity
//             key={value}
//             style={[
//               styles.smallBtn,
//               selected.includes(value) && { backgroundColor: '#EE6969' },
//             ]}
//             onPress={() => toggleOption(value)}
//           >
//             <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>
//               {label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {selected.includes('Others') && (
//         <TextInput
//           placeholder="Specify"
//           style={[styles.input, { marginTop: 6 }]}
//           value={existingForm.required_support_other || ''}
//           onChangeText={text => setExistingForm(f => ({ ...f, required_support_other: text }))}
//         />
//       )}
//     </View>
//   );
// }

// if (k === 'expansion_plan') {
//   const selected = Array.isArray(existingForm.expansion_plan) ? existingForm.expansion_plan : [];

//   const toggleOption = (value) => {
//     let updated = [...selected];
//     if (updated.includes(value)) {
//       updated = updated.filter(v => v !== value);
//     } else {
//       updated.push(value);
//     }
//     setExistingForm(f => ({ ...f, expansion_plan: updated }));
//     // Clear 'others' text if Others unchecked
//     if (value === 'Others' && updated.indexOf('Others') === -1) {
//       setExistingForm(f => ({ ...f, expansion_plan_other: '' }));
//     }
//   };

//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Expansion Plan</Text>
//       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//         {expansionPlanOptions.map(({ label, value }) => (
//           <TouchableOpacity
//             key={value}
//             style={[
//               styles.smallBtn,
//               selected.includes(value) && { backgroundColor: '#EE6969' },
//             ]}
//             onPress={() => toggleOption(value)}
//           >
//             <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>
//               {label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {selected.includes('Others') && (
//         <TextInput
//           placeholder="Specify"
//           style={[styles.input, { marginTop: 6 }]}
//           value={existingForm.expansion_plan_other || ''}
//           onChangeText={text => setExistingForm(f => ({ ...f, expansion_plan_other: text }))}
//         />
//       )}
//     </View>
//   );
// }

// if (k === 'market_linkage') {
//   const selected = Array.isArray(existingForm.market_linkage) ? existingForm.market_linkage : [];

//   const toggleOption = (value) => {
//     let updated = [...selected];
//     if (updated.includes(value)) {
//       updated = updated.filter(v => v !== value);
//     } else {
//       updated.push(value);
//     }
//     setExistingForm(f => ({ ...f, market_linkage: updated }));
//     // Clear 'others' text if Others unchecked
//     if (value === 'Others' && updated.indexOf('Others') === -1) {
//       setExistingForm(f => ({ ...f, market_linkage_other: '' }));
//     }
//   };

//   return (
//     <View key={k} style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>Market Linkages</Text>
//       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//         {marketLinkageOptions.map(({ label, value }) => (
//           <TouchableOpacity
//             key={value}
//             style={[
//               styles.smallBtn,
//               selected.includes(value) && { backgroundColor: '#EE6969' },
//             ]}
//             onPress={() => toggleOption(value)}
//           >
//             <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>
//               {label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {selected.includes('Others') && (
//         <TextInput
//           placeholder="Specify"
//           style={[styles.input, { marginTop: 6 }]}
//           value={existingForm.market_linkage_other || ''}
//           onChangeText={text => setExistingForm(f => ({ ...f, market_linkage_other: text }))}
//         />
//       )}
//     </View>
//   );
// }

//     // The rest remain unchanged
//     // if (k === 'electricity_available')
//     //   return renderYesNoToggle('Electricity Available?', existingForm.electricity_available, (v) => setExistingForm((f) => ({ ...f, electricity_available: v })));
//     // if (k === 'water_available')
//     //   return renderYesNoToggle('Water Available?', existingForm.water_available, (v) => setExistingForm((f) => ({ ...f, water_available: v })));
//     // if (k === 'transportation_facility')
//     //   return renderYesNoToggle('Transportation Facility Available?', existingForm.transportation_facility, (v) => setExistingForm((f) => ({ ...f, transportation_facility: v })));
//     if (k === 'certification_registration')
//       return renderYesNoToggle('Certification / Registration?', existingForm.certification_registration, (v) => setExistingForm((f) => ({ ...f, certification_registration: v })));
//     if (k === 'loan_details') {
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Is there a Loan?</Text>
//           <View style={{ flexDirection: 'row', gap: 12, marginBottom: 6 }}>
//             {yesNoOptions.map(({ label: l, value }) => (
//               <TouchableOpacity
//                 key={value}
//                 style={[
//                   styles.smallBtn,
//                   existingForm.loan_details === value && { backgroundColor: '#EE6969' },
//                 ]}
//                 onPress={() =>
//                   setExistingForm((f) => ({ ...f, loan_details: value }))
//                 }
//               >
//                 <Text
//                   style={{
//                     color: existingForm.loan_details === value ? '#fff' : '#333',
//                     fontWeight: '600',
//                   }}
//                 >
//                   {l}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//           {existingForm.loan_details === 'Yes' && (
//             <>
//               <Text style={styles.label}>Loan Institution Name</Text>
//               <TextInput
//                 value={existingForm.loan_institution || ''}
//                 onChangeText={(text) => setExistingForm((f) => ({ ...f, loan_institution: text }))}
//                 style={styles.input}
//                 placeholder="Institution Name"
//               />
//               <Text style={styles.label}>Loan Amount</Text>
//               <TextInput
//                 value={existingForm.loan_amount || ''}
//                 onChangeText={(text) => setExistingForm((f) => ({ ...f, loan_amount: text }))}
//                 style={styles.input}
//                 placeholder="Loan Amount"
//                 keyboardType="numeric"
//               />
//             </>
//           )}
//         </View>
//       );
//     }
//     if (k === 'certificate_docs') {
//       return (
//         <View key={k} style={{ marginBottom: 10 }}>
//           <Text style={styles.label}>Certificate Documents</Text>
//           <View style={{ flexDirection: 'row', gap: 8 }}>
//             <TouchableOpacity style={styles.smallBtn} onPress={addCertificateDoc}>
//               <Text style={styles.smallBtnText}>Add Document</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={{ marginTop: 8 }}>
//             {certDocs.length === 0 ? (
//               <Text style={{ color: '#666' }}>(none)</Text>
//             ) : (
//               <FlatList
//                 data={certDocs}
//                 keyExtractor={(item, index) => String(index)}
//                 renderItem={({ item, index }) => (
//                   <View key={index} style={{
//                     flexDirection: 'row',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     marginBottom: 6,
//                   }}>
//                     <Text style={{ flex: 1 }} numberOfLines={1}>{item}</Text>
//                     <TouchableOpacity onPress={() => removeCertificateDoc(index)} style={{ padding: 6 }}>
//                       <Text style={{ color: '#EE6969' }}>Remove</Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}
//               />
//             )}
//           </View>
//         </View>
//       );
//     }
//     if (
//       ['photo_enterprise', 'photo_entrepreneur', 'photo_product'].includes(k)
//     ) {
//       const current = existingForm[k] || '';
//       const labelMap = {
//         photo_enterprise: 'Photo Enterprise',
//         photo_entrepreneur: 'Photo Entrepreneur',
//         photo_product: 'Photo Product',
//       };
//       return (
//         <View key={k} style={{ marginBottom: 10 }}>
//           <Text style={styles.label}>{labelMap[k]}</Text>
//           <View style={{ flexDirection: 'row', gap: 8 }}>
//             <TouchableOpacity
//               style={styles.smallBtn}
//               onPress={() => pickAndUpload(k)}
//             >
//               <Text style={styles.smallBtnText}>Pick</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.smallBtn}
//               onPress={() => takePhotoAndUploadLocal(k)}
//             >
//               <Text style={styles.smallBtnText}>Camera</Text>
//             </TouchableOpacity>
//           </View>
//           {current ? (
//             <Text style={{ color: '#333', marginTop: 6 }} numberOfLines={1}>
//               {current}
//             </Text>
//           ) : null}
//         </View>
//       );
//     }
//     return (
//       <View key={k} style={{ marginBottom: 8 }}>
//         <Text style={styles.label}>{k.replace(/_/g, ' ')}</Text>
//         <TextInput
//           value={String(existingForm[k] ?? '')}
//           onChangeText={(v) => setExistingForm((prev) => ({ ...prev, [k]: v }))}
//           style={styles.input}
//           multiline={multilineFields.includes(k)}
//           keyboardType={
//             [
//               'initial_investment',
//               'working_capital_monthly',
//               'annual_turnover',
//               'profit_percentage',
//               'monthly_sales',
//             ].includes(k)
//               ? 'numeric'
//               : 'default'
//           }
//         />
//       </View>
//     );
//   };

//   return (
//     <View style={{ padding: 12, flex: 1 }}>
//       <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
//         Existing Enterprise — {beneficiary?.name || ''}
//       </Text>
//       <ScrollView nestedScrollEnabled>
//         {existingFieldsList.map((k) => renderField(k))}
//         <TouchableOpacity
//           style={styles.submitButton}
//           onPress={handleSubmit}
//           disabled={loading || uploading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.submitText}>Save Existing Enterprise</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }


// const styles = StyleSheet.create({
//   input: {
//     borderWidth: 1,
//     borderColor: '#EE6969',
//     padding: 10, 
//     borderRadius: 6,
//     marginBottom: 6,
//     backgroundColor: '#fff',
//   },
//   label: { fontWeight: '600', marginBottom: 6, textTransform: 'capitalize' },
//   smallBtn: {
//     backgroundColor: '#EEE',
//     padding: 8,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 8,
//     minWidth: 70,
//   },
//   smallBtnText: { color: '#333', fontWeight: '600' },
//   submitButton: {
//     backgroundColor: '#EE6969',
//     padding: 14,
//     borderRadius: 6,
//     marginTop: 12,
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   loanEntryContainer: {
//   borderWidth: 1,
//   borderColor: '#DDD',
//   borderRadius: 6,
//   padding: 10,
//   marginVertical: 10,
//   backgroundColor: '#FCFBF4',
// },
// addBtn: {
//   alignItems: 'center',
//   marginTop: 8,
//   marginBottom: 12,
// },
// deleteBtn: {
//   backgroundColor: '#EE6969',
//   marginTop: 8,
//   borderRadius: 6,
//   paddingVertical: 6,
//   alignItems: 'center',
// },

//   submitText: { color: '#fff', fontWeight: '600' },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
//   modalContent: { backgroundColor: '#fff', borderRadius: 12, minWidth: 250, paddingBottom: 15, paddingTop: 10 },
//   cancelBtn: { padding: 10, alignItems: 'center', marginTop: 8 },
// });

// const existingFieldsList = [
//   'enterprise_name',
//   'enterprise_type',
//   'ownership_type',
//   'year_of_establishment',
//   'raw_material',
//   'machinery_equipment',
//   'workplace_type',
//   'electricity_available',
//   'water_available',
//   'transportation_facility',
//   'initial_investment',
//   'source_of_investment',
//   'government_subsidy',
//    'loan_details',
//   'working_capital_monthly',
//   'annual_turnover',
//   'profit_percentage',
//   'main_product_service',
//   'product_features',
//   'production_capacity',
//   'packaging_branding_status',
//   'certification_registration',
//   'target_customers',
//   'marketing_channels',
//   'monthly_sales',
//   'marketing_strategy',
//   'marketing_challenges',
//   'training_received',
//   'skills_acquired',
//   'future_training_requirements',
//   'institutional_support',
//    'financial_linkage',
//   'financial_coordination',
//   'market_linkage',
//   'mentorship_support',
//   'expansion_plan',
//   'required_support',
//   'photo_enterprise',
//   'photo_entrepreneur',
//   'photo_product',
//   'certificate_docs',
// ];


// import React, { useState, useEffect } from 'react'; // Added useEffect
// import {
//   View,
//   Text,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   Modal,
//   Platform,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';

// export default function ExistingEnterpriseForm({
//   beneficiary,
//   existingForm,
//   setExistingForm,
//   certDocs,
//   addCertificateDoc,
//   removeCertificateDoc,
//   pickAndUpload,
//   takePhotoAndUploadLocal,
//   loading,
//   uploading,
//   handleSubmit,
// }) {
//   // Dropdown options
//   const enterpriseTypeOptions = [
//     { label: 'Manufacturing', value: 'Manufacturing' },
//     { label: 'Service', value: 'Service' },
//     { label: 'Trading', value: 'Trading' },
//     { label: 'Agri-based', value: 'Agri-based' },
//     { label: 'Animal Husbandry', value: 'Animal Husbandry' },
//     { label: 'Home-based', value: 'Home-based' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const ownershipTypeOptions = [
//     { label: 'Individual', value: 'Individual' },
//     { label: 'Partnership', value: 'Partnership' },
//     { label: 'SHG-based', value: 'SHG-based' },
//     { label: 'Family-owned', value: 'Family-owned' },
//     { label: 'Women Entrepreneur', value: 'Women Entrepreneur' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const productServicesOptions = [
//     { label: 'Tailoring/Embroidery', value: 'Tailoring/Embroidery' },
//     { label: 'Food Products', value: 'Food Products' },
//     { label: 'Handicrafts', value: 'Handicrafts' },
//     { label: 'Beauty/Wellness', value: 'Beauty/Wellness' },
//     { label: 'Dairy', value: 'Dairy' },
//     { label: 'Agriculture Products', value: 'Agriculture Products' },
//     { label: 'Digital Services', value: 'Digital Services' },
//     { label: 'Home Décor', value: 'Home Décor' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const rawMaterialTypeOptions = [
//     { label: 'Cloth', value: 'Cloth' },
//     { label: 'Wood', value: 'Wood' },
//     { label: 'Metal', value: 'Metal' },
//     { label: 'Plastic', value: 'Plastic' },
//     { label: 'Food Items', value: 'Food Items' },
//     { label: 'Paper', value: 'Paper' },
//     { label: 'Clay/Ceramic', value: 'Clay/Ceramic' },
//     { label: 'Natural/Organic', value: 'Natural/Organic' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const machineryEquipmentOptions = [
//     { label: 'Tailoring Machine', value: 'Tailoring Machine' },
//     { label: 'Cutter/Folding Machine', value: 'Cutter/Folding Machine' },
//     { label: 'Grinder/Mixer', value: 'Grinder/Mixer' },
//     { label: 'Packaging Machine', value: 'Packaging Machine' },
//     { label: 'Printing Machine', value: 'Printing Machine' },
//     { label: 'Flour Mill', value: 'Flour Mill' },
//     { label: 'Handy Tools', value: 'Handy Tools' },
//     { label: 'Digital Equipment', value: 'Digital Equipment' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const workplaceTypeOptions = [
//     { label: 'Home-based', value: 'Home-based' },
//     { label: 'Rented Place', value: 'Rented Place' },
//     { label: 'Own Workplace', value: 'Own Workplace' },
//     { label: 'SHG Center', value: 'SHG Center' },
//     { label: 'Community Workplace', value: 'Community Workplace' },
//     { label: 'Mobile/Itinerant', value: 'Mobile/Itinerant' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const institutionOptions = [
//     { label: 'Bank', value: 'Bank' },
//     { label: 'Microfinance', value: 'Microfinance' },
//     { label: 'NBFC', value: 'NBFC' },
//     { label: 'Cooperative Society', value: 'Cooperative Society' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const repaymentOptions = [
//     { label: 'Ongoing', value: 'Ongoing' },
//     { label: 'Completed', value: 'Completed' },
//     { label: 'Default / Pending', value: 'Default / Pending' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const marketingChannelOptions = [
//     { label: 'Retail', value: 'Retail' },
//     { label: 'Online', value: 'Online' },
//     { label: 'Exhibition', value: 'Exhibition' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const yesNoOptions = [
//     { label: 'Yes', value: 'Yes' },
//     { label: 'No', value: 'No' },
//   ];

//   const institutionalSupportOptions = [
//     { label: 'NRLM', value: 'NRLM' },
//     { label: 'SRLM', value: 'SRLM' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const financialLinkageOptions = [
//     { label: 'Bank', value: 'Bank' },
//     { label: 'Micro Finance', value: 'Micro Finance' },
//     { label: 'NBFC', value: 'NBFC' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const marketLinkageOptions = [
//     { label: 'ONDC', value: 'ONDC' },
//     { label: 'E-Commerce', value: 'E-Commerce' },
//     { label: 'Exhibition', value: 'Exhibition' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const requiredSupportOptions = [
//     { label: 'Finance', value: 'Finance' },
//     { label: 'Training', value: 'Training' },
//     { label: 'Advertisement / Promotion', value: 'Advertisement / Promotion' },
//     { label: 'Equipment', value: 'Equipment' },
//     { label: 'Others', value: 'Others' },
//   ];

//   const expansionPlanOptions = [
//     { label: 'New Product', value: 'New Product' },
//     { label: 'E-commerce', value: 'E-commerce' },
//     { label: 'Employment Generation', value: 'Employment Generation' },
//     { label: 'Others', value: 'Others' },
//   ];

//   // YEAR PICKER
//   const [yearPickerVisible, setYearPickerVisible] = useState(false);
//   const currentYear = new Date().getFullYear();
//   const startYear = 1950;
//   const yearOptions = [];
//   for (let y = currentYear; y >= startYear; y--) yearOptions.push(y.toString());

//   const [loans, setLoans] = useState([]);

//   // Initialize loans from existingForm on component mount or existingForm change
//   useEffect(() => {
//     try {
//       if (existingForm.loan_details && existingForm.loan_details !== 'Yes' && existingForm.loan_details !== 'No') {
//         setLoans(JSON.parse(existingForm.loan_details));
//       } else {
//         setLoans([]); // If it's "Yes" or "No", or empty, start fresh.
//       }
//     } catch (e) {
//       console.error("Error parsing loan_details:", e);
//       setLoans([]);
//     }
//   }, [existingForm.loan_details]);


//   // ---------------------------------------
//   // UPDATE LOANS IN BOTH LOCAL + PARENT FORM
//   // ---------------------------------------
//   const updateLoans = (newLoans) => {
//     setLoans(newLoans);
//     setExistingForm((f) => ({
//       ...f,
//       loan_details: JSON.stringify(newLoans),
//     }));
//   };

//   const updateLoanEntry = (index, updatedEntry) => {
//     const updated = [...loans];
//     updated[index] = updatedEntry;
//     updateLoans(updated);
//   };

//   const deleteLoanEntry = (index) => {
//     const updated = loans.filter((_, i) => i !== index);
//     updateLoans(updated);
//   };

//   const addLoanEntry = () => {
//     updateLoans([
//       ...loans,
//       {
//         institution: '',
//         institutionOther: '',
//         amount: '',
//         repayment: '',
//         repaymentOther: '',
//       },
//     ]);
//   };

//   // Helper to render dropdown selector with "Specify" input if Others selected
//   const renderPickerWithSpecify = (
//     label,
//     selectedValue,
//     onValueChange,
//     options,
//     specifyValue,
//     onSpecifyChange
//   ) => (
//     <View style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>{label}</Text>
//       <Picker
//         selectedValue={selectedValue}
//         onValueChange={(itemValue) => {
//           onValueChange(itemValue);
//           // Clear specify field if "Others" is deselected
//           if (itemValue !== 'Others' && specifyValue) {
//             onSpecifyChange('');
//           }
//         }}
//         style={styles.input}
//       >
//         <Picker.Item label="Select..." value="" />
//         {options.map((opt) => (
//           <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//         ))}
//       </Picker>
//       {selectedValue === 'Others' && (
//         <TextInput
//           value={specifyValue || ''}
//           onChangeText={onSpecifyChange}
//           placeholder="Specify"
//           style={[styles.input, { marginTop: 6 }]}
//         />
//       )}
//     </View>
//   );

//   const renderYesNoToggle = (label, selectedValue, onChange) => (
//     <View style={{ marginBottom: 8 }}>
//       <Text style={styles.label}>{label}</Text>
//       <View style={{ flexDirection: 'row', gap: 12 }}>
//         {yesNoOptions.map(({ label: l, value }) => (
//           <TouchableOpacity
//             key={value}
//             style={[
//               styles.smallBtn,
//               selectedValue === value && { backgroundColor: '#EE6969' },
//             ]}
//             onPress={() => onChange(value)}
//           >
//             <Text
//               style={{
//                 color: selectedValue === value ? '#fff' : '#333',
//                 fontWeight: '600',
//               }}
//             >
//               {l}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );

//   const LoanEntry = ({ entry, index, onUpdate, onDelete, allowDelete }) => (
//     <View style={styles.loanEntryContainer}>
//       <Text style={styles.label}>Loan Entry {index + 1}</Text>

//       {/* Institution Name (Dropdown) */}
//       <Picker
//         selectedValue={entry.institution}
//         onValueChange={val =>
//           onUpdate({
//             ...entry,
//             institution: val,
//             institutionOther: val === 'Others' ? entry.institutionOther : ''
//           })
//         }
//         style={styles.input}
//       >
//         <Picker.Item label="Select Institution" value="" />
//         {institutionOptions.map(opt => (
//           <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//         ))}
//       </Picker>
//       {entry.institution === 'Others' && (
//         <TextInput
//           placeholder="Specify Institution"
//           style={styles.input}
//           value={entry.institutionOther}
//           onChangeText={val => onUpdate({ ...entry, institutionOther: val })}
//         />
//       )}

//       {/* Loan Amount */}
//       <TextInput
//         placeholder="Loan Amount"
//         style={styles.input}
//         keyboardType="numeric"
//         value={String(entry.amount)} // Ensure value is a string
//         onChangeText={val =>
//           onUpdate({ ...entry, amount: val.replace(/[^0-9]/g, '') })
//         }
//       />

//       {/* Repayment Status (Dropdown) */}
//       <Picker
//         selectedValue={entry.repayment}
//         onValueChange={val =>
//           onUpdate({
//             ...entry,
//             repayment: val,
//             repaymentOther: val === 'Others' ? entry.repaymentOther : ''
//           })
//         }
//         style={styles.input}
//       >
//         <Picker.Item label="Select Repayment Status" value="" />
//         {repaymentOptions.map(opt => (
//           <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//         ))}
//       </Picker>
//       {entry.repayment === 'Others' && (
//         <TextInput
//           placeholder="Specify Repayment Status"
//           style={styles.input}
//           value={entry.repaymentOther}
//           onChangeText={val => onUpdate({ ...entry, repaymentOther: val })}
//         />
//       )}

//       {allowDelete && (
//         <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
//           <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete Loan</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   const toggleMarketingChannel = (value) => {
//     // Ensure marketing_channels is always an array
//     const currentChannels = Array.isArray(existingForm.marketing_channels)
//       ? [...existingForm.marketing_channels]
//       : [];

//     let updatedChannels;
//     let updatedMarketingOtherSpecify = existingForm.marketing_channels_other_specify;

//     if (currentChannels.includes(value)) {
//       // Remove value if already selected
//       updatedChannels = currentChannels.filter((item) => item !== value);
//       if (value === 'Others') {
//         updatedMarketingOtherSpecify = ''; // Clear specify if "Others" is deselected
//       }
//     } else {
//       // Add value if not already selected
//       updatedChannels = [...currentChannels, value];
//     }

//     setExistingForm({
//       ...existingForm,
//       marketing_channels: updatedChannels,
//       marketing_channels_other_specify: updatedMarketingOtherSpecify,
//     });
//   };

//   const multilineFields = [
//     'product_features',
//     'marketing_strategy',
//     'marketing_challenges',
//     'training_received',
//     'skills_acquired',
//     'future_training_requirements', // This is handled by a custom renderer, but keeping for reference
//     'required_support', // This is handled by a custom renderer, but keeping for reference
//     'financial_coordination',
//     'mentorship_support'
//   ];

//   const renderField = (k) => {
//     if (k === 'enterprise_type')
//       return renderPickerWithSpecify(
//         'Enterprise Type (उद्यम प्रकार)',
//         existingForm.enterprise_type,
//         (v) => setExistingForm((f) => ({ ...f, enterprise_type: v })),
//         enterpriseTypeOptions,
//         existingForm.enterprise_type_other,
//         (v) => setExistingForm((f) => ({ ...f, enterprise_type_other: v }))
//       );
//     if (k === 'ownership_type')
//       return renderPickerWithSpecify(
//         'Ownership Type (स्वामित्व प्रकार)',
//         existingForm.ownership_type,
//         (v) => setExistingForm((f) => ({ ...f, ownership_type: v })),
//         ownershipTypeOptions,
//         existingForm.ownership_type_other,
//         (v) => setExistingForm((f) => ({ ...f, ownership_type_other: v }))
//       );
//     if (k === 'main_product_service')
//       return renderPickerWithSpecify(
//         'Product / Services (उत्पाद / सेवाएँ)',
//         existingForm.main_product_service,
//         (v) => setExistingForm((f) => ({ ...f, main_product_service: v })),
//         productServicesOptions,
//         existingForm.main_product_service_other,
//         (v) => setExistingForm((f) => ({ ...f, main_product_service_other: v }))
//       );
//     if (k === 'raw_material')
//       return renderPickerWithSpecify(
//         'Raw Material Type (कच्चा माल प्रकार)',
//         existingForm.raw_material,
//         (v) => setExistingForm((f) => ({ ...f, raw_material: v })),
//         rawMaterialTypeOptions,
//         existingForm.raw_material_other,
//         (v) => setExistingForm((f) => ({ ...f, raw_material_other: v }))
//       );
//     if (k === 'machinery_equipment')
//       return renderPickerWithSpecify(
//         'Machinery & Equipment (मशीनरी / उपकरण)',
//         existingForm.machinery_equipment,
//         (v) => setExistingForm((f) => ({ ...f, machinery_equipment: v })),
//         machineryEquipmentOptions,
//         existingForm.machinery_equipment_other,
//         (v) => setExistingForm((f) => ({ ...f, machinery_equipment_other: v }))
//       );
//     if (k === 'workplace_type')
//       return renderPickerWithSpecify(
//         'Workplace Type (कार्यस्थल प्रकार)',
//         existingForm.workplace_type,
//         (v) => setExistingForm((f) => ({ ...f, workplace_type: v })),
//         workplaceTypeOptions,
//         existingForm.workplace_type_other,
//         (v) => setExistingForm((f) => ({ ...f, workplace_type_other: v }))
//       );

//     // Year Picker Modal
//     if (k === 'year_of_establishment') {
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Year of Establishment</Text>
//           <TouchableOpacity
//             style={[styles.input, { justifyContent: 'center', height: 44 }]}
//             onPress={() => setYearPickerVisible(true)}
//           >
//             <Text>{existingForm.year_of_establishment || 'Select Year'}</Text>
//           </TouchableOpacity>
//           <Modal
//             visible={yearPickerVisible}
//             transparent
//             animationType="slide"
//             onRequestClose={() => setYearPickerVisible(false)}
//           >
//             <View style={styles.modalBackdrop}>
//               <View style={styles.modalContent}>
//                 <Text style={[styles.label, { textAlign: 'center' }]}>Select Year</Text>
//                 <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, backgroundColor: '#fff', margin: 8 }}>
//                   <Picker
//                     selectedValue={existingForm.year_of_establishment}
//                     onValueChange={(itemValue) => {
//                       setExistingForm((f) => ({ ...f, year_of_establishment: itemValue }));
//                       setYearPickerVisible(false);
//                     }}
//                   >
//                     {yearOptions.map(year => (
//                       <Picker.Item label={year} value={year} key={year} />
//                     ))}
//                   </Picker>
//                 </View>
//                 <TouchableOpacity style={styles.cancelBtn} onPress={() => setYearPickerVisible(false)}>
//                   <Text style={{ color: '#EE6969', fontWeight: '600' }}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Modal>
//         </View>
//       );
//     }
//     if (k === 'electricity_available') {
//       const elec = existingForm.electricity_available || '';
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Electricity Availability</Text>

//           <Picker
//             selectedValue={elec}
//             onValueChange={v => setExistingForm(f => ({
//               ...f,
//               electricity_available: v,
//               electricity_more_detail: v === 'Yes' ? f.electricity_more_detail : '',
//               electricity_specify: '',
//             }))}
//             style={styles.input}
//           >
//             <Picker.Item label="Select..." value="" />
//             <Picker.Item label="Yes" value="Yes" />
//             <Picker.Item label="No" value="No" />
//           </Picker>

//           {elec === 'Yes' && (
//             <>
//               <Picker
//                 selectedValue={existingForm.electricity_more_detail || ''}
//                 onValueChange={v => setExistingForm(f => ({
//                   ...f,
//                   electricity_more_detail: v,
//                   electricity_specify: v === 'Others' ? f.electricity_specify : '',
//                 }))}
//                 style={[styles.input, { marginTop: 6 }]}
//               >
//                 <Picker.Item label="Select..." value="" />
//                 <Picker.Item label="Partial / Irregular" value="Partial / Irregular" />
//                 <Picker.Item label="Others" value="Others" />
//               </Picker>

//               {existingForm.electricity_more_detail === 'Others' && (
//                 <TextInput
//                   placeholder="Specify"
//                   value={existingForm.electricity_specify || ''}
//                   onChangeText={text => setExistingForm(f => ({
//                     ...f,
//                     electricity_specify: text,
//                   }))}
//                   style={[styles.input, { marginTop: 6 }]}
//                 />
//               )}
//             </>
//           )}
//         </View>
//       );
//     }

//     if (k === 'water_available') {
//       const water = existingForm.water_available || '';
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Water Availability</Text>

//           {/* Main Water Availability Picker */}
//           <Picker
//             selectedValue={water}
//             onValueChange={v => setExistingForm(f => ({
//               ...f,
//               water_available: v,
//               water_more_detail: v === 'Yes' ? f.water_more_detail : '',
//               water_specify: '',
//             }))}
//             style={styles.input}
//           >
//             <Picker.Item label="Select..." value="" />
//             <Picker.Item label="Yes" value="Yes" />
//             <Picker.Item label="No" value="No" />
//           </Picker>

//           {/* Show these only if Yes is selected */}
//           {water === 'Yes' && (
//             <>
//               <Picker
//                 selectedValue={existingForm.water_more_detail || ''}
//                 onValueChange={v => setExistingForm(f => ({
//                   ...f,
//                   water_more_detail: v,
//                   water_specify: v === 'Others' ? f.water_specify : '',
//                 }))}
//                 style={[styles.input, { marginTop: 6 }]}
//               >
//                 <Picker.Item label="Select..." value="" />
//                 <Picker.Item label="Limited" value="Limited" />
//                 <Picker.Item label="Others" value="Others" />
//               </Picker>

//               {/* Show specify input only if Others selected */}
//               {existingForm.water_more_detail === 'Others' && (
//                 <TextInput
//                   placeholder="Specify"
//                   value={existingForm.water_specify || ''}
//                   onChangeText={text => setExistingForm(f => ({
//                     ...f,
//                     water_specify: text,
//                   }))}
//                   style={[styles.input, { marginTop: 6 }]}
//                 />
//               )}
//             </>
//           )}
//         </View>
//       );
//     }

//     if (k === 'transportation_facility') {
//       const transport = existingForm.transportation_facility || '';
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Transport Availability</Text>
//           <Picker
//             selectedValue={transport}
//             onValueChange={v => setExistingForm(f => ({
//               ...f,
//               transportation_facility: v,
//               can_transport_clf: v === 'Yes' ? f.can_transport_clf : '',
//             }))}
//             style={styles.input}
//           >
//             <Picker.Item label="Select..." value="" />
//             <Picker.Item label="Yes" value="Yes" />
//             <Picker.Item label="No" value="No" />
//             <Picker.Item label="Need Help" value="Need Help" />
//           </Picker>

//           {transport === 'Yes' && (
//             <View style={{ marginTop: 8 }}>
//               <Text style={styles.label}>Can you transport/supply the product to the CLF?</Text>
//               <Picker
//                 selectedValue={existingForm.can_transport_clf || ''}
//                 onValueChange={v => setExistingForm(f => ({ ...f, can_transport_clf: v }))}
//                 style={styles.input}
//               >
//                 <Picker.Item label="Select..." value="" />
//                 <Picker.Item label="Yes" value="Yes" />
//                 <Picker.Item label="No" value="No" />
//               </Picker>
//             </View>
//           )}
//         </View>
//       );
//     }
//     if (k === 'source_of_investment') {
//       const source = existingForm.source_of_investment || '';
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Source of Investment</Text>
//           <Picker
//             selectedValue={source}
//             onValueChange={(v) => setExistingForm(f => ({
//               ...f,
//               source_of_investment: v,
//               source_of_investment_specify: v === 'Others' ? f.source_of_investment_specify : '',
//             }))}
//             style={styles.input}
//           >
//             <Picker.Item label="Select..." value="" />
//             <Picker.Item label="CCL" value="CCL" />
//             <Picker.Item label="CIF" value="CIF" />
//             <Picker.Item label="Livelihood Fund" value="Livelihood Fund" />
//             <Picker.Item label="CEF" value="CEF" />
//             <Picker.Item label="Others" value="Others" />
//           </Picker>
//           {existingForm.source_of_investment === 'Others' && (
//             <TextInput
//               placeholder="Specify"
//               value={existingForm.source_of_investment_specify || ''}
//               onChangeText={text => setExistingForm(f => ({
//                 ...f,
//                 source_of_investment_specify: text,
//               }))}
//               style={[styles.input, { marginTop: 6 }]}
//             />
//           )}
//         </View>
//       );
//     }

//     if (k === 'government_subsidy') {
//       const subsidy = existingForm.government_subsidy || '';
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>
//             Have you received any government subsidy / financial assistance?
//           </Text>
//           <Picker
//             selectedValue={subsidy}
//             onValueChange={(v) => setExistingForm(f => ({
//               ...f,
//               government_subsidy: v,
//               subsidy_department: v === 'Yes' ? f.subsidy_department : '',
//               subsidy_scheme: v === 'Yes' ? f.subsidy_scheme : '',
//             }))}
//             style={styles.input}
//           >
//             <Picker.Item label="Select..." value="" />
//             <Picker.Item label="Yes" value="Yes" />
//             <Picker.Item label="No" value="No" />
//           </Picker>
//           {subsidy === 'Yes' && (
//             <>
//               <TextInput
//                 placeholder="Department Name"
//                 value={existingForm.subsidy_department || ''}
//                 onChangeText={text => setExistingForm(f => ({ ...f, subsidy_department: text }))}
//                 style={[styles.input, { marginTop: 6 }]}
//               />
//               <TextInput
//                 placeholder="Scheme Name"
//                 value={existingForm.subsidy_scheme || ''}
//                 onChangeText={text => setExistingForm(f => ({ ...f, subsidy_scheme: text }))}
//                 style={[styles.input, { marginTop: 6 }]}
//               />
//             </>
//           )}
//         </View>
//       );
//     }

//     if (k === 'loan_details') {
//       // loan_details may be:
//       // "Yes", "No", or a JSON string of the array
//       const raw = existingForm.loan_details;

//       // Determine the selection for the Yes/No picker
//       const loanAnswer = (Array.isArray(loans) && loans.length > 0) ? "Yes" :
//         (raw === "No" ? "No" : ""); // Default to empty if not "No" and no loans

//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Have you taken any loan?</Text>

//           <Picker
//             selectedValue={loanAnswer}
//             onValueChange={(v) => {
//               if (v === "No") {
//                 // If user selects "No", clear loans
//                 setLoans([]);
//                 setExistingForm(f => ({
//                   ...f,
//                   loan_details: "No" // Store "No" directly as text
//                 }));
//               } else if (v === "Yes") {
//                 // If user selects "Yes" and there are no loans, add a default one
//                 if (loans.length === 0) {
//                   addLoanEntry();
//                 } else {
//                   // If there are already loans, ensure loan_details is JSON string
//                   setExistingForm(f => ({
//                     ...f,
//                     loan_details: JSON.stringify(loans)
//                   }));
//                 }
//               } else { // Handle initial empty state or "Select..."
//                 setLoans([]);
//                 setExistingForm(f => ({
//                   ...f,
//                   loan_details: ""
//                 }));
//               }
//             }}
//             style={styles.input}
//           >
//             <Picker.Item label="Select..." value="" />
//             <Picker.Item label="Yes" value="Yes" />
//             <Picker.Item label="No" value="No" />
//           </Picker>

//           {/* If Yes → show loan entries */}
//           {loanAnswer === "Yes" && (
//             <>
//               {loans.map((loanEntry, idx) => (
//                 <LoanEntry
//                   key={idx}
//                   index={idx}
//                   entry={loanEntry}
//                   onUpdate={(updated) => updateLoanEntry(idx, updated)}
//                   onDelete={() => deleteLoanEntry(idx)}
//                   allowDelete={loans.length > 1}
//                 />
//               ))}

//               <TouchableOpacity
//                 style={styles.addBtn}
//                 onPress={addLoanEntry}
//               >
//                 <Text style={{ color: "#EE6969", fontWeight: "bold" }}>
//                   ➕ Add Another Loan
//                 </Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       );
//     }

//     if (k === 'marketing_channels') {
//       const selected = Array.isArray(existingForm.marketing_channels) ? existingForm.marketing_channels : [];
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Marketing Channels</Text>
//           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//             {marketingChannelOptions.map(({ label, value }) => (
//               <TouchableOpacity
//                 key={value}
//                 style={[
//                   styles.smallBtn,
//                   selected.includes(value) && { backgroundColor: '#EE6969' },
//                 ]}
//                 onPress={() => toggleMarketingChannel(value)}
//               >
//                 <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>{label}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//           {selected.includes('Others') && (
//             <TextInput
//               placeholder="Specify Other Channels"
//               style={[styles.input, { marginTop: 6 }]}
//               value={existingForm.marketing_channels_other_specify || ''}
//               onChangeText={text => setExistingForm(f => ({ ...f, marketing_channels_other_specify: text }))}
//             />
//           )}
//         </View>
//       );
//     }

//     if (k === 'future_training_requirements') {
//       const val = existingForm.additional_training_required || '';
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           {renderYesNoToggle(
//             'Will you require additional training in the future?',
//             val,
//             (v) => {
//               setExistingForm((f) => ({
//                 ...f,
//                 additional_training_required: v,
//                 // Clear dependent fields if "No" is selected
//                 training_skill_name: v === 'No' ? '' : f.training_skill_name,
//                 training_type: v === 'No' ? '' : f.training_type,
//                 training_institution: v === 'No' ? '' : f.training_institution,
//               }));
//             }
//           )}

//           {val === 'Yes' && (
//             <View style={{ marginTop: 8 }}>
//               <Text style={styles.label}>Please provide details of the required training:</Text>

//               <TextInput
//                 placeholder="Skill name"
//                 style={styles.input}
//                 value={existingForm.training_skill_name || ''}
//                 onChangeText={(text) =>
//                   setExistingForm((f) => ({ ...f, training_skill_name: text }))
//                 }
//               />

//               <TextInput
//                 placeholder="Type of training (Technical / Business / Digital, etc.)"
//                 style={styles.input}
//                 value={existingForm.training_type || ''}
//                 onChangeText={(text) =>
//                   setExistingForm((f) => ({ ...f, training_type: text }))
//                 }
//               />

//               <TextInput
//                 placeholder="Specific institution or department requirement (if applicable)"
//                 style={styles.input}
//                 value={existingForm.training_institution || ''}
//                 onChangeText={(text) =>
//                   setExistingForm((f) => ({ ...f, training_institution: text }))
//                 }
//               />
//             </View>
//           )}
//         </View>
//       );
//     }

//     if (k === 'institutional_support') {
//       const val = existingForm.institutional_support || '';
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Institutional Support</Text>
//           <Picker
//             selectedValue={val}
//             onValueChange={(v) => setExistingForm(f => ({
//               ...f,
//               institutional_support: v,
//               institutional_support_other: v === 'Others' ? f.institutional_support_other : '', // Clear if not "Others"
//             }))}
//             style={styles.input}
//           >
//             <Picker.Item label="Select..." value="" />
//             {institutionalSupportOptions.map(opt => (
//               <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//             ))}
//           </Picker>

//           {val === 'Others' && (
//             <TextInput
//               placeholder="Please enter the name/details of the institution."
//               value={existingForm.institutional_support_other || ''}
//               onChangeText={text => setExistingForm(f => ({ ...f, institutional_support_other: text }))}
//               style={[styles.input, { marginTop: 6 }]}
//             />
//           )}
//         </View>
//       );
//     }

//     if (k === 'financial_linkage') {
//       const val = existingForm.financial_linkage || '';
//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Financial Linkage</Text>
//           <Picker
//             selectedValue={val}
//             onValueChange={(v) =>
//               setExistingForm(f => ({
//                 ...f,
//                 financial_linkage: v,
//                 financial_linkage_other: v === 'Others' ? f.financial_linkage_other : '', // Clear if not "Others"
//               }))
//             }
//             style={styles.input}
//           >
//             <Picker.Item label="Select..." value="" />
//             {financialLinkageOptions.map(opt => (
//               <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//             ))}
//           </Picker>

//           {val === 'Others' && (
//             <TextInput
//               placeholder="Specify"
//               value={existingForm.financial_linkage_other || ''}
//               onChangeText={text =>
//                 setExistingForm(f => ({ ...f, financial_linkage_other: text }))
//               }
//               style={[styles.input, { marginTop: 6 }]}
//             />
//           )}
//         </View>
//       );
//     }

//     if (k === 'required_support') {
//       const selected = Array.isArray(existingForm.required_support) ? existingForm.required_support : [];

//       const toggleOption = (value) => {
//         let updated = [...selected];
//         if (updated.includes(value)) {
//           updated = updated.filter(v => v !== value);
//         } else {
//           updated.push(value);
//         }
//         setExistingForm(f => ({ ...f, required_support: updated }));
//         // Clear 'others' text if Others unchecked
//         if (value === 'Others' && updated.indexOf('Others') === -1) {
//           setExistingForm(f => ({ ...f, required_support_other: '' }));
//         }
//       };

//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Required Support</Text>
//           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//             {requiredSupportOptions.map(({ label, value }) => (
//               <TouchableOpacity
//                 key={value}
//                 style={[
//                   styles.smallBtn,
//                   selected.includes(value) && { backgroundColor: '#EE6969' },
//                 ]}
//                 onPress={() => toggleOption(value)}
//               >
//                 <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>
//                   {label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {selected.includes('Others') && (
//             <TextInput
//               placeholder="Specify"
//               style={[styles.input, { marginTop: 6 }]}
//               value={existingForm.required_support_other || ''}
//               onChangeText={text => setExistingForm(f => ({ ...f, required_support_other: text }))}
//             />
//           )}
//         </View>
//       );
//     }

//     if (k === 'expansion_plan') {
//       const selected = Array.isArray(existingForm.expansion_plan) ? existingForm.expansion_plan : [];

//       const toggleOption = (value) => {
//         let updated = [...selected];
//         if (updated.includes(value)) {
//           updated = updated.filter(v => v !== value);
//         } else {
//           updated.push(value);
//         }
//         setExistingForm(f => ({ ...f, expansion_plan: updated }));
//         // Clear 'others' text if Others unchecked
//         if (value === 'Others' && updated.indexOf('Others') === -1) {
//           setExistingForm(f => ({ ...f, expansion_plan_other: '' }));
//         }
//       };

//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Expansion Plan</Text>
//           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//             {expansionPlanOptions.map(({ label, value }) => (
//               <TouchableOpacity
//                 key={value}
//                 style={[
//                   styles.smallBtn,
//                   selected.includes(value) && { backgroundColor: '#EE6969' },
//                 ]}
//                 onPress={() => toggleOption(value)}
//               >
//                 <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>
//                   {label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {selected.includes('Others') && (
//             <TextInput
//               placeholder="Specify"
//               style={[styles.input, { marginTop: 6 }]}
//               value={existingForm.expansion_plan_other || ''}
//               onChangeText={text => setExistingForm(f => ({ ...f, expansion_plan_other: text }))}
//             />
//           )}
//         </View>
//       );
//     }

//     if (k === 'market_linkage') {
//       const selected = Array.isArray(existingForm.market_linkage) ? existingForm.market_linkage : [];

//       const toggleOption = (value) => {
//         let updated = [...selected];
//         if (updated.includes(value)) {
//           updated = updated.filter(v => v !== value);
//         } else {
//           updated.push(value);
//         }
//         setExistingForm(f => ({ ...f, market_linkage: updated }));
//         // Clear 'others' text if Others unchecked
//         if (value === 'Others' && updated.indexOf('Others') === -1) {
//           setExistingForm(f => ({ ...f, market_linkage_other: '' }));
//         }
//       };

//       return (
//         <View key={k} style={{ marginBottom: 8 }}>
//           <Text style={styles.label}>Market Linkages</Text>
//           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//             {marketLinkageOptions.map(({ label, value }) => (
//               <TouchableOpacity
//                 key={value}
//                 style={[
//                   styles.smallBtn,
//                   selected.includes(value) && { backgroundColor: '#EE6969' },
//                 ]}
//                 onPress={() => toggleOption(value)}
//               >
//                 <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>
//                   {label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {selected.includes('Others') && (
//             <TextInput
//               placeholder="Specify"
//               style={[styles.input, { marginTop: 6 }]}
//               value={existingForm.market_linkage_other || ''}
//               onChangeText={text => setExistingForm(f => ({ ...f, market_linkage_other: text }))}
//             />
//           )}
//         </View>
//       );
//     }

//     if (k === 'certification_registration')
//       return renderYesNoToggle('Certification / Registration?', existingForm.certification_registration, (v) => setExistingForm((f) => ({ ...f, certification_registration: v })));

//     // Removed the old 'loan_details' block that was simplified above.

//     if (k === 'certificate_docs') {
//       return (
//         <View key={k} style={{ marginBottom: 10 }}>
//           <Text style={styles.label}>Certificate Documents</Text>
//           <View style={{ flexDirection: 'row', gap: 8 }}>
//             <TouchableOpacity style={styles.smallBtn} onPress={addCertificateDoc}>
//               <Text style={styles.smallBtnText}>Add Document</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={{ marginTop: 8 }}>
//             {certDocs.length === 0 ? (
//               <Text style={{ color: '#666' }}>(none)</Text>
//             ) : (
//               <FlatList
//                 data={certDocs}
//                 keyExtractor={(item, index) => String(index)}
//                 renderItem={({ item, index }) => (
//                   <View key={index} style={{
//                     flexDirection: 'row',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     marginBottom: 6,
//                   }}>
//                     <Text style={{ flex: 1 }} numberOfLines={1}>{item}</Text>
//                     <TouchableOpacity onPress={() => removeCertificateDoc(index)} style={{ padding: 6 }}>
//                       <Text style={{ color: '#EE6969' }}>Remove</Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}
//               />
//             )}
//           </View>
//         </View>
//       );
//     }
//     if (
//       ['photo_enterprise', 'photo_entrepreneur', 'photo_product'].includes(k)
//     ) {
//       const current = existingForm[k] || '';
//       const labelMap = {
//         photo_enterprise: 'Photo Enterprise',
//         photo_entrepreneur: 'Photo Entrepreneur',
//         photo_product: 'Photo Product',
//       };
//       return (
//         <View key={k} style={{ marginBottom: 10 }}>
//           <Text style={styles.label}>{labelMap[k]}</Text>
//           <View style={{ flexDirection: 'row', gap: 8 }}>
//             <TouchableOpacity
//               style={styles.smallBtn}
//               onPress={() => pickAndUpload(k)}
//             >
//               <Text style={styles.smallBtnText}>Pick</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.smallBtn}
//               onPress={() => takePhotoAndUploadLocal(k)}
//             >
//               <Text style={styles.smallBtnText}>Camera</Text>
//             </TouchableOpacity>
//           </View>
//           {current ? (
//             <Text style={{ color: '#333', marginTop: 6 }} numberOfLines={1}>
//               {current}
//             </Text>
//           ) : null}
//         </View>
//       );
//     }
//     return (
//       <View key={k} style={{ marginBottom: 8 }}>
//         <Text style={styles.label}>{k.replace(/_/g, ' ')}</Text>
//         <TextInput
//           value={String(existingForm[k] ?? '')}
//           onChangeText={(v) => setExistingForm((prev) => ({ ...prev, [k]: v }))}
//           style={styles.input}
//           multiline={multilineFields.includes(k)}
//           keyboardType={
//             [
//               'initial_investment',
//               'working_capital_monthly',
//               'annual_turnover',
//               'profit_percentage',
//               'monthly_sales',
//             ].includes(k)
//               ? 'numeric'
//               : 'default'
//           }
//         />
//       </View>
//     );
//   };

//   return (
//     <View style={{ padding: 12, flex: 1 }}>
//       <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
//         Existing Enterprise — {beneficiary?.name || ''}
//       </Text>
//       <ScrollView nestedScrollEnabled>
//         {existingFieldsList.map((k) => renderField(k))}
//         <TouchableOpacity
//           style={styles.submitButton}
//           onPress={handleSubmit}
//           disabled={loading || uploading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.submitText}>Save Existing Enterprise</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }


// const styles = StyleSheet.create({
//   input: {
//     borderWidth: 1,
//     borderColor: '#EE6969',
//     padding: 10,
//     borderRadius: 6,
//     marginBottom: 6,
//     backgroundColor: '#fff',
//   },
//   label: { fontWeight: '600', marginBottom: 6, textTransform: 'capitalize' },
//   smallBtn: {
//     backgroundColor: '#EEE',
//     padding: 8,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 8,
//     minWidth: 70,
//   },
//   smallBtnText: { color: '#333', fontWeight: '600' },
//   submitButton: {
//     backgroundColor: '#EE6969',
//     padding: 14,
//     borderRadius: 6,
//     marginTop: 12,
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   loanEntryContainer: {
//     borderWidth: 1,
//     borderColor: '#DDD',
//     borderRadius: 6,
//     padding: 10,
//     marginVertical: 10,
//     backgroundColor: '#FCFBF4',
//   },
//   addBtn: {
//     alignItems: 'center',
//     marginTop: 8,
//     marginBottom: 12,
//   },
//   deleteBtn: {
//     backgroundColor: '#EE6969',
//     marginTop: 8,
//     borderRadius: 6,
//     paddingVertical: 6,
//     alignItems: 'center',
//   },

//   submitText: { color: '#fff', fontWeight: '600' },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
//   modalContent: { backgroundColor: '#fff', borderRadius: 12, minWidth: 250, paddingBottom: 15, paddingTop: 10 },
//   cancelBtn: { padding: 10, alignItems: 'center', marginTop: 8 },
// });

// const existingFieldsList = [
//   'enterprise_name',
//   'enterprise_type',
//   'ownership_type',
//   'year_of_establishment',
//   'raw_material',
//   'machinery_equipment',
//   'workplace_type',
//   'electricity_available',
//   'water_available',
//   'transportation_facility',
//   'initial_investment',
//   'source_of_investment',
//   'government_subsidy',
//   'loan_details',
//   'working_capital_monthly',
//   'annual_turnover',
//   'profit_percentage',
//   'main_product_service',
//   'product_features',
//   'production_capacity',
//   'packaging_branding_status',
//   'certification_registration',
//   'target_customers',
//   'marketing_channels',
//   'monthly_sales',
//   'marketing_strategy',
//   'marketing_challenges',
//   'training_received',
//   'skills_acquired',
//   'future_training_requirements',
//   'institutional_support',
//   'financial_linkage',
//   'financial_coordination',
//   'market_linkage',
//   'mentorship_support',
//   'expansion_plan',
//   'required_support',
//   'photo_enterprise',
//   'photo_entrepreneur',
//   'photo_product',
//   'certificate_docs',
// ];






import React, { useState, useEffect } from 'react';
import {
View,
Text,
ScrollView,
TextInput,
TouchableOpacity,
FlatList,
ActivityIndicator,
StyleSheet,
Modal,
Platform,
Alert, // Added for potential error display
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
// Moved existingFieldsList to before the component export for clarity
const existingFieldsList = [
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
'government_subsidy',
'loan_details',
'working_capital_monthly',
'annual_turnover',
'profit_percentage',
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
'financial_linkage',
'financial_coordination',
'market_linkage',
'mentorship_support',
'expansion_plan',
'required_support',
'photo_enterprise',
'photo_entrepreneur',
'photo_product',
'certificate_docs',
];
export default function ExistingEnterpriseForm({
beneficiary,
existingForm,
setExistingForm,
certDocs,
addCertificateDoc,
removeCertificateDoc,
pickAndUpload,
takePhotoAndUploadLocal,
loading,
uploading,
handleSubmit,
}) {
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
// YEAR PICKER
const [yearPickerVisible, setYearPickerVisible] = useState(false);
const currentYear = new Date().getFullYear();
const startYear = 1950;
const yearOptions = [];
for (let y = currentYear; y >= startYear; y--) yearOptions.push(y.toString());
const [loans, setLoans] = useState([]);
// Initialize loans from existingForm on component mount or existingForm change
useEffect(() => {
try {
if (existingForm.loan_details && typeof existingForm.loan_details === 'string') {
const parsed = JSON.parse(existingForm.loan_details);
if (Array.isArray(parsed)) {
setLoans(parsed);
} else {
setLoans([]); // If it's not an array after parsing, reset
}
} else if (Array.isArray(existingForm.loan_details)) {
setLoans(existingForm.loan_details); // Handle if it's already an array
} else {
setLoans([]); // If it's "Yes" or "No", or empty/null/undefined, start fresh.
}
} catch (e) {
console.error("Error parsing loan_details:", e);
setLoans([]); // Fallback to empty array on parse error
}
}, [existingForm.loan_details]);
// ---------------------------------------
// UPDATE LOANS IN BOTH LOCAL + PARENT FORM
// ---------------------------------------
const updateLoans = (newLoans) => {
setLoans(newLoans);
setExistingForm((f) => ({
...f,
loan_details: newLoans.length > 0 ? JSON.stringify(newLoans) : 'No', // Store "No" if no loans, otherwise JSON
}));
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
// Helper to render dropdown selector with "Specify" input if Others selected
const renderPickerWithSpecify = (
label,
selectedValue,
onValueChange,
options,
specifyValue,
onSpecifyChange
) => (
<View key={label} style={{ marginBottom: 8 }}> {/* Added key */}
<Text style={styles.label}>{label}</Text>
<Picker
selectedValue={selectedValue}
onValueChange={(itemValue) => {
onValueChange(itemValue);
// Clear specify field if "Others" is deselected
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
<View key={label} style={{ marginBottom: 8 }}> {/* Added key */}
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
<View key={index} style={styles.loanEntryContainer}> {/* Added key */}
<Text style={styles.label}>Loan Entry {index + 1}</Text>
{/* Institution Name (Dropdown) */}
  <Picker
    selectedValue={entry.institution}
    onValueChange={val =>
      onUpdate({
        ...entry,
        institution: val,
        institutionOther: val === 'Others' ? entry.institutionOther : ''
      })
    }
    style={styles.input}
  >
    <Picker.Item label="Select Institution" value="" />
    {institutionOptions.map(opt => (
      <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
    ))}
  </Picker>
  {entry.institution === 'Others' && (
    <TextInput
      placeholder="Specify Institution"
      style={styles.input}
      value={entry.institutionOther}
      onChangeText={val => onUpdate({ ...entry, institutionOther: val })}
    />
  )}

  {/* Loan Amount */}
  <TextInput
    placeholder="Loan Amount"
    style={styles.input}
    keyboardType="numeric"
    value={String(entry.amount ?? '')} // Ensure value is a string and handle null/undefined
    onChangeText={val =>
      onUpdate({ ...entry, amount: val.replace(/[^0-9]/g, '') })
    }
  />

  {/* Repayment Status (Dropdown) */}
  <Picker
    selectedValue={entry.repayment}
    onValueChange={val =>
      onUpdate({
        ...entry,
        repayment: val,
        repaymentOther: val === 'Others' ? entry.repaymentOther : ''
      })
    }
    style={styles.input}
  >
    <Picker.Item label="Select Repayment Status" value="" />
    {repaymentOptions.map(opt => (
      <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
    ))}
  </Picker>
  {entry.repayment === 'Others' && (
    <TextInput
      placeholder="Specify Repayment Status"
      style={styles.input}
      value={entry.repaymentOther}
      onChangeText={val => onUpdate({ ...entry, repaymentOther: val })}
    />
  )}

  {allowDelete && (
    <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete Loan</Text>
    </TouchableOpacity>
  )}
</View>
);
const toggleMarketingChannel = (value) => {
// Ensure marketing_channels is always an array
const currentChannels = Array.isArray(existingForm.marketing_channels)
? [...existingForm.marketing_channels]
: [];
let updatedChannels;
let updatedMarketingOtherSpecify = existingForm.marketing_channels_other_specify;

if (currentChannels.includes(value)) {
  // Remove value if already selected
  updatedChannels = currentChannels.filter((item) => item !== value);
  if (value === 'Others') {
    updatedMarketingOtherSpecify = ''; // Clear specify if "Others" is deselected
  }
} else {
  // Add value if not already selected
  updatedChannels = [...currentChannels, value];
}

setExistingForm({
  ...existingForm,
  marketing_channels: updatedChannels,
  marketing_channels_other_specify: updatedMarketingOtherSpecify,
});
};
const multilineFields = [
'product_features',
'marketing_strategy',
'marketing_challenges',
'training_received',
'skills_acquired',
'future_training_requirements', // This is handled by a custom renderer, but keeping for reference
'required_support', // This is handled by a custom renderer, but keeping for reference
'financial_coordination',
'mentorship_support'
];
const renderField = (k) => {
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
(v) => setExistingForm((f) => ({ ...f, main_product_service: v })),
productServicesOptions,
existingForm.main_product_service_other,
(v) => setExistingForm((f) => ({ ...f, main_product_service_other: v }))
);
if (k === 'raw_material')
return renderPickerWithSpecify(
'Raw Material Type (कच्चा माल प्रकार)',
existingForm.raw_material,
(v) => setExistingForm((f) => ({ ...f, raw_material: v })),
rawMaterialTypeOptions,
existingForm.raw_material_other,
(v) => setExistingForm((f) => ({ ...f, raw_material_other: v }))
);
if (k === 'machinery_equipment')
return renderPickerWithSpecify(
'Machinery & Equipment (मशीनरी / उपकरण)',
existingForm.machinery_equipment,
(v) => setExistingForm((f) => ({ ...f, machinery_equipment: v })),
machineryEquipmentOptions,
existingForm.machinery_equipment_other,
(v) => setExistingForm((f) => ({ ...f, machinery_equipment_other: v }))
);
if (k === 'workplace_type')
return renderPickerWithSpecify(
'Workplace Type (कार्यस्थल प्रकार)',
existingForm.workplace_type,
(v) => setExistingForm((f) => ({ ...f, workplace_type: v })),
workplaceTypeOptions,
existingForm.workplace_type_other,
(v) => setExistingForm((f) => ({ ...f, workplace_type_other: v }))
);
// Year Picker Modal
if (k === 'year_of_establishment') {
  return (
    <View key={k} style={{ marginBottom: 8 }}>
      <Text style={styles.label}>Year of Establishment</Text>
      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center', height: 44 }]}
        onPress={() => setYearPickerVisible(true)}
      >
        <Text>{existingForm.year_of_establishment || 'Select Year'}</Text>
      </TouchableOpacity>
      <Modal
        visible={yearPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setYearPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={[styles.label, { textAlign: 'center' }]}>Select Year</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, backgroundColor: '#fff', margin: 8 }}>
              <Picker
                selectedValue={existingForm.year_of_establishment}
                onValueChange={(itemValue) => {
                  setExistingForm((f) => ({ ...f, year_of_establishment: itemValue }));
                  setYearPickerVisible(false);
                }}
              >
                {yearOptions.map(year => (
                  <Picker.Item label={year} value={year} key={year} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setYearPickerVisible(false)}>
              <Text style={{ color: '#EE6969', fontWeight: '600' }}>Cancel</Text>
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
        onValueChange={v => setExistingForm(f => ({
          ...f,
          electricity_available: v,
          electricity_more_detail: v === 'Yes' ? f.electricity_more_detail : '',
          electricity_specify: '',
        }))}
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
            onValueChange={v => setExistingForm(f => ({
              ...f,
              electricity_more_detail: v,
              electricity_specify: v === 'Others' ? f.electricity_specify : '',
            }))}
            style={[styles.input, { marginTop: 6 }]}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="Partial / Irregular" value="Partial / Irregular" />
            <Picker.Item label="Others" value="Others" />
          </Picker>

          {existingForm.electricity_more_detail === 'Others' && (
            <TextInput
              placeholder="Specify"
              value={existingForm.electricity_specify || ''}
              onChangeText={text => setExistingForm(f => ({
                ...f,
                electricity_specify: text,
              }))}
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

      {/* Main Water Availability Picker */}
      <Picker
        selectedValue={water}
        onValueChange={v => setExistingForm(f => ({
          ...f,
          water_available: v,
          water_more_detail: v === 'Yes' ? f.water_more_detail : '',
          water_specify: '',
        }))}
        style={styles.input}
      >
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Yes" value="Yes" />
        <Picker.Item label="No" value="No" />
      </Picker>

      {/* Show these only if Yes is selected */}
      {water === 'Yes' && (
        <>
          <Picker
            selectedValue={existingForm.water_more_detail || ''}
            onValueChange={v => setExistingForm(f => ({
              ...f,
              water_more_detail: v,
              water_specify: v === 'Others' ? f.water_specify : '',
            }))}
            style={[styles.input, { marginTop: 6 }]}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="Limited" value="Limited" />
            <Picker.Item label="Others" value="Others" />
          </Picker>

          {/* Show specify input only if Others selected */}
          {existingForm.water_more_detail === 'Others' && (
            <TextInput
              placeholder="Specify"
              value={existingForm.water_specify || ''}
              onChangeText={text => setExistingForm(f => ({
                ...f,
                water_specify: text,
              }))}
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
        onValueChange={v => setExistingForm(f => ({
          ...f,
          transportation_facility: v,
          can_transport_clf: v === 'Yes' ? f.can_transport_clf : '',
        }))}
        style={styles.input}
      >
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Yes" value="Yes" />
        <Picker.Item label="No" value="No" />
        <Picker.Item label="Need Help" value="Need Help" />
      </Picker>

      {transport === 'Yes' && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.label}>Can you transport/supply the product to the CLF?</Text>
          <Picker
            selectedValue={existingForm.can_transport_clf || ''}
            onValueChange={v => setExistingForm(f => ({ ...f, can_transport_clf: v }))}
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
        onValueChange={(v) => setExistingForm(f => ({
          ...f,
          source_of_investment: v,
          source_of_investment_specify: v === 'Others' ? f.source_of_investment_specify : '',
        }))}
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
          onChangeText={text => setExistingForm(f => ({
            ...f,
            source_of_investment_specify: text,
          }))}
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
        onValueChange={(v) => setExistingForm(f => ({
          ...f,
          government_subsidy: v,
          subsidy_department: v === 'Yes' ? f.subsidy_department : '',
          subsidy_scheme: v === 'Yes' ? f.subsidy_scheme : '',
        }))}
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
            onChangeText={text => setExistingForm(f => ({ ...f, subsidy_department: text }))}
            style={[styles.input, { marginTop: 6 }]}
          />
          <TextInput
            placeholder="Scheme Name"
            value={existingForm.subsidy_scheme || ''}
            onChangeText={text => setExistingForm(f => ({ ...f, subsidy_scheme: text }))}
            style={[styles.input, { marginTop: 6 }]}
          />
        </>
      )}
    </View>
  );
}

if (k === 'loan_details') {
  const loanAnswer = (loans.length > 0) ? "Yes" :
                     (existingForm.loan_details === "No" ? "No" : ""); // Handle "No" string explicitly

  return (
    <View key={k} style={{ marginBottom: 8 }}>
      <Text style={styles.label}>Have you taken any loan?</Text>

      <Picker
        selectedValue={loanAnswer}
        onValueChange={(v) => {
          if (v === "No") {
            setLoans([]); // Clear local loans
            setExistingForm(f => ({ ...f, loan_details: "No" })); // Explicitly set to "No" string
          } else if (v === "Yes") {
            if (loans.length === 0) {
              addLoanEntry(); // Add a default loan if none exist
            } else {
              // If loans exist, ensure `loan_details` is a JSON string of them
              setExistingForm(f => ({ ...f, loan_details: JSON.stringify(loans) }));
            }
          } else { // "Select..." or initial empty
            setLoans([]);
            setExistingForm(f => ({ ...f, loan_details: "" }));
          }
        }}
        style={styles.input}
      >
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Yes" value="Yes" />
        <Picker.Item label="No" value="No" />
      </Picker>

      {/* If Yes → show loan entries */}
      {loanAnswer === "Yes" && (
        <>
          {loans.map((loanEntry, idx) => (
            <LoanEntry
              key={`loan-${idx}`} // Unique key for loan entries
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
            <Text style={{ color: "#EE6969", fontWeight: "bold" }}>
              ➕ Add Another Loan
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

if (k === 'marketing_channels') {
  const selected = Array.isArray(existingForm.marketing_channels) ? existingForm.marketing_channels : [];
  return (
    <View key={k} style={{ marginBottom: 8 }}>
      <Text style={styles.label}>Marketing Channels</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {marketingChannelOptions.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.smallBtn,
              selected.includes(value) && { backgroundColor: '#EE6969' },
            ]}
            onPress={() => toggleMarketingChannel(value)}
          >
            <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selected.includes('Others') && (
        <TextInput
          placeholder="Specify Other Channels"
          style={[styles.input, { marginTop: 6 }]}
          value={existingForm.marketing_channels_other_specify || ''}
          onChangeText={text => setExistingForm(f => ({ ...f, marketing_channels_other_specify: text }))}
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
            // Clear dependent fields if "No" is selected
            training_skill_name: v === 'No' ? '' : f.training_skill_name,
            training_type: v === 'No' ? '' : f.training_type,
            training_institution: v === 'No' ? '' : f.training_institution,
          }));
        }
      )}

      {val === 'Yes' && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.label}>Please provide details of the required training:</Text>

          <TextInput
            placeholder="Skill name"
            style={styles.input}
            value={existingForm.training_skill_name || ''}
            onChangeText={(text) =>
              setExistingForm((f) => ({ ...f, training_skill_name: text }))
            }
          />

          <TextInput
            placeholder="Type of training (Technical / Business / Digital, etc.)"
            style={styles.input}
            value={existingForm.training_type || ''}
            onChangeText={(text) =>
              setExistingForm((f) => ({ ...f, training_type: text }))
            }
          />

          <TextInput
            placeholder="Specific institution or department requirement (if applicable)"
            style={styles.input}
            value={existingForm.training_institution || ''}
            onChangeText={(text) =>
              setExistingForm((f) => ({ ...f, training_institution: text }))
            }
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
        onValueChange={(v) => setExistingForm(f => ({
          ...f,
          institutional_support: v,
          institutional_support_other: v === 'Others' ? f.institutional_support_other : '', // Clear if not "Others"
        }))}
        style={styles.input}
      >
        <Picker.Item label="Select..." value="" />
        {institutionalSupportOptions.map(opt => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>

      {val === 'Others' && (
        <TextInput
          placeholder="Please enter the name/details of the institution."
          value={existingForm.institutional_support_other || ''}
          onChangeText={text => setExistingForm(f => ({ ...f, institutional_support_other: text }))}
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
          setExistingForm(f => ({
            ...f,
            financial_linkage: v,
            financial_linkage_other: v === 'Others' ? f.financial_linkage_other : '', // Clear if not "Others"
          }))
        }
        style={styles.input}
      >
        <Picker.Item label="Select..." value="" />
        {financialLinkageOptions.map(opt => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>

      {val === 'Others' && (
        <TextInput
          placeholder="Specify"
          value={existingForm.financial_linkage_other || ''}
          onChangeText={text =>
            setExistingForm(f => ({ ...f, financial_linkage_other: text }))
          }
          style={[styles.input, { marginTop: 6 }]}
        />
      )}
    </View>
  );
}

if (k === 'required_support') {
  const selected = Array.isArray(existingForm.required_support) ? existingForm.required_support : [];

  const toggleOption = (value) => {
    let updated = [...selected];
    if (updated.includes(value)) {
      updated = updated.filter(v => v !== value);
    } else {
      updated.push(value);
    }
    setExistingForm(f => ({ ...f, required_support: updated }));
    // Clear 'others' text if Others unchecked
    if (value === 'Others' && updated.indexOf('Others') === -1) {
      setExistingForm(f => ({ ...f, required_support_other: '' }));
    }
  };

  return (
    <View key={k} style={{ marginBottom: 8 }}>
      <Text style={styles.label}>Required Support</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {requiredSupportOptions.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.smallBtn,
              selected.includes(value) && { backgroundColor: '#EE6969' },
            ]}
            onPress={() => toggleOption(value)}
          >
            <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>
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
          onChangeText={text => setExistingForm(f => ({ ...f, required_support_other: text }))}
        />
      )}
    </View>
  );
}

if (k === 'expansion_plan') {
  const selected = Array.isArray(existingForm.expansion_plan) ? existingForm.expansion_plan : [];

  const toggleOption = (value) => {
    let updated = [...selected];
    if (updated.includes(value)) {
      updated = updated.filter(v => v !== value);
    } else {
      updated.push(value);
    }
    setExistingForm(f => ({ ...f, expansion_plan: updated }));
    // Clear 'others' text if Others unchecked
    if (value === 'Others' && updated.indexOf('Others') === -1) {
      setExistingForm(f => ({ ...f, expansion_plan_other: '' }));
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
              selected.includes(value) && { backgroundColor: '#EE6969' },
            ]}
            onPress={() => toggleOption(value)}
          >
            <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>
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
          onChangeText={text => setExistingForm(f => ({ ...f, expansion_plan_other: text }))}
        />
      )}
    </View>
  );
}

if (k === 'market_linkage') {
  const selected = Array.isArray(existingForm.market_linkage) ? existingForm.market_linkage : [];

  const toggleOption = (value) => {
    let updated = [...selected];
    if (updated.includes(value)) {
      updated = updated.filter(v => v !== value);
    } else {
      updated.push(value);
    }
    setExistingForm(f => ({ ...f, market_linkage: updated }));
    // Clear 'others' text if Others unchecked
    if (value === 'Others' && updated.indexOf('Others') === -1) {
      setExistingForm(f => ({ ...f, market_linkage_other: '' }));
    }
  };

  return (
    <View key={k} style={{ marginBottom: 8 }}>
      <Text style={styles.label}>Market Linkages</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {marketLinkageOptions.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.smallBtn,
              selected.includes(value) && { backgroundColor: '#EE6969' },
            ]}
            onPress={() => toggleOption(value)}
          >
            <Text style={{ color: selected.includes(value) ? '#fff' : '#333', fontWeight: '600' }}>
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
          onChangeText={text => setExistingForm(f => ({ ...f, market_linkage_other: text }))}
        />
      )}
    </View>
  );
}

if (k === 'certification_registration')
  return renderYesNoToggle('Certification / Registration?', existingForm.certification_registration, (v) => setExistingForm((f) => ({ ...f, certification_registration: v })));

if (k === 'certificate_docs') {
  return (
    <View key={k} style={{ marginBottom: 10 }}>
      <Text style={styles.label}>Certificate Documents</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={styles.smallBtn} onPress={addCertificateDoc}>
          <Text style={styles.smallBtnText}>Add Document</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 8 }}>
        {certDocs.length === 0 ? (
          <Text style={{ color: '#666' }}>(none)</Text>
        ) : (
          <FlatList
            data={certDocs}
            keyExtractor={(item, index) => String(index)}
            renderItem={({ item, index }) => (
              <View key={`cert-doc-${index}`} style={{ // Added key
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}>
                <Text style={{ flex: 1 }} numberOfLines={1}>{item}</Text>
                <TouchableOpacity onPress={() => removeCertificateDoc(index)} style={{ padding: 6 }}>
                  <Text style={{ color: '#EE6969' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
if (
  ['photo_enterprise', 'photo_entrepreneur', 'photo_product'].includes(k)
) {
  const current = existingForm[k] || '';
  const labelMap = {
    photo_enterprise: 'Photo Enterprise',
    photo_entrepreneur: 'Photo Entrepreneur',
    photo_product: 'Photo Product',
  };
  return (
    <View key={k} style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{labelMap[k]}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() => pickAndUpload(k)}
        >
          <Text style={styles.smallBtnText}>Pick</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() => takePhotoAndUploadLocal(k)}
        >
          <Text style={styles.smallBtnText}>Camera</Text>
        </TouchableOpacity>
      </View>
      {current ? (
        <Text style={{ color: '#333', marginTop: 6 }} numberOfLines={1}>
          {current}
        </Text>
      ) : null}
    </View>
  );
}
return (
  <View key={k} style={{ marginBottom: 8 }}>
    <Text style={styles.label}>{k.replace(/_/g, ' ')}</Text>
    <TextInput
      value={String(existingForm[k] ?? '')}
      onChangeText={(v) => setExistingForm((prev) => ({ ...prev, [k]: v }))}
      style={styles.input}
      multiline={multilineFields.includes(k)}
      keyboardType={
        [
          'initial_investment',
          'working_capital_monthly',
          'annual_turnover',
          'profit_percentage',
          'monthly_sales',
        ].includes(k)
          ? 'numeric'
          : 'default'
      }
    />
  </View>
);
};
return (
<View style={{ padding: 12, flex: 1 }}>
<Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
Existing Enterprise — {beneficiary?.name || ''}
</Text>
<ScrollView nestedScrollEnabled>
{existingFieldsList.map((k) => renderField(k))}
<TouchableOpacity
style={styles.submitButton}
onPress={handleSubmit}
disabled={loading || uploading}
>
{loading || uploading ? (
<ActivityIndicator color="#fff" />
) : (
<Text style={styles.submitText}>Save Existing Enterprise</Text>
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
label: { fontWeight: '600', marginBottom: 6, textTransform: 'capitalize' },
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
modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
modalContent: { backgroundColor: '#fff', borderRadius: 12, minWidth: 250, paddingBottom: 15, paddingTop: 10 },
cancelBtn: { padding: 10, alignItems: 'center', marginTop: 8 },
});