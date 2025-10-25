import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import { getUser } from '../../utils/auth';
import { pickImageFromLibrary, takePhoto, uploadAssetsToDrive } from '../../utils/media';

const Section = ({ title, children, openByDefault=false }) => {
  const [open, setOpen] = useState(openByDefault);
  return (
    <View style={{ marginBottom:12, borderWidth:1, borderColor:'#e6e6e6', borderRadius:6 }}>
      <TouchableOpacity onPress={()=>setOpen(o=>!o)} style={{ padding:10, backgroundColor:'#fafafa' }}>
        <Text style={{ fontWeight:'bold' }}>{title} {open ? '▾' : '▸'}</Text>
      </TouchableOpacity>
      {open && <View style={{ padding:10 }}>{children}</View>}
    </View>
  );
};

export default function EnterpriseForm({ navigation, route }) {
  const { beneficiary, viewOnly } = route.params;
  const [record, setRecord] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    enterprise_name:'', enterprise_type:'', ownership_type:'', year_of_establishment:'',
    raw_material:'', machinery_equipment:'', workplace_type:'', electricity_available:'', water_available:'',
    transportation_facility:'', initial_investment:'', source_of_investment:'', working_capital_monthly:'',
    annual_turnover:'', profit_percentage:'', loan_details:'', main_product_service:'', product_features:'',
    production_capacity:'', packaging_branding_status:'', certification_registration:'', target_customers:'',
    marketing_channels:'', monthly_sales:'', marketing_strategy:'', marketing_challenges:'', training_received:'',
    skills_acquired:'', future_training_requirements:'', institutional_support:'', financial_coordination:'',
    market_linkage:'', mentorship_support:'', expansion_plan:'', required_support:'',
    photo_enterprise:'', photo_entrepreneur:'', photo_product:'', certificate_docs:''
  });

  useEffect(() => {
    (async () => {
      const u = await getUser(); setUser(u);
      setLoading(true);
      try {
        // find existing record for beneficiary
        const all = await gsApi.list('BeneficiaryEnterprise');
        const found = (all || []).find(e => String(e.beneficiary_id) === String(beneficiary.id));
        if (found) {
          setRecord(found);
          // map all fields to form
          const mapped = {};
          Object.keys(form).forEach(k => mapped[k] = found[k] !== undefined ? String(found[k]) : '');
          setForm(mapped);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    if (!form.enterprise_name || form.enterprise_name.trim() === '') { Alert.alert('Validation','Enterprise name required'); return false; }
    return true;
  };

  const buildPayload = () => {
    const base = { beneficiary_id: beneficiary.id, ...form };
    if (user && user.id) base.recorded_by_user_id = user.id;
    const t = new Date().toISOString();
    if (record && record.id) base.id = record.id;
    else base.id = 'be_' + Date.now();
    base.updated_at = t;
    if (!record) base.created_at = t;
    return base;
  };

  const handleSubmit = async () => {
    if (viewOnly) return;
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = buildPayload();
      let res;
      if (record) res = await gsApi.update('BeneficiaryEnterprise', payload);
      else res = await gsApi.create('BeneficiaryEnterprise', payload);
      if (res && res.success) {
        Alert.alert('Success', record ? 'Updated' : 'Recorded successfully!');
        // notify previous screen to refresh if provided
        if (route.params?.onSaved) {
          try { route.params.onSaved(); } catch(e){/* ignore */ }
        }
        navigation.goBack();
      } else {
        Alert.alert('Error', JSON.stringify(res || 'Unknown error'));
      }
    } catch (err) {
      Alert.alert('Error', String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return Alert.alert('No record to delete');
    Alert.alert('Confirm', 'Delete this record?', [
      { text:'Cancel', style:'cancel' },
      { text:'Delete', style:'destructive', onPress: async ()=> {
        setLoading(true);
        try {
          const res = await gsApi.delete('BeneficiaryEnterprise', record.id);
          if (res && res.success) {
            if (route.params?.onSaved) { try { route.params.onSaved(); } catch(e){} }
            Alert.alert('Deleted'); navigation.goBack();
          } else Alert.alert('Error', JSON.stringify(res || 'Delete failed'));
        } catch (err) { Alert.alert('Error', String(err)); } finally { setLoading(false); }
      }}
    ]);
  };

  // pick image, upload to Drive via GAS, set returned url into fieldKey
  const handlePickAndUpload = async (fieldKey) => {
    try {
      const asset = await pickImageFromLibrary();
      if (!asset) return;
      // Many image-picker configs return base64 if includeBase64:true. Simpler approach: read base64 straight from asset.base64 if available.
      // For robust behavior, we will request includeBase64: true by changing pickImageFromLibrary call, but to keep util unchanged we will call uploadAssetsToDrive which reads file via RNFS.
      // For simplicity, we will prepare payload with asset.uri and fileName/type.
      const assets = [{ uri: asset.uri, fileName: asset.fileName || `img_${Date.now()}.jpg`, type: asset.type }];
      const uploadRes = await uploadAssetsToDrive(assets, undefined); // undefined uses default folder in GAS
      if (!uploadRes || !uploadRes.results) throw new Error('Upload failed');
      // take first successful result
      const ok = uploadRes.results.find(r => r.success);
      if (!ok) throw new Error('Upload failed: ' + JSON.stringify(uploadRes.results));
      // set field to Drive file URL
      setField(fieldKey, ok.url);
      Alert.alert('Uploaded', 'File uploaded to Drive');
    } catch (err) {
      Alert.alert('Upload error', String(err));
    }
  };

  const handleTakePhotoAndUpload = async (fieldKey) => {
    try {
      const asset = await takePhoto();
      if (!asset) return;
      const assets = [{ uri: asset.uri, fileName: asset.fileName || `img_${Date.now()}.jpg`, type: asset.type }];
      const uploadRes = await uploadAssetsToDrive(assets, undefined);
      const ok = uploadRes.results.find(r => r.success);
      if (!ok) throw new Error('Upload failed');
      setField(fieldKey, ok.url);
      Alert.alert('Uploaded', 'Photo uploaded');
    } catch (err) {
      Alert.alert('Upload error', String(err));
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding:12 }}>
      <BackButton />
      <Text style={{ fontWeight:'bold', fontSize:16, marginBottom:8 }}>{beneficiary.name}</Text>

      <Section title="General" openByDefault>
        <Text>Enterprise Name</Text>
        <TextInput value={form.enterprise_name} onChangeText={v=>setField('enterprise_name',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Enterprise Type</Text>
        <TextInput value={form.enterprise_type} onChangeText={v=>setField('enterprise_type',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Ownership Type</Text>
        <TextInput value={form.ownership_type} onChangeText={v=>setField('ownership_type',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Year of Establishment</Text>
        <TextInput value={form.year_of_establishment} onChangeText={v=>setField('year_of_establishment',v)} keyboardType='numeric' style={{ borderWidth:1, padding:8, marginBottom:8 }} />
      </Section>

      <Section title="Finance">
        <Text>Initial Investment</Text>
        <TextInput value={form.initial_investment} onChangeText={v=>setField('initial_investment',v)} keyboardType='numeric' style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Working Capital (Monthly)</Text>
        <TextInput value={form.working_capital_monthly} onChangeText={v=>setField('working_capital_monthly',v)} keyboardType='numeric' style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Annual Turnover</Text>
        <TextInput value={form.annual_turnover} onChangeText={v=>setField('annual_turnover',v)} keyboardType='numeric' style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Profit Percentage</Text>
        <TextInput value={form.profit_percentage} onChangeText={v=>setField('profit_percentage',v)} keyboardType='numeric' style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Loan Details</Text>
        <TextInput value={form.loan_details} onChangeText={v=>setField('loan_details',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
      </Section>

      <Section title="Production & Capacity">
        <Text>Main Product / Service</Text>
        <TextInput value={form.main_product_service} onChangeText={v=>setField('main_product_service',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Raw Material</Text>
        <TextInput value={form.raw_material} onChangeText={v=>setField('raw_material',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Machinery / Equipment</Text>
        <TextInput value={form.machinery_equipment} onChangeText={v=>setField('machinery_equipment',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Production Capacity</Text>
        <TextInput value={form.production_capacity} onChangeText={v=>setField('production_capacity',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Packaging / Branding Status</Text>
        <TextInput value={form.packaging_branding_status} onChangeText={v=>setField('packaging_branding_status',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Certification / Registration</Text>
        <TextInput value={form.certification_registration} onChangeText={v=>setField('certification_registration',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
      </Section>

      <Section title="Marketing & Sales">
        <Text>Target Customers</Text>
        <TextInput value={form.target_customers} onChangeText={v=>setField('target_customers',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Marketing Channels</Text>
        <TextInput value={form.marketing_channels} onChangeText={v=>setField('marketing_channels',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Monthly Sales</Text>
        <TextInput value={form.monthly_sales} onChangeText={v=>setField('monthly_sales',v)} keyboardType='numeric' style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Marketing Strategy</Text>
        <TextInput value={form.marketing_strategy} onChangeText={v=>setField('marketing_strategy',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Marketing Challenges</Text>
        <TextInput value={form.marketing_challenges} onChangeText={v=>setField('marketing_challenges',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
      </Section>

      <Section title="Training & Support">
        <Text>Training Received</Text>
        <TextInput value={form.training_received} onChangeText={v=>setField('training_received',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Skills Acquired</Text>
        <TextInput value={form.skills_acquired} onChangeText={v=>setField('skills_acquired',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Future Training Requirements</Text>
        <TextInput value={form.future_training_requirements} onChangeText={v=>setField('future_training_requirements',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Institutional Support</Text>
        <TextInput value={form.institutional_support} onChangeText={v=>setField('institutional_support',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
      </Section>

      <Section title="Documents & Photos">
        <Text>Photo - Enterprise (URL shown below)</Text>
        <View style={{ flexDirection:'row', gap:8, marginBottom:8 }}>
          <Button title="Pick Photo" onPress={()=>handlePickAndUpload('photo_enterprise')} />
          <View style={{ width:8 }} />
          <Button title="Take Photo" onPress={()=>handleTakePhotoAndUpload('photo_enterprise')} />
        </View>
        <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form.photo_enterprise}</Text>

        <Text>Photo - Entrepreneur</Text>
        <View style={{ flexDirection:'row', gap:8, marginBottom:8 }}>
          <Button title="Pick Photo" onPress={()=>handlePickAndUpload('photo_entrepreneur')} />
          <View style={{ width:8 }} />
          <Button title="Take Photo" onPress={()=>handleTakePhotoAndUpload('photo_entrepreneur')} />
        </View>
        <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form.photo_entrepreneur}</Text>

        <Text>Photo - Product</Text>
        <View style={{ flexDirection:'row', gap:8, marginBottom:8 }}>
          <Button title="Pick Photo" onPress={()=>handlePickAndUpload('photo_product')} />
          <View style={{ width:8 }} />
          <Button title="Take Photo" onPress={()=>handleTakePhotoAndUpload('photo_product')} />
        </View>
        <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form.photo_product}</Text>

        <Text>Certificate Docs (URLs comma-separated)</Text>
        <TextInput value={form.certificate_docs} onChangeText={v=>setField('certificate_docs',v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
      </Section>

      {!viewOnly && <Button title={record ? 'Update Record' : 'Submit Record'} onPress={handleSubmit} disabled={loading} />}
      {record && !viewOnly && <View style={{ marginTop:8 }}><Button title="Delete Record" color="red" onPress={handleDelete} disabled={loading} /></View>}
      <View style={{ height:24 }} />
    </ScrollView>
  );
}
