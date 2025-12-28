#!/usr/bin/env node
/**
 * Add billing error message translations to all locale files
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const BILLING_ERRORS = {
  'en-US': {
    failedToLoadPackages: 'Failed to load credit packages',
    paymentFailed: 'Payment failed. Please try again.'
  },
  'pt-BR': {
    failedToLoadPackages: 'Falha ao carregar pacotes de créditos',
    paymentFailed: 'Pagamento falhou. Por favor, tente novamente.'
  },
  'es-ES': {
    failedToLoadPackages: 'Error al cargar paquetes de créditos',
    paymentFailed: 'El pago falló. Por favor, inténtalo de nuevo.'
  },
  'fr-FR': {
    failedToLoadPackages: 'Échec du chargement des forfaits de crédits',
    paymentFailed: 'Le paiement a échoué. Veuillez réessayer.'
  },
  'ru-RU': {
    failedToLoadPackages: 'Не удалось загрузить пакеты кредитов',
    paymentFailed: 'Платёж не прошёл. Пожалуйста, попробуйте снова.'
  },
  'zh-CN': {
    failedToLoadPackages: '加载积分套餐失败',
    paymentFailed: '支付失败，请重试。'
  },
  'hi-IN': {
    failedToLoadPackages: 'क्रेडिट पैकेज लोड करने में विफल',
    paymentFailed: 'भुगतान विफल। कृपया पुनः प्रयास करें।'
  }
};

function addBillingErrors() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const localeCode = file.replace('.json', '');
    const filePath = path.join(LOCALES_DIR, file);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Get error messages for this locale (fallback to en-US)
      const errors = BILLING_ERRORS[localeCode] || BILLING_ERRORS['en-US'];
      
      // Ensure billing object exists
      if (!content.billing) {
        content.billing = {};
      }
      
      // Add error message keys
      content.billing.failedToLoadPackages = errors.failedToLoadPackages;
      content.billing.paymentFailed = errors.paymentFailed;
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
      console.log(`✓ Updated ${file}`);
      
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
    }
  }
  
  console.log('\n✓ All locale files updated with billing error messages');
}

addBillingErrors();
