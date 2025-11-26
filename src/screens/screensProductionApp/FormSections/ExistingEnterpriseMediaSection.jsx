// src/screens/epsakhi/ExistingEnterpriseMediaSection.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

/**
 * Props:
 *  - existingForm (object from wrapper)
 *  - setExistingForm (wrapper setter)
 *
 * Fields populated in wrapper:
 *  - enterprise_photos_files: []
 *  - enterprise_videos_files: []
 *  - enterprise_documents_files: []
 *
 * The wrapper will then loop these arrays and POST each file to:
 *   /enterprise-media/
 *   with body { enterprise_id, field: "enterprise_photos" | "enterprise_videos" | "enterprise_documents" }
 */

export default function ExistingEnterpriseMediaSection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch);

  const pickFiles = async (fieldName, allowedTypes) => {
    try {
      const res = await launchImageLibrary({
        mediaType: allowedTypes, // "photo" | "video" | "mixed"
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

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>8) Enterprise Media Upload</Text>

      <Text style={styles.helpText}>
        Please upload photos, videos and documents related to your enterprise.
        This helps in better verification and support.
      </Text>

      {/* ------------------ PHOTOS UPLOAD ------------------ */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>1) Upload Enterprise Photos</Text>
        <Text style={styles.helpText}>
          Please upload clear photos of your enterprise such as:
          workplace, machinery, products, workers, raw materials etc.
        </Text>

        <TouchableOpacity
          style={styles.mediaBtn}
          onPress={() => pickFiles('enterprise_photos_files', 'photo')}
        >
          <Text style={styles.mediaBtnText}>Select Photos</Text>
        </TouchableOpacity>

        {Array.isArray(existingForm.enterprise_photos_files) &&
          existingForm.enterprise_photos_files.length > 0 && (
            <Text style={styles.mediaInfo}>
              Selected Photos: {existingForm.enterprise_photos_files.length}
            </Text>
          )}
      </View>

      {/* ------------------ VIDEOS UPLOAD ------------------ */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>2) Upload Enterprise Videos</Text>
        <Text style={styles.helpText}>
          Please upload short videos showing your enterprise setup,
          business activities or demonstrations.
        </Text>

        <TouchableOpacity
          style={styles.mediaBtn}
          onPress={() => pickFiles('enterprise_videos_files', 'video')}
        >
          <Text style={styles.mediaBtnText}>Select Videos</Text>
        </TouchableOpacity>

        {Array.isArray(existingForm.enterprise_videos_files) &&
          existingForm.enterprise_videos_files.length > 0 && (
            <Text style={styles.mediaInfo}>
              Selected Videos: {existingForm.enterprise_videos_files.length}
            </Text>
          )}
      </View>

      {/* ------------------ DOCUMENTS UPLOAD ------------------ */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>3) Upload Enterprise Documents</Text>
        <Text style={styles.helpText}>
          You may upload any relevant documents (registration certificate,
          invoices, bills, ID proofs, training certificates etc.)
        </Text>

        <TouchableOpacity
          style={styles.mediaBtn}
          onPress={() => pickFiles('enterprise_documents_files', 'mixed')}
        >
          <Text style={styles.mediaBtnText}>Select Documents</Text>
        </TouchableOpacity>

        {Array.isArray(existingForm.enterprise_documents_files) &&
          existingForm.enterprise_documents_files.length > 0 && (
            <Text style={styles.mediaInfo}>
              Selected Documents: {existingForm.enterprise_documents_files.length}
            </Text>
          )}
      </View>
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
