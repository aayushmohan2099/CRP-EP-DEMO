// src/screens/epsakhi/CRPRecordFlowProduction.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import gsApi from '../../api/gsApi';
import {
  getCrpDetail,
  getCrpPanchayats,
  getCrpRecordedBeneficiaries,
  setCrpRecordedBeneficiaries,
  getShgListForPanchayat,
  setShgListForPanchayat,
} from '../../utils/tempStore';
import { getUser } from '../../utils/auth';
import LoaderModal from '../LoaderModal';
import BackButton from '../../components/BackButton';
import SearchBar from '../SearchBar';

export default function CRPRecordFlowProduction({ navigation }) {
  const [step, setStep] = useState('gp');
  const [loading, setLoading] = useState(false);

  const [panchayats, setPanchayats] = useState([]);
  const [villages, setVillages] = useState([]);
  const [shgs, setShgs] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);

  const [selectedPanchayat, setSelectedPanchayat] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedShg, setSelectedShg] = useState(null);

  const [blockId, setBlockId] = useState(null);
  const [crpUserId, setCrpUserId] = useState(null); // for created_by fallback

  const [query, setQuery] = useState('');
  const [benefQuery, setBenefQuery] = useState('');

  // Keep logged user (so we can derive numeric id for created_by)
  const [loggedUser, setLoggedUser] = useState(null);

  // RECORDED BENEFICIARIES STATE (kept in sync with server)
  const [recorded, setRecorded] = useState(getCrpRecordedBeneficiaries() || []);

  useEffect(() => {
    const gps = getCrpPanchayats() || [];
    setPanchayats(gps);

    const detail = getCrpDetail();
    setBlockId(detail?.block_id || detail?.blockId || null);

    // Try to derive a stable CRP user identifier for created_by fallback
    const derivedUserId =
      detail?.master_user_id ||
      detail?.masterUserId ||
      detail?.user_id ||
      detail?.userId ||
      detail?.username ||
      detail?.login_id ||
      null;
    setCrpUserId(derivedUserId);

    // load logged in user to get numeric PK for created_by and keep gsApi token in sync
    (async () => {
      try {
        const u = await getUser();
        if (u) {
          setLoggedUser(u);
          if (u.access) {
            gsApi.setAuthToken?.(u.access, u.refresh);
          }
        }
      } catch (e) {
        console.warn('Unable to load user in CRPRecordFlowProduction', e);
      }
    })();

    // Refresh recorded beneficiaries for all CRP panchayats
    const panchayatIds = gps.map((p) => p.panchayat_id).filter(Boolean);
    if (panchayatIds.length) {
      (async () => {
        try {
          const res = await gsApi.getRecordedBeneficiaries({
            panchayat_multi: panchayatIds.join(','),
            page_size: 5000,
          });
          const recList = Array.isArray(res?.results)
            ? res.results
            : Array.isArray(res)
            ? res
            : [];
          setRecorded(recList);
          try {
            setCrpRecordedBeneficiaries?.(recList);
          } catch (e) {
            // ignore if setter not available
          }
        } catch (err) {
          console.log('Error refreshing recorded beneficiaries', err);
        }
      })();
    }
  }, []);

  const filterRecordedCountForVillage = (villageId) =>
    recorded.filter((r) => String(r.village_id) === String(villageId)).length;

  const filterRecordedCountForShg = (shgCode) =>
    recorded.filter((r) => String(r.lokos_shg_code) === String(shgCode)).length;

  const handleSelectPanchayat = async (p) => {
    if (!blockId) {
      Alert.alert('Error', 'CRP not mapped to block. Please reopen the app.');
      return;
    }

    setSelectedPanchayat(p);
    setSelectedVillage(null);
    setSelectedShg(null);
    setVillages([]);
    setShgs([]);
    setBeneficiaries([]);
    setStep('village');

    try {
      setLoading(true);

      // ---- 1) Fetch villages for this Panchayat ----
      const resVillages = await gsApi.getVillagesByPanchayat(p.panchayat_id);
      // DRF style: { count, next, previous, results: [...] }
      const villagesRows = Array.isArray(resVillages?.results)
        ? resVillages.results
        : Array.isArray(resVillages?.data)
        ? resVillages.data
        : Array.isArray(resVillages)
        ? resVillages
        : [];
      setVillages(villagesRows);

      // ---- 2) Fetch SHG list for this Panchayat (and cache by Panchayat) ----
      let shgRows = getShgListForPanchayat(p.panchayat_id) || [];
      if (!shgRows.length) {
        const shgRes = await gsApi.getUpsrlmShgList(blockId, {
          panchayat_id: p.panchayat_id,
          page_size: 5000,
        });

        // UPSRLM list: { meta: {...}, data: [ {...}, ... ] }
        shgRows = Array.isArray(shgRes?.data)
          ? shgRes.data
          : Array.isArray(shgRes?.results)
          ? shgRes.results
          : Array.isArray(shgRes)
          ? shgRes
          : [];

        try {
          setShgListForPanchayat(p.panchayat_id, shgRows);
        } catch (e) {
          // ignore if storage helper not available/writable
        }
      }
      // We don't setShgs here; SHGs will be filtered by village in handleSelectVillage.
    } catch (err) {
      console.log('Error in handleSelectPanchayat', err);
      Alert.alert('Error', 'Failed to fetch villages / SHGs for this Panchayat.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVillage = async (v) => {
    setSelectedVillage(v);
    setSelectedShg(null);
    setBeneficiaries([]);
    setStep('shg');

    try {
      // SHGs for this Panchayat are cached per panchayat
      const allShgs = getShgListForPanchayat(selectedPanchayat?.panchayat_id) || [];

      // Filter SHGs by village (field names from UPSRLM API: villageId)
      const shgsInVillage = allShgs.filter((s) => {
        const shgVillage =
          s.villageId !== undefined && s.villageId !== null
            ? s.villageId
            : s.village_id;
        return String(shgVillage) === String(v.village_id);
      });

      setShgs(shgsInVillage);
    } catch (err) {
      console.log('Error in handleSelectVillage', err);
      Alert.alert('Error', 'Failed to filter SHGs for this village.');
    }
  };

  const handleSelectShg = async (s) => {
    setSelectedShg(s);
    setStep('beneficiaries');
    try {
      setLoading(true);
      const res = await gsApi.getUpsrlmShgMembers(s.code, { page_size: 500 });
      // Members API: { meta: {...}, data: [ ... ] }
      const rows = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.results)
        ? res.results
        : Array.isArray(res)
        ? res
        : [];

      const enriched = rows.map((m) => {
        const rec = recorded.find(
          (r) =>
            String(r.lokos_member_code) === String(m.member_code) &&
            String(r.lokos_shg_code) === String(s.code)
        );
        return { ...m, _isRecorded: !!rec, _recordRow: rec || null };
      });
      setBeneficiaries(enriched);
    } catch (err) {
      console.log('Error in handleSelectShg', err);
      Alert.alert('Error', 'Failed to fetch SHG members.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPanchayats = panchayats.filter((p) =>
    (p.panchayat_name_en || '').toLowerCase().includes(query.toLowerCase())
  );

  const filteredVillages = villages.filter((v) =>
    (v.village_name_english || v.village_name || '')
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const filteredShgs = shgs.filter((s) =>
    (s.name || s.name_en || '').toLowerCase().includes(query.toLowerCase())
  );

  const filteredBeneficiaries = beneficiaries.filter((b) =>
    (b.member_name || '').toLowerCase().includes(benefQuery.toLowerCase())
  );

  // Helper - calculate age from dob string (ISO or YYYY-MM-DD). Returns integer or null
  const calculateAge = (dobStr) => {
    if (!dobStr) return null;
    try {
      const dob = new Date(dobStr);
      if (isNaN(dob.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return null;
    }
  };

  // Helper - build record payload from a member row (includes created_by logic similar to NewEnterpriseForm)
  const buildRecordedPayloadFromMember = (member, shg) => {
    // addresses & phones may be arrays
    const addresses = Array.isArray(member?.member_addresses) ? member.member_addresses : [];
    const phones = Array.isArray(member?.member_phones) ? member.member_phones : [];

    const primaryAddress = addresses[0] || {};
    const primaryPhone = phones[0] || {};

    // Determine created_by: prefer loggedUser numeric PK; fallback to crpUserId if numeric (like NewEnterpriseForm)
    let created_by_to_send = null;
    const candidate =
      loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? crpUserId;
    if (candidate !== null && candidate !== undefined) {
      if (typeof candidate === 'number') {
        created_by_to_send = candidate;
      } else if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
        created_by_to_send = parseInt(candidate.trim(), 10);
      } else {
        created_by_to_send = null;
      }
    }

    const payload = {
      // System fields
      enterprise_id: null, // explicitly null as requested

      // Lokos / member fields
      lokos_member_code: member?.member_code ?? null,
      applicant_name: member?.member_name ?? null,
      age: calculateAge(member?.dob),
      gender: member?.gender ?? null,
      marital_status: member?.marital_status ?? null,
      father_husband_name: member?.father_husband ?? null,
      category: member?.social_category ?? null,
      education: member?.education ?? null,

      // Address fields (from first address object)
      address: primaryAddress?.address_line1 ?? null,
      district_id: primaryAddress?.district_id ?? null,
      block_id: primaryAddress?.block_id ?? blockId ?? null,
      panchayat_id: primaryAddress?.panchayat_id ?? selectedPanchayat?.panchayat_id ?? null,
      village_id: primaryAddress?.village_id ?? selectedVillage?.village_id ?? null,

      // Contact
      mobile: primaryPhone?.phone_no ?? null,

      // SHG code from selected SHG (fallback to member.shg_code if present)
      lokos_shg_code: (shg?.code ?? member?.shg_code ?? selectedShg?.code) ?? null,
    };

    if (created_by_to_send !== null) {
      payload.created_by = created_by_to_send;
    }

    return payload;
  };

  // Try different known names for create API on gsApi
  const findCreateApi = () => {
    return (
      gsApi.createRecordedBeneficiary ||
      gsApi.createRecordedBenef ||
      gsApi.postRecordedBeneficiary ||
      gsApi.createRecorded ||
      gsApi.createRecordedBeneficiaries ||
      (() => {
        throw new Error('No createRecorded API found on gsApi');
      })
    );
  };

  // Create recorded beneficiary on server and update local cache/state
  const createRecordedForNonInterested = async (member) => {
    setLoading(true);
    const payload = buildRecordedPayloadFromMember(member, selectedShg);

    try {
      const createFn = findCreateApi();
      let res;
      res = await createFn(payload);

      // Normalize response into created row. If API returns the created object, use it; otherwise, create a local object.
      const createdRow =
        res && typeof res === 'object' && (res.id || res.lokos_member_code)
          ? res
          : {
              id: null,
              ...payload,
            };

      // Keep local flags similar to others: mark _isRecorded true and store _recordRow reference
      const finalRow = { ...createdRow, _isRecorded: true, _recordRow: createdRow };

      // update recorded state & cache
      const updated = [...recorded, finalRow];
      setRecorded(updated);
      try {
        setCrpRecordedBeneficiaries?.(updated);
      } catch (e) {
        // ignore if setter not available
      }

      // Also update the beneficiaries listing in memory (so UI shows 'Recorded')
      const updatedBeneficiaries = beneficiaries.map((b) =>
        String(b.member_code) === String(member.member_code) &&
        String((selectedShg?.code ?? b.shg_code ?? '') ?? '') ===
          String((selectedShg?.code ?? '') ?? '')
          ? { ...b, _isRecorded: true, _recordRow: finalRow }
          : b
      );
      setBeneficiaries(updatedBeneficiaries);

      Alert.alert('Recorded', 'Beneficiary marked as NOT INTERESTED and saved (enterprise_id = NULL).');
    } catch (err) {
      console.log('Error creating recorded beneficiary', err);
      Alert.alert('Error', 'Failed to save record for this beneficiary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBeneficiaryPress = async (row) => {
    const hasExisting = row._isRecorded;

    // If already recorded, do NOT open any form
    if (hasExisting) {
      Alert.alert('Already Recorded', 'This beneficiary enterprise has already been recorded.');
      return;
    }

    const name = row.member_name || 'the beneficiary';

    // Step 1: Ask whether the beneficiary already has an existing enterprise
    Alert.alert(
      `Does ${name} have an existing Enterprise?`,
      '',
      [
        {
          text: 'Yes',
          onPress: () =>
            navigation.navigate('ExistingEnterpriseForm', {
              beneficiary: row,
              recordedBenef: row._recordRow, // may be null
              tempShg: selectedShg, // for lokos_shg_code / fallback
              crpUserId, // for created_by in RecordedBenef
            }),
        },
        {
          text: 'No',
          onPress: () => {
            // Step 2: Ask if interested in opening a new enterprise
            Alert.alert(
              `Is ${name} interested in opening a new Enterprise?`,
              '',
              [
                {
                  text: 'Yes',
                  onPress: () =>
                    navigation.navigate('NewEnterpriseForm', {
                      beneficiary: row,
                      recordedBenef: row._recordRow,
                      tempShg: selectedShg,
                      crpUserId,
                    }),
                },
                {
                  text: 'No',
                  onPress: async () => {
                    // Create a recordBenef row with NULL enterprise_id (as requested)
                    await createRecordedForNonInterested(row);

                    // Ensure UI stays on beneficiaries list
                    setStep('beneficiaries');
                  },
                  style: 'default',
                },
              ],
              { cancelable: true }
            );
          },
          style: 'default',
        },
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const getTitle = () =>
    step === 'gp'
      ? 'Select Gram Panchayat'
      : step === 'village'
      ? 'Select Village'
      : step === 'shg'
      ? 'Select SHG'
      : 'Select Beneficiary';

  // Back button logic per step
  const handleStepBack = () => {
    if (step === 'gp') {
      navigation.goBack();
    } else if (step === 'village') {
      setStep('gp');
      setSelectedPanchayat(null);
      setSelectedVillage(null);
      setSelectedShg(null);
      setVillages([]);
      setShgs([]);
      setBeneficiaries([]);
    } else if (step === 'shg') {
      setStep('village');
      setSelectedShg(null);
      setBeneficiaries([]);
    } else if (step === 'beneficiaries') {
      setStep('shg');
      setBeneficiaries([]);
    }
  };

  const renderList = () => {
    switch (step) {
      case 'gp':
        return (
          <FlatList
            data={filteredPanchayats}
            keyExtractor={(item) => String(item.panchayat_id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSelectPanchayat(item)}
              >
                <Text style={styles.listText}>
                  {item.panchayat_name_en || `Panchayat ${item.panchayat_id}`}
                </Text>
                <Text style={styles.metaText}>
                  Recorded:{' '}
                  {
                    recorded.filter(
                      (r) => String(r.panchayat_id) === String(item.panchayat_id)
                    ).length
                  }
                </Text>
              </TouchableOpacity>
            )}
          />
        );
      case 'village':
        return (
          <FlatList
            data={filteredVillages}
            keyExtractor={(item) => String(item.village_id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSelectVillage(item)}
              >
                <Text style={styles.listText}>
                  {item.village_name_english ||
                    item.village_name ||
                    `Village ${item.village_id}`}
                </Text>
                <Text style={styles.metaText}>
                  Recorded: {filterRecordedCountForVillage(item.village_id)}
                </Text>
              </TouchableOpacity>
            )}
          />
        );
      case 'shg':
        return (
          <FlatList
            data={filteredShgs}
            keyExtractor={(item, idx) => item.code ?? String(idx)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSelectShg(item)}
              >
                <Text style={styles.listText}>
                  {item.name || item.name_en || item.code}
                </Text>
                <Text style={styles.metaText}>
                  Recorded: {filterRecordedCountForShg(item.code)}
                </Text>
              </TouchableOpacity>
            )}
          />
        );
      default:
        return (
          <FlatList
            data={filteredBeneficiaries}
            keyExtractor={(item, idx) => item.member_code ?? String(idx)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleBeneficiaryPress(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.listText}>
                    {item.member_name}
                    {item._isRecorded ? ' (Recorded)' : ''}
                  </Text>
                  <Text style={styles.metaText}>Member Code: {item.member_code}</Text>
                </View>
                <Text
                  style={[
                    styles.statusBadge,
                    item._isRecorded
                      ? { backgroundColor: '#D4EDDA', color: '#155724' }
                      : { backgroundColor: '#F8D7DA', color: '#721C24' },
                  ]}
                >
                  {item._isRecorded ? 'Recorded' : 'Not Recorded'}
                </Text>
              </TouchableOpacity>
            )}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <LoaderModal visible={loading} message="Loading..." />
      <View style={styles.headerRow}>
        <BackButton onPress={handleStepBack} />
        <Text style={styles.headerTitle}>{getTitle()}</Text>
      </View>

      <SearchBar
        placeholder={step === 'beneficiaries' ? 'Search Beneficiary' : 'Search...'}
        value={step === 'beneficiaries' ? benefQuery : query}
        onChangeText={step === 'beneficiaries' ? setBenefQuery : setQuery}
      />

      {renderList()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, marginTop: 40, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  listText: { fontSize: 14, flex: 1, color: '#222' },
  metaText: { fontSize: 12, color: '#666' },
  statusBadge: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
