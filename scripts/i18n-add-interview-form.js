#!/usr/bin/env node
/**
 * Add missing interviewSetup.form translations to all locale files
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const INTERVIEW_SETUP_TRANSLATIONS = {
  'en-US': {
    titleHighlight: 'Interview',
    interviewingAs: 'Interviewing as',
    loadingCredits: 'Loading credits...',
    startInterview: 'Start Interview',
    helpText: 'Your interview will be recorded and analyzed by AI to provide personalized feedback.',
    form: {
      companyName: 'Company Name',
      companyNamePlaceholder: 'Enter company name...',
      jobTitle: 'Job Title',
      jobTitlePlaceholder: 'Enter job title...',
      seniority: 'Seniority Level',
      seniorityPlaceholder: 'Select seniority level',
      seniorityLevels: {
        intern: 'Intern',
        junior: 'Junior',
        mid: 'Mid-Level',
        senior: 'Senior',
        staff: 'Staff / Lead',
        principal: 'Principal / Director'
      },
      jobDescription: 'Job Description',
      jobDescriptionPlaceholder: 'Paste the job description here...',
      charactersMinimum: 'characters minimum',
      resume: 'Resume',
      fromLibrary: 'From Library',
      uploadNew: 'Upload New',
      uploadResume: 'Upload resume (PDF or Word)',
      acceptPolicy: 'I accept the',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use'
    }
  },
  'pt-BR': {
    titleHighlight: 'Entrevista',
    interviewingAs: 'Entrevistando como',
    loadingCredits: 'Carregando créditos...',
    startInterview: 'Iniciar Entrevista',
    helpText: 'Sua entrevista será gravada e analisada por IA para fornecer feedback personalizado.',
    form: {
      companyName: 'Nome da Empresa',
      companyNamePlaceholder: 'Digite o nome da empresa...',
      jobTitle: 'Cargo',
      jobTitlePlaceholder: 'Digite o cargo...',
      seniority: 'Nível de Senioridade',
      seniorityPlaceholder: 'Selecione o nível de senioridade',
      seniorityLevels: {
        intern: 'Estagiário',
        junior: 'Júnior',
        mid: 'Pleno',
        senior: 'Sênior',
        staff: 'Staff / Líder',
        principal: 'Principal / Diretor'
      },
      jobDescription: 'Descrição da Vaga',
      jobDescriptionPlaceholder: 'Cole a descrição da vaga aqui...',
      charactersMinimum: 'caracteres mínimos',
      resume: 'Currículo',
      fromLibrary: 'Da Biblioteca',
      uploadNew: 'Enviar Novo',
      uploadResume: 'Enviar currículo (PDF ou Word)',
      acceptPolicy: 'Eu aceito a',
      privacyPolicy: 'Política de Privacidade',
      termsOfUse: 'Termos de Uso'
    }
  },
  'es-ES': {
    titleHighlight: 'Entrevista',
    interviewingAs: 'Entrevistando como',
    loadingCredits: 'Cargando créditos...',
    startInterview: 'Iniciar Entrevista',
    helpText: 'Tu entrevista será grabada y analizada por IA para proporcionar retroalimentación personalizada.',
    form: {
      companyName: 'Nombre de la Empresa',
      companyNamePlaceholder: 'Ingrese el nombre de la empresa...',
      jobTitle: 'Título del Puesto',
      jobTitlePlaceholder: 'Ingrese el título del puesto...',
      seniority: 'Nivel de Experiencia',
      seniorityPlaceholder: 'Seleccione el nivel de experiencia',
      seniorityLevels: {
        intern: 'Pasante',
        junior: 'Junior',
        mid: 'Nivel Medio',
        senior: 'Senior',
        staff: 'Staff / Líder',
        principal: 'Principal / Director'
      },
      jobDescription: 'Descripción del Puesto',
      jobDescriptionPlaceholder: 'Pegue la descripción del puesto aquí...',
      charactersMinimum: 'caracteres mínimos',
      resume: 'Currículum',
      fromLibrary: 'De la Biblioteca',
      uploadNew: 'Subir Nuevo',
      uploadResume: 'Subir currículum (PDF o Word)',
      acceptPolicy: 'Acepto la',
      privacyPolicy: 'Política de Privacidad',
      termsOfUse: 'Términos de Uso'
    }
  },
  'fr-FR': {
    titleHighlight: 'Entretien',
    interviewingAs: 'Entretien en tant que',
    loadingCredits: 'Chargement des crédits...',
    startInterview: 'Démarrer l\'Entretien',
    helpText: 'Votre entretien sera enregistré et analysé par l\'IA pour fournir un retour personnalisé.',
    form: {
      companyName: 'Nom de l\'Entreprise',
      companyNamePlaceholder: 'Entrez le nom de l\'entreprise...',
      jobTitle: 'Titre du Poste',
      jobTitlePlaceholder: 'Entrez le titre du poste...',
      seniority: 'Niveau d\'Expérience',
      seniorityPlaceholder: 'Sélectionnez le niveau d\'expérience',
      seniorityLevels: {
        intern: 'Stagiaire',
        junior: 'Junior',
        mid: 'Intermédiaire',
        senior: 'Senior',
        staff: 'Staff / Lead',
        principal: 'Principal / Directeur'
      },
      jobDescription: 'Description du Poste',
      jobDescriptionPlaceholder: 'Collez la description du poste ici...',
      charactersMinimum: 'caractères minimum',
      resume: 'CV',
      fromLibrary: 'De la Bibliothèque',
      uploadNew: 'Télécharger Nouveau',
      uploadResume: 'Télécharger un CV (PDF ou Word)',
      acceptPolicy: 'J\'accepte la',
      privacyPolicy: 'Politique de Confidentialité',
      termsOfUse: 'Conditions d\'Utilisation'
    }
  },
  'ru-RU': {
    titleHighlight: 'Собеседование',
    interviewingAs: 'Собеседование как',
    loadingCredits: 'Загрузка кредитов...',
    startInterview: 'Начать Собеседование',
    helpText: 'Ваше собеседование будет записано и проанализировано ИИ для предоставления персонализированной обратной связи.',
    form: {
      companyName: 'Название Компании',
      companyNamePlaceholder: 'Введите название компании...',
      jobTitle: 'Должность',
      jobTitlePlaceholder: 'Введите должность...',
      seniority: 'Уровень Должности',
      seniorityPlaceholder: 'Выберите уровень должности',
      seniorityLevels: {
        intern: 'Стажёр',
        junior: 'Младший специалист',
        mid: 'Средний специалист',
        senior: 'Старший специалист',
        staff: 'Ведущий специалист',
        principal: 'Главный / Директор'
      },
      jobDescription: 'Описание Вакансии',
      jobDescriptionPlaceholder: 'Вставьте описание вакансии здесь...',
      charactersMinimum: 'символов минимум',
      resume: 'Резюме',
      fromLibrary: 'Из Библиотеки',
      uploadNew: 'Загрузить Новое',
      uploadResume: 'Загрузить резюме (PDF или Word)',
      acceptPolicy: 'Я принимаю',
      privacyPolicy: 'Политику Конфиденциальности',
      termsOfUse: 'Условия Использования'
    }
  },
  'zh-CN': {
    titleHighlight: '面试',
    interviewingAs: '面试身份',
    loadingCredits: '正在加载积分...',
    startInterview: '开始面试',
    helpText: '您的面试将被录制并由AI分析，以提供个性化反馈。',
    form: {
      companyName: '公司名称',
      companyNamePlaceholder: '输入公司名称...',
      jobTitle: '职位名称',
      jobTitlePlaceholder: '输入职位名称...',
      seniority: '资历级别',
      seniorityPlaceholder: '选择资历级别',
      seniorityLevels: {
        intern: '实习生',
        junior: '初级',
        mid: '中级',
        senior: '高级',
        staff: '主管 / 负责人',
        principal: '首席 / 总监'
      },
      jobDescription: '职位描述',
      jobDescriptionPlaceholder: '在此粘贴职位描述...',
      charactersMinimum: '最少字符数',
      resume: '简历',
      fromLibrary: '从库中选择',
      uploadNew: '上传新文件',
      uploadResume: '上传简历（PDF或Word）',
      acceptPolicy: '我接受',
      privacyPolicy: '隐私政策',
      termsOfUse: '使用条款'
    }
  },
  'hi-IN': {
    titleHighlight: 'साक्षात्कार',
    interviewingAs: 'साक्षात्कार के रूप में',
    loadingCredits: 'क्रेडिट लोड हो रहे हैं...',
    startInterview: 'साक्षात्कार शुरू करें',
    helpText: 'आपका साक्षात्कार रिकॉर्ड किया जाएगा और AI द्वारा व्यक्तिगत प्रतिक्रिया प्रदान करने के लिए विश्लेषण किया जाएगा।',
    form: {
      companyName: 'कंपनी का नाम',
      companyNamePlaceholder: 'कंपनी का नाम दर्ज करें...',
      jobTitle: 'पद का नाम',
      jobTitlePlaceholder: 'पद का नाम दर्ज करें...',
      seniority: 'वरिष्ठता स्तर',
      seniorityPlaceholder: 'वरिष्ठता स्तर चुनें',
      seniorityLevels: {
        intern: 'इंटर्न',
        junior: 'जूनियर',
        mid: 'मध्य-स्तर',
        senior: 'सीनियर',
        staff: 'स्टाफ / लीड',
        principal: 'प्रिंसिपल / डायरेक्टर'
      },
      jobDescription: 'नौकरी का विवरण',
      jobDescriptionPlaceholder: 'यहां नौकरी का विवरण पेस्ट करें...',
      charactersMinimum: 'न्यूनतम अक्षर',
      resume: 'रेज़्यूमे',
      fromLibrary: 'लाइब्रेरी से',
      uploadNew: 'नया अपलोड करें',
      uploadResume: 'रेज़्यूमे अपलोड करें (PDF या Word)',
      acceptPolicy: 'मैं स्वीकार करता/करती हूं',
      privacyPolicy: 'गोपनीयता नीति',
      termsOfUse: 'उपयोग की शर्तें'
    }
  }
};

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function addInterviewSetupFormTranslations() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const localeCode = file.replace('.json', '');
    const filePath = path.join(LOCALES_DIR, file);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Get translations for this locale (fallback to en-US)
      const translations = INTERVIEW_SETUP_TRANSLATIONS[localeCode] || INTERVIEW_SETUP_TRANSLATIONS['en-US'];
      
      // Ensure interviewSetup object exists
      if (!content.interviewSetup) {
        content.interviewSetup = {};
      }
      
      // Merge the new translations
      deepMerge(content.interviewSetup, translations);
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
      console.log(`✓ Updated ${file}`);
      
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
    }
  }
  
  console.log('\n✓ All locale files updated with interviewSetup.form translations');
}

addInterviewSetupFormTranslations();
