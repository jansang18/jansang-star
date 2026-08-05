import { useState, type FormEvent } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { CityCombobox } from './CityCombobox';
import type { BirthProfile } from './types';
import { VALIDATION_TRANSLATION_KEYS, validateBirthProfile } from './validate';
import './BirthForm.css';

const EMPTY: BirthProfile = { displayName: '', date: '', time: '12:00', timeKnown: true, cityId: '', latitude: 0, longitude: 0, timeZone: '', disambiguation: 'compatible' };

type Props = { onSubmit: (profile: BirthProfile) => void; initialProfile?: BirthProfile | null; busy?: boolean };

function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function BirthForm({ onSubmit, initialProfile, busy = false }: Props) {
  const { t } = useI18n();
  const [profile, setProfile] = useState<BirthProfile>(initialProfile ?? EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validateBirthProfile>>({});
  const [custom, setCustom] = useState(initialProfile?.cityId === 'custom');
  const customError = errors.coordinates ?? errors.timeZone;

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateBirthProfile(profile);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(profile);
  }

  const bind = (key: keyof BirthProfile) => ({ value: String(profile[key]), onChange: (event: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, [key]: event.target.value }) });

  return <section className="birth-panel" aria-labelledby="birth-form-title">
    <div className="form-intro"><p className="eyebrow">{t('form.eyebrow')}</p><h2 id="birth-form-title">{t('form.title')}</h2><p>{t('form.intro')}</p></div>
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field full"><label htmlFor="display-name">{t('form.name')}</label><div className="input-wrap"><span aria-hidden="true">✦</span><input id="display-name" {...bind('displayName')} placeholder={t('form.namePlaceholder')} aria-invalid={!!errors.displayName} /></div>{errors.displayName && <p className="field-error">{t(VALIDATION_TRANSLATION_KEYS[errors.displayName])}</p>}</div>
        <div className="field"><label htmlFor="birth-date">{t('form.date')}</label><div className="input-wrap"><span aria-hidden="true">◌</span><input id="birth-date" type="text" inputMode="numeric" autoComplete="bday" placeholder="YYYY-MM-DD" maxLength={10} value={profile.date} onChange={(event) => setProfile({ ...profile, date: formatBirthDate(event.target.value) })} aria-describedby="birth-date-hint" aria-invalid={!!errors.date} /></div><p className="field-hint" id="birth-date-hint">{t('form.dateHint')}</p>{errors.date && <p className="field-error">{t(VALIDATION_TRANSLATION_KEYS[errors.date])}</p>}</div>
        <div className="field"><label htmlFor="birth-time">{t('form.time')}</label><div className="input-wrap"><span aria-hidden="true">◷</span><input id="birth-time" type="time" {...bind('time')} disabled={!profile.timeKnown} aria-invalid={!!errors.time} /></div><label className="check-label"><input type="checkbox" checked={!profile.timeKnown} onChange={(event) => setProfile({ ...profile, timeKnown: !event.target.checked })} /> {t('form.unknownTime')}</label>{errors.time && <p className="field-error">{t(VALIDATION_TRANSLATION_KEYS[errors.time])}</p>}</div>
        {!custom && <div className="full"><CityCombobox
          selectedId={profile.cityId}
          error={errors.cityId}
          onSelect={(city) => setProfile((current) => ({ ...current, cityId: city.id, latitude: city.latitude, longitude: city.longitude, timeZone: city.timeZone }))}
          onClearSelection={() => setProfile((current) => ({ ...current, cityId: '', latitude: 0, longitude: 0, timeZone: '' }))}
        /></div>}
        <div className="full"><button className="text-button" type="button" onClick={() => { setCustom((value) => !value); if (!custom) setProfile({ ...profile, cityId: 'custom' }); }}>{custom ? t('form.cityReturn') : t('form.custom')}</button></div>
        {custom && <div className="advanced full"><div className="field"><label htmlFor="latitude">{t('form.latitude')}</label><input id="latitude" type="number" step="0.0001" value={profile.latitude} onChange={(event) => setProfile({ ...profile, latitude: Number(event.target.value), cityId: 'custom' })} /></div><div className="field"><label htmlFor="longitude">{t('form.longitude')}</label><input id="longitude" type="number" step="0.0001" value={profile.longitude} onChange={(event) => setProfile({ ...profile, longitude: Number(event.target.value), cityId: 'custom' })} /></div><div className="field full"><label htmlFor="timezone">{t('form.timeZone')}</label><input id="timezone" {...bind('timeZone')} placeholder="Asia/Seoul" /></div>{customError && <p className="field-error full">{t(VALIDATION_TRANSLATION_KEYS[customError])}</p>}</div>}
      </div>
      {!profile.timeKnown && <div className="time-note">{t('form.unknownTimeNote')}</div>}
      <button className="calculate-button" type="submit" disabled={busy}>{busy ? t('form.calculating') : t('form.calculate')} <span aria-hidden="true">✦</span></button>
      <p className="privacy-note">{t('form.privacy')}</p>
    </form>
  </section>;
}
