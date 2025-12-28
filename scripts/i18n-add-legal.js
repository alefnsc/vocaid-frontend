#!/usr/bin/env node
/**
 * Add legal page section translations and disclaimer to all locale files
 * 
 * Note: Full legal document translation requires professional legal review.
 * This adds a disclaimer in non-English locales.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const LEGAL_TRANSLATIONS = {
  'en-US': {
    privacy: {
      sections: {
        introduction: 'Introduction',
        dataCollected: 'Data We Collect',
        howWeUse: 'How We Use Your Data',
        dataSecurity: 'Data Security',
        thirdParty: 'Third-Party Services',
        yourRights: 'Your Rights',
        contactUs: 'Contact Us'
      }
    },
    terms: {
      sections: {
        acceptance: 'Acceptance of Terms',
        services: 'Description of Services',
        userAccounts: 'User Accounts',
        prohibited: 'Prohibited Uses',
        intellectualProperty: 'Intellectual Property',
        limitation: 'Limitation of Liability',
        changes: 'Changes to Terms',
        contactUs: 'Contact Us'
      }
    }
  },
  'pt-BR': {
    disclaimer: 'Esta é uma tradução de cortesia. O texto em inglês prevalece em caso de discrepâncias.',
    privacy: {
      sections: {
        introduction: 'Introdução',
        dataCollected: 'Dados que Coletamos',
        howWeUse: 'Como Usamos Seus Dados',
        dataSecurity: 'Segurança de Dados',
        thirdParty: 'Serviços de Terceiros',
        yourRights: 'Seus Direitos',
        contactUs: 'Fale Conosco'
      }
    },
    terms: {
      sections: {
        acceptance: 'Aceitação dos Termos',
        services: 'Descrição dos Serviços',
        userAccounts: 'Contas de Usuário',
        prohibited: 'Usos Proibidos',
        intellectualProperty: 'Propriedade Intelectual',
        limitation: 'Limitação de Responsabilidade',
        changes: 'Alterações nos Termos',
        contactUs: 'Fale Conosco'
      }
    }
  },
  'es-ES': {
    disclaimer: 'Esta es una traducción de cortesía. El texto en inglés prevalece en caso de discrepancias.',
    privacy: {
      sections: {
        introduction: 'Introducción',
        dataCollected: 'Datos que Recopilamos',
        howWeUse: 'Cómo Usamos sus Datos',
        dataSecurity: 'Seguridad de Datos',
        thirdParty: 'Servicios de Terceros',
        yourRights: 'Sus Derechos',
        contactUs: 'Contáctenos'
      }
    },
    terms: {
      sections: {
        acceptance: 'Aceptación de los Términos',
        services: 'Descripción de los Servicios',
        userAccounts: 'Cuentas de Usuario',
        prohibited: 'Usos Prohibidos',
        intellectualProperty: 'Propiedad Intelectual',
        limitation: 'Limitación de Responsabilidad',
        changes: 'Cambios en los Términos',
        contactUs: 'Contáctenos'
      }
    }
  },
  'fr-FR': {
    disclaimer: 'Ceci est une traduction de courtoisie. Le texte anglais prévaut en cas de divergence.',
    privacy: {
      sections: {
        introduction: 'Introduction',
        dataCollected: 'Données que Nous Collectons',
        howWeUse: 'Comment Nous Utilisons vos Données',
        dataSecurity: 'Sécurité des Données',
        thirdParty: 'Services Tiers',
        yourRights: 'Vos Droits',
        contactUs: 'Nous Contacter'
      }
    },
    terms: {
      sections: {
        acceptance: 'Acceptation des Conditions',
        services: 'Description des Services',
        userAccounts: 'Comptes Utilisateur',
        prohibited: 'Utilisations Interdites',
        intellectualProperty: 'Propriété Intellectuelle',
        limitation: 'Limitation de Responsabilité',
        changes: 'Modifications des Conditions',
        contactUs: 'Nous Contacter'
      }
    }
  },
  'ru-RU': {
    disclaimer: 'Это перевод предоставлен для удобства. В случае расхождений преимущество имеет английский текст.',
    privacy: {
      sections: {
        introduction: 'Введение',
        dataCollected: 'Данные, которые мы собираем',
        howWeUse: 'Как мы используем ваши данные',
        dataSecurity: 'Безопасность данных',
        thirdParty: 'Сторонние сервисы',
        yourRights: 'Ваши права',
        contactUs: 'Связаться с нами'
      }
    },
    terms: {
      sections: {
        acceptance: 'Принятие условий',
        services: 'Описание услуг',
        userAccounts: 'Учётные записи пользователей',
        prohibited: 'Запрещённое использование',
        intellectualProperty: 'Интеллектуальная собственность',
        limitation: 'Ограничение ответственности',
        changes: 'Изменения условий',
        contactUs: 'Связаться с нами'
      }
    }
  },
  'zh-CN': {
    disclaimer: '这是一份礼貌性翻译。如有差异，以英文文本为准。',
    privacy: {
      sections: {
        introduction: '简介',
        dataCollected: '我们收集的数据',
        howWeUse: '我们如何使用您的数据',
        dataSecurity: '数据安全',
        thirdParty: '第三方服务',
        yourRights: '您的权利',
        contactUs: '联系我们'
      }
    },
    terms: {
      sections: {
        acceptance: '条款接受',
        services: '服务描述',
        userAccounts: '用户账户',
        prohibited: '禁止使用',
        intellectualProperty: '知识产权',
        limitation: '责任限制',
        changes: '条款变更',
        contactUs: '联系我们'
      }
    }
  },
  'hi-IN': {
    disclaimer: 'यह एक सौजन्य अनुवाद है। विसंगतियों के मामले में अंग्रेजी पाठ प्रबल होता है।',
    privacy: {
      sections: {
        introduction: 'परिचय',
        dataCollected: 'हम कौन सा डेटा एकत्र करते हैं',
        howWeUse: 'हम आपके डेटा का उपयोग कैसे करते हैं',
        dataSecurity: 'डेटा सुरक्षा',
        thirdParty: 'तृतीय-पक्ष सेवाएं',
        yourRights: 'आपके अधिकार',
        contactUs: 'हमसे संपर्क करें'
      }
    },
    terms: {
      sections: {
        acceptance: 'शर्तों की स्वीकृति',
        services: 'सेवाओं का विवरण',
        userAccounts: 'उपयोगकर्ता खाते',
        prohibited: 'निषिद्ध उपयोग',
        intellectualProperty: 'बौद्धिक संपदा',
        limitation: 'दायित्व की सीमा',
        changes: 'शर्तों में परिवर्तन',
        contactUs: 'हमसे संपर्क करें'
      }
    }
  }
};

function addLegalTranslations() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const localeCode = file.replace('.json', '');
    const filePath = path.join(LOCALES_DIR, file);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Get translations for this locale (fallback to en-US)
      const translations = LEGAL_TRANSLATIONS[localeCode] || LEGAL_TRANSLATIONS['en-US'];
      
      // Ensure legal object exists
      if (!content.legal) {
        content.legal = {};
      }
      
      // Add disclaimer for non-English locales
      if (translations.disclaimer) {
        content.legal.disclaimer = translations.disclaimer;
      }
      
      // Add privacy sections
      if (!content.legal.privacy) {
        content.legal.privacy = {};
      }
      content.legal.privacy.sections = translations.privacy.sections;
      
      // Add terms sections
      if (!content.legal.terms) {
        content.legal.terms = {};
      }
      content.legal.terms.sections = translations.terms.sections;
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
      console.log(`✓ Updated ${file}`);
      
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
    }
  }
  
  console.log('\n✓ All locale files updated with legal page translations');
  console.log('⚠️  Note: Full legal document translation requires professional legal review.');
}

addLegalTranslations();
