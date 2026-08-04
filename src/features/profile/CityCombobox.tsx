import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { CITIES, cityName, searchCities } from './cities';
import type { City, ValidationErrorCode } from './types';
import { VALIDATION_TRANSLATION_KEYS } from './validate';

type Props = { selectedId: string; onSelect: (city: City) => void; error?: ValidationErrorCode };

export function CityCombobox({ selectedId, onSelect, error }: Props) {
  const { locale, t } = useI18n();
  const selected = CITIES.find((city) => city.id === selectedId);
  const [query, setQuery] = useState(selected ? cityName(selected, locale) : '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const options = searchCities(query).slice(0, 8);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const previousLocaleRef = useRef(locale);

  useEffect(() => {
    if (selected && query === cityName(selected, previousLocaleRef.current)) {
      setQuery(cityName(selected, locale));
    }
    previousLocaleRef.current = locale;
  }, [locale, query, selected]);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const choose = (city: City) => { onSelect(city); setQuery(cityName(city, locale)); setOpen(false); };

  return <div className="field city-field" ref={rootRef}>
    <label htmlFor="birth-city">{t('form.city')}</label>
    <div className="input-wrap"><span aria-hidden="true">⌖</span><input id="birth-city" role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-invalid={!!error} value={query} placeholder={t('form.cityPlaceholder')} autoComplete="off" onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(0); }} onKeyDown={(event) => {
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive((value) => Math.min(value + 1, options.length - 1)); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); }
      if (event.key === 'Enter' && open && options[active]) { event.preventDefault(); choose(options[active]); }
      if (event.key === 'Escape') setOpen(false);
    }} /></div>
    {open && <ul id={listId} className="city-options" role="listbox">
      {options.map((city, index) => <li key={city.id} role="option" aria-selected={selectedId === city.id} className={index === active ? 'active' : ''} onMouseDown={(event) => { event.preventDefault(); choose(city); }}>
        <b>{cityName(city, locale)}</b><span>{locale === 'ko' ? city.countryKo : city.countryEn} · {city.timeZone}</span>
      </li>)}
      {!options.length && <li className="empty">{t('form.noCityResult')}</li>}
    </ul>}
    {error && <p className="field-error">{t(VALIDATION_TRANSLATION_KEYS[error])}</p>}
  </div>;
}
