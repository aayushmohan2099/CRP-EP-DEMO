import React, { useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Linking } from 'react-native';
import { LanguageContext } from '../../components/LanguageContext';
import { styles, inputStyle } from './FormStyles';
import { t } from './translations';
import { pickImageFromLibrary, takePhoto, uploadAssetsToDrive } from '../../utils/media';

export default function DocsPhotosSection({ form, setField }) {
  const { language } = useContext(LanguageContext);

  const openUrl = async (url) => {
    if (!url) return alert('No URL');
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) Linking.openURL(url);
      else alert('Cannot open URL');
    } catch (err) { alert('Error: ' + err); }
  };

  const doUploadAsset = async (fieldKey, asset) => {
    try {
      if (!asset?.uri) throw new Error('No image asset');
      const assets = [{ uri: asset.uri, fileName: asset.fileName || `img_${Date.now()}.jpg`, type: asset.type }];
      const uploadRes = await uploadAssetsToDrive(assets, undefined);
      const ok = uploadRes.results.find(r => r.success);
      if (!ok) throw new Error('Upload failed');
      setField(fieldKey, ok.url);
      alert('Uploaded');
    } catch (err) { alert('Upload error: ' + err); }
  };

  const handlePickAndUpload = async (fieldKey) => {
    const asset = await pickImageFromLibrary();
    if (asset) await doUploadAsset(fieldKey, asset);
  };

  const handleTakePhotoAndUpload = async (fieldKey) => {
    const asset = await takePhoto();
    if (asset) await doUploadAsset(fieldKey, asset);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>{t(language, 'docs_photos')}</Text>

      {['photo_enterprise','photo_entrepreneur','photo_product'].map(key => (
        <View key={key}>
          <Text style={styles.inputLabel}>{t(language, key)}</Text>
          <View style={{ flexDirection:'row', marginBottom:8 }}>
            <TouchableOpacity style={styles.redButton} onPress={() => handlePickAndUpload(key)}>
              <Text style={styles.redButtonText}>{t(language, 'pick_photo')}</Text>
            </TouchableOpacity>
            <View style={{ width:8 }} />
            <TouchableOpacity style={styles.redButton} onPress={() => handleTakePhotoAndUpload(key)}>
              <Text style={styles.redButtonText}>{t(language, 'take_photo')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => form[key] && openUrl(form[key])}>
            <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form[key] || t(language, 'no_file')}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text>{t(language, 'certificate_docs')}</Text>
      <TextInput value={form.certificate_docs} onChangeText={v => setField('certificate_docs', v)} style={inputStyle} multiline />
    </View>
  );
}
