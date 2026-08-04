import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { I18nProvider } from '../i18n/I18nProvider';
import type { Locale } from '../i18n/types';

export function renderWithI18n(ui: ReactElement, locale: Locale = 'ko') {
  return render(<I18nProvider initialLocale={locale}>{ui}</I18nProvider>);
}
