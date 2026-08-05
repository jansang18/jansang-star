# 잔상 별자리 · Jansang Star

태어난 순간의 열대황도·플라시두스 출생 차트와 현재의 천체 흐름을 브라우저에서 계산하는 설치형 한·영 웹앱입니다. 출생정보는 브라우저의 로컬 저장소에만 보관되며 외부 서버로 전송하지 않습니다.

## Live

[https://jansang18.github.io/jansang-star/](https://jansang18.github.io/jansang-star/)

첫 방문에서는 브라우저 언어가 한국어이면 한국어를, 그 밖의 언어이면 영어를 자동 선택합니다. 상단의 `한 / EN` 전환기로 언제든 수동 변경할 수 있으며 선택한 언어는 기기에 저장됩니다.

## Features

- Swiss Ephemeris 기반 열대황도·플라시두스 출생 차트, 행성 배치, 상승궁·MC, 12하우스, 주요 애스펙트를 계산합니다.
- 출생시간을 모르면 상승궁과 하우스를 추정하지 않고 행성 별자리 중심의 제한된 결과와 안내를 제공합니다.
- 태양·달·상승궁, 열 행성, 열두 삶의 영역, 출생 애스펙트, 현재 트랜짓을 장별 아코디언으로 자세히 풀이합니다.
- 오늘의 종합·연애·재물·직업·건강 운세와 근거·행동 제안, 월간 다섯 구간, 연간 열두 달·분기별 흐름, 최고·주의 구간을 한국어와 영어로 제공합니다.
- SVG 출생 차트, 기간별 선 그래프, 기기 내 프로필 저장, 오프라인 재열람을 위한 PWA를 포함합니다.

## Local verification

```powershell
npm install
npm test -- --run
npm run build -- --mode pages
npm run preview -- --host 127.0.0.1 --port 4173
```

미리보기는 `http://127.0.0.1:4173/jansang-star/`에서 확인합니다. Pages 모드 빌드는 공개 경로 `/jansang-star/`를 기준으로 `dist/`를 생성합니다.

## Deployment

GitHub Pages에는 아래 프로젝트 명령으로 배포합니다. `predeploy:pages`가 Pages 모드 빌드를 먼저 실행하고, 고정된 `gh-pages` 6.3.0의 `gh-pages --nojekyll -d dist -b gh-pages` 명령이 Jekyll 처리를 끈 상태로 결과물을 게시합니다.

```powershell
npm run deploy:pages
```

깨끗한 빌드에도 `public/.nojekyll`이 `dist/.nojekyll`로 복사되므로 Vite의 `__vite-*` 청크와 Swiss Ephemeris WASM/data 자산이 그대로 제공됩니다. 공개 주소는 [https://jansang18.github.io/jansang-star/](https://jansang18.github.io/jansang-star/)이며 직접 접속과 새로고침 모두 `/jansang-star/` 경로를 사용합니다.

이 프로젝트는 `GPL-3.0-or-later`로 배포합니다. 천체 계산에는 `swisseph-wasm`과 Swiss Ephemeris를 사용합니다. 독점 또는 상업 서비스로 배포하기 전에는 [Astrodienst의 Swiss Ephemeris 라이선스](https://www.astro.com/swisseph/)와 데이터 재배포 조건을 별도로 검토해야 합니다.
