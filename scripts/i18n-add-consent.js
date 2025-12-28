#!/usr/bin/env node
/**
 * Add Consent Page translations to all locale files
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const CONSENT_TRANSLATIONS = {
  'en-US': {
    consent: {
      loading: 'Loading...',
      loadError: 'Failed to load consent requirements. Please refresh the page.',
      userNotAuth: 'User not authenticated. Please sign in again.',
      recordFailed: 'Failed to record consent. Please try again.',
      genericError: 'An error occurred. Please try again.',
      mustAcceptBoth: 'You must accept both Terms of Use and Privacy Policy to continue.',
      step1: {
        title: 'Before you start',
        subtitle: 'We need your agreement to continue using Vocaid.',
        agreeToTerms: 'I agree to the',
        termsOfUse: 'Terms of Use',
        privacyPolicy: 'Privacy Policy',
        continue: 'Continue'
      },
      step2: {
        title: 'Communication preferences',
        subtitle: "Choose how you'd like to hear from us.",
        essential: {
          title: 'Essential transactional emails',
          description: 'Receipts, security alerts, and account notifications. Required to use Vocaid.'
        },
        marketing: {
          title: 'Product updates and offers',
          description: 'Tips, new features, and occasional promotions. You can unsubscribe anytime.'
        },
        back: 'Back',
        saving: 'Saving...',
        getStarted: 'Get started'
      },
      footer: {
        notice: 'By continuing, you agree to receive essential transactional emails.'
      }
    }
  },
  'pt-BR': {
    consent: {
      loading: 'Carregando...',
      loadError: 'Falha ao carregar requisitos de consentimento. Por favor, atualize a página.',
      userNotAuth: 'Usuário não autenticado. Por favor, faça login novamente.',
      recordFailed: 'Falha ao registrar consentimento. Por favor, tente novamente.',
      genericError: 'Ocorreu um erro. Por favor, tente novamente.',
      mustAcceptBoth: 'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.',
      step1: {
        title: 'Antes de começar',
        subtitle: 'Precisamos do seu acordo para continuar usando a Vocaid.',
        agreeToTerms: 'Eu concordo com',
        termsOfUse: 'Termos de Uso',
        privacyPolicy: 'Política de Privacidade',
        continue: 'Continuar'
      },
      step2: {
        title: 'Preferências de comunicação',
        subtitle: 'Escolha como você gostaria de receber nossas comunicações.',
        essential: {
          title: 'E-mails transacionais essenciais',
          description: 'Recibos, alertas de segurança e notificações da conta. Necessário para usar a Vocaid.'
        },
        marketing: {
          title: 'Atualizações de produtos e ofertas',
          description: 'Dicas, novos recursos e promoções ocasionais. Você pode cancelar a qualquer momento.'
        },
        back: 'Voltar',
        saving: 'Salvando...',
        getStarted: 'Começar'
      },
      footer: {
        notice: 'Ao continuar, você concorda em receber e-mails transacionais essenciais.'
      }
    }
  },
  'es-ES': {
    consent: {
      loading: 'Cargando...',
      loadError: 'Error al cargar los requisitos de consentimiento. Por favor, actualiza la página.',
      userNotAuth: 'Usuario no autenticado. Por favor, inicia sesión nuevamente.',
      recordFailed: 'Error al registrar el consentimiento. Por favor, intenta de nuevo.',
      genericError: 'Ocurrió un error. Por favor, intenta de nuevo.',
      mustAcceptBoth: 'Debes aceptar los Términos de Uso y la Política de Privacidad para continuar.',
      step1: {
        title: 'Antes de empezar',
        subtitle: 'Necesitamos tu acuerdo para continuar usando Vocaid.',
        agreeToTerms: 'Acepto los',
        termsOfUse: 'Términos de Uso',
        privacyPolicy: 'Política de Privacidad',
        continue: 'Continuar'
      },
      step2: {
        title: 'Preferencias de comunicación',
        subtitle: 'Elige cómo te gustaría recibir noticias de nosotros.',
        essential: {
          title: 'Correos transaccionales esenciales',
          description: 'Recibos, alertas de seguridad y notificaciones de cuenta. Requerido para usar Vocaid.'
        },
        marketing: {
          title: 'Actualizaciones de productos y ofertas',
          description: 'Consejos, nuevas funciones y promociones ocasionales. Puedes cancelar en cualquier momento.'
        },
        back: 'Volver',
        saving: 'Guardando...',
        getStarted: 'Comenzar'
      },
      footer: {
        notice: 'Al continuar, aceptas recibir correos transaccionales esenciales.'
      }
    }
  },
  'fr-FR': {
    consent: {
      loading: 'Chargement...',
      loadError: 'Échec du chargement des exigences de consentement. Veuillez actualiser la page.',
      userNotAuth: 'Utilisateur non authentifié. Veuillez vous reconnecter.',
      recordFailed: "Échec de l'enregistrement du consentement. Veuillez réessayer.",
      genericError: 'Une erreur est survenue. Veuillez réessayer.',
      mustAcceptBoth: "Vous devez accepter les Conditions d'Utilisation et la Politique de Confidentialité pour continuer.",
      step1: {
        title: 'Avant de commencer',
        subtitle: 'Nous avons besoin de votre accord pour continuer à utiliser Vocaid.',
        agreeToTerms: "J'accepte les",
        termsOfUse: "Conditions d'Utilisation",
        privacyPolicy: 'Politique de Confidentialité',
        continue: 'Continuer'
      },
      step2: {
        title: 'Préférences de communication',
        subtitle: 'Choisissez comment vous souhaitez être contacté.',
        essential: {
          title: 'E-mails transactionnels essentiels',
          description: 'Reçus, alertes de sécurité et notifications de compte. Requis pour utiliser Vocaid.'
        },
        marketing: {
          title: 'Mises à jour produits et offres',
          description: 'Conseils, nouvelles fonctionnalités et promotions occasionnelles. Vous pouvez vous désabonner à tout moment.'
        },
        back: 'Retour',
        saving: 'Enregistrement...',
        getStarted: 'Commencer'
      },
      footer: {
        notice: 'En continuant, vous acceptez de recevoir des e-mails transactionnels essentiels.'
      }
    }
  },
  'ru-RU': {
    consent: {
      loading: 'Загрузка...',
      loadError: 'Не удалось загрузить требования согласия. Пожалуйста, обновите страницу.',
      userNotAuth: 'Пользователь не аутентифицирован. Пожалуйста, войдите снова.',
      recordFailed: 'Не удалось записать согласие. Пожалуйста, попробуйте снова.',
      genericError: 'Произошла ошибка. Пожалуйста, попробуйте снова.',
      mustAcceptBoth: 'Вы должны принять Условия использования и Политику конфиденциальности для продолжения.',
      step1: {
        title: 'Перед началом',
        subtitle: 'Нам нужно ваше согласие для продолжения использования Vocaid.',
        agreeToTerms: 'Я принимаю',
        termsOfUse: 'Условия использования',
        privacyPolicy: 'Политику конфиденциальности',
        continue: 'Продолжить'
      },
      step2: {
        title: 'Настройки уведомлений',
        subtitle: 'Выберите, как вы хотите получать сообщения от нас.',
        essential: {
          title: 'Обязательные транзакционные письма',
          description: 'Квитанции, оповещения безопасности и уведомления аккаунта. Обязательно для использования Vocaid.'
        },
        marketing: {
          title: 'Обновления продуктов и предложения',
          description: 'Советы, новые функции и периодические акции. Вы можете отписаться в любое время.'
        },
        back: 'Назад',
        saving: 'Сохранение...',
        getStarted: 'Начать'
      },
      footer: {
        notice: 'Продолжая, вы соглашаетесь получать обязательные транзакционные письма.'
      }
    }
  },
  'zh-CN': {
    consent: {
      loading: '加载中...',
      loadError: '加载同意要求失败。请刷新页面。',
      userNotAuth: '用户未认证。请重新登录。',
      recordFailed: '记录同意失败。请重试。',
      genericError: '发生错误。请重试。',
      mustAcceptBoth: '您必须同意使用条款和隐私政策才能继续。',
      step1: {
        title: '开始之前',
        subtitle: '我们需要您的同意才能继续使用 Vocaid。',
        agreeToTerms: '我同意',
        termsOfUse: '使用条款',
        privacyPolicy: '隐私政策',
        continue: '继续'
      },
      step2: {
        title: '通信偏好',
        subtitle: '选择您希望如何收到我们的消息。',
        essential: {
          title: '必要的交易邮件',
          description: '收据、安全提醒和账户通知。使用 Vocaid 必需。'
        },
        marketing: {
          title: '产品更新和优惠',
          description: '技巧、新功能和偶尔的促销活动。您可以随时取消订阅。'
        },
        back: '返回',
        saving: '保存中...',
        getStarted: '开始使用'
      },
      footer: {
        notice: '继续即表示您同意接收必要的交易邮件。'
      }
    }
  },
  'hi-IN': {
    consent: {
      loading: 'लोड हो रहा है...',
      loadError: 'सहमति आवश्यकताएं लोड करने में विफल। कृपया पृष्ठ ताज़ा करें।',
      userNotAuth: 'उपयोगकर्ता प्रमाणित नहीं है। कृपया फिर से साइन इन करें।',
      recordFailed: 'सहमति दर्ज करने में विफल। कृपया पुनः प्रयास करें।',
      genericError: 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
      mustAcceptBoth: 'जारी रखने के लिए आपको उपयोग की शर्तें और गोपनीयता नीति दोनों स्वीकार करनी होगी।',
      step1: {
        title: 'शुरू करने से पहले',
        subtitle: 'Vocaid का उपयोग जारी रखने के लिए हमें आपकी सहमति चाहिए।',
        agreeToTerms: 'मैं सहमत हूं',
        termsOfUse: 'उपयोग की शर्तें',
        privacyPolicy: 'गोपनीयता नीति',
        continue: 'जारी रखें'
      },
      step2: {
        title: 'संचार प्राथमिकताएं',
        subtitle: 'चुनें कि आप हमसे कैसे संपर्क प्राप्त करना चाहेंगे।',
        essential: {
          title: 'आवश्यक लेनदेन ईमेल',
          description: 'रसीदें, सुरक्षा अलर्ट और खाता सूचनाएं। Vocaid का उपयोग करने के लिए आवश्यक।'
        },
        marketing: {
          title: 'उत्पाद अपडेट और ऑफ़र',
          description: 'टिप्स, नई सुविधाएं और कभी-कभार प्रमोशन। आप कभी भी अनसब्सक्राइब कर सकते हैं।'
        },
        back: 'वापस',
        saving: 'सहेजा जा रहा है...',
        getStarted: 'शुरू करें'
      },
      footer: {
        notice: 'जारी रखकर, आप आवश्यक लेनदेन ईमेल प्राप्त करने के लिए सहमत हैं।'
      }
    }
  }
};

// Deep merge function
function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// Main function
function addConsentTranslations() {
  console.log('🔧 Adding consent translations to locale files...\n');

  for (const [locale, translations] of Object.entries(CONSENT_TRANSLATIONS)) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      // Merge translations
      const merged = deepMerge(data, translations);
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
      
      console.log(`✅ ${locale}: Added consent translations`);
    } catch (err) {
      console.error(`❌ ${locale}: Failed - ${err.message}`);
    }
  }

  console.log('\n✨ Done!');
}

addConsentTranslations();
