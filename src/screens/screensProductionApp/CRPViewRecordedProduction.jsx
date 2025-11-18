// src/screens/epsakhi/CRPViewRecordedProduction.jsx
import React, { useEffect, useState } from 'react';
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
  const [detailEnterpriseType, setDetailEnterpriseType] = useState(null);

  useEffect(() => {
    const gps = getCrpPanchayats() || [];
    setPanchayats(gps);

    const recorded = getCrpRecordedBeneficiaries() || [];
    setRecordedList(recorded);
  }, []);

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

  // --- Filtering logic ---
  const filteredBeneficiaries = recordedList.filter((row) => {
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
  });

  // --- Detail modal ---

  const openDetail = async (row) => {
    setDetailRecordedRow(row);
    setDetailEnterprise(null);
    setDetailEnterpriseType(null);
    setDetailVisible(true);

    const memberCode = row.lokos_member_code || row.member_code || null;
    if (!memberCode) {
      return; // we still show Recorded row; no enterprise detail
    }

    try {
      setDetailLoading(true);
      const detail = await gsApi.getEpsakhiDetailByMember(memberCode);
      const enterprise = detail?.enterprise || null;
      const enterpriseType = detail?.enterprise_type || null;

      setDetailEnterprise(enterprise);
      setDetailEnterpriseType(enterpriseType);
    } catch (err) {
      console.error('Failed to load EPSakhi detail', err);
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
      // hide very technical keys if you want
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

  const renderItem = ({ item }) => {
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

      {/* List */}
      <FlatList
        data={filteredBeneficiaries}
        keyExtractor={(item, idx) =>
          item.lokos_member_code
            ? String(item.lokos_member_code)
            : item.member_code
            ? String(item.member_code)
            : String(idx)
        }
        renderItem={renderItem}
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
                  `Enterprise Form (${detailEnterpriseType || 'Unknown Type'})`,
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
  },
  picker: {
    height: 40,
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
    alignItems: 'flex-end',
  },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#EE6969',
  },
  closeBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
