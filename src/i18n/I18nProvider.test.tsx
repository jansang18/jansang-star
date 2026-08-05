import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { I18nProvider, useI18n } from './I18nProvider';

function Probe() {
  const { locale, setLocale, t } = useI18n();

  return <><span>{locale}:{t('brand.name')}</span><button onClick={() => setLocale('en')}>switch</button></>;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = '';
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('persists a manual choice and updates the document language', async () => {
  const user = userEvent.setup();
  render(<I18nProvider initialLocale="ko"><Probe /></I18nProvider>);

  await user.click(screen.getByRole('button', { name: 'switch' }));

  expect(screen.getByText('en:Jansang Star')).toBeInTheDocument();
  expect(localStorage.getItem('jansang-language')).toBe('en');
  expect(document.documentElement.lang).toBe('en');
});

it('falls back to browser detection when reading locale storage throws', () => {
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['ko-KR']);
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('ko-KR');
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('Storage is unavailable', 'SecurityError');
  });

  render(<I18nProvider><Probe /></I18nProvider>);

  expect(screen.getByText('ko:잔상 별자리')).toBeInTheDocument();
  expect(document.documentElement.lang).toBe('ko');
});

it('keeps in-memory locale switching and document language when storage writes throw', async () => {
  const user = userEvent.setup();
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage is full', 'QuotaExceededError');
  });

  render(<I18nProvider initialLocale="ko"><Probe /></I18nProvider>);
  await user.click(screen.getByRole('button', { name: 'switch' }));

  expect(screen.getByText('en:Jansang Star')).toBeInTheDocument();
  expect(document.documentElement.lang).toBe('en');
});
