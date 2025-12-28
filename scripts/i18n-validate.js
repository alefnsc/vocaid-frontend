#!/usr/bin/env node
/**
 * i18n Validation Script
 * 
 * Validates translation files for:
 * 1. Key parity across all locales
 * 2. Interpolation token consistency
 * 3. Missing/extra keys
 * 
 * Usage: node scripts/i18n-validate.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');
const MASTER_LOCALE = 'en-US';

const LOCALE_FILES = [
  'en-US.json',
  'pt-BR.json',
  'es-ES.json',
  'fr-FR.json',
  'ru-RU.json',
  'zh-CN.json',
  'hi-IN.json',
];

// Flatten nested object to dot-notation keys
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else {
      acc[pre + key] = obj[key];
    }
    return acc;
  }, {});
}

// Extract interpolation tokens from a string
function extractTokens(str) {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{\{[^}]+\}\}/g) || [];
  return matches.map(m => m.replace(/[{}]/g, '')).sort();
}

// Load all locale files
function loadLocales() {
  const locales = {};
  for (const file of LOCALE_FILES) {
    const code = file.replace('.json', '');
    const filePath = path.join(LOCALES_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      locales[code] = JSON.parse(content);
    } catch (err) {
      console.error(`Failed to load ${file}:`, err.message);
      process.exit(1);
    }
  }
  return locales;
}

// Main validation
function validate() {
  console.log('🔍 i18n Validation Report');
  console.log('='.repeat(60));
  console.log('');

  const locales = loadLocales();
  const master = flattenObject(locales[MASTER_LOCALE]);
  const masterKeys = Object.keys(master);

  console.log(`📋 Master locale (${MASTER_LOCALE}): ${masterKeys.length} keys`);
  console.log('');

  let hasErrors = false;
  const report = {
    missingKeys: {},
    extraKeys: {},
    tokenMismatches: {},
  };

  // Validate each locale
  for (const [code, data] of Object.entries(locales)) {
    if (code === MASTER_LOCALE) continue;

    const flattened = flattenObject(data);
    const keys = Object.keys(flattened);

    // Find missing keys
    const missing = masterKeys.filter(k => !keys.includes(k));
    if (missing.length > 0) {
      report.missingKeys[code] = missing;
      hasErrors = true;
    }

    // Find extra keys
    const extra = keys.filter(k => !masterKeys.includes(k));
    if (extra.length > 0) {
      report.extraKeys[code] = extra;
    }

    // Check token consistency
    const tokenMismatches = [];
    for (const key of masterKeys) {
      if (keys.includes(key)) {
        const masterTokens = extractTokens(master[key]);
        const localeTokens = extractTokens(flattened[key]);
        
        if (JSON.stringify(masterTokens) !== JSON.stringify(localeTokens)) {
          tokenMismatches.push({
            key,
            masterTokens,
            localeTokens,
          });
        }
      }
    }
    if (tokenMismatches.length > 0) {
      report.tokenMismatches[code] = tokenMismatches;
      hasErrors = true;
    }

    // Print locale summary
    console.log(`📦 ${code}`);
    console.log(`   Keys: ${keys.length}`);
    console.log(`   Missing: ${missing.length}`);
    console.log(`   Extra: ${extra.length}`);
    console.log(`   Token mismatches: ${tokenMismatches.length}`);
    console.log('');
  }

  // Detailed report
  console.log('='.repeat(60));
  console.log('📊 Detailed Report');
  console.log('='.repeat(60));
  console.log('');

  // Missing keys
  if (Object.keys(report.missingKeys).length > 0) {
    console.log('❌ MISSING KEYS (must be added):');
    for (const [code, keys] of Object.entries(report.missingKeys)) {
      console.log(`\n  ${code} (${keys.length} missing):`);
      keys.slice(0, 20).forEach(k => console.log(`    - ${k}`));
      if (keys.length > 20) console.log(`    ... and ${keys.length - 20} more`);
    }
    console.log('');
  }

  // Token mismatches
  if (Object.keys(report.tokenMismatches).length > 0) {
    console.log('⚠️  TOKEN MISMATCHES (interpolation variables differ):');
    for (const [code, mismatches] of Object.entries(report.tokenMismatches)) {
      console.log(`\n  ${code} (${mismatches.length} mismatches):`);
      mismatches.slice(0, 10).forEach(m => {
        console.log(`    - ${m.key}`);
        console.log(`      master: {{${m.masterTokens.join('}}, {{')}}} `);
        console.log(`      locale: {{${m.localeTokens.join('}}, {{')}}} `);
      });
      if (mismatches.length > 10) console.log(`    ... and ${mismatches.length - 10} more`);
    }
    console.log('');
  }

  // Extra keys (informational)
  if (Object.keys(report.extraKeys).length > 0) {
    console.log('ℹ️  EXTRA KEYS (not in master, may be unused):');
    for (const [code, keys] of Object.entries(report.extraKeys)) {
      console.log(`\n  ${code} (${keys.length} extra):`);
      keys.slice(0, 10).forEach(k => console.log(`    - ${k}`));
      if (keys.length > 10) console.log(`    ... and ${keys.length - 10} more`);
    }
    console.log('');
  }

  console.log('='.repeat(60));
  if (hasErrors) {
    console.log('❌ Validation FAILED - missing keys or token mismatches found');
    process.exit(1);
  } else {
    console.log('✅ Validation PASSED - all locales are consistent');
    process.exit(0);
  }
}

validate();
