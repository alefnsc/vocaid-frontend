#!/usr/bin/env node
/**
 * Add startFailed translation key
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const translations = {
  'en-US': 'Failed to start interview. Please try again.',
  'pt-BR': 'Falha ao iniciar a entrevista. Por favor, tente novamente.',
  'es-ES': 'Error al iniciar la entrevista. Por favor, inténtalo de nuevo.',
  'fr-FR': "Échec du démarrage de l'entretien. Veuillez réessayer.",
  'ru-RU': 'Не удалось начать собеседование. Пожалуйста, попробуйте снова.',
  'zh-CN': '面试开始失败，请重试。',
  'hi-IN': 'साक्षात्कार शुरू करने में विफल। कृपया पुनः प्रयास करें।'
};

const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const localeCode = file.replace('.json', '');
  const filePath = path.join(LOCALES_DIR, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!content.interviewSetup) content.interviewSetup = {};
  if (!content.interviewSetup.validation) content.interviewSetup.validation = {};
  
  content.interviewSetup.validation.startFailed = translations[localeCode] || translations['en-US'];
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  console.log('✓ Updated', file);
}
console.log('\nDone!');
