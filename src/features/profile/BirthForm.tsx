import { useState, type FormEvent } from 'react';
import { CityCombobox } from './CityCombobox';
import type { BirthProfile } from './types';
import { validateBirthProfile } from './validate';
import './BirthForm.css';

const EMPTY: BirthProfile = { displayName: '', date: '', time: '12:00', timeKnown: true, cityId: '', latitude: 0, longitude: 0, timeZone: '', disambiguation: 'compatible' };

type Props = { onSubmit: (profile: BirthProfile) => void; initialProfile?: BirthProfile | null; busy?: boolean };

export function BirthForm({ onSubmit, initialProfile, busy = false }: Props) {
  const [profile, setProfile] = useState<BirthProfile>(initialProfile ?? EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validateBirthProfile>>({});
  const [custom, setCustom] = useState(initialProfile?.cityId === 'custom');

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateBirthProfile(profile);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(profile);
  }

  const bind = (key: keyof BirthProfile) => ({ value: String(profile[key]), onChange: (event: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, [key]: event.target.value }) });

  return <section className="birth-panel" aria-labelledby="birth-form-title">
    <div className="form-intro"><p className="eyebrow">YOUR MOMENT IN THE SKY</p><h2 id="birth-form-title">태어난 순간을 알려주세요</h2><p>정확한 시간과 장소가 상승궁과 12하우스를 결정합니다.</p></div>
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field full"><label htmlFor="display-name">이름 또는 별칭</label><div className="input-wrap"><span aria-hidden="true">✦</span><input id="display-name" {...bind('displayName')} placeholder="결과에 표시할 이름" aria-invalid={!!errors.displayName} /></div>{errors.displayName && <p className="field-error">{errors.displayName}</p>}</div>
        <div className="field"><label htmlFor="birth-date">생년월일</label><div className="input-wrap"><span aria-hidden="true">◌</span><input id="birth-date" type="date" {...bind('date')} aria-invalid={!!errors.date} /></div>{errors.date && <p className="field-error">{errors.date}</p>}</div>
        <div className="field"><label htmlFor="birth-time">출생시간</label><div className="input-wrap"><span aria-hidden="true">◷</span><input id="birth-time" type="time" {...bind('time')} disabled={!profile.timeKnown} aria-invalid={!!errors.time} /></div><label className="check-label"><input type="checkbox" checked={!profile.timeKnown} onChange={(event) => setProfile({ ...profile, timeKnown: !event.target.checked })} /> 시간을 몰라요</label>{errors.time && <p className="field-error">{errors.time}</p>}</div>
        {!custom && <div className="full"><CityCombobox selectedId={profile.cityId} error={errors.cityId} onSelect={(city) => setProfile({ ...profile, cityId: city.id, latitude: city.latitude, longitude: city.longitude, timeZone: city.timeZone })} /></div>}
        <div className="full"><button className="text-button" type="button" onClick={() => { setCustom((value) => !value); if (!custom) setProfile({ ...profile, cityId: 'custom' }); }}>{custom ? '도시 검색으로 돌아가기' : '목록에 없는 장소 직접 입력'}</button></div>
        {custom && <div className="advanced full"><div className="field"><label htmlFor="latitude">위도</label><input id="latitude" type="number" step="0.0001" value={profile.latitude} onChange={(event) => setProfile({ ...profile, latitude: Number(event.target.value), cityId: 'custom' })} /></div><div className="field"><label htmlFor="longitude">경도</label><input id="longitude" type="number" step="0.0001" value={profile.longitude} onChange={(event) => setProfile({ ...profile, longitude: Number(event.target.value), cityId: 'custom' })} /></div><div className="field full"><label htmlFor="timezone">IANA 시간대</label><input id="timezone" {...bind('timeZone')} placeholder="Asia/Seoul" /></div>{(errors.coordinates || errors.timeZone) && <p className="field-error full">{errors.coordinates ?? errors.timeZone}</p>}</div>}
      </div>
      {!profile.timeKnown && <div className="time-note">출생시간이 없으면 태양·달·행성 별자리는 계산하지만 상승궁과 12하우스는 표시하지 않아요.</div>}
      <button className="calculate-button" type="submit" disabled={busy}>{busy ? '별의 위치를 계산하는 중…' : '별자리 만세력 계산하기'} <span aria-hidden="true">✦</span></button>
      <p className="privacy-note">입력한 정보는 이 기기에만 저장되며 외부 서버로 전송되지 않습니다.</p>
    </form>
  </section>;
}
