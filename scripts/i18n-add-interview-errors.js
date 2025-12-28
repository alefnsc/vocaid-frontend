#!/usr/bin/env node
/**
 * Add interview error translations to all locale files
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const TRANSLATIONS = {
  'en-US': {
    noCreditsError: 'No credits available. Please purchase credits to continue.',
    sessionValidationFailed: 'Failed to validate session. Please try again.'
  },
  'pt-BR': {
    noCreditsError: 'Sem créditos disponíveis. Por favor, compre créditos para continuar.',
    sessionValidationFailed: 'Falha ao validar sessão. Por favor, tente novamente.'
  },
  'es-ES': {
    noCreditsError: 'Sin créditos disponibles. Por favor, compre créditos para continuar.',
    sessionValidationFailed: 'Error al validar la sesión. Por favor, inténtalo de nuevo.'
  },
  'fr-FR': {
    noCreditsError: 'Aucun crédit disponible. Veuillez acheter des crédits pour continuer.',
    sessionValidationFailed: 'Échec de la validation de la session. Veuillez réessayer.'
  },
  'ru-RU': {
    noCreditsError: 'Нет доступных кредитов. Пожалуйста, приобретите кредиты для продолжения.',
    sessionValidationFailed: 'Не удалось проверить сессию. Пожалуйста, попробуйте снова.'
  },
  'zh-CN': {
    noCreditsError: '没有可用积分。请购买积分以继续。',
    sessionValidationFailed: '会话验证失败，请重试。'
  },
  'hi-IN': {
    noCreditsError: 'कोई क्रेडिट उपलब्ध नहीं है। कृपया जारी रखने के लिए क्रेडिट खरीदें।',
    sessionValidationFailed: 'सत्र सत्यापन विफल। कृपया पुनः प्रयास करें।'
  }
};

function addInterviewErrors() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const localeCode = file.replace('.json', '');
    const filePath = path.join(LOCALES_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!content.interview) content.interview = {};
    if (!content.interview.errors) content.interview.errors = {};
    
    const trans = TRANSLATIONS[localeCode] || TRANSLATIONS['en-US'];
    content.interview.errors.noCreditsError = trans.noCreditsError;
    content.interview.errors.sessionValidationFailed = trans.sessionValidationFailed;
    
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log('✓ Updated', file);
  }
  console.log('\nDone!');
}

addInterviewErrors();
