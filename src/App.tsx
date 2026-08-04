import { useState } from 'react';

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <main className="app-shell">
      <div className="afterimage afterimage-one" aria-hidden="true" />
      <div className="afterimage afterimage-two" aria-hidden="true" />
      <nav className="site-nav" aria-label="주요 메뉴">
        <div className="wordmark"><span>잔상</span> 별자리 ✦</div>
        <span className="nav-chip">TROPICAL · PLACIDUS</span>
      </nav>
      <section className="landing-hero">
        <p className="eyebrow">THE SKY REMEMBERS YOUR MOMENT</p>
        <h1>잔상 별자리</h1>
        <p className="hero-copy">태어난 순간의 별빛은 오늘도 잔상을 남깁니다.</p>
        <p className="hero-detail">출생 차트와 오늘의 천체 흐름을 한눈에 읽는<br />나만의 별자리 만세력</p>
        <button className="primary-button" type="button" onClick={() => setStarted(true)}>
          나의 별자리 만세력 보기 <span aria-hidden="true">→</span>
        </button>
        {started && <p className="coming-message" role="status">출생정보 입력을 준비하고 있어요 ✦</p>}
      </section>
      <section className="preview-orbit" aria-hidden="true">
        <div className="orbit-ring orbit-ring-one" />
        <div className="orbit-ring orbit-ring-two" />
        <span className="orbit-star">✦</span>
        <span className="zodiac-glyph glyph-one">♌</span>
        <span className="zodiac-glyph glyph-two">♓</span>
        <span className="zodiac-glyph glyph-three">♏</span>
      </section>
    </main>
  );
}
