#!/usr/bin/env node
/**
 * Add interviewSetup validation error translations to all locale files
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const VALIDATION_TRANSLATIONS = {
  'en-US': {
    invalidFileType: 'Please upload a PDF or Word document',
    fileTooLarge: 'File size must be less than 5MB',
    fileReadError: 'Failed to read file. Please try again.',
    firstNameRequired: 'Please set your first name in your profile',
    lastNameRequired: 'Please set your last name in your profile',
    companyNameRequired: 'Company name is required',
    jobTitleRequired: 'Job title is required',
    seniorityRequired: 'Please select your seniority level',
    jobDescriptionRequired: 'Job description is required',
    jobDescriptionTooShort: 'Job description must be at least 200 characters (current: {{count}})',
    resumeRequired: 'Resume is required',
    resumeSelectFromLibrary: 'Please select a resume from your library',
    resumeLoadFailed: 'Failed to load resume. Please try again.',
    policyRequired: 'You must accept the privacy policy and terms of use',
    creditsLoading: 'Please wait while credits are loading...'
  },
  'pt-BR': {
    invalidFileType: 'Por favor, envie um documento PDF ou Word',
    fileTooLarge: 'O arquivo deve ter menos de 5MB',
    fileReadError: 'Falha ao ler o arquivo. Por favor, tente novamente.',
    firstNameRequired: 'Por favor, defina seu primeiro nome no seu perfil',
    lastNameRequired: 'Por favor, defina seu sobrenome no seu perfil',
    companyNameRequired: 'Nome da empresa é obrigatório',
    jobTitleRequired: 'Cargo é obrigatório',
    seniorityRequired: 'Por favor, selecione seu nível de senioridade',
    jobDescriptionRequired: 'Descrição da vaga é obrigatória',
    jobDescriptionTooShort: 'A descrição da vaga deve ter pelo menos 200 caracteres (atual: {{count}})',
    resumeRequired: 'Currículo é obrigatório',
    resumeSelectFromLibrary: 'Por favor, selecione um currículo da sua biblioteca',
    resumeLoadFailed: 'Falha ao carregar currículo. Por favor, tente novamente.',
    policyRequired: 'Você deve aceitar a política de privacidade e os termos de uso',
    creditsLoading: 'Por favor, aguarde enquanto os créditos são carregados...'
  },
  'es-ES': {
    invalidFileType: 'Por favor, sube un documento PDF o Word',
    fileTooLarge: 'El archivo debe tener menos de 5MB',
    fileReadError: 'Error al leer el archivo. Por favor, inténtalo de nuevo.',
    firstNameRequired: 'Por favor, establece tu nombre en tu perfil',
    lastNameRequired: 'Por favor, establece tu apellido en tu perfil',
    companyNameRequired: 'El nombre de la empresa es obligatorio',
    jobTitleRequired: 'El cargo es obligatorio',
    seniorityRequired: 'Por favor, selecciona tu nivel de experiencia',
    jobDescriptionRequired: 'La descripción del puesto es obligatoria',
    jobDescriptionTooShort: 'La descripción del puesto debe tener al menos 200 caracteres (actual: {{count}})',
    resumeRequired: 'El currículum es obligatorio',
    resumeSelectFromLibrary: 'Por favor, selecciona un currículum de tu biblioteca',
    resumeLoadFailed: 'Error al cargar el currículum. Por favor, inténtalo de nuevo.',
    policyRequired: 'Debes aceptar la política de privacidad y los términos de uso',
    creditsLoading: 'Por favor, espera mientras se cargan los créditos...'
  },
  'fr-FR': {
    invalidFileType: 'Veuillez télécharger un document PDF ou Word',
    fileTooLarge: 'Le fichier doit faire moins de 5 Mo',
    fileReadError: 'Échec de la lecture du fichier. Veuillez réessayer.',
    firstNameRequired: 'Veuillez définir votre prénom dans votre profil',
    lastNameRequired: 'Veuillez définir votre nom dans votre profil',
    companyNameRequired: 'Le nom de l\'entreprise est obligatoire',
    jobTitleRequired: 'Le titre du poste est obligatoire',
    seniorityRequired: 'Veuillez sélectionner votre niveau d\'expérience',
    jobDescriptionRequired: 'La description du poste est obligatoire',
    jobDescriptionTooShort: 'La description du poste doit comporter au moins 200 caractères (actuel : {{count}})',
    resumeRequired: 'Le CV est obligatoire',
    resumeSelectFromLibrary: 'Veuillez sélectionner un CV de votre bibliothèque',
    resumeLoadFailed: 'Échec du chargement du CV. Veuillez réessayer.',
    policyRequired: 'Vous devez accepter la politique de confidentialité et les conditions d\'utilisation',
    creditsLoading: 'Veuillez patienter pendant le chargement des crédits...'
  },
  'ru-RU': {
    invalidFileType: 'Пожалуйста, загрузите PDF или Word документ',
    fileTooLarge: 'Размер файла должен быть менее 5 МБ',
    fileReadError: 'Не удалось прочитать файл. Пожалуйста, попробуйте снова.',
    firstNameRequired: 'Пожалуйста, укажите имя в вашем профиле',
    lastNameRequired: 'Пожалуйста, укажите фамилию в вашем профиле',
    companyNameRequired: 'Название компании обязательно',
    jobTitleRequired: 'Должность обязательна',
    seniorityRequired: 'Пожалуйста, выберите уровень должности',
    jobDescriptionRequired: 'Описание вакансии обязательно',
    jobDescriptionTooShort: 'Описание вакансии должно содержать минимум 200 символов (сейчас: {{count}})',
    resumeRequired: 'Резюме обязательно',
    resumeSelectFromLibrary: 'Пожалуйста, выберите резюме из библиотеки',
    resumeLoadFailed: 'Не удалось загрузить резюме. Пожалуйста, попробуйте снова.',
    policyRequired: 'Вы должны принять политику конфиденциальности и условия использования',
    creditsLoading: 'Пожалуйста, подождите, пока загружаются кредиты...'
  },
  'zh-CN': {
    invalidFileType: '请上传 PDF 或 Word 文档',
    fileTooLarge: '文件大小必须小于 5MB',
    fileReadError: '读取文件失败，请重试。',
    firstNameRequired: '请在您的个人资料中设置名字',
    lastNameRequired: '请在您的个人资料中设置姓氏',
    companyNameRequired: '公司名称为必填项',
    jobTitleRequired: '职位名称为必填项',
    seniorityRequired: '请选择您的资历级别',
    jobDescriptionRequired: '职位描述为必填项',
    jobDescriptionTooShort: '职位描述至少需要 200 个字符（当前：{{count}}）',
    resumeRequired: '简历为必填项',
    resumeSelectFromLibrary: '请从您的简历库中选择',
    resumeLoadFailed: '加载简历失败，请重试。',
    policyRequired: '您必须接受隐私政策和使用条款',
    creditsLoading: '请稍候，正在加载积分...'
  },
  'hi-IN': {
    invalidFileType: 'कृपया PDF या Word दस्तावेज़ अपलोड करें',
    fileTooLarge: 'फ़ाइल का आकार 5MB से कम होना चाहिए',
    fileReadError: 'फ़ाइल पढ़ने में विफल। कृपया पुनः प्रयास करें।',
    firstNameRequired: 'कृपया अपनी प्रोफ़ाइल में अपना पहला नाम सेट करें',
    lastNameRequired: 'कृपया अपनी प्रोफ़ाइल में अपना अंतिम नाम सेट करें',
    companyNameRequired: 'कंपनी का नाम आवश्यक है',
    jobTitleRequired: 'पद का नाम आवश्यक है',
    seniorityRequired: 'कृपया अपना वरिष्ठता स्तर चुनें',
    jobDescriptionRequired: 'नौकरी का विवरण आवश्यक है',
    jobDescriptionTooShort: 'नौकरी का विवरण कम से कम 200 अक्षरों का होना चाहिए (वर्तमान: {{count}})',
    resumeRequired: 'रेज़्यूमे आवश्यक है',
    resumeSelectFromLibrary: 'कृपया अपनी लाइब्रेरी से एक रेज़्यूमे चुनें',
    resumeLoadFailed: 'रेज़्यूमे लोड करने में विफल। कृपया पुनः प्रयास करें।',
    policyRequired: 'आपको गोपनीयता नीति और उपयोग की शर्तों को स्वीकार करना होगा',
    creditsLoading: 'कृपया प्रतीक्षा करें, क्रेडिट लोड हो रहे हैं...'
  }
};

function addValidationTranslations() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const localeCode = file.replace('.json', '');
    const filePath = path.join(LOCALES_DIR, file);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Get translations for this locale (fallback to en-US)
      const translations = VALIDATION_TRANSLATIONS[localeCode] || VALIDATION_TRANSLATIONS['en-US'];
      
      // Ensure interviewSetup.validation object exists
      if (!content.interviewSetup) {
        content.interviewSetup = {};
      }
      if (!content.interviewSetup.validation) {
        content.interviewSetup.validation = {};
      }
      
      // Add validation keys
      Object.assign(content.interviewSetup.validation, translations);
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
      console.log(`✓ Updated ${file}`);
      
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
    }
  }
  
  console.log('\n✓ All locale files updated with interviewSetup validation messages');
}

addValidationTranslations();
