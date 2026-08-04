import { useEffect, useId, useRef, useState } from 'react';
import { CITIES, searchCities } from './cities';
import type { City } from './types';

type Props = { selectedId: string; onSelect: (city: City) => void; error?: string };

export function CityCombobox({ selectedId, onSelect, error }: Props) {
  const selected = CITIES.find((city) => city.id === selectedId);
  const [query, setQuery] = useState(selected?.nameKo ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const options = searchCities(query).slice(0, 8);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (selected) setQuery(selected.nameKo); }, [selected]);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const choose = (city: City) => { onSelect(city); setQuery(city.nameKo); setOpen(false); };

  return <div className="field city-field" ref={rootRef}>
    <label htmlFor="birth-city">출생지역</label>
    <div className="input-wrap"><span aria-hidden="true">⌖</span><input id="birth-city" role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-invalid={!!error} value={query} placeholder="도시 이름을 검색하세요" autoComplete="off" onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(0); }} onKeyDown={(event) => {
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive((value) => Math.min(value + 1, options.length - 1)); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); }
      if (event.key === 'Enter' && open && options[active]) { event.preventDefault(); choose(options[active]); }
      if (event.key === 'Escape') setOpen(false);
    }} /></div>
    {open && <ul id={listId} className="city-options" role="listbox">
      {options.map((city, index) => <li key={city.id} role="option" aria-selected={selectedId === city.id} className={index === active ? 'active' : ''} onMouseDown={(event) => { event.preventDefault(); choose(city); }}>
        <b>{city.nameKo}</b><span>{city.countryKo} · {city.timeZone}</span>
      </li>)}
      {!options.length && <li className="empty">검색 결과가 없어요. 고급 입력을 이용해 주세요.</li>}
    </ul>}
    {error && <p className="field-error">{error}</p>}
  </div>;
}
