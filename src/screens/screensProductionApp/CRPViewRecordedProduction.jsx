// src/screens/epsakhi/CRPViewRecordedProduction.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  getCrpPanchayats,
  getCrpRecordedBeneficiaries,
} from '../../utils/tempStore';
import gsApi from '../../api/gsApi';
import LoaderModal from '../LoaderModal';
import BackButton from '../../components/BackButton';
import SearchBar from '../SearchBar';

// --- API base + headers (same as gsApi constants) ---
const API_BASE_URL = 'http://66.116.207.88:8088';
const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-ID': 'TH_EPS.BDOuser_test.co.in',
  'X-API-KEY': 'wFR8IpSeNMawCF4RPLXit1POGuQAJTSmRexBBOwO',
};

function buildAuthHeaders() {
  const headers = { ...BASE_HEADERS };
  try {
    if (typeof gsApi.getAuthToken === 'function') {
      const token = gsApi.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.warn('Failed to get auth token from gsApi', e);
  }
  return headers;
}

// Generic DELETE helper used here only (does NOT touch gsApi)
async function deleteResource(path) {
  const url =
    API_BASE_URL + (path.startsWith('/') ? path : `/${path}`);
  const headers = buildAuthHeaders();

  const res = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  const text = await res.text();
  if (!res.ok) {
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text || null;
    }
    throw { status: res.status, data };
  }
}

// Helper: RecordedBenef primary key
function getRecordedBenefId(row) {
  if (!row) return null;
  return (
    row.TH_urid ||
    row.TH_URID ||
    row.id ||
    row.recorded_benef_id ||
    null
  );
}

// Helper: Enterprise primary key from enterprise object
function getEnterprisePk(enterprise) {
  if (!enterprise) return null;
  return (
    enterprise.TH_urid ||
    enterprise.TH_URID ||
    enterprise.id ||
    null
  );
}

// Helper: key generation for FlatList items
function getRowKey(row, fallbackIndex, prefix = '') {
  const core =
    row.lokos_member_code
      ? String(row.lokos_member_code)
      : row.member_code
      ? String(row.member_code)
      : String(fallbackIndex);
  return prefix ? `${prefix}-${core}` : core;
}

