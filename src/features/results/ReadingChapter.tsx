export type ReadingChapterProps = {
  id: string;
  title: string;
  summary: string;
  paragraphs: string[];
  evidenceLabels: string[];
  open: boolean;
  onToggle: () => void;
};

export function ReadingChapter({
  id,
  title,
  summary,
  paragraphs,
  evidenceLabels,
  open,
  onToggle,
}: ReadingChapterProps) {
  const triggerId = `reading-chapter-${id}-trigger`;
  const panelId = `reading-chapter-${id}-panel`;

  return <article className={`reading-chapter${open ? ' open' : ''}`}>
    <button
      type="button"
      className="reading-chapter-trigger"
      id={triggerId}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <span>{title}</span>
      <span className="reading-chapter-marker" aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
    <p className="reading-chapter-summary">{summary}</p>
    <div
      className="reading-chapter-panel"
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!open}
    >
      {evidenceLabels.length > 0 && <div className="reading-chapter-evidence">
        {evidenceLabels.map((label) => <span key={label}>{label}</span>)}
      </div>}
      <div className="reading-chapter-prose">
        {paragraphs.map((paragraph, index) => <p key={`${id}-${index}`}>{paragraph}</p>)}
      </div>
    </div>
  </article>;
}
