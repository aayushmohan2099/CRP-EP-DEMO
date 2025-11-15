// // src/api/gsApi.js
// const BASE_URL = 'https://script.google.com/macros/s/AKfycbxvHpET2s5JWkQl3zlZcKb7JjVzXeKKciX5wKV-UR6oT5gIDwKemxAakO3ul6OPo0UW/exec';

import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

// async function call(action, params = {}) {
//   const body = Object.assign({}, params, { action });
//   console.log('[gsApi] POST body', JSON.stringify(body).slice(0, 3000));
//   try {
//     const res = await fetch(BASE_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body),
//     });
//     const text = await res.text();
//     console.log('[gsApi] POST', action, 'status', res.status, 'raw (first1k):', text && text.slice ? text.slice(0, 1000) : text);
//     try { return JSON.parse(text); } catch (err) { return { __parse_error: true, status: res.status, text }; }
//   } catch (err) { console.log('[gsApi] POST error', String(err)); return { __error: true, message: String(err) }; }
// }

// export default {
//   list: (table) => call('list', { table }),
//   read: (table, filterField, filterValue) => call('read', { table, filterField, filterValue }),
//   create: (table, payload) => call('create', { table, payload }), // payload as object
//   update: (table, payload) => call('update', { table, payload }),
//   delete: (table, id) => call('delete', { table, id }),
//   login: (username, password) => call('login', { username, password }),
//   panchayatsByClf: (clf_id) => call('panchayats_by_clf', { clf_id }),
//   villagesByPanchayat: (panchayat_id) => call('villages_by_panchayat', { panchayat_id }),
//   shgsByVillage: (village_id) => call('shgs_by_village', { village_id }),
//   beneficiariesByShg: (shg_id, recorded) => call('beneficiaries_by_shg', { shg_id, recorded }),
//   analyticsByDistrict: () => call('analytics_by_district', {}),
//   uploadMedia: (files, folderId) => call('upload_media', { payload: { files, folderId } }),
//   // fast idempotent save endpoint (server returns saved single record and rowNumber)
//   createOrUpdateEnterprise: (payload) => call('create_or_update_enterprise', { payload }),
// };


// src/api/gsApi.js
// const BASE_URL = 'https://script.google.com/macros/s/AKfycbxvHpET2s5JWkQl3zlZcKb7JjVzXeKKciX5wKV-UR6oT5gIDwKemxAakO3ul6OPo0UW/exec';

// async function call(action, params = {}) {
//   const body = { ...params, action };
//   console.log('[gsApi] POST body', JSON.stringify(body).slice(0, 3000));

//   try {
//     const res = await fetch(BASE_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body),
//     });

//     const text = await res.text();
//     console.log(
//       '[gsApi] POST',
//       action,
//       'status',
//       res.status,
//       'raw (first1k):',
//       text && text.slice ? text.slice(0, 1000) : text
//     );

//     try {
//       return JSON.parse(text);
//     } catch (err) {
//       return { __parse_error: true, status: res.status, text };
//     }
//   } catch (err) {
//     console.log('[gsApi] POST error', String(err));
//     return { __error: true, message: String(err) };
//   }
// }

// export default {
//   // CRUD endpoints
//   list: (table, lang = 'en') => call('list', { table, lang }),
//   read: (table, filterField, filterValue, lang = 'en') =>
//     call('read', { table, filterField, filterValue, lang }),
//   create: (table, payload) => call('create', { table, payload }),
//   update: (table, payload) => call('update', { table, payload }),
//   delete: (table, id) => call('delete', { table, id }),

//   // Auth
//   login: (username, password) => call('login', { username, password }),

//   // Panchayat / Village / SHG
//   panchayatsByClf: (clf_id, lang = 'en') =>
//     call('panchayats_by_clf', { clf_id, lang }),
//   villagesByPanchayat: (panchayat_id, lang = 'en') =>
//     call('villages_by_panchayat', { panchayat_id, lang }),
//   shgsByVillage: (village_id, lang = 'en') =>
//     call('shgs_by_village', { village_id, lang }),
//   beneficiariesByShg: (shg_id, recorded) =>
//     call('beneficiaries_by_shg', { shg_id, recorded }),

//   // Analytics
//   analyticsByDistrict: () => call('analytics_by_district', {}),

//   // Media upload
//   uploadMedia: (files, folderId) =>
//     call('upload_media', { payload: { files, folderId } }),

//   // Fast idempotent save
//   createOrUpdateEnterprise: (payload) =>
//     call('create_or_update_enterprise', { payload }),
// };


// src/api/gsApi.js

