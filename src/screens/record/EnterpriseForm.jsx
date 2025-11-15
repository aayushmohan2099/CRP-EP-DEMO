// src/screens/record/EnterpriseForm.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, Alert,
  StyleSheet, ActivityIndicator, FlatList
} from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import { LanguageContext } from '../../components/LanguageContext';
import { pickImageFromLibrary, takePhoto, uploadAssetsToDrive } from '../../utils/media';
import LoaderModal from '../LoaderModal';

/*
 Behavior:
 - Show blank prompt first:
   "Does <beneficiary_name> currently have any Enterprise/Business?"
   - YES -> open ExistingEnterprise form (all fields)
   - NO  -> Ask "Is <beneficiary_name> interested in starting an Enterprise/Business?"
      - YES -> open NewEnterprise form (all fields)
      - NO  -> goBack()
 - If route.params.existingRecord is present (edit flow), skip prompt and open that form prefilled.
 - Include ALL fields requested by user.
*/

export default function EnterpriseForm({ navigation, route }) {
  const { beneficiary, existingRecord } = route.params || {};
  const { language } = useContext(LanguageContext);

  // All fields requested for ExistingEnterprise
  const existingFieldsList = [
    'enterprise_name','enterprise_type','ownership_type','year_of_establishment','raw_material','machinery_equipment',
    'workplace_type','electricity_available','water_available','transportation_facility','initial_investment','source_of_investment',
    'working_capital_monthly','annual_turnover','profit_percentage','loan_details','main_product_service','product_features',
    'production_capacity','packaging_branding_status','certification_registration','target_customers','marketing_channels',
    'monthly_sales','marketing_strategy','marketing_challenges','training_received','skills_acquired','future_training_requirements',
    'institutional_support','financial_coordination','market_linkage','mentorship_support','expansion_plan','required_support',
    'photo_enterprise','photo_entrepreneur','photo_product','certificate_docs'
  ];

  // All fields requested for NewEnterprise
  const newFieldsList = [
    'interested_business','has_arranged_place','arranged_place_address','is_trained','training_details',
    'skill_training_support','entre_dev_training_support','credit_linkage_support','market_linkage_support',
    'machinery_support','worksite_support','digital_support','other_support'
  ];

  // initialize empty objects for both forms
  const emptyExisting = existingFieldsList.reduce((acc, k) => { acc[k] = ''; return acc; }, {});
  const emptyNew = newFieldsList.reduce((acc, k) => { acc[k] = ''; return acc; }, {});

  // state
  const [stage, setStage] = useState('prompt'); // 'prompt' | 'existing' | 'new' | 'loading'
  const [existingForm, setExistingForm] = useState({ ...emptyExisting });
  const [newForm, setNewForm] = useState({ ...emptyNew });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [certDocs, setCertDocs] = useState([]); // array of urls for certificate_docs

  useEffect(() => {
    // If opened for edit with existingRecord, skip prompt
    if (existingRecord) {
      const sheet = existingRecord.__sheet || '';
      if (sheet === 'ExistingEnterprise') {
        // prefill existing
        const copy = { ...emptyExisting, ...existingRecord };
        // certificate docs may be comma-separated string in sheet; split to array
        if (copy.certificate_docs) {
          const arr = String(copy.certificate_docs).split(',').map(s => s.trim()).filter(Boolean);
          setCertDocs(arr);
          copy.certificate_docs = arr.join(',');
        }
        setExistingForm(copy);
        setStage('existing');
      } else {
        const copy = { ...emptyNew, ...existingRecord };
        setNewForm(copy);
        setStage('new');
      }
      return;
    }

    // If no existingRecord, keep prompt stage (blank question UI)
    setStage('prompt');
  }, [existingRecord]);

  // prefetch: if beneficiary provided, try to detect existing records and set answers (but still show prompt)
  useEffect(() => {
    if (!beneficiary?.id) return;
    (async () => {
      setLoading(true);
      try {
        const ex = await gsApi.read('ExistingEnterprise', 'beneficiary_id', beneficiary.id, { cache: true });
        if (Array.isArray(ex) && ex.length) {
          // prefill but still show prompt (per your requirement) — user may still choose to go to other flow
          const copy = { ...emptyExisting, ...ex[0] };
          if (copy.certificate_docs) {
            const arr = String(copy.certificate_docs).split(',').map(s => s.trim()).filter(Boolean);
            setCertDocs(arr);
            copy.certificate_docs = arr.join(',');
          }
          setExistingForm(copy);
        }
        const nw = await gsApi.read('NewEnterprise', 'beneficiary_id', beneficiary.id, { cache: true });
        if (Array.isArray(nw) && nw.length) {
          const copy2 = { ...emptyNew, ...nw[0] };
          setNewForm(copy2);
        }
      } catch (err) {
        console.warn('prefetch enterprise', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [beneficiary?.id]);

  // --- photo / docs upload helpers ---
  async function uploadSingleAssetToDrive(asset) {
    if (!asset) return null;
    const res = await uploadAssetsToDrive([asset]);
    if (!res || !res.results || !res.results[0] || !res.results[0].url) return null;
    return res.results[0].url;
  }

  async function pickAndUpload(setterKey) {
    try {
      const asset = await pickImageFromLibrary();
      if (!asset) return;
      setUploading(true);
      const url = await uploadSingleAssetToDrive(asset);
      if (!url) {
        Alert.alert('Upload failed');
        return;
      }
      if (stage === 'existing') setExistingForm(f => ({ ...f, [setterKey]: url }));
      else if (stage === 'new') setNewForm(f => ({ ...f, [setterKey]: url }));
    } catch (err) {
      console.warn('pickAndUpload', err);
      Alert.alert('Error', String(err));
    } finally {
      setUploading(false);
    }
  }

  async function takePhotoAndUploadLocal(setterKey) {
    try {
      const asset = await takePhoto();
      if (!asset) return;
      setUploading(true);
      const url = await uploadSingleAssetToDrive(asset);
      if (!url) {
        Alert.alert('Upload failed');
        return;
      }
      if (stage === 'existing') setExistingForm(f => ({ ...f, [setterKey]: url }));
      else if (stage === 'new') setNewForm(f => ({ ...f, [setterKey]: url }));
    } catch (err) {
      console.warn('takePhotoAndUploadLocal', err);
      Alert.alert('Error', String(err));
    } finally {
      setUploading(false);
    }
  }

  // certificate docs - allow multiple picks, store array and join on submit
  async function addCertificateDoc() {
    try {
      const asset = await pickImageFromLibrary();
      if (!asset) return;
      setUploading(true);
      const url = await uploadSingleAssetToDrive(asset);
      if (!url) { Alert.alert('Upload failed'); return; }
      setCertDocs(prev => [...prev, url]);
      // also keep in form state so UI shows
      setExistingForm(f => ({ ...f, certificate_docs: [...certDocs, url].join(',') }));
    } catch (err) {
      console.warn('addCertificateDoc', err);
      Alert.alert('Error', String(err));
    } finally {
      setUploading(false);
    }
  }

  function removeCertificateDoc(idx) {
    const arr = certDocs.slice();
    arr.splice(idx, 1);
    setCertDocs(arr);
    setExistingForm(f => ({ ...f, certificate_docs: arr.join(',') }));
  }

  // --- prompt handlers ---
  function handlePromptHasEnterprise(answer) {
    if (answer === 'yes') {
      setStage('existing');
    } else {
      // answer === 'no' -> ask interest
      // show second question by changing stage to 'askInterest'
      setStage('askInterest');
    }
  }
  function handlePromptInterest(answer) {
    if (answer === 'yes') setStage('new');
    else navigation.goBack();
  }

  // --- submit ---
  async function handleSubmit() {
    if (!beneficiary?.id) {
      Alert.alert('Missing beneficiary');
      return;
    }

    setLoading(true);
    try {
      const payload = { type: stage === 'existing' ? 'existing' : 'new', beneficiary_id: beneficiary.id };

      if (stage === 'existing') {
        // include all existing fields
        existingFieldsList.forEach(k => {
          // certificate_docs come from certDocs array
          if (k === 'certificate_docs') payload[k] = certDocs.join(',');
          else if (existingForm[k] !== undefined) payload[k] = existingForm[k];
        });
      } else {
        newFieldsList.forEach(k => {
          if (newForm[k] !== undefined) payload[k] = newForm[k];
        });
      }

      // call unified API
      const res = await gsApi.createOrUpdateEnterprise(payload, { cache: false });
      if (res && res.success) {
        Alert.alert('Success', 'Recorded successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        console.warn('save res', res);
        Alert.alert('Error', JSON.stringify(res || 'unknown'));
      }
    } catch (err) {
      console.warn('EnterpriseForm submit', err);
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  }

  // --- render helpers ---
  function renderPrompt() {
    return (
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          Does {beneficiary?.name || 'this beneficiary'} currently have any Enterprise/Business?
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={[styles.yesBtn]} onPress={() => handlePromptHasEnterprise('yes')}>
            <Text style={styles.yesText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.noBtn]} onPress={() => handlePromptHasEnterprise('no')}>
            <Text style={styles.noText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.backBtn]} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderAskInterest() {
    return (
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          Is {beneficiary?.name || 'this beneficiary'} interested in starting an Enterprise/Business?
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={[styles.yesBtn]} onPress={() => handlePromptInterest('yes')}>
            <Text style={styles.yesText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.noBtn]} onPress={() => handlePromptInterest('no')}>
            <Text style={styles.noText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderExistingForm() {
    return (
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          Existing Enterprise — {beneficiary?.name || ''}
        </Text>

        <ScrollView nestedScrollEnabled>
          {existingFieldsList.map((k) => {
            // special handling for certificate_docs (array UI) and photos
            if (k === 'certificate_docs') {
              return (
                <View key={k} style={{ marginBottom: 10 }}>
                  <Text style={styles.label}>Certificate Documents</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.smallBtn} onPress={addCertificateDoc}><Text style={styles.smallBtnText}>Add Document</Text></TouchableOpacity>
                  </View>
                  <View style={{ marginTop: 8 }}>
                    {certDocs.length === 0 ? <Text style={{ color: '#666' }}>(none)</Text> : (
                      <FlatList
                        data={certDocs}
                        keyExtractor={(it, i) => String(i)}
                        renderItem={({ item, index }) => (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
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

            if (['photo_enterprise','photo_entrepreneur','photo_product'].includes(k)) {
              const current = existingForm[k] || '';
              return (
                <View key={k} style={{ marginBottom: 10 }}>
                  <Text style={styles.label}>{k.replace(/_/g, ' ')}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => pickAndUpload(k)}><Text style={styles.smallBtnText}>Pick</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => takePhotoAndUploadLocal(k)}><Text style={styles.smallBtnText}>Camera</Text></TouchableOpacity>
                  </View>
                  {current ? <Text style={{ color: '#333', marginTop: 6 }} numberOfLines={1}>{current}</Text> : null}
                </View>
              );
            }

            // normal input
            return (
              <View key={k} style={{ marginBottom: 8 }}>
                <Text style={styles.label}>{k.replace(/_/g, ' ')}</Text>
                <TextInput
                  value={String(existingForm[k] ?? '')}
                  onChangeText={(v) => setExistingForm(prev => ({ ...prev, [k]: v }))}
                  style={styles.input}
                  multiline={k === 'product_features' || k === 'marketing_strategy' || k === 'marketing_challenges' || k === 'training_received' || k === 'skills_acquired' || k === 'future_training_requirements' }
                />
              </View>
            );
          })}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading || uploading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Existing Enterprise</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  function renderNewForm() {
    return (
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          New Enterprise Interest — {beneficiary?.name || ''}
        </Text>

        <ScrollView nestedScrollEnabled>
          {newFieldsList.map((k) => {
            // photos are not part of newFieldsList per your spec, so render inputs
            return (
              <View key={k} style={{ marginBottom: 8 }}>
                <Text style={styles.label}>{k.replace(/_/g, ' ')}</Text>
                <TextInput
                  value={String(newForm[k] ?? '')}
                  onChangeText={(v) => setNewForm(prev => ({ ...prev, [k]: v }))}
                  style={styles.input}
                  multiline={k === 'training_details' || k === 'other_support'}
                />
              </View>
            );
          })}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading || uploading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save New Enterprise Interest</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      <LoaderModal visible={loading || uploading} message={loading ? 'Submitting...' : 'Uploading...'} />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 12, marginTop: 30 }}>
          <BackButton />
        </View>

        {stage === 'prompt' && renderPrompt()}
        {stage === 'askInterest' && renderAskInterest()}
        {stage === 'existing' && renderExistingForm()}
        {stage === 'new' && renderNewForm()}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 6, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginBottom: 6, textTransform: 'capitalize' },
  smallBtn: { backgroundColor: '#EEE', padding: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  smallBtnText: { color: '#333' },
  submitButton: { backgroundColor: '#EE6969', padding: 14, borderRadius: 6, marginTop: 12, alignItems: 'center', marginBottom: 30 },
  submitText: { color: '#fff', fontWeight: '600' },
  yesBtn: { backgroundColor: '#EE6969', padding: 12, borderRadius: 6 },
  noBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#EE6969', padding: 12, borderRadius: 6 },
  yesText: { color: '#fff', fontWeight: '700' },
  noText: { color: '#EE6969', fontWeight: '700' },
  backBtn: { padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#ccc' },
  backText: { color: '#333' },
});
