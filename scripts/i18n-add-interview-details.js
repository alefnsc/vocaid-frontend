#!/usr/bin/env node
/**
 * Add interviewDetails feedback pending translations
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const TRANSLATIONS = {
  'en-US': {
    'interviewDetails.feedbackPending': 'Feedback will be available once the interview is completed.',
    'interviewDetails.completeToProceed': 'Please complete your interview session to receive AI-generated feedback.'
  },
  'pt-BR': {
    'interviewDetails.feedbackPending': 'O feedback estará disponível quando a entrevista for concluída.',
    'interviewDetails.completeToProceed': 'Complete sua sessão de entrevista para receber feedback gerado por IA.'
  },
  'es-ES': {
    'interviewDetails.feedbackPending': 'El feedback estará disponible una vez completada la entrevista.',
    'interviewDetails.completeToProceed': 'Complete su sesión de entrevista para recibir comentarios generados por IA.'
  },
  'fr-FR': {
    'interviewDetails.feedbackPending': "Le feedback sera disponible une fois l'entretien terminé.",
    'interviewDetails.completeToProceed': 'Veuillez compléter votre entretien pour recevoir un feedback généré par IA.'
  },
  'ru-RU': {
    'interviewDetails.feedbackPending': 'Обратная связь будет доступна после завершения интервью.',
    'interviewDetails.completeToProceed': 'Пожалуйста, завершите интервью, чтобы получить отзыв, созданный ИИ.'
  },
  'zh-CN': {
    'interviewDetails.feedbackPending': '面试完成后将提供反馈。',
    'interviewDetails.completeToProceed': '请完成面试以接收AI生成的反馈。'
  },
  'hi-IN': {
    'interviewDetails.feedbackPending': 'साक्षात्कार पूरा होने पर प्रतिक्रिया उपलब्ध होगी।',
    'interviewDetails.completeToProceed': 'AI-जनित प्रतिक्रिया प्राप्त करने के लिए कृपया अपना साक्षात्कार सत्र पूरा करें।'
  }
};

function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const localeCode = file.replace('.json', '');
  const filePath = path.join(LOCALES_DIR, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const trans = TRANSLATIONS[localeCode] || TRANSLATIONS['en-US'];
  
  for (const [key, value] of Object.entries(trans)) {
    setNestedValue(content, key, value);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  console.log('✓ Updated', file);
}
console.log('Done!');
