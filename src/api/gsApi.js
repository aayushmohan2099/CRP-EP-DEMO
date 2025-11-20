// src/api/gsApi.js

const BASE_URL = 'http://66.116.207.88:8088';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-ID': 'TH_EPS.BDOuser_test.co.in',
  'X-API-KEY': 'wFR8IpSeNMawCF4RPLXit1POGuQAJTSmRexBBOwO',
};

let AUTH_TOKEN = null;
let REFRESH_TOKEN = null;

// ======================= TOKEN HELPERS =======================

export function setAuthToken(accessToken, refreshToken) {
  AUTH_TOKEN = accessToken || null;

  // keep backward compatibility (if only access is passed)
  if (typeof refreshToken !== 'undefined') {
    REFRESH_TOKEN = refreshToken || null;
  }
}

export function getAuthToken() {
  return AUTH_TOKEN;
}

export function getRefreshToken() {
  return REFRESH_TOKEN;
}

export function clearAuthTokens() {
  AUTH_TOKEN = null;
  REFRESH_TOKEN = null;
}

function buildUrl(path) {
  if (!path.startsWith('/')) path = '/' + path;
  return BASE_URL + path;
}

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
    if (response.ok) return text;
    throw err;
  }
}

function authHeaders(extra = {}) {
  const h = { ...DEFAULT_HEADERS, ...extra };
  if (AUTH_TOKEN) h['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  return h;
}

// ======================= AUTO REFRESH =======================

/**
 * DRF refresh endpoint returns ONLY:
 * { "access": "<newAccess>" }
 * Not "refresh".
 */
async function refreshAccessTokenOnce() {
  if (!REFRESH_TOKEN) {
    throw { status: 401, data: { detail: 'No refresh token available' } };
  }

  const resp = await fetch(buildUrl('/api/v1/auth/refresh/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `ps_refresh=${REFRESH_TOKEN}`,
    },
  });

  try {
    const data = await handleResponse(resp);

    if (!data || !data.access) {
      throw { status: resp.status, data: data || null };
    }

    // only access token comes from backend
    AUTH_TOKEN = data.access;

    return AUTH_TOKEN;
  } catch (err) {
    clearAuthTokens();
    throw err;
  }
}

// Token expiry detector supports ALL possible DRF/SimpleJWT messages
function isAccessTokenExpired(err) {
  if (!err || !err.status) return false;
  if (err.status !== 401) return false;

  const detail =
    typeof err?.data?.detail === 'string'
      ? err.data.detail.toLowerCase()
      : '';

  return (
    detail.includes('token_not_valid') ||
    detail.includes('token is expired') ||
    detail.includes('not valid for any token type') ||
    detail.includes('invalid or expired') ||
    detail.includes('authentication credentials were not provided') ||
    detail.includes('signature has expired')
  );
}

// ======================= REQUEST (JSON) =======================

async function request(
  path,
  {
    method = 'GET',
    body = null,
    headers = {},
    useAuth = true,
    retryOnAuthFail = true,
  } = {}
) {
  const url = buildUrl(path);

  const doFetch = async () => {
    const finalHeaders = useAuth ? authHeaders(headers) : { ...headers };

    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body != null ? JSON.stringify(body) : undefined,
    });

    return handleResponse(res);
  };

  try {
    return await doFetch();
  } catch (err) {
    if (useAuth && retryOnAuthFail && isAccessTokenExpired(err) && REFRESH_TOKEN) {
      // refresh once
      await refreshAccessTokenOnce();
      return doFetch();
    }
    throw err;
  }
}

// ======================= REQUEST (MULTIPART) =======================

async function requestMultipart(
  path,
  {
    method = 'POST',
    body = null, // FormData
    headers = {},
    useAuth = true,
    retryOnAuthFail = true,
  } = {}
) {
  const url = buildUrl(path);

  const doFetch = async () => {
    const baseHeaders = useAuth ? authHeaders(headers) : { ...headers };

    // delete content-type so fetch sets boundary
    if (baseHeaders['Content-Type']) delete baseHeaders['Content-Type'];

    const res = await fetch(url, {
      method,
      headers: baseHeaders,
      body,
    });

    return handleResponse(res);
  };

  try {
    return await doFetch();
  } catch (err) {
    if (useAuth && retryOnAuthFail && isAccessTokenExpired(err) && REFRESH_TOKEN) {
      await refreshAccessTokenOnce();
      return doFetch();
    }
    throw err;
  }
}

// ======================= AUTH =======================

export async function login(username, password) {
  const res = await fetch(buildUrl('/api/v1/auth/login/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // no X-API-ID/KEY for login
    },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

// ======================= LOOKUPS =======================

export async function getDistricts(page = 1, search = '') {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);

  return request(`/api/v1/lookups/districts/?${qs.toString()}`);
}

export async function getBlocksByDistrict(districtId, page = 1, search = '') {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);

  return request(`/api/v1/lookups/blocks/${districtId}/?${qs.toString()}`);
}