// ✅ New deployment URL and deployment ID
// const BASE_URL = 'https://script.google.com/macros/s/AKfycbzB2Hnp5As7ltS3p9z35_2j57BEAHP5jMnQQNKu7q1ELSCa3mAbDdvyAVXHYRHyZPsq/exec';
// const DEPLOYMENT_ID = 'AKfycbzB2Hnp5As7ltS3p9z35_2j57BEAHP5jMnQQNKu7q1ELSCa3mAbDdvyAVXHYRHyZPsq';

// async function call(action, params = {}) {
//   const body = { ...params, action, deployment_id: DEPLOYMENT_ID };
//   console.log('[gsApi] POST body', JSON.stringify(body).slice(0, 3000));

//   try {
//     const res = await fetch(BASE_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body),
//     });

//     const text = await res.text();
//     console.log(
//       '[gsApi] POST',
//       action,
//       'status',
//       res.status,
//       'raw (first1k):',
//       text && text.slice ? text.slice(0, 1000) : text
//     );

//     try {
//       return JSON.parse(text);
//     } catch (err) {
//       return { __parse_error: true, status: res.status, text };
//     }
//   } catch (err) {
//     console.log('[gsApi] POST error', String(err));
//     return { __error: true, message: String(err) };
//   }
// }

// export default {
//   // CRUD endpoints
//   list: (table, lang = 'en') => call('list', { table, lang }),
//   read: (table, filterField, filterValue, lang = 'en') =>
//     call('read', { table, filterField, filterValue, lang }),
//   create: (table, payload) => call('create', { table, payload }),
//   update: (table, payload) => call('update', { table, payload }),
//   delete: (table, id) => call('delete', { table, id }),

//   // Auth
//   login: (username, password) => call('login', { username, password }),

//   // Panchayat / Village / SHG
//   panchayatsByClf: (clf_id, lang = 'en') =>
//     call('panchayats_by_clf', { clf_id, lang }),
//   villagesByPanchayat: (panchayat_id, lang = 'en') =>
//     call('villages_by_panchayat', { panchayat_id, lang }),
//   shgsByVillage: (village_id, lang = 'en') =>
//     call('shgs_by_village', { village_id, lang }),
//   beneficiariesByShg: (shg_id, recorded) =>
//     call('beneficiaries_by_shg', { shg_id, recorded }),

//   // Analytics
//   analyticsByDistrict: () => call('analytics_by_district', {}),

//   // Media upload
//   uploadMedia: (files, folderId) =>
//     call('upload_media', { payload: { files, folderId } }),

//   // Fast idempotent save
//   createOrUpdateEnterprise: (payload) =>
//     call('create_or_update_enterprise', { payload }),
// };


// src/api/gsApi.js

const BASE_URL = 'http://66.116.207.88:8088';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-ID': 'TH_EPS.BDOuser_test.co.in',
  'X-API-KEY': 'wFR8IpSeNMawCF4RPLXit1POGuQAJTSmRexBBOwO',
};

// Handle API responses safely
async function handleResponse(response) {
  const text = await response.text();

  if (!text) {
    if (!response.ok) throw { status: response.status, data: null };
    return null;
  }

  try {
    const data = JSON.parse(text);
    if (!response.ok) throw { status: response.status, data };
    return data;
  } catch (err) {
    if (response.ok) return text; // fallback raw text
    throw err;
  }
}

// Login (optional)
async function login(username, password) {
  const res = await fetch(`${BASE_URL}login/`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

// Get all districts
async function getDistricts(page_num) {
  const res = await fetch(`${BASE_URL}/api/v1/lookups/districts/?page=${page_num}`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });
  return handleResponse(res);
}

// // Get blocks by district ID
async function getBlocksByDistrict(districtId, page_num) {
  const res = await fetch(`${BASE_URL}/api/v1/lookups/blocks/${districtId}/?page=${page_num}`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });
  return handleResponse(res);
}

async function getPanchayatsByBlock(blockId , page_num) {
  const res = await fetch(`${BASE_URL}/api/v1/lookups/panchayats/${blockId}/?page=${page_num}`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });
  return handleResponse(res);
}

async function getVillagesByPanchayat(panchayatId , page_num) {
  const res = await fetch(`${BASE_URL}/api/v1/lookups/villages/${panchayatId}/?page=${page_num}`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });
  return handleResponse(res);
}
const shreeDuttGanj = 3101392;
async function getShgByPanchayat() {
  const res = await fetch(`${BASE_URL}/api/v1/lookups/shg-list/${shreeDuttGanj}/`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });
  return handleResponse(res);
}
export default {
  login,
  getDistricts,
  getBlocksByDistrict,
  getPanchayatsByBlock,
  getVillagesByPanchayat,
  getShgByPanchayat
};
