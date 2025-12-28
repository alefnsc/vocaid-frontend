#!/usr/bin/env node
/**
 * i18n Key Sync Script
 * 
 * Adds missing keys to locale files with proper translations
 * 
 * Usage: node scripts/i18n-sync-missing.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

// Missing keys translations per locale
const MISSING_KEYS_TRANSLATIONS = {
  'es-ES': {
    common: {
      filters: 'Filtros'
    },
    contactAssistant: {
      title: 'Contactar Vocaid',
      button: 'Contáctanos',
      prompts: {
        welcome: '¡Hola! Estoy aquí para ayudarte a contactar a Vocaid. Empecemos con tu nombre.',
        name: '¿Cuál es tu nombre?',
        email: '¡Gracias! ¿Cuál es tu correo electrónico?',
        subject: '¿De qué te gustaría hablar? Por favor, elige un tema:\n\n• Consulta General\n• Soporte Técnico\n• Pregunta de Facturación\n• Retroalimentación\n• Oportunidad de Asociación\n• Otro',
        message: '¡Genial! Ahora, describe tu pregunta o mensaje (50-250 caracteres).',
        review: 'Aquí está el resumen de tu mensaje. ¿Listo para enviar? Escribe "sí" para confirmar o "editar [campo]" para hacer cambios.',
        submitting: 'Enviando tu mensaje...',
        success: '¡Tu mensaje ha sido enviado exitosamente! Te responderemos en 24-48 horas.',
        error: 'Lo sentimos, hubo un error al enviar tu mensaje. ¿Te gustaría intentar de nuevo?',
        invalidSubject: 'No reconocí ese tema. Por favor elige entre:\n• Consulta General\n• Soporte Técnico\n• Pregunta de Facturación\n• Retroalimentación\n• Oportunidad de Asociación\n• Otro',
        editField: 'Claro, actualicemos eso. ¿Qué te gustaría cambiar?',
        cancelled: '¡Sin problema! ¿Qué te gustaría editar? Puedes decir "editar nombre", "editar correo", "editar tema" o "editar mensaje".',
        confirmHelp: 'Por favor escribe "sí" para enviar tu mensaje, o "editar [campo]" para hacer cambios.'
      },
      placeholder: {
        default: 'Escribe tu respuesta...',
        message: 'Escribe tu mensaje...'
      }
    },
    dashboard: {
      filters: {
        role: 'Filtrar por Rol',
        seniority: 'Filtrar por Nivel',
        allRoles: 'Todos los Roles',
        allSeniorities: 'Todos los Niveles'
      }
    }
  },
  'fr-FR': {
    common: {
      filters: 'Filtres'
    },
    contactAssistant: {
      title: 'Contacter Vocaid',
      button: 'Contactez-nous',
      prompts: {
        welcome: 'Bonjour ! Je suis là pour vous aider à contacter Vocaid. Commençons par votre nom.',
        name: 'Quel est votre nom ?',
        email: 'Merci ! Quelle est votre adresse e-mail ?',
        subject: 'De quoi aimeriez-vous discuter ? Veuillez choisir un sujet :\n\n• Demande Générale\n• Support Technique\n• Question de Facturation\n• Retour d\'expérience\n• Opportunité de Partenariat\n• Autre',
        message: 'Super ! Maintenant, décrivez votre question ou message (50-250 caractères).',
        review: 'Voici le résumé de votre message. Prêt à envoyer ? Tapez "oui" pour confirmer ou "modifier [champ]" pour apporter des modifications.',
        submitting: 'Envoi de votre message...',
        success: 'Votre message a été envoyé avec succès ! Nous vous répondrons dans 24-48 heures.',
        error: 'Désolé, une erreur s\'est produite lors de l\'envoi de votre message. Voulez-vous réessayer ?',
        invalidSubject: 'Je n\'ai pas reconnu ce sujet. Veuillez choisir parmi :\n• Demande Générale\n• Support Technique\n• Question de Facturation\n• Retour d\'expérience\n• Opportunité de Partenariat\n• Autre',
        editField: 'Bien sûr, mettons à jour cela. Que souhaitez-vous modifier ?',
        cancelled: 'Pas de problème ! Que souhaitez-vous modifier ? Vous pouvez dire "modifier nom", "modifier email", "modifier sujet" ou "modifier message".',
        confirmHelp: 'Veuillez taper "oui" pour envoyer votre message, ou "modifier [champ]" pour apporter des modifications.'
      },
      placeholder: {
        default: 'Tapez votre réponse...',
        message: 'Tapez votre message...'
      }
    },
    dashboard: {
      filters: {
        role: 'Filtrer par Rôle',
        seniority: 'Filtrer par Niveau',
        allRoles: 'Tous les Rôles',
        allSeniorities: 'Tous les Niveaux'
      }
    }
  },
  'ru-RU': {
    common: {
      filters: 'Фильтры'
    },
    contactAssistant: {
      title: 'Связаться с Vocaid',
      button: 'Связаться с нами',
      prompts: {
        welcome: 'Привет! Я здесь, чтобы помочь вам связаться с Vocaid. Давайте начнём с вашего имени.',
        name: 'Как вас зовут?',
        email: 'Спасибо! Какой ваш email адрес?',
        subject: 'О чём вы хотели бы поговорить? Пожалуйста, выберите тему:\n\n• Общий Вопрос\n• Техническая Поддержка\n• Вопрос по Оплате\n• Обратная Связь\n• Партнёрство\n• Другое',
        message: 'Отлично! Теперь опишите ваш вопрос или сообщение (50-250 символов).',
        review: 'Вот краткое содержание вашего сообщения. Готовы отправить? Напишите "да" для подтверждения или "редактировать [поле]" для изменений.',
        submitting: 'Отправка вашего сообщения...',
        success: 'Ваше сообщение успешно отправлено! Мы ответим в течение 24-48 часов.',
        error: 'Извините, произошла ошибка при отправке сообщения. Хотите попробовать снова?',
        invalidSubject: 'Я не распознал эту тему. Пожалуйста, выберите из:\n• Общий Вопрос\n• Техническая Поддержка\n• Вопрос по Оплате\n• Обратная Связь\n• Партнёрство\n• Другое',
        editField: 'Конечно, давайте обновим это. Что вы хотите изменить?',
        cancelled: 'Нет проблем! Что вы хотите отредактировать? Вы можете сказать "редактировать имя", "редактировать email", "редактировать тему" или "редактировать сообщение".',
        confirmHelp: 'Пожалуйста, напишите "да" для отправки сообщения или "редактировать [поле]" для изменений.'
      },
      placeholder: {
        default: 'Введите ваш ответ...',
        message: 'Введите ваше сообщение...'
      }
    },
    dashboard: {
      filters: {
        role: 'Фильтр по Роли',
        seniority: 'Фильтр по Уровню',
        allRoles: 'Все Роли',
        allSeniorities: 'Все Уровни'
      }
    }
  },
  'zh-CN': {
    common: {
      filters: '筛选'
    },
    contactAssistant: {
      title: '联系 Vocaid',
      button: '联系我们',
      prompts: {
        welcome: '您好！我在这里帮助您联系 Vocaid。让我们从您的姓名开始。',
        name: '您叫什么名字？',
        email: '谢谢！您的电子邮箱地址是什么？',
        subject: '您想讨论什么？请选择一个主题：\n\n• 一般咨询\n• 技术支持\n• 账单问题\n• 反馈\n• 合作机会\n• 其他',
        message: '太好了！现在，请描述您的问题或消息（50-250个字符）。',
        review: '这是您消息的摘要。准备好发送了吗？输入"是"确认或"编辑 [字段]"进行修改。',
        submitting: '正在发送您的消息...',
        success: '您的消息已成功发送！我们将在24-48小时内回复您。',
        error: '抱歉，发送消息时出错。您想再试一次吗？',
        invalidSubject: '我无法识别该主题。请从以下选项中选择：\n• 一般咨询\n• 技术支持\n• 账单问题\n• 反馈\n• 合作机会\n• 其他',
        editField: '当然，让我们更新一下。您想更改什么？',
        cancelled: '没问题！您想编辑什么？您可以说"编辑姓名"、"编辑邮箱"、"编辑主题"或"编辑消息"。',
        confirmHelp: '请输入"是"发送消息，或"编辑 [字段]"进行修改。'
      },
      placeholder: {
        default: '输入您的回复...',
        message: '输入您的消息...'
      }
    },
    dashboard: {
      filters: {
        role: '按角色筛选',
        seniority: '按级别筛选',
        allRoles: '所有角色',
        allSeniorities: '所有级别'
      }
    }
  },
  'hi-IN': {
    common: {
      filters: 'फ़िल्टर'
    },
    contactAssistant: {
      title: 'Vocaid से संपर्क करें',
      button: 'हमसे संपर्क करें',
      prompts: {
        welcome: 'नमस्ते! मैं आपको Vocaid से संपर्क करने में मदद करने के लिए यहाँ हूँ। आइए आपके नाम से शुरू करें।',
        name: 'आपका नाम क्या है?',
        email: 'धन्यवाद! आपका ईमेल पता क्या है?',
        subject: 'आप किस बारे में बात करना चाहेंगे? कृपया एक विषय चुनें:\n\n• सामान्य पूछताछ\n• तकनीकी सहायता\n• बिलिंग प्रश्न\n• फीडबैक\n• साझेदारी का अवसर\n• अन्य',
        message: 'बहुत बढ़िया! अब, अपना प्रश्न या संदेश बताएं (50-250 अक्षर)।',
        review: 'यहाँ आपके संदेश का सारांश है। भेजने के लिए तैयार हैं? पुष्टि के लिए "हाँ" टाइप करें या बदलाव के लिए "संपादित करें [फ़ील्ड]"।',
        submitting: 'आपका संदेश भेजा जा रहा है...',
        success: 'आपका संदेश सफलतापूर्वक भेजा गया! हम 24-48 घंटों के भीतर जवाब देंगे।',
        error: 'क्षमा करें, आपका संदेश भेजने में त्रुटि हुई। क्या आप फिर से प्रयास करना चाहेंगे?',
        invalidSubject: 'मैंने उस विषय को नहीं पहचाना। कृपया इनमें से चुनें:\n• सामान्य पूछताछ\n• तकनीकी सहायता\n• बिलिंग प्रश्न\n• फीडबैक\n• साझेदारी का अवसर\n• अन्य',
        editField: 'ज़रूर, आइए उसे अपडेट करें। आप क्या बदलना चाहेंगे?',
        cancelled: 'कोई बात नहीं! आप क्या संपादित करना चाहेंगे? आप "नाम संपादित करें", "ईमेल संपादित करें", "विषय संपादित करें" या "संदेश संपादित करें" कह सकते हैं।',
        confirmHelp: 'कृपया अपना संदेश भेजने के लिए "हाँ" टाइप करें, या बदलाव के लिए "संपादित करें [फ़ील्ड]"।'
      },
      placeholder: {
        default: 'अपना जवाब टाइप करें...',
        message: 'अपना संदेश टाइप करें...'
      }
    },
    dashboard: {
      filters: {
        role: 'भूमिका के अनुसार फ़िल्टर करें',
        seniority: 'स्तर के अनुसार फ़िल्टर करें',
        allRoles: 'सभी भूमिकाएं',
        allSeniorities: 'सभी स्तर'
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

// Main sync function
function syncMissingKeys() {
  console.log('🔧 Syncing missing keys to locale files...\n');

  for (const [locale, missingKeys] of Object.entries(MISSING_KEYS_TRANSLATIONS)) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      // Merge missing keys
      const merged = deepMerge(data, missingKeys);
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
      
      console.log(`✅ ${locale}: Added missing keys`);
    } catch (err) {
      console.error(`❌ ${locale}: Failed - ${err.message}`);
    }
  }

  console.log('\n✨ Sync complete! Run i18n-validate.js to verify.');
}

syncMissingKeys();
