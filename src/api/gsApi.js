// src/api/gsApi.js
// Updated API wrapper — login will POST username/password at top-level
const BASE_URL = 'https://script.google.com/macros/s/AKfycbwNwkG9baa5nU1HJKFhRZdM7toMbDmTOmT2j79WZEfhnT3PpPq6TKek1-rUctdvOqX1/exec';

async function call(action, params = {}) {
  // Force POST for long payloads and for login specifically
  const shouldPost = (
    action === 'upload_media' ||
    action === 'create' ||
    action === 'update' ||
    action === 'login' || // <--- ensure login uses POST with JSON body (username/password top-level)
    params.payload !== undefined
  );

  if (shouldPost) {
    const body = Object.assign({}, params, { action });
    console.log('[gsApi] POST body', JSON.stringify(body).slice(0,2000));
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      console.log('[gsApi] POST', action, 'status', res.status, 'raw (first1k):', text && text.slice ? text.slice(0,1000) : text);
      try { return JSON.parse(text); } catch (err) { return { __parse_error: true, status: res.status, text }; }
    } catch (err) {
      console.log('[gsApi] POST error', String(err));
      return { __error: true, message: String(err) };
    }
  } else {
    const url = new URL(BASE_URL);
    url.searchParams.append('action', action);
    for (const k in params) {
      if (params[k] === undefined || params[k] === null) continue;
      if (typeof params[k] === 'object') url.searchParams.append(k, JSON.stringify(params[k]));
      else url.searchParams.append(k, params[k]);
    }
    console.log('[gsApi] GET url', url.toString());
    try {
      const res = await fetch(url.toString());
      const text = await res.text();
      console.log('[gsApi] GET', action, 'status', res.status, 'raw (first1k):', text && text.slice ? text.slice(0,1000) : text);
      try { return JSON.parse(text); } catch (err) { return { __parse_error: true, status: res.status, text }; }
    } catch (err) {
      console.log('[gsApi] GET error', String(err));
      return { __error: true, message: String(err) };
    }
  }
}

export default {
  list: (table) => call('list', { table }),
  read: (table, filterField, filterValue) => call('read', { table, filterField, filterValue }),
  create: (table, payload) => call('create', { table, payload }),
  update: (table, payload) => call('update', { table, payload }),
  delete: (table, id) => call('delete', { table, id }),
  // LOGIN: send top-level username & password and force POST (see shouldPost)
  login: (username, password) => call('login', { username, password }),
  panchayatsByClf: (clf_id) => call('panchayats_by_clf', { clf_id }),
  villagesByPanchayat: (panchayat_id) => call('villages_by_panchayat', { panchayat_id }),
  shgsByVillage: (village_id) => call('shgs_by_village', { village_id }),
  beneficiariesByShg: (shg_id, recorded) => call('beneficiaries_by_shg', { shg_id, recorded }),
  analyticsByDistrict: () => call('analytics_by_district', {}),
  uploadMedia: (files, folderId) => call('upload_media', { payload: { files, folderId } }),
};
