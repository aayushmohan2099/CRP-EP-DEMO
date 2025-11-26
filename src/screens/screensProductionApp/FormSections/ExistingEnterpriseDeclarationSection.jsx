// src/screens/epsakhi/ExistingEnterpriseDeclarationSection.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';

const YesNoToggle = ({ value, onChange }) => {
  const current = value === true ? 'Yes' : value === false ? 'No' : '';
  const handlePress = (opt) => {
    if (opt === 'Yes') onChange(true);
    else if (opt === 'No') onChange(false);
  };

  return (
    <View style={styles.yesNoRow}>
      {['Yes', 'No'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.yesNoBtn,
            current === opt && styles.yesNoBtnActive,
          ]}
          onPress={() => handlePress(opt)}
        >
          <Text
            style={[
              styles.yesNoText,
              current === opt && styles.yesNoTextActive,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function ExistingEnterpriseDeclarationSection({
  existingForm,
  setExistingForm,
  onSubmit,
  submitting = false,
}) {
  const update = (patch) => setExistingForm(patch);

  // Local state for date picker (DD / MM / YYYY)
  const [declDay, setDeclDay] = useState('');
  const [declMonth, setDeclMonth] = useState('');
  const [declYear, setDeclYear] = useState('');
  const [dateModalVisible, setDateModalVisible] = useState(false);

  // Sync local pickers when declaration_date changes
  useEffect(() => {
    const d = existingForm.declaration_date;
    if (!d) {
      setDeclDay('');
      setDeclMonth('');
      setDeclYear('');
      return;
    }
    try {
      const raw = typeof d === 'string' ? d.split('T')[0] : '';
      const parts = raw.split('-');
      if (parts.length === 3) {
        setDeclYear(parts[0]);
        setDeclMonth(String(parseInt(parts[1], 10) || ''));
        setDeclDay(String(parseInt(parts[2], 10) || ''));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [existingForm.declaration_date]);

  const applyDate = () => {
    if (!declDay || !declMonth || !declYear) {
      setDateModalVisible(false);
      return;
    }
    const day = String(declDay).padStart(2, '0');
    const month = String(declMonth).padStart(2, '0');
    const iso = `${declYear}-${month}-${day}`;
    update({ declaration_date: iso });
    setDateModalVisible(false);
  };

  const pickSignature = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 1,
      });
      if (res.didCancel) return;
      const assets = res.assets || [];
      if (!assets.length) return;

      update({
        declaration_signature_files: assets, // wrapper will upload to /enterprise-media/ with field "others"
      });
    } catch (e) {
      console.warn('Signature pick failed', e);
    }
  };

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1950; y--) yearOptions.push(String(y));

  const dayOptions = [];
  for (let d = 1; d <= 31; d++) dayOptions.push(String(d));

  const monthOptions = [
    { label: 'Jan', value: '1' },
    { label: 'Feb', value: '2' },
    { label: 'Mar', value: '3' },
    { label: 'Apr', value: '4' },
    { label: 'May', value: '5' },
    { label: 'Jun', value: '6' },
    { label: 'Jul', value: '7' },
    { label: 'Aug', value: '8' },
    { label: 'Sep', value: '9' },
    { label: 'Oct', value: '10' },
    { label: 'Nov', value: '11' },
    { label: 'Dec', value: '12' },
  ];

  const signatureCount = Array.isArray(existingForm.declaration_signature_files)
    ? existingForm.declaration_signature_files.length
    : 0;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>9) Declaration & Submit</Text>

      {/* 1) Declaration confirmed */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          1) Declaration
        </Text>
        <Text style={styles.helpText}>
          I hereby declare that all information provided above is correct
          and checked by me.
        </Text>

        <YesNoToggle
          value={existingForm.declaration_confirmed}
          onChange={(val) => update({ declaration_confirmed: val })}
        />
      </View>

      {/* 2) Declaration Date */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          2) Declaration Date
        </Text>
        <Text style={styles.helpText}>
          Please select the date on which this form is being completed.
          The selected date will be clearly stored as YYYY-MM-DD.
        </Text>

        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={() => setDateModalVisible(true)}
        >
          <Text style={styles.dateDisplayText}>
            {existingForm.declaration_date || 'Select Declaration Date'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date picker modal with big, clear pickers */}
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Declaration Date</Text>
            <View style={styles.modalPickerRow}>
              <View style={styles.modalPickerCol}>
                <Text style={styles.modalLabel}>Day</Text>
                <View style={styles.modalPickerBox}>
                  <Picker
                    selectedValue={declDay || ''}
                    onValueChange={(v) => setDeclDay(v)}
                  >
                    <Picker.Item label="DD" value="" />
                    {dayOptions.map((d) => (
                      <Picker.Item key={d} label={d} value={d} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.modalPickerCol}>
                <Text style={styles.modalLabel}>Month</Text>
                <View style={styles.modalPickerBox}>
                  <Picker
                    selectedValue={declMonth || ''}
                    onValueChange={(v) => setDeclMonth(v)}
                  >
                    <Picker.Item label="MM" value="" />
                    {monthOptions.map((m) => (
                      <Picker.Item
                        key={m.value}
                        label={m.label}
                        value={m.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.modalPickerCol}>
                <Text style={styles.modalLabel}>Year</Text>
                <View style={styles.modalPickerBox}>
                  <Picker
                    selectedValue={declYear || ''}
                    onValueChange={(v) => setDeclYear(v)}
                  >
                    <Picker.Item label="YYYY" value="" />
                    {yearOptions.map((y) => (
                      <Picker.Item key={y} label={y} value={y} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setDateModalVisible(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={applyDate}
              >
                <Text style={styles.modalBtnPrimaryText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3) Applicant Signature upload */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          3) Applicant Signature
        </Text>
        <Text style={styles.helpText}>
          Please upload a clear photo or scanned copy of your signature.
          This will be stored securely with your application.
        </Text>

        <TouchableOpacity style={styles.mediaBtn} onPress={pickSignature}>
          <Text style={styles.mediaBtnText}>Upload Signature</Text>
        </TouchableOpacity>

        {signatureCount > 0 && (
          <Text style={styles.mediaInfo}>
            Selected Signature File(s): {signatureCount}
          </Text>
        )}
      </View>

      {/* Optional verifier name if you want to keep it from old form */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Verifier Name (optional)</Text>
        <Text style={styles.helpText}>
          If a CRP or official is helping you fill this form, please
          mention their name here (optional).
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.verifier_name || ''}
          onChangeText={(v) => update({ verifier_name: v })}
          placeholder="Enter verifier name (if any)"
        />
      </View>

      {/* SUBMIT BUTTON */}
      <View style={styles.submitRow}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!existingForm.declaration_confirmed || submitting) &&
              styles.submitBtnDisabled,
          ]}
          disabled={!existingForm.declaration_confirmed || submitting}
          onPress={onSubmit}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? 'Submitting...' : 'Submit Existing Enterprise Form'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 10,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  fieldBlock: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  yesNoRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  yesNoBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  yesNoBtnActive: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
  },
  yesNoText: {
    fontSize: 14,
    color: '#333',
  },
  yesNoTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  dateDisplay: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  dateDisplayText: {
    fontSize: 15,
    color: '#333',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalPickerCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalPickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  modalBtnPrimary: {
    backgroundColor: '#EE6969',
  },
  modalBtnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalBtnSecondary: {
    backgroundColor: '#eee',
  },
  modalBtnSecondaryText: {
    color: '#333',
    fontWeight: '600',
  },
  mediaBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  mediaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  mediaInfo: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  submitRow: {
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: '#EE6969',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
