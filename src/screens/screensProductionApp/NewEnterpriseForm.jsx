// src/screens/epsakhi/NewEnterpriseForm.jsx
import React, { useState } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import gsApi from '../../api/gsApi';

const yesNo = [
  { label: 'Select...', value: '' },
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

export default function NewEnterpriseForm({ route, navigation }) {
  const recordedBenef = route?.params?.recordedBenef || null;
  const beneficiary = route?.params?.beneficiary || null;
  const existingNewEnterprise = route?.params?.newEnterprise || null;

  const [form, setForm] = useState({
    skills_present: existingNewEnterprise?.skills_present || '',
    training_required: existingNewEnterprise?.training_required || '',
    any_past_experience:
      existingNewEnterprise?.any_past_experience || '',
    family_member_ep_details:
      existingNewEnterprise?.family_member_ep_details || '',
    req_skill_training:
      existingNewEnterprise?.req_skill_training || false,
    req_ep_development_training:
      existingNewEnterprise?.req_ep_development_training || false,
    req_financial_assistance:
      existingNewEnterprise?.req_financial_assistance || false,
    req_credit_linkage:
      existingNewEnterprise?.req_credit_linkage || false,
    req_market_linkage:
      existingNewEnterprise?.req_market_linkage || false,
    req_branding: existingNewEnterprise?.req_branding || false,
    req_infra_support:
      existingNewEnterprise?.req_infra_support || false,
    req_digi_emarket_linkage:
      existingNewEnterprise?.req_digi_emarket_linkage || false,
    declaration_confirmed:
      existingNewEnterprise?.declaration_confirmed || false,
    declaration_date:
      existingNewEnterprise?.declaration_date || '',
    applicant_signature:
      existingNewEnterprise?.applicant_signature || '',
  });

  const [loading, setLoading] = useState(false);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleBool = (key) =>
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  const pickSignature = async () => {
    // Wire to your actual image picker later.
    const fakePath = `signature_${Date.now()}.png`;
    setForm((prev) => ({ ...prev, applicant_signature: fakePath }));
  };

  const handleSubmit = async () => {
    if (!recordedBenef?.TH_urid) {
      Alert.alert(
        'Error',
        'Recorded beneficiary ID missing. Please go back and start recording again.'
      );
      return;
    }
    if (!form.skills_present && !form.any_past_experience) {
      Alert.alert(
        'Validation',
        'Please fill at least skills present or past experience.'
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        recorded_benef_id: recordedBenef.TH_urid,
        skills_present: form.skills_present,
        training_required: form.training_required,
        any_past_experience: form.any_past_experience,
        family_member_ep_details: form.family_member_ep_details,
        req_skill_training: !!form.req_skill_training,
        req_ep_development_training:
          !!form.req_ep_development_training,
        req_financial_assistance: !!form.req_financial_assistance,
        req_credit_linkage: !!form.req_credit_linkage,
        req_market_linkage: !!form.req_market_linkage,
        req_branding: !!form.req_branding,
        req_infra_support: !!form.req_infra_support,
        req_digi_emarket_linkage:
          !!form.req_digi_emarket_linkage,
        declaration_confirmed: !!form.declaration_confirmed,
        declaration_date: form.declaration_date || null,
        applicant_signature: form.applicant_signature || null,
      };

      let res;
      if (existingNewEnterprise?.TH_urid) {
        res = await gsApi.updateNewEnterprise(
          existingNewEnterprise.TH_urid,
          payload
        );
      } else {
        res = await gsApi.createNewEnterprise(payload);
      }

      const enterpriseId = res?.TH_urid;
      if (!enterpriseId) {
        throw new Error(
          'New enterprise created but TH_urid missing in response.'
        );
      }

      await gsApi.updateRecordedBeneficiary(recordedBenef.TH_urid, {
        enterprise_id: enterpriseId,
      });

      Alert.alert('Success', 'New enterprise saved successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error('NewEnterprise submit error', err);
      Alert.alert(
        'Error',
        err?.data?.detail ||
          err?.message ||
          'Failed to save new enterprise. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const benefName =
    beneficiary?.member_name ||
    beneficiary?.name ||
    recordedBenef?.applicant_name ||
    '';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>
        New Enterprise — {benefName}
      </Text>

      <Text style={styles.sectionHeading}>Skills & Experience</Text>
      <Text style={styles.label}>
        Skills present (existing skills / interests)
      </Text>
      <TextInput
        style={styles.input}
        value={form.skills_present}
        onChangeText={(v) => setField('skills_present', v)}
        multiline
      />

      <Text style={styles.label}>Training required (if any)</Text>
      <TextInput
        style={styles.input}
        value={form.training_required}
        onChangeText={(v) => setField('training_required', v)}
        multiline
      />

      <Text style={styles.label}>Any past experience</Text>
      <TextInput
        style={styles.input}
        value={form.any_past_experience}
        onChangeText={(v) => setField('any_past_experience', v)}
        multiline
      />

      <Text style={styles.label}>
        Family member enterprise details (if any)
      </Text>
      <TextInput
        style={styles.input}
        value={form.family_member_ep_details}
        onChangeText={(v) =>
          setField('family_member_ep_details', v)
        }
        multiline
      />

      <Text style={styles.sectionHeading}>Support Required</Text>

      {[
        ['Skill Training', 'req_skill_training'],
        [
          'Entrepreneurship Development Training',
          'req_ep_development_training',
        ],
        ['Financial Assistance', 'req_financial_assistance'],
        ['Credit Linkage', 'req_credit_linkage'],
        ['Market Linkage', 'req_market_linkage'],
        ['Branding / Promotion', 'req_branding'],
        ['Infrastructure Support', 'req_infra_support'],
        ['Digital / e-Market Linkage', 'req_digi_emarket_linkage'],
      ].map(([label, key]) => (
        <TouchableOpacity
          key={key}
          style={styles.checkboxRow}
          onPress={() => toggleBool(key)}
        >
          <View
            style={[
              styles.checkbox,
              form[key] && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{label}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionHeading}>Declaration</Text>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => toggleBool('declaration_confirmed')}
      >
        <View
          style={[
            styles.checkbox,
            form.declaration_confirmed && styles.checkboxChecked,
          ]}
        />
        <Text style={styles.checkboxLabel}>
          I declare that all the information provided above is true to
          the best of my knowledge and belief.
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Declaration Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={form.declaration_date}
        onChangeText={(v) => setField('declaration_date', v)}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Applicant Signature (image)</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={pickSignature}
        >
          <Text style={{ fontWeight: '600' }}>Pick / Capture</Text>
        </TouchableOpacity>
        {form.applicant_signature ? (
          <Text
            style={{ marginLeft: 8, flex: 1 }}
            numberOfLines={1}
          >
            {form.applicant_signature}
          </Text>
        ) : null}
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
    marginVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
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
  },
});
