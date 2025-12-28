#!/usr/bin/env node
/**
 * Add Billing Page translations to all locale files
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const BILLING_TRANSLATIONS = {
  'en-US': {
    billing: {
      retry: 'Retry',
      loading: 'Loading...',
      refreshing: 'Refreshing...',
      refresh: 'Refresh',
      paymentMethod: 'Payment Method',
      recommendedForRegion: 'Recommended for your region',
      manuallySelected: 'Manually selected',
      cancel: 'Cancel',
      change: 'Change',
      bestValue: 'Best Value',
      interviewCredits: '{{count}} interview credits',
      practiceInterviews: '{{count}} practice interviews',
      aiFeedback: 'AI-powered feedback',
      performanceAnalytics: 'Performance analytics',
      processing: 'Processing...',
      buyNow: 'Buy Now',
      securePaymentVia: 'Secure payment via',
      credits: 'credits',
      balance: 'Balance',
      loadMore: 'Load More',
      needHelp: 'Need Help?',
      contactUsAt: 'Contact us at'
    }
  },
  'pt-BR': {
    billing: {
      retry: 'Tentar novamente',
      loading: 'Carregando...',
      refreshing: 'Atualizando...',
      refresh: 'Atualizar',
      paymentMethod: 'Método de Pagamento',
      recommendedForRegion: 'Recomendado para sua região',
      manuallySelected: 'Selecionado manualmente',
      cancel: 'Cancelar',
      change: 'Alterar',
      bestValue: 'Melhor Valor',
      interviewCredits: '{{count}} créditos de entrevista',
      practiceInterviews: '{{count}} entrevistas práticas',
      aiFeedback: 'Feedback com IA',
      performanceAnalytics: 'Análise de desempenho',
      processing: 'Processando...',
      buyNow: 'Comprar Agora',
      securePaymentVia: 'Pagamento seguro via',
      credits: 'créditos',
      balance: 'Saldo',
      loadMore: 'Carregar Mais',
      needHelp: 'Precisa de Ajuda?',
      contactUsAt: 'Entre em contato em'
    }
  },
  'es-ES': {
    billing: {
      retry: 'Reintentar',
      loading: 'Cargando...',
      refreshing: 'Actualizando...',
      refresh: 'Actualizar',
      paymentMethod: 'Método de Pago',
      recommendedForRegion: 'Recomendado para tu región',
      manuallySelected: 'Seleccionado manualmente',
      cancel: 'Cancelar',
      change: 'Cambiar',
      bestValue: 'Mejor Valor',
      interviewCredits: '{{count}} créditos de entrevista',
      practiceInterviews: '{{count}} entrevistas de práctica',
      aiFeedback: 'Retroalimentación con IA',
      performanceAnalytics: 'Análisis de rendimiento',
      processing: 'Procesando...',
      buyNow: 'Comprar Ahora',
      securePaymentVia: 'Pago seguro vía',
      credits: 'créditos',
      balance: 'Saldo',
      loadMore: 'Cargar Más',
      needHelp: '¿Necesitas Ayuda?',
      contactUsAt: 'Contáctanos en'
    }
  },
  'fr-FR': {
    billing: {
      retry: 'Réessayer',
      loading: 'Chargement...',
      refreshing: 'Actualisation...',
      refresh: 'Actualiser',
      paymentMethod: 'Méthode de Paiement',
      recommendedForRegion: 'Recommandé pour votre région',
      manuallySelected: 'Sélectionné manuellement',
      cancel: 'Annuler',
      change: 'Changer',
      bestValue: 'Meilleur Rapport',
      interviewCredits: '{{count}} crédits d\'entretien',
      practiceInterviews: '{{count}} entretiens de pratique',
      aiFeedback: 'Feedback IA',
      performanceAnalytics: 'Analyse de performance',
      processing: 'Traitement...',
      buyNow: 'Acheter',
      securePaymentVia: 'Paiement sécurisé via',
      credits: 'crédits',
      balance: 'Solde',
      loadMore: 'Charger Plus',
      needHelp: 'Besoin d\'Aide ?',
      contactUsAt: 'Contactez-nous à'
    }
  },
  'ru-RU': {
    billing: {
      retry: 'Повторить',
      loading: 'Загрузка...',
      refreshing: 'Обновление...',
      refresh: 'Обновить',
      paymentMethod: 'Способ Оплаты',
      recommendedForRegion: 'Рекомендуется для вашего региона',
      manuallySelected: 'Выбрано вручную',
      cancel: 'Отмена',
      change: 'Изменить',
      bestValue: 'Лучшая Цена',
      interviewCredits: '{{count}} кредитов на собеседования',
      practiceInterviews: '{{count}} практических собеседований',
      aiFeedback: 'ИИ-анализ',
      performanceAnalytics: 'Аналитика производительности',
      processing: 'Обработка...',
      buyNow: 'Купить',
      securePaymentVia: 'Безопасная оплата через',
      credits: 'кредитов',
      balance: 'Баланс',
      loadMore: 'Загрузить Ещё',
      needHelp: 'Нужна Помощь?',
      contactUsAt: 'Свяжитесь с нами'
    }
  },
  'zh-CN': {
    billing: {
      retry: '重试',
      loading: '加载中...',
      refreshing: '刷新中...',
      refresh: '刷新',
      paymentMethod: '支付方式',
      recommendedForRegion: '推荐用于您所在的地区',
      manuallySelected: '手动选择',
      cancel: '取消',
      change: '更改',
      bestValue: '最佳价值',
      interviewCredits: '{{count}} 面试积分',
      practiceInterviews: '{{count}} 次练习面试',
      aiFeedback: 'AI驱动反馈',
      performanceAnalytics: '性能分析',
      processing: '处理中...',
      buyNow: '立即购买',
      securePaymentVia: '安全支付通过',
      credits: '积分',
      balance: '余额',
      loadMore: '加载更多',
      needHelp: '需要帮助？',
      contactUsAt: '联系我们'
    }
  },
  'hi-IN': {
    billing: {
      retry: 'पुनः प्रयास करें',
      loading: 'लोड हो रहा है...',
      refreshing: 'ताज़ा हो रहा है...',
      refresh: 'ताज़ा करें',
      paymentMethod: 'भुगतान विधि',
      recommendedForRegion: 'आपके क्षेत्र के लिए अनुशंसित',
      manuallySelected: 'मैन्युअल रूप से चयनित',
      cancel: 'रद्द करें',
      change: 'बदलें',
      bestValue: 'सर्वोत्तम मूल्य',
      interviewCredits: '{{count}} इंटरव्यू क्रेडिट',
      practiceInterviews: '{{count}} अभ्यास इंटरव्यू',
      aiFeedback: 'AI-संचालित फीडबैक',
      performanceAnalytics: 'प्रदर्शन विश्लेषण',
      processing: 'प्रोसेसिंग...',
      buyNow: 'अभी खरीदें',
      securePaymentVia: 'सुरक्षित भुगतान',
      credits: 'क्रेडिट',
      balance: 'शेष राशि',
      loadMore: 'और लोड करें',
      needHelp: 'मदद चाहिए?',
      contactUsAt: 'हमसे संपर्क करें'
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
function addBillingTranslations() {
  console.log('🔧 Adding billing translations to locale files...\n');

  for (const [locale, translations] of Object.entries(BILLING_TRANSLATIONS)) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      // Merge translations
      const merged = deepMerge(data, translations);
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
      
      console.log(`✅ ${locale}: Added billing translations`);
    } catch (err) {
      console.error(`❌ ${locale}: Failed - ${err.message}`);
    }
  }

  console.log('\n✨ Done!');
}

addBillingTranslations();
