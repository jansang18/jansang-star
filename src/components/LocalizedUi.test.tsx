import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithI18n } from '../test/renderWithI18n';
import { AppError } from './AppError';
import { EphemerisLoader } from './EphemerisLoader';
import { LegalNotice } from './LegalNotice';

describe('localized shared UI', () => {
  it('shows safe English calculation-error copy without an exception message', () => {
    renderWithI18n(<AppError error="calculation" onClose={vi.fn()} />, 'en');

    expect(screen.getByRole('alert')).toHaveTextContent('We could not calculate the sky positions');
    expect(screen.getByRole('alert')).toHaveTextContent('Please check your birth information and try again.');
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('localizes loading and legal guidance in English', () => {
    renderWithI18n(<><EphemerisLoader /><LegalNotice /></>, 'en');

    expect(screen.getByRole('status')).toHaveTextContent('Calculating the sky at the moment you were born');
    expect(screen.getByText(/self-reflection and entertainment/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'License information' })).toBeInTheDocument();
  });
});
