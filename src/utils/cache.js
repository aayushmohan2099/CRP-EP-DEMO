// src/utils/cache.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function cacheSet(key, value, ttlSeconds = 300) {
  try {
    const payload = { ts: Date.now(), ttl: Number(ttlSeconds || 300), value };
    await AsyncStorage.setItem('@cache:' + key, JSON.stringify(payload));
  } catch (err) { console.warn('cacheSet', err); }
}

export async function cacheGet(key) {
  try {
    const raw = await AsyncStorage.getItem('@cache:' + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const age = (Date.now() - parsed.ts) / 1000;
    return { cached: parsed.value, isExpired: age > parsed.ttl, age };
  } catch (err) { console.warn('cacheGet', err); return null; }
}

export async function cacheRemove(key) {
  try { await AsyncStorage.removeItem('@cache:' + key); } catch (err) {}
}
