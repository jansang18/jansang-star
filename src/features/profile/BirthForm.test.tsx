import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BirthForm } from './BirthForm';

describe('BirthForm', () => {
  it('requires a selected city before calculation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BirthForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: '별자리 만세력 계산하기' }));
    expect(screen.getByText('출생지역을 선택해 주세요.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
