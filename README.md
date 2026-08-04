# 잔상 별자리

태어난 순간의 열대황도·플라시두스 출생 차트와 오늘의 트랜짓을 브라우저에서 계산하는 설치형 웹앱입니다.

## 실행

```powershell
npm install
npm run dev
```

검증은 `npm test -- --run`과 `npm run build`로 실행합니다.

## 개인정보

출생정보는 브라우저의 로컬 저장소에만 보관되며 별도 서버로 전송하지 않습니다.

## 라이선스

이 프로토타입은 GPL-3.0-or-later로 배포합니다. 천체 계산에는 `swisseph-wasm`과 Swiss Ephemeris를 사용합니다. 독점 또는 상업 서비스로 배포하기 전에는 [Astrodienst의 Swiss Ephemeris 라이선스](https://www.astro.com/swisseph/)를 별도로 검토해야 합니다.
