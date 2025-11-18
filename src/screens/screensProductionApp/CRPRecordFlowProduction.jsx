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
  const [crpUserId, setCrpUserId] = useState(null); // for created_by

  const [query, setQuery] = useState('');
  const [benefQuery, setBenefQuery] = useState('');

  // RECORDED BENEFICIARIES STATE (kept in sync with server)
  const [recorded, setRecorded] = useState(getCrpRecordedBeneficiaries() || []);

  useEffect(() => {
    const gps = getCrpPanchayats() || [];
    setPanchayats(gps);

    const detail = getCrpDetail();
    setBlockId(detail?.block_id || detail?.blockId || null);

    // Try to derive a stable CRP user identifier for created_by
    const derivedUserId =
      detail?.master_user_id ||
      detail?.masterUserId ||
      detail?.user_id ||
      detail?.userId ||
      detail?.username ||
      detail?.login_id ||
      null;
    setCrpUserId(derivedUserId);

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

  const handleBeneficiaryPress = async (row) => {
    const hasExisting = row._isRecorded;

    // ✅ If already recorded, do NOT open any form
    if (hasExisting) {
      Alert.alert(
        'Already Recorded',
        'This beneficiary enterprise has already been recorded.'
      );
      return;
    }

    // No enterprise yet – ask CRP which type to record
    Alert.alert(
      'Enterprise Detail',
      'Does the beneficiary already have an existing enterprise?',
      [
        {
          text: 'Existing Enterprise',
          onPress: () =>
            navigation.navigate('ExistingEnterpriseForm', {
              beneficiary: row,
              recordedBenef: row._recordRow, // may be null
              tempShg: selectedShg, // for lokos_shg_code / fallback
              crpUserId, // for created_by in RecordedBenef
            }),
        },
        {
          text: 'New Enterprise',
          onPress: () =>
            navigation.navigate('NewEnterpriseForm', {
              beneficiary: row,
              recordedBenef: row._recordRow,
              tempShg: selectedShg,
              crpUserId,
            }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
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

  // ✅ Back button logic per step
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
                  <Text style={styles.metaText}>
                    Member Code: {item.member_code}
                  </Text>
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
