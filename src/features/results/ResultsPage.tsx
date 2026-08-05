import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { BirthProfile } from '../profile/types';
import type { NatalChartData } from '../astrology/types';
import type { DailyFortune } from '../fortune/generateFortune';
import type { TransitData } from '../fortune/transits';
import type { PeriodFortune } from '../fortune/periodFortune';
import { CITIES } from '../profile/cities';
import { NatalChart } from '../chart/NatalChart';
import { BigThreeSummary } from './BigThreeSummary';
import { CosmicWeather } from './CosmicWeather';
import { PlacementSection } from './PlacementSection';
import { HouseSection } from './HouseSection';
import { AspectSection } from './AspectSection';
import { DailyFortuneSection } from './DailyFortuneSection';
import { LuckyGuide } from './LuckyGuide';
import './results.css';
import { LegalNotice } from '../../components/LegalNotice';
import { PeriodFortuneSection } from './PeriodFortuneSection';
import { localizeDailyFortune } from '../fortune/localizeDailyFortune';
import { localizePeriodFortune } from '../fortune/localizePeriodFortune';
import type { DetailedReadingModel } from '../readings/types';
import { renderDetailedReading } from '../readings/renderDetailedReading';
import { DetailedNatalReport } from './DetailedNatalReport';
import { useI18n } from '../../i18n/I18nProvider';
import { LanguageSwitch } from '../../components/LanguageSwitch';
import { cityName } from '../profile/cities';
import { formatLocalDate } from '../../i18n/formatters';

type Props = { profile: BirthProfile; chart: NatalChartData; transits: TransitData; fortune: DailyFortune; monthFortune?: PeriodFortune; yearFortune?: PeriodFortune; detailedReading: DetailedReadingModel; onEdit: () => void };
type Period = 'today' | 'month' | 'year';

const PERIODS: Period[] = ['today', 'month', 'year'];
const PERIOD_LABEL_KEYS = {
  today: 'period.today',
  month: 'period.month',
  year: 'period.year',
} as const;

export function ResultsPage({ profile, chart, transits, fortune, monthFortune, yearFortune, detailedReading, onEdit }: Props) {
  const { locale, t } = useI18n();
  const [period, setPeriod] = useState<Period>('today');
  const periodTabRefs = useRef<Record<Period, HTMLButtonElement | null>>({ today: null, month: null, year: null });
  const city = CITIES.find((item) => item.id === profile.cityId);
  const localizedCity = city ? cityName(city, locale) : `${profile.latitude.toFixed(2)}, ${profile.longitude.toFixed(2)}`;
  const dailyView = useMemo(() => localizeDailyFortune(fortune, locale), [fortune, locale]);
  const monthView = useMemo(() => monthFortune ? localizePeriodFortune(monthFortune, locale) : undefined, [monthFortune, locale]);
  const yearView = useMemo(() => yearFortune ? localizePeriodFortune(yearFortune, locale) : undefined, [yearFortune, locale]);
  const detailedView = useMemo(() => renderDetailedReading(detailedReading, locale), [detailedReading, locale]);

  function handlePeriodKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentPeriod: Period) {
    const currentIndex = PERIODS.indexOf(currentPeriod);
    let nextPeriod: Period | undefined;
    if (event.key === 'ArrowRight') nextPeriod = PERIODS[(currentIndex + 1) % PERIODS.length];
    if (event.key === 'ArrowLeft') nextPeriod = PERIODS[(currentIndex - 1 + PERIODS.length) % PERIODS.length];
    if (event.key === 'Home') nextPeriod = PERIODS[0];
    if (event.key === 'End') nextPeriod = PERIODS[PERIODS.length - 1];
    if (!nextPeriod) return;
    event.preventDefault();
    setPeriod(nextPeriod);
    periodTabRefs.current[nextPeriod]?.focus();
  }

  return <main className="results-page">
    <div className="result-trail trail-a" aria-hidden="true" />
    <div className="result-trail trail-b" aria-hidden="true" />
    <header className="results-nav">
      <div className="wordmark"><span>{t('brand.name')}</span> ✦</div>
      <button type="button" onClick={onEdit}>{t('results.edit')}</button>
      <LanguageSwitch />
    </header>
    <section className="result-hero">
      <div className="hero-chart"><NatalChart chart={chart} /></div>
      <div className="hero-summary">
        <div className="section-kicker">{t('results.natalChart')} · {formatLocalDate(dailyView.date, locale)}</div>
        <p className="profile-name">{profile.displayName}</p>
        <h1>{t('results.reportTitle', { name: profile.displayName })}</h1>
        <p>{formatLocalDate(profile.date, locale)} · {profile.timeKnown ? profile.time : t('results.timeUnknown')} · {localizedCity}</p>
        <div className="hero-statement">
          <small>{t('results.todayMessage')}</small>
          <strong>{dailyView.headline}</strong>
          <span>{dailyView.categories.overall.summary}</span>
        </div>
      </div>
    </section>
    <div className="result-content">
      <div className="period-selector" role="tablist" aria-label={t('period.label')}>
        {PERIODS.map((item) => <button
          key={item}
          ref={(node) => { periodTabRefs.current[item] = node; }}
          id={`period-tab-${item}`}
          className={period === item ? 'active' : ''}
          onClick={() => setPeriod(item)}
          onKeyDown={(event) => handlePeriodKeyDown(event, item)}
          role="tab"
          aria-selected={period === item}
          aria-controls={`period-panel-${item}`}
          tabIndex={period === item ? 0 : -1}
        >{t(PERIOD_LABEL_KEYS[item])}</button>)}
      </div>
      <BigThreeSummary chart={chart} />
      <div id="period-panel-today" role="tabpanel" aria-labelledby="period-tab-today" tabIndex={0} hidden={period !== 'today'}>
        {period === 'today' && <CosmicWeather fortune={dailyView} />}
      </div>
      <div id="period-panel-month" role="tabpanel" aria-labelledby="period-tab-month" tabIndex={0} hidden={period !== 'month'}>
        {period === 'month' && monthView && <PeriodFortuneSection fortune={monthView} />}
      </div>
      <div id="period-panel-year" role="tabpanel" aria-labelledby="period-tab-year" tabIndex={0} hidden={period !== 'year'}>
        {period === 'year' && yearView && <PeriodFortuneSection fortune={yearView} />}
      </div>
      <DetailedNatalReport report={detailedView} />
      <PlacementSection chart={chart} />
      <HouseSection chart={chart} />
      <AspectSection chart={chart} transits={transits} />
      {period === 'today' && <><DailyFortuneSection fortune={dailyView} /><LuckyGuide fortune={dailyView} /></>}
      <footer className="result-footer">
        <LegalNotice />
        <button type="button" onClick={onEdit}>{t('results.reenter')}</button>
      </footer>
    </div>
  </main>;
}
