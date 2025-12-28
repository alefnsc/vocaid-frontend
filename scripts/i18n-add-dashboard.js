#!/usr/bin/env node
/**
 * Add Dashboard translations to all locale files
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const DASHBOARD_TRANSLATIONS = {
  'en-US': {
    fromLastMonth: 'from last month',
    noFilteredResults: 'No interviews match the selected filters'
  },
  'pt-BR': {
    fromLastMonth: 'do mês passado',
    noFilteredResults: 'Nenhuma entrevista corresponde aos filtros selecionados'
  },
  'es-ES': {
    fromLastMonth: 'del mes pasado',
    noFilteredResults: 'Ninguna entrevista coincide con los filtros seleccionados'
  },
  'fr-FR': {
    fromLastMonth: 'par rapport au mois dernier',
    noFilteredResults: 'Aucun entretien ne correspond aux filtres sélectionnés'
  },
  'ru-RU': {
    fromLastMonth: 'по сравнению с прошлым месяцем',
    noFilteredResults: 'Нет собеседований, соответствующих выбранным фильтрам'
  },
  'zh-CN': {
    fromLastMonth: '与上月相比',
    noFilteredResults: '没有与所选过滤器匹配的面试'
  },
  'hi-IN': {
    fromLastMonth: 'पिछले महीने से',
    noFilteredResults: 'चयनित फ़िल्टर से कोई साक्षात्कार मेल नहीं खाता'
  }
};

function addDashboardTranslations() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const localeCode = file.replace('.json', '');
    const filePath = path.join(LOCALES_DIR, file);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Get translations for this locale (fallback to en-US)
      const translations = DASHBOARD_TRANSLATIONS[localeCode] || DASHBOARD_TRANSLATIONS['en-US'];
      
      // Ensure dashboard object exists
      if (!content.dashboard) {
        content.dashboard = {};
      }
      
      // Add dashboard keys
      content.dashboard.fromLastMonth = translations.fromLastMonth;
      content.dashboard.noFilteredResults = translations.noFilteredResults;
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
      console.log(`✓ Updated ${file}`);
      
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
    }
  }
  
  console.log('\n✓ All locale files updated with dashboard translations');
}

addDashboardTranslations();
