import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('full app flow', () => {
  beforeEach(() => { localStorage.clear(); vi.stubGlobal('scrollTo', vi.fn()); });

  it('calculates a profile and returns to edit mode', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '나의 별자리 만세력 보기' }));
    await user.type(screen.getByLabelText('이름 또는 별칭'), '김별');
    await user.type(screen.getByLabelText('생년월일'), '1990-08-05');
    await user.clear(screen.getByLabelText('출생시간'));
    await user.type(screen.getByLabelText('출생시간'), '14:30');
    await user.type(screen.getByRole('combobox', { name: '출생지역' }), '서울');
    await user.click(screen.getByRole('option', { name: /서울/ }));
    await user.click(screen.getByRole('button', { name: /별자리 만세력 계산하기/ }));
    expect(await screen.findByRole('heading', { name: /김별님의.*코스믹 리포트/ }, { timeout: 30_000 })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: '출생정보 수정' })[0]);
    expect(screen.getByLabelText('생년월일')).toHaveValue('1990-08-05');
  }, 40_000);
});
