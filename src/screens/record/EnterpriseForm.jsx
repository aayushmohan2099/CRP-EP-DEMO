// src/screens/record/EnterpriseForm.jsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import { getUser } from '../../utils/auth';
import { pickImageFromLibrary, takePhoto, uploadAssetsToDrive } from '../../utils/media';

const Section = ({ title, children, openByDefault = false }) => {
  const [open, setOpen] = useState(openByDefault);
  return (
    <View style={{ marginBottom: 12, borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 6 }}>
      <TouchableOpacity onPress={() => setOpen((o) => !o)} style={{ padding: 10, backgroundColor: '#fafafa' }}>
        <Text style={{ fontWeight: 'bold' }}>{title} {open ? '▾' : '▸'}</Text>
      </TouchableOpacity>
      {open && <View style={{ padding: 10 }}>{children}</View>}
    </View>
  );
};

export default function EnterpriseForm({ navigation, route }) {
  const { beneficiary } = route.params || {};
  const [record, setRecord] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialForm = {
    enterprise_name: '', enterprise_type: '', ownership_type: '', year_of_establishment: '',
    raw_material: '', machinery_equipment: '', workplace_type: '', electricity_available: '', water_available: '',
    transportation_facility: '', initial_investment: '', source_of_investment: '', working_capital_monthly: '',
    annual_turnover: '', profit_percentage: '', loan_details: '', main_product_service: '', product_features: '',
    production_capacity: '', packaging_branding_status: '', certification_registration: '', target_customers: '',
    marketing_channels: '', monthly_sales: '', marketing_strategy: '', marketing_challenges: '', training_received: '',
    skills_acquired: '', future_training_requirements: '', institutional_support: '', financial_coordination: '',
    market_linkage: '', mentorship_support: '', expansion_plan: '', required_support: '',
    photo_enterprise: '', photo_entrepreneur: '', photo_product: '', certificate_docs: ''
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u || null);
      setLoading(true);
      try {
        // try server-side read using read(table, filterField, filterValue) which returns array
        const rows = await gsApi.read('BeneficiaryEnterprise', 'beneficiary_id', beneficiary.id);
        const found = Array.isArray(rows) && rows.length ? rows[0] : null;
        if (found) {
          setRecord(found);
          const mapped = {};
          Object.keys(initialForm).forEach(k => mapped[k] = found[k] !== undefined && found[k] !== null ? String(found[k]) : '');
          setForm(mapped);
        } else {
          setForm(initialForm);
        }
      } catch (err) {
        console.warn('EnterpriseForm load error', err);
        Alert.alert('Error', 'Failed to load existing enterprise record. ' + String(err));
        setForm(initialForm);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    if (!form.enterprise_name || form.enterprise_name.trim() === '') { Alert.alert('Validation', 'Enterprise name required'); return false; }
    return true;
  };

  const buildPayload = () => {
    const base = Object.assign({}, form);
    base.beneficiary_id = beneficiary.id;
    if (record && record.id) base.id = record.id;
    else base.id = base.id || ('be_' + Date.now());
    if (user && user.id) base.recorded_by_user_id = user.id;
    const t = new Date().toISOString();
    base.updated_at = t;
    if (!record) base.created_at = t;
    Object.keys(base).forEach(k => { if (base[k] === undefined || base[k] === null) base[k] = ''; });
    return base;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = buildPayload();
      const res = await gsApi.createOrUpdateEnterprise(payload);
      if (res && (res.success === true || res.record || res.saved)) {
        Alert.alert('Success', record ? 'Updated successfully' : 'Recorded successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Save failed: ' + JSON.stringify(res || 'no response'));
      }
    } catch (err) {
      console.warn('handleSubmit error', err);
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!record || !record.id) return Alert.alert('No record to delete');
    Alert.alert('Confirm', 'Delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setLoading(true);
        try {
          const res = await gsApi.delete('BeneficiaryEnterprise', record.id);
          if (res && res.success) {
            Alert.alert('Deleted');
            navigation.goBack();
          } else Alert.alert('Delete failed', JSON.stringify(res || 'delete failed'));
        } catch (err) { Alert.alert('Error', String(err)); } finally { setLoading(false); }
      }}
    ]);
  };

  // helper for image uploading
  const doUploadAsset = async (fieldKey, asset) => {
    try {
      if (!asset || !asset.uri) throw new Error('No image asset');
      const assets = [{ uri: asset.uri, fileName: asset.fileName || `img_${Date.now()}.jpg`, type: asset.type }];
      const uploadRes = await uploadAssetsToDrive(assets, undefined);
      if (!uploadRes || !uploadRes.results) throw new Error('Upload failed');
      const ok = uploadRes.results.find(r => r.success);
      if (!ok) throw new Error('Upload failed: ' + JSON.stringify(uploadRes.results));
      setField(fieldKey, ok.url);
      Alert.alert('Uploaded', 'File uploaded to Drive');
    } catch (err) {
      Alert.alert('Upload error', String(err));
    }
  };

  const handlePickAndUpload = async (fieldKey) => {
    try {
      const asset = await pickImageFromLibrary();
      if (!asset) return;
      await doUploadAsset(fieldKey, asset);
    } catch (err) { Alert.alert('Pick error', String(err)); }
  };

  const handleTakePhotoAndUpload = async (fieldKey) => {
    try {
      const asset = await takePhoto();
      if (!asset) return;
      await doUploadAsset(fieldKey, asset);
    } catch (err) { Alert.alert('Camera error', String(err)); }
  };

  const openUrl = async (url) => {
    if (!url) return Alert.alert('No URL');
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) Linking.openURL(url);
      else Alert.alert('Cannot open URL');
    } catch (err) { Alert.alert('Error', String(err)); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <BackButton />
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{beneficiary?.name || 'Beneficiary'}</Text>
      {loading && <ActivityIndicator size="large" style={{ marginBottom: 12 }} />}

      {/* General */}
      <Section title="General" openByDefault>
        <Text>Enterprise Name</Text>
        <TextInput value={form.enterprise_name} onChangeText={v => setField('enterprise_name', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Enterprise Type</Text>
        <TextInput value={form.enterprise_type} onChangeText={v => setField('enterprise_type', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Ownership Type</Text>
        <TextInput value={form.ownership_type} onChangeText={v => setField('ownership_type', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Year of Establishment</Text>
        <TextInput value={form.year_of_establishment} onChangeText={v => setField('year_of_establishment', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
      </Section>

      {/* Production & Capacity */}
      <Section title="Production & Capacity">
        <Text>Main Product / Service</Text>
        <TextInput value={form.main_product_service} onChangeText={v => setField('main_product_service', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Raw Material</Text>
        <TextInput value={form.raw_material} onChangeText={v => setField('raw_material', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Machinery / Equipment</Text>
        <TextInput value={form.machinery_equipment} onChangeText={v => setField('machinery_equipment', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Production Capacity</Text>
        <TextInput value={form.production_capacity} onChangeText={v => setField('production_capacity', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Packaging / Branding Status</Text>
        <TextInput value={form.packaging_branding_status} onChangeText={v => setField('packaging_branding_status', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Certification / Registration</Text>
        <TextInput value={form.certification_registration} onChangeText={v => setField('certification_registration', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Workplace Type</Text>
        <TextInput value={form.workplace_type} onChangeText={v => setField('workplace_type', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Electricity Available</Text>
        <TextInput value={form.electricity_available} onChangeText={v => setField('electricity_available', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Water Available</Text>
        <TextInput value={form.water_available} onChangeText={v => setField('water_available', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Transportation Facility</Text>
        <TextInput value={form.transportation_facility} onChangeText={v => setField('transportation_facility', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
      </Section>

      {/* Finance */}
      <Section title="Finance">
        <Text>Initial Investment</Text>
        <TextInput value={form.initial_investment} onChangeText={v => setField('initial_investment', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Source of Investment</Text>
        <TextInput value={form.source_of_investment} onChangeText={v => setField('source_of_investment', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Working Capital (Monthly)</Text>
        <TextInput value={form.working_capital_monthly} onChangeText={v => setField('working_capital_monthly', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Annual Turnover</Text>
        <TextInput value={form.annual_turnover} onChangeText={v => setField('annual_turnover', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Profit Percentage</Text>
        <TextInput value={form.profit_percentage} onChangeText={v => setField('profit_percentage', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Loan Details</Text>
        <TextInput value={form.loan_details} onChangeText={v => setField('loan_details', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
      </Section>

      {/* Marketing & Sales */}
      <Section title="Marketing & Sales">
        <Text>Target Customers</Text>
        <TextInput value={form.target_customers} onChangeText={v => setField('target_customers', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Marketing Channels</Text>
        <TextInput value={form.marketing_channels} onChangeText={v => setField('marketing_channels', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Monthly Sales</Text>
        <TextInput value={form.monthly_sales} onChangeText={v => setField('monthly_sales', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
        <Text>Marketing Strategy</Text>
        <TextInput value={form.marketing_strategy} onChangeText={v => setField('marketing_strategy', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Marketing Challenges</Text>
        <TextInput value={form.marketing_challenges} onChangeText={v => setField('marketing_challenges', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
      </Section>

      {/* Training & Support */}
      <Section title="Training & Support">
        <Text>Training Received</Text>
        <TextInput value={form.training_received} onChangeText={v => setField('training_received', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Skills Acquired</Text>
        <TextInput value={form.skills_acquired} onChangeText={v => setField('skills_acquired', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Future Training Requirements</Text>
        <TextInput value={form.future_training_requirements} onChangeText={v => setField('future_training_requirements', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Institutional Support</Text>
        <TextInput value={form.institutional_support} onChangeText={v => setField('institutional_support', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Financial Coordination</Text>
        <TextInput value={form.financial_coordination} onChangeText={v => setField('financial_coordination', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Market Linkage</Text>
        <TextInput value={form.market_linkage} onChangeText={v => setField('market_linkage', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Mentorship Support</Text>
        <TextInput value={form.mentorship_support} onChangeText={v => setField('mentorship_support', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Expansion Plan</Text>
        <TextInput value={form.expansion_plan} onChangeText={v => setField('expansion_plan', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
        <Text>Required Support</Text>
        <TextInput value={form.required_support} onChangeText={v => setField('required_support', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
      </Section>

      {/* Docs & Photos */}
      <Section title="Documents & Photos">
        <Text>Photo - Enterprise</Text>
        <View style={{ flexDirection:'row', marginBottom:8 }}>
          <Button title="Pick Photo" onPress={() => handlePickAndUpload('photo_enterprise')} />
          <View style={{ width:8 }} />
          <Button title="Take Photo" onPress={() => handleTakePhotoAndUpload('photo_enterprise')} />
        </View>
        <TouchableOpacity onPress={() => form.photo_enterprise && openUrl(form.photo_enterprise)}>
          <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form.photo_enterprise || '(no file)'}</Text>
        </TouchableOpacity>

        <Text>Photo - Entrepreneur</Text>
        <View style={{ flexDirection:'row', marginBottom:8 }}>
          <Button title="Pick Photo" onPress={() => handlePickAndUpload('photo_entrepreneur')} />
          <View style={{ width:8 }} />
          <Button title="Take Photo" onPress={() => handleTakePhotoAndUpload('photo_entrepreneur')} />
        </View>
        <TouchableOpacity onPress={() => form.photo_entrepreneur && openUrl(form.photo_entrepreneur)}>
          <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form.photo_entrepreneur || '(no file)'}</Text>
        </TouchableOpacity>

        <Text>Photo - Product</Text>
        <View style={{ flexDirection:'row', marginBottom:8 }}>
          <Button title="Pick Photo" onPress={() => handlePickAndUpload('photo_product')} />
          <View style={{ width:8 }} />
          <Button title="Take Photo" onPress={() => handleTakePhotoAndUpload('photo_product')} />
        </View>
        <TouchableOpacity onPress={() => form.photo_product && openUrl(form.photo_product)}>
          <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form.photo_product || '(no file)'}</Text>
        </TouchableOpacity>

        <Text>Certificate Docs (comma-separated URLs)</Text>
        <TextInput value={form.certificate_docs} onChangeText={v => setField('certificate_docs', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
      </Section>

      <View style={{ marginBottom: 12 }}>
        <Button title={record ? 'Update Record' : 'Submit Record'} onPress={handleSubmit} disabled={loading} />
      </View>
      {record && <View style={{ marginBottom: 12 }}><Button title="Delete Record" color="red" onPress={handleDelete} disabled={loading} /></View>}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
