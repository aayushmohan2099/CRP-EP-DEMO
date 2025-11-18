import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  getCrpDetail,
  getCrpPanchayats,
  getCrpRecordedBeneficiaries,
  getShgListForBlock,
} from '../../utils/tempStore';
import gsApi from '../../api/gsApi';
import LoaderModal from '../LoaderModal';
import BackButton from '../../components/BackButton';
import SearchBar from '../SearchBar';

export default function CRPViewRecordedProduction({ navigation }) {
  const [step, setStep] = useState('gp');
  const [loading, setLoading] = useState(false);

  const [panchayats, setPanchayats] = useState([]);
  const [villages, setVillages] = useState([]);
  const [shgs, setShgs] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);

  const [selectedPanchayat, setSelectedPanchayat] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedShg, setSelectedShg] = useState(null);

  const [query, setQuery] = useState('');
  const [benefQuery, setBenefQuery] = useState('');

  const recorded = getCrpRecordedBeneficiaries();

  useEffect(() => {
    const gps = getCrpPanchayats();
    setPanchayats(gps || []);
  }, []);

  const filterRecordedCountForVillage = (villageId) =>
    recorded.filter((r) => r.village_id === villageId).length;

  const filterRecordedCountForShg = (shgCode) =>
    recorded.filter((r) => r.lokos_shg_code === shgCode).length;

  const handleSelectPanchayat = async (p) => {
    setSelectedPanchayat(p);
    setSelectedVillage(null);
    setSelectedShg(null);
    setVillages([]);
    setShgs([]);
    setBeneficiaries([]);
    setStep('village');

    try {
      setLoading(true);
      const res = await gsApi.getVillagesByPanchayat(p.panchayat_id, 1, '');
      const rows = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setVillages(rows);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch villages.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVillage = async (v) => {
    setSelectedVillage(v);
    setSelectedShg(null);
    setBeneficiaries([]);
    setStep('shg');

    const crpDetail = getCrpDetail();
    const blockId = crpDetail?.block_id;
    if (!blockId) {
      Alert.alert('Error', 'No block found for CRP.');
      return;
    }
    const allShgs = getShgListForBlock(blockId);
    const shgsInVillage = allShgs.filter(
      (s) => s.village_id === v.village_id || s.village_code === v.village_code
    );
    setShgs(shgsInVillage);
  };

  const handleSelectShg = async (s) => {
    setSelectedShg(s);
    setStep('beneficiaries');

    // Here, show only recorded beneficiaries for that SHG.
    // We can either reuse cached recorded list or call epsakhi-list/<shg_code>/.
    try {
      setLoading(true);
      const res = await gsApi.getEpsakhiListByShg(s.shg_code, { page_size: 500 });
      const rows = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setBeneficiaries(rows);
    } catch (err) {
      // Fallback: filter from cached recorded list
      const rows = recorded.filter((r) => r.lokos_shg_code === s.shg_code);
      setBeneficiaries(rows);
    } finally {
      setLoading(false);
    }
  };

  const filteredPanchayats = panchayats.filter((p) =>
    (p.panchayat_name_en || '').toLowerCase().includes(query.toLowerCase())
  );

  const filteredVillages = villages.filter((v) =>
    (v.village_name_en || '').toLowerCase().includes(query.toLowerCase())
  );

  const filteredShgs = shgs.filter((s) =>
    (s.shg_name || s.shg_name_en || '').toLowerCase().includes(query.toLowerCase())
  );

  const filteredBeneficiaries = beneficiaries.filter((b) =>
    (b.member_name || b.member_name_en || '').toLowerCase().includes(benefQuery.toLowerCase())
  );

  const handleBeneficiaryPress = (row) => {
    Alert.alert(
      'Recorded Beneficiary',
      'Here you can open the full form prefilled for editing / deleting.Member code: ' + (row.lokos_member_code || row.member_code || '')
    );
  };

  const renderStepHeader = () => {
    const steps = ['GP', 'Village', 'SHG', 'Beneficiary'];
    const activeIndex = ['gp', 'village', 'shg', 'beneficiaries'].indexOf(step);
    return (
      <View style={styles.stepHeader}>
        {steps.map((name, idx) => (
          <View key={name} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                idx <= activeIndex && { backgroundColor: '#EE6969' },
              ]}
            >
              <Text
                style={[
                  styles.stepCircleText,
                  idx <= activeIndex && { color: '#fff' },
                ]}
              >
                {idx + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                idx === activeIndex && { fontWeight: '700', color: '#EE6969' },
              ]}
            >
              {name}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const getTitle = () => {
    if (step === 'gp') return 'Select Gram Panchayat';
    if (step === 'village') return 'Select Village';
    if (step === 'shg') return 'Select SHG';
    return 'Recorded Beneficiaries';
  };

  const renderList = () => {
    if (step === 'gp') {
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
                  recorded.filter((r) => r.panchayat_id === item.panchayat_id)
                    .length
                }
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Gram Panchayat mapped.</Text>
          }
        />
      );
    }

    if (step === 'village') {
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
                {item.village_name_en || `Village ${item.village_id}`}
              </Text>
              <Text style={styles.metaText}>
                Recorded: {filterRecordedCountForVillage(item.village_id)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No villages for this GP.</Text>
          }
        />
      );
    }

    if (step === 'shg') {
      return (
        <FlatList
          data={filteredShgs}
          keyExtractor={(item, idx) =>
            item.id ? String(item.id) : String(item.shg_code || idx)
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleSelectShg(item)}
            >
              <Text style={styles.listText}>
                {item.shg_name || item.shg_name_en || item.shg_code}
              </Text>
              <Text style={styles.metaText}>
                Recorded: {filterRecordedCountForShg(item.shg_code)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No SHGs under this village.</Text>
          }
        />
      );
    }

    return (
      <FlatList
        data={filteredBeneficiaries}
        keyExtractor={(item, idx) =>
          item.lokos_member_code
            ? String(item.lokos_member_code)
            : item.member_code
            ? String(item.member_code)
            : String(idx)
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => handleBeneficiaryPress(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.listText}>
                {item.member_name ||
                  item.member_name_en ||
                  item.lokos_member_name ||
                  item.lokos_member_code}
              </Text>
              <Text style={styles.metaText}>
                Member code:{' '}
                {item.lokos_member_code || item.member_code || 'NA'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No recorded beneficiaries.</Text>
        }
      />
    );
  };

  const handleBack = () => {
    if (step === 'gp') {
      navigation.goBack();
    } else if (step === 'village') {
      setStep('gp');
      setSelectedPanchayat(null);
    } else if (step === 'shg') {
      setStep('village');
      setSelectedShg(null);
    } else if (step === 'beneficiaries') {
      setStep('shg');
    }
  };

  return (
    <View style={styles.container}>
      <LoaderModal visible={loading} message="Loading..." />
      <View style={styles.headerRow}>
        <BackButton />
        <Text style={styles.headerTitle}>{getTitle()}</Text>
      </View>

      {renderStepHeader()}

      <SearchBar
        placeholder={
          step === 'beneficiaries' ? 'Search Beneficiary' : 'Search...'
        }
        value={step === 'beneficiaries' ? benefQuery : query}
        onChangeText={step === 'beneficiaries' ? setBenefQuery : setQuery}
        style={{ marginVertical: 10 }}
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
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#EE6969',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  stepCircleText: { fontSize: 13, color: '#EE6969', fontWeight: '600' },
  stepLabel: { marginTop: 4, fontSize: 11, color: '#555' },
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
});
