import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import type { LocalizedDetailedReading } from '../readings/renderDetailedReading';
import { ReadingChapter } from './ReadingChapter';

export function DetailedNatalReport({ report }: { report: LocalizedDetailedReading }) {
  const { t } = useI18n();
  const [openBlockIds, setOpenBlockIds] = useState<Set<string>>(() => new Set());

  function toggle(blockId: string) {
    setOpenBlockIds((current) => {
      const next = new Set(current);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  }

  return <section className="result-section detailed-natal-report" aria-labelledby="detailed-reading-title">
    <div className="section-heading">
      <div>
        <div className="section-kicker">{t('readings.kicker')}</div>
        <h2 id="detailed-reading-title">{t('readings.title')}</h2>
      </div>
      <p>{t('readings.intro')}</p>
    </div>
    {report.notices.length > 0 && <div className="reading-notices">
      {report.notices.map((notice) => <p key={notice}>{notice}</p>)}
    </div>}
    <div className="reading-sections">
      {report.sections.map((section) => <section
        className={`reading-section reading-section-${section.id}`}
        data-testid={`reading-section-${section.id}`}
        key={section.id}
        aria-labelledby={`reading-section-${section.id}-title`}
      >
        <div className="reading-section-heading">
          <h3 id={`reading-section-${section.id}-title`}>{section.title}</h3>
          <p>{section.intro}</p>
        </div>
        <div className="reading-chapter-list">
          {section.blocks.map((block) => <ReadingChapter
            key={block.id}
            id={block.id}
            title={block.title}
            summary={block.summary}
            paragraphs={block.paragraphs}
            evidenceLabels={block.evidenceLabels}
            open={openBlockIds.has(block.id)}
            onToggle={() => toggle(block.id)}
          />)}
        </div>
      </section>)}
    </div>
  </section>;
}
