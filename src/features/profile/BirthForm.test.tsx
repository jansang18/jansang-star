import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider, useI18n } from '../../i18n/I18nProvider';
import { LanguageSwitch } from '../../components/LanguageSwitch';
import { BirthForm } from './BirthForm';

afterEach(cleanup);

function LocaleProbeButton() {
  const { setLocale } = useI18n();
  return <button type="button" onClick={() => setLocale('en')}>English</button>;
}

function renderForm(onSubmit = () => {}) {
  return render(<I18nProvider initialLocale="ko"><BirthForm onSubmit={onSubmit} /></I18nProvider>);
}

describe('BirthForm', () => {
  it('accepts eight birth-date digits and formats them for calculation', async () => {
    const user = userEvent.setup();
    renderForm();
    const date = screen.getByLabelText('생년월일');

    expect(date).toHaveAttribute('inputmode', 'numeric');
    await user.type(date, '19900805');

    expect(date).toHaveValue('1990-08-05');
  });

  it('requires a selected city before calculation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm(onSubmit);
    await user.click(screen.getByRole('button', { name: '별자리 만세력 계산하기' }));
    expect(screen.getByText('출생지역을 선택해 주세요.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps typed values while switching the form to English', async () => {
    const user = userEvent.setup();
    render(<I18nProvider initialLocale="ko"><LocaleProbeButton /><BirthForm onSubmit={() => {}} /></I18nProvider>);
    await user.type(screen.getByLabelText('이름 또는 별칭'), '민아');
    await user.type(screen.getByLabelText('생년월일'), '19900805');
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByLabelText('Name or nickname')).toHaveValue('민아');
    expect(screen.getByLabelText('Date of birth')).toHaveValue('1990-08-05');
  });

  it('reaches both locale buttons by Tab and activates them with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<I18nProvider initialLocale="ko"><LanguageSwitch /><BirthForm onSubmit={() => {}} /></I18nProvider>);

    await user.tab();
    const initialKorean = screen.getByRole('button', { name: '한국어' });
    const initialEnglish = screen.getByRole('button', { name: 'English' });
    expect(initialKorean).toHaveFocus();
    expect(initialKorean).toHaveAttribute('aria-pressed', 'true');
    expect(initialEnglish).toHaveAttribute('aria-pressed', 'false');

    await user.tab();
    const english = screen.getByRole('button', { name: 'English' });
    expect(english).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(english).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '한국어' })).toHaveAttribute('aria-pressed', 'false');

    await user.tab({ shift: true });
    const korean = screen.getByRole('button', { name: '한국어' });
    expect(korean).toHaveFocus();
    await user.keyboard(' ');
    expect(korean).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('finds a city by its English name', async () => {
    const user = userEvent.setup();
    renderForm();
    const city = screen.getByRole('combobox', { name: '출생지역' });
    await user.type(city, 'Seoul');
    expect(screen.getByRole('option', { name: /Seoul/ })).toBeInTheDocument();
  });

  it('links the combobox to its active option and commits that option with ArrowDown and Enter', async () => {
    const user = userEvent.setup();
    renderForm();
    const city = screen.getByRole('combobox', { name: '출생지역' });

    await user.click(city);
    const listbox = screen.getByRole('listbox');
    expect(city).toHaveAttribute('aria-controls', listbox.id);

    await user.keyboard('{ArrowDown}');
    const activeDescendant = city.getAttribute('aria-activedescendant');
    expect(activeDescendant).toBeTruthy();
    if (!activeDescendant) throw new Error('The active city option must have an ID');
    const activeOption = document.getElementById(activeDescendant);
    expect(activeOption).toHaveAttribute('role', 'option');
    expect(activeOption).toHaveTextContent('서울');

    await user.keyboard('{Enter}');
    expect(city).toHaveValue('서울');
    expect(city).toHaveAttribute('aria-expanded', 'false');
    expect(city).not.toHaveAttribute('aria-activedescendant');
  });

  it('clears a stale committed city after query edits and submits only the newly chosen city facts', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm(onSubmit);
    await user.type(screen.getByLabelText('이름 또는 별칭'), '민아');
    await user.type(screen.getByLabelText('생년월일'), '19900805');
    const city = screen.getByRole('combobox', { name: '출생지역' });

    await user.type(city, '서울');
    await user.click(screen.getByRole('option', { name: /서울/ }));
    await user.clear(city);
    await user.type(city, 'Tokyo');
    await user.click(screen.getByRole('button', { name: '별자리 만세력 계산하기' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('출생지역을 선택해 주세요.')).toBeInTheDocument();

    await user.click(city);
    await user.click(screen.getByRole('option', { name: /Tokyo/ }));
    await user.click(screen.getByRole('button', { name: '별자리 만세력 계산하기' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      cityId: 'tokyo',
      latitude: 35.6762,
      longitude: 139.6503,
      timeZone: 'Asia/Tokyo',
    }));
  });

  it('localizes an unchanged committed city without clearing its submitted facts', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<I18nProvider initialLocale="ko"><LocaleProbeButton /><BirthForm onSubmit={onSubmit} /></I18nProvider>);
    await user.type(screen.getByLabelText('이름 또는 별칭'), '민아');
    await user.type(screen.getByLabelText('생년월일'), '19900805');
    const city = screen.getByRole('combobox', { name: '출생지역' });
    await user.type(city, '서울');
    await user.click(screen.getByRole('option', { name: /서울/ }));

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('combobox', { name: 'Birth city' })).toHaveValue('Seoul');
    await user.click(screen.getByRole('button', { name: 'Calculate my natal chart' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      cityId: 'seoul',
      latitude: 37.5665,
      longitude: 126.978,
      timeZone: 'Asia/Seoul',
    }));
  });

  it('preserves edited city search text while switching locale', async () => {
    const user = userEvent.setup();
    render(<I18nProvider initialLocale="ko"><LocaleProbeButton /><BirthForm onSubmit={() => {}} /></I18nProvider>);
    const city = screen.getByRole('combobox', { name: '출생지역' });
    await user.type(city, '서울');
    await user.click(screen.getByRole('option', { name: /서울/ }));
    await user.clear(city);
    await user.type(city, 'Tokyo');
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('combobox', { name: 'Birth city' })).toHaveValue('Tokyo');
  });
});
