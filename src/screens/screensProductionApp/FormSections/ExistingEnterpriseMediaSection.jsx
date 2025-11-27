// src/screens/screensProductionApp/FormSections/ExistingEnterpriseMediaSection.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export default function ExistingEnterpriseMediaSection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch);

  const pickFiles = async (fieldName, allowedTypes) => {
    try {
      const res = await launchImageLibrary({
        mediaType: allowedTypes,
        selectionLimit: 20,
      });

      if (res.didCancel) return;

      const assets = res.assets || [];
      const existing = existingForm[fieldName] || [];
      update({ [fieldName]: [...existing, ...assets] });
    } catch (err) {
      console.warn('File pick failed:', err);
    }
  };

  const captureFromCamera = async (fieldName, allowedTypes) => {
    try {
      const res = await launchCamera({
        mediaType: allowedTypes,
      });

      if (res.didCancel) return;

      const assets = res.assets || [];
      const existing = existingForm[fieldName] || [];
      update({ [fieldName]: [...existing, ...assets] });
    } catch (err) {
      console.warn('Camera capture failed:', err);
    }
  };

  const renderUploadBlock = (label, fieldName, type, helpText) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.helpText}>{helpText}</Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          style={styles.mediaBtn}
          onPress={() => pickFiles(fieldName, type)}
        >
          <Text style={styles.mediaBtnText}>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaBtn}
          onPress={() => captureFromCamera(fieldName, type)}
        >
          <Text style={styles.mediaBtnText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {Array.isArray(existingForm[fieldName]) &&
        existingForm[fieldName].length > 0 && (
          <Text style={styles.mediaInfo}>
            Selected: {existingForm[fieldName].length}
          </Text>
        )}
    </View>
  );

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>8) Enterprise Media Upload</Text>
      <Text style={styles.helpText}>
        Please upload photos, videos and documents related to your enterprise.
        This helps in better verification and support.
      </Text>

      {renderUploadBlock(
        '1) Upload Enterprise Photos',
        'enterprise_photos_files',
        'photo',
        'Please upload clear photos of your enterprise such as: workplace, machinery, products, workers, raw materials etc.'
      )}

      {renderUploadBlock(
        '2) Upload Entreprenuer Photo',
        'photo_entreprenuer_files',
        'photo',
        'Please upload clear photo of applicant/entreprenure.'
      )}

      {renderUploadBlock(
        '3) Upload Enterprise Documents',
        'enterprise_documents_files',
        'mixed',
        'You may upload any relevant documents (registration certificate, invoices, bills, ID proofs, training certificates etc.)'
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },
  fieldBlock: {
    marginBottom: 14,
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
  mediaBtn: {
    marginTop: 8,
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
    marginTop: 4,
    fontSize: 12,
    color: '#555',
  },
});
