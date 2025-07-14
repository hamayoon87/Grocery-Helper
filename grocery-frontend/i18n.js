import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import en from './locales/en';
import de from './locales/de';
import fr from './locales/fr';

const i18n = new I18n();

i18n.translations = {
  en,
  de,
  fr
};
console.log('i18n object:', i18n);

const deviceLocale = Localization.locale || 'en';  // fallback

i18n.locale = deviceLocale.split('-')[0];
i18n.fallbacks = true;

console.log('Detected locale:', i18n.locale);
console.log('i18n object:', i18n);
export default i18n;
