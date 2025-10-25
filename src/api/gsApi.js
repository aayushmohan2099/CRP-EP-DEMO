// src/api/gsApi.js
const BASE_URL = 'https://script.google.com/macros/s/AKfycbxvHpET2s5JWkQl3zlZcKb7JjVzXeKKciX5wKV-UR6oT5gIDwKemxAakO3ul6OPo0UW/exec';

async function call(action, params = {}) {
  const body = Object.assign({}, params, { action });
  console.log('[gsApi] POST body', JSON.stringify(body).slice(0, 3000));
  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log('[gsApi] POST', action, 'status', res.status, 'raw (first1k):', text && text.slice ? text.slice(0, 1000) : text);
    try { return JSON.parse(text); } catch (err) { return { __parse_error: true, status: res.status, text }; }
  } catch (err) { console.log('[gsApi] POST error', String(err)); return { __error: true, message: String(err) }; }
}

export default {
  list: (table) => call('list', { table }),
  read: (table, filterField, filterValue) => call('read', { table, filterField, filterValue }),
  create: (table, payload) => call('create', { table, payload }), // payload as object
  update: (table, payload) => call('update', { table, payload }),
  delete: (table, id) => call('delete', { table, id }),
  login: (username, password) => call('login', { username, password }),
  panchayatsByClf: (clf_id) => call('panchayats_by_clf', { clf_id }),
  villagesByPanchayat: (panchayat_id) => call('villages_by_panchayat', { panchayat_id }),
  shgsByVillage: (village_id) => call('shgs_by_village', { village_id }),
  beneficiariesByShg: (shg_id, recorded) => call('beneficiaries_by_shg', { shg_id, recorded }),
  analyticsByDistrict: () => call('analytics_by_district', {}),
  uploadMedia: (files, folderId) => call('upload_media', { payload: { files, folderId } }),
  // fast idempotent save endpoint (server returns saved single record and rowNumber)
  createOrUpdateEnterprise: (payload) => call('create_or_update_enterprise', { payload }),
};
