import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('shows the approved brand and birth chart call to action', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '잔상 별자리' })).toBeInTheDocument();
    expect(screen.getByText('태어난 순간의 별빛은 오늘도 잔상을 남깁니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '나의 별자리 만세력 보기' })).toBeInTheDocument();
  });
});
