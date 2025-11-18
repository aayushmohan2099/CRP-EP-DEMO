// src/api/gsApi.js

const BASE_URL = 'http://66.116.207.88:8088';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-ID': 'TH_EPS.BDOuser_test.co.in',
  'X-API-KEY': 'wFR8IpSeNMawCF4RPLXit1POGuQAJTSmRexBBOwO',
};

let AUTH_TOKEN = null;
let REFRESH_TOKEN = null;

// ========== TOKEN HELPERS ==========

export function setAuthToken(accessToken, refreshToken) {
  AUTH_TOKEN = accessToken || null;
  // keep backwards compatibility: old calls with 1 arg still work
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

// Standard headers (X-API-ID/KEY + Authorization, unless caller overrides)
function authHeaders(extra = {}) {
  const h = { ...DEFAULT_HEADERS, ...extra };
  if (AUTH_TOKEN) {
    h['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }
  return h;
}

// ========== CENTRAL REQUEST WITH AUTO-REFRESH ==========

async function refreshAccessTokenOnce() {
  if (!REFRESH_TOKEN) {
    throw { status: 401, data: { detail: 'No refresh token available' } };
  }

  const res = await fetch(buildUrl('/api/v1/auth/refresh/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // backend reads this as request.COOKIES['ps_refresh']
      Cookie: `ps_refresh=${REFRESH_TOKEN}`,
    },
  });

  try {
    const data = await handleResponse(res);
    if (!data || !data.access) {
      throw { status: res.status, data: data || null };
    }
    AUTH_TOKEN = data.access;
    if (data.refresh) {
      REFRESH_TOKEN = data.refresh;
    }
    return AUTH_TOKEN;
  } catch (err) {
    // if refresh fails, clear tokens so app can force re-login
    clearAuthTokens();
    throw err;
  }
}

/**
 * Centralised JSON request helper.
 * path      - "/api/v1/...."
 * options   - { method, body, headers, useAuth, retryOnAuthFail }
 */
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

  const makeFetch = async () => {
    const finalHeaders = useAuth ? authHeaders(headers) : { ...headers };
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body != null ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  };

  try {
    return await makeFetch();
  } catch (err) {
    const status = err?.status;
    const detail =
      typeof err?.data?.detail === 'string'
        ? err.data.detail.toLowerCase()
        : '';

    const isTokenExpired =
      status === 401 &&
      detail.includes('invalid or expired access token') &&
      REFRESH_TOKEN;

    if (useAuth && retryOnAuthFail && isTokenExpired) {
      await refreshAccessTokenOnce();
      return makeFetch();
    }

    throw err;
  }
}

/**
 * Multipart request helper (for file uploads).
 * - DOES NOT set Content-Type explicitly (so fetch can add boundary).
 */
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

  const makeFetch = async () => {
    const baseHeaders = useAuth ? authHeaders(headers) : { ...headers };
    // Ensure we don't override Content-Type for multipart
    if (baseHeaders['Content-Type']) {
      delete baseHeaders['Content-Type'];
    }

    const res = await fetch(url, {
      method,
      headers: baseHeaders,
      body,
    });
    return handleResponse(res);
  };

  try {
    return await makeFetch();
  } catch (err) {
    const status = err?.status;
    const detail =
      typeof err?.data?.detail === 'string'
        ? err.data.detail.toLowerCase()
        : '';

    const isTokenExpired =
      status === 401 &&
      detail.includes('invalid or expired access token') &&
      REFRESH_TOKEN;

    if (useAuth && retryOnAuthFail && isTokenExpired) {
      await refreshAccessTokenOnce();
      return makeFetch();
    }

    throw err;
  }
}

// ========== AUTH ==========

export async function login(username, password) {
  const res = await fetch(buildUrl('/api/v1/auth/login/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // no X-API headers and no Authorization for login
    },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

// ========== LOOKUPS (Admin hierarchy) ==========

export async function getDistricts(page = 1, search = '') {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);
  return request(`/api/v1/lookups/districts/?${qs.toString()}`, {
    method: 'GET',
  });
}

export async function getBlocksByDistrict(districtId, page = 1, search = '') {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);
  return request(`/api/v1/lookups/blocks/${districtId}/?${qs.toString()}`, {
    method: 'GET',
  });
}

