import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider, useI18n } from '../../i18n/I18nProvider';
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

  it('finds a city by its English name', async () => {
    const user = userEvent.setup();
    renderForm();
    const city = screen.getByRole('combobox', { name: '출생지역' });
    await user.type(city, 'Seoul');
    expect(screen.getByRole('option', { name: /Seoul/ })).toBeInTheDocument();
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
