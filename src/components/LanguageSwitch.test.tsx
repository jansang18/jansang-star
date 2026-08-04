import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '../i18n/I18nProvider';
import { LanguageSwitch } from './LanguageSwitch';

describe('LanguageSwitch', () => {
  it('exposes two pressed states and changes locale', async () => {
    const user = userEvent.setup();
    render(<I18nProvider initialLocale="ko"><LanguageSwitch /></I18nProvider>);

    const group = screen.getByRole('group', { name: '표시 언어' });
    expect(within(group).getByRole('button', { name: '한국어' })).toHaveTextContent('한');
    expect(within(group).getByRole('button', { name: '한국어' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'English' })).toHaveTextContent('EN');

    await user.click(within(group).getByRole('button', { name: 'English' }));

    expect(screen.getByRole('group', { name: 'Display language' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
  });
});
