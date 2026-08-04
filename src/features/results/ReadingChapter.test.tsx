import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReadingChapter } from './ReadingChapter';

describe('ReadingChapter', () => {
  it('keeps the summary visible and exposes expanded content accessibly', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [open, setOpen] = useState(false);
      return <ReadingChapter
        id="sun"
        title="Sun in Leo"
        summary="Visible summary"
        paragraphs={['Detail one', 'Detail two']}
        evidenceLabels={['Sun · Leo']}
        open={open}
        onToggle={() => setOpen((value) => !value)}
      />;
    }

    render(<Harness />);
    expect(screen.getByText('Visible summary')).toBeVisible();
    const button = screen.getByRole('button', { name: /Sun in Leo/ });
    const panel = document.getElementById('reading-chapter-sun-panel');
    expect(button).toHaveAttribute('id', 'reading-chapter-sun-trigger');
    expect(button).toHaveAttribute('aria-controls', 'reading-chapter-sun-panel');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('aria-labelledby', 'reading-chapter-sun-trigger');
    expect(panel).not.toBeVisible();

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Detail two')).toBeVisible();
    expect(screen.getByText('Sun · Leo')).toBeVisible();
  });

  it('delegates every state change to the controlled toggle callback', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<ReadingChapter
      id="moon"
      title="Moon in Pisces"
      summary="Summary"
      paragraphs={[]}
      evidenceLabels={[]}
      open={false}
      onToggle={onToggle}
    />);

    await user.click(screen.getByRole('button', { name: /Moon in Pisces/ }));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Moon in Pisces/ })).toHaveAttribute('aria-expanded', 'false');
  });
});
