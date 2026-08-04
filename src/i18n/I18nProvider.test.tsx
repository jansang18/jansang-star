import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import { I18nProvider, useI18n } from './I18nProvider';

function Probe() {
  const { locale, setLocale, t } = useI18n();

  return <><span>{locale}:{t('brand.name')}</span><button onClick={() => setLocale('en')}>switch</button></>;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = '';
});

it('persists a manual choice and updates the document language', async () => {
  const user = userEvent.setup();
  render(<I18nProvider initialLocale="ko"><Probe /></I18nProvider>);

  await user.click(screen.getByRole('button', { name: 'switch' }));

  expect(screen.getByText('en:Jansang Star')).toBeInTheDocument();
  expect(localStorage.getItem('jansang-language')).toBe('en');
  expect(document.documentElement.lang).toBe('en');
});
