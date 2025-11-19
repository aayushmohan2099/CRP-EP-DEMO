// import Sanscript from "@sanskrit-coders/sanscript";

// export function translateToHindi(text = "") {
//   if (!text) return "";
//   try {
//     // Transliterate English to Devanagari (Hindi)
//     return Sanscript.t(text, "itrans", "devanagari");
//   } catch (e) {
//     return text;
//   }
// }

// export function translate(text = "", language = "en") {
//   if (language === "hi") {
//     return translateToHindi(text);
//   }
//   return text; // English
// }


// src/utils/translate.js
import gsApi from '../api/gsApi.js';

/**
 * Translate an array of strings to the target language.
 * Uses Google Translate API (through gsApi backend).
 */
export async function translateBatch(textArray = [], targetLang = 'hi') {
  if (!Array.isArray(textArray) || !textArray.length) return [];
  
  try {
    const res = await gsApi.rawCall('translate', { texts: textArray, targetLang });
    if (res && Array.isArray(res.translations)) return res.translations;
  } catch (err) {
    console.warn('Translate error', err);
  }
  
  // fallback: return original texts
  return textArray;
}
