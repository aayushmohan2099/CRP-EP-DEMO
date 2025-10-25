const BASE_URL = 'https://script.google.com/macros/s/AKfycbyg8YtKekjYsmOrij_LNeqT8ZNl1ZAv_PTq7dr-uZ15hAFG6U1goUX-3Ru4Sc8MvOv8/exec';

async function call(action, params = {}) {
  // build query string
  const url = new URL(BASE_URL);
  url.searchParams.append('action', action);
  for (const k in params) {
    if (typeof params[k] === 'object') url.searchParams.append(k, JSON.stringify(params[k]));
    else if (params[k] !== undefined && params[k] !== null) url.searchParams.append(k, params[k]);
  }
  const res = await fetch(url.toString());
  const json = await res.json();
  return json;
}

export default {
  list: (table) => call('list', { table }),
  read: (table, filterField, filterValue) => call('read', { table, filterField, filterValue }),
  create: (table, payload) => call('create', { table, payload: JSON.stringify(payload) }),
  update: (table, payload) => call('update', { table, payload: JSON.stringify(payload) }),
  delete: (table, id) => call('delete', { table, id }),
  login: (username, password) => call('login', { username, password }),
  panchayatsByClf: (clf_id) => call('panchayats_by_clf', { clf_id }),
  villagesByPanchayat: (panchayat_id) => call('villages_by_panchayat', { panchayat_id }),
  shgsByVillage: (village_id) => call('shgs_by_village', { village_id }),
  beneficiariesByShg: (shg_id, recorded) => call('beneficiaries_by_shg', { shg_id, recorded }),
  analyticsByDistrict: () => call('analytics_by_district', {}),
  uploadMedia: (files, folderId) => call('upload_media', { payload: JSON.stringify({ files, folderId }) }),
};
