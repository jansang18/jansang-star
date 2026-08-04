import { useState } from 'react';
import type { LocalizedPeriodDetail, LocalizedPeriodFortune } from '../fortune/localizePeriodFortune';
import { PeriodFlowChart } from './PeriodFlowChart';
import { ReadingChapter } from './ReadingChapter';

export function PeriodFortuneSection({ fortune }: { fortune: LocalizedPeriodFortune }) {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setOpenChapters((current) => ({ ...current, [id]: !current[id] }));
  }

  function chapter(detail: LocalizedPeriodDetail) {
    return <ReadingChapter
      key={detail.id}
      id={detail.id}
      title={detail.title}
      summary={detail.summary}
      paragraphs={detail.paragraphs}
      evidenceLabels={detail.evidenceLabels}
      open={Boolean(openChapters[detail.id])}
      onToggle={() => toggle(detail.id)}
    />;
  }

  return <section className="result-section period-section">
    <div className="section-kicker">{fortune.ui.kicker[fortune.period]} · {fortune.label}</div>
    <div className="period-heading">
      <div>
        <h2>{fortune.headline}</h2>
        <p>{fortune.ui.description[fortune.period]}</p>
      </div>
      <strong>{fortune.overallScore}</strong>
    </div>

    <div className="period-overview">
      <h3>{fortune.ui.overview}</h3>
      {fortune.overview.map((paragraph, index) => <p key={`${fortune.period}-overview-${index}`}>{paragraph}</p>)}
    </div>

    <PeriodFlowChart points={fortune.timeline} label={`${fortune.label} ${fortune.ui.chartSuffix}`} />

    <div className="period-windows">
      <article>
        <small>{fortune.ui.opportunity}</small>
        <b>{fortune.opportunity}</b>
      </article>
      <article className="care">
        <small>{fortune.ui.caution}</small>
        <b>{fortune.caution}</b>
      </article>
    </div>

    <div className="period-detail-group period-strategies">
      <h3>{fortune.ui.strategies}</h3>
      <div className="period-chapter-list">
        {Object.entries(fortune.categoryStrategies).map(([key, paragraphs]) => {
          const category = fortune.categories[key as keyof typeof fortune.categories];
          const id = `${fortune.period}-category-${key}`;
          return <ReadingChapter
            key={id}
            id={id}
            title={category.label}
            summary={paragraphs[0]}
            paragraphs={paragraphs.slice(1)}
            evidenceLabels={[`${category.label} · ${category.score}`]}
            open={Boolean(openChapters[id])}
            onToggle={() => toggle(id)}
          />;
        })}
      </div>
    </div>

    {fortune.quarters.length > 0 && <div className="period-detail-group period-quarters">
      <h3>{fortune.ui.quarters}</h3>
      <div className="period-chapter-list">{fortune.quarters.map(chapter)}</div>
    </div>}

    <div className="period-detail-group period-segments">
      <h3>{fortune.ui.segments[fortune.period]}</h3>
      <div className="period-chapter-list">{fortune.segments.map(chapter)}</div>
    </div>
  </section>;
}
