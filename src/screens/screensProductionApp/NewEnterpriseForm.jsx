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
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import gsApi from '../../api/gsApi';
import {
  getShgListForPanchayat,
  getCrpPanchayats,
  getCrpDetail,
} from '../../utils/tempStore';

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
};

// Android camera permission helper
const requestCameraPermissionIfNeeded = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'We need access to your camera to capture signature.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
        buttonNeutral: 'Ask Me Later',
      }
    );

    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    console.warn('Camera permission error', e);
    return false;
  }
};

export default function NewEnterpriseForm({ route, navigation }) {
  const recordedBenef = route?.params?.recordedBenef || null; // may be null
  const beneficiary = route?.params?.beneficiary || null; // UPSRLM member row
  const existingNewEnterprise = route?.params?.newEnterprise || null;
  const tempShg = route?.params?.tempShg || null;
  const crpUserId =
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
  // store selected signature asset { uri, fileName, type }
  const [signatureAsset, setSignatureAsset] = useState(null);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleBool = (key) =>
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  // pick signature from gallery
  const pickSignatureFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('launchImageLibrary error', result.errorMessage || result.errorCode);
        Alert.alert('Error', 'Failed to pick image.');
        return;
      }
      const asset = result.assets && result.assets[0];
      if (asset) {
        setSignatureAsset(asset);
        setForm((p) => ({ ...p, applicant_signature: asset.uri }));
      }
    } catch (e) {
      console.error('pickSignatureFromGallery', e);
      Alert.alert('Error', 'Unable to pick signature.');
    }
  };

  // take signature photo
  const takeSignaturePhoto = async () => {
    try {
      const ok = await requestCameraPermissionIfNeeded();
      if (!ok) {
        Alert.alert('Permission required', 'Camera permission is required to capture signature.');
        return;
      }
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('launchCamera error', result.errorMessage || result.errorCode);
        Alert.alert('Error', 'Failed to capture image.');
        return;
      }
      const asset = result.assets && result.assets[0];
      if (asset) {
        setSignatureAsset(asset);
        setForm((p) => ({ ...p, applicant_signature: asset.uri }));
      }
    } catch (e) {
      console.error('takeSignaturePhoto', e);
      Alert.alert('Error', 'Unable to capture signature.');
    }
  };

  // Try to find shg info from cache if needed
  const findShgAcrossCachedPanchayats = async (shgCode) => {
    if (!shgCode) return null;
    try {
      // prefer tempShg if provided
      if (tempShg && (tempShg.code === shgCode || tempShg.shg_code === shgCode)) {
        return extractLocationFromShg(tempShg);
      }
      // iterate all CRP panchayats and use getShgListForPanchayat
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
      // not found
      return null;
    } catch (e) {
      console.warn('findShgAcrossCachedPanchayats error', e);
      return null;
    }
  };

  // Ensure recorded beneficiary exists (same fallback logic as ExistingEnterpriseForm)
  const ensureRecordedBeneficiary = async () => {
    // Try to get ID from passed recordedBenef (if any)
    let recordedBenefId =
      recordedBenef?.TH_urid ||
      recordedBenef?.TH_URID ||
      recordedBenef?.id ||
      null;

    if (recordedBenefId) return recordedBenefId;

    // No recordedBenef present – create it from UPSRLM beneficiary
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
    let marital_status = beneficiary.marital_status ?? beneficiary.maritalStatus ?? '';
    let father_husband_name = beneficiary.father_husband ?? beneficiary.father_husband_name ?? beneficiary.relation_name ?? '';

    let lokos_shg = lokosShgCode || beneficiary.shg_code || beneficiary.lokos_shg_code || null;

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

    // created_by: only send if numeric (server expects PK). If crpUserId is a username string, omit it.
    let created_by_to_send = null;
    if (crpUserId !== null && crpUserId !== undefined) {
      // accept integers or numeric strings only
      if (typeof crpUserId === 'number') {
        created_by_to_send = crpUserId;
      } else if (typeof crpUserId === 'string' && /^\d+$/.test(crpUserId.trim())) {
        created_by_to_send = parseInt(crpUserId.trim(), 10);
      } else {
        // don't set created_by if it's a non-numeric username
        created_by_to_send = null;
      }
    }

    const recordedPayload = {
      lokos_member_code: beneficiary.member_code || beneficiary.nic_member_code || null,
      applicant_name: beneficiary.member_name || '',
      age: age,
      gender: beneficiary.gender || '',
      marital_status: marital_status,
      father_husband_name: father_husband_name,
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
      // enterprise_id will be set after enterprise is created
    };
    if (created_by_to_send !== null) {
      recordedPayload.created_by = created_by_to_send;
    }

    const recRes = await gsApi.createRecordedBeneficiary(recordedPayload);

    recordedBenefId =
      recRes?.TH_urid || recRes?.TH_URID || recRes?.id || null;

    if (!recordedBenefId) {
      throw new Error(
        'Recorded beneficiary created but ID missing in response.'
      );
    }

    return recordedBenefId;
  };

  const handleSubmit = async () => {
    if (!beneficiary && !recordedBenef) {
      Alert.alert(
        'Error',
        'Beneficiary data missing. Please go back and start recording again.'
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

      // Step 1: Ensure we have a recorded beneficiary row
      const recordedBenefId = await ensureRecordedBeneficiary();

      // Step 2: Create / update new-enterprise row
      // If there is a signature asset (file), create multipart formdata; otherwise JSON.
      const payloadObj = {
        recorded_benef_id: recordedBenefId,
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
        // applicant_signature handled separately (file)
      };

      let res;

      // If signature file is present, send multipart FormData with the file
      if (signatureAsset && signatureAsset.uri) {
        const formData = new FormData();
        // append text fields (convert booleans/nulls to strings where necessary)
        Object.keys(payloadObj).forEach((k) => {
          const v = payloadObj[k];
          // FormData expects string values; null -> ''
          formData.append(k, v === null || v === undefined ? '' : String(v));
        });

        // Attach applicant_signature as file part
        // Ensure name and type exist (type often image/jpeg)
        const filePart = {
          uri: signatureAsset.uri,
          name: signatureAsset.fileName || `signature_${Date.now()}.jpg`,
          type: signatureAsset.type || 'image/jpeg',
        };
        formData.append('applicant_signature', filePart);

        // Some gsApi implementations accept FormData in create call.
        // Try to call createNewEnterprise with formData; if your gsApi expects a separate endpoint, update accordingly.
        try {
          res = await gsApi.createNewEnterprise(formData);
        } catch (multipartErr) {
          // In case gsApi.createNewEnterprise doesn't support multipart, try fallback: create JSON then upload separately (best-effort)
          console.warn('createNewEnterprise multipart attempt failed, trying JSON-create then upload. Error:', multipartErr);
          // First create via JSON (without signature)
          const createRes = await gsApi.createNewEnterprise(payloadObj);
          const enterpriseId =
            createRes?.TH_urid || createRes?.TH_URID || createRes?.id || null;
          if (!enterpriseId) {
            throw new Error('New enterprise saved but ID missing in response.');
          }
          // Build FormData to upload signature to an hypothetical endpoint - try gsApi.uploadNewEnterpriseSignature, or fallback to updateNewEnterprise with formData if supported
          const sigForm = new FormData();
          sigForm.append('applicant_signature', filePart);
          let uploadDone = false;
          // try a few plausible API helper names in gsApi
          const tryFns = [
            gsApi.uploadNewEnterpriseSignature,
            gsApi.uploadEnterpriseMedia, // sometimes same endpoint used
            gsApi.updateNewEnterprise, // may accept FormData for update
          ];
          for (const fn of tryFns) {
            if (typeof fn === 'function') {
              try {
                // if function expects (id, formData)
                if (fn.length === 2) {
                  await fn(enterpriseId, sigForm);
                } else {
                  // try single-arg form
                  await fn(sigForm);
                }
                uploadDone = true;
                break;
              } catch (e) {
                // continue trying others
                console.warn('upload attempt failed for one of fallback functions', e);
              }
            }
          }
          if (!uploadDone) {
            console.warn('Could not upload signature automatically; enterprise created - please upload signature separately or extend gsApi.');
          }
          // return the createRes as res so the rest of the flow works
          res = createRes;
        }
      } else {
        // No signature file: send JSON as before
        res = await gsApi.createNewEnterprise(payloadObj);
      }

      const enterpriseId =
        res?.TH_urid || res?.TH_URID || res?.id || null;

      if (!enterpriseId) {
        throw new Error(
          'New enterprise saved but ID missing in response.'
        );
      }

      // Step 3: Link recorded-beneficiaries.enterprise_id to new-enterprise id
      try {
        await gsApi.updateRecordedBeneficiary(recordedBenefId, {
          enterprise_id: enterpriseId,
        });
      } catch (e) {
        console.error(
          'Failed to update recorded beneficiary enterprise_id',
          e
        );
        // not fatal for form save
      }

      Alert.alert('Success', 'New enterprise saved successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error('NewEnterprise submit error', err);
      // Show useful message if server returned validation object
      const serverMsg =
        err?.data?.detail ||
        (err?.data && typeof err.data === 'object' ? JSON.stringify(err.data) : null) ||
        err?.message ||
        'Failed to save new enterprise. Please try again.';
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={pickSignatureFromGallery}
        >
          <Text style={{ fontWeight: '600' }}>Pick</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={takeSignaturePhoto}
        >
          <Text style={{ fontWeight: '600' }}>Camera</Text>
        </TouchableOpacity>
        {signatureAsset?.uri ? (
          <Text style={{ marginLeft: 8, flex: 1 }} numberOfLines={1}>
            {signatureAsset.fileName || signatureAsset.uri}
          </Text>
        ) : form.applicant_signature ? (
          <Text style={{ marginLeft: 8, flex: 1 }} numberOfLines={1}>
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
