import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BirthForm } from './BirthForm';

afterEach(cleanup);

describe('BirthForm', () => {
  it('accepts eight birth-date digits and formats them for calculation', async () => {
    const user = userEvent.setup();
    render(<BirthForm onSubmit={() => {}} />);
    const date = screen.getByLabelText('생년월일');

    expect(date).toHaveAttribute('inputmode', 'numeric');
    await user.type(date, '19900805');

    expect(date).toHaveValue('1990-08-05');
  });

  it('requires a selected city before calculation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BirthForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: '별자리 만세력 계산하기' }));
    expect(screen.getByText('출생지역을 선택해 주세요.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