export async function getPanchayatsByBlock(blockId, page = 1, search = '') {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);
  return request(`/api/v1/lookups/panchayats/${blockId}/?${qs.toString()}`, {
    method: 'GET',
  });
}

export async function getVillagesByPanchayat(
  panchayatId,
  page = 1,
  search = ''
) {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);
  return request(`/api/v1/lookups/villages/${panchayatId}/?${qs.toString()}`, {
    method: 'GET',
  });
}

// ========== epSakhi helper APIs ==========

// CRP detail by MasterUser.id
export async function getCrpDetailByUserId(userId, fields = null) {
  const query = fields ? `?fields=${encodeURIComponent(fields)}` : '';
  return request(`/api/v1/crp-detail/id/${userId}/${query}`, {
    method: 'GET',
  });
}

// Panchayats mapped to CRP (by MasterUser.id)
export async function getPanchayatsUnderCrpByUserId(userId) {
  return request(`/api/v1/panchayats-under-crp/id/${userId}/`, {
    method: 'GET',
  });
}

// Recorded beneficiaries (generic list with filters / group_by)
export async function getRecordedBeneficiaries(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  const path = `/api/v1/recorded-beneficiaries/${
    qs.toString() ? '?' + qs.toString() : ''
  }`;
  return request(path, { method: 'GET' });
}

// Create a recorded beneficiary (used when enterprise form is submitted)
export async function createRecordedBeneficiary(payload) {
  return request('/api/v1/recorded-beneficiaries/', {
    method: 'POST',
    body: payload,
  });
}

// UPSRLM Shg list by block
export async function getUpsrlmShgList(blockId, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  const path = `/api/v1/upsrlm-shg-list/${blockId}/${
    qs.toString() ? '?' + qs.toString() : ''
  }`;
  return request(path, { method: 'GET' });
}

// UPSRLM SHG members
export async function getUpsrlmShgMembers(shgCode, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  const path = `/api/v1/upsrlm-shg-members/${shgCode}/${
    qs.toString() ? '?' + qs.toString() : ''
  }`;
  return request(path, { method: 'GET' });
}

// Only recorded beneficiaries under an SHG
export async function getEpsakhiListByShg(shgCode, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  const path = `/api/v1/epsakhi-list/${shgCode}/${
    qs.toString() ? '?' + qs.toString() : ''
  }`;
  return request(path, { method: 'GET' });
}

// Beneficiary + enterprise detail bundle by member_code
export async function getEpsakhiDetailByMember(memberCode, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  const path = `/api/v1/epsakhi-detail/${memberCode}/${
    qs.toString() ? '?' + qs.toString() : ''
  }`;
  return request(path, { method: 'GET' });
}

// ========== Enterprise forms (Existing / New) ==========

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

export async function createNewEnterprise(payload) {
  return request('/api/v1/new-enterprise/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateNewEnterprise(id, payload) {
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

// ========== Enterprise child models (Option B) ==========

// Loan details
export async function createEnterpriseLoanDetail(payload) {
  return request('/api/v1/enterprise-loan-details/', {
    method: 'POST',
    body: payload,
  });
}

// Support detail
export async function createEnterpriseSupportDetail(payload) {
  return request('/api/v1/enterprise-support-details/', {
    method: 'POST',
    body: payload,
  });
}

// Training requirements
export async function createEnterpriseTrainingReq(payload) {
  return request('/api/v1/enterprise-training-reqs/', {
    method: 'POST',
    body: payload,
  });
}

// Media upload (multipart)
export async function uploadEnterpriseMedia(formData) {
  return requestMultipart('/api/v1/enterprise-media/', {
    method: 'POST',
    body: formData,
  });
}

const api = {
  // auth
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
  // epsakhi helpers
  getCrpDetailByUserId,
  getPanchayatsUnderCrpByUserId,
  getUpsrlmShgList,
  getUpsrlmShgMembers,
  getEpsakhiListByShg,
  getEpsakhiDetailByMember,
  // enterprise main
  createExistingEnterprise,
  updateExistingEnterprise,
  createNewEnterprise,
  updateNewEnterprise,
  // recorded beneficiary
  createRecordedBeneficiary,
  getRecordedBeneficiaries,
  updateRecordedBeneficiary,
  // enterprise child models
  createEnterpriseLoanDetail,
  createEnterpriseSupportDetail,
  createEnterpriseTrainingReq,
  uploadEnterpriseMedia,
};

export default api;
