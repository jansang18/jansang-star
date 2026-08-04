import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from './App';
import { renderWithI18n } from './test/renderWithI18n';

describe('App', () => {
  it('shows the approved brand and birth chart call to action', () => {
    renderWithI18n(<App />);
    expect(screen.getByRole('heading', { name: '잔상 별자리' })).toBeInTheDocument();
    expect(screen.getByText('태어난 순간의 별빛은 오늘도 잔상을 남깁니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '나의 별자리 만세력 보기' })).toBeInTheDocument();
  });

  it('switches the landing and form language without clearing entered values', async () => {
    const user = userEvent.setup();
    const { container } = renderWithI18n(<App />);
    const page = within(container);

    await user.click(page.getByRole('button', { name: 'English' }));
    expect(page.getByRole('heading', { name: 'Jansang Star' })).toBeInTheDocument();
    await user.click(page.getByRole('button', { name: 'Read my cosmic almanac' }));
    const name = page.getByLabelText('Name or nickname');
    const date = page.getByLabelText('Date of birth');
    await user.type(name, 'Mina');
    await user.type(date, '19900805');

    await user.click(page.getByRole('button', { name: '한국어' }));

    expect(page.getByLabelText('이름 또는 별칭')).toHaveValue('Mina');
    expect(page.getByLabelText('생년월일')).toHaveValue('1990-08-05');
  });
});
