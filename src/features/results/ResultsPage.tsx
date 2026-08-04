import { useMemo, useState } from 'react';
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

export function ResultsPage({ profile, chart, transits, fortune, monthFortune, yearFortune, detailedReading, onEdit }: Props) {
  const { locale, t } = useI18n();
  const [period, setPeriod] = useState<'today' | 'month' | 'year'>('today');
  const city = CITIES.find((item) => item.id === profile.cityId);
  const localizedCity = city ? cityName(city, locale) : `${profile.latitude.toFixed(2)}, ${profile.longitude.toFixed(2)}`;
  const dailyView = useMemo(() => localizeDailyFortune(fortune, locale), [fortune, locale]);
  const monthView = useMemo(() => monthFortune ? localizePeriodFortune(monthFortune, locale) : undefined, [monthFortune, locale]);
  const yearView = useMemo(() => yearFortune ? localizePeriodFortune(yearFortune, locale) : undefined, [yearFortune, locale]);
  const detailedView = useMemo(() => renderDetailedReading(detailedReading, locale), [detailedReading, locale]);
  const selectedPeriodView = period === 'month' ? monthView : period === 'year' ? yearView : undefined;

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
        <button className={period === 'today' ? 'active' : ''} onClick={() => setPeriod('today')} role="tab" aria-selected={period === 'today'}>{t('period.today')}</button>
        <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')} role="tab" aria-selected={period === 'month'}>{t('period.month')}</button>
        <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')} role="tab" aria-selected={period === 'year'}>{t('period.year')}</button>
      </div>
      <BigThreeSummary chart={chart} />
      {period === 'today' ? <CosmicWeather fortune={dailyView} /> : selectedPeriodView ? <PeriodFortuneSection fortune={selectedPeriodView} /> : null}
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
