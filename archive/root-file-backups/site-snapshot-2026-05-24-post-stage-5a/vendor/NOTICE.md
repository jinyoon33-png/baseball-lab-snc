# Third-Party Notices

본 디렉토리(`site/vendor/`)에는 Baseball Lab S&C 사이트가 사용하는 외부 오픈소스 라이브러리와 폰트가 포함되어 있다. 각 항목의 출처와 라이선스는 아래와 같다. 본 문서는 라이선스 전문을 포함하지 않으며, 공식 라이선스 URL과 핵심 attribution만 기록한다.

## Chart.js
- 버전: v4.4.2
- 로컬 파일: `site/vendor/chart.umd.min.js`
- 라이선스: MIT License
- Attribution: Copyright (c) 2024 Chart.js Contributors. Released under the MIT License.
- 출처: https://github.com/chartjs/Chart.js
- 라이선스 URL: https://github.com/chartjs/Chart.js/blob/master/LICENSE.md
- 근거: 로컬 파일 header에 `Chart.js v4.4.2`, `(c) 2024 Chart.js Contributors`, jsdelivr 경로(`/npm/chart.js@4.4.2/dist/chart.umd.js`) 명시. 라이선스 본문은 공식 저장소 URL 기준.

## html2canvas
- 버전: 1.4.1
- 로컬 파일: `site/vendor/html2canvas.min.js`
- 라이선스: MIT License
- Attribution: Copyright (c) 2022 Niklas von Hertzen. Released under the MIT License.
- 출처: https://html2canvas.hertzen.com
- 라이선스 URL: https://github.com/niklasvh/html2canvas/blob/master/LICENSE
- 근거: 로컬 파일 header에 `Released under MIT License`, `Copyright (c) 2022 Niklas von Hertzen`, `https://html2canvas.hertzen.com` 명시.

## lucide
- 버전: v0.344.0
- 로컬 파일: `site/vendor/lucide.min.js`
- 라이선스: ISC License (lucide 본체) / MIT License (Feather 파생 아이콘)
- Attribution:
  - ISC License — Copyright (c) Lucide Icons and Contributors.
  - Feather 파생 아이콘 MIT License — Copyright (c) 2013-present Cole Bemis.
- 출처: https://lucide.dev
- 라이선스 URL: https://github.com/lucide-icons/lucide/blob/main/LICENSE
- 근거: 로컬 파일 header에 `@license lucide v0.344.0 - ISC` 명시. Lucide는 Feather Icons fork이며 Feather 자산은 MIT License를 유지한다(공식 LICENSE 파일 기준).

## Pretendard
- 버전: 프로젝트 배포본(Regular / Medium / SemiBold / Bold / ExtraBold)
- 로컬 파일:
  - `site/vendor/fonts/Pretendard-Regular.woff2`
  - `site/vendor/fonts/Pretendard-Medium.woff2`
  - `site/vendor/fonts/Pretendard-SemiBold.woff2`
  - `site/vendor/fonts/Pretendard-Bold.woff2`
  - `site/vendor/fonts/Pretendard-ExtraBold.woff2`
- 라이선스: SIL Open Font License 1.1
- Attribution:
  - Copyright (c) 2021, Kil Hyung-jin (https://github.com/orioncactus/pretendard), with Reserved Font Name `Pretendard`.
  - 파생/혼합 자산 표기(공식 LICENSE 기준 요약):
    - Adobe Source Sans / Source Code Pro / Source Han Sans — Copyright 2014-2021 Adobe (http://www.adobe.com/). Reserved Font Name `Source`.
    - Inter — Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter). Reserved Font Name `Inter`.
    - M PLUS 1 — Copyright 2021 The M+ FONTS Project Authors (https://github.com/coz-m/MPLUS_FONTS). Reserved Font Name `M PLUS 1`.
- 출처: https://github.com/orioncactus/pretendard
- 라이선스 URL: https://github.com/orioncactus/pretendard/blob/main/LICENSE
- 근거: woff2 바이너리로 로컬 header 추출 불가. 라이선스/저작권/Reserved Font Name 표기는 공식 저장소 LICENSE 파일 기준.
