// src/api/gsApi.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * gsApi with client-side cache (AsyncStorage), stale-while-revalidate behavior.
 * - Returns parsed JSON from server.
 * - Caches responses per (action + sorted params) key.
 * - TTL default 300s (5 min).
 *
 * Public iface is same as before (list, read, create, update, delete, login, ...).
 */

const BASE_URL = 'https://script.google.com/macros/s/AKfycbyMM-l_UWqGUQbDopay3qaMmKdcg48Xx7dIQI2hodMb0cawQkCoZmDMHsOyvAYpwSLp/exec';
const DEPLOYMENT_ID = 'AKfycbyMM-l_UWqGUQbDopay3qaMmKdcg48Xx7dIQI2hodMb0cawQkCoZmDMHsOyvAYpwSLp';
const DEFAULT_TTL = 300; // seconds

// Helper: stable serialize params for cache key
function stableStringify(obj) {
  if (!obj) return '';
  if (typeof obj !== 'object') return String(obj);
  const keys = Object.keys(obj).sort();
  const res = {};
  for (const k of keys) {
    res[k] = obj[k];
  }
  return JSON.stringify(res);
}

// Cache helpers
async function cacheSet(key, value, ttlSeconds = DEFAULT_TTL) {
  try {
    const payload = {
      ts: Date.now(),
      ttl: Number(ttlSeconds) || DEFAULT_TTL,
      value
    };
    await AsyncStorage.setItem('@gsapi_cache:' + key, JSON.stringify(payload));
  } catch (err) {
    // ignore cache write errors
    console.warn('[gsApi] cacheSet error', err);
  }
}

async function cacheGet(key) {
  try {
    const raw = await AsyncStorage.getItem('@gsapi_cache:' + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const age = (Date.now() - parsed.ts) / 1000;
    const isExpired = age > (parsed.ttl || DEFAULT_TTL);
    return { isExpired, cached: parsed.value, age };
  } catch (err) {
    console.warn('[gsApi] cacheGet error', err);
    return null;
  }
}

async function cacheRemove(key) {
  try { await AsyncStorage.removeItem('@gsapi_cache:' + key); } catch(e) {}
}

// Low-level call
async function call(action, params = {}, { cache = true, ttl = DEFAULT_TTL, backgroundUpdate = true } = {}) {
  // Build request body
  const body = { ...params, action, deployment_id: DEPLOYMENT_ID };

  // Compute cache key
  const key = action + '|' + stableStringify(params || {});

  // If cache enabled, return cached immediately but still fetch in background (stale-while-revalidate)
  if (cache) {
    try {
      const c = await cacheGet(key);
      if (c && c.cached !== undefined && !c.isExpired) {
        // fresh cache: return it but also optionally refresh in background
        if (backgroundUpdate) {
          // fire & forget network update to refresh cached value
          _fetchAndCache(body, key, ttl);
        }
        return c.cached;
      }
      if (c && c.cached !== undefined && c.isExpired) {
        // expired but present: return cached data immediately while updating
        if (backgroundUpdate) _fetchAndCache(body, key, ttl);
        return c.cached;
      }
    } catch (err) {
      // continue to network fetch
      console.warn('[gsApi] cache read failed', err);
    }
  }

  // No cache -> fetch now
  const result = await _fetchAndCache(body, key, ttl);
  return result;
}

async function _fetchAndCache(body, cacheKey, ttl) {
  try {
    console.log('[gsApi] request', body.action, 'params', JSON.stringify(body).slice(0,1000));
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      parsed = { __parse_error: true, status: res.status, text };
    }
    // cache successful JSON (even error-like responses so UI can show consistent messages)
    await cacheSet(cacheKey, parsed, ttl);
    return parsed;
  } catch (err) {
    console.warn('[gsApi] network error', err);
    // if network fails, try return stale cache
    try {
      const c = await cacheGet(cacheKey);
      if (c && c.cached !== undefined) return c.cached;
    } catch (e) {}
    return { __error: true, message: String(err) };
  }
}

// Public convenience wrappers
export default {
  rawCall: call,

  // CRUD endpoints
  list: (table, options = {}) => call('list', { table }, options),
  read: (table, filterField, filterValue, options = {}) =>
    call('read', { table, filterField, filterValue }, options),
  create: (table, payload, options = {}) => call('create', { table, payload }, options),
  update: (table, payload, options = {}) => call('update', { table, payload }, options),
  delete: (table, id, options = {}) => call('delete', { table, id }, options),

  // Auth
  login: (username, password, options = {}) => call('login', { username, password }, options),

  // Panchayat / Village / SHG
  panchayatsByClf: (clf_id, options = {}) => call('panchayats_by_clf', { clf_id }, options),
  villagesByPanchayat: (panchayat_id, options = {}) => call('villages_by_panchayat', { panchayat_id }, options),
  shgsByVillage: (village_id, options = {}) => call('shgs_by_village', { village_id }, options),
  beneficiariesByShg: (shg_id, recorded, options = {}) => call('beneficiaries_by_shg', { shg_id, recorded }, options),

  // Analytics
  analyticsByDistrict: (options = {}) => call('analytics_by_district', {}, options),

  // Media upload
  uploadMedia: (files, folderId, options = {}) =>
    call('upload_media', { payload: { files, folderId } }, options),

  // Fast idempotent save
  createOrUpdateEnterprise: (payload, options = {}) =>
    call('create_or_update_enterprise', { payload }, options),
};
