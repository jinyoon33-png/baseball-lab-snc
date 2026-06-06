# 보안/QA 점검 공간

## 담당
- 보안/QA Claude Code: 읽기 전용 정적 점검과 보안 보고.
- 현재 Codex: 보안/QA Claude Code 보고를 최종 워크플랜 판단에 반영.

## 허용
- 파일 읽기.
- 정적 명령 실행.
- 보안/QA 보고 작성.

## 금지
- 파일 수정.
- 파일 삭제 또는 이동.
- 커밋.
- 설치.
- 서버 설정 변경.
- 다음 티켓 작성.
- 구현 담당 역할 수행.
- 추측성 이슈를 확정 취약점처럼 표현.

## 호출 기준
- CSP 또는 보안 헤더 변경.
- localStorage, 백업/복원, 파일 import/export 변경.
- innerHTML, insertAdjacentHTML, template HTML, URL 처리 변경.
- 외부 링크, target="_blank", sourceUrl, YouTube 링크 정책 변경.
- 개인정보, 미성년자 데이터, 라이선스/NOTICE, 광고 스크립트 변경.
- 총괄 Codex가 지정한 범위가 있으면 그 범위를 우선한다.
- 단순 문구, CSS, 문서 기록만 바꾸는 티켓은 기본적으로 호출하지 않는다.

## 기본 점검 명령
- `node --check site/app.js`
- `node --check site/data.js`
- `rg -n 'innerHTML|insertAdjacentHTML|outerHTML|eval\(|new Function|localStorage|FileReader|JSON.parse|URL.createObjectURL|download|target="_blank"' site`
- `rg -n "onclick=|oninput=|onchange=" site/*.html`
- `rg -n "adsbygoogle|pagead2.googlesyndication.com|canonical|application/ld\+json" site`
- `rg -n "guideMediaType|guideMediaSrc|guideMediaPoster|guideMediaAlt|guideMediaCaption|guideMediaCredit" site/data.js`

## 보고 형식
[보안/QA 점검 보고]
- 대상 티켓:
- 실행 명령:
- BLOCKER:
- MAJOR:
- MINOR:
- NIT:
- 총괄 Codex 판단 요청:
- 결론:
