// src/utils/media.js
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import gsApi from '../api/gsApi';

// ask for runtime permission on Android
export async function requestCameraPermission() {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    { title: 'Camera permission', message: 'App needs access to camera to take photos' }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function pickImageFromLibrary() {
  return new Promise((resolve, reject) => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel) return resolve(null);
      if (response.errorCode) return reject(response.errorMessage || response.errorCode);
      const asset = response.assets && response.assets[0];
      resolve(asset || null);
    });
  });
}

export async function takePhoto() {
  const ok = await requestCameraPermission();
  if (!ok) { Alert.alert('Permission required', 'Camera permission denied'); return null; }
  return new Promise((resolve, reject) => {
    launchCamera({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel) return resolve(null);
      if (response.errorCode) return reject(response.errorMessage || response.errorCode);
      const asset = response.assets && response.assets[0];
      resolve(asset || null);
    });
  });
}

// convert local file uri to base64 using RNFS
export async function uriToBase64(uri) {
  if (!uri) return null;
  // android: content://... or file://...
  // RNFS can read file:// paths; convert content uri on Android by using RNFS.stat? but simplest: use RNFS.readFile
  let path = uri;
  if (Platform.OS === 'android' && uri.startsWith('content://')) {
    // RNFS may not read content:// directly. attempt fallback: use RNFS.copyFile? (varies by device)
    // Many image-picker responses include a filePath attribute; prefer that.
    if (uri.startsWith('content://') && uri.indexOf('file://') === -1) {
      // try to use the 'uri' as is and RNFS.readFile should work on recent RNFS versions
    }
  }
  try {
    // strip 'file://' if present for RNFS
    if (path.startsWith('file://')) path = path.replace('file://', '');
    const b64 = await RNFS.readFile(path, 'base64');
    return b64;
  } catch (err) {
    console.warn('uriToBase64 error', err);
    throw err;
  }
}

// upload array of assets [{ uri, fileName, type }] to GAS -> Drive
export async function uploadAssetsToDrive(assets, folderId) {
  // build files array for GAS
  const filesPayload = [];
  for (const a of assets) {
    const base64 = await uriToBase64(a.uri);
    filesPayload.push({
      filename: a.fileName || `img_${Date.now()}.jpg`,
      mimeType: a.type || 'image/jpeg',
      dataBase64: base64
    });
  }
  const res = await gsApi.uploadMedia(filesPayload, folderId);
  return res;
}
