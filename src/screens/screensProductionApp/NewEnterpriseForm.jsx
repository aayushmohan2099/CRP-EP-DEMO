// src/screens/epsakhi/NewEnterpriseForm.jsx
import React, { useEffect, useState } from 'react';
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
  Modal,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import gsApi from '../../api/gsApi';
import {
  getShgListForPanchayat,
  getCrpPanchayats,
  getCrpDetail,
} from '../../utils/tempStore';
import { getUser } from '../../utils/auth';

/**
 * NewEnterpriseForm.jsx
 *
 * - Uses logged-in user id from getUser() to populate created_by when creating recorded beneficiary.
 * - Uploads applicant_signature properly via multipart POST to /api/v1/new-enterprise/ (FormData).
 * - If no signature file selected, sends JSON payload as before.
 * - Preserves all original UI and validation / behavior.
 *
 * Note: This file duplicates the X-API headers used by your gsApi helper so multipart fetch has the same headers.
 * If you change them centrally in gsApi later, update these too.
 */

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
}

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

// NOTE: these header values duplicate those in your gsApi file to make direct fetch multipart call identical to gsApi requests.
// If you change them centrally in gsApi later, update these too.
const MULTIPART_X_API_ID = 'TH_EPS.BDOuser_test.co.in';
const MULTIPART_X_API_KEY = 'wFR8IpSeNMawCF4RPLXit1POGuQAJTSmRexBBOwO';
const BASE_URL = 'http://66.116.207.88:8088';

