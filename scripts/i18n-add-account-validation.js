#!/usr/bin/env node
/**
 * Add Account page validation error translations to all locale files
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

const ACCOUNT_TRANSLATIONS = {
  'en-US': {
    validation: {
      failedToUpdateProfile: 'Failed to update profile',
      passwordsDoNotMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 8 characters',
      failedToChangePassword: 'Failed to change password',
      typeDeleteToConfirm: 'Please type DELETE to confirm',
      failedToDeleteAccount: 'Failed to delete account'
    }
  },
  'pt-BR': {
    validation: {
      failedToUpdateProfile: 'Falha ao atualizar o perfil',
      passwordsDoNotMatch: 'As senhas não coincidem',
      passwordTooShort: 'A senha deve ter pelo menos 8 caracteres',
      failedToChangePassword: 'Falha ao alterar a senha',
      typeDeleteToConfirm: 'Por favor, digite DELETE para confirmar',
      failedToDeleteAccount: 'Falha ao excluir a conta'
    }
  },
  'es-ES': {
    validation: {
      failedToUpdateProfile: 'Error al actualizar el perfil',
      passwordsDoNotMatch: 'Las contraseñas no coinciden',
      passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
      failedToChangePassword: 'Error al cambiar la contraseña',
      typeDeleteToConfirm: 'Por favor, escribe DELETE para confirmar',
      failedToDeleteAccount: 'Error al eliminar la cuenta'
    }
  },
  'fr-FR': {
    validation: {
      failedToUpdateProfile: 'Échec de la mise à jour du profil',
      passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
      passwordTooShort: 'Le mot de passe doit comporter au moins 8 caractères',
      failedToChangePassword: 'Échec du changement de mot de passe',
      typeDeleteToConfirm: 'Veuillez taper DELETE pour confirmer',
      failedToDeleteAccount: 'Échec de la suppression du compte'
    }
  },
  'ru-RU': {
    validation: {
      failedToUpdateProfile: 'Не удалось обновить профиль',
      passwordsDoNotMatch: 'Пароли не совпадают',
      passwordTooShort: 'Пароль должен содержать минимум 8 символов',
      failedToChangePassword: 'Не удалось изменить пароль',
      typeDeleteToConfirm: 'Пожалуйста, введите DELETE для подтверждения',
      failedToDeleteAccount: 'Не удалось удалить аккаунт'
    }
  },
  'zh-CN': {
    validation: {
      failedToUpdateProfile: '更新个人资料失败',
      passwordsDoNotMatch: '密码不匹配',
      passwordTooShort: '密码至少需要8个字符',
      failedToChangePassword: '修改密码失败',
      typeDeleteToConfirm: '请输入 DELETE 以确认',
      failedToDeleteAccount: '删除账户失败'
    }
  },
  'hi-IN': {
    validation: {
      failedToUpdateProfile: 'प्रोफ़ाइल अपडेट करने में विफल',
      passwordsDoNotMatch: 'पासवर्ड मेल नहीं खाते',
      passwordTooShort: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए',
      failedToChangePassword: 'पासवर्ड बदलने में विफल',
      typeDeleteToConfirm: 'कृपया पुष्टि के लिए DELETE टाइप करें',
      failedToDeleteAccount: 'खाता हटाने में विफल'
    }
  }
};

function addAccountTranslations() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const localeCode = file.replace('.json', '');
    const filePath = path.join(LOCALES_DIR, file);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Get translations for this locale (fallback to en-US)
      const translations = ACCOUNT_TRANSLATIONS[localeCode] || ACCOUNT_TRANSLATIONS['en-US'];
      
      // Ensure account object exists
      if (!content.account) {
        content.account = {};
      }
      if (!content.account.validation) {
        content.account.validation = {};
      }
      
      // Add validation keys
      Object.assign(content.account.validation, translations.validation);
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
      console.log(`✓ Updated ${file}`);
      
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
    }
  }
  
  console.log('\n✓ All locale files updated with account validation messages');
}

addAccountTranslations();