// Extract array from possible API shapes
function extractResultsArray(data) {
  if (!data) return [];
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

// Find a record whose ID actually matches the enterpriseId
function findBestEnterpriseMatch(arr, enterpriseId) {
  if (!arr.length || !enterpriseId) return null;
  const target = String(enterpriseId);

  for (const rec of arr) {
    const candidates = [
      rec.TH_urid,
      rec.TH_URID,
      rec.enterprise_id,
      rec.enterpriseid,
      rec.enterprise_ID,
    ]
      .filter((v) => v !== null && v !== undefined)
      .map((v) => String(v));

    if (candidates.includes(target)) {
      return rec;
    }
  }

  // IMPORTANT: NO FALLBACK – if nothing strictly matches, treat as no enterprise
  return null;
}

export default function CRPViewRecordedProduction({ navigation }) {
  const [loading, setLoading] = useState(false);

  const [panchayats, setPanchayats] = useState([]);
  const [villagesByPanchayat, setVillagesByPanchayat] = useState({}); // { [panchayat_id]: [villages] }
  const [recordedList, setRecordedList] = useState([]);

  const [selectedPanchayatId, setSelectedPanchayatId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [searchText, setSearchText] = useState('');

  // Detail modal state
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecordedRow, setDetailRecordedRow] = useState(null);
  const [detailEnterprise, setDetailEnterprise] = useState(null);
  const [detailEnterpriseType, setDetailEnterpriseType] = useState(null); // 'existing' | 'new' | null

  // Cache: enterprise info by enterprise_id
  // { [enterprise_id]: { type: 'existing'|'new'|null, enterprise: object|null } }
  const [enterpriseInfoById, setEnterpriseInfoById] = useState({});

  // Progress for arranging beneficiaries
  const [classifying, setClassifying] = useState(false);
  const [classifyTotal, setClassifyTotal] = useState(0);
  const [classifyDone, setClassifyDone] = useState(0);

  // Initial data load
  useEffect(() => {
    const gps = getCrpPanchayats() || [];
    setPanchayats(gps);

    const recorded = getCrpRecordedBeneficiaries() || [];
    setRecordedList(recorded);
  }, []);

  // Load villages for a selected Panchayat
  const loadVillagesForPanchayat = async (panchayatId) => {
    if (!panchayatId) return;
    if (villagesByPanchayat[panchayatId]) return; // already loaded

    try {
      setLoading(true);
      const res = await gsApi.getVillagesByPanchayat(panchayatId, 1, '');
      const rows = Array.isArray(res?.results)
        ? res.results
        : Array.isArray(res)
        ? res
        : [];
      setVillagesByPanchayat((prev) => ({
        ...prev,
        [panchayatId]: rows,
      }));
    } catch (err) {
      console.error('Failed to fetch villages for filter', err);
      Alert.alert('Error', 'Failed to fetch villages for this Panchayat.');
    } finally {
      setLoading(false);
    }
  };

  const handlePanchayatChange = async (value) => {
    setSelectedPanchayatId(value);
    setSelectedVillageId('');
    if (value) {
      await loadVillagesForPanchayat(value);
    }
  };

  const villagesForSelectedPanchayat =
    selectedPanchayatId && villagesByPanchayat[selectedPanchayatId]
      ? villagesByPanchayat[selectedPanchayatId]
      : [];

  // --- Helper: fetch enterprise form (existing AND new) by enterprise_id ---
  async function fetchEnterpriseForId(enterpriseId) {
    if (!enterpriseId) {
      return { type: null, enterprise: null };
    }

    // use cache if already resolved
    const cached = enterpriseInfoById[enterpriseId];
    if (cached && (cached.type || cached.enterprise)) {
      return cached;
    }

    const headers = buildAuthHeaders();
    const enc = encodeURIComponent(enterpriseId);

    let existingMatch = null;
    let newMatch = null;

    // 1. Try Existing Enterprise
    try {
      const urlExisting = `${API_BASE_URL}/api/v1/existing-enterprise/?search=${enc}`;
      const res = await fetch(urlExisting, { headers });
      if (res.ok) {
        const data = await res.json();
        const arr = extractResultsArray(data);
        existingMatch = findBestEnterpriseMatch(arr, enterpriseId);
      }
    } catch (e) {
      console.error('Existing enterprise search failed', e);
    }

    // 2. Try New Enterprise
    try {
      const urlNew = `${API_BASE_URL}/api/v1/new-enterprise/?search=${enc}`;
      const resNew = await fetch(urlNew, { headers });
      if (resNew.ok) {
        const dataNew = await resNew.json();
        const arrNew = extractResultsArray(dataNew);
        newMatch = findBestEnterpriseMatch(arrNew, enterpriseId);
      }
    } catch (e) {
      console.error('New enterprise search failed', e);
    }

    let info = { type: null, enterprise: null };

    if (existingMatch && !newMatch) {
      info = { type: 'existing', enterprise: existingMatch };
    } else if (!existingMatch && newMatch) {
      info = { type: 'new', enterprise: newMatch };
    } else if (existingMatch && newMatch) {
      // very unlikely, but if both match, prefer existing
      info = { type: 'existing', enterprise: existingMatch };
    }

    // Update cache
    setEnterpriseInfoById((prev) => {
      const prevVal = prev[enterpriseId];
      if (prevVal && prevVal.enterprise) {
        return prev; // don't override richer cached info
      }
      return { ...prev, [enterpriseId]: info };
    });

    return info;
  }

  // Resolve ALL enterprise_ids when recordedList changes (with progress)
  useEffect(() => {
    const run = async () => {
      try {
        const ids = Array.from(
          new Set(
            (recordedList || [])
              .map((r) => r.enterprise_id)
              .filter(
                (id) => id !== null && id !== undefined && id !== ''
              )
          )
        );

        if (!ids.length) {
          setClassifying(false);
          setClassifyTotal(0);
          setClassifyDone(0);
          return;
        }

        setClassifying(true);
        setClassifyTotal(ids.length);
        setClassifyDone(0);

        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          await fetchEnterpriseForId(id);
          setClassifyDone(i + 1);
        }

        setClassifying(false);
      } catch (e) {
        console.error('Error while arranging beneficiaries by enterprise_id', e);
        setClassifying(false);
      }
    };

    if (recordedList && recordedList.length) {
      run();
    } else {
      setClassifying(false);
      setClassifyTotal(0);
      setClassifyDone(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordedList]);

  // --- Filtering logic ---
  const filteredBeneficiaries = useMemo(
    () =>
      recordedList.filter((row) => {
        // Filter by Panchayat
        if (
          selectedPanchayatId &&
          String(row.panchayat_id) !== String(selectedPanchayatId)
        ) {
          return false;
        }

        // Filter by Village
        if (
          selectedVillageId &&
          String(row.village_id) !== String(selectedVillageId)
        ) {
          return false;
        }

        // Text search filter (name, member code, phone)
        const q = searchText.trim().toLowerCase();
        if (!q) return true;

        const fieldsToSearch = [
          row.applicant_name,
          row.member_name,
          row.lokos_member_name,
          row.lokos_member_code,
          row.member_code,
          row.mobile,
          row.phone,
        ]
          .filter((v) => v !== undefined && v !== null)
          .map((v) => String(v).toLowerCase());

        return fieldsToSearch.some((f) => f.includes(q));
      }),
    [recordedList, selectedPanchayatId, selectedVillageId, searchText]
  );

  // --- Detail modal ---

  const openDetail = async (row) => {
    setDetailRecordedRow(row);
    setDetailEnterprise(null);
    setDetailEnterpriseType(null);
    setDetailVisible(true);

    const enterpriseId = row.enterprise_id;
    if (!enterpriseId) {
      // Beneficiary not interested / no enterprise form
      return;
    }

    try {
      setDetailLoading(true);
      const info = await fetchEnterpriseForId(enterpriseId);
      setDetailEnterprise(info.enterprise || null);
      setDetailEnterpriseType(info.type || null);

      if (!info.enterprise) {
        Alert.alert(
          'Info',
          'No enterprise form data found for this beneficiary, or it has not been submitted yet.'
        );
      }
    } catch (err) {
      console.error('Failed to load enterprise detail by enterprise_id', err);
      Alert.alert(
        'Info',
        'Unable to load enterprise details for this beneficiary.'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setDetailRecordedRow(null);
    setDetailEnterprise(null);
    setDetailEnterpriseType(null);
    setDetailLoading(false);
  };

  const renderKeyValueSection = (title, obj) => {
    if (!obj) return null;
    const entries = Object.entries(obj).filter(([key, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (key === 'password') return false;
      return true;
    });

    if (!entries.length) return null;

    return (
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>{title}</Text>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.detailRow}>
            <Text style={styles.detailKey}>
              {key.replace(/_/g, ' ')}
            </Text>
            <Text style={styles.detailValue}>{String(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  // --- Edit / Delete actions ---

  const handleDeleteSubmission = () => {
    if (!detailRecordedRow) {
      Alert.alert('Error', 'No recorded beneficiary selected.');
      return;
    }

    const enterprisePk = getEnterprisePk(detailEnterprise);
    const recordedId = getRecordedBenefId(detailRecordedRow);

    if (!recordedId && !enterprisePk) {
      Alert.alert(
        'Error',
        'Missing IDs for this submission. Cannot delete.'
      );
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'This will permanently delete the recorded beneficiary entry and any linked enterprise form (if present). Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // 1) Delete enterprise row (existing or new), if present
              if (enterprisePk && detailEnterpriseType) {
                let entPath = null;
                if (detailEnterpriseType === 'existing') {
                  entPath = `/api/v1/existing-enterprise/${enterprisePk}/`;
                } else if (detailEnterpriseType === 'new') {
                  entPath = `/api/v1/new-enterprise/${enterprisePk}/`;
                }

                if (entPath) {
                  try {
                    await deleteResource(entPath);
                  } catch (e) {
                    console.error('Enterprise delete failed', e);
                    // we still attempt to delete recordedBenef below
                  }
                }
              }

              // 2) Delete recorded-beneficiaries row
              if (recordedId) {
                await deleteResource(
                  `/api/v1/recorded-beneficiaries/${recordedId}/`
                );
              }

              // 3) Update local list
              if (recordedId) {
                setRecordedList((prev) =>
                  prev.filter(
                    (r) => getRecordedBenefId(r) !== recordedId
                  )
                );
              }

              closeDetail();
              Alert.alert(
                'Deleted',
                'Submission deleted successfully.'
              );
            } catch (err) {
              console.error('Delete submission error', err);
              const msg =
                err?.data?.detail ||
                (err?.data &&
                typeof err.data === 'object'
                  ? JSON.stringify(err.data)
                  : null) ||
                'Failed to delete submission. Please try again.';
              Alert.alert('Error', msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditSubmission = () => {
    if (!detailRecordedRow || !detailEnterprise || !detailEnterpriseType) {
      Alert.alert(
        'Info',
        'Enterprise form is not available for editing for this beneficiary.'
      );
      return;
    }

    const type = detailEnterpriseType;

    // Close modal before navigating
    closeDetail();

    if (type === 'existing') {
      navigation.navigate('ExistingEnterpriseForm', {
        recordedBenef: detailRecordedRow,
        existingEnterprise: detailEnterprise,
      });
    } else if (type === 'new') {
      navigation.navigate('NewEnterpriseForm', {
        recordedBenef: detailRecordedRow,
        newEnterprise: detailEnterprise,
      });
    } else {
      Alert.alert(
        'Info',
        'Unknown enterprise type. Please open this beneficiary from the main flow to edit.'
      );
    }
  };

  const renderBeneficiaryItem = ({ item }) => {
    const name =
      item.applicant_name ||
      item.member_name ||
      item.lokos_member_name ||
      'Unnamed';
    const memberCode = item.lokos_member_code || item.member_code || 'NA';
    const mobile = item.mobile || item.phone || 'NA';

    return (
      <View style={styles.listItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.listText}>{name}</Text>
          <Text style={styles.metaText}>Member code: {memberCode}</Text>
          <Text style={styles.metaText}>Mobile: {mobile}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => openDetail(item)}
        >
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // --- Build sectioned data for FlatList with headers ---
  const sectionedData = useMemo(() => {
    const existingItems = [];
    const newItems = [];
    const noneItems = [];

    filteredBeneficiaries.forEach((row, idx) => {
      const eid = row.enterprise_id;
      if (!eid) {
        // No enterprise_id => not interested
        noneItems.push({ row, idx });
        return;
      }

      const info = enterpriseInfoById[eid];
      if (info?.type === 'existing') {
        existingItems.push({ row, idx });
      } else if (info?.type === 'new') {
        newItems.push({ row, idx });
      } else {
        // Unknown / not resolved yet => treat temporarily as "not interested"
        noneItems.push({ row, idx });
      }
    });

    const data = [];

    if (existingItems.length) {
      data.push({
        type: 'header',
        key: 'header-existing',
        title: 'Beneficiaries with Existing Enterprise',
      });
      existingItems.forEach(({ row, idx }) =>
        data.push({
          type: 'item',
          key: getRowKey(row, idx, 'existing'),
          row,
        })
      );
    }

    if (newItems.length) {
      data.push({
        type: 'header',
        key: 'header-new',
        title:
          'Beneficiaries interested in opening New Enterprise',
      });
      newItems.forEach(({ row, idx }) =>
        data.push({
          type: 'item',
          key: getRowKey(row, idx, 'new'),
          row,
        })
      );
    }

    if (noneItems.length) {
      data.push({
        type: 'header',
        key: 'header-none',
        title:
          'Beneficiaries not interested in opening Enterprise',
      });
      noneItems.forEach(({ row, idx }) =>
        data.push({
          type: 'item',
          key: getRowKey(row, idx, 'none'),
          row,
        })
      );
    }

    return data;
  }, [filteredBeneficiaries, enterpriseInfoById]);

  return (
    <View style={styles.container}>
      <LoaderModal visible={loading} message="Loading..." />

      {/* Header */}
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Recorded Beneficiaries</Text>
      </View>

      {/* Filters */}
      <View style={{ marginBottom: 10 }}>
        <SearchBar
          placeholder="Search by name / phone / member code"
          value={searchText}
          onChangeText={setSearchText}
          style={{ marginBottom: 8 }}
        />

        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}>Panchayat</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedPanchayatId}
                onValueChange={handlePanchayatChange}
                style={styles.picker}
              >
                <Picker.Item label="All Panchayats" value="" />
                {panchayats.map((p) => (
                  <Picker.Item
                    key={p.panchayat_id}
                    label={
                      p.panchayat_name_en ||
                      p.name ||
                      `Panchayat ${p.panchayat_id}`
                    }
                    value={String(p.panchayat_id)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}>Village</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedVillageId}
                onValueChange={(v) => setSelectedVillageId(v)}
                style={styles.picker}
                enabled={!!selectedPanchayatId}
              >
                <Picker.Item
                  label={
                    selectedPanchayatId
                      ? 'All Villages'
                      : 'Select Panchayat first'
                  }
                  value=""
                />
                {villagesForSelectedPanchayat.map((v) => (
                  <Picker.Item
                    key={v.village_id}
                    label={
                      v.village_name_english ||
                      v.village_name_en ||
                      v.village_name ||
                      `Village ${v.village_id}`
                    }
                    value={String(v.village_id)}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* Classification progress (non-blocking) */}
      {classifying && classifyTotal > 0 && (
        <View style={styles.progressBar}>
          <Text style={styles.progressText}>
            Arranging beneficiaries ({classifyDone}/{classifyTotal})
          </Text>
        </View>
      )}

      {/* List with headers for 3 categories */}
      <FlatList
        data={sectionedData}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) =>
          item.type === 'header' ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                {item.title}
              </Text>
            </View>
          ) : (
            renderBeneficiaryItem({ item: item.row })
          )
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No recorded beneficiaries found for the selected filters.
          </Text>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={detailVisible}
        transparent
        animationType="slide"
        onRequestClose={closeDetail}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Beneficiary Detail</Text>
            </View>

            <ScrollView style={{ maxHeight: '80%' }}>
              {detailLoading && (
                <Text style={{ margin: 8, color: '#666' }}>
                  Loading enterprise details...
                </Text>
              )}

              {renderKeyValueSection(
                'Recorded Beneficiary (recorded-beneficiaries table)',
                detailRecordedRow
              )}

              {detailEnterprise ? (
                renderKeyValueSection(
                  `Enterprise Form (${
                    detailEnterpriseType === 'existing'
                      ? 'Existing Enterprise'
                      : detailEnterpriseType === 'new'
                      ? 'New Enterprise'
                      : 'Unknown Type'
                  })`,
                  detailEnterprise
                )
              ) : (
                <View style={{ paddingHorizontal: 10, paddingBottom: 12 }}>
                  <Text style={{ fontSize: 13, color: '#666' }}>
                    {detailLoading
                      ? ''
                      : 'No enterprise form data found for this beneficiary, or it has not been submitted yet.'}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <View style={styles.modalFooterRow}>
                {detailRecordedRow && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={handleDeleteSubmission}
                  >
                    <Text style={styles.deleteBtnText}>
                      Delete Submission
                    </Text>
                  </TouchableOpacity>
                )}

                {detailEnterprise && detailEnterpriseType && (
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={handleEditSubmission}
                  >
                    <Text style={styles.editBtnText}>Edit Form</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={closeDetail}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, marginTop: 40, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterCol: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#EE6969',
    borderRadius: 6,
    overflow: 'hidden',
    minHeight: 48, // bigger for better visibility
    justifyContent: 'center',
  },
  picker: {
    height: 48, // taller picker so selected value is clearly visible
  },
  progressBar: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 6,
    backgroundColor: '#FFF4E5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#AA6B00',
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 10,
  },
  sectionHeaderText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#444',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  listText: { flex: 1, fontSize: 14, color: '#222' },
  metaText: { fontSize: 12, color: '#777' },
  emptyText: { marginTop: 12, textAlign: 'center', color: '#777' },
  viewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EE6969',
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#FFEAEA',
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#AA2E2E',
  },
  detailSection: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  detailSectionTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailKey: {
    flex: 0.9,
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    paddingRight: 4,
  },
  detailValue: {
    flex: 1.1,
    fontSize: 12,
    color: '#222',
  },
  modalFooter: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#EE6969',
    alignSelf: 'flex-end',
  },
  closeBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  editBtn: {
    flex: 1,
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FF9F43',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#CC3333',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