export default function NewEnterpriseForm({ route, navigation }) {
  const recordedBenef = route?.params?.recordedBenef || null; // may be null
  const beneficiary = route?.params?.beneficiary || null; // UPSRLM member row
  const existingNewEnterprise = route?.params?.newEnterprise || null;
  const tempShg = route?.params?.tempShg || null;
  const routeCrpUserId =
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

  // Form state:
  // - interest_answer: '', 'Yes', 'No'  -> controls skills_present path
  // - skills_present: text (if interest Yes), or 'No' when interest No
  // - location_answer: '', 'Yes', 'No' -> controls any_past_experience which is used to store selected location text or 'No'
  // - any_past_experience: text OR 'No'
  // - training_answer: '', 'Yes', 'No' -> controls training_required and family_member_ep_details mapping
  // - training_name: new field to store training_required when training_answer Yes
  // - training_department: new field to store family_member_ep_details when training_answer Yes
  // Other support fields kept as booleans like original.
  const [form, setForm] = useState({
    // Basic Questions
    interest_answer: existingNewEnterprise?.interest_answer ?? '', // 'Yes' | 'No' | ''
    skills_present: existingNewEnterprise?.skills_present ?? '',
    location_answer: existingNewEnterprise?.location_answer ?? '',
    any_past_experience: existingNewEnterprise?.any_past_experience ?? '',
    training_answer: existingNewEnterprise?.training_answer ?? '',
    training_name: existingNewEnterprise?.training_required ?? '',
    training_department: existingNewEnterprise?.family_member_ep_details ?? '',
    // Support required booleans (kept original keys)
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
    // Declaration
    declaration_confirmed:
      existingNewEnterprise?.declaration_confirmed || false,
    declaration_date:
      existingNewEnterprise?.declaration_date || '',
    // Signature field placeholder (URI string if existing)
    applicant_signature:
      existingNewEnterprise?.applicant_signature || '',
  });

  const [loading, setLoading] = useState(false);
  // store selected signature asset { uri, fileName, type }
  const [signatureAsset, setSignatureAsset] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);

  // Declaration date modal pickers
  const [declarationDateModalVisible, setDeclarationDateModalVisible] = useState(false);
  const [declDay, setDeclDay] = useState(null);
  const [declMonth, setDeclMonth] = useState(null);
  const [declYear, setDeclYear] = useState(null);
  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  const yearOptions = [];
  for (let y = currentYear; y >= startYear; y--) yearOptions.push(String(y));

  useEffect(() => {
    // load logged in user to get numeric PK for created_by
    (async () => {
      try {
        const u = await getUser();
        if (u) {
          setLoggedUser(u);
          if (u.access) {
            // keep gsApi's token in sync
            gsApi.setAuthToken?.(u.access, u.refresh);
          }
        }
      } catch (e) {
        console.warn('Unable to load user', e);
      }
    })();
  }, []);

  // keep pickers in sync if declaration_date pre-filled
  useEffect(() => {
    const d = form.declaration_date;
    if (!d) {
      setDeclDay(null);
      setDeclMonth(null);
      setDeclYear(null);
      return;
    }
    try {
      // handle ISO or plain YYYY-MM-DD
      const isoPart = typeof d === 'string' ? d.split('T')[0] : '';
      const parts = isoPart.split('-');
      if (parts.length === 3) {
        setDeclYear(parts[0]);
        setDeclMonth(String(parseInt(parts[1], 10)));
        setDeclDay(String(parseInt(parts[2], 10)));
        return;
      }
      // fallback
      const dt = new Date(d);
      if (!Number.isNaN(dt.getTime())) {
        setDeclYear(String(dt.getFullYear()));
        setDeclMonth(String(dt.getMonth() + 1));
        setDeclDay(String(dt.getDate()));
      }
    } catch (e) {
      console.warn('Failed to parse declaration_date', e);
    }
  }, [form.declaration_date]);

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

    // created_by: prefer loggedUser numeric PK; fallback to routeCrpUserId if numeric
    let created_by_to_send = null;
    const candidate = loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? routeCrpUserId;
    if (candidate !== null && candidate !== undefined) {
      if (typeof candidate === 'number') {
        created_by_to_send = candidate;
      } else if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
        created_by_to_send = parseInt(candidate.trim(), 10);
      } else {
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

  const performMultipartCreateNewEnterprise = async (formData) => {
    // sends FormData to /api/v1/new-enterprise/ with same auth & X-API headers as gsApi
    const token = gsApi.getAuthToken ? gsApi.getAuthToken() : null;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    headers['X-API-ID'] = MULTIPART_X_API_ID;
    headers['X-API-KEY'] = MULTIPART_X_API_KEY;
    // DO NOT set Content-Type - fetch will set boundary automatically

    const url = `${BASE_URL}/api/v1/new-enterprise/`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const text = await res.text();
    try {
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        const err = { status: res.status, data };
        throw err;
      }
      return data;
    } catch (e) {
      // If response isn't JSON, still handle non-ok
      if (!res.ok) throw { status: res.status, data: text || null };
      return text;
    }
  };

  const handleSubmit = async () => {
    if (!beneficiary && !recordedBenef) {
      Alert.alert(
        'Error',
        'Beneficiary data missing. Please go back and start recording again.'
      );
      return;
    }

    // Basic validation: ensure business interest answered and location answered and training answered
    if (!form.interest_answer) {
      Alert.alert('Validation', 'Please answer the "What type of business / work you are interested in?" question.');
      return;
    }
    if (!form.location_answer) {
      Alert.alert('Validation', 'Please answer the "Have you selected any location for your Enterprise?" question.');
      return;
    }
    if (!form.training_answer) {
      Alert.alert('Validation', 'Please answer the "Have you received any training?" question.');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Ensure we have a recorded beneficiary row
      const recordedBenefId = await ensureRecordedBeneficiary();

      // Prepare payload mapping per your rules:
      // - skills_present: if interest_answer === 'No' => 'No', else skills_present text (could be empty string)
      // - any_past_experience: if location_answer === 'No' => 'No', else any_past_experience text
      // - training_required & family_member_ep_details:
      //    if training_answer === 'Yes' => training_required = training_name (text), family_member_ep_details = training_department (text)
      //    if training_answer === 'No' => training_required = 'No', family_member_ep_details = null

      const skills_present_out =
        form.interest_answer === 'No' ? 'No' : (form.skills_present || '');

      const any_past_experience_out =
        form.location_answer === 'No' ? 'No' : (form.any_past_experience || '');

      let training_required_out = null;
      let family_member_ep_details_out = null;
      if (form.training_answer === 'Yes') {
        training_required_out = form.training_name || '';
        family_member_ep_details_out = form.training_department || '';
      } else {
        training_required_out = 'No';
        family_member_ep_details_out = null;
      }

      const payloadObj = {
        recorded_benef_id: recordedBenefId,
        // Basic Questions mapping
        skills_present: skills_present_out,
        training_required: training_required_out,
        any_past_experience: any_past_experience_out,
        family_member_ep_details: family_member_ep_details_out,
        // support flags
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
        // declaration
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
          // send explicit null as empty string to avoid multipart server issues; except family_member_ep_details we may want empty string for multipart
          formData.append(k, v === null || v === undefined ? '' : String(v));
        });

        // Attach applicant_signature as file part
        const filePart = {
          uri: signatureAsset.uri,
          name: signatureAsset.fileName || `signature_${Date.now()}.jpg`,
          type: signatureAsset.type || 'image/jpeg',
        };
        formData.append('applicant_signature', filePart);

        try {
          res = await performMultipartCreateNewEnterprise(formData);
        } catch (multipartErr) {
          console.warn('Multipart create attempt failed:', multipartErr);
          // Try JSON fallback create (create without signature) then attempt upload via update endpoint
          const createRes = await gsApi.createNewEnterprise(payloadObj);
          const enterpriseId =
            createRes?.TH_urid || createRes?.TH_URID || createRes?.id || null;
          if (!enterpriseId) {
            throw new Error('New enterprise saved but ID missing in response.');
          }

          // Try update with multipart if updateNewEnterprise supports FormData (best-effort)
          try {
            if (typeof gsApi.updateNewEnterprise === 'function') {
              try {
                const tryForm = new FormData();
                tryForm.append('applicant_signature', filePart);
                await gsApi.updateNewEnterprise(enterpriseId, tryForm);
              } catch (e) {
                if (typeof gsApi.uploadEnterpriseMedia === 'function') {
                  const mediaForm = new FormData();
                  mediaForm.append('enterprise_id', enterpriseId);
                  mediaForm.append('applicant_signature', filePart);
                  await gsApi.uploadEnterpriseMedia(mediaForm);
                } else {
                  console.warn('No suitable upload fallback available in gsApi.');
                }
              }
            }
          } catch (e) {
            console.warn('Fallback upload attempts failed', e);
          }

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

  // Small UI helpers for Yes/No toggles
  const YesNoToggle = ({ value, onChange }) => (
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
      <TouchableOpacity
        style={[styles.smallBtn, value === 'Yes' && { backgroundColor: '#EE6969' }]}
        onPress={() => onChange('Yes')}
      >
        <Text style={{ color: value === 'Yes' ? '#fff' : '#333', fontWeight: '600' }}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.smallBtn, value === 'No' && { backgroundColor: '#EE6969' }]}
        onPress={() => onChange('No')}
      >
        <Text style={{ color: value === 'No' ? '#fff' : '#333', fontWeight: '600' }}>No</Text>
      </TouchableOpacity>
    </View>
  );

  // When opening declaration modal, initialize pickers to existing value or today
  const openDeclarationModal = () => {
    const existing = form.declaration_date;
    let initYear = null;
    let initMonth = null;
    let initDay = null;

    if (existing && typeof existing === 'string') {
      try {
        const isoPart = existing.split('T')[0];
        const parts = isoPart.split('-');
        if (parts.length === 3) {
          initYear = parts[0];
          initMonth = String(parseInt(parts[1], 10));
          initDay = String(parseInt(parts[2], 10));
        }
      } catch (e) {
        // ignore
      }
    }

    if (!initYear) {
      const dt = new Date();
      initYear = String(dt.getFullYear());
      initMonth = String(dt.getMonth() + 1);
      initDay = String(dt.getDate());
    }

    setDeclYear(initYear);
    setDeclMonth(initMonth);
    setDeclDay(initDay);
    setDeclarationDateModalVisible(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>
        New Enterprise — {benefName}
      </Text>

      {/* ===== Basic Questions (new section) ===== */}
      <Text style={styles.sectionHeading}>Basic Questions</Text>

      {/* Business interest */}
      <Text style={styles.label}>Are you interested in any type of Work / Business?</Text>
      <YesNoToggle
        value={form.interest_answer}
        onChange={(v) => {
          // if No, set skills_present to 'No' (but keep interest_answer)
          if (v === 'No') {
            setForm((p) => ({ ...p, interest_answer: 'No', skills_present: 'No' }));
          } else {
            setForm((p) => ({ ...p, interest_answer: 'Yes', skills_present: '' }));
          }
        }}
      />
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
        Eg: Food processing, Tailoring, Beauty & Wellness, Artisan, General Store, etc.
      </Text>
      {form.interest_answer === 'Yes' && (
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          value={form.skills_present}
          onChangeText={(v) => setField('skills_present', v)}
          placeholder="Describe the business / work you are interested in"
          multiline
        />
      )}

      {/* Location selection (re-using any_past_experience field for location per your instruction) */}
      <Text style={[styles.label, { marginTop: 12 }]}>Have you selected any location for your Enterprise?</Text>
      <YesNoToggle
        value={form.location_answer}
        onChange={(v) => {
          if (v === 'No') {
            setForm((p) => ({ ...p, location_answer: 'No', any_past_experience: 'No' }));
          } else {
            setForm((p) => ({ ...p, location_answer: 'Yes', any_past_experience: '' }));
          }
        }}
      />
      {form.location_answer === 'Yes' && (
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          value={form.any_past_experience}
          onChangeText={(v) => setField('any_past_experience', v)}
          placeholder="Enter selected location details (village / town / area)"
          multiline
        />
      )}

      {/* Training received */}
      <Text style={[styles.label, { marginTop: 12 }]}>Have you received any training?</Text>
      <YesNoToggle
        value={form.training_answer}
        onChange={(v) => {
          if (v === 'No') {
            // per instruction: if No => training_required should be 'No', family_member_ep_details => NULL
            setForm((p) => ({
              ...p,
              training_answer: 'No',
              training_name: 'No',
              training_department: '',
            }));
          } else {
            setForm((p) => ({
              ...p,
              training_answer: 'Yes',
              training_name: '',
              training_department: '',
            }));
          }
        }}
      />
      {form.training_answer === 'Yes' && (
        <>
          <Text style={[styles.label, { marginTop: 8 }]}>Training Name or Type</Text>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            value={form.training_name}
            onChangeText={(v) => setField('training_name', v)}
            placeholder="Enter training name / type"
            multiline
          />

          <Text style={[styles.label, { marginTop: 8 }]}>Training Department</Text>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            value={form.training_department}
            onChangeText={(v) => setField('training_department', v)}
            placeholder="Enter training department / institution"
            multiline
          />
        </>
      )}

      {/* Next: Support Required */}
      <Text style={styles.sectionHeading}>Support Required from Department</Text>

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

      {/* Declaration */}
      <Text style={styles.sectionHeading}>Declaration</Text>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setField('declaration_confirmed', !form.declaration_confirmed)}
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

      <Text style={[styles.label, { marginTop: 10 }]}>Declaration Date</Text>
      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center', height: 44 }]}
        onPress={openDeclarationModal}
      >
        <Text>{form.declaration_date || 'Select date'}</Text>
      </TouchableOpacity>

      <Modal
        visible={declarationDateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeclarationDateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { padding: 12 }]}>
            <Text style={[styles.label, { textAlign: 'center' }]}>
              Select Declaration Date
            </Text>

            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              {/* Day picker */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>Day</Text>
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, backgroundColor: '#fff' }}>
                  <ScrollView style={{ maxHeight: 120 }}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <TouchableOpacity key={d} onPress={() => setDeclDay(String(d))} style={{ padding: 8 }}>
                        <Text style={{ color: declDay === String(d) ? '#EE6969' : '#333' }}>{String(d)}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Month picker */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>Month</Text>
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, backgroundColor: '#fff' }}>
                  <ScrollView style={{ maxHeight: 120 }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <TouchableOpacity key={m} onPress={() => setDeclMonth(String(m))} style={{ padding: 8 }}>
                        <Text style={{ color: declMonth === String(m) ? '#EE6969' : '#333' }}>{String(m)}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Year picker */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>Year</Text>
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, backgroundColor: '#fff' }}>
                  <ScrollView style={{ maxHeight: 120 }}>
                    {yearOptions.map((y) => (
                      <TouchableOpacity key={y} onPress={() => setDeclYear(y)} style={{ padding: 8 }}>
                        <Text style={{ color: declYear === y ? '#EE6969' : '#333' }}>{y}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.cancelBtn, { paddingHorizontal: 16 }]}
                onPress={() => setDeclarationDateModalVisible(false)}
              >
                <Text style={{ color: '#EE6969', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallBtn, { paddingHorizontal: 16 }]}
                onPress={() => {
                  const dd = String(declDay ?? '1').padStart(2, '0');
                  const mm = String(declMonth ?? '1').padStart(2, '0');
                  const yyyy = String(declYear ?? currentYear);
                  const iso = `${yyyy}-${mm}-${dd}`;
                  setField('declaration_date', iso);
                  setDeclarationDateModalVisible(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={[styles.label, { marginTop: 12 }]}>Applicant Signature (image)</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={pickSignatureFromGallery}
        >
          <Text style={{ fontWeight: '600' }}>Upload</Text>
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
    minWidth: 70,
    alignItems: 'center',
  },
  cancelBtn: { padding: 10, alignItems: 'center', marginTop: 8 },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 300,
    paddingBottom: 15,
    paddingTop: 10,
  },
});