export async function getPanchayatsByBlock(blockId, page = 1, search = '') {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);

  return request(`/api/v1/lookups/panchayats/${blockId}/?${qs.toString()}`);
}

export async function getVillagesByPanchayat(panchayatId, page = 1, search = '') {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);

  return request(`/api/v1/lookups/villages/${panchayatId}/?${qs.toString()}`);
}

// ======================= EP SAKHI HELPERS =======================

export async function getCrpDetailByUserId(userId, fields = null) {
  const query = fields ? `?fields=${encodeURIComponent(fields)}` : '';
  return request(`/api/v1/crp-detail/id/${userId}/${query}`);
}

export async function getPanchayatsUnderCrpByUserId(userId) {
  return request(`/api/v1/panchayats-under-crp/id/${userId}/`);
}

export async function getRecordedBeneficiaries(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });

  return request(
    `/api/v1/recorded-beneficiaries/${qs.toString() ? '?' + qs.toString() : ''}`
  );
}

export async function createRecordedBeneficiary(payload) {
  return request('/api/v1/recorded-beneficiaries/', {
    method: 'POST',
    body: payload,
  });
}

export async function getUpsrlmShgList(blockId, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });

  return request(
    `/api/v1/upsrlm-shg-list/${blockId}/${qs.toString() ? '?' + qs.toString() : ''}`
  );
}

export async function getUpsrlmShgMembers(shgCode, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });

  return request(
    `/api/v1/upsrlm-shg-members/${shgCode}/${qs.toString() ? '?' + qs.toString() : ''}`
  );
}

export async function getEpsakhiListByShg(shgCode, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });

  return request(
    `/api/v1/epsakhi-list/${shgCode}/${qs.toString() ? '?' + qs.toString() : ''}`
  );
}

export async function getEpsakhiDetailByMember(memberCode, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });

  return request(
    `/api/v1/epsakhi-detail/${memberCode}/${qs.toString() ? '?' + qs.toString() : ''}`
  );
}

// ======================= ENTERPRISE (MAIN) =======================

export async function createExistingEnterprise(payload) {
  return request('/api/v1/existing-enterprise/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateExistingEnterprise(id, payload) {
  return request(`/api/v1/existing-enterprise/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

function isFormData(obj) {
  return obj && typeof obj.append === 'function';
}

export async function createNewEnterprise(payload) {
  if (isFormData(payload)) {
    return requestMultipart('/api/v1/new-enterprise/', {
      method: 'POST',
      body: payload,
    });
  }
  return request('/api/v1/new-enterprise/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateNewEnterprise(id, payload) {
  if (isFormData(payload)) {
    return requestMultipart(`/api/v1/new-enterprise/${id}/`, {
      method: 'PATCH',
      body: payload,
    });
  }
  return request(`/api/v1/new-enterprise/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function updateRecordedBeneficiary(id, payload) {
  return request(`/api/v1/recorded-beneficiaries/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

// ======================= ENTERPRISE CHILD MODELS =======================

export async function createEnterpriseLoanDetail(payload) {
  return request('/api/v1/enterprise-loan-details/', {
    method: 'POST',
    body: payload,
  });
}

export async function createEnterpriseSupportDetail(payload) {
  return request('/api/v1/enterprise-support-details/', {
    method: 'POST',
    body: payload,
  });
}

export async function createEnterpriseTrainingReq(payload) {
  return request('/api/v1/enterprise-training-reqs/', {
    method: 'POST',
    body: payload,
  });
}

export async function uploadEnterpriseMedia(formData) {
  return requestMultipart('/api/v1/enterprise-media/', {
    method: 'POST',
    body: formData,
  });
}

const api = {
  login,
  setAuthToken,
  getAuthToken,
  getRefreshToken,
  clearAuthTokens,

  // lookups
  getDistricts,
  getBlocksByDistrict,
  getPanchayatsByBlock,
  getVillagesByPanchayat,

  // CRP helpers
  getCrpDetailByUserId,
  getPanchayatsUnderCrpByUserId,
  getUpsrlmShgList,
  getUpsrlmShgMembers,
  getEpsakhiListByShg,
  getEpsakhiDetailByMember,

  // enterprise
  createExistingEnterprise,
  updateExistingEnterprise,
  createNewEnterprise,
  updateNewEnterprise,

  // recorded benef
  createRecordedBeneficiary,
  getRecordedBeneficiaries,
  updateRecordedBeneficiary,

  // child models
  createEnterpriseLoanDetail,
  createEnterpriseSupportDetail,
  createEnterpriseTrainingReq,
  uploadEnterpriseMedia,
};

export default api;
