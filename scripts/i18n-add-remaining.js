#!/usr/bin/env node
/**
 * Add remaining hardcoded strings as translation keys
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const TRANSLATIONS = {
  'en-US': {
    // Credits page
    'creditsPage.dateLabels.today': 'Today',
    'creditsPage.dateLabels.yesterday': 'Yesterday',
    'creditsPage.creditsUsed': 'credit used',
    'creditsPage.creditsUsedPlural': 'credits used',
    
    // Dashboard tooltips
    'dashboard.tooltips.score': 'Score',
    'dashboard.tooltips.spent': 'Spent',
    'dashboard.charts.noScoreData': 'No score data available',
    'dashboard.charts.noSpendingData': 'No spending data available',
    'dashboard.viewInsights': 'View insights',
    'common.refreshData': 'Refresh data',
    
    // Feedback PDF
    'feedback.pdf.title': 'Interview Feedback Report',
    'feedback.pdf.candidate': 'Candidate',
    'feedback.pdf.score': 'Score',
    'feedback.noData': 'No interview data found. Please complete an interview first.',
    'feedback.retry': 'Retry',
    
    // InterviewDetails
    'interviewDetails.performanceFeedback': 'Performance Feedback',
    'interviewDetails.feedbackPending': 'Feedback is being processed...',
    'interviewDetails.noFeedback': 'No feedback available',
    'interviewDetails.completeToProceed': 'Complete the interview to see your feedback',
    'interviewDetails.interviewIssue': 'This interview may have ended early or encountered an issue.',
    'interviewDetails.loadingAnalytics': 'Loading analytics...',
    
    // ResumeLibrary errors
    'resumeLibrary.errors.invalidFileType': 'Please upload a PDF or Word document',
    'resumeLibrary.errors.fileTooLarge': 'File size must be less than 5MB',
    'resumeLibrary.errors.loadFailed': 'Failed to load resumes',
    'resumeLibrary.errors.setPrimaryFailed': 'Failed to set as primary',
    'resumeLibrary.errors.deleteFailed': 'Failed to delete resume',
    'resumeLibrary.errors.updateFailed': 'Failed to update resume',
    'resumeLibrary.errors.uploadFailed': 'Failed to upload resume',
    'resumeLibrary.errors.readFailed': 'Failed to read file',
    
    // Score display labels
    'scoreDisplay.excellent': 'Excellent',
    'scoreDisplay.good': 'Good',
    'scoreDisplay.average': 'Average',
    'scoreDisplay.needsImprovement': 'Needs Improvement'
  },
  'pt-BR': {
    'creditsPage.dateLabels.today': 'Hoje',
    'creditsPage.dateLabels.yesterday': 'Ontem',
    'creditsPage.creditsUsed': 'crédito usado',
    'creditsPage.creditsUsedPlural': 'créditos usados',
    'dashboard.tooltips.score': 'Pontuação',
    'dashboard.tooltips.spent': 'Gasto',
    'dashboard.charts.noScoreData': 'Sem dados de pontuação disponíveis',
    'dashboard.charts.noSpendingData': 'Sem dados de gastos disponíveis',
    'dashboard.viewInsights': 'Ver insights',
    'common.refreshData': 'Atualizar dados',
    'feedback.pdf.title': 'Relatório de Feedback da Entrevista',
    'feedback.pdf.candidate': 'Candidato',
    'feedback.pdf.score': 'Pontuação',
    'feedback.noData': 'Nenhum dado de entrevista encontrado. Complete uma entrevista primeiro.',
    'feedback.retry': 'Tentar novamente',
    'interviewDetails.performanceFeedback': 'Feedback de Desempenho',
    'interviewDetails.feedbackPending': 'O feedback está sendo processado...',
    'interviewDetails.noFeedback': 'Nenhum feedback disponível',
    'interviewDetails.completeToProceed': 'Complete a entrevista para ver seu feedback',
    'interviewDetails.interviewIssue': 'Esta entrevista pode ter terminado cedo ou encontrado um problema.',
    'interviewDetails.loadingAnalytics': 'Carregando análises...',
    'resumeLibrary.errors.invalidFileType': 'Por favor, envie um documento PDF ou Word',
    'resumeLibrary.errors.fileTooLarge': 'O tamanho do arquivo deve ser menor que 5MB',
    'resumeLibrary.errors.loadFailed': 'Falha ao carregar currículos',
    'resumeLibrary.errors.setPrimaryFailed': 'Falha ao definir como principal',
    'resumeLibrary.errors.deleteFailed': 'Falha ao excluir currículo',
    'resumeLibrary.errors.updateFailed': 'Falha ao atualizar currículo',
    'resumeLibrary.errors.uploadFailed': 'Falha ao enviar currículo',
    'resumeLibrary.errors.readFailed': 'Falha ao ler arquivo',
    'scoreDisplay.excellent': 'Excelente',
    'scoreDisplay.good': 'Bom',
    'scoreDisplay.average': 'Médio',
    'scoreDisplay.needsImprovement': 'Precisa Melhorar'
  },
  'es-ES': {
    'creditsPage.dateLabels.today': 'Hoy',
    'creditsPage.dateLabels.yesterday': 'Ayer',
    'creditsPage.creditsUsed': 'crédito usado',
    'creditsPage.creditsUsedPlural': 'créditos usados',
    'dashboard.tooltips.score': 'Puntuación',
    'dashboard.tooltips.spent': 'Gastado',
    'dashboard.charts.noScoreData': 'No hay datos de puntuación disponibles',
    'dashboard.charts.noSpendingData': 'No hay datos de gastos disponibles',
    'dashboard.viewInsights': 'Ver análisis',
    'common.refreshData': 'Actualizar datos',
    'feedback.pdf.title': 'Informe de Retroalimentación de Entrevista',
    'feedback.pdf.candidate': 'Candidato',
    'feedback.pdf.score': 'Puntuación',
    'feedback.noData': 'No se encontraron datos de entrevista. Complete una entrevista primero.',
    'feedback.retry': 'Reintentar',
    'interviewDetails.performanceFeedback': 'Retroalimentación de Desempeño',
    'interviewDetails.feedbackPending': 'El feedback se está procesando...',
    'interviewDetails.noFeedback': 'No hay retroalimentación disponible',
    'interviewDetails.completeToProceed': 'Completa la entrevista para ver tu retroalimentación',
    'interviewDetails.interviewIssue': 'Esta entrevista puede haber terminado temprano o encontrado un problema.',
    'interviewDetails.loadingAnalytics': 'Cargando análisis...',
    'resumeLibrary.errors.invalidFileType': 'Por favor, suba un documento PDF o Word',
    'resumeLibrary.errors.fileTooLarge': 'El tamaño del archivo debe ser menor a 5MB',
    'resumeLibrary.errors.loadFailed': 'Error al cargar currículums',
    'resumeLibrary.errors.setPrimaryFailed': 'Error al establecer como principal',
    'resumeLibrary.errors.deleteFailed': 'Error al eliminar currículum',
    'resumeLibrary.errors.updateFailed': 'Error al actualizar currículum',
    'resumeLibrary.errors.uploadFailed': 'Error al subir currículum',
    'resumeLibrary.errors.readFailed': 'Error al leer archivo',
    'scoreDisplay.excellent': 'Excelente',
    'scoreDisplay.good': 'Bueno',
    'scoreDisplay.average': 'Promedio',
    'scoreDisplay.needsImprovement': 'Necesita Mejorar'
  },
  'fr-FR': {
    'creditsPage.dateLabels.today': "Aujourd'hui",
    'creditsPage.dateLabels.yesterday': 'Hier',
    'creditsPage.creditsUsed': 'crédit utilisé',
    'creditsPage.creditsUsedPlural': 'crédits utilisés',
    'dashboard.tooltips.score': 'Score',
    'dashboard.tooltips.spent': 'Dépensé',
    'dashboard.charts.noScoreData': 'Aucune donnée de score disponible',
    'dashboard.charts.noSpendingData': 'Aucune donnée de dépenses disponible',
    'dashboard.viewInsights': 'Voir les analyses',
    'common.refreshData': 'Actualiser les données',
    'feedback.pdf.title': "Rapport de Retour d'Entretien",
    'feedback.pdf.candidate': 'Candidat',
    'feedback.pdf.score': 'Score',
    'feedback.noData': "Aucune donnée d'entretien trouvée. Veuillez d'abord compléter un entretien.",
    'feedback.retry': 'Réessayer',
    'interviewDetails.performanceFeedback': 'Retour sur la Performance',
    'interviewDetails.feedbackPending': 'Le feedback est en cours de traitement...',
    'interviewDetails.noFeedback': 'Aucun feedback disponible',
    'interviewDetails.completeToProceed': "Complétez l'entretien pour voir votre feedback",
    'interviewDetails.interviewIssue': "Cet entretien s'est peut-être terminé plus tôt ou a rencontré un problème.",
    'interviewDetails.loadingAnalytics': 'Chargement des analyses...',
    'resumeLibrary.errors.invalidFileType': 'Veuillez télécharger un document PDF ou Word',
    'resumeLibrary.errors.fileTooLarge': 'La taille du fichier doit être inférieure à 5 Mo',
    'resumeLibrary.errors.loadFailed': 'Échec du chargement des CV',
    'resumeLibrary.errors.setPrimaryFailed': 'Échec de la définition comme principal',
    'resumeLibrary.errors.deleteFailed': 'Échec de la suppression du CV',
    'resumeLibrary.errors.updateFailed': 'Échec de la mise à jour du CV',
    'resumeLibrary.errors.uploadFailed': 'Échec du téléchargement du CV',
    'resumeLibrary.errors.readFailed': 'Échec de la lecture du fichier',
    'scoreDisplay.excellent': 'Excellent',
    'scoreDisplay.good': 'Bon',
    'scoreDisplay.average': 'Moyen',
    'scoreDisplay.needsImprovement': 'À Améliorer'
  },
  'ru-RU': {
    'creditsPage.dateLabels.today': 'Сегодня',
    'creditsPage.dateLabels.yesterday': 'Вчера',
    'creditsPage.creditsUsed': 'кредит использован',
    'creditsPage.creditsUsedPlural': 'кредитов использовано',
    'dashboard.tooltips.score': 'Оценка',
    'dashboard.tooltips.spent': 'Потрачено',
    'dashboard.charts.noScoreData': 'Нет данных об оценках',
    'dashboard.charts.noSpendingData': 'Нет данных о расходах',
    'dashboard.viewInsights': 'Смотреть аналитику',
    'common.refreshData': 'Обновить данные',
    'feedback.pdf.title': 'Отчёт об Обратной Связи',
    'feedback.pdf.candidate': 'Кандидат',
    'feedback.pdf.score': 'Оценка',
    'feedback.noData': 'Данные интервью не найдены. Сначала пройдите интервью.',
    'feedback.retry': 'Повторить',
    'interviewDetails.performanceFeedback': 'Обратная Связь по Результатам',
    'interviewDetails.feedbackPending': 'Обратная связь обрабатывается...',
    'interviewDetails.noFeedback': 'Обратная связь недоступна',
    'interviewDetails.completeToProceed': 'Завершите интервью, чтобы увидеть отзыв',
    'interviewDetails.interviewIssue': 'Это интервью могло завершиться раньше или возникла проблема.',
    'interviewDetails.loadingAnalytics': 'Загрузка аналитики...',
    'resumeLibrary.errors.invalidFileType': 'Пожалуйста, загрузите PDF или Word документ',
    'resumeLibrary.errors.fileTooLarge': 'Размер файла должен быть меньше 5 МБ',
    'resumeLibrary.errors.loadFailed': 'Не удалось загрузить резюме',
    'resumeLibrary.errors.setPrimaryFailed': 'Не удалось установить как основное',
    'resumeLibrary.errors.deleteFailed': 'Не удалось удалить резюме',
    'resumeLibrary.errors.updateFailed': 'Не удалось обновить резюме',
    'resumeLibrary.errors.uploadFailed': 'Не удалось загрузить резюме',
    'resumeLibrary.errors.readFailed': 'Не удалось прочитать файл',
    'scoreDisplay.excellent': 'Отлично',
    'scoreDisplay.good': 'Хорошо',
    'scoreDisplay.average': 'Средне',
    'scoreDisplay.needsImprovement': 'Требует Улучшения'
  },
  'zh-CN': {
    'creditsPage.dateLabels.today': '今天',
    'creditsPage.dateLabels.yesterday': '昨天',
    'creditsPage.creditsUsed': '积分已使用',
    'creditsPage.creditsUsedPlural': '积分已使用',
    'dashboard.tooltips.score': '分数',
    'dashboard.tooltips.spent': '花费',
    'dashboard.charts.noScoreData': '暂无评分数据',
    'dashboard.charts.noSpendingData': '暂无消费数据',
    'dashboard.viewInsights': '查看分析',
    'common.refreshData': '刷新数据',
    'feedback.pdf.title': '面试反馈报告',
    'feedback.pdf.candidate': '候选人',
    'feedback.pdf.score': '分数',
    'feedback.noData': '未找到面试数据。请先完成一次面试。',
    'feedback.retry': '重试',
    'interviewDetails.performanceFeedback': '绩效反馈',
    'interviewDetails.feedbackPending': '反馈正在处理中...',
    'interviewDetails.noFeedback': '暂无反馈',
    'interviewDetails.completeToProceed': '完成面试以查看您的反馈',
    'interviewDetails.interviewIssue': '此面试可能提前结束或遇到问题。',
    'interviewDetails.loadingAnalytics': '正在加载分析...',
    'resumeLibrary.errors.invalidFileType': '请上传 PDF 或 Word 文档',
    'resumeLibrary.errors.fileTooLarge': '文件大小必须小于 5MB',
    'resumeLibrary.errors.loadFailed': '加载简历失败',
    'resumeLibrary.errors.setPrimaryFailed': '设置为主要失败',
    'resumeLibrary.errors.deleteFailed': '删除简历失败',
    'resumeLibrary.errors.updateFailed': '更新简历失败',
    'resumeLibrary.errors.uploadFailed': '上传简历失败',
    'resumeLibrary.errors.readFailed': '读取文件失败',
    'scoreDisplay.excellent': '优秀',
    'scoreDisplay.good': '良好',
    'scoreDisplay.average': '一般',
    'scoreDisplay.needsImprovement': '需要改进'
  },
  'hi-IN': {
    'creditsPage.dateLabels.today': 'आज',
    'creditsPage.dateLabels.yesterday': 'कल',
    'creditsPage.creditsUsed': 'क्रेडिट उपयोग किया गया',
    'creditsPage.creditsUsedPlural': 'क्रेडिट उपयोग किए गए',
    'dashboard.tooltips.score': 'स्कोर',
    'dashboard.tooltips.spent': 'खर्च',
    'dashboard.charts.noScoreData': 'कोई स्कोर डेटा उपलब्ध नहीं',
    'dashboard.charts.noSpendingData': 'कोई खर्च डेटा उपलब्ध नहीं',
    'dashboard.viewInsights': 'विश्लेषण देखें',
    'common.refreshData': 'डेटा रीफ़्रेश करें',
    'feedback.pdf.title': 'साक्षात्कार प्रतिक्रिया रिपोर्ट',
    'feedback.pdf.candidate': 'उम्मीदवार',
    'feedback.pdf.score': 'स्कोर',
    'feedback.noData': 'कोई साक्षात्कार डेटा नहीं मिला। कृपया पहले एक साक्षात्कार पूरा करें।',
    'feedback.retry': 'पुनः प्रयास करें',
    'interviewDetails.performanceFeedback': 'प्रदर्शन प्रतिक्रिया',
    'interviewDetails.feedbackPending': 'प्रतिक्रिया संसाधित हो रही है...',
    'interviewDetails.noFeedback': 'कोई प्रतिक्रिया उपलब्ध नहीं',
    'interviewDetails.completeToProceed': 'अपनी प्रतिक्रिया देखने के लिए साक्षात्कार पूरा करें',
    'interviewDetails.interviewIssue': 'यह साक्षात्कार जल्दी समाप्त हो गया होगा या कोई समस्या आई होगी।',
    'interviewDetails.loadingAnalytics': 'विश्लेषण लोड हो रहा है...',
    'resumeLibrary.errors.invalidFileType': 'कृपया PDF या Word दस्तावेज़ अपलोड करें',
    'resumeLibrary.errors.fileTooLarge': 'फ़ाइल का आकार 5MB से कम होना चाहिए',
    'resumeLibrary.errors.loadFailed': 'रिज्यूमे लोड करने में विफल',
    'resumeLibrary.errors.setPrimaryFailed': 'प्राथमिक के रूप में सेट करने में विफल',
    'resumeLibrary.errors.deleteFailed': 'रिज्यूमे हटाने में विफल',
    'resumeLibrary.errors.updateFailed': 'रिज्यूमे अपडेट करने में विफल',
    'resumeLibrary.errors.uploadFailed': 'रिज्यूमे अपलोड करने में विफल',
    'resumeLibrary.errors.readFailed': 'फ़ाइल पढ़ने में विफल',
    'scoreDisplay.excellent': 'उत्कृष्ट',
    'scoreDisplay.good': 'अच्छा',
    'scoreDisplay.average': 'औसत',
    'scoreDisplay.needsImprovement': 'सुधार की आवश्यकता'
  }
};

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

function addTranslations() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const localeCode = file.replace('.json', '');
    const filePath = path.join(LOCALES_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const trans = TRANSLATIONS[localeCode] || TRANSLATIONS['en-US'];
    let addedCount = 0;
    
    for (const [key, value] of Object.entries(trans)) {
      setNestedValue(content, key, value);
      addedCount++;
    }
    
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log(`✓ Updated ${file} (+${addedCount} keys)`);
  }
  console.log('\nDone!');
}

addTranslations();
