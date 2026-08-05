import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { CITIES, cityName, searchCities } from './cities';
import type { City, ValidationErrorCode } from './types';
import { VALIDATION_TRANSLATION_KEYS } from './validate';
import { loadWorldCities, searchWorldCities, type WorldCityRecord } from './worldCities';

type Props = {
  selectedId: string;
  selectedCity?: City;
  onSelect: (city: City) => void;
  onClearSelection: () => void;
  error?: ValidationErrorCode;
};

export function CityCombobox({ selectedId, selectedCity, onSelect, onClearSelection, error }: Props) {
  const { locale, t } = useI18n();
  const selected = selectedCity ?? CITIES.find((city) => city.id === selectedId);
  const [query, setQuery] = useState(selected ? cityName(selected, locale) : '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [records, setRecords] = useState<readonly WorldCityRecord[]>();
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const options = useMemo(() => records
    ? searchWorldCities(records, query, locale)
    : loadState === 'loading' ? [] : searchCities(query).slice(0, 8), [loadState, locale, query, records]);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const previousLocaleRef = useRef(locale);

  useEffect(() => {
    if (selected && query === cityName(selected, previousLocaleRef.current)) {
      setQuery(cityName(selected, locale));
    }
    previousLocaleRef.current = locale;
  }, [locale, query, selected]);

  const ensureWorldCities = () => {
    if (loadState === 'loading' || loadState === 'ready') return;
    setLoadState('loading');
    loadWorldCities().then((nextRecords) => {
      setRecords(nextRecords);
      setLoadState('ready');
      setActive(nextRecords.length > 0 ? 0 : -1);
    }).catch(() => {
      setLoadState('error');
      setActive(searchCities(query).length > 0 ? 0 : -1);
    });
  };

  useEffect(() => {
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const optionId = (city: City) => `${listId}-option-${city.id}`;
  const activeOption = active >= 0 ? options[active] : undefined;
  const choose = (city: City) => {
    onSelect(city);
    setQuery(cityName(city, locale));
    setOpen(false);
    setActive(-1);
  };

  return <div className="field city-field" ref={rootRef}>
    <label htmlFor="birth-city">{t('form.city')}</label>
    <div className="input-wrap"><span aria-hidden="true">⌖</span><input id="birth-city" role="combobox" aria-expanded={open} aria-controls={listId} aria-activedescendant={open && activeOption ? optionId(activeOption) : undefined} aria-autocomplete="list" aria-invalid={!!error} value={query} placeholder={t('form.cityPlaceholder')} autoComplete="off" onFocus={() => { setOpen(true); ensureWorldCities(); setActive((value) => options.length === 0 ? -1 : Math.min(value, options.length - 1)); }} onChange={(event) => {
      const nextQuery = event.target.value;
      if (selected && nextQuery !== cityName(selected, locale)) onClearSelection();
      setQuery(nextQuery);
      setOpen(true);
      ensureWorldCities();
      const nextOptions = records ? searchWorldCities(records, nextQuery, locale) : searchCities(nextQuery);
      setActive(nextOptions.length > 0 ? 0 : -1);
    }} onKeyDown={(event) => {
      if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActive((value) => options.length === 0 ? -1 : Math.min(value + 1, options.length - 1)); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setActive((value) => options.length === 0 ? -1 : value <= 0 ? options.length - 1 : value - 1); }
      if (event.key === 'Enter' && open && options[active]) { event.preventDefault(); choose(options[active]); }
      if (event.key === 'Escape') setOpen(false);
    }} /></div>
    {open && <ul id={listId} className="city-options" role="listbox">
      {loadState === 'loading' && <li className="empty" role="status">{t('form.cityLoading')}</li>}
      {loadState === 'error' && <li className="city-load-note" role="status">{t('form.cityLoadError')}</li>}
      {options.map((city, index) => <li key={city.id} id={optionId(city)} role="option" aria-selected={selectedId === city.id} className={index === active ? 'active' : ''} onMouseEnter={() => setActive(index)} onMouseDown={(event) => { event.preventDefault(); choose(city); }}>
        <b>{cityName(city, locale)}</b><span>{locale === 'ko' ? city.countryKo : city.countryEn} · {city.timeZone}</span>
      </li>)}
      {loadState !== 'loading' && !options.length && <li className="empty">{t('form.noCityResult')}</li>}
    </ul>}
    {error && <p className="field-error">{t(VALIDATION_TRANSLATION_KEYS[error])}</p>}
  </div>;
}
