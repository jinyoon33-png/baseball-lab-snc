# Work Plan Archive

## 2026-06-06 — 신규 선수 등록 필수 입력·체중 검증 브라우저 실사용 확인 1차
- Result: Step 2 완료. 브라우저 반실사용 확인 PASS.
- Owner: 총괄 Codex 직접 수행. 로컬 `site/` 서버와 Playwright 브라우저로 신규 등록·편집 검증을 확인.
- Static: `node --check site/app.js`·`site/data.js` PASS, 체중 `!== 0` 예외 0건, 체중 범위 검증 2곳 유지, inline handler/광고/analytics/JSON-LD 0건.
- Browser: 필수 배지 8건, 키 필수 배지 0건. 구력 빈 값 → `구력을 입력하세요...`, 체중 빈 값 → `체중을 입력하세요.`, 체중 `0` → `몸무게는 20~200kg 범위만 허용됩니다.` 확인.
- Browser: 구력 `0` + 체중 `70` 정상 등록, `pLDB_v4_5`에 선수 1명 저장, 화면 `s2` 전환 확인.
- Browser: 편집 모달 필수 배지 4건, 체중 `0` 수정 시 범위 오류 차단 및 편집 모달 유지 확인.
- Note: Playwright 테스트는 별도 브라우저 세션/localStorage에서 수행해 사용자 실데이터를 건드리지 않음.
- Next: `신규 선수 등록 필수 입력·체중 검증 GitHub push·Cloudflare 재배포 확인 1차`.

## 2026-06-06 — 신규 선수 등록 체중 0 범위 검증 보정 1차
- Result: Step 2 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Owner: 코드 담당 Claude가 `site/app.js` 체중 범위 조건 2곳을 보정했고 총괄 Codex가 직접 정적 검증.
- Scope: `addPlayer()`와 `savePlayerEdit()`에서 체중 `0` 예외(`weightInput !== 0`, `eWeightInput !== 0`) 제거. 빈 값 차단, 키 선택 입력, 구력 `0` 허용은 유지.
- Static: 체중 `!== 0` 예외 0건, `몸무게는 20~200kg` 검증 2곳 유지, 키 예외 2곳 유지, 구력 0 허용 유지, `node --check site/app.js`·`site/data.js` PASS.
- Safety: inline handler 0건, 광고/analytics/JSON-LD 0건. 이번 티켓 변경은 `site/app.js`로 한정.
- Note: `site/index.html`·`site/style.css` diff는 직전 필수 배지 티켓의 미커밋 변경분. 다음 티켓에서 로컬 브라우저 실사용 확인 후 묶어서 커밋/배포하는 것이 적절.
- Next: `신규 선수 등록 필수 입력·체중 검증 브라우저 실사용 확인 1차`.

## 2026-06-06 — 신규 선수 등록 필수 입력 표시·검증 보정 1차
- Result: 총괄 정밀검토에서 MINOR 1건 발견. 다음 티켓은 체중 `0` 예외 제거 보정으로 전환.
- Owner: 코드 담당 Claude가 구현했고 총괄 Codex가 직접 정적 검증.
- Scope: `site/index.html` 등록/편집 라벨 8곳에 `필수` 배지 추가, `site/style.css` `.form-required` 추가, `site/app.js` `addPlayer()`/`savePlayerEdit()` 구력·체중 빈 값 차단 추가.
- Static: `node --check site/app.js`·`site/data.js` PASS, inline handler 0건, 광고/analytics/JSON-LD 0건, 수정 금지 경로 diff 0건.
- Issue: `site/app.js`의 체중 범위 검증이 `weightInput !== 0` / `eWeightInput !== 0` 예외를 유지해 체중에 리터럴 `0`을 입력하면 필수/20~200kg 정책을 우회할 수 있음.
- Decision: 완료로 밀지 않고 `신규 선수 등록 체중 0 범위 검증 보정 1차` 수정 티켓 등록.

## 2026-06-06 — SEO 기본 파일 GitHub push·Cloudflare 재배포 확인 1차
- Result: Step 2 완료. GitHub push 및 Cloudflare 공개 반영 확인.
- Owner: 총괄 Codex 직접 수행. GitHub Desktop push 완료 후 원격/공개 도메인을 대조.
- Git: `ff9d2c4 Add SEO sitemap and canonical URLs`가 `origin/main`에 반영됨. `main...origin/main` 차이 0.
- Public robots: `https://baseballlabsnc.com/robots.txt`에서 `Sitemap: https://baseballlabsnc.com/sitemap.xml` 확인.
- Public sitemap: `https://baseballlabsnc.com/sitemap.xml`에서 `<loc>` 13건 확인.
- Public canonical: `https://baseballlabsnc.com/`에서 `rel="canonical" href="https://baseballlabsnc.com/"` 확인.
- Headers: `HTTP/2 200`, `server: cloudflare`, `cf-cache-status: HIT`, CSP 헤더 유지.
- Note: 로컬 기본 resolver 캐시 지연으로 강제 resolve를 병행했으나 공용 DNS/공개 응답 기준 정상.
- Next: `신규 선수 등록 필수 입력 표시·검증 보정 1차`.

## 2026-06-06 — 도메인 확정 후 SEO 기본 파일 구현 1차
- Result: Step 2 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Owner: 코드 담당 Claude가 SEO 기본 파일과 canonical을 구현했고 총괄 Codex가 직접 정적 검증.
- Scope: `site/sitemap.xml` 신규 생성, `site/robots.txt` Sitemap 추가, 공개 HTML 13개 자기 canonical 추가.
- Canonical: `rel="canonical"` 13건, 모두 `https://baseballlabsnc.com/` 기준. `www`, `workers.dev`, `pages.dev` 매칭 0건.
- Sitemap: `<loc>` 13건, XML well-formed 검사 PASS.
- Safety: AdSense/analytics/gtag/JSON-LD 0건, inline handler 0건.
- Static: `node --check site/app.js`·`site/data.js` PASS, 수정 금지 경로 diff 0건.
- Next: `SEO 기본 파일 GitHub push·Cloudflare 재배포 확인 1차`.

## 2026-06-06 — baseballlabsnc.com 커스텀 도메인 연결 확인 1차
- Result: Step 2 완료. `baseballlabsnc.com` 및 `www.baseballlabsnc.com` 커스텀 도메인 연결 확인.
- Owner: 사용자가 Cloudflare route/DNS 설정을 완료했고 총괄 Codex가 DNS/HTTPS/CSP/콘텐츠를 확인.
- DNS: Cloudflare authoritative/public DNS 기준 루트와 `www` 모두 Cloudflare IP 응답.
- HTTPS: 강제 resolve 기준 `https://baseballlabsnc.com` 및 `https://www.baseballlabsnc.com` 모두 `HTTP/2 200`.
- CSP: `content-security-policy` 헤더 정상 포함.
- Content: `Baseball Lab S&C` 및 `투수·타자 모두를 위한 야구 훈련·회복·워크로드 관리` 매칭 확인.
- User check: 사용자가 모바일 폰에서도 `baseballlabsnc.com` 접속 정상 확인.
- Note: 로컬 Mac 기본 resolver는 전파/캐시 지연이 있었으나 공용 DNS와 모바일 실사용 기준 연결 완료로 판단.
- Next: `도메인 확정 후 SEO 기본 파일 구현 1차`.

## 2026-06-06 — Cloudflare Pages GitHub 저장소 연결·배포 확인 1차
- Result: Step 2 부분 완료. Cloudflare 배포 주소 정상 응답, 커스텀 도메인 연결은 아직 미완료.
- Owner: 사용자가 Cloudflare 배포 주소를 제공했고 총괄 Codex가 HTTPS/콘텐츠/CSP를 직접 확인.
- Deploy URL: `https://baseball-lab-snc.jinyoon33.workers.dev`
- HTTP: `/` 응답 `HTTP/2 200`, `server: cloudflare`, `cf-cache-status: HIT`.
- CSP: `content-security-policy` 헤더 정상 포함.
- Content: `Baseball Lab S&C` 및 `투수·타자 모두를 위한 야구 훈련·회복·워크로드 관리` 매칭 확인.
- Note: 주소가 `*.workers.dev` 형태라 Pages 기본 `*.pages.dev`가 아니라 Cloudflare Workers/Pages 배포 도메인으로 보임. 배포 자체는 정상.
- Blocker: `baseballlabsnc.com`과 `www.baseballlabsnc.com` DNS/HTTPS는 아직 미응답.
- Next: `baseballlabsnc.com 커스텀 도메인 연결 확인 1차`.

## 2026-06-06 — GitHub 저장소 생성·초기 push 1차
- Result: Step 2 완료. GitHub 원격 저장소 연결 및 `main` push 확인.
- Owner: 사용자가 GitHub 저장소를 생성했고 총괄 Codex가 로컬 첫 커밋/remote 연결 상태를 확인.
- Repository: `https://github.com/jinyoon33-png/baseball-lab-snc.git`
- Commit: `896ecb4 Initial Baseball Lab S&C site`
- Remote: `origin/main`이 로컬 `main`과 동일 커밋으로 확인됨.
- Guardrail: `.claude/`는 `.gitignore`에 추가되어 로컬 세션 설정 파일이 저장소에 올라가지 않음.
- Next: `Cloudflare Pages GitHub 저장소 연결·배포 확인 1차`.

## 2026-06-06 — baseballlabsnc.com 구매·Cloudflare Pages 연결 확인 1차
- Result: Step 2 부분 완료. 도메인 구매/소유 확인 완료, Cloudflare Pages 연결은 아직 미확인.
- Owner: 사용자가 `baseballlabsnc.com` 구매 완료를 보고했고 총괄 Codex가 WHOIS/DNS/HTTPS를 직접 확인.
- Domain: WHOIS 기준 `BASEBALLLABSNC.COM` 생성일 2026-06-06, 만료일 2027-06-06, Registrar `Cloudflare, Inc.`, name server `elijah.ns.cloudflare.com`, `rosalie.ns.cloudflare.com`.
- DNS: `dig +short baseballlabsnc.com` 및 `www.baseballlabsnc.com` 응답 없음.
- HTTPS: `curl -I https://baseballlabsnc.com` 및 `https://www.baseballlabsnc.com`은 `Could not resolve host`.
- Guardrail: 도메인 소유는 확인됐지만 Pages 연결/HTTPS 전파 전이므로 `sitemap.xml`, canonical, robots `Sitemap:` 구현은 아직 보류.
- Next: `Cloudflare Pages 프로젝트 배포·커스텀 도메인 연결 1차`.

## 2026-06-06 — 도메인 후보 확정·SEO 구현 차단 해제 요청 1차
- Result: Step 2 사용자 확인 완료. 최종 후보 도메인은 `baseballlabsnc.com`으로 확정.
- Owner: 총괄 Codex가 후보를 검토했고 사용자가 1순위 후보 채택을 확인.
- Check: `dig +short baseballlabsnc.com A baseballlabsnc.com CNAME` 응답 없음, `whois baseballlabsnc.com` 결과 `No match for domain "BASEBALLLABSNC.COM"` 확인.
- Decision: `baseballlab.com`/`thebaseballlab.com` 계열은 기존 Baseball Lab 브랜드와 혼동 위험이 있어 제외 유지.
- Guardrail: 실제 구매·소유 확인 전에는 `sitemap.xml`, canonical, robots `Sitemap:` 절대 URL, JSON-LD, AdSense/analytics 삽입 금지.
- Next: `baseballlabsnc.com 구매·Cloudflare Pages 연결 확인 1차`.

## 2026-06-06 — 운영자 이메일 contact/privacy 반영 구현 1차
- Result: Step 2 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Owner: 코드 담당 Claude가 `site/contact.html`, `site/privacy.html`을 수정했고, 총괄 Codex가 직접 정적 검증.
- Scope: `site/contact.html` 운영자 연락처와 광고/개인정보 문의 문구, `site/privacy.html` 문의 섹션에 `jim3422@naver.com` 및 `mailto:` 링크 반영.
- Clean-up: 이메일 미확정/문의 보류/임시 이메일 문구 0건.
- Static: `node --check site/app.js`·`site/data.js` PASS, inline handler 0건, 광고/analytics/canonical/JSON-LD 신규 도입 0건, 수정 금지 경로 diff 0건.
- Note: `site/terms.html`은 이번 범위에서 변경하지 않음. 약관 연락처 일관성은 도메인/SEO 묶음 전 필요 시 별도 보정 가능.
- Next: `도메인 후보 확정·SEO 구현 차단 해제 요청 1차`.

## 2026-06-06 — site/data.js 운동 설명 저작권 리스크 완화 최종 QA 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Owner: 총괄 Codex가 직접 Node VM과 정적 명령으로 최종 대조.
- Coverage: `exerciseDB` 91개, 고위험 후보 46개, 완료 46개, 잔여 0개.
- Preserve: 고위험 후보 46개에서 `sourceOrg`, `sourceTitle`, `trainingFocusFit`, `movementPattern`, `matchTags`, `volumeType` 필수 필드 누락 0건.
- Safety: `향상|부상 예방|부상 방지|최적화|보장|처방|진단|치료|위험 판정|자동 추천` 매칭 0건.
- Static: `node --check site/data.js`·`site/app.js` PASS, 출처·영상·매칭·처방 보존 grep 86건, 수정 금지 경로 diff 0건.
- Conclusion: 운동 설명 저작권 리스크 완화 묶음은 출시 전 기준 통과.
- Next: `운영자 이메일 contact/privacy 반영 구현 1차`.

## 2026-06-06 — site/data.js 운동 설명 저작권 리스크 완화 구현 5차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Owner: 코드 담당 Claude가 `site/data.js`를 수정했고, 총괄 Codex가 직접 Node VM과 정적 명령으로 대조.
- Scope: 5차 대상 6개(`스플릿 스쿼트 아이소 홀드`, `캣카우`, `코사크 스쿼트`, `스캡 푸시업`, `밴드 로우`, `스텝업`)의 사용자 노출 텍스트 필드만 보정.
- Preserve: 모든 대상 운동에서 `sourceOrg`, `sourceTitle`, `sourceUrl`, `guideYoutubeUrl`, `guideYoutubeLabel`, `guideYoutubeChannel`, `trainingFocusFit`, `movementPattern`, `matchTags`, `volumeType` 등 핵심 출처·영상·매칭 필드 유지.
- Safety: `향상|부상 예방|부상 방지|최적화|보장|처방|진단|치료|위험 판정|자동 추천` 매칭 0건.
- Static: `node --check site/data.js`·`site/app.js` PASS, 수정 금지 경로 diff 0건.
- Coverage: `Essentials of Strength Training and Conditioning` 또는 `Driveline Baseball` 기반 고위험 후보 46개 중 누적 완료 46개, 잔여 0건.
- Next: `site/data.js 운동 설명 저작권 리스크 완화 최종 QA 1차`.

## 2026-06-06 — site/data.js 운동 설명 저작권 리스크 완화 구현 4차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Owner: 코드 담당 Claude가 `site/data.js`를 수정했고, 총괄 Codex가 직접 Node VM과 정적 명령으로 대조.
- Scope: 4차 대상 10개(`90/90 밴드 외회전`, `월싯`, `버드독`, `스케이터 점프`, `월 슬라이드`, `하프니링 힙 플렉서 스트레치`, `A-스킵`, `인클라인 푸시업`, `싱글레그 글루트 브릿지`, `미니밴드 몬스터 워크`)의 사용자 노출 텍스트 필드만 보정.
- Preserve: 모든 대상 운동에서 `sourceOrg`, `sourceTitle`, `sourceUrl`, `guideYoutubeUrl`, `guideYoutubeLabel`, `guideYoutubeChannel`, `trainingFocusFit`, `movementPattern`, `matchTags`, `volumeType` 등 핵심 출처·영상·매칭 필드 유지.
- Safety: `향상|부상 예방|부상 방지|최적화|보장|처방|진단|치료|위험 판정|자동 추천` 매칭 0건.
- Static: `node --check site/data.js`·`site/app.js` PASS, 수정 금지 경로 diff 0건.
- Residual: `Essentials of Strength Training and Conditioning` 기반 잔여 고위험 후보는 6개(`스플릿 스쿼트 아이소 홀드`, `캣카우`, `코사크 스쿼트`, `스캡 푸시업`, `밴드 로우`, `스텝업`)로 축소됨.
- Next: `site/data.js 운동 설명 저작권 리스크 완화 구현 5차`.

## 2026-06-06 — site/data.js 운동 설명 저작권 리스크 완화 구현 3차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Owner: 코드 담당 Claude가 `site/data.js`를 수정했고, 총괄 Codex가 직접 Node VM과 정적 명령으로 대조.
- Scope: 3차 대상 10개(`밴드 촙 & 리프트`, `인터벌 러닝`, `래더 드릴`, `점프로프`, `메디신볼 샷풋 스로우`, `바운드 런`, `데드버그`, `트랩바(또는 덤벨) 데드리프트`, `프론 수평 외전`, `베어 크롤`)의 사용자 노출 텍스트 필드만 보정.
- Preserve: 모든 대상 운동에서 `sourceOrg`, `sourceTitle`, `guideYoutubeUrl`, `guideYoutubeLabel`, `guideYoutubeChannel`, `trainingFocusFit`, `movementPattern`, `matchTags`, `volumeType` 등 핵심 출처·영상·매칭 필드 유지. `프론 수평 외전`의 `sourceUrl` 미존재는 기존 데이터 구조상 원래 없던 값으로 분류.
- Safety: `향상|부상 예방|부상 방지|최적화|보장|처방|진단|치료|위험 판정|자동 추천` 매칭 0건.
- Static: `node --check site/data.js`·`site/app.js` PASS, 수정 금지 경로 diff 0건.
- Residual: 잔여 고위험 후보(`90/90 밴드 외회전`, `월싯`, `버드독`, `스케이터 점프`, `월 슬라이드`, `하프니링 힙 플렉서 스트레치`, `A-스킵`, `인클라인 푸시업`, `싱글레그 글루트 브릿지`, `미니밴드 몬스터 워크`)를 4차 구현으로 계속 축소한다.
- Next: `site/data.js 운동 설명 저작권 리스크 완화 구현 4차`.

## 2026-06-06 — site/data.js 운동 설명 저작권 리스크 완화 구현 2차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Owner: 코드 담당 Claude가 `site/data.js`를 수정했고, 총괄 Codex가 직접 Node VM과 정적 명령으로 대조.
- Scope: 2차 대상 10개(`코펜하겐 플랭크`, `데스 점프`, `바이크 인터벌`, `메디신볼 슬램`, `폴투폴 러닝`, `폼롤러 흉추 신전`, `글루트 브릿지`, `카리오카 스텝`, `DNS 스타 플랭크`, `사이드 셔플`)의 사용자 노출 텍스트 필드만 보정.
- Preserve: 모든 대상 운동에서 `sourceOrg`, `sourceTitle`, `guideYoutubeUrl`, `guideYoutubeLabel`, `guideYoutubeChannel`, `trainingFocusFit`, `movementPattern`, `matchTags`, `volumeType` 등 핵심 출처·영상·매칭 필드 유지. `폼롤러 흉추 신전`의 `sourceUrl` 미존재는 기존 데이터 구조상 원래 없던 값으로 분류.
- Safety: `향상|부상 예방|부상 방지|최적화|보장|처방|진단|치료|위험 판정|자동 추천` 매칭 0건.
- Static: `node --check site/data.js`·`site/app.js` PASS, 수정 금지 경로 diff 0건.
- Residual: 1·2차 미포함 고위험 후보(`밴드 촙 & 리프트`, `인터벌 러닝`, `래더 드릴`, `점프로프`, `메디신볼 샷풋 스로우`, `바운드 런`, `데드버그`, `트랩바(또는 덤벨) 데드리프트`, `프론 수평 외전`, `베어 크롤`)를 3차 구현으로 계속 축소한다.
- Next: `site/data.js 운동 설명 저작권 리스크 완화 구현 3차`.

## 2026-06-06 — site/data.js 운동 설명 저작권 리스크 완화 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Owner: 코드 담당 Claude가 `site/data.js`를 수정했고, 총괄 Codex가 직접 Node VM과 정적 명령으로 대조.
- Scope: 1차 대상 10개(`스쿼트`, `루마니안 데드리프트`, `메디신볼 로테이셔널 스로우`, `제자리 멀리뛰기`, `불가리안 스플릿 스쿼트 점프`, `불가리안 스플릿 스쿼트`, `덤벨 스내치`, `케틀벨 스윙`, `박스 점프`, `팔로프 프레스`)의 사용자 노출 텍스트 필드만 보정.
- Preserve: `sourceOrg`, `sourceTitle`, `sourceUrl`, `guideYoutubeUrl`, `guideYoutubeLabel`, `guideYoutubeChannel`, `trainingFocusFit`, `movementPattern`, `matchTags`, `volumeType` 등 핵심 출처·영상·매칭 필드 유지. `defaultThrows/defaultDurationSec` 등 미존재 필드는 운동별 `volumeType` 차이에 따른 정상 상태로 분류.
- Safety: `향상|부상 예방|부상 방지|최적화|보장|처방|진단|치료|위험 판정|자동 추천` 매칭 0건.
- Static: `node --check site/data.js`·`site/app.js` PASS, 수정 금지 경로 diff 0건.
- Residual: `Essentials of Strength Training and Conditioning`/`Driveline Baseball` 기반 잔여 고위험 후보가 남아 있어 2차 구현으로 계속 축소한다.
- Next: `site/data.js 운동 설명 저작권 리스크 완화 구현 2차`.

## 2026-06-06 — site/data.js 운동 설명 저작권 리스크 완화 설계 1차
- Result: Step 2 설계 완료. `site/*`, `docs/evidence/**`, `docs/security/**` 변경 0건.
- Owner: 총괄 Codex가 직접 설계하고 하위 에이전트 인벤토리를 보조 자료로만 사용. 직접 Node VM으로 `exerciseDB`를 로드해 최종 수치를 확정.
- Inventory: `exerciseDB` 91개. `sourceOrg`는 NSCA 48, ASMI 13, TPI 5, Driveline Baseball 3, PRI 1, 미기재 21. `sourceTitle`은 `Essentials of Strength Training and Conditioning` 43, 미기재 21, 나머지는 1~3건 분산.
- Risk priority: `Essentials of Strength Training and Conditioning` 또는 `Driveline Baseball` 기반 항목 46개를 고위험 후보로 분류. 그중 1차 구현은 사용자 노출 빈도와 긴 텍스트가 큰 `스쿼트`, `루마니안 데드리프트`, `메디신볼 로테이셔널 스로우`, `제자리 멀리뛰기`, `불가리안 스플릿 스쿼트 점프`, `불가리안 스플릿 스쿼트`, `덤벨 스내치`, `케틀벨 스윙`, `박스 점프`, `팔로프 프레스` 10개로 제한.
- Rewrite fields: 사용자 노출 텍스트 필드 `desc`, `focus`, `purpose`, `mistakes`, `setup`, `steps`, `cues`만 보정 대상으로 확정.
- Preserve fields: 운동 키, `sourceOrg`, `sourceTitle`, `sourceUrl`, `guideYoutubeUrl`, `guideYoutubeLabel`, `guideYoutubeChannel`, `userTypeFit`, `trainingFocusFit`, `movementPattern`, `matchTags`, `defaultSets`, `defaultReps`, `defaultThrows`, `defaultDurationSec`, `volumeType`, `volumeNote`, `autoSwapVolumeSafe`, `contextCondition`, `equipment`, `avoid`, `evidenceLevel`, `target`, `ageFit`, `roleFit`, `equipmentLevel`, `intensityTier`, `skillTier`는 보존.
- Static: `node --check site/data.js`·`site/app.js` PASS. `guideYoutubeUrl|sourceUrl|matchTags|trainingFocusFit|defaultSets|defaultReps|volumeType` 매칭 85건은 구현 티켓에서 변경 금지 기준으로 유지.
- Next: `site/data.js 운동 설명 저작권 리스크 완화 구현 1차`.

## 2026-06-06 — 도메인·운영자 연락처 확정 요청 1차
- Result: 부분 결정 기록 완료. 최종 도메인은 미확정으로 보류.
- Confirmed: 운영자 이메일 `jim3422@naver.com`.
- Confirmed: 배포 호스트는 `Cloudflare Pages` 권장. 배포 루트 `site/`, `_headers` 지원, HTTPS 기본 제공, Search Console은 DNS TXT 권장.
- Hold: 최종 도메인은 구매 가능 여부 확인 전이므로 `baseballlabsnc.com 우선 검토` 수준으로만 기록하고 SEO 구현은 진행하지 않는다.
- Preserve: 도메인 확정 전 `sitemap.xml`, canonical, robots `Sitemap:`, JSON-LD, AdSense/analytics 삽입 금지 원칙 유지.
- Next: `site/data.js 운동 설명 저작권 리스크 완화 설계 1차`.

## 2026-06-06 — 웹 출시 후보 패키지 최종 인벤토리 QA 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Owner: 보안/QA 하위 에이전트 점검 결과를 총괄 Codex가 직접 spot-check. 하위 에이전트 NIT(`find -name '\${escapeHTML(p.goal)' no-op 주장`)는 임시 동일 파일명 생성 테스트로 false positive 확인 후 기각.
- Inventory: 공개 HTML 13개 확인(`index`, `about`, `workload-guide`, `recovery-guide`, `assessment-guide`, `rpe-guide`, `acwr-guide`, `training-program-guide`, `warmup-shoulder-guide`, `fielding-baserunning-agility-guide`, `privacy`, `terms`, `contact`).
- Clean tree: `site/.DS_Store` 0건, `site` hidden 배포 후보 0건, 루트 stray `${escapeHTML(p.goal)` 0건, 루트 허용 파일은 `.gitignore`만 확인.
- Policy: `site/_headers` CSP 유지, `site/robots.txt` 기본 허용 유지, sitemap/canonical/JSON-LD/AdSense/analytics/inline handler/guideMedia*/`localStorage.clear(` 0건.
- Static: `node --check site/app.js`·`site/data.js` PASS.
- Next: `도메인·운영자 연락처 확정 요청 1차`.

## 2026-06-06 — 출시 체크리스트 공개 HTML 인벤토리 최신화 1차
- Result: Step 2 문서 정리 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: `docs/workflow/follow-up-queue.md`의 공개 HTML 현황을 실제 13개(`index`, `about`, `workload-guide`, `recovery-guide`, `assessment-guide`, `rpe-guide`, `acwr-guide`, `training-program-guide`, `warmup-shoulder-guide`, `fielding-baserunning-agility-guide`, `privacy`, `terms`, `contact`)로 최신화.
- Change: 완료된 `웹 출시 전 공개 문구·근거 정합성 보정 묶음`을 활성 큐에서 제거하고 처리 완료 항목으로 이동.
- Preserve: 도메인/운영자 연락처 확정 전 sitemap/canonical/JSON-LD/AdSense/analytics 금지 원칙 유지, AdSense 코드 전 보안/QA 차단 유지.
- Static: 실제 `site/*.html` 13개와 문서 목록 일치, `node --check` 2개 PASS, `site/*`·`docs/evidence/**`·`docs/security/**`·`.gitignore` diff 0건.
- Next: `웹 출시 후보 패키지 최종 인벤토리 QA 1차`.

## 2026-06-06 — 루트 stray empty file 정리 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: 루트 0바이트 이상 파일 `${escapeHTML(p.goal)` 1개 삭제.
- Static: `find . -maxdepth 1 -type f -name '\${escapeHTML(p.goal)'` 0건, `find . -name .DS_Store` 0건, `.gitignore` line 1 `.DS_Store` 유지.
- Guard: `node --check site/app.js`·`site/data.js` PASS, 수정 금지 경로 diff 0건.
- Next: `출시 체크리스트 공개 HTML 인벤토리 최신화 1차`.

## 2026-06-06 — 배포 트리 .DS_Store 정리 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: 프로젝트 하위 `.DS_Store` 23개 삭제, 루트 `.gitignore` 신규 생성 후 `.DS_Store` 1항목만 추가.
- Static: `find . -name .DS_Store -print` 0건, `.gitignore` line 1 `.DS_Store` 확인. `node --check site/app.js`·`site/data.js` PASS.
- Guard: inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Note: 루트에 0바이트 이상 파일 `${escapeHTML(p.goal)`가 남아 있음. 이번 티켓 범위 밖이지만 출시 전 배포 트리 정리 대상으로 분리 필요.
- Next: `루트 stray empty file 정리 1차`.

## 2026-06-06 — localStorage wellness 로드 순서 브라우저 실사용 확인 1차
- Result: Step 2 브라우저 확인 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Browser: `http://127.0.0.1:8774/index.html?codex_cache_bust=wellness-order-final-20260606-1`로 최신화. console error/warn 0건.
- Empty state: 기존 8774 origin에 선수 0명 상태에서는 정상 빈 목록 안내 표시, `_PAIN_WHITELIST` TDZ/`데이터 로드 실패` 텍스트 0건.
- Temp data: 임시 투수 `로드순서검증` 등록 → 새로고침 후 선수 유지 → 카드 목표 태그 `구속·파워 준비 (파워/스트렝스)` 표시 → raw 위험 문구 0건.
- Wellness: 초기 평가 저장 후 결과 화면 진입, 컨디션 버튼으로 `wellnessModal` 표시 확인. 통증 체크박스 8종과 `컨디션 저장 및 스케줄 갱신` 버튼 정상 렌더링.
- Cleanup: 임시 선수 삭제 확인. 최종 상태 선수 0명, 임시 이름 0건, console error/warn 0건.
- Static: `node --check site/app.js`·`site/data.js` PASS, `_PAIN_WHITELIST` 380 → `_ensureWellnessShape` 382 → `let players` 422 순서 유지.
- Next: `배포 트리 .DS_Store 정리 1차`.

## 2026-06-06 — localStorage wellness 로드 순서 QA 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR 0건, NIT 1건.
- Owner: 보안/QA Claude 점검 결과를 총괄 Codex가 직접 대조. 파일 수정 없이 읽기/명령 실행 기준으로 확인.
- Static: `_PAIN_WHITELIST` 380 → `_ensureWellnessShape` 382 → `let players` 422 순서 확인. 배열 8종 유지. `node --check site/app.js`·`site/data.js` PASS.
- Semi-real: Node VM으로 실제 `site/app.js`를 로드해 정상 1명, legacy pain 문자열, whitelist 밖 통증, wellness 누락 포함 3명 케이스를 확인. 전 케이스 `players` 보존, catch 미진입, console error 0건.
- Preserve: `_normalizePainAreas`, `_renderRecoveryLevelPicker`, wellness pain/recovery 정규화, 목표 라벨 안전 문구, inline handler·광고·analytics 0건 유지.
- NIT: `site/` 전체 untracked 상태라 git baseline 기반 diff 검증은 제한됨. 기존 프로젝트 운영상 비차단으로 유지.
- Next: `localStorage wellness 로드 순서 브라우저 실사용 확인 1차`.

## 2026-06-06 — localStorage wellness 로드 순서 BLOCKER 수정 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: `const _PAIN_WHITELIST` 선언을 `site/app.js:380`으로 이동해 `_ensureWellnessShape(players)` 호출과 `let players = []` 로드 블록보다 먼저 평가되도록 보정.
- Preserve: `_PAIN_WHITELIST` 배열 값, `_ensureWellnessShape`, `_normalizePainAreas`, localStorage key `pLDB_v4_5`, 저장 schema, backup/restore schema 의미상 변경 0건.
- Semi-real: Node VM에 기존 저장 선수 데이터(`age: U-18`, wellness pain/recovery 포함)를 주입해 `site/app.js`를 실행. `playersLength: 1`, 이름 유지, pain/recovery 유지, console.error 0건.
- Static: `_PAIN_WHITELIST` 380 → `_ensureWellnessShape` 382 → `let players` 422 순서 확인. `node --check` 2개 PASS, 목표 라벨 안전 문구 유지, 기존 노출 문구 0건, inline/광고/analytics 0건, 수정 금지 경로 diff 0건.
- Note: Browser Playwright 입력 API가 가상 클립보드 문제로 UI 저장 재현은 제한됨. 핵심 TDZ/로드 순서는 VM과 정적 순서로 검증.
- Next: `localStorage wellness 로드 순서 QA 1차`.

## 2026-06-06 — 출시 전 목표 라벨 안전 문구 브라우저 실사용 확인 1차
- Result: BLOCKER 발견으로 확인 중단. 다음 티켓은 수정 티켓.
- PASS: 등록/수정 화면 목표 option 라벨은 안전 문구로 표시되고 internal value(`구속 향상`, `타구속도 향상`, `부상 방지`)는 유지됨.
- PASS: 최신 포트 `8773`에서 임시 투수 등록 후 카드 목표 태그가 `구속·파워 준비 (파워/스트렝스)`로 표시되고 raw `구속 향상` 노출 0건 확인.
- PASS: 임시 테스트 데이터 삭제 후 선수 0명 상태 복구. overflow 0건.
- BLOCKER: 브라우저 로그에서 기존 저장 데이터 로드 시 `ReferenceError: Cannot access '_PAIN_WHITELIST' before initialization` 확인. 정적 확인 결과 `players` 로드 블록(`site/app.js:420-443`)이 `_ensureWellnessShape(players)`를 호출하고, `_normalizePainAreas`가 `const _PAIN_WHITELIST` 선언(`site/app.js:1790`) 전 접근할 수 있음.
- Impact: 기존 localStorage 데이터가 있는 사용자는 앱 로드 중 catch로 `players = []` 초기화될 수 있어 데이터 손실 위험.
- Static: 목표 라벨 관련 §4 정적 검증은 PASS. 발견 이슈는 목표 라벨 구현 자체가 아니라 기존 저장 데이터 로드 순서 리스크.
- Next: `localStorage wellness 로드 순서 BLOCKER 수정 1차`.

## 2026-06-06 — 출시 전 목표 라벨 안전 문구 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: `site/index.html` option 표시 텍스트 8곳 보정. option `value`는 `구속 향상`, `타구속도 향상`, `부상 방지` 그대로 유지.
- Change: `site/app.js`에 `_getGoalDisplayLabel(goal)` helper 추가, 선수 카드 `player-goal-tag` 2곳을 helper 기반 표시로 교체.
- Change: `upgradeMsg` 2곳의 `퍼포먼스 향상` 문구를 `기록 변화 확인`으로 완화.
- Preserve: `p.goal`, `p.goal === ...` 스케줄 분기 2건, 저장 schema, 스왑·워크로드·복원 로직, `site/data.js` 변경 0건.
- Static: 기존 노출 문구(`구속 향상 (...)`, `타구속도 향상 (...)`, `기존 부상 방지`, `퍼포먼스 향상`) 0건. option value 8건·스케줄 분기 2건 유지. `node --check` 2개 PASS, inline/광고/analytics 0건, 수정 금지 경로 diff 0건.
- Note: 카드 태그 helper는 선택지 표시와 동일하게 `(파워/스트렝스)` 설명을 포함한다. 실사용에서 태그 길이·가독성만 확인한다.
- Next: `출시 전 목표 라벨 안전 문구 브라우저 실사용 확인 1차`.

## 2026-06-06 — 출시 전 목표 라벨 안전 문구 설계 1차
- Result: Step 2 설계 완료. `site/*` 변경 0건.
- Decision: `goal` 저장값과 스케줄 분기 키는 유지한다. `구속 향상`, `타구속도 향상`, `부상 방지`는 기존 데이터·분기 호환성 때문에 value/schema로 보존하고, 사용자 노출 라벨만 안전 문구로 분리한다.
- Display mapping: `구속 향상` → `구속·파워 준비`, `타구속도 향상` → `타구 속도·파워 준비`, `부상 방지` → `회복·가동성 관리`. 그 외 값은 기존 문구를 그대로 표시한다.
- Implementation scope: `site/index.html` option 표시 텍스트 보정, `site/app.js` 표시 helper 추가 및 선수 카드 goal 태그 표시값 교체, upgradeMsg의 `퍼포먼스 향상` 문구를 `기록 변화 확인` 톤으로 완화.
- Preserve: option `value`, `p.goal`, `p.goal === ...` 분기, 스케줄 생성·스왑·워크로드·저장 schema·backup/restore·`site/data.js`는 변경하지 않는다.
- Static: `node --check` 2개 PASS, 감시어 grep 결과 위치 확인. 감시어는 내부 값/분기와 일부 사용자 노출 문구에 혼재되어 있어 구현 티켓에서 노출 문구만 분리한다.
- Next: `출시 전 목표 라벨 안전 문구 구현 1차`.

## 2026-06-06 — 웹 출시 전 보안/QA 최종 점검 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR 0건, NIT 2건.
- Security/Policy: 공개 HTML 13종 존재, inline handler 0건, 광고/analytics/canonical/JSON-LD/sitemap 0건, strict CSP 유지, vendor NOTICE 존재, restore 검증·source URL allowlist 확인.
- Copy: 의료·성과 보장 표현은 부정·면책 문맥만 확인. 다만 `구속 향상`, `타구속도 향상`, `부상 방지`, `퍼포먼스 향상`은 출시 전 안전 라벨 분리 대상.
- NIT: `site/` 전체 git 미추적이라 `git diff` 기반 회귀 추적 한계. `.DS_Store`는 배포 트리 제외 권고.
- Decision: NIT 2건은 출시 차단 아님. git baseline과 `.DS_Store` 정리는 배포 직전 별도 정리로 보류. 안전 문구 보정은 다음 티켓으로 즉시 진행.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 금지 항목 grep과 CSP 점검 PASS.
- Next: `출시 전 목표 라벨 안전 문구 설계 1차`.

## 2026-06-06 — 수비·주루·민첩성 공개 문서 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Browser: `http://127.0.0.1:8772/fielding-baserunning-agility-guide.html?codex_cache_bust=fielding-guide-verify-20260606-1`로 최신화 확인. `site` 기준 로컬 서버 8772 사용.
- Direct page: 제목 `수비·주루·민첩성 가이드`, 7개 섹션, 안전 고지, 하단 `doc-links` 12건 확인. 404/Not Found 징후 0건.
- Links: `index.html` 새 문서 링크 2건(`target="_blank" rel="noopener noreferrer"`), `about.html` 2건, `training-program-guide.html`/`warmup-shoulder-guide.html` 대표 링크 확인. `warmup-shoulder-guide.html`에서 새 문서 클릭 이동 정상.
- Mobile: 390px viewport에서 h1, 7개 섹션, doc-note, doc-links 표시 정상. horizontal overflow 0건.
- Console: desktop/link/mobile 확인 중 error/warn 0건.
- Static: `node --check` 2개 PASS, 금지 표현은 안전 고지의 부정·면책 문맥 1라인만 매칭, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Next: `웹 출시 전 보안/QA 최종 점검 1차`.

## 2026-06-06 — 수비·주루·민첩성 공개 문서 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: `site/fielding-baserunning-agility-guide.html` 신규 생성. 기존 공개 문서 패턴(`tokens.css`, `docs.css`, `doc-wrap`, `doc-note`, `doc-links`)을 유지.
- Links: `site/index.html` 공개 가이드 링크 묶음 2곳, `site/about.html` 공개 가이드 목록/하단 링크, 기존 7개 공개 가이드 `doc-links`에 `fielding-baserunning-agility-guide.html` 추가.
- Copy: 제목 `수비·주루·민첩성 가이드`, 섹션 7개(`주루 준비와 첫 움직임`, `가속·감속 확인`, `방향 전환과 곡선 달리기`, `수비 움직임 준비`, `민첩성 훈련 참고`, `통증 없는 범위와 보수적 조정`, `관련 가이드`) 확인.
- Safety: 자동 판정, 임계값, 보장, 부상 예방, 성과 향상, 최적화, 반복 횟수 자동, 포지션별 자동 문구 0건. `처방|진단|치료`는 안전 고지의 부정·면책 문맥 1라인만 매칭.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Note: `site/`와 `docs/`는 git 기준 untracked라 diff는 추적 파일 기준이다. 현재 파일 상태 기준 정적 검증은 PASS.
- Next: `수비·주루·민첩성 공개 문서 브라우저 실사용 확인 1차`.

## 2026-06-06 — 수비·주루·민첩성 공개 문서 설계 1차
- Result: Step 2 설계 완료. `site/*`, `docs/evidence/**`, `docs/security/**` 변경 0건.
- Decision: 새 공개 문서는 필요함. 기존 공개 문서들은 워크로드·회복·평가·프로그램 구성·준비운동 중심이고, 수비·주루·민첩성은 야구 동작 준비 관점의 독립 공개 콘텐츠 가치가 있어 분리한다.
- Filename: `site/fielding-baserunning-agility-guide.html`. 사용자 제목은 `수비·주루·민첩성 가이드`.
- Scope: 섹션은 `주루 준비와 첫 움직임`, `가속·감속 확인`, `방향 전환과 곡선 달리기`, `수비 움직임 준비`, `민첩성 훈련 참고`, `통증 없는 범위와 보수적 조정`, `관련 가이드`로 제한한다.
- Copy rule: 사용자 노출 문구는 `참고`, `확인`, `준비`, `동작 제어`, `보수적으로 조정`, `통증 없는 범위` 톤으로 제한한다. 자동 판정, 기록 임계값, 포지션별 자동 드릴 처방, 반복 횟수 자동 설정, 성과 보장 문구는 보류한다.
- Evidence: `docs/evidence/evidence-archive.md`의 `2026-05-22 — 야구 수비·주루·민첩성 훈련 근거 보강 1차`는 초기 가속·곡선 달리기, 방향 전환·감속 패턴, 유소년 민첩성 보수 적용을 참고로 정리했고 자동 판정·임계값·자동 처방은 보류로 유지했다. 소프트볼 출발 자세 자료는 야구 직접 근거가 아니라 보조 참고로만 둔다.
- Static: `node --check` 2개 PASS, 근거/문서 링크 grep 확인, 금지 표현 매칭은 기존 근거문서의 보류·부정 문맥으로만 분류, 수정 금지 경로 diff 0건.
- Next: `수비·주루·민첩성 공개 문서 구현 1차`.

## 2026-06-06 — 준비운동·어깨 가동성 공개 문서 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Browser: `http://127.0.0.1:8772/warmup-shoulder-guide.html?codex_cache_bust=warmup-guide-verify-20260606-1`로 최신화 확인. `site` 기준 새 로컬 서버 8772 사용.
- Direct page: 제목 `준비운동·어깨 가동성 가이드`, 6개 섹션, 안전 고지, 하단 `doc-links` 11건 확인. 404/Not Found 징후 0건.
- Links: `index.html` 새 문서 링크 2건(`target="_blank" rel="noopener noreferrer"`), `about.html` 2건, `training-program-guide.html`/`rpe-guide.html` 대표 링크 확인. `training-program-guide.html`에서 새 문서 클릭 이동 정상.
- Mobile: 390px viewport에서 h1, 6개 섹션, doc-note, doc-links 표시 정상. horizontal overflow 0건.
- Console: desktop/link/mobile 확인 중 error/warn 0건.
- Static: `node --check` 2개 PASS, 금지 표현 0건, `처방|진단|치료`는 부정·면책 문맥 1라인만 매칭, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Next: `수비·주루·민첩성 공개 문서 설계 1차`.

## 2026-06-06 — 준비운동·어깨 가동성 공개 문서 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. 하위 에이전트 `Newton`이 코드 담당 Claude 한도 소진 상황에서 1회 위임으로 구현.
- Change: `site/warmup-shoulder-guide.html` 신규 생성. 기존 공개 문서 패턴(`tokens.css`, `docs.css`, `doc-wrap`, `doc-note`, `doc-links`)을 유지.
- Links: `site/index.html` 공개 가이드 링크 묶음 2곳, `site/about.html` 공개 가이드 목록/하단 링크, 기존 6개 공개 가이드 `doc-links`에 `warmup-shoulder-guide.html` 추가.
- Copy: 제목 `준비운동·어깨 가동성 가이드`, 섹션 6개(`훈련 전 준비운동의 역할`, `동적 준비운동과 정적 스트레칭 구분`, `어깨·흉추·고관절 움직임 확인`, `투수 어깨 컨디셔닝 참고`, `통증 없는 범위와 중단 기준`, `관련 가이드`) 확인.
- Safety: `GIRD`, 각도 기준, 임계값, 자동 판단, 위험 판정, 부상 예방, 성과 향상, 구속 향상, 최적화, 보장 표현 0건. `처방|진단|치료`는 안전 고지의 부정·면책 문맥 1라인만 매칭.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Note: `site/`와 `docs/`는 git 기준 untracked라 diff는 추적 파일 기준이다. 현재 파일 상태 기준 정적 검증은 PASS.
- Next: `준비운동·어깨 가동성 공개 문서 브라우저 실사용 확인 1차`.

## 2026-06-05 — 준비운동·어깨 가동성 공개 문서 설계 1차
- Result: Step 2 설계 완료. `site/*`, `docs/evidence/**`, `docs/security/**` 변경 0건.
- Decision: 새 공개 문서는 필요함. 기존 `training-program-guide.html`은 훈련 구성 전반이고, 준비운동·어깨 가동성·투수 어깨 컨디셔닝은 웹 출시 전 검색/광고용 독립 콘텐츠 가치가 있어 분리한다.
- Filename: `site/warmup-shoulder-guide.html`. 사용자 제목은 `준비운동·어깨 가동성 가이드`.
- Scope: 섹션은 `훈련 전 준비운동의 역할`, `동적 준비운동과 정적 스트레칭 구분`, `어깨·흉추·고관절 움직임 확인`, `투수 어깨 컨디셔닝 참고`, `통증 없는 범위와 중단 기준`, `관련 가이드`로 제한한다.
- Copy rule: 사용자 노출 문구는 `참고`, `확인`, `준비`, `통증 없는 범위`, `필요 시 전문가 상담` 톤으로 제한한다. `GIRD` 직접 라벨, 각도 기준, 자동 판단, 부상 예방 보장, 성과 보장, 수치 처방은 보류한다.
- Evidence: `docs/evidence/evidence-archive.md`의 `2026-05-21 — 준비운동·어깨 가동성·투수 어깨 관리 근거 보강 3차`는 동적 준비운동 참고, 단독 정적 스트레칭 경계, 투수 어깨 가동성 참고 수준, 자동 판단/보장 문구 보류로 정리되어 있음.
- Static: `node --check` 2개 PASS, 근거/문서 링크 grep 확인, 금지 표현 매칭은 기존 근거문서의 보류·부정 문맥으로만 분류, 수정 금지 경로 diff 0건.
- Next: `준비운동·어깨 가동성 공개 문서 구현 1차`.

## 2026-06-05 — exercise guide 금지 표현 안전 문구 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Browser: `http://127.0.0.1:8771/?codex_cache_bust=exercise-copy-verify-20260605-2`에서 앱 로드 확인. 기존 서버 8770은 종료되어 `site` 기준 임시 서버 8771을 사용.
- Desktop: 앱 title과 `Baseball Lab S&C` 브랜드 로드 정상, horizontal overflow 0건, console error/warn 0건.
- Mobile: 390px viewport에서 앱 로드 정상, horizontal overflow 0건, console error/warn 0건.
- Data: Browser 런타임에서 `data.js` 전역 객체 직접 접근은 불가했으나, Node VM으로 실제 `exerciseDB` 91개를 로드해 대표 운동 5개(`루마니안 데드리프트`, `90/90 고관절 스트레치`, `리버스 스로우`, `메디신볼 샷풋 스로우`, `아이싱 및 휴식`) 확인. 금지·주의 표현 0건.
- Static: `node --check` 2개 PASS, 금지 표현 grep 0건, 추가 의료성 표현 grep 0건, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Next: `준비운동·어깨 가동성 공개 문서 설계 1차`.

## 2026-06-05 — exercise guide 금지 표현 안전 문구 스윕 구현 1차
- Result: Step 2 구현 완료. 하위 에이전트 `Linnaeus`가 `site/data.js` 텍스트 문구만 보정했고, 총괄 Codex가 직접 정밀검토 완료.
- Change: `구속 향상`, `부상 방지/예방/위험 감소`, `최적화`, `향상`, `극대화`, `효과적` 계열을 `준비`, `확인`, `훈련`, `개발`, `활용 가능`, `저부하 활성화`, `컨디셔닝` 톤으로 완화.
- Extra pass: exact grep 밖에 남던 `재활`, `예방 프로토콜`, `염증 억제`, `조직 회복`, `회복 촉진`, `필수 회복`, `회복에 유리`, `안전하게 수행 가능`, `안전하게 활성화`, `통증 악화` 계열도 추가 보정.
- Preserve: 운동 이름, 객체 키, URL, matchTags, trainingFocusFit, userTypeFit, 볼륨 필드, 스왑/스케줄 연결 필드는 변경 대상에서 제외.
- Static: `node --check site/data.js` PASS, `node --check site/app.js` PASS. 금지·주의 표현 grep 0건, 추가 의료성 표현 grep 0건, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Note: `site/`와 `docs/`는 git 기준 untracked라 diff는 추적 파일 기준이다. 현재 파일 상태 기준 정적 검증은 PASS.
- Next: `exercise guide 금지 표현 안전 문구 브라우저 실사용 확인 1차`.

## 2026-06-05 — exercise guide 금지 표현 안전 문구 스윕 설계 1차
- Result: Step 2 설계 완료. `site/*` 변경 0건.
- Scope: `site/data.js` 운동 설명의 사용자 노출 가능 필드(`desc`, `focus`, `purpose`, `mistakes`, `cues`, `setup`, `steps`)만 문구 보정 대상으로 확정. 운동 분류, 볼륨, matchTags, sourceUrl, YouTube 링크, 스왑 로직 필드는 변경 금지.
- Findings: 1차 금지어 grep은 `부상 예방`, `부상 위험 감소`, `구속 향상`, `최적화` 등 6라인을 잡았고, 확장 grep에서 `부상 방지`, `향상`, `극대화`, `효과적`까지 포함해 27라인을 보정 후보로 분류.
- Immediate: line 109 주석, 112/113/114/115/119/124/128/134/135의 부상·최적화·구속 표현은 즉시 보정. 안전 대체는 `움직임 안정성`, `가동성 준비`, `회전 파워 구성 참고`, `어깨·흉추 컨디셔닝`.
- Wording pass: line 85/87/100/107/111/131/132/139/151/152/161/162/163/164/166의 `향상`, `극대화`, `효과적`은 보장처럼 보이지 않게 `훈련`, `확인`, `다룬다`, `참고`, `준비` 톤으로 완화.
- Evidence: 근거문서는 `부상 예방 보장`, `성과 향상 보장`, `최적`, `처방`, `진단`, `치료` 표현을 보류로 고정하고, 사용자 노출 문구는 참고·확인·조정 고려 수준을 권장.
- Static: `node --check` 2개 PASS, 수정 금지 경로 diff 0건. `purpose/focus/desc/mistakes/cues/setup/steps` 필드 라인 수는 100건으로 확인.
- Next: `exercise guide 금지 표현 안전 문구 스윕 구현 1차`.

## 2026-06-05 — recovery-guide 수면·회복 문구 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Browser: `http://127.0.0.1:8770/recovery-guide.html?codex_cache_bust=recovery-guide-verify-20260605-1`에서 확인.
- Desktop: 섹션 4개, doc-links 9건, 안전 고지 표시 정상. 단정/숫자/부상 위험 문구 0건, 수면 보정 문구·전문가 확인·참고 정보 문구 확인.
- Mobile: 390px viewport에서 horizontal overflow 0건. 본문·doc-note·하단 링크 표시 정상.
- Console: error/warn 0건.
- Static: `node --check` 2개 PASS, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Next: `exercise guide 금지 표현 안전 문구 스윕 설계 1차`.

## 2026-06-05 — recovery-guide 수면·회복 단정 표현 완화 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: `site/recovery-guide.html`의 수면 설명을 `수면 부족이 누적되는 주에는 ACWR 값과 별개로 회복 상태가 떨어질 수 있으므로 컨디션·피로도와 함께 확인합니다.`로 완화.
- Copy: `회복이 느립니다` 단정 표현 제거. 수면은 회복 상태를 확인하는 참고 신호로 제한하고, 컨디션·피로도와 함께 확인하는 문구로 정리.
- Preserve: 전문가 확인, `치료 목적 아님`, `의료 진단·치료·처방 도구가 아님` 면책 문구 유지.
- Static: 단정/숫자 기준/부상 예측 grep 0건, 회복 상태·컨디션·피로도·함께 확인 문구 확인, `node --check` 2개 PASS, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Note: 활성 워크플랜 결과 기록의 과거 날짜 표기는 아카이브에서 현재 날짜 기준으로 정리.
- Next: `recovery-guide 수면·회복 문구 브라우저 실사용 확인 1차`.

## 2026-06-05 — workload-guide ACWR 공개 문구 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Browser: `http://127.0.0.1:8770/workload-guide.html?codex_cache_bust=workload-guide-verify-20260605-1`에서 확인. 기존 서버가 꺼져 있어 `site` 기준 새 로컬 서버 8770으로 확인.
- Desktop: 섹션 4개, doc-links 9건, 안전 고지 표시 정상. 숫자 임계값 직접 노출 0건, 참고 지표·참고 신호·함께 확인·조정 고려 문구 확인.
- Mobile: 390px viewport에서 horizontal overflow 0건. 본문·doc-note·하단 링크 표시 정상.
- Console: error/warn 0건.
- Static: `node --check` 2개 PASS, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Next: `recovery-guide 수면·회복 단정 표현 완화 1차`.

## 2026-06-05 — workload-guide ACWR 숫자 임계값 공개 문구 보정 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: `site/workload-guide.html`의 ACWR `0.8~1.3`, `1.5 이상`, `안정 구간`, 처방형 조정 문구를 제거하고 참고 지표·참고 신호 중심 문구로 완화.
- Copy: ACWR은 최근 7일/28일 평균 부하 흐름을 확인하는 지표로 설명. RPE·통증·수면·컨디션 기록을 함께 확인하고 훈련량 조정을 고려하는 수준으로 제한.
- Preserve: `부상 예방을 보장하지 않습니다`, `의료 진단·치료·처방을 대체하지 않음` 면책 문구 유지.
- Static: 숫자 임계값/자동 위험/부상 예측 grep 0건, 참고 지표·참고 신호 문구 확인, `node --check` 2개 PASS, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Note: 현재 `site/`와 `docs/`는 git untracked 상태라 `git diff`는 추적 파일 기준으로만 동작함. 직접 파일 내용과 금지 경로 diff를 함께 확인.
- Next: `workload-guide ACWR 공개 문구 브라우저 실사용 확인 1차`.

## 2026-06-05 — 앱 전환 로드맵 설계 1차
- Result: Step 2 설계 완료. 웹사이트 우선 출시 후 앱 전환을 별도 단계로 진행하는 방향으로 정리.
- Decision: 웹 출시 전에는 로그인·클라우드 동기화·AdMob을 넣지 않는다. 도메인, 운영자 이메일, SEO, 정책 문서, 품질 안정화, AdSense 준비를 먼저 처리한다.
- App path: 웹 출시 후 `PWA/TWA 우선 검토`가 권장안. 네이티브 앱, 로그인, 서버 저장, 앱 광고는 별도 설계와 보안/QA 후 진행한다.
- Security gates: 인증 SDK, 서버 저장, AdSense/AdMob, analytics, 계정 삭제, 앱 패키징, privacy/data safety 문구 변경 전 보안/QA 호출 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, inline handler 0건, 광고/canonical/JSON-LD/analytics/auth SDK 토큰 0건, 수정 금지 경로 diff 0건.
- Next: 웹사이트 출시 전 공개 문구·근거 정합성 보정 묶음으로 전환.

## 2026-06-05 — 품질 안정화 회귀 QA 묶음 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, inline handler 0건, 광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- App flow: 임시 선수 등록, 8종목 평가 저장, 결과/스케줄 진입, 선수 수정 모달 열림/닫힘 정상. 임시 선수는 삭제했고 목록은 `등록된 선수가 없습니다` 상태로 복귀.
- Schedule: 카드형/주간/월간 전환 정상. 월간 진입 후 주간 복귀 시 `monthlyCalendarContainer` 숨김 확인. 스케줄 이미지 저장 버튼 표시 확인.
- Modals: 운동 가이드 모달, 대체훈련 모달, 워크로드 모달 열림/닫힘 정상. 대체 확정·워크로드 저장은 수행하지 않음.
- RPE: 11셀 존재, RPE 6 선택 시 `#wlRPE` 값·aria 선택 반영. RPE 6 + 횟수 10 입력 시 `실시간 예상 워크로드: 60` 표시.
- Public docs: 공개 문서 11개 로드 확인, 404/Not Found 0건, desktop horizontal overflow 0건. `training-program-guide` 390px 모바일 overflow 0건.
- Data note: QA용 임시 선수만 생성·삭제. 기존 사용자 데이터 삭제·초기화 작업 없음.
- Next: `앱 전환 로드맵 설계 1차`.

## 2026-06-05 — 야구 S&C 훈련 프로그램 구성 가이드 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Browser: `http://127.0.0.1:8769/training-program-guide.html?codex_cache_bust=training-guide-verify-20260605-final`로 최신화.
- Direct page: 제목 `야구 S&C 훈련 프로그램 구성 가이드`, 01~07 섹션, 안전 고지, 하단 `doc-links` 9건 확인.
- Links: `앱으로 돌아가기`와 하단 링크 9건 모두 실제 페이지 로드 확인. 404/Not Found 징후 없음.
- Index: `index.html`의 `training-program-guide.html` 링크 2건 확인. 앱 가이드 모달 열림, 모달 내부 링크 존재, `target="_blank" rel="noopener noreferrer"` 정상.
- Mobile: 390px viewport에서 horizontal overflow 없음. `doc-note`와 하단 링크 묶음이 화면 폭 안에서 줄바꿈됨.
- Dark/console: 현재 브라우저 다크모드에서 본문·제목·링크·안전 고지 토큰 색상 정상. console error/warning 0건.
- Next: `품질 안정화 회귀 QA 묶음 1차`.

## 2026-06-05 — 야구 S&C 훈련 프로그램 구성 가이드 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: `site/training-program-guide.html` 신규 생성. 기존 공개 문서 UI 패턴(`tokens.css`, `docs.css`, `doc-wrap`, `doc-links`)을 유지.
- Links: `training-program-guide.html` 내부 링크 9건 확인(`about` 2, `index` 2, `workload/rpe/acwr/recovery/assessment` 각 1).
- Static: 핵심 제목·섹션 헤딩 매칭 정상, `node --check site/app.js` PASS, `node --check site/data.js` PASS, inline handler/광고/canonical/JSON-LD/analytics 0건, 수정 금지 경로 diff 0건.
- Copy: 금지어 grep 3건은 `처방하지 않습니다`, `의료 진단·치료·처방 도구가 아닙니다`, `의료 진단·치료·처방을 대체하지 않습니다`로 모두 부정·면책 문맥. 능동 금지 표현과 수치 처방 0건.
- Preserve: `site/app.js`, `site/data.js`, `site/style.css`, `site/docs.css`, `site/tokens.css`, `site/assets/**`, `site/vendor/**`, `docs/evidence/**`, `docs/security/**` 변경 0건.
- Next: `야구 S&C 훈련 프로그램 구성 가이드 브라우저 실사용 확인 1차`.

## 2026-06-05 — 공개 콘텐츠 확장 후보 설계 1차
- Result: Step 2 설계 완료. 다음 공개 문서는 `야구 S&C 훈련 프로그램 구성 가이드`.
- Decision: 활성 근거문서 기준으로 일반 야구 S&C, 훈련 매칭 판단, matchTags 설명 문구 원칙을 안전하게 활용할 수 있어 후보 C를 선정.
- Hold: 회복/수면은 기존 `recovery-guide.html`이 이미 존재하므로 확장 후보로 보류. 준비운동·어깨 관리와 수비·주루·민첩성은 archive 완료 참조 또는 보조 근거 성격이 강해 후속 후보로 보류.
- Copy rule: `최적`, `처방`, `진단`, `성과 향상 보장`, `부상 예방 보장`, `자동 위험 판정`, `부상 예측` 같은 표현은 금지. 수치 처방·세트/반복/%1RM 직접 노출도 보류.
- Static: 공개 HTML 10개 확인, 근거문서 활성 섹션 검토, 금지 표현은 기존 면책/부정 문맥만 매칭, 광고/canonical/JSON-LD/분석 코드 0건, `node --check` 2개 PASS.
- Preserve: `site/*`, `docs/evidence/**`, `docs/security/**` 변경 0건.
- Next: `야구 S&C 훈련 프로그램 구성 가이드 구현 1차`.

## 2026-06-05 — AdSense/출시 준비 체크리스트 작성 1차
- Result: Step 2 작성 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: `docs/workflow/follow-up-queue.md`에 AdSense/출시 준비 체크리스트 추가.
- Checklist: 현재 상태, 도메인/연락처 확정 전 금지, 사용자 확정 필요값, 확정 후 SEO 작업, 광고 코드 전 보안/QA 호출 조건으로 분리.
- Hold: 최종 도메인 전 `sitemap.xml`, canonical, robots `Sitemap:`, JSON-LD, AdSense/analytics/gtag 코드 삽입 금지.
- Static: 공개 HTML 10개 확인, `robots.txt` 2줄 유지, 광고/canonical/JSON-LD/분석 코드 0건, `node --check` 2개 PASS.
- Preserve: `site/*`, `docs/evidence/**`, `docs/security/**` 변경 0건.
- Next: `공개 콘텐츠 확장 후보 설계 1차`.

## 2026-06-05 — 다음 상업화/출시 준비 작업 선정 1차
- Result: Step 2 선정 완료. 다음 활성 티켓은 `AdSense/출시 준비 체크리스트 작성 1차`.
- Decision: 후보 A를 우선 진행. 이유는 도메인·운영자 연락처·Search Console·sitemap/canonical·정책 최종 고지가 광고 삽입과 공개 배포 전제이기 때문.
- Queue: 후보 B 공개 콘텐츠 확장, 후보 D 품질 안정화, 후보 C 앱 전환 로드맵은 후속 큐에 보류 순서로 기록.
- Static: 공개 HTML 10개 확인, 핵심 가이드 링크 매칭 정상, 광고/canonical/JSON-LD/분석 코드 0건, `node --check` 2개 PASS.
- Sources: Google AdSense site readiness, Program policies, Ad placement policies, Required content, Google Search robots/sitemap/canonical 문서 기준.
- Preserve: `site/*`, `docs/evidence/**`, `docs/security/**` 변경 0건.
- Next: `AdSense/출시 준비 체크리스트 작성 1차`.

## 2026-06-04 — robots.txt 브라우저 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `정상`.
- Browser: 기존 `8767/8000` 서버 응답 실패 확인 후 `127.0.0.1:8768` 새 서버로 최신화. 사용자가 `robots.txt` 표시 정상 확인.
- Content: `site/robots.txt`는 `User-agent: *`와 `Allow: /` 2줄만 유지.
- Static: `test -f site/robots.txt` PASS, `Sitemap:` 0건, `Disallow:` 0건, `site/sitemap.xml` 없음.
- Safety: canonical/JSON-LD/광고/분석 코드 0건, `node --check` 2개 PASS, 수정 금지 경로 diff 0건.
- Next: 후속 큐가 비어 있어 `다음 상업화/출시 준비 작업 선정 1차`로 전환.

## 2026-06-04 — robots.txt 기본 허용 파일 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: `site/robots.txt` 신규 생성. 내용은 `User-agent: *`와 `Allow: /` 2줄.
- Static: `site/robots.txt` 존재, `Sitemap:` 0건, `Disallow:` 0건, `site/sitemap.xml` 없음.
- Safety: canonical/JSON-LD/광고/분석 스크립트 0건, inline handler 0건, `node --check` 2개 PASS.
- Preserve: HTML/JS/CSS/data/assets/vendor/evidence/security 변경 0건.
- Next: `robots.txt 브라우저 확인 1차`.

## 2026-06-04 — SEO 기본 파일 준비 설계 1차
- Result: Step 2 설계 완료. `site/*` 변경 0건.
- Current: `site/robots.txt`와 `site/sitemap.xml` 없음. 공개 HTML 10개는 모두 `<meta name="robots" content="index, follow">` 존재. canonical/JSON-LD 없음.
- Decision: 도메인 미확정 상태에서 즉시 구현 가능한 작업은 `site/robots.txt` 기본 허용 파일(`User-agent: *`, `Allow: /`) 추가로 제한한다.
- Hold: `sitemap.xml`은 Google Search Central 기준 완전한 절대 URL이 필요하므로 최종 도메인 확정 후 생성. `robots.txt`의 `Sitemap:` 지시문도 도메인 확정 전에는 넣지 않는다.
- Hold: canonical은 최종 대표 URL이 확정된 뒤 각 HTML에 삽입한다. JSON-LD는 보안/QA 별도 검토 전까지 보류.
- Sources: Google Search Central robots.txt reference, sitemap build guide, canonical guide 기준.
- Static: `node --check` 2개 PASS, inline handler 0건, 광고/분석/JSON-LD 0건, 수정 금지 경로 diff 0건.
- Next: `robots.txt 기본 허용 파일 구현 1차`.

## 2026-06-04 — 광고/분석 정책 문서 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `정상`.
- Browser: `http://127.0.0.1:8767/privacy.html?codex_cache_bust=policy-verify-20260604-1`에서 정책 문서 흐름 확인.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 정책 보강 키워드 매칭 정상.
- Safety: 실제 광고/분석/canonical/JSON-LD 코드 0건, inline handler 0건, 수정 금지 경로 diff 0건.
- Preserve: 문구는 향후 도입 시 고지로 읽히며 운영자 이메일·도메인 확정 표현 없음.
- Next: `SEO 기본 파일 준비 설계 1차`.

## 2026-06-04 — 광고/분석 정책 문서 보강 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: `site/privacy.html`에 Google AdSense/분석 도구 도입 시 쿠키·웹 비콘·IP 주소·광고 식별자 가능성과 Google 파트너 사이트 데이터 사용 링크 추가.
- Change: `site/terms.html`에 광고와 콘텐츠 구분, 광고 클릭 유도 금지, 앱 조작 영역 광고 배치 금지 원칙 추가.
- Change: `site/contact.html`에 정식 연락처 공개 후 광고/개인정보 문의 접수 경로와 도입 시점 문서 갱신 원칙 추가.
- Static: `node --check` 2개 PASS, 정책 보강 키워드 매칭 정상, Google 외부 링크 `target="_blank" rel="noopener noreferrer"` 확인.
- Safety: 실제 광고/분석/canonical/JSON-LD 코드 0건, inline handler 0건, 수정 금지 경로 diff 0건. 운영자 이메일·도메인은 확정 표현 없음.
- Next: `광고/분석 정책 문서 브라우저 실사용 확인 1차`.

## 2026-05-28 — 광고/분석 정책 문서 보강 설계 1차
- Result: Step 2 설계 완료. `site/*` 변경 0건.
- Current: `privacy`와 `terms`는 현재 광고/분석 없음과 도입 전 갱신 원칙을 이미 고지한다. `contact`는 운영자 이메일 미확정 상태를 명시한다.
- Gap: AdSense 준비 관점에서는 쿠키·웹 비콘·IP/광고 식별자 가능성, Google 파트너 사이트 데이터 사용 안내 링크, 광고 배치 원칙, 광고/개인정보 문의 경로를 더 구체화해야 한다.
- Immediate implementation: `privacy` §5·§6 보강(현재 없음 유지 + 향후 AdSense/analytics 도입 시 쿠키·식별자·제3자 광고 데이터 처리 고지), `terms` §6 보강(광고 구분·오클릭 유도 금지·앱 조작 화면 주변 광고 금지 원칙), `contact` §3·§4 보강(정식 공개 전 이메일 미확정 유지 + 광고/개인정보 문의는 공개 연락처 확정 후 처리).
- Hold: 실제 운영자 이메일, 도메인 URL, AdSense 코드, analytics 코드, consent banner, canonical/JSON-LD는 도메인·운영 정책 확정 후 별도 티켓.
- Sources: Google AdSense Privacy disclosures, How AdSense uses cookies, Ad placement policies 기준.
- Static: `node --check` 2개 PASS, inline handler 0건, 광고/canonical/JSON-LD 0건, 수정 금지 경로 diff 0건.
- Next: `광고/분석 정책 문서 보강 구현 1차`.

## 2026-05-28 — ACWR 안전한 해석 가이드 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `정상`.
- Browser: `http://127.0.0.1:8767/acwr-guide.html?codex_cache_bust=acwr-guide-verify-20260528-1`에서 확인.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `site/acwr-guide.html` 존재 확인.
- Safety: 금지 표현·숫자 임계값 직접 노출 0건, `ACWR을 훈련 부하 참고 지표로 이해하고` meta 1건, `acwr-guide.html` 링크 8건 유지.
- Preserve: inline handler 0건, 광고/canonical/JSON-LD 0건, 수정 금지 경로 diff 0건.
- Next: `광고/분석 정책 문서 보강 설계 1차`.

## 2026-05-28 — ACWR 안전한 해석 meta 금지 표현 보정 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: `site/acwr-guide.html:6` meta description에서 `부상 예측이 아닌` 토큰 제거. 신규 문구는 `ACWR을 훈련 부하 참고 지표로 이해하고, 급격한 부하 증가·회복 상태·통증 신호를 함께 확인하는 방법을 설명합니다.`
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `부상 위험 예측|자동 위험 판정|위험 판정|부상 예측|보장|최적화|0.8|1.3|1.5` 0건.
- Safety: `진단·치료·처방` 2건은 모두 `도구가 아닙니다` 부정 면책 문맥. `acwr-guide.html` 링크 8건 유지, inline handler 0건, 광고/canonical/JSON-LD 0건.
- Preserve: JS/CSS/data/assets/vendor/evidence/security 변경 0건.
- Next: `ACWR 안전한 해석 가이드 브라우저 실사용 확인 1차`.

## 2026-05-28 — ACWR 안전한 해석 공개 문서 구현 1차
- Result: Step 2 구현 완료 정밀검토 결과 MINOR 1건. 수정 티켓 필요.
- Change: `site/acwr-guide.html` 신규 88줄, `acwr-guide.html` 내부 링크 8곳 추가.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `acwr-guide.html` 존재 확인, 내부 링크 8건, inline handler 0건, 광고/canonical/JSON-LD 0건, 수정 금지 경로 diff 0건.
- Preserve: `site/app.js`, `site/data.js`, CSS, assets, vendor, evidence/security 문서 변경 0건.
- MINOR: `site/acwr-guide.html:6` meta description에 `부상 예측` 1건이 부정 문맥으로 남아 있음. 설계 문구에서 유래했으나 완료 조건의 금지 표현 0건과 충돌하며, 공개 SEO 문구라 보정 필요.
- Next: `ACWR 안전한 해석 meta 금지 표현 보정 1차`.

## 2026-05-28 — ACWR 안전한 해석 공개 문서 설계 1차
- Result: Step 2 설계 완료. `site/*` 변경 0건.
- Context: 기존 `site/workload-guide.html`은 워크로드/ACWR 계산 개념과 기본 활용을 이미 설명한다. 신규 문서는 계산식 반복이 아니라 `ACWR 수치를 과장 없이 읽는 법`에 집중한다.
- Document: 신규 후보 `site/acwr-guide.html`, title `ACWR 안전한 해석 가이드 — Baseball Lab S&C`, meta `ACWR을 부상 예측이 아닌 훈련 부하 참고 지표로 이해하고, 급격한 부하 증가·회복 상태·통증 신호를 함께 확인하는 방법을 설명합니다.`
- Sections: 01 ACWR이 보여주는 것, 02 숫자보다 변화 흐름, 03 앱에서 함께 볼 항목, 04 부하 증가 시 확인할 것, 05 하지 말아야 할 해석, 06 기록 품질을 높이는 방법, 07 한계와 안전 고지.
- Copy policy: 허용 표현은 `훈련 부하 참고 지표`, `부하 증가 확인`, `휴식·강도 조정 검토`, `회복 상태와 함께 확인`. 금지 표현은 `부상 위험 예측`, `자동 위험 판정`, `안전/위험 단정`, `처방/진단/치료`, `보장/최적화`.
- Link plan: `index`, `about`, `workload-guide`, `rpe-guide`, `recovery-guide`, `assessment-guide`에서 `ACWR 안전한 해석`으로 내부 링크 추가. 실제 광고 slot은 삽입하지 않고 공개 문서 본문 중하단 후보로만 기록.
- Static: `node --check` 2개 PASS, inline handler 0건, 광고/canonical/JSON-LD 0건, 수정 금지 경로 diff 0건.
- Next: `ACWR 안전한 해석 공개 문서 구현 1차`.

## 2026-05-28 — RPE 입력 가이드 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `모두 정상`.
- Browser: `http://127.0.0.1:8767/rpe-guide.html?codex_cache_bust=rpe-guide-verify-20260528-1`에서 확인.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `site/rpe-guide.html` 존재 확인.
- Safety: `자동 위험 판정|위험 판정|부상 예측` 0건, `RPE 평균값만으로 훈련 가능 여부를 단정하지 않습니다.` 1건, `rpe-guide.html` 링크 7건 유지.
- Preserve: inline handler 0건, 광고/canonical/JSON-LD 0건, 수정 금지 경로 diff 0건.
- Next: `ACWR 안전한 해석 공개 문서 설계 1차`.

## 2026-05-28 — RPE 입력 가이드 금지 표현 보정 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR/NIT 0건.
- Change: `site/rpe-guide.html:62`의 `자동 위험 판정` 부정 문맥을 `RPE 평균값만으로 훈련 가능 여부를 단정하지 않습니다.`로 보정.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `자동 위험 판정|위험 판정|부상 예측` 0건, 안전 대체 문구 1건, `rpe-guide.html` 링크 7건 유지.
- Safety: inline handler 0건, 광고/canonical/JSON-LD 0건, 수정 금지 경로 diff 0건. `진단·치료·처방` 매칭 1건은 의료 목적 부정 면책 문맥.
- Preserve: 같은 문단의 `워크로드/ACWR 가이드` 링크 유지, JS/CSS/data 변경 0건.
- Next: `RPE 입력 가이드 브라우저 실사용 확인 1차`.

## 2026-05-28 — RPE 입력 가이드 공개 문서 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR 0건, MINOR 1건.
- Change: `site/rpe-guide.html` 신규 88줄, 기존 공개 문서/앱 링크 7곳에 `RPE 입력 가이드` 추가.
- Static: `rpe-guide.html` 구조는 기존 docs page 패턴과 일관. `rpe-guide.html` 링크 7건, inline handler 0건, 광고/canonical/JSON-LD 0건, 수정 금지 경로 diff 0건.
- MINOR: `site/rpe-guide.html:62`의 `자동 위험 판정`은 부정 문맥이지만 상업화 공개 콘텐츠에서는 강한 용어 자체를 줄이는 편이 안전.
- Preserve: JS/CSS/data 변경 0건.
- Next: `RPE 입력 가이드 금지 표현 보정 1차`.

## 2026-05-27 — 공개 콘텐츠 확장 설계 1차
- Result: Step 2 설계 완료. 결론은 `RPE 입력 가이드`를 첫 신규 공개 콘텐츠로 작성.
- Existing docs: 핵심 가이드 4개(`about`, `workload-guide`, `recovery-guide`, `assessment-guide`) 총 255라인. 신뢰 문서 역할은 충분하나 검색 유입/광고 콘텐츠로는 깊이 부족.
- Candidates: 1) `RPE 입력 가이드` 즉시 작성 가능, 2) `ACWR 안전한 해석` 즉시 작성 가능, 3) `야구 S&C 기초` 근거문서 검토 후, 4) `준비운동·어깨 관리` 근거문서 검토 후, 5) `유소년·학생선수 훈련 조정` 근거문서 검토 후.
- First structure: RPE 정의, 0-10 입력법, 피칭/타격/수비훈련 기록 예시, 유소년 범주형 설명, 흔한 실수, 한계/면책, 관련 링크.
- AdSense fit: 공개 문서형 콘텐츠이며 앱 조작 화면이 아니라 광고 후보로 전환 가능. 단 실제 광고 slot은 추후 별도 티켓.
- Preserve: `site/*` 변경 0건. 금지 표현은 기존 면책·부정 문맥만 매칭.
- Next: `RPE 입력 가이드 공개 문서 구현 1차`.

## 2026-05-27 — 상업화 정책/SEO 준비 설계 1차
- Result: Step 2 설계 완료. 결론은 `도메인/이메일 확정 전에는 문서 보강 준비와 콘텐츠 확장부터 진행`.
- Policy split: 확정 전 가능 = privacy/terms/contact에 광고·분석 도입 예정 범위와 사용자 고지 원칙을 더 명확히 설계. 확정 후 가능 = 운영자 이메일, 도메인 URL, 실제 광고 사업자/동의/거부 절차 반영.
- SEO split: 즉시 가능 = title/meta/robots 현황 유지, 내부 링크 점검, 공개 콘텐츠 확장. 도메인 확정 후 = `robots.txt`, `sitemap.xml`, canonical URL. 보안 검토 후 = JSON-LD/AdSense/외부 스크립트.
- Ad slots: 허용 = 공개 가이드 문서 본문 중간/하단. 보류 = 홈 하단, 문서 상단. 금지 = 등록/평가/워크로드/RPE/백업/복원/삭제/운동 대체/모달 버튼 주변.
- App path: 광고/분석은 웹 정책 문서와 동의 흐름 정리 후, 앱 단계에서 AdMob·로그인·동기화·스토어 건강/개인정보 정책을 별도 설계.
- Preserve: `site/*` 변경 0건. 실제 광고 스크립트/JSON-LD/외부 분석 삽입 없음.
- Next: `공개 콘텐츠 확장 설계 1차`.

## 2026-05-27 — ACWR 사용자 노출 문구 안전화 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: `site/app.js` 사용자 노출 문자열 10개 계열을 `위험/부상 위험` 톤에서 `부하 참고/부하 증가/조정 검토` 톤으로 교체.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 사용자 노출 위험 단정 문구 0건. 안전 대체 문구 10개 계열 반영 확인.
- Preserve: `calculateACWRMetrics`, `renderACWR`, threshold, deload, schedule, swap, `exerciseSwaps`, `dailyCompletion`, 저장 schema 변경 0건. 수정 금지 경로 diff 0건.
- Residual: 개발자 주석 2건(`주의 영역`, `ACWR 위험 구간`)은 사용자 비노출이라 NIT 보류.
- Next: `상업화 정책/SEO 준비 설계 1차`.

## 2026-05-27 — ACWR 사용자 노출 문구 안전화 설계 1차
- Result: Step 2 설계 완료. 결론은 `사용자 노출 문자열만 보수적 표현으로 교체`.
- Inventory: 사용자 노출 후보 10건 확인. `renderACWR` 상태 문구 5건(L3334·3337·3340·3343·3346), 팀 대시보드 라벨 1건(L3940), quick tag 2건(L3979-L3980), wellness badge 2건(L4300·4302), schedule status 1건(L4527). 주석 L4685·4732는 비노출이라 구현 1차 제외.
- Replacement table: `안전 영역 (권장 부하 범위)` → `권장 범위 참고`, `주의 영역 (부상 위험 증가)` → `부하 증가 확인 필요`, `위험 영역 (부상 위험 매우 높음)` → `부하 급증 조정 검토`, `훈련 부족 (부하 미달)` → `부하 낮음`, `ACWR 위험` → `ACWR 부하 급증`, `ACWR 주의` → `ACWR 부하 증가`, `ACWR 정상` → `ACWR 권장 범위`, `부상 위험이 매우 높습니다. 휴식이 필요합니다.` → `부하가 빠르게 증가했습니다. 휴식 또는 강도 조정을 검토하세요.`
- Preserve: ACWR 계산, threshold, deload, schedule, swap, 저장 schema 변경 0 원칙. 내부 변수명/주석은 기능 안정성을 위해 이번 구현 제외.
- Next: `ACWR 사용자 노출 문구 안전화 구현 1차`.

## 2026-05-27 — 상업화 표현 안전화 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: `site/index.html` ACWR 제목 1건 `부상 위험도 예측 (ACWR)` → `훈련 부하 참고 지표 (ACWR)`.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `부상 위험도 예측` 0건, `훈련 부하 참고 지표 (ACWR)` 1건.
- Preserve: ACWR DOM id/class, `renderACWR`, 계산/저장 흐름, JS/CSS/data diff 0건.
- Residual: `site/app.js` 사용자 노출 문구에 `위험 영역`, `부상 위험`, `ACWR 위험` 계열 잔존. 별도 설계 필요.
- Next: `ACWR 사용자 노출 문구 안전화 설계 1차`.

## 2026-05-27 — 상업화 필수 보완 설계 1차
- Result: Step 2 설계 완료. 결론은 `광고 코드 삽입 전 표현 안전화와 정책/SEO 기반 정리 우선`.
- Required before ads: 1) `부상 위험도 예측 (ACWR)` → `훈련 부하 참고 지표 (ACWR)`로 보정, 2) 공개 연락처 확정 후 `contact`/`privacy` 동시 반영, 3) 광고/분석 도입 전 `privacy`/`terms`에 쿠키·광고 식별자·동의/거부 절차 범위 반영, 4) 도메인 확정 후 `robots.txt`/`sitemap.xml`/canonical 설계.
- Optional but recommended: 공개 콘텐츠 확장 5개 후보(`RPE 입력 가이드`, `ACWR 안전한 해석`, `야구 S&C 기초`, `유소년·학생선수 훈련 조정`, `준비운동·어깨 관리`)는 근거문서 검토 후 단계 반영.
- Ad placement: 허용 후보는 공개 가이드 문서 본문 중간/하단. 금지 후보는 선수 등록, 평가 저장, RPE 입력, 백업/복원/초기화, 운동 대체, 모달 버튼 주변.
- App path: 웹 공개 콘텐츠/AdSense 준비 → PWA/모바일 UX → 로그인·동기화 설계 → AdMob/앱스토어 심사 대응 순서.
- Sources: Google AdSense site readiness, Google Publisher Policies, Ad placement policies, Google Search helpful content, Apple App Review Guidelines, Google Play Health Content 기준.
- Preserve: `site/*` 변경 0건. 실제 광고 스크립트 삽입 없음.
- Next: `상업화 표현 안전화 구현 1차`.

## 2026-05-27 — 공개 콘텐츠/AdSense 준비 감사 1차
- Result: Step 2 감사 완료. 결론은 `광고 삽입 전 필수 보완 필요`.
- Current content: 공개 HTML 8개, 문서형 페이지 7개(`about`, `workload-guide`, `recovery-guide`, `assessment-guide`, `privacy`, `terms`, `contact`) 총 443라인. 기본 신뢰 문서는 존재하나 검색/광고 유입용 깊이는 부족.
- AdSense readiness: title/meta/robots는 존재. sitemap.xml, robots.txt, canonical, structured data, 광고 태그는 없음. 현재 `privacy`/`terms`는 광고 도입 전 갱신을 전제로 작성되어 실제 광고 삽입 전 보정 필요.
- Findings: MAJOR 3건(공개 연락처 미확정, `부상 위험도 예측` 표현, 광고/분석 도입 전 privacy/terms 갱신 필요), MINOR 3건(sitemap/robots/canonical/structured data 부재, 문서 깊이 부족, 광고 배치 기준 미정).
- Safe ad placement: 공개 가이드 문서 본문/하단 후보. 금지 후보는 선수 등록·저장·삭제·복원·RPE 입력·운동 대체·모달 버튼 주변.
- Sources: Google AdSense site readiness, Google Publisher Policies, Ad placement policies, Google Search helpful content 기준으로 판단.
- Preserve: `site/*` 변경 0건, inline handler 0건, 수정 금지 경로 diff 0건.
- Next: `상업화 필수 보완 설계 1차`.

## 2026-05-27 — 디자인·다크모드 최종 브라우저 스모크 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `전부 정상`.
- Browser: `http://127.0.0.1:8767/?codex_cache_bust=final-smoke-20260527-1`에서 최종 스모크 확인.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Safety: inline handler 0건, 광고/canonical/JSON-LD 0건, 빈 script 0건, 수정 금지 경로 diff 0건.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: 후속 큐가 비어 있어 다음 작업은 새 목표 확정 후 등록.

## 2026-05-27 — index 빈 script 태그 제거 보안/QA 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `site/index.html` L1057 `data.js`, L1058 `app.js`, L1059 `</body>` 확인.
- Safety: 빈 script 태그 0건, inline handler 0건, 광고/canonical/JSON-LD 0건, 수정 금지 경로 diff 0건.
- Preserve: `data.js` → `app.js` 로딩 순서 유지. 브라우저 실사용은 필요 없음.
- Next: `디자인·다크모드 최종 브라우저 스모크 확인 1차`.

## 2026-05-27 — index 빈 script 태그 제거 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: `site/index.html` 하단 빈 `<script></script>` 1줄 제거. `data.js` → `app.js` script 로딩 순서는 유지.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `site/index.html` L1057 `data.js`, L1058 `app.js`, L1059 `</body>` 확인.
- Safety: 빈 script 태그 0건, inline handler 0건, 광고/canonical/JSON-LD 0건, 수정 금지 경로 diff 0건.
- Residual: 기능 변경 없음. QA 확인 후 디자인·다크모드 통합 회귀 묶음 종결 가능.
- Next: `index 빈 script 태그 제거 보안/QA 1차`.

## 2026-05-27 — 디자인·다크모드 최종 통합 회귀 QA 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR 0건, NIT 1건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. inline handler 0건, 광고/canonical/JSON-LD 0건, `guideMedia*` 0건, `style=""` 0건.
- Preserve: `renderACWR`, `renderWeeklyCalendar`, RPE bar, captureSchedule, openSwapModal, guideModal, 주요 `data-*action` selector pair 보존 확인.
- NIT: `site/index.html:1059` 빈 `<script></script>` 태그 잔존. 기능 실행은 없으나 불필요한 디버그 잔재로 정리 필요.
- Browser: 실사용은 미수행. 다크모드 modal/ACWR/RPE/capture/dashboard filter, 캡처 이미지 출력, 모달/저장 흐름은 필요 시 사용자 확인으로 분리.
- Next: `index 빈 script 태그 제거 1차`.

## 2026-05-27 — ACWR 카드 폰트 정합 보정 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `모두 정상`.
- User check: ACWR 카드 제목, 급성/만성/ACWR 라벨, 숫자, 상태 pill, 다크/라이트 가독성, 모바일 overflow 확인 정상으로 처리.
- Issues: BLOCKER/MAJOR/MINOR 0건.
- Preserve: 브라우저 확인 외 `site/*` 추가 변경 0건.
- Next: `디자인·다크모드 최종 통합 회귀 QA 1차`.

## 2026-05-27 — ACWR 카드 폰트 정합 보정 보안/QA 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. ACWR 카드 5개 selector가 `font-family: var(--font-sans);` 사용 확인.
- Safety: ACWR 외 `font-mono` 사용처 유지, `calculateACWRMetrics()`·`renderACWR()`·HTML id·상태 class·저장 schema 변경 0건.
- Preserve: font-size/weight/letter-spacing/line-height/color/background/border 변경 없음. inline handler 0건, 수정 금지 경로 diff 0건.
- Residual: 브라우저 실사용 미수행. ACWR 카드 제목·라벨·숫자·상태 pill의 실제 시각 정합 확인 필요.
- Next: `ACWR 카드 폰트 정합 보정 브라우저 실사용 확인 1차`.

## 2026-05-27 — ACWR 카드 폰트 정합 보정 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: `site/style.css` ACWR 카드 영역 5개 selector의 `font-family`를 `var(--font-mono)`에서 `var(--font-sans)`로 전환. 대상: `.acwr-card-title`, `.acwr-metric-label`, `.acwr-metric-value`, `.acwr-metric-value--ratio`, `.acwr-status`.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. ACWR 영역 5건 `--font-sans` 확인, ACWR 외 `--font-mono` 사용처 유지.
- Preserve: font-size/weight/letter-spacing/line-height/color/status class/ACWR 계산/HTML id/저장 schema 변경 0건. 수정 금지 경로 diff 0건, inline handler 0건.
- Residual: 브라우저에서 ACWR 카드 제목·라벨·숫자·상태 pill의 라이트/다크 폰트 정합 확인 필요.
- Next: `ACWR 카드 폰트 정합 보정 보안/QA 1차`.

## 2026-05-27 — ACWR status inline style 클래스화 브라우저 실사용 확인 1차
- Result: Step 2 이슈 확인. 사용자 실사용 중 ACWR 카드 제목·라벨·숫자·상태 pill의 mono font가 다른 UI와 이질적이라는 UX 이슈 발견.
- Finding: `site/style.css` L3734/L3759/L3770/L3782/L3796에서 ACWR 제목·metric label·metric value·ratio·status가 `font-family: var(--font-mono);`를 사용함.
- Severity: 기능/보안/저장 회귀는 아니므로 BLOCKER/MAJOR 0건. 다만 사용자 가독성·시각 정합 이슈로 수정 티켓 필요.
- Decision: ACWR 카드 내부 글씨와 숫자를 기존 서비스 본문 톤인 `var(--font-sans)`로 통일한다. `site/style.css` 한정 보정.
- Next: `ACWR 카드 폰트 정합 보정 1차`.

## 2026-05-27 — ACWR status inline style 클래스화 보안/QA 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `renderACWR()` L3308-L3349에서 5종 class 선제 remove 후 분기별 1종 add 확인.
- Safety: `statusEl.style.backgroundColor/color` 0건, `document.getElementById('acwrStatus').style` 0건, modifier block L3810-L3814 hex/rgba/hsl literal 0건.
- Preserve: `!isReady` 조기 return 전 muted class 적용, 6개 상태 문구·0.8/1.3/1.5 임계값·`calculateACWRMetrics()`·`acuteLoad/chronicLoad/acwrRatio` 갱신·저장 schema 보존.
- Residual: 브라우저 실사용 미수행. ACWR status pill의 라이트/다크 대비와 실제 상태 표시 확인 필요.
- Next: `ACWR status inline style 클래스화 브라우저 실사용 확인 1차`.

## 2026-05-27 — ACWR status inline style 클래스화 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: `site/app.js` `renderACWR()`에서 `#acwrStatus` inline `backgroundColor/color` setter 12건 제거, 매 호출 5종 class remove 후 분기별 1종 add로 전환. `site/style.css`에 `.acwr-status--muted/safe/watch/risk/info` 5종 modifier 추가.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `statusEl.style.backgroundColor/color` 0건, `document.getElementById('acwrStatus').style` 0건, 신규 modifier block hex/rgba/hsl literal 0건.
- Preserve: 6개 상태 문구, `!isReady` 조기 return, 0.8/1.3/1.5 임계값, `calculateACWRMetrics()`, `acuteLoad/chronicLoad/acwrRatio` 갱신, `site/index.html` L379 markup, 저장 schema 모두 유지.
- Residual: 브라우저에서 ACWR status 6상태의 class 표시와 라이트/다크 대비 확인 필요.
- Next: `ACWR status inline style 클래스화 보안/QA 1차`.

## 2026-05-27 — ACWR status inline style 클래스화 설계 1차
- Result: Step 2 설계 완료. `renderACWR()`의 `#acwrStatus` inline style setter는 모두 `var()` token 기반이라 현재 다크모드 가독성은 문제 없음.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `acwrStatus` style setter 12건 확인, `site/index.html` L379 markup 유지, `.acwr-status` base는 color/background 없음.
- Decision: 현상 유지도 가능하지만, 직전 live workload class 토글 패턴과 일관성을 맞추기 위해 class 전환(B안)을 권장.
- Spec: `.acwr-status--muted/safe/watch/risk/info` 5종 class 추가, `renderACWR()` 매 호출마다 5종 class remove 후 분기별 1종 add. 6개 상태 텍스트·0.8/1.3/1.5 임계값·ACWR 계산·저장 schema는 무변경.
- Preserve: `site/*` 수정 0건, inline handler 0건, 수정 금지 경로 diff 0건.
- Next: `ACWR status inline style 클래스화 구현 1차`.

## 2026-05-27 — --primary 기반 active 요소 다크모드 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `전부 정상`.
- User check: 1차 CTA, 선수/스케줄 배지, swap check, 투타 토글, guide YouTube hover 등 9개 영역의 다크/라이트 대비 정상으로 처리.
- Issues: BLOCKER/MAJOR/MINOR 0건.
- Next: `ACWR status inline style 클래스화 설계 1차`.

## 2026-05-27 — --primary 기반 active 요소 다크모드 대비 보안/QA 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 보정 블록 L4460-L4515 확인, 9개 selector가 `[data-theme="dark"]` group과 `:root:not([data-theme="light"])` group에 모두 포함됨.
- Safety: 신규 primary 보정 블록 hex/rgba/hsl literal 0건. 신규 블록의 실제 속성은 `color: var(--bg-color);`만 존재. inline handler 0건, 수정 금지 경로 diff 0건.
- Preserve: 원본 selector L412/L729/L1267/L2045/L2076/L2189/L2243/L2704/L3007 유지. JS/HTML/tokens/data/schema 변경 0건.
- Residual: 브라우저에서 1차 CTA, 선수/스케줄 배지, swap check, 투타 토글, guide YouTube hover 등 9개 영역의 라이트/다크 대비 확인 필요.
- Next: `--primary 기반 active 요소 다크모드 브라우저 실사용 확인 1차`.

## 2026-05-27 — --primary 기반 active 요소 다크모드 대비 보정 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: `site/style.css` L4466-L4507에 9개 selector grouped dark color 분기 추가. `[data-theme="dark"]`와 `prefers-color-scheme: dark` + `:root:not([data-theme="light"])` mirror selector를 사용.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 9개 selector가 양쪽 group에 모두 포함됨. 보정 블록 L4460-L4515 hex/rgba/hsl literal 0건.
- Preserve: 적용 속성은 `color: var(--bg-color);`만 사용. `background`, `border-color`, `tokens.css`, JS/HTML/data/schema 변경 0건. inline handler 0건, 수정 금지 경로 diff 0건.
- Residual: 브라우저에서 1차 CTA, 선수/스케줄 배지, swap check, 투타 토글, guide YouTube hover 등 9개 영역의 다크/라이트 대비 확인 필요.
- Next: `--primary 기반 active 요소 다크모드 대비 보안/QA 1차`.

## 2026-05-27 — --primary 기반 active 요소 다크모드 대비 설계 1차
- Result: Step 2 조사 완료. 보정 대상은 `--primary` 배경 + 흰색/hero-white 글씨 조합 9개 selector로 확정.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `--primary`/light color grep, 9개 후보 컨텍스트, inline handler 0건, 수정 금지 경로 diff 0건 확인.
- Need fix: `.btn-primary`, `.player-week-badge`, `.swap-option.selected .swap-check`, `.type-btn.active`, `.player-type-badge.pitcher`, `.calendar-cell.today .cal-status-badge`, `.stat-filter-badge`, `.day-tab-btn.active`, `.guide-youtube-cta:hover`.
- No fix: `.today-training-badge`, `.recovery-score-btn.active`, `.btn-danger:hover`, `.player-type-badge.batter`, progress/bar/dot/border-only 영역은 다크 대비가 충분하거나 글씨 대비 대상이 아님.
- Decision: `site/style.css` 한정으로 grouped dark selector를 추가해 `color: var(--bg-color)`만 다크 분기에서 적용한다. `tokens.css`의 `--primary` 자체 변경은 cascade 영향이 커서 금지.
- Next: `--primary 기반 active 요소 다크모드 대비 보정 1차`.

## 2026-05-27 — .dashboard-filter-chip.active 다크모드 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `모두 정상`.
- User check: 팀 대시보드 필터 active chip의 다크모드 대비, 필터 클릭 전환, 라이트모드 회귀, 모바일 가독성 모두 정상으로 처리.
- Issues: BLOCKER/MAJOR/MINOR 0건.
- Next: `--primary 기반 active 요소 다크모드 대비 설계 1차`.

## 2026-05-27 — .dashboard-filter-chip.active 다크모드 대비 보안/QA 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR/NIT 0건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `site/style.css` L2802-L2806 라이트 기본 규칙 유지, L4452-L4463 다크 selector 2종 존재.
- Safety: 보정 블록 L4430-L4468 hex/rgba/hsl literal 0건. inline handler 0건. 수정 금지 경로 diff 0건.
- Preserve: `site/app.js` L436/L1044/L3809/L3845/L3878/L3886/L3907 필터 상태·클릭·렌더링 흐름 유지. JS/HTML/data/schema 변경 0건.
- Residual: 브라우저에서 팀 대시보드 필터 active chip 라이트/다크 대비와 클릭 전환 확인 필요.
- Next: `.dashboard-filter-chip.active 다크모드 브라우저 실사용 확인 1차`.

## 2026-05-27 — .dashboard-filter-chip.active 다크모드 대비 보정 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: `site/style.css` L4432-L4464에 `.dashboard-filter-chip.active` 다크 분기 추가. `[data-theme="dark"]`와 `prefers-color-scheme: dark` + `:root:not([data-theme="light"])` mirror selector를 사용.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 보정 블록 L4430-L4465 hex/rgba/hsl literal 0건. inline handler 0건.
- Preserve: 라이트 기본 규칙 `site/style.css` L2802-L2806 유지. `site/app.js` L3878 동적 class와 `data-dashboard-filter-action` 흐름 변경 없음. 수정 금지 경로 diff 0건.
- Residual: 브라우저에서 팀 대시보드 필터 active chip의 라이트/다크 대비와 클릭 전환 확인 필요.
- Next: `.dashboard-filter-chip.active 다크모드 대비 보안/QA 1차`.

## 2026-05-27 — 다크모드 잔여 UI 최종 스윕 설계 1차
- Result: Step 2 조사 완료. 신규 보정 필요 영역은 `.dashboard-filter-chip.active` 1건으로 확정.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 밝은 surface/literal grep과 JS inline style/innerHTML grep 재확인. inline handler 0건, 수정 금지 경로 diff 0건.
- Finding: `site/style.css` L2802-L2806 `.dashboard-filter-chip.active`가 `background: var(--ink); color: var(--surface); border-color: var(--ink);`를 사용해 다크모드에서 ink/surface 반전으로 밝은 chip처럼 보일 수 있음. 사용처는 `site/app.js` L3878 팀 대시보드 필터 버튼.
- Already fixed: ACWR card, hero gradient, capture button, warning/danger/equip tokens, live workload display, brand mark, `.cl-*` 모달 영역은 최근 티켓에서 보정 완료.
- Deferred: `--primary + white` 대비 묶음, Chart.js dataset 토큰화, acwr-status JS inline class화는 별도 Stage 5 정합 후보.
- Next: `.dashboard-filter-chip.active 다크모드 대비 보정 1차`.

## 2026-05-27 — HTML 클래스명 풀 리네임 영향도 조사 설계 1차
- Result: Step 2 조사 완료. 전면 리네임은 보류, 기존 class는 안정 API로 유지, 필요한 화면만 영역별 alias 방식으로 진행.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 결합 패턴 카운트는 `site/index.html` 143 / `site/style.css` 183 / `site/app.js` 194. class target만 보면 `site/app.js` 70, DOM API 호출 패턴은 139.
- Findings: `.player-card`, `.form-control`, `.modal-content`, `.schedule-*`, `.dashboard-*`는 `site/app.js` selector와 동적 `innerHTML` template에 넓게 연결되어 전면 리네임 시 약 400라인 이상과 DOM API 139회 전수 확인이 필요.
- Decision: full rename은 BLOCKER/MAJOR 회귀 위험 대비 실익이 낮음. 이미 `.cl-guide-*`, `.cl-swap-*`, `.cl-quickstart`, `.cl-faq`, `.cl-assess-*`, `hero-mark` B mark 등 단계적 도입이 완료되어 시각 정합은 alias 방식으로 유지.
- Preserve: `site/*` 수정 0건, inline handler 0건, 수정 금지 경로 diff 0건.
- Next: `다크모드 잔여 UI 최종 스윕 설계 1차`.

## 2026-05-27 — brand-mark 시안 미니 로고 패턴 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `정상`.
- User check: hero `B` mark 크기·정렬·가독성, corner accent 가시성, 라이트/다크/모바일 header, `팀 대시보드`/`처음 사용 가이드` 버튼 확인 정상으로 처리.
- Issues: BLOCKER/MAJOR/MINOR 0건.
- Next: `HTML 클래스명 풀 리네임 영향도 조사 설계 1차`.

## 2026-05-27 — brand-mark 시안 미니 로고 패턴 보안/QA 1차
- Result: Step 2 QA 완료. 보안/QA 보고와 총괄 재검증 기준 BLOCKER/MAJOR/MINOR/NIT 0건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `site/index.html` L23 `<span class="hero-mark">B</span>` 1건, ACWR L363 `data-lucide="activity"` 1건 유지.
- Safety: `.brand-mark` 0건, `.hero-mark svg` 0건, `.hero-mark::after` 1건. `.hero-mark` CSS 구간 hex/rgba/hsl literal 0건. inline handler 0건.
- Preserve: `lucide.createIcons()` 10건 유지. header `data-header-action="team-dashboard"`/`guide` 구조 유지. 수정 금지 경로 diff 0건.
- Residual: 브라우저 실사용 미수행. B mark 균형, corner accent 가시성, 라이트/다크/모바일 header 확인 필요.
- Next: `brand-mark 시안 미니 로고 패턴 브라우저 실사용 확인 1차`.

## 2026-05-27 — brand-mark 시안 미니 로고 패턴 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR/MINOR 0건.
- Change: `site/index.html` L23 hero mark를 `<span class="hero-mark">B</span>`로 변경. 기존 `hero-mark` class와 hero identity layout 유지. ACWR L363 `data-lucide="activity"`는 유지.
- CSS: `site/style.css` L209-L235 `.hero-mark`를 34px rounded mono `B` mark로 보정하고 `.hero-mark::after` corner accent 추가. 기존 `.hero-mark svg` 잔재 제거.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 신규 CSS 구간 hex/rgba/hsl literal 0건. inline handler 0건. `.brand-mark` class 신규 도입 0건.
- Preserve: `site/app.js`, `site/data.js`, `site/docs.css`, `site/tokens.css`, `site/assets`, `site/vendor`, `docs/evidence`, `docs/security` diff 0건.
- Residual: 브라우저에서 hero mark의 B 균형, corner accent 가시성, 라이트/다크/모바일 header 가독성 확인 필요.
- Next: `brand-mark 시안 미니 로고 패턴 보안/QA 1차`.

## 2026-05-27 — brand-mark 시안 미니 로고 패턴 설계 1차
- Result: Step 2 설계 완료. `site/*` 변경 0건.
- Current anchor: `site/index.html` L23 `span.hero-mark` 안에 `i data-lucide="activity"`가 있고, `site/style.css` L209-L227 `.hero-mark`/`.hero-mark svg`가 38px glass icon으로 정의됨.
- Mockup anchor: `archive/design-mockups/2026-05-23-claude-design-export/components.css` L139-L151 `.brand-mark`는 ink square + surface text + navy corner accent. `index.html` L430과 `snippets/10-doc-page.html` L24는 텍스트 `B` 마크를 사용.
- Decision: B안 권장. `hero-mark` class와 DOM 위치는 유지하고 내부 표현만 `B` text + corner accent로 바꾼다. class rename(`brand-mark`)은 JS/CSS selector 추적 비용 대비 이득이 낮아 보류.
- Implementation scope: `site/index.html` L23, `site/style.css` `.hero-mark` 계열만 수정. `site/app.js`, `site/data.js`, header action buttons, hero gradient, `lucide.createIcons()` 변경 금지.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `site/*` diff 0건. inline handler 0건.
- Next: `brand-mark 시안 미니 로고 패턴 구현 1차`.

## 2026-05-27 — 운동 가이드·대체·앱 가이드 모달 .cl-* 도입 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `전부 정상`.
- User check: 운동 가이드 모달, 운동 대체 모달, 앱 사용 가이드 모달의 표시·클릭·모바일·다크모드 가독성 모두 정상으로 처리.
- Environment: 기존 `8765` 로컬 서버 접근 실패를 확인하고, sandbox 밖 `8767` 서버로 재개. `http://127.0.0.1:8767/?codex_cache_bust=modal-cl-verify-20260527-2`에서 페이지 로딩 및 3개 모달 DOM 존재 확인.
- Issues: BLOCKER/MAJOR/MINOR 0건.
- Next: `brand-mark 시안 미니 로고 패턴 설계 1차`.

## 2026-05-27 — 운동 가이드·대체·앱 가이드 모달 .cl-* 도입 보안/QA 1차
- Result: Step 2 QA 완료. BLOCKER/MAJOR/MINOR 0건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 8개 class 사용/정의 위치 확인: `site/index.html` 6건, `site/app.js` 2건, `site/style.css` 8건.
- Safety: `rg -n "\\bcl-cue\\b|cl-tabs-list" site/index.html site/app.js site/style.css` 0건. 신규 CSS 구간 hex/rgba/hsl literal 0건. modal HTML 구간 inline handler/style 0건. 전체 HTML inline handler 0건.
- XSS/flow: `renderSwapOption()`의 `swapList.innerHTML` 동적 값은 `escapeHTML` 경유. `confirmSwap`, `exerciseSwaps`, sourceUrl/youtube allowlist, modal action selector 보존.
- Preserve: `site/data.js`, `site/docs.css`, `site/tokens.css`, `site/assets`, `site/vendor`, `docs/evidence`, `docs/security` diff 0건.
- Residual: 브라우저 실사용 미수행. 운동 가이드/대체/앱 가이드 모달 표시·클릭·모바일·다크모드 확인 필요.
- Next: `운동 가이드·대체·앱 가이드 모달 .cl-* 도입 브라우저 실사용 확인 1차`.

## 2026-05-27 — 운동 가이드·대체·앱 가이드 모달 cl-tabs-list 주석 잔재 보정 1차
- Result: Step 2 보정 완료. 금지 class 주석 잔재 제거 검증 통과.
- Change: `site/style.css` `.cl-*` 도입 주석에서 `cl-tabs-list` 리터럴 제거. 의미는 “앱 가이드 탭 UI는 v2 별도 설계”로 유지.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `rg -n "\\bcl-cue\\b|cl-tabs-list" site/index.html site/app.js site/style.css` 출력 0건.
- Preserve: 기존 8개 class selector와 사용 위치 유지. CSS 선언부 hex/rgba/hsl literal 0건. `site/index.html`/`site/app.js`/`site/data.js`/`site/tokens.css` diff 0건.
- Safety: inline handler 0건. 기능/DOM/schema 변경 없음.
- Next: `운동 가이드·대체·앱 가이드 모달 .cl-* 도입 보안/QA 1차`.

## 2026-05-27 — 운동 가이드·대체·앱 가이드 모달 .cl-* 도입 구현 1차
- Result: Step 2 구현 완료 정밀검토에서 기능 구현은 대체로 통과했으나, 금지 class 주석 잔재 1건 발견.
- Change: `site/index.html` 6곳 class 병기, `site/app.js` `renderSwapOption()` 2곳 class 병기, `site/style.css` `.cl-*` 8종 selector 추가.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 수정 금지 경로 diff 0건. inline handler 0건. 신규 CSS literal 0건.
- Preserve: `confirmSwap`, `exerciseSwaps`, sourceUrl/youtube allowlist, `site/data.js`, `site/tokens.css`, DOM id 보존.
- Issue: `site/style.css` 주석에 `cl-tabs-list` 1건이 남아 완료 조건의 `cl-tabs-list 0건`과 충돌. 실제 class/selector는 아니지만 QA grep noise이므로 MINOR.
- Next: `운동 가이드·대체·앱 가이드 모달 cl-tabs-list 주석 잔재 보정 1차`.

## 2026-05-27 — 운동 가이드·대체·앱 가이드 모달 .cl-* 도입 설계 1차
- Result: Step 2 설계 완료 정밀검토 통과. `site/*` 변경 0건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 모달 anchor `guideModal/swapModal/appGuideModal`, `openGuide/openSwapModal/renderSwapOption/openGuideModal`, sourceUrl/youtube/swap 저장 경로 확인.
- Decision: v1은 CSS class 추가 중심으로 진행. 적용 8종은 `.cl-guide-media`, `.cl-guide-steps`, `.cl-guide-cue`, `.cl-evidence-bar`, `.cl-swap-card`, `.cl-swap-radio`, `.cl-quickstart`, `.cl-faq`.
- Defer: `.cl-tabs-list`는 appGuideModal 탭 UI 구조·JS·ARIA 설계가 필요하므로 v2 별도 티켓.
- NIT: 설계 본문 일부에 `.cl-cue` 후보명이 있으나 mockups #17 원문은 `.cl-guide-cue`; 구현 티켓에서 원문 기준으로 고정.
- Preserve: `site/data.js`, guide data/sourceUrl/youtube allowlist, `exerciseSwaps`, `confirmSwap`, modal id, click handler, 저장 schema 변경 금지.
- Next: `운동 가이드·대체·앱 가이드 모달 .cl-* 도입 구현 1차`.

## 2026-05-27 — 스케줄 이미지 저장 버튼 다크모드 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료. 사용자 회신 기준 `다 정상이야`.
- User check: 다크모드 버튼 가독성, hover/터치 피드백, 라이트모드 회귀 없음, 클릭 저장 정상, 모바일 폭 문구 표시 모두 정상으로 처리.
- Scope: `html2canvas(... backgroundColor: '#ffffff')`로 생성되는 PNG 흰 배경은 다운로드 이미지 의도로 유지.
- Issues: BLOCKER/MAJOR/MINOR 0건.
- Next: `운동 가이드·대체·앱 가이드 모달 .cl-* 도입 설계 1차`.

## 2026-05-27 — 스케줄 이미지 저장 버튼 다크모드 대비 보안/QA 1차
- Result: Step 2 QA 완료. 보안/QA 보고와 총괄 재검증 기준 BLOCKER/MAJOR/MINOR 0건.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 전역 `.btn-secondary` L412-L419, `.capture-wrap` L3803-L3804, 보정 블록 L4322-L4367 확인.
- Safety: L4321-L4370 보정 블록 hex/rgba/hsl literal 0건. inline handler 0건. 수정 금지 경로 diff 0건.
- Scope: `#captureScheduleBtn` HTML L408-L410, `captureSchedule()`/`html2canvas()`/click bind L6071-L6102 변경 없음. `html2canvas(... backgroundColor: '#ffffff')`는 다운로드 PNG 배경 의도로 버튼 UI 보정 범위 밖.
- Residual: 브라우저에서 다크/라이트 버튼 대비, hover, 클릭 저장, 캡처 중 텍스트, 모바일 표시 확인 필요.
- Next: `스케줄 이미지 저장 버튼 다크모드 브라우저 실사용 확인 1차`.

## 2026-05-27 — 스케줄 이미지 저장 버튼 다크모드 대비 주석 literal 보정 1차
- Result: Step 2 보정 완료. 주석 literal 제거 검증 통과.
- Change: `site/style.css` 스케줄 이미지 저장 버튼 다크모드 보정 주석에서 hex literal을 token 이름 표현으로 교체. CSS 선언부와 selector 구조 변경 없음.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `sed -n '4321,4370p' site/style.css | rg "#[0-9A-Fa-f]{3,8}|rgba\\(|hsla?\\("` 출력 0건.
- Scope: `[data-theme="dark"] .capture-wrap #captureScheduleBtn`, `.capture-wrap .btn-secondary`, `prefers-color-scheme: dark` mirror selector 유지. 전역 `.btn-secondary`, `site/index.html`, `site/app.js` 변경 없음.
- Safety: 수정 금지 경로 diff 0건, inline handler 0건.
- Next: `스케줄 이미지 저장 버튼 다크모드 대비 보안/QA 1차`.

## 2026-05-27 — 스케줄 이미지 저장 버튼 다크모드 대비 보정 1차
- Result: Step 2 구현 완료 정밀검토에서 기능 구현은 통과했으나, 주석 내 hex literal 4건으로 검증 혼동 가능성 발견.
- Change: `site/style.css` L4345-L4367에 `[data-theme="dark"] .capture-wrap #captureScheduleBtn` 및 `prefers-color-scheme: dark` mirror selector 추가. 전역 `.btn-secondary`, `site/index.html`, `site/app.js` 변경 없음.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 수정 금지 경로 diff 0. 실제 CSS 선언은 `var(--rule-2)`, `var(--ink)`, `var(--mute-2)` token만 사용.
- Issue: `site/style.css` L4327-L4341 주석에 `#E8ECF4`, `#1A1F26`, `#3A4150`, `#5A6470` literal이 있어 “신규 hex 0건” 검증 표현과 충돌할 수 있음. 기능/보안 결함은 아니나 QA noise 방지를 위해 NIT 보정 필요.
- Next: `스케줄 이미지 저장 버튼 다크모드 대비 주석 literal 보정 1차`.

## 2026-05-27 — 워크로드 모달 실시간 표시 다크모드 브라우저 실사용 확인 1차
- Result: 사용자 실사용 확인 기준 workload live display는 정상. 단, 범위 밖 스케줄 이미지 저장 버튼 다크모드 미적용 이슈 발견.
- User check: idle/danger/safe, RPE bar 갱신, 입력 삭제, 라이트모드, 모바일 등 워크로드 표시 항목은 “나머지는 모두 정상”으로 확인됨.
- Finding: `site/index.html` L409 `#captureScheduleBtn`이 `btn btn-secondary btn-block`을 사용. `site/style.css` L412-L419 `.btn-secondary`는 `background: var(--ink); color: var(--surface);`로 다크모드에서 토큰 반전 시 밝은 버튼처럼 보일 수 있음.
- Scope decision: `btn-secondary` 전역 보정은 회귀 위험이 있으므로 `#captureScheduleBtn` 또는 `.capture-wrap .btn-secondary` 한정 selector로 보정한다.
- Next: `스케줄 이미지 저장 버튼 다크모드 대비 보정 1차`.

## 2026-05-27 — 워크로드 모달 실시간 표시 다크모드 token 클래스화 보안/QA 1차
- Result: Step 2 QA 완료. 총괄 재검증 기준 BLOCKER/MAJOR/MINOR 0건.
- Security/QA: `calculateLiveWorkload()`는 매 호출 시작 시 `live-workload-display--idle/danger/safe` 3종을 제거하고 분기별 1종만 추가함. 누적 class 없음.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `displayEl.style.background/color/border` 0건. `site/app.js` workload live display 경로의 hardcoded `rgba(239, 68, 68, ...)`/`rgba(45, 106, 79, ...)` 0건.
- XSS: `innerHTML` 동적 값은 `escapeHTML(String(...))` 경유. 상수 텍스트 외 escape 누락 없음.
- Safety: 저장 schema, `saveDailyWorkload()`, RPE validation, RPE bar click flow 변경 없음. 수정 금지 경로 diff 0.
- Residual: 브라우저에서 idle/danger/safe 3상태의 라이트/다크 대비와 class 잔류 여부 확인 필요. `--success-border` 다크 미분기는 NIT 후보.
- Next: `워크로드 모달 실시간 표시 다크모드 브라우저 실사용 확인 1차`.

## 2026-05-27 — 워크로드 모달 실시간 표시 다크모드 token 클래스화 구현 1차
- Result: Step 2 구현 완료 정밀검토 통과. BLOCKER/MAJOR 0건.
- Change: `site/app.js` `calculateLiveWorkload()`에서 `displayEl.style.background/color/border` 직접 지정 제거. 매 호출 시작 시 `live-workload-display--idle/danger/safe` 3종 class를 제거하고 분기별 1종만 추가하도록 전환.
- CSS: `site/style.css` `.live-workload-display--idle`, `--danger`, `--safe` 3종 추가. 기존 token `--bg-color`, `--text-muted`, `--border`, `--danger-light`, `--danger`, `--danger-border-soft`, `--success-light`, `--primary`, `--success-border`만 사용.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `site/app.js` 내 workload status용 `rgba(239, 68, 68, ...)`/`rgba(45, 106, 79, ...)` 0건. inline handler 0건.
- Safety: `saveDailyWorkload()`, validation, RPE bar click flow, 저장 schema 변경 없음. 수정 금지 경로 변경 없음.
- Residual: `style.css` root legacy `rgba(45, 106, 79, ...)` 토큰은 기존 정의로 남아 있음. 다크 safe 상태의 `color: var(--primary)` 대비는 브라우저 실사용에서 확인 필요.
- Next: `워크로드 모달 실시간 표시 다크모드 token 클래스화 보안/QA 1차`.

## 2026-05-27 — 전체 팝업·문서 링크 다크모드 누락 전수 점검 설계 1차
- Result: Step 2 설계 완료. 모달 10종과 문서 페이지 7종 정적 전수 점검 기준, 즉시 구현 보정 후보는 `workloadModal`의 실시간 워크로드 표시 1건으로 한정.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. inline handler/광고/canonical/JSON-LD 0건. `site/index.html` modal inventory 10종 확인.
- Modal inventory: `wellnessModal`, `perfModal`, `guideModal`, `swapModal`, `appGuideModal`, `workloadModal`, `alertModal`, `confirmModal`, `resetAllModal`, `editPlayerModal`. 공통 `.modal-content`는 `var(--card-bg)`, `.modal-title`은 `var(--text-main)`, `.modal-close`는 token 기반.
- Doc pages: `about/contact/privacy/terms/workload-guide/recovery-guide/assessment-guide`는 `tokens.css` + `docs.css` 사용, hard white background/text grep 0건. `서비스 소개`는 팝업이 아니라 `about.html` 새 탭 문서 링크.
- Finding: `site/app.js` L2839-L2846 `calculateLiveWorkload()`가 `rgba(239, 68, 68, ...)`, `rgba(45, 106, 79, ...)` inline style을 직접 주입. workload modal 내부 동적 상태 표시라 다크모드 token cascade에서 벗어남.
- Scope decision: chart fill rgba, html2canvas `#ffffff`, hero/button white text는 본 티켓 범위 밖 또는 의도된 표현. 다음 티켓은 workload live display의 status class/token 전환만 수행.
- Next: `워크로드 모달 실시간 표시 다크모드 token 클래스화 구현 1차`.

## 2026-05-27 — 장비 태그·가이드/데이터 관리 다크모드 대비 브라우저 실사용 확인 1차
- Result: 사용자 실사용 확인 기준 핵심 범위 OK. 장비 태그, 사용 시작 가이드 확인사항, 데이터 관리, 위험 작업, 알림 모달의 1차 다크모드 보정은 진행 가능 상태로 판단.
- User check: 사용자가 “좋아”로 확인. 추가로 `서비스 소개` 등 앱 가이드 정책 링크/기타 팝업 전체에 다크모드 적용 누락 여부를 최종 전수 점검 요청.
- Static inventory: `site/index.html` 기준 주요 모달 10종 확인 — `wellnessModal`, `perfModal`, `guideModal`, `swapModal`, `appGuideModal`, `workloadModal`, `alertModal`, `confirmModal`, `resetAllModal`, `editPlayerModal`.
- Scope note: `서비스 소개`는 팝업이 아니라 `appGuideModal` 내부 policy link의 `about.html` 새 탭 문서. 따라서 다음 티켓은 모달 10종 + policy/doc 페이지 링크를 함께 점검하는 범위로 전환.
- Next: `전체 팝업·문서 링크 다크모드 누락 전수 점검 설계 1차`.

## 2026-05-27 — 장비 태그·가이드/데이터 관리 다크모드 대비 보안/QA 1차
- Result: Step 2 QA 완료. 총괄 재검증 기준 BLOCKER/MAJOR/MINOR 0건.
- Security/QA: `site/style.css` L4208-L4298 dark branch가 `[data-theme="dark"]`와 `prefers-color-scheme: dark` + `:root:not([data-theme="light"])` 양쪽을 커버함. warning/danger/success/info/equipment token이 다크 Clinical Trust 색조 기반 rgba/tint로 재매핑됨.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 라이트 :root L37-L87 유지, `.equip-tag` L1019-L1085 selector 유지, app guide/backup/alert anchor 유지, token 근거 `site/tokens.css` L156-L205 확인.
- Safety: inline handler 0건. 수정 금지 `site/app.js`/`site/data.js`/`site/index.html`/assets/vendor/evidence/security diff 0.
- Issues: NIT만 존재(주석 길이, 중복 dark branch, 줄 수 drift). 기능/보안 결함 아님.
- Browser: 실사용 미수행. 다음 티켓에서 장비 태그, 사용 시작 가이드, 데이터 관리, 위험 작업, 알림 모달의 다크/라이트 대비 확인 필요.
- Next: `장비 태그·가이드/데이터 관리 다크모드 대비 브라우저 실사용 확인 1차`.

## 2026-05-27 — 장비 태그·가이드/데이터 관리 다크모드 대비 보정 1차
- Result: Step 2 구현 완료 정밀검토 통과.
- Change: `site/style.css` L4208-L4298에 다크모드 토큰 분기 추가. warning/danger/success/info/equipment 관련 legacy token을 `[data-theme="dark"]`와 `prefers-color-scheme: dark` + `:root:not([data-theme="light"])` 양쪽에서 다크 surface/tint로 재매핑.
- Scope: selector/HTML/JS 변경 없이 token cascade로 `.equip-tag.*`, `.app-guide-disclaimer`, `.backup-caution-box`, `.backup-danger-zone`, skipped exercise warning, backup status 등 기존 사용처에 반영.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `.equip-tag`, app guide, backup caution/danger, alert modal anchor 확인. inline handler 0건. 수정 금지 `site/app.js`/`site/data.js`/`site/index.html`/assets/vendor/evidence/security diff 0.
- Issues: 총괄 정밀검토 기준 BLOCKER/MAJOR/MINOR 0건. NIT: 결과 기록의 신규 블록 줄 수 표현은 실제 L4208-L4298과 약간 drift 있으나 기능/보안 영향 없음.
- Browser: 실사용 미수행. 다음 티켓에서 장비 태그, 사용 시작 가이드, 데이터 관리, 위험 작업, 알림 모달의 다크/라이트 대비 확인 필요.
- Next: `장비 태그·가이드/데이터 관리 다크모드 대비 보안/QA 1차`.

## 2026-05-27 — 히어로 다크모드 토큰 분기 브라우저 실사용 확인 1차
- Result: 사용자 실사용 확인 중 히어로는 정상. 단, 범위 밖 잔여 다크모드 대비 이슈 발견으로 보정 티켓 전환.
- User check: 히어로 다크/라이트 가독성과 버튼 흐름은 정상으로 판단. 추가로 운동 항목 하단 장비 태그(`메디신볼`, `박스` 등), 사용 시작 가이드의 `이용 전 확인사항`, `위험 작업`, `알림`, `데이터 관리` 영역에서 다크모드 톤이 너무 밝거나 미적용된 부분 확인.
- Evidence anchors: 장비 태그 token `site/style.css` L74-L85 및 `.equip-tag` L1019-L1085, 앱 가이드/FAQ/고지 L1670-L1800, 데이터 관리 warning/danger surface L3081-L3118 및 L3515-L3539, alert modal L3798-L3799.
- Classification: 히어로 수정 자체는 PASS. 잔여 다크모드 surface 대비 문제는 주요 사용 화면의 시각 품질 저하이므로 MINOR, 일부 알림/위험 작업 문구가 읽기 어렵다면 MAJOR 가능.
- Action: 다음 항목 `장비 태그·가이드/데이터 관리 다크모드 대비 보정 1차`로 전환.

## 2026-05-27 — 히어로 다크모드 토큰 분기 보안/QA 1차
- Result: Step 2 QA 완료. 총괄 재검증 기준 BLOCKER/MAJOR/MINOR 0건.
- Security/QA: hero dark branch가 `[data-theme="dark"]`와 `prefers-color-scheme: dark` + `:root:not([data-theme="light"])` 양쪽을 커버함. `--hero-gradient-start/-mid/-end`는 라이트 token 원본 값(`#0F172A`, `#1A3A72`, `#1F4585`)으로 고정되어 다크 token 반전을 차단.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `site/style.css` L3860-L3862 라이트 cascade 유지, L4194-L4206 다크 분기 확인, `site/tokens.css` 라이트/다크 token 반전 근거 확인.
- Safety: inline handler 0건. 수정 금지 `site/app.js`/`site/data.js`/`site/index.html`/assets/vendor/evidence/security diff 0.
- Issues: NIT만 존재(주석 날짜, selector 중복 패턴, 상세 주석). 기능/보안 결함 아님.
- Browser: 실사용 미수행. 다음 티켓에서 다크/라이트 hero 대비, CTA/대시보드/가이드 버튼, 모바일 breakpoint 확인 필요.
- Next: `히어로 다크모드 토큰 분기 브라우저 실사용 확인 1차`.

## 2026-05-27 — 히어로 다크모드 토큰 분기 보정 1차
- Result: Step 2 구현 완료 정밀검토 통과.
- Change: `site/style.css` L4176-L4206에 hero 다크 분기 블록 추가. `[data-theme="dark"]`와 `prefers-color-scheme: dark` + `:root:not([data-theme="light"])` 양쪽에서 `--hero-gradient-start/-mid/-end`를 어두운 hero 값으로 고정.
- Reason: Stage 1b `--hero-gradient-start: var(--ink)` 계열이 다크 토큰에서 밝은 `--ink/#E8ECF4`, `--navy/#6B9DE8`, `--navy-2/#8FB8EE`로 반전되어 흰색 hero text/glass와 충돌하던 문제를 차단.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. hero selector/토큰 anchor 확인. inline handler 0건. 수정 금지 `site/app.js`/`site/data.js`/`site/index.html`/assets/vendor/evidence/security diff 0.
- Issues: 총괄 정밀검토 기준 BLOCKER/MAJOR/MINOR 0건. 신규 hex는 hero dark token branch 안에서 라이트 토큰 원본 값(`#0F172A`, `#1A3A72`, `#1F4585`) 재사용으로 한정.
- Browser: 실사용 미수행. 다음 티켓에서 다크/라이트 hero 가독성과 대시보드/가이드 버튼 상태 확인 필요.
- Next: `히어로 다크모드 토큰 분기 보안/QA 1차`.

## 2026-05-26 — 다크모드 전역 가독성 감사·보정 1차
- Result: Step 2 구현 완료 정밀검토 중 이슈 발견으로 수정 티켓 전환.
- Change: `background: white;` 5건을 `background: var(--card-bg);`로 교체. 대상은 앱 가이드 FAQ, 카드/일정 토글, 스케줄 캘린더 셀, 월간 상세 운동 리스트, 모바일 sticky 모달 헤더.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `background: white` 0건. 수정 금지 `site/app.js`/`site/index.html`/`site/data.js` diff 0.
- Finding: MAJOR. 티켓 완료 조건의 히어로 상단 패널 대비 보정이 미완료. 구현 결과 8-6에 `히어로 영역 다크 미보정 — 별도 2차 권장`으로 남아 있어, 이번 티켓 범위를 충족하지 못함.
- Evidence: `site/style.css` L3860 `--hero-gradient-start: var(--ink)`가 다크 토큰에서 밝은 `--ink`로 반전될 수 있고, L3865-L3889의 흰색 glass/mint 계열 토큰이 밝은 gradient와 충돌 가능.
- Action: 다음 항목 `히어로 다크모드 토큰 분기 보정 1차`로 전환. 보안/QA로 넘기지 않음.

## 2026-05-26 — ACWR 결과 카드·제목 영역 다크모드 가독성 브라우저 실사용 확인 1차
- Result: 실사용 중 이슈 발견으로 전역 다크모드 보정 티켓 전환.
- User check: ACWR 단일 영역 확인 중 히어로, 모달 헤더, 사후 워크로드 입력, 운동 대체 모달, 선수 정보 수정 등 여러 영역에서 다크모드 미적용/저대비 확인.
- Finding: 밝은 배경 위 흰색 계열 텍스트, 제목 영역의 라이트 배경 잔존, 모달 닫기 버튼과 헤더 대비 불균형, 빈 패널/카드의 토큰 미매핑 가능성.
- Evidence anchors: `site/style.css` L1461-L1495 modal header/close, L1752 app guide FAQ white, L2083/L2096 view/calendar white, L2509 detail exercise white, L3215 mobile modal header white, L3674-L3774 ACWR card, L4126-L4174 ACWR 보정.
- Classification: 전역 다크모드 가독성 문제로 MAJOR.
- Action: 다음 항목 `다크모드 전역 가독성 감사·보정 1차`로 전환.

## 2026-05-26 — ACWR 결과 카드·제목 영역 다크모드 가독성 보안/QA 1차
- Result: Step 2 QA 완료.
- Security/QA: BLOCKER/MAJOR/MINOR 0건. NIT 3건(주석 날짜, selector 중복 패턴, 장식 원형 톤)은 기능/보안 결함 아님.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Scope: `site/style.css` L4126-L4174 보정 블록 확인. `[data-theme="dark"]`와 `prefers-color-scheme: dark` 양쪽에서 `.acwr-card:not(.acwr-card--trend)` 계열을 토큰으로 재매핑.
- Safety: 신규 hex/rgba/hsl 0건, inline handler 0건, `site/app.js`/`site/index.html`/`site/data.js`/assets/vendor/evidence/security diff 0.
- Preserve: `calculateACWRMetrics`, `renderACWR`, `acuteLoad/chronicLoad/acwrRatio/acwrStatus` DOM id, 결과 화면 진입, 저장 schema 변경 없음.
- Browser: 실사용 미수행. 다음 티켓에서 다크/라이트 ACWR 카드와 status pill 확인 필요.
- Next: `ACWR 결과 카드·제목 영역 다크모드 가독성 브라우저 실사용 확인 1차`.

## 2026-05-26 — ACWR 결과 카드·제목 영역 다크모드 가독성 보정 1차
- Result: Step 2 구현 완료 정밀검토.
- Change: `site/style.css` L4126-L4174에 다크모드 전용 ACWR 보정 블록 추가. `[data-theme="dark"]`와 `prefers-color-scheme: dark` 양쪽에서 `.acwr-card:not(.acwr-card--trend)` 계열을 `var(--surface-2)`, `var(--text-main)`, `var(--text-muted)`, `var(--primary)`, `var(--border)`로 재매핑.
- Preserve: `site/app.js`, `site/index.html`, `site/data.js`, `renderACWR`, `calculateACWRMetrics`, `acwrStatus`, `p.workloadHistory`, 결과/차트 흐름 변경 없음.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 신규 보정 구간 hex/rgba/hsl 0건, inline handler 0건, 수정 금지 경로 diff 0.
- Issues: 총괄 정밀검토 기준 BLOCKER/MAJOR/MINOR 0건.
- Browser: 실사용 미수행. 다음 티켓에서 ACWR 카드 다크/라이트 대비와 status pill 확인 필요.
- Next: `ACWR 결과 카드·제목 영역 다크모드 가독성 보안/QA 1차`.

## 2026-05-26 — 8종목 평가 다크모드 대비 브라우저 실사용 확인 1차
- Result: 실사용 중 이슈 발견으로 보정 티켓 전환.
- User check: 정밀평가 카드 기본 기능은 확인 대상이었으나, 다크모드 가독성 점검 중 결과 화면의 ACWR 영역까지 심각한 대비 문제가 확인됨.
- Finding: `부상 위험도 예측 (ACWR)` 카드에서 글씨가 거의 보이지 않을 정도로 대비가 낮고, 제목 영역 배경도 다크모드 톤과 맞지 않음.
- Root cause candidate: `site/style.css` L3674-L3755 `.acwr-card`가 `background: var(--ink); color: var(--surface)` 및 흰색 rgba 라벨을 사용한다. 다크 토큰에서 `--ink`가 밝은 텍스트 계열로 반전되어 밝은 배경 위 흰색 라벨이 발생할 수 있음.
- Reference: `archive/design-mockups/2026-05-23-claude-design-export/mockups/07-s3-dt-result-schedule.png`, `snippets/06-acwr-hero.html`.
- Classification: 주요 지표 영역 텍스트가 보이지 않는 수준이므로 MAJOR.
- Action: 다음 항목 `ACWR 결과 카드·제목 영역 다크모드 가독성 보정 1차`로 전환.

## 2026-05-26 — 8종목 평가 다크모드 대비 보안/QA 1차
- Result: Step 2 QA 완료.
- Security/QA: BLOCKER/MAJOR/MINOR 0건. NIT 3건(주석 날짜, `.assess-item/.assess-title` 클래스 한정자 부재, native option UI 한계)은 기능/보안 결함 아님.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Scope: `site/style.css` L4107-L4124 보정 블록 확인. `.assess-item`, `.assess-title`, `select.cl-assess-input`, `select.cl-assess-input option`에 `var(--text-main)`/`var(--surface)`만 사용.
- Safety: 신규 hex/rgba/hsl 0건, inline handler 0건, `site/app.js`/`site/index.html`/`site/data.js`/assets/vendor/evidence/security diff 0.
- Preserve: `renderAssessmentForm`, `saveAssessment`, `drawRadarChart`, assessment guide modal, `p.scores` 저장 schema 변경 없음.
- Browser: 실사용 미수행. 다음 티켓에서 다크/라이트 대비와 select dropdown 확인 필요.
- Next: `8종목 평가 다크모드 대비 브라우저 실사용 확인 1차`.

## 2026-05-26 — 8종목 평가 다크모드 대비 보정 1차
- Result: Step 2 구현 완료 정밀검토.
- Change: `site/style.css` L4107-L4124에 평가 카드 다크모드 대비 보정 블록 추가. `.assess-item`, `.assess-title`, `select.cl-assess-input`, `select.cl-assess-input option`에 토큰 기반 color/background 명시.
- Preserve: `site/app.js`, `site/index.html`, `site/data.js`, 저장 schema, `renderAssessmentForm`, `saveAssessment`, `drawRadarChart`, guide modal 흐름 변경 없음.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. 신규 보정 구간 hex/rgba/hsl 0건, inline handler 0건, 수정 금지 경로 diff 0.
- Issues: 총괄 정밀검토 기준 BLOCKER/MAJOR/MINOR 0건.
- Browser: 실사용 미수행. 다음 티켓에서 다크/라이트 대비와 select dropdown 가독성 확인 필요.
- Next: `8종목 평가 다크모드 대비 보안/QA 1차`.

## 2026-05-26 — 8종목 평가 .cl-assess-card 도입 브라우저 실사용 확인 1차
- Result: 실사용 중 이슈 발견으로 보정 티켓 전환.
- User check: 평가 진입, 투수/타자 항목, select 선택, 가이드 모달, 평가 완료, 결과/스케줄/레이더 차트, 모바일 기본 흐름은 정상.
- Finding: 다크모드에서 일부 카드/입력 영역의 배경이 밝게 보여 흰색 계열 텍스트와 대비가 낮아지는 가독성 이슈 확인.
- Classification: 기능 차단은 아니므로 MINOR. 다크모드 대비 보정 필요.
- Action: 다음 항목 `8종목 평가 다크모드 대비 보정 1차`로 전환.

## 2026-05-26 — 8종목 평가 .cl-assess-card 도입 보안/QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Scope: `renderAssessmentForm`의 class 추가 2곳 확인: `site/app.js` L2752 `assess-item cl-assess-card`, L2756 `form-control cl-assess-input`.
- Preserve: `getAssessmentKeysByType`, `renderAssessmentForm`, `saveAssessment`, `drawRadarChart`, `data-assessment-action`, `data-assessment-guide-action`, `data-assessment-key`, `radarChart` anchor 유지.
- Safety: `cl-assess-bar/progress/card-title/card-desc` 0건, 신규 CSS 구간 hex/rgba/hsl 0건, inline handler 0건, 수정 금지 경로 diff 0.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건. 최초 selector 보존 `rg`는 escape 문제로 실패했으나 개별 `-e` 패턴 재실행으로 확인 완료.
- Browser: 실사용 미수행. 다음 티켓에서 사용자 확인 필요.
- Next: `8종목 평가 .cl-assess-card 도입 브라우저 실사용 확인 1차`.

## 2026-05-26 — 8종목 평가 .cl-assess-card 도입 구현 1차
- Result: Step 2 구현 완료 정밀검토.
- Change: `renderAssessmentForm` 템플릿에서 `.assess-item cl-assess-card`, `.form-control cl-assess-input` class 추가.
- Change: `site/style.css`에 `.assess-item.cl-assess-card { box-shadow: var(--shadow-card); }`, `select.cl-assess-input { padding-block: 12px; }` 추가.
- Preserve: `saveAssessment`, `getAssessmentKeysByType`, `drawRadarChart`, `#score_${key}`, `[data-assessment-action]`, `[data-assessment-guide-action]`, `p.scores` schema 변경 없음.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `cl-assess-bar/progress/title/desc` 0건, 신규 CSS hex/rgba/hsl 0건, 수정 금지 파일 diff 0.
- Issues: 총괄 정밀검토 기준 BLOCKER/MAJOR/MINOR 0건.
- Next: `8종목 평가 .cl-assess-card 도입 보안/QA 1차`.

## 2026-05-26 — 8종목 평가 .cl-assess-card 도입 설계 1차
- Result: Step 2 설계 완료.
- Inventory: `#assessmentForm`은 정적 빈 컨테이너이고, `renderAssessmentForm`이 `.assess-item`, `.assess-title`, `.assess-desc`, `#score_${key}` select를 동적 생성. `saveAssessment`는 `p.scores[key]` 1~5 number 저장.
- Decision: A안 채택. v1은 DOM 구조/selector/schema를 유지하고 `.assess-item`에 `cl-assess-card`, select에 `cl-assess-input` 클래스만 추가한다.
- Constraint: 시안 원문에는 `.cl-assess-card/.cl-assess-input/.cl-assess-bar/.cl-assess-progress`만 있고 전용 CSS/snippet은 부재. 원문에 없는 `cl-assess-card-title/desc` 네이밍은 만들지 않는다.
- Preserve: `#assessmentForm`, `#score_*`, `[data-assessment-action]`, `[data-assessment-guide-action]`, `getAssessmentKeysByType`, `saveAssessment`, radar chart, `p.scores` schema 변경 없음.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `site/*`의 `cl-assess*` 매칭 0건.
- Next: `8종목 평가 .cl-assess-card 도입 구현 1차`.

## 2026-05-26 — RPE 입력 .rpe-bar 11셀 그리드 브라우저 실사용 확인 1차
- Result: Step 2 확인 완료.
- User check: RPE 11셀 UI 정상 작동 확인. 기능/표시 이슈 없음.
- Scope confirmed: 11셀 표시, 셀 클릭 선택 강조, live workload 갱신, rest 버튼 0셀 동기화, 저장 후 edit load 복원, 모바일 가독성 확인.
- Note: 다크모드는 전체 프로젝트 품질 관점에서 100% 완료로 보지 않고 별도 잔여 QA 후보로 분리.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Next: `8종목 평가 .cl-assess-card 도입 설계 1차`.

## 2026-05-26 — RPE 입력 .rpe-bar 11셀 그리드 보안/QA 1차
- Result: Step 2 QA 완료.
- Security/QA: BLOCKER/MAJOR/MINOR 0건. NIT 2건(화살표 키 이동 미구현, CSS 주석 날짜)은 v1 범위 외/무해.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Event flow: `.rpe-cell` 클릭 → `#wlRPE.value` 설정 → bubbles `input` event dispatch → 기존 `_handleWorkloadLiveCalcInput` → `calculateLiveWorkload()` 흐름. `calculateLiveWorkload`와 `_syncRpeBarSelection`은 event 재발행 없음, 루프 없음.
- Preserve: `saveDailyWorkload` 0~10 validation, pitchCount>=1이면 RPE>=1 규칙, 저장 schema, `backupVersion`, restore validators 유지.
- Security: inline handler 0, 신규 CSS hex/rgba/hsl 0, 금지 표현 신규 도입 0. hidden input은 `tabindex="-1" aria-hidden="true"`로 보이지 않는 포커스 없음.
- Browser: 실사용 미수행. 다음 티켓에서 11셀 클릭/live calc/edit load/rest/모바일 가독성 확인 필요.
- Next: `RPE 입력 .rpe-bar 11셀 그리드 브라우저 실사용 확인 1차`.

## 2026-05-26 — RPE 입력 .rpe-bar 11셀 그리드 구현 1차
- Result: Step 2 구현 완료 정밀검토.
- Change: `site/index.html`에 `#wlRpeBar` 11셀 정적 버튼 UI 추가, 기존 `#wlRPE` input은 hidden JS 호환용으로 유지.
- Change: `site/app.js`에 `_rpeBarClickHandler`, `_handleRpeBarClick`, `_syncRpeBarSelection`, `_bindRpeBarClickHandler` 추가. 셀 클릭 → hidden input value 설정 → 기존 `input` 이벤트 dispatch → live calc 흐름 유지.
- Change: `site/style.css`에 `.wl-rpe-hidden-input`, `.rpe-bar`, `.rpe-cell` 및 4구간 토큰 색상 추가.
- Preserve: `saveDailyWorkload` 0~10 validation, `dailyCompletion`, `completionHistory`, `workloadHistory`, backup/restore schema 변경 없음.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. inline handler 0, 신규 CSS hex/rgba/hsl 0, 금지 표현 신규 도입 0.
- Issues: 총괄 정밀검토 기준 BLOCKER/MAJOR/MINOR 0건.
- Next: `RPE 입력 .rpe-bar 11셀 그리드 보안/QA 1차`.

## 2026-05-26 — RPE 입력 .rpe-bar 11셀 그리드 설계 1차
- Result: Step 2 설계 완료.
- Decision: A안 채택. 기존 `#wlRPE` input은 JS 호환용으로 유지하고, 사용자 조작은 `.rpe-bar` 11셀 버튼 UI로 처리한다.
- Scope: `site/index.html` `#workloadModal`, `site/app.js` workload live calc/save/open modal 흐름, `site/style.css` 신규 `.rpe-bar/.rpe-cell` 스타일.
- Preserve: 저장값 `rpe` number 유지, `dailyCompletion`, `workloadHistory`, backup/restore schema 변경 0. 기존 `saveDailyWorkload` 0~10 validation 유지.
- Safety: 평균값, 임계값, 자동 위험 판정, 부상 예측 문구 도입 금지. `docs/evidence/evidence-research.md`의 0~10 session-RPE 기준만 참고.
- Review correction: 숨김 input이 보이지 않는 키보드 포커스를 만들지 않도록 `tabindex="-1" aria-hidden="true"`와 radiogroup 셀 tabindex 동기화를 구현 조건에 추가.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `.rpe-bar/.rpe-cell` 기존 매칭 0건.
- Next: `RPE 입력 .rpe-bar 11셀 그리드 구현 1차`.

## 2026-05-26 — 7일 스케줄 .week-list 월간 잔존 표시 보정 1차
- Result: Step 2 보정 완료 + 사용자 실사용 확인 정상.
- Bug: 월간 보기 진입 후 주간 보기로 돌아오면 `monthlyCalendarContainer`가 하단에 계속 표시됨.
- Fix: `renderWeeklyCalendar`에서 `monthlyCalendarContainer`를 조회하고 주간 보기 진입 시 `display = 'none'` 처리.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Preserve: `renderMonthlyCalendar`, `renderBadgesAndSchedule`, 저장 schema, 워크로드 계산, 추천/스왑 로직 변경 없음.
- Browser: 사용자 확인 결과 `월간 → 주간` 흐름 정상.
- Next: `RPE 입력 .rpe-bar 11셀 그리드 설계 1차`.

## 2026-05-26 — 7일 스케줄 .week-list B2 브라우저 실사용 확인 1차
- Result: 실사용 중 이슈 발견으로 보정 티켓 전환.
- User finding: 월간 보기 진입 후 주간 보기로 돌아오면 하단에 월간 달력이 계속 남는 표시 버그 확인.
- Root cause: `renderMonthlyCalendar`는 `calendarContainer`를 숨기지만, `renderWeeklyCalendar`는 `monthlyCalendarContainer`를 숨기지 않아 뷰 전환 상태가 비대칭.
- Action: 다음 항목 `7일 스케줄 .week-list 월간 잔존 표시 보정 1차`로 전환.

## 2026-05-26 — 7일 스케줄 .week-list B2 렌더링 보안/QA 1차
- Result: Step 2 QA 완료.
- Security/QA: BLOCKER/MAJOR/MINOR 0건. NIT 2건은 기존 스타일/무해 중복으로 조치 불필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- XSS: `renderWeeklyCalendar` L3319-L3355 innerHTML 동적값은 상수, 정수, 또는 `escapeHTML` 경유. 사용자 데이터 `p.dailyCompletion[i].workload`는 `escapeHTML(String(...))` 경유.
- Click flow: `data-calendar-cell-action="open-card"` 유지, `_handleWeeklyCalendarClick` L3359-L3367 → `toggleViewMode('card')` 유지, `_bindWeeklyCalendarClickHandler` L3369-L3376 중복 등록 방지 유지.
- Preserve: scheduleContainer 카드 뷰, 저장 schema, snapshot, 워크로드 계산, 운동 추천 로직 변경 흔적 없음.
- Browser: 실사용 미수행. 다음 티켓에서 사용자 확인 필요.
- Next: `7일 스케줄 .week-list B2 브라우저 실사용 확인 1차`.

## 2026-05-26 — 7일 스케줄 .week-list B2 렌더링 구현 1차
- Result: Step 2 구현 완료 정밀검토.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Change: `renderWeeklyCalendar` site/app.js L3319-L3356이 `.calendar-grid/.calendar-cell` 출력에서 `.week-list/.week-row/.week-date/.week-content/.week-meta` 출력으로 전환됨.
- Preserve: `_handleWeeklyCalendarClick` L3359-L3367, `_bindWeeklyCalendarClickHandler` L3369-L3376, `toggleViewMode('card')` 흐름 유지. `data-calendar-cell-action="open-card"` 유지.
- Preserve: `site/index.html`, `site/data.js`는 5/24 최종 스냅샷 대비 무변경. `site/style.css`는 본 티켓 무수정(이전 `.week-*` scaffold만 존재).
- Security note: `innerHTML` 출력 구조 변경이 있으므로 다음 단계는 보안/QA 담당의 escape/XSS 및 클릭 회귀 점검.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건 (총괄 정적 기준).
- Next: `7일 스케줄 .week-list B2 렌더링 보안/QA 1차`.

## 2026-05-25 — 7일 스케줄 .week-list Phase B UX 결정 설계 1차
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Decision: B2 채택. `calendarContainer` 보조 격자만 `.week-list` 행 단위로 전환하고, 메인 `scheduleContainer` 카드 뷰는 유지.
- Rationale: 영향 범위가 `renderWeeklyCalendar` L3298-L3352 단일 함수로 한정됨. `_bindWeeklyCalendarClickHandler` L3364-L3371은 `data-calendar-cell-action="open-card"`만 필요하므로 유지 가능.
- Preserve: `scheduleContainer` 카드 뷰, 4개 click handler, 저장 schema, snapshot, 워크로드 계산, 운동 추천 로직 모두 변경 대상 아님.
- Note: 설계 본문에 `data-day-index` 추가 예시가 있었지만 현재 핸들러는 사용하지 않으므로 후속 구현 티켓에서는 추가하지 않도록 제한.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `7일 스케줄 .week-list B2 렌더링 구현 1차`.

## 2026-05-25 — 7일 스케줄 .week-list CSS scaffold 구현 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Change: `site/style.css` L3921-L4021에 `.week-list`, `.week-row`, `.week-row.today`, `.week-date`, `.week-content`, `.week-meta`, `.week-items`, `.week-item` scaffold 추가.
- Preserve: `site/app.js`, `site/index.html`, `site/data.js`는 5/24 최종 스냅샷 대비 무변경. `.week-*`는 `site/style.css`에만 존재하고 app/index 매치 0건.
- Preserve: `renderWeeklyCalendar` L3298-L3352, `.calendar-grid`, `.calendar-cell`, `data-calendar-cell-action` 흐름 무변경.
- Style: 신규 scaffold 구간 hex/rgba/hsl 0건. 기존 토큰만 사용.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `7일 스케줄 .week-list Phase B UX 결정 설계 1차`.

## 2026-05-25 — 7일 스케줄 시안 .week-list 패턴 설계 1차
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Current structure: `renderWeeklyCalendar` site/app.js L3298-L3352는 `.calendar-grid`/`.calendar-cell` 7일 격자 출력, `_bindWeeklyCalendarClickHandler`로 카드 뷰 전환.
- Current CSS: `.schedule-day` 계열 L932+, `.calendar-cell.today` L2154+, `.today-summary-*` L3805+ 확인.
- Mockup: `archive/design-mockups/2026-05-23-claude-design-export/components.css` L437-L491에 `.week-list`, `.week-row`, `.week-row.today`, `.week-item` 정의 존재.
- Decision: Phase A는 CSS scaffold만 추가 가능. Phase B(JS 템플릿 교체)는 B1/B2 UX 결정 전 보류.
- Preserve: 본 설계 티켓에서 `site/*` 코드 수정 없음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `7일 스케줄 .week-list CSS scaffold 구현 1차`.

## 2026-05-25 — 본문 폰트 사이즈 실사용 검토 1차
- Result: Step 2 확인 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Static: `--t-body-size: 13.5px`, `--doc-body-size: 16px` 기준 확인. inline handler/광고/canonical/JSON-LD 0건.
- Browser: 도구 접근은 차단되어 자동 확인 미수행. 사용자 회신 `모두 정상`으로 실사용 확인 완료 처리.
- Preserve: `site/*` 코드 수정 없음. workflow 문서만 정리.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `7일 스케줄 시안 .week-list 패턴 설계 1차`.

## 2026-05-25 — 다크모드 prefers-color-scheme 자동 적용 (기록 보정용 독립 항목)
- Result: 코드 변경 단일·의도 일치 확인. Stage 1 등록 누락이었던 다크모드 도입을 독립 항목으로 보정.
- 변경 출처: 본래 `equip 12색 시각 확인 1차` 활성 티켓 하에서 잘못 진행됐던 다크모드 코드 변경(2026-05-25). 본 보정 티켓으로 독립 기록.
- 변경 파일: `site/tokens.css` 단일 (+38줄).
  - L137-140 코멘트 갱신: 자동 적용 + data-theme 강제 옵션 안내.
  - L141-177 기존 `[data-theme="dark"]` 블록 보존 (수동 다크 강제).
  - L179-217 신규 `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }` 블록 추가 (다크 토큰 32개).
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `rg "prefers-color-scheme|data-theme=\"dark\"|data-theme=\"light\"|:root:not\(\[data-theme=\"light\"\]\)" site/tokens.css site/*.html site/app.js` → tokens.css L137·138·139·140·141·179·180 매치 (HTML/JS 매치 0건, 의도된 자동 적용).
- Diff (vs `archive/root-file-backups/site-snapshot-2026-05-24-post-f-bundle/tokens.css`): 코멘트 4줄 + @media 블록 +38줄 = tokens.css만 변경, 그 외 파일 0라인.
- CSS 우선순위 6 시나리오 검증 (의도와 일치):
  - 시스템 다크 + data-theme 미부여 → @media 매치 → 다크.
  - 시스템 다크 + `data-theme="dark"` → 둘 다 매치 → 다크.
  - 시스템 다크 + `data-theme="light"` → :not 미매치 → 라이트.
  - 시스템 라이트 + data-theme 미부여 → @media 비활성 → 라이트.
  - 시스템 라이트 + `data-theme="dark"` → 강제 블록 매치 → 다크.
  - 시스템 라이트 + `data-theme="light"` → 강제 블록 미매치 → 라이트.
- 카피 정책 확인: inline handler 0건, ads/canonical/jsonld 0건 — 회귀 없음.
- 브라우저 실사용 확인 항목 3건: **미수행** (사용자 OK 회신 시 본 항목에 추가 기록).
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건 (정적 기준).
- Next: 본 변경 자체는 종결. `follow-up-queue.md`의 "다크모드 도입 (2026-05-25)" 처리 완료 항목은 실제 코드와 일치 확인. 사용자 브라우저 실사용 결과 회신 시 본 항목에 OK/이슈 추가.

## 2026-05-25 — 5/24 디자인 마이그레이션 사후 큐 정리 1차
- Result: Step 2 정리 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `innerHTML|insertAdjacentHTML|outerHTML` count `site/app.js:34`, `site/index.html` 0건. `replaceChildren()` 4건 유지.
- Pass: CSP `font-src 'self'; style-src 'self'` 유지.
- Queue: Stage 1b NIT 2건은 현재 파일에서 처리 확인되어 잔여 큐에서 제외.
- Current queue: 9개 항목. 우선순위 1은 equip 색 결정, 다크모드, 폰트 사이즈.
- Preserve: `site/*` 코드 수정 없음. 정리 대상은 workflow 문서만.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `equip 12색 유지/통일 디자인 결정 1차`.

## 2026-05-25 — equip 12색 유지/통일 디자인 결정 1차 정밀검토
- Result: Step 2 구현 완료로 추인.
- Decision: 절충안 채택 — 카테고리 식별성 유지 + 채도 낮춤 + text `var(--ink-2)` 통일.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `site/style.css` L74-L85의 equip token 12건이 spec과 일치함.
- Preserve: `site/app.js`, `site/data.js`, `site/tokens.css`, `site/index.html`은 최종 스냅샷 대비 무변경.
- Preserve: inline handler/광고/canonical/JSON-LD 0건.
- Note: work-plan 활성 티켓명은 사후 큐 정리 상태로 남아 있었지만 section 8 결과와 실제 구현은 일치해 문서 흐름을 보정함.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `equip 12색 시각 확인 1차`.

## 2026-05-24 — Claude Design Direction B (Clinical Trust) 시안 마이그레이션 묶음 (총괄 위임 모드)
- Result: 위임 모드 종결. 디자인 시안 약 90% 적용 + 잔여 영역 follow-up-queue.md에 11건 등록.
- 위임 구조: 사용자 지시로 본 Claude Code 세션이 총괄 Codex 자리 한시 대행 (정밀검토·티켓 작성·종료 판단). 코드 구현은 에이전트(general-purpose) 위임 + 본 세션 정밀검토.
- 변경 파일 (11개):
  - 신규: `site/tokens.css` (시안 토큰 사본, 외부 @import 제거, font-family Pretendard 우선).
  - 수정: `site/style.css` (3658→3915줄, alias 블록 + 컴포넌트 시안 톤 정합).
  - 수정: `site/docs.css` (77→160+줄, 시안 .doc-* 마스터 풀 재작성 + .doc-eyebrow/.h-num/.doc-lead 추가).
  - 수정: `site/app.js` (Chart.js fill rgba 6곳: Forest Green/amber/red/mint → navy/watch/risk/safe).
  - 수정: `site/{index,about,assessment-guide,contact,privacy,recovery-guide,terms,workload-guide}.html` (head에 tokens.css link 추가, docs 7개는 .doc-eyebrow + h2 .h-num 추가).
- 미변경 파일: site/data.js, site/_headers, site/vendor/**, archive/design-mockups/2026-05-23-claude-design-export/** (원본 패키지), docs/{evidence,security,project}/**.
- 백업 스냅샷 (8개 시점, 영역별 롤백 가능):
  - `archive/root-file-backups/site-snapshot-2026-05-24-pre-design-migration/` (Stage 1a 직전)
  - `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-1b/`
  - `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-3/`
  - `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-4-color-pass/`
  - `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-4a/`
  - `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-5g/`
  - `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-5a/`
  - `archive/root-file-backups/site-snapshot-2026-05-24-post-f-bundle/` (Stage 5 F1+F2 완료 직후, 가장 최신)
- 완료된 영역:
  - 컬러: Forest Green → Navy 전면 전환 (Clinical Trust 톤).
  - 토큰: tokens.css 사본 + style.css alias (60+ 변수 매핑) + Pretendard 폰트 유지.
  - 컴포넌트 시안 톤: 버튼·폼·입력·토글·체크박스·recovery-picker·카드·배지·모달·차트·KPI·필터 칩·액션 큐·구속 박스·통계 그리드·선수 카드(헤더/메타/태그 5종).
  - 결과 페이지 ACWR: 어두운 ink 다크 패널 + 56px 모노 비율 숫자.
  - 문서 페이지 7종: 시안 .doc-* 마스터 + eyebrow 카테고리 라벨 + h2 mono 번호 태그.
- 정적 검증 (종결 시점):
  - `node --check site/app.js` PASS, `node --check site/data.js` PASS.
  - `innerHTML/insertAdjacentHTML/outerHTML` site/app.js 34건·site/index.html 0건 (회귀 없음).
  - `replaceChildren()` 4건 유지(L1610/L2803/L2897/L5520).
  - CSP `font-src 'self'; style-src 'self'` 유지 (외부 폰트/CSS 0건).
- Issues: BLOCKER/MAJOR 0. MINOR 1건 자체 해소(Stage 1a cascade). NIT 2건 처리 완료.
- 위임 모드 중 원칙 위반 1건: Stage 5 G h2 .h-num sed 일괄 처리(35건)를 본 세션이 직접 처리. 결과 정확하여 사용자 추인.
- 잔여 작업 (follow-up-queue.md 11개 항목):
  - 우선순위 1 (디자인 결정 사항 3건): equip 12색 통일·다크모드 도입·본문 폰트 사이즈 검토.
  - 우선순위 2 (Stage 5 깊은 영역 6건): 7일 스케줄 `.week-list` / RPE `.rpe-bar` / 8종목 평가 `.cl-assess-*` / 운동 가이드/대체/앱 가이드 모달 `.cl-*` / HTML 클래스명 풀 리네임 / `.brand-mark` 미니 로고.
  - 우선순위 3 (Stage 1b 잔여 NIT 2건): `.doc-note` 어두운 amber 텍스트 매핑(이미 처리 완료) / `.player-velo-box` --success-* 토큰 매핑(이미 처리 완료).
- 상세 진행 기록: `docs/workflow/work-plan-2026-05-24-delegation.md` (5/24 위임 모드 작업 일지 전체 33섹션 + 위임 종결 보고 보존).
- Next: Codex 복귀 후 정상 워크플로 복귀. 잔여 영역(특히 Stage 5 깊은 영역 6건)은 보안/QA Claude 호출 + 사용자 실사용 확인 흐름의 정식 티켓으로 분할 진행.

## 2026-05-23 — innerHTML clear sink DOM API 전환 브라우저 실사용 확인 1차 정밀검토 (총괄 위임 1회 한정)
- Result: 묶음 종료. 4경로 모두 OK.
- Static: `replaceChildren()` 4건 유지(L1610/L2803/L2897/L5520), `innerHTML|insertAdjacentHTML|outerHTML` site/app.js 34건·site/index.html 0건 회귀 없음.
- Pass (브라우저 MCP 위임 검증): A `#initialRecoveryGroup` 비움·숨김 OK. B `#liveWorkloadDisplay` 빈값 분기 비움·숨김 OK(0/0은 별도 사양 분기). C `#wellnessRecoveryGroup` 재오픈 시 잔존 없음 OK. D `#wlExerciseChecklist` 갱신 시 0% 잔존 OK.
- Preserve: `site/*` 무수정. `docs/evidence/*`/`docs/security/*`/`docs/project/*` 무수정.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Note: 에이전트가 정적 서빙용 `.claude/launch.json` 신규 생성(site 외부, untracked).
- Next: 차기 티켓 등록은 사용자 회신 대기 (총괄 위임은 1회 한정).

## 2026-05-20 — app.js CSSOM style setter class 토글 설계 1차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, CSSOM setter 전체 95건, `site/app.js`/`site/index.html` `style=` 0건.
- Pass: 속성별 count는 `display 64 / background 9 / color 10 / border 3 / opacity 5 / cursor 2 / fontWeight 1 / width 1`로 실제 코드와 일치.
- Issue: MAJOR 1건. 분류 합계가 `A 72 + B 22 + C 1`로 기록됐지만, B 하위 항목 12+9+3=24와 맞지 않고 `gAvoid`/`fontWeight` 분류가 중복됨.
- Next: `app.js CSSOM style setter class 토글 설계 카운트 보정 1차`.

## 2026-05-20 — app.js template inline style 클래스화 중복 selector 보정 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `.wl-rpe-guide-title` selector 1건, `site/app.js`/`site/index.html` `style=` 0건.
- Preserve: `site/app.js`, `site/index.html`, `_headers`, data/docs/vendor/assets/evidence diff 0 라인, 신규 hex/rgba 0건.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `app.js CSSOM style setter class 토글 설계 1차`.

## 2026-05-20 — app.js template inline style 클래스화 1차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `site/app.js`/`site/index.html` `style=` 0건.
- Pass: 7개 template inline style 제거, event/data/id/저장/스왑/워크로드 구조 보존.
- Issue: NIT 1건. `.wl-rpe-guide-title` selector가 `site/style.css` L528과 L3646에 중복 정의됨.
- Next: `app.js template inline style 클래스화 중복 selector 보정 1차`.

## 2026-05-20 — index.html display inline style 클래스화 6차 show 토글 회귀 수정 1차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `addBatterFields`/`editBatterFields`/`perfBatterFields` show 경로 `block` 확인.
- Preserve: `site/index.html` `style="` 0건 유지, `is-initially-hidden` 3개 class 유지, `site/index.html`/style/_headers/data/vendor/assets/evidence diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `app.js template inline style 클래스화 1차`.

## 2026-05-20 — index.html display inline style 클래스화 6차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `site/index.html` `style="` 0건.
- Issue: MAJOR 1건. `addBatterFields`, `editBatterFields`, `perfBatterFields`는 `class="is-initially-hidden"`인데 JS show 경로가 `style.display = ''`라 외부 CSS hidden을 이기지 못함.
- Preserve: `_headers`, `site/app.js` 외 무수정 대상 diff 0 라인, evidence 문서 무수정.
- Next: `index.html display inline style 클래스화 6차 show 토글 회귀 수정 1차`.

## 2026-05-20 — index.html form error inline style 클래스화 5차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 대상 오류 div 5건 inline style 0건, `form-error-message` 정의 1 + 사용 5건.
- Count: `site/index.html` `style="` 27건 → 22건.
- Preserve: `site/app.js` validation display 토글 보존, `_headers`/data/docs/vendor/assets/evidence diff 0 라인, inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `index.html display inline style 클래스화 6차`.

## 2026-05-16 — 전체 데이터 초기화 QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `localStorage.clear()` 0건, removeItem 대상 `pLDB_v4_5`/`pLAppGuideSeen_v1` 2건.
- Structure: `위험 작업` 영역과 `전체 데이터 초기화` 버튼/모달 존재, `saveDB()` 미호출, 취소는 모달 close만 수행.
- Browser: 파괴적 삭제는 미수행으로 기록. 최소 UI 확인은 별도 Codex 검토에서 버튼/모달/입력 활성화/취소 동작 확인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `개인정보처리방침 앱 내 삭제 안내 갱신 1차`.

## 2026-05-16 — 개인정보처리방침 앱 내 삭제 안내 갱신 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건.
- Change: `site/privacy.html` line 109에서 전체 초기화 버튼 미제공 문구 제거, `위험 작업 > 전체 데이터 초기화`와 백업 JSON 필요 안내 반영.
- Preserve: `site/index.html`, `site/app.js`, `site/style.css`, `site/data.js`, `site/vendor/**`, `site/assets/**` diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `복원 JSON schema 강화 설계 1차`.

## 2026-05-16 — 복원 JSON schema 강화 설계 1차
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, restore 함수 line inventory 일치, `site/*` diff 0 라인.
- Issue: MAJOR 2건. `appVersion/storageKey` 길이 검증 위치가 `validateRestorePlayers(restoredPlayers)` 시그니처와 불일치. `legacy` flag를 confirm 메시지에 표시하려면 `handleRestoreFile` 전달부도 구현 범위에 포함돼야 함.
- Next: `복원 JSON schema 강화 설계 보정 1차`.

## 2026-05-16 — 복원 JSON schema 강화 설계 보정 1차
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, `site/*` diff 0 라인.
- Change: player data 상한은 `validateRestorePlayers`, backup meta 상한과 raw array `legacy` flag는 `extractRestorePlayers`, confirm 문구는 `buildRestoreConfirmMessage`, 전달부는 `handleRestoreFile`로 책임 분리.
- Preserve: raw array 즉시 차단 금지, unknown field drop 보류, `site/*` 무수정.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `복원 JSON schema 강화 구현 1차`.

## 2026-05-16 — 복원 JSON schema 강화 구현 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Change: restore 상한 상수 7종과 `_isOverMetaLimit`/`_exceedsRestoreShapeLimits` 추가, raw array `legacy:true`, envelope `legacy:false`, confirm 구버전 라벨, `handleRestoreFile` 전달부 구현.
- VM: raw/envelope/meta limit/player count/name/week/depth/array/legacy label 11 케이스 PASS.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `복원 JSON schema 강화 QA 1차`.

## 2026-05-16 — 복원 JSON schema 강화 QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- VM: envelope/raw/meta limit/player count/name/week/depth/array/object keys/legacy label 12 케이스 PASS.
- Browser: 복원 파일 업로드 실사용은 미수행으로 기록. 정상 envelope/raw 복원, 상한 거부 alert, 구버전 라벨 확인 필요.
- Security: 터미널 Codex 보고서 미수신.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `goal/trainingFocus 라벨·도움말 역할 분리 설계 1차`.

## 2026-05-16 — goal/trainingFocus 라벨·도움말 역할 분리 설계 1차
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `goal`/`trainingFocus` line inventory 일치, `site/*` diff 0 라인.
- Decision: `goal`은 7일 스케줄 분기 키, `trainingFocus`는 운동 매칭·스왑 점수 보조 신호로 정의.
- Copy: `주요 목표` → `포지션별 핵심 목표`, `훈련 목적` → `훈련 운영 방향`, 도움말 2종 추가.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `goal/trainingFocus 라벨·도움말 역할 분리 구현 1차`.

## 2026-05-16 — goal/trainingFocus 라벨·도움말 역할 분리 구현 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Change: `site/index.html` 라벨 7건 교체, 도움말 6건 추가, option value/text·id·class·data-* 보존.
- Counts: `주요 목표|훈련 목적` 0건, `포지션별 핵심 목표` 4건, `훈련 운영 방향` 3건, 도움말 4+2건.
- Issues: BLOCKER/MAJOR/MINOR 0건, NIT 1건(인라인 도움말 style은 후속 스타일 정리 후보).
- Next: `goal/trainingFocus 라벨·도움말 역할 분리 QA 1차`.

## 2026-05-16 — goal/trainingFocus 라벨·도움말 역할 분리 QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Counts: `주요 목표|훈련 목적` 0건, `포지션별 핵심 목표` 4건, `훈련 운영 방향` 3건, 도움말 4+2건, option value 24건 보존.
- Browser: `127.0.0.1:8000` DOM 확인. 기존 문구 0, 새 라벨/도움말 카운트 일치, 관련 텍스트 overflow 0.
- Issues: BLOCKER/MAJOR/MINOR 0건, NIT 1건(인라인 도움말 style 클래스화 후보).
- Next: `폼 도움말 스타일 클래스화 구현 1차`.

## 2026-05-16 — 폼 도움말 스타일 클래스화 구현 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Change: `.form-help-text` selector 1건 추가, 도움말 6개 div를 `class="form-help-text"`로 교체, 문구·라벨·option value/text 보존.
- Counts: `form-help-text` index 6건 + CSS 1건, 도움말 4+2건, 기존 인라인 도움말 스타일 0건, `주요 목표|훈련 목적` 0건.
- Browser: cache-bust URL 기준 CSS rule 적용 확인. `.form-help-text` 6건, computed `font-size:12px`/`margin-top:4px`, overflow 0.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `폼 도움말 스타일 클래스화 QA 1차`.

## 2026-05-16 — 폼 도움말 스타일 클래스화 QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Counts: `form-help-text` index 6건 + CSS 1건, 도움말 4+2건, 기존 인라인 도움말 스타일 0건, `주요 목표|훈련 목적` 0건.
- Browser: `127.0.0.1:8000/?codex_cache_bust=...` 기준 `.form-help-text` rule 적용, computed `font-size:12px`/`margin-top:4px`, overflow 0.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Queue: 완료된 개인정보/복원 항목은 archive 기준 완료 처리. 다음 미완료 보안/배포 품질 항목으로 이동.
- Next: `vendor 라이선스/NOTICE 정리 설계 1차`.

## 2026-05-16 — vendor 라이선스/NOTICE 정리 설계 1차
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `site/vendor` inventory 8건, `site/*` diff 0 라인.
- Inventory: Chart.js v4.4.2, html2canvas 1.4.1, lucide v0.344.0, Pretendard woff2 5종.
- Decision: 후속 구현은 `site/vendor/NOTICE.md` 신규 1건으로 제한. 런타임 코드, HTML 로딩 순서, vendor 번들/폰트 파일 무변경.
- Sources: Chart.js MIT 공식 LICENSE, Pretendard SIL OFL 공식 LICENSE 확인. html2canvas/lucide는 로컬 header로 MIT/ISC 확인 가능.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `vendor 라이선스/NOTICE 정리 구현 1차`.

## 2026-05-16 — vendor 라이선스/NOTICE 정리 구현 1차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `site/vendor/NOTICE.md` 존재, vendor artifact 8건 대응, 무수정 대상 diff 0 라인.
- Issue: MAJOR 1건. `site/vendor/NOTICE.md`가 license URL은 기록했지만 Lucide의 Feather MIT 파생 attribution과 Pretendard의 copyright/reserved font attribution을 누락.
- Preserve: vendor JS/폰트 바이너리, 앱 런타임 파일, HTML 로딩 순서 변경 없음.
- Next: `vendor NOTICE attribution 보강 1차`.

## 2026-05-16 — vendor NOTICE attribution 보강 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Change: `site/vendor/NOTICE.md`에 Lucide/Feather/Pretendard copyright 및 reserved font attribution 보강.
- Sources: Lucide 공식 LICENSE의 ISC + Feather MIT notice, Pretendard 공식 LICENSE의 Kil Hyung-jin/Adobe/Inter/M PLUS notices 대조.
- Preserve: Chart.js/html2canvas 기존 attribution과 파일 대응 관계 손상 없음. vendor JS/폰트 바이너리, 앱 런타임 파일 무수정.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `vendor NOTICE attribution QA 1차`.

## 2026-05-16 — vendor NOTICE attribution QA 1차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, NOTICE inventory 대응 및 Lucide/Feather/Pretendard key 검출 확인.
- Issue: MAJOR 1건. `site/vendor/NOTICE.md` Pretendard 파생 attribution의 Adobe/M PLUS 1 표기가 공식 LICENSE 원문과 일부 불일치.
- Preserve: vendor JS/폰트 바이너리, 앱 런타임 파일, HTML 로딩 순서 변경 없음.
- Next: `Pretendard attribution 정확도 보정 1차`.

## 2026-05-16 — Pretendard attribution 정확도 보정 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Change: `site/vendor/NOTICE.md` Pretendard 파생/혼합 attribution 3줄 보정.
- Sources: 공식 Pretendard LICENSE와 대조해 Adobe `Copyright 2014-2021 Adobe`, Inter `Copyright (c) 2016`, M PLUS 1 Reserved Font Name `M PLUS 1` 정합 확인.
- Preserve: Chart.js/html2canvas/lucide 항목, vendor JS/폰트 바이너리, 앱 런타임 파일 무수정.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `Pretendard attribution 정확도 QA 1차`.

## 2026-05-16 — Pretendard attribution 정확도 QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Notice: Pretendard 공식 attribution 7개 키워드 검출, 이전 오표기 `Adobe Systems Incorporated` 및 Reserved Font Name `M+ FONTS` 0건.
- Preserve: Chart.js/html2canvas/lucide/Pretendard 헤더와 attribution 유지. vendor JS/폰트 바이너리, 앱 런타임 파일 무수정.
- Source check: 공식 Pretendard LICENSE 원문과 `NOTICE.md` line 44·46·47·48 정합.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `legacy raw array 복원 정책·문구 보강 설계 1차`.

## 2026-05-16 — legacy raw array 복원 정책·문구 보강 설계 1차
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, site 대상 diff 0 라인.
- Inventory: `extractRestorePlayers` L6357, raw `legacy:true` L6359, envelope `legacy:false` L6373, `validateRestorePlayers` L6380, `buildRestoreConfirmMessage` L6429, `handleRestoreFile` L6493.
- Decision: 1차는 raw array 호환성 유지 + confirm 문구 강화. envelope-only 전환과 2차 확인은 보류.
- Next scope: `buildRestoreConfirmMessage`의 `legacyText` L6442 단일 영역만 수정, 저장 schema·RESTORE 상한·복원 흐름 변경 금지.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `legacy raw array 복원 문구 보강 구현 1차`.

## 2026-05-16 — legacy raw array 복원 문구 보강 구현 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Change: `site/app.js` L6442 `legacyText` 1줄 교체.
- New copy: `백업 형식: 구버전 백업 — 생성일·앱 버전·저장소 정보가 없어 파일 내용만 검증 후 복원합니다. 신뢰할 수 있는 직접 백업 파일인지 확인하세요.`
- Preserve: raw/envelope 분기, RESTORE_* 상수, validate/extract/handle 흐름, customConfirm 호출 구조 변경 없음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `legacy raw array 복원 문구 보강 QA 1차`.

## 2026-05-16 — legacy raw array 복원 문구 보강 QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Verify: 신규 문구 토큰 3종 L6442 1건, 이전 문구 0건, restore inventory 및 RESTORE_* 상수 유지.
- Browser: 사용자가 직접 확인. raw array 복원 confirm 문구·줄바꿈·동작 정상.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `trainingFocus 라벨 명확화 설계 1차`.

## 2026-05-16 — trainingFocus 라벨 명확화 설계 1차
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건.
- Inventory: 현 표시 `경기력 관리` 3건, `경기 준비` 3건, `훈련 운영 방향` 3건. `performance`·`game_ready` 저장값과 `trainingFocusFit` 로직 유지.
- Decision: `performance` 표시는 `근력·파워 개발`, `game_ready` 표시는 `경기 전 준비`로 분리. 도움말은 출력 계열 vs 경기 직전 활성화 계열 차이를 설명.
- Scope: 후속 구현은 `site/index.html` option/help 6지점과 `site/app.js` `TRAINING_FOCUS_LABELS` 2지점으로 제한.
- Issue: NIT 1건. 설계 본문에 `_getTrainingFocusLabel`의 밑줄이 빠진 표기가 있으나 구현 범위 판단에는 영향 없음.
- Next: `trainingFocus 라벨 명확화 구현 1차`.

## 2026-05-16 — trainingFocus 라벨 명확화 구현 1차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 무수정 대상 diff 0 라인, 공통 금지 토큰 0건.
- Code: option value 및 `ALLOWED_TRAINING_FOCUSES`·`_normalizeTrainingFocus`·`_getTrainingFocusLabel`·`trainingFocusFit` 로직 보존.
- Issue: MINOR 1건. `docs/workflow/work-plan.md` 구현 결과가 신규 라벨을 3건으로 기록했지만 실제 grep은 도움말 2건 포함 `근력·파워 개발` 5건, `경기 전 준비` 5건.
- Scope: 코드 수정 불필요. 문서 카운트와 완료 조건만 실제 기준으로 보정.
- Next: `trainingFocus 라벨 명확화 구현 카운트 보정 1차`.

## 2026-05-16 — trainingFocus 라벨 명확화 구현 카운트 보정 1차
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `site/*` diff 0 라인, 공통 금지 토큰 0건.
- Count: `근력·파워 개발` 5건, `경기 전 준비` 5건, `경기력 관리` 0건, `경기 준비` 1건(`userType:adult-game-ready-fit` 예외).
- Preserve: `performance`·`game_ready` value, `ALLOWED_TRAINING_FOCUSES`, `_normalizeTrainingFocus`, `_getTrainingFocusLabel`, `trainingFocusFit` 로직 보존.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `trainingFocus 라벨 명확화 QA 1차`.

## 2026-05-17 — trainingFocus 라벨 명확화 QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `site/*` diff 0 라인, 공통 금지 토큰 0건.
- Count: `근력·파워 개발` 5건, `경기 전 준비` 5건, `경기력 관리` 0건, `경기 준비` 1건(`userType:adult-game-ready-fit` 예외).
- Preserve: `value="performance"`·`value="game_ready"` 4건, trainingFocus normalize/label/fit/scoring/swap/schedule 경로 보존.
- Browser: 미수행으로 분리 기록.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `모바일 스케줄 운동명 줄바꿈 UX 설계 1차`.

## 2026-05-17 — 모바일 스케줄 운동명 줄바꿈 UX 설계 1차
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건.
- Inventory: snapshot/live 스케줄 렌더에서 운동명·장비 태그·배지·추천 문구가 같은 flex row에 혼재. 모바일 `.ex-name`은 `word-break: break-word`.
- Decision: 운동명은 `.exercise-title`로 분리하고, 장비/사유/추천 문구는 `.exercise-item-meta` 별도 row로 이동. 한글은 `word-break: keep-all`.
- Preserve: `dayFinalExercises.push`, 스왑 버튼 data-*, 가이드 클릭 data-*, 저장 schema, schedule/scoring/swap 로직 변경 금지.
- Note: `site/`가 untracked라 `git diff`는 강한 변경 증명이 아님. 라인 인벤토리와 명령 출력 기준으로 설계 전용 상태 확인.
- Next: `모바일 스케줄 운동명 줄바꿈 UX 구현 1차`.

## 2026-05-17 — 모바일 스케줄 운동명 줄바꿈 UX 구현 1차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 무수정 대상 diff 0 라인, 공통 금지 토큰 0건.
- Pass: snapshot 렌더는 `.exercise-title-row` + `.exercise-title` + `.exercise-item-meta` 구조. CSS `word-break: break-word` 0건.
- Issue: MINOR 1건. live 렌더는 `.exercise-title-row`와 `.exercise-item-meta`는 있으나 운동명 노드에 `.exercise-title`이 없어 완료 조건 "snapshot/live 두 렌더 경로 모두 `.exercise-title` 구조"와 불일치.
- Preserve: data-* 속성, `dayFinalExercises.push`, 저장/스케줄/스왑 로직 변경 없음.
- Next: `모바일 스케줄 운동명 live title class 보정 1차`.

## 2026-05-17 — 모바일 스케줄 운동명 live title class 보정 1차
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 무수정 대상 diff 0 라인, 공통 금지 토큰 0건.
- Pass: live 기본/ACWR/통증/수동스왑 4개 이름 출력 모두 `.exercise-title` 포함. snapshot `.exercise-title` 구조와 CSS 보존.
- Preserve: `dayFinalExercises.push({ name, sets, reps })`, guide/swap data-* 속성, schedule/scoring/swap/storage 로직 변경 없음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `모바일 스케줄 운동명 줄바꿈 UX QA 1차`.

## 2026-05-17 — 모바일 스케줄 운동명 줄바꿈 UX QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 무수정 대상 diff 0 라인, 공통 금지 토큰 0건.
- Pass: snapshot/live 모두 `.exercise-title-row` + `.exercise-title` + `.exercise-item-meta` 구조. live 기본/ACWR/통증/수동스왑 4개 이름 출력 모두 `.exercise-title` 포함.
- CSS: `.exercise-title`/`.exercise-title-row` `word-break: keep-all` + `overflow-wrap: break-word` 유지, `word-break: break-word` 0건.
- Preserve: `dayFinalExercises.push({ name, sets, reps })`, guide/swap data-* 속성, 저장/스케줄/스왑 로직 변경 없음.
- Browser: 미수행. 모바일 360/390/414 실사용 확인 필요.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `모바일 스케줄 운동명 줄바꿈 UX 사용자 실사용 확인 기록 1차`.

## 2026-05-17 — 모바일 스케줄 운동명 줄바꿈 UX 사용자 실사용 확인 기록 1차
- Result: Step 2 사용자 확인 완료.
- User check: 360/390/414px 한글 긴 운동명 분절 없음, 기본/ACWR/통증/수동스왑 표시 정상, meta row wrap 정상, 버튼/indicator/가이드 영역 겹침 없음, 가로 스크롤 없음.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `word-break: break-word` 0건, 무수정 대상 diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `localStorage safe wrapper 설계 1차`.

## 2026-05-17 — localStorage safe wrapper 설계 1차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 무수정 대상 diff 0 라인, 공통 금지 토큰 0건.
- Pass: direct `localStorage` 호출 9건 inventory와 보호됨/예외 처리 밖 4건 분류는 실제 코드와 일치.
- Issue: MINOR 1건. helper 후보가 실패 시 `console.warn`을 요구하면서 같은 설계에서 `silent fallback`을 원칙으로 적어 후속 구현 정책이 모순됨.
- Next: `localStorage safe wrapper 설계 console 정책 보정 1차`.

## 2026-05-17 — localStorage safe wrapper 설계 console 정책 보정 1차
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 무수정 대상 diff 0 라인.
- Pass: helper 실패 정책을 반환값 기반 silent fallback으로 통일. helper 내부 `console.warn`/`console.error`/`customAlert`/throw/DOM 조작 금지 명시.
- Preserve: direct `localStorage` inventory 9건, 후속 구현 대상 L520·L521·L1559·L1560, `saveDB()`/초기 normalize/reset 흐름 보존.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `localStorage safe wrapper 구현 1차`.

## 2026-05-17 — localStorage safe wrapper 구현 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 무수정 대상 diff 0 라인, 공통 금지 토큰 0건.
- Pass: helper 3종 정의, 가이드 플래그 4건 `_safeLocalStorageGet/Set`으로 교체. direct `localStorage`는 보호된 5건 + helper 내부 3건만 잔존, `clear()` 0건.
- Helper: try-catch + 반환값 기반 silent fallback. helper 내부 `console.warn`/`console.error`/`customAlert`/throw/DOM 조작 0건.
- Preserve: `saveDB()` 사용자 alert 흐름, `_isQuotaExceededError`, 초기 normalize, reset 래퍼, 저장/복원 schema 변경 없음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `localStorage safe wrapper QA 1차`.

## 2026-05-18 — localStorage safe wrapper QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 무수정 대상 diff 0 라인, 공통 금지 토큰 0건.
- Pass: helper 3종 정의/호출 위치, direct `localStorage` 잔존 8건(보호 5 + helper 내부 3), `clear()` 0건.
- Helper: 정상/차단 store 반실사용 7/7 PASS. helper 내부 `console.warn`/`console.error`/`customAlert`/throw/DOM 조작 0건.
- Preserve: `saveDB()`, `_isQuotaExceededError`, 초기 normalize, reset 래퍼, 저장/복원 schema 변경 없음.
- Browser: 미수행. 스토리지 차단 환경 실사용은 별도 필요 시 확인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `sourceUrl allowlist 설계 1차`.

## 2026-05-18 — sourceUrl allowlist 설계 1차
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 무수정 대상 diff 0 라인.
- Inventory: `sourceUrl` 66건, 5개 HTTPS 호스트(`www.nsca.com` 46, `www.asmi.org` 13, `www.mytpi.com` 3, `www.drivelinebaseball.com` 3, `www.posturalrestoration.com` 1), non-HTTPS 0건.
- Design: `_isTrustedSourceUrl(value)` + `TRUSTED_SOURCE_HOSTS`, HTTPS 강제, userinfo 차단, hostname 정확 일치, sourceUrl 렌더 경로만 적용.
- Preserve: `_isSafeYoutubeWatchUrl`, guideMedia*, 광고/canonical/JSON-LD 정책과 분리.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `sourceUrl allowlist 구현 1차`.

## 2026-05-18 — sourceUrl allowlist 구현 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 무수정 대상 diff 0 라인, 공통 금지 토큰 0건.
- Pass: `TRUSTED_SOURCE_HOSTS` 5개 + `_isTrustedSourceUrl` 정의, sourceUrl 렌더 경로 L5858 적용, `_isSafeHttpUrl` 제거.
- Unit: allow 5 true + reject 11 false = 16/16 PASS. `sourceUrl:` 66건 유지.
- Preserve: `_isSafeYoutubeWatchUrl`/guideYoutubeUrl 호출처, guideMedia*, `gSourceUrl` DOM, `site/data.js` 변경 없음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `sourceUrl allowlist QA 1차`.

## 2026-05-18 — sourceUrl allowlist QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: `TRUSTED_SOURCE_HOSTS` 5개, `_isTrustedSourceUrl` 검사 순서, sourceUrl 렌더 L5858 적용, `_isSafeHttpUrl` 0건.
- Unit: allow 5 true + reject 11 false = 16/16 PASS. `sourceUrl:` 66건 유지.
- Preserve: `_isSafeYoutubeWatchUrl` 호출처 3건, guideMedia DOM/렌더, `gSourceUrl` `target="_blank"` + `rel="noopener noreferrer"` 유지.
- Browser: 외부 링크 클릭/새 탭/opener 차단은 미수행으로 분리 기록.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `CSP 도입 영향 설계 1차`.

## 2026-05-18 — CSP 도입 영향 설계 1차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: CSP v1 후보는 `style-src 'self' 'unsafe-inline'`를 포함해 현재 동작 차단 가능성은 낮음.
- Issue: MINOR 1건. 설계 결과가 `site/index.html` 기준으로 `<style>` 0건을 기록했지만, 티켓 범위는 `site` 전체이며 실제 `site/*.html`에는 정적 문서 페이지 `<style>` 블록 7건이 존재.
- Impact: v1 정책 결론은 유지 가능하나, style 인벤토리와 `style-src` 근거가 불완전함.
- Next: `CSP 도입 영향 설계 style 인벤토리 보정 1차`.

## 2026-05-18 — CSP 도입 영향 설계 style 인벤토리 보정 1차
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: `site/*.html` 기준 `<style>` 7건, inline `style=` 106건, `<script>` 6건, HTML 외부 http(s) 직접 참조 0건 확인.
- Design: `style-src 'self' 'unsafe-inline'` 근거를 index inline style 106건 + 정적 문서 `<style>` 7건으로 보정. v1 CSP 후보는 유지.
- Browser: Report-Only 헤더 주입 실사용은 미수행으로 분리 기록.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `CSP 도입 구현 1차`.

## 2026-05-18 — CSP 도입 구현 1차
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Change: `site/_headers` 신규 2줄. `/*` path + `Content-Security-Policy` 1개.
- CSP: 직전 v1 후보와 1:1 일치. `default-src 'none'`, `script-src 'self'`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data: blob:`, `font-src 'self'`, `connect-src 'none'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, `form-action 'none'`, `upgrade-insecure-requests`.
- Reject: `'unsafe-eval'`, 외부 http(s) origin, 광고/canonical/JSON-LD/guideMedia* 0건.
- Browser: 배포 헤더 적용과 Report-Only 관찰은 미수행으로 분리 기록.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: 사용자 발견 버그 우선 처리 — `컨디션 저장 후 미입력 배지 갱신 수정 1차`.

## 2026-05-18 — 컨디션 저장 후 미입력 배지 갱신 수정 1차
- Result: Step 2 수정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Change: `saveWellness()` 성공 경로 말미에 `s1` active `renderPlayerList()`, `s3` active + `currentId` `renderResult()`, `s4` active `renderTeamDashboard()` 호출 추가.
- Preserve: `p.wellness` shape, `date: getTodayStr()`, validation, `saveDB()` 실패 rollback, `renderBackupStorageStatus()` 실패 경로, 미입력 판정 로직 변경 없음.
- Browser: 선수 목록/결과 화면/팀 대시보드 실사용 갱신 확인은 후속 QA로 분리.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `컨디션 저장 후 미입력 배지 갱신 QA 1차`.

## 2026-05-18 — 컨디션 저장 후 미입력 배지 갱신 QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: `saveWellness()` 성공 경로 `s1`/`s3`/`s4` active 화면 갱신 호출 3건 확인.
- Preserve: `p.wellness` shape, `date: getTodayStr()`, validation, `saveDB()` rollback, `컨디션 미입력`/`웰니스 미입력` 판정 로직 변경 없음.
- Browser: 선수 목록/결과 화면/팀 대시보드 실사용 갱신 확인은 미수행으로 분리 기록.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `CSP 도입 QA 1차`.

## 2026-05-18 — CSP 도입 QA 1차
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: `site/_headers` 2줄 구조(`/*` + `Content-Security-Policy`)와 v1 지시어 11종 일치 확인.
- Inventory: index `<script>` 6, HTML 문서 `<style>` 7, index inline `style=` 106, HTML 외부 http(s) 직접 참조 0건.
- Preserve: 광고/canonical/JSON-LD/guideMedia* 재도입 없음. 로컬 서버 `_headers` 미적용은 배포 환경 확인 필요로 분리.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `CSP style-src unsafe-inline 제거 가능성 설계 1차`.

## 2026-05-18 — CSP style-src unsafe-inline 제거 가능성 설계 1차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: `<style>` 7건, `site/index.html` `style=` 106건, `site/app.js` template `style="..."` 66건, `.style.*` 94건, `setAttribute('style')` 0건 확인.
- Issue: NIT 1건. `8.7 후속 구현 티켓 제안 (3건)`이라고 기록했지만 실제 목록은 구현 티켓 4개 + 최종 정책 토글 1개.
- Impact: 기능 영향은 없으나 다음 구현 범위가 혼동될 수 있음.
- Next: `CSP style-src unsafe-inline 설계 후속 티켓 카운트 보정 1차`.

## 2026-05-18 — CSP style-src unsafe-inline 설계 후속 티켓 카운트 보정 1차 정밀검토
- Result: 수정 필요.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: 보정 결과가 후속 범위를 `구현 티켓 4개 + 최종 정책 토글 1개`로 정리한 방향은 타당.
- Issue: NIT 1건. 결과 본문에 이전 오류 수량 리터럴이 남았고, “본문에 표현 없음”이라는 자기검증 문장과 실제 grep 결과가 충돌.
- Impact: 기능 영향은 없으나 보정 티켓 자체의 완료 조건 불충족.
- Next: `CSP style-src unsafe-inline 설계 보정 결과 자기검증 문구 재보정 1차`.

## 2026-05-18 — CSP style-src unsafe-inline 설계 보정 결과 자기검증 문구 최종 제거 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: 결과 본문에서 이전 오류 수량 리터럴과 자기검증 단언 문구가 제거됨.
- Scope: 후속 범위는 `구현 티켓 4개 + 최종 정책 토글 1개`로 확정, 다음 티켓은 `정적 문서 페이지 <style> 외부 CSS 분리 1차`.
- Preserve: `site/*`, `site/_headers` 변경 없음. CSP 정책 토글은 아직 보류.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `정적 문서 페이지 <style> 외부 CSS 분리 1차`.

## 2026-05-18 — 정적 문서 페이지 <style> 외부 CSS 분리 1차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: 7개 정적 문서 페이지 `<style>`/`</style>` 0건, `./docs.css` 참조 7건, `site/docs.css` 77줄 및 `.doc-*` selector 보존.
- Change: `site/docs.css` 신규, `about/assessment/contact/privacy/recovery/terms/workload` 문서 페이지 style block → external CSS link.
- Preserve: `site/_headers`, `site/app.js`, `site/index.html`, `site/data.js`, `site/style.css`, vendor/assets 무변경. CSP 정책 토글 없음.
- Browser: 7개 문서 페이지 시각 회귀 확인은 QA 티켓으로 분리.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `정적 문서 페이지 <style> 외부 CSS 분리 QA 1차`.

## 2026-05-18 — 정적 문서 페이지 <style> 외부 CSS 분리 QA 1차 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: 7개 문서 페이지 `<style>`/`</style>` 0건, `./docs.css` 참조 7건, `site/docs.css` 77줄 및 핵심 `.doc-*` selector 보존 확인.
- Preserve: 문서 meta/title/back link 표본 보존, `site/_headers` 및 앱 본체 무변경.
- Browser: 문서 페이지 7개 시각 회귀는 사용자 확인 필요로 분리 기록.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `index.html 인라인 style 클래스화 1차 (사이즈·토글 우선)`.

## 2026-05-18 — index.html 인라인 style 클래스화 1차 (사이즈·토글 우선) 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: `site/style.css` 유틸 8종 추가, `site/index.html` 13개 위치에서 아이콘 크기/정렬·단순 flex·초기 opacity 인라인 style 클래스화 확인.
- Residual: 우선 제거 패턴 1건(L443) 잔존. 색상/레이아웃 복합 보류 사유가 결과 섹션에 명시되어 완료 조건 충족.
- Preserve: `display:*`, modal `z-index`, 복합 layout 인라인 style, `id`/`data-*`, 앱 로직, `_headers`, data/docs/vendor/assets 무변경.
- Browser: 버튼 비율, 모달 버튼, Lucide 아이콘 정렬, swap confirm disabled 시각은 QA 티켓에서 확인 필요.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `index.html 인라인 style 클래스화 1차 QA`.

## 2026-05-18 — index.html 인라인 style 클래스화 1차 QA 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: 유틸 클래스 8종 정의와 `site/index.html` 13개 사용 위치 확인. 우선 제거 패턴 잔존은 L443 1건만 확인됨.
- Preserve: `display:*`, modal `z-index`, 복합 layout inline style, `id`/`data-*`, 스왑/가이드/워크로드 로직 무변경.
- JS 정합성: `swapConfirmBtn` opacity는 초기 HTML 클래스 + 기존 JS `btn.style.opacity` 토글이 병존하며 기능 회귀 없음.
- Browser: 버튼 비율, 모달 버튼, 아이콘 정렬, swap confirm disabled 시각은 사용자 확인 필요로 분리 기록.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `index.html 인라인 style 클래스화 2차 (레이아웃·색상·강조)`.

## 2026-05-18 — index.html 인라인 style 클래스화 2차 (레이아웃·색상·강조) 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: 신규 클래스 7종 정의 및 index 사용 확인. `style=` 총량 92 → 83, 9건 감소.
- Change: L443 action queue heading/icon, guide label variants, guide steps list, source text, swap intro text를 클래스화.
- Preserve: `display:*`, modal `z-index`, JS 로직, `id`/`data-*`, `_headers`, app/data/docs/vendor/assets 무변경.
- Residual: form error, ACWR/performance cards, gSource/gSourceUrl, swapReset, alert/confirm/workload modal 등 보류 사유 기록됨.
- Browser: 대시보드 heading, guide modal labels/steps/source, swap intro 시각 회귀는 QA에서 확인 필요.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `index.html 인라인 style 클래스화 2차 QA`.

## 2026-05-19 — index.html 인라인 style 클래스화 2차 QA 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, 무수정 대상 diff 0 라인.
- Pass: 신규 클래스 7종 정의/사용 확인, `style=` 총량 83건 유지.
- Preserve: L443 action queue heading/icon, guide labels/steps/source, swap intro 클래스화 의미와 기존 토큰 유지.
- Residual: 잔존 인라인 style 묶음은 display 토글/복합 카드/modal/workload 등 보류 사유가 기록됨.
- Browser: 대시보드, 가이드 모달, 스왑 모달 시각 회귀는 사용자 확인 필요로 분리 기록.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `app.js 템플릿 style="..." 인젝션 클래스화 1차`.

## 2026-05-19 — app.js 템플릿 style="..." 인젝션 클래스화 1차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, 공통 금지 토큰 0건, `localStorage.clear()` 0건.
- Pass: `site/app.js` template `style="..."` 37건으로 감소 확인, 신규 클래스 정의/사용 확인, 신규 CSS hex/rgba 0건.
- Preserve: `.style.*` CSSOM 쓰기, 동적 style 문자열, `escapeHTML`, `data-*`, 저장·스왑·워크로드 로직 무변경.
- Residual: schedule 동적 영역, ACWR/통증 title, disabled button style, alert rgba, RPE guide 등은 보류 사유가 결과 섹션에 기록됨.
- Browser: 선수 카드, 대시보드 액션 큐, 스케줄 배지, 스왑 모달 시각 회귀는 QA 티켓에서 확인 필요.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `app.js 템플릿 style="..." 인젝션 클래스화 1차 QA`.

## 2026-05-19 — app.js 템플릿 style="..." 인젝션 클래스화 1차 QA 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `style="..."` 37건, 공통 금지 토큰 0건.
- Pass: 신규 클래스 정의/사용 매칭 확인, `site/style.css` L3431-L3461 신규 블록 hex/rgba 0건, 무수정 대상 diff 0 라인.
- Preserve: `.style.*` CSSOM 쓰기와 동적 style 문자열은 보류 범위로 유지, 저장·스왑·워크로드 로직 무변경.
- Browser: 선수 카드, 액션 큐, 스케줄 배지, 스왑 모달 시각 회귀는 사용자 확인 필요로 기록됨.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `CSP style-src 'unsafe-inline' 제거 가능성 재평가 1차`.

## 2026-05-19 — CSP style-src 'unsafe-inline' 제거 가능성 재평가 1차 정밀검토
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `_headers` style-src는 `'self' 'unsafe-inline'`, 공통 금지 토큰 0건.
- Count: 정적 HTML `style=` 83건, app template `style="..."` 37건, JS CSSOM `.style.*`/style API 94건, app rgba/hex grep 16건.
- Conclusion: `unsafe-inline` 제거는 아직 불가. 차단 대상 inline style 표면은 정적 HTML 83 + app template 37 = 120건.
- Preserve: `_headers`, `site/*` 변경 0건. 보안 담당 터미널은 실제 CSP 정책 전환 전까지 보류.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `index.html 인라인 style 클래스화 3차 (정적 레이아웃·텍스트 우선)`.

## 2026-05-19 — index.html 인라인 style 클래스화 3차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `site/index.html` `style=` 37건, 공통 금지 토큰 0건.
- Pass: `style=` 83→37, 신규 CSS L3462-L3510 hex/rgba 0건, 신규 클래스 사용 위치 확인.
- Preserve: `site/app.js`, `_headers`, `site/data.js`, `site/docs.css`, vendor/assets 변경 0건. `id`/`data-*`와 JS display 토글 표적 보존.
- Residual: form error, display 토글, modal z-index, `swapResetBtn` duplicate style, guide/source 토글 등 37건 보류 사유 기록됨.
- Browser: 평가 모달, 결과 ACWR 카드, 워크로드 모달, alert/confirm 모달, 스왑 모달 action row 시각 회귀는 QA 티켓에서 확인 필요.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `index.html 인라인 style 클래스화 3차 QA`.

## 2026-05-19 — app.js schedule day 동적 style 클래스화 1차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `site/app.js` `style="` 26건.
- Pass: schedule preview/today summary/weekly progress 영역 inline style 11건을 class 기반으로 전환. progress bar width는 렌더 후 `weeklyProgressBar.style.width`로 설정.
- Preserve: 스케줄 운동명/볼륨, day card 동적 style, assessment/monthly/guide/swap 영역, 저장·스왑·워크로드 로직 무변경.
- Browser: weekly progress, today summary, preview mode, progress 0/50/100% 시각은 사용자 확인 필요.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `app.js schedule day card 동적 style 클래스화 2차`.

## 2026-05-20 — app.js CSSOM style setter class 토글 설계 카운트 보정 1차 정밀검토
- Result: Step 2 보정 완료 상태를 재검토했으나 문서 검증 기록 불일치 1건 발견.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, CSSOM setter 총 95건 확인.
- Issue: `docs/workflow/work-plan.md`의 속성별 카운트 설명이 실제 `rg -o` 명령 출력과 불일치. 실제 정밀 분리 카운트는 `background 3 / backgroundColor 6`.
- Decision: 다음 CSP 티켓으로 진행하지 않고 `app.js CSSOM style setter property grep 기록 보정 1차` 수정 티켓으로 전환.

## 2026-05-20 — app.js CSSOM style setter property grep 기록 보정 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, CSSOM setter 총 95건 확인.
- Pass: 정밀 분리 명령 기준 `.style.background 3 / .style.backgroundColor 6` 기록 확인.
- Preserve: A 70 / B 24 / C 1 / 합계 95 유지, CSP 결론 의미 변경 없음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `CSP style-src 'unsafe-inline' 제거 가능성 재평가 3차`.

## 2026-05-21 — CSP style-src 'unsafe-inline' 제거 가능성 재평가 3차 정밀검토
- Result: Step 2 설계 완료 + 보안/QA Claude Code 조건부 GO.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS, `_headers`는 아직 `style-src 'self' 'unsafe-inline'`.
- Pass: 정적 HTML `style=` 0건, JS template style 0건, `setAttribute('style')`/`cssText` 0건, `<style>` 0건.
- Count: CSSOM `.style.X` setter 95건은 `style-src 'unsafe-inline'` 제거 직접 차단 요인 아님으로 재확인.
- Security: 보안/QA Claude Code 조건부 GO. 조건은 실제 `_headers` 수정 후 주요 UI 브라우저 회귀 테스트를 구현 티켓 완료 조건에 포함.
- Residual: `innerHTML` 37건 XSS 범위 확인은 별도 티켓 후보로 분리.
- Issues: BLOCKER/MAJOR 0건. 본 티켓 범위 내 차단 이슈 0건.
- Next: `CSP style-src 'unsafe-inline' 제거 1차`.

## 2026-05-21 — CSP style-src 'unsafe-inline' 제거 1차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `site/_headers` CSP가 `style-src 'self'`로 변경됨. `unsafe-inline` 0건.
- Pass: `style=` 0건, JS template style 0건, `setAttribute('style')`/`cssText`/`<style>` 0건, inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Preserve: `_headers` 외 `site/*`, data/docs/security/project/evidence/vendor/assets diff 0 라인.
- Browser: 주요 UI 회귀 확인 항목은 미수행(사용자 확인 필요)로 과장 없이 기록됨.
- Residual: 보안/QA Claude Code가 지적한 `innerHTML` 37건 XSS 표면은 다음 티켓으로 분리.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `innerHTML XSS 표면 점검 설계 1차`.

## 2026-05-21 — innerHTML XSS 표면 점검 설계 1차 정밀검토
- Result: Step 2 설계 완료.
- Static: node --check 2건 PASS, innerHTML 37건 확인.
- Pass: A 22 / B 15 / C 0 / D 0 / E 0. 사용자/복원 데이터 sink는 escapeHTML, enum/whitelist, textContent, numeric-only 경로로 보호됨.
- Preserve: site/*, _headers, evidence/security/project diff 0 라인.
- Decision: 구현/보정 티켓 불필요. 후속 항목을 innerHTML XSS 표면 점검 QA 1차로 전환.
- Residual: data.js 정적 trusted text(criteriaDB/exerciseDB) 경계는 향후 외부 입력/i18n 도입 시 재검토.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: innerHTML XSS 표면 점검 QA 1차.

## 2026-05-21 — innerHTML XSS 표면 점검 QA 1차 정밀검토
- Result: Step 2 QA 완료.
- Static: node --check 2건 PASS, innerHTML 37건 line drift 없음.
- Pass: A 22 / B 15 / C 0 / D 0 / E 0 재확인. inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Preserve: site/*, _headers, evidence/security/project diff 0 라인.
- Decision: innerHTML 구현/보정 티켓 불필요.
- Residual: criteriaDB/exerciseDB 정적 trusted text 경계는 향후 외부 입력/i18n 도입 시 재검토.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: 복원 JSON 허용 필드 allowlist 설계 1차.

## 2026-05-21 — 복원 JSON 허용 필드 allowlist 설계 1차 정밀검토
- Result: Step 2 설계 완료 상태를 재검토했으나 allowlist 후보 누락으로 수정 티켓 전환.
- Static: node --check 2건 PASS, 복원 경로 함수 위치 확인.
- Issue: MAJOR 1건. 권장 top-level allowlist가 `userType`, `usagePerspective`, `trainingFocus`, `realAge`, `batterPos`, `role`, `goal`, `weekStartDate`, `lastPromptDate`, 포지션별 성능/이전값 필드를 충분히 포함하지 않음.
- Impact: 직전 설계의 `drop unknown field` 구현을 그대로 따르면 정상 백업의 핵심 필드가 제거될 수 있음.
- Preserve: site/*, _headers, evidence/security/project diff 0 라인.
- Decision: 다음 티켓 진행 중단. `복원 JSON allowlist 설계 누락 필드 보정 1차`로 전환.

## 2026-05-21 — 복원 JSON allowlist 설계 누락 필드 보정 1차 정밀검토
- Result: Step 2 보정 완료 상태를 재검토했으나 추가 누락/카운트 오류 발견.
- Static: node --check 2건 PASS, 저장/표시 경로 grep 확인.
- Issue: MAJOR 1건. 정상 저장/표시 필드 `upgradeMsg`가 allowlist 후보에서 누락됨.
- Issue: MINOR 1건. top-level allowlist 합계가 27개로 기록됐으나 실제 열거는 38개, `upgradeMsg` 포함 시 39개.
- Preserve: site/*, _headers, evidence/security/project diff 0 라인.
- Decision: 구현 티켓 진행 중단. `복원 JSON allowlist 설계 upgradeMsg·카운트 보정 2차`로 전환.

## 2026-05-21 — 복원 JSON allowlist 설계 upgradeMsg·카운트 보정 2차 정밀검토
- Result: Step 2 보정 완료 상태를 재검토했으나 legacy marker 처리 순서 이슈 발견.
- Static: node --check 2건 PASS, `upgradeMsg` 저장/표시 경로와 top-level 39개 보정 확인.
- Issue: MAJOR 1건. `lateralBoundAssessmentVersion`은 최종 저장 대상은 아니지만 `_normalizePlayerRuntimeState`가 cleanup 판단에 쓰는 임시 marker라, drop helper를 normalize 전에 호출하면 기존 lateralBound 점수 cleanup 의미가 바뀔 수 있음.
- Preserve: site/*, _headers, evidence/security/project diff 0 라인.
- Decision: 구현 티켓 진행 중단. `복원 JSON allowlist legacy marker 처리 순서 보정 3차`로 전환.

## 2026-05-21 — 복원 JSON allowlist legacy marker 처리 순서 보정 3차 정밀검토
- Result: Step 2 보정 완료.
- Static: node --check 2건 PASS, legacy marker 소비/삭제 경로와 finalizeRestorePlayers 호출 순서 확인.
- Pass: `lateralBoundAssessmentVersion`은 임시 입력 marker로만 소비, 최종 저장 allowlist 39개에는 미포함.
- Pass: drop helper 권장 위치가 `_normalizePlayerRuntimeState`/`_ensureWellnessShape`/`migratePlayerDates` 이후, `players = normalized` 이전으로 정리됨.
- Preserve: site/*, _headers, evidence/security/project diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: 구현 전 보안/QA Claude 검토.

## 2026-05-21 — 복원 JSON allowlist 구현 전 보안/QA 검토 1차 정밀검토
- Result: 조건부 GO였으나 MAJOR 1건으로 보정 티켓 전환.
- Security/QA: BLOCKER 0, MAJOR 1, MINOR 1, NIT 1.
- Issue: 구현 전 최종 player top-level allowlist 39개가 활성 티켓 본문에 명시 enum으로 고정되어 있지 않아 구현 시 정상 백업 필드 silent drop 위험이 있음.
- Clarification: 보안/QA 보고의 필드 나열은 실제로 39개와 일치하므로 문제는 필드 누락 확정이 아니라 명시 enum 부재.
- Preserve: drop 호출 순서와 `lateralBoundAssessmentVersion` 임시 marker 정책은 안전하다고 확인됨.
- Decision: 구현 티켓 진행 전 `복원 JSON allowlist 명시 enum 보정 1차`로 전환.

## 2026-05-21 — 복원 JSON allowlist 명시 enum 보정 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `PLAYER_TOP_ALLOWED_KEYS` 문서 enum 39개, unique 39개, `lateralBoundAssessmentVersion` 미포함 확인.
- Pass: `upgradeMsg`, `lateralBoundCleanupVersion`, 기록 배열 5종, `scores`, `wellness` 포함 확인.
- Preserve: `site/*`, `_headers`, evidence/security/project diff 0 라인. `site/` untracked는 기존 repo hygiene 이슈로 별도 관리 필요.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `복원 JSON allowlist drop helper 구현 1차`.

## 2026-05-21 — 복원 JSON allowlist drop helper 구현 1차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `PLAYER_TOP_ALLOWED_KEYS` 39개, unique 39개, `lateralBoundAssessmentVersion` 미포함 확인.
- Pass: `_dropUnknownPlayerFields` 정의 1건/호출 1건, 호출 위치는 `players = normalized` 직전이자 normalize/migrate/type 보정 이후.
- Pass: 복원 확인 문구에 `Baseball Lab 정식 백업 외 필드는 복원 중 제외될 수 있습니다.` 추가 확인.
- Preserve: `site/index.html`, `site/data.js`, `site/style.css`, `_headers`, evidence/security/project diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `복원 JSON allowlist drop helper QA 1차`.

## 2026-05-21 — 복원 JSON allowlist drop helper QA 1차 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- VM: helper 추출 5케이스 PASS. 정상 39필드 보존, unknown top-level 제거, nested 내부 보존, legacy marker 미포함, null/non-array guard 확인.
- Pass: `finalizeRestorePlayers` 순서가 normalize/ensure/migrate/type 보정 이후 drop, `players = normalized` 이전으로 일치.
- Preserve: envelope/raw array 정책, `_isValidPlayerShape`, nested data 구조, 수정 금지 파일 diff 0 라인.
- Browser: 파일 복원 실사용은 사용자 확인 필요.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `복원 JSON allowlist drop helper 브라우저 QA 1차`.

## 2026-05-21 — 복원 JSON allowlist drop helper 브라우저 QA 1차 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- VM: `39 39 false false` 확인. 39 unique key, unknown top-level drop, `lateralBoundAssessmentVersion` 미포함.
- Browser: Claude 환경에서 파일 복원 실사용 4항목은 미수행으로 기록됨. PASS로 과장 없음.
- Preserve: `site/*`, `_headers`, evidence/security/project diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건 (정적/VM 기준).
- Next: `복원 JSON allowlist drop helper 사용자 실사용 확인 기록 1차`.

## 2026-05-21 — 복원 JSON allowlist drop helper 사용자 실사용 확인 기록 1차 정밀검토
- Result: Step 2 기록 완료.
- User: B1~B4 전부 확인.
- B1: 정상 envelope 복원 confirm allowlist 안내 확인 OK.
- B2: unknown top-level 포함 백업 복원 후 앱 정상 동작 + 재백업 시 unknown field 제거 확인 OK.
- B3: legacy raw array 복원 시 구버전 경고 + allowlist 안내 동반 표시 확인 OK.
- B4: 타자 `scores.lateralBound` 점수 복원 후 보존 확인 OK.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `localStorage safe wrapper 설계 1차`.

## 2026-05-21 — localStorage safe wrapper 설계 1차 정밀검토
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Inventory: 직접 localStorage 접근 총 5건. L410 get, L425 normalize 재저장, L728 saveDB write, L1146/L1147 reset all remove.
- Decision: 즉시 구현 4건(L410/L425/L1146/L1147), 보류 1건(L728 saveDB quota-aware 안내 보존).
- Preserve: storage key, backup/restore envelope, schema, reset modal/reload 흐름, `localStorage.clear()` 0건.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `localStorage safe wrapper 구현 1차`.

## 2026-05-21 — localStorage safe wrapper 구현 1차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: L410/L425/L1145/L1146 4건이 `_safeLocalStorageGet/Set/Remove`로 치환됨.
- Preserve: 직접 `localStorage.*` 접근은 wrapper 내부 3건 + `saveDB()` L728 보존 1건만 남음.
- Preserve: `saveDB()` quota-aware 실패 안내, reset all remove 2회 후 `closeModal`/`location.reload`, storage key/schema 흐름 유지.
- Pass: `localStorage.clear()` 0건, 수정 금지 파일 diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `localStorage safe wrapper QA 1차`.

## 2026-05-21 — localStorage safe wrapper QA 1차 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: 남은 직접 `localStorage.*` 접근은 wrapper 내부 3건 + `saveDB()` 보존 1건.
- Pass: L410/L425/L1145/L1146 safe wrapper 치환 확인.
- Preserve: `saveDB()` 직접 저장 + 실패 안내, reset all remove/reload 순서, storage key/schema 유지.
- Pass: `localStorage.clear()` 0건, 수정 금지 파일 diff 0 라인.
- Browser: 초기 로드/reset all/saveDB 실패 안내/앱 가이드 상태는 사용자 확인 필요.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `localStorage safe wrapper 사용자 실사용 확인 기록 1차`.

## 2026-05-21 — localStorage safe wrapper 사용자 실사용 확인 기록 1차 정밀검토
- Result: Step 2 기록 완료.
- User: S1~S4 전부 정상, 다음 진행 가능.
- S1: 초기 로드 정상 OK.
- S2: 전체 데이터 초기화 모달 닫힘 + reload 정상 OK.
- S3: 저장 실패/저장 차단 안내 흐름 정상 OK.
- S4: 앱 가이드 모달 재노출 방지 동작 정상 OK.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `sourceUrl allowlist 설계 1차`.

## 2026-05-21 — sourceUrl allowlist 설계 1차 정밀검토
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Inventory: `sourceUrl` 66건, 고유 host 5건(`www.asmi.org`, `www.drivelinebaseball.com`, `www.mytpi.com`, `www.nsca.com`, `www.posturalrestoration.com`).
- Pass: 5개 host 모두 `TRUSTED_SOURCE_HOSTS`와 일치, `_isTrustedSourceUrl`는 https-only + credential 차단 + allowlist 매칭.
- Pass: YouTube guide는 `_isSafeYoutubeWatchUrl`로 일반 sourceUrl과 분리 유지.
- Pass: `target="_blank"` 10건 모두 `rel="noopener noreferrer"` 포함.
- Preserve: `site/*`, `_headers`, evidence/security/project diff 0 라인. `site/` untracked는 기존 repo hygiene 이슈로 별도 관리.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `sourceUrl allowlist 설계 QA 1차`.

## 2026-05-21 — sourceUrl allowlist 설계 QA 1차 정밀검토
- Result: Step 2 QA 완료 상태를 검토했으나 NIT 1건 발견.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `sourceUrl` 66건 / host 5건 / `TRUSTED_SOURCE_HOSTS` 5건 일치, `match true`.
- Pass: `target="_blank"` 10건 모두 `rel="noopener noreferrer"` 포함. 누락 grep 0건.
- Pass: 인라인 이벤트 핸들러/광고/canonical/JSON-LD/guideMedia* 0건, 수정 금지 파일 diff 0 라인.
- Issue: NIT 1건. `docs/workflow/work-plan.md` QA 결과가 YouTube CTA 호출부를 `_renderGuideMediaCard`로 표기했으나 실제 함수명은 `site/app.js:5953` `_renderGuideYoutubeCta`.
- Decision: 다음 기능 티켓 진행 전 `sourceUrl allowlist 설계 QA 함수명 표기 보정 1차`로 전환.

## 2026-05-21 — sourceUrl allowlist 설계 QA 함수명 표기 보정 1차 정밀검토
- Result: Step 2 보정 완료 상태를 검토했으나 NIT 1건 발견.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: 실제 코드 함수명은 `site/app.js:5953` `_renderGuideYoutubeCta`, 내부 검증은 `site/app.js:5959` `_isSafeYoutubeWatchUrl(data.guideYoutubeUrl)`.
- Pass: `site/app.js`에는 `_renderGuideMediaCard` 정의 0건.
- Issue: NIT 1건. 보정 결과 본문이 `_renderGuideMediaCard`를 "0회 사용"이라고 기록하면서 결과 본문 안에서 해당 문자열을 다시 인용해 자기참조 카운트가 맞지 않음.
- Preserve: `site/*`, `_headers`, evidence/security/project diff 0 라인.
- Decision: 다음 기능 티켓 진행 전 `sourceUrl allowlist QA 함수명 보정 자기참조 문구 제거 1차`로 전환.

## 2026-05-21 — sourceUrl allowlist QA 함수명 보정 자기참조 문구 제거 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: 실제 코드 함수명은 `site/app.js:5953` `_renderGuideYoutubeCta`, 내부 검증은 `site/app.js:5959` `_isSafeYoutubeWatchUrl(data.guideYoutubeUrl)`.
- Pass: 결과 본문에는 옛 함수명 리터럴 재인용 0건. 검색 명령 섹션의 패턴은 완료 조건 범위 밖.
- Preserve: 기존 QA 결론(sourceUrl 66/host 5/allowlist 5/rel 10건) 유지, 수정 금지 파일 diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `sourceUrl allowlist 검증 가드 설계 1차`.

## 2026-05-21 — sourceUrl allowlist 검증 가드 설계 1차 정밀검토
- Result: Step 2 설계 완료 상태를 검토했으나 MINOR 1건 발견.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: G1 로직 자체는 double-quoted `node -e` 형태로 실행 시 `{"data_hosts":5,"trusted":5,"missing":[],"extra":[]}` + exit 0 확인.
- Pass: G2 `rg --pcre2` rel 누락 검사는 출력 없음 + exit 1로 위반 0건 확인.
- Issue: MINOR 1건. 정적 검증 명령 섹션의 G1 single-quoted `node -e` one-liner는 zsh에서 `parse error near ')'`로 실패함. 결과 본문은 quoting 리스크를 언급하지만, 티켓 검증 명령 자체가 실행 불가능해 후속 작업자가 그대로 사용할 수 없음.
- Preserve: `site/*`, `_headers`, evidence/security/project diff 0 라인.
- Decision: `sourceUrl allowlist 검증 가드 설계 quoting 보정 1차`로 전환.

## 2026-05-21 — sourceUrl allowlist 검증 가드 설계 quoting 보정 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: G1 double-quoted `node -e` 명령이 zsh에서 `{"data_hosts":5,"trusted":5,"missing":[],"extra":[]}` + exit 0으로 실행됨.
- Pass: G2 `rg --pcre2` rel 누락 검사는 출력 없음 + exit 1로 위반 0건 확인.
- Pass: 수정 금지 파일 diff 0 라인. 직전 single-quoted 명령은 후속 실행 명령으로 남지 않고 설명 문맥에만 남음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `sourceUrl allowlist 검증 가드 구현 1차`.

## 2026-05-21 — sourceUrl allowlist 검증 가드 구현 1차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `docs/security/verify-common.md`에 `sourceUrl Allowlist Guards` 섹션 추가, G1/G2 정의 확인.
- Pass: G1 실행 결과 `{"data_hosts":5,"trusted":5,"missing":[],"extra":[]}` + exit 0.
- Pass: G2 `rg --pcre2` rel 누락 검사는 출력 없음 + exit 1로 위반 0건.
- Pass: 인라인 이벤트 핸들러/광고/canonical/JSON-LD/guideMedia* 0건, `site/*`, `_headers`, evidence/project diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `sourceUrl allowlist 검증 가드 QA 1차`.

## 2026-05-21 — sourceUrl allowlist 검증 가드 QA 1차 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `docs/security/verify-common.md` G1/G2 가드 존재와 YouTube guide 정책 분리 메모 확인.
- Pass: G1 실행 결과 `{"data_hosts":5,"trusted":5,"missing":[],"extra":[]}` + exit 0.
- Pass: G2 rel 누락 검사는 출력 없음 + exit 1로 위반 0건. 문서 해석과 일치.
- Preserve: `site/*`, `_headers`, evidence/project diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `워크로드 RPE 입력 도움말 설계 1차`.

## 2026-05-21 — 워크로드 RPE 입력 도움말 설계 1차 정밀검토
- Result: Step 2 설계 완료 상태를 검토했으나 MAJOR 1건 발견.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `site/*`, evidence/security/project diff 0 라인. 금지 표현은 기존 ACWR 로직/면책 문구와 티켓 내 보류·금지 설명 범위.
- Issue: MAJOR 1건. RPE UI inventory가 `site/index.html` 정적 문구만 기록하고, 실제 모달 표시를 덮어쓰는 `site/app.js:5636` 라벨과 `site/app.js:5641~5653` 동적 RPE guide 경로를 누락함.
- Impact: 후속 구현자가 정적 HTML만 수정하면 실제 사용자 화면에서 1~10 문구와 피칭/타격별 기존 도움말이 남을 수 있음.
- Preserve: 설계 방향(0~10 session-RPE, 유소년 범주형, 피칭 별도 도움말, 임계값/자동판정/부상예측 보류)은 유지 가능.
- Decision: 다음 구현 티켓 진행 전 `워크로드 RPE 입력 도움말 설계 동적 렌더 경로 보정 1차`로 전환.

## 2026-05-21 — 워크로드 RPE 입력 도움말 설계 동적 렌더 경로 보정 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `site/index.html` 정적 RPE 경로와 `site/app.js:5620~5653` `openWorkloadModal` 동적 렌더 경로가 모두 inventory됨.
- Pass: 후속 구현 범위가 `site/index.html` + `site/app.js` 양쪽 수정으로 명시됨.
- Pass: 금지 표현 grep은 기존 ACWR 로직, 면책 문구, 티켓 내 금지 기준 설명 범위. 신규 앱 문구 도입 0건.
- Preserve: `site/*`, evidence/security/project diff 0 라인. inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `워크로드 RPE 입력 도움말 구현 1차`.

## 2026-05-22 — 워크로드 RPE 입력 도움말 구현 1차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: 옛 문구(`RPE (운동 자각도 1-10)`, `훈련의 힘든 정도를 1~10`, `<strong>1~3`) 0건.
- Pass: 새 문구는 `site/index.html:806·811`, `site/app.js:5641·5642·5657`에서 확인. 정적 HTML과 동적 `openWorkloadModal` 모두 0~10 기준.
- Pass: `wlRPE` `min=0 max=10 step=1` 유지, 계산/저장/ACWR 로직 변경 없음.
- Pass: 금지 표현 grep은 기존 평균 구속 문맥과 기존 면책 문구만 매칭. RPE 도움말 신규 금지 문구 0건.
- Preserve: `site/data.js`, `site/style.css`, `_headers`, evidence/security/project/assets diff 0 라인. inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `워크로드 RPE 입력 도움말 QA 1차`.

## 2026-05-22 — 워크로드 RPE 입력 도움말 QA 1차 정밀검토
- Result: Step 2 QA 완료 상태를 검토했으나 NIT 1건 발견.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: 옛 문구(`RPE (운동 자각도 1-10)`, `훈련의 힘든 정도를 1~10`, `<strong>1~3`) 0건.
- Pass: 0~10 본문, 유소년 범주형 안내, 피칭 별도 안내는 `site/index.html:806·811`, `site/app.js:5641·5642·5657`에서 확인.
- Pass: 금지 표현 grep은 기존 면책 문구만 매칭. inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Issue: NIT 1건. `site/index.html:780~781` 라벨이 줄바꿈으로 분리되어 `RPE (운동 자각도 0-10)` 한 줄 grep에 잡히지 않음. 렌더링 의미는 정상이나 검증 안정성이 낮음.
- Preserve: `site/data.js`, `site/style.css`, `_headers`, evidence/security/project/assets diff 0 라인.
- Decision: `워크로드 RPE 입력 도움말 라벨 한 줄 보정 1차`로 전환.

## 2026-05-22 — 워크로드 RPE 입력 도움말 라벨 한 줄 보정 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `RPE (운동 자각도 0-10)`이 `site/index.html:780`에서 한 줄 grep으로 1건 매칭.
- Pass: 옛 문구(`RPE (운동 자각도 1-10)`, `훈련의 힘든 정도를 1~10`, `<strong>1~3`) 0건 유지.
- Pass: 0~10 본문, 유소년 범주형 안내, 피칭 별도 안내는 기존 위치에서 유지.
- Preserve: `site/app.js`, `site/data.js`, `site/style.css`, `_headers`, evidence/security/project/assets diff 0 라인. inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `워크로드 RPE 입력 도움말 QA 재검증 1차`.

## 2026-05-22 — 워크로드 RPE 입력 도움말 QA 재검증 1차 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `RPE (운동 자각도 0-10)` 한 줄 매칭은 `site/index.html:780` 1건.
- Pass: 옛 1~10 문구 0건, 새 0~10 본문/유소년 안내/피칭 안내는 `site/index.html:805·810`, `site/app.js:5641·5642·5657`에서 확인.
- Pass: 금지 표현 grep은 기존 면책 문구만 매칭. RPE 도움말 신규 도입 0건.
- Preserve: `site/data.js`, `site/style.css`, `_headers`, evidence/security/project/assets diff 0 라인. inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `워크로드 RPE 입력 도움말 브라우저 QA 1차`.

## 2026-05-22 — 워크로드 RPE 입력 도움말 브라우저 QA 1차 정밀검토
- Result: Step 2 브라우저 QA 완료 상태를 검토.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `RPE (운동 자각도 0-10)` 한 줄 매칭, 옛 1~10 문구 0건, 새 0~10/유소년/피칭 안내 문구 매칭 확인.
- Pass: 금지 표현 grep은 기존 면책 문구만 매칭. 수정 금지 경로 diff 0 라인.
- Pass: 팀원 기록은 브라우저 항목 전부를 `미수행`으로 명시했고 완료로 과장하지 않음.
- Note: 총괄 Codex의 in-app browser 직접 확인 시도는 `net::ERR_BLOCKED_BY_CLIENT`로 차단되어 실제 화면 확인 미완료.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `워크로드 RPE 입력 도움말 사용자 실사용 확인 기록 1차`.

## 2026-05-22 — 워크로드 RPE 입력 도움말 사용자 실사용 확인 기록 1차 정밀검토
- Result: Step 2 사용자 확인 완료 상태를 검토했으나 MINOR 1건 발견.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `RPE (운동 자각도 0-10)`과 새 0~10/유소년/피칭 안내 문구 매칭, 옛 1~10 문구 0건.
- Pass: 수정 금지 경로 diff 0 라인.
- Issue: MINOR 1건. line 3은 `사용자 확인 완료`이나 결과 8.2의 5개 실사용 항목이 모두 `미수행`임. OK 과장은 아니지만 완료 상태 표기와 실제 확인 상태가 불일치.
- Decision: 다음 기능 티켓 진행 전 `워크로드 RPE 사용자 확인 완료 표기 보정 1차`로 전환.

## 2026-05-22 — 워크로드 RPE 사용자 확인 완료 표기 보정 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: 사용자 확인 5개 항목은 모두 `미수행`으로 유지되고 OK로 과장되지 않음.
- Pass: `사용자 확인 완료`는 보정 대상 설명, 티켓명, 정정 맥락에서만 등장. 완료 단정으로 쓰이지 않음.
- Pass: RPE 0~10/유소년/피칭 안내 문구 매칭, 수정 금지 경로 diff 0 라인.
- Preserve: `site/*`, evidence/security/project/assets diff 0 라인. inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `워크로드 RPE 입력 도움말 사용자 실사용 확인 2차`.

## 2026-05-22 — 워크로드 RPE 입력 도움말 사용자 실사용 확인 2차 기록
- Result: 사용자 확인 완료.
- User: `전부 OK`.
- Confirmed: 투수/타자 워크로드 모달 RPE 0~10 문구, 유소년 안내, 투수 피칭 별도 문구, 타자 피칭 문구 비노출, 모바일 도움말 표시, 저장·계산 흐름 OK.
- Scope: 기록 전용. `site/*` 코드 수정 없음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: 다음 follow-up queue 항목 선정 필요.

## 2026-05-22 — innerHTML XSS 표면 분류 설계 1차 정밀검토
- Result: Step 2 설계 완료 상태를 검토했으나 MINOR 1건 발견.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `site/index.html` 매칭 0건, `site/app.js`의 `innerHTML|outerHTML` 사용처 표는 #1~#38까지 존재.
- Issue: MINOR 1건. 실제 `rg -n "innerHTML|insertAdjacentHTML|outerHTML" site/app.js site/index.html | wc -l` 결과는 38건인데 결과 본문에 `총 37건`, `정적 상수 HTML: 11건` 등 요약 카운트 불일치가 남음.
- Preserve: `site/*`, evidence/security/project/assets diff 0 라인. inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Decision: 다음 구현 티켓 진행 전 `innerHTML XSS 표면 분류 설계 카운트 보정 1차`로 전환.

## 2026-05-22 — innerHTML XSS 표면 분류 설계 카운트 보정 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: 실제 `innerHTML|insertAdjacentHTML|outerHTML` 매칭은 38건, 보정 결과 8장도 총 38건 기준으로 정리됨.
- Pass: 표 #1~#38 유지, `MAJOR 후보 2개`와 `MINOR 후보`가 분리됨.
- Note: 옛 카운트 표현은 1~5섹션의 보정 대상/검증 명령 자기참조로만 남고, 결과 8장에는 남지 않음.
- Preserve: `site/*`, evidence/security/project/assets diff 0 라인. inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `innerHTML XSS escape 보정 구현 1차`.

## 2026-05-22 — innerHTML XSS escape 보정 구현 1차 정밀검토
- Result: Step 2 구현 완료 상태를 검토했으나 MINOR 1건 발견.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `site/app.js`의 지정 후보는 `escapeHTML(String(...))` 또는 `escapeHTML(...)`로 보정됨. old template pattern grep 0건.
- Pass: `innerHTML|outerHTML` 사용처 수는 38건 유지. 수정 금지 경로 diff 0 라인.
- Issue: MINOR 1건. `docs/workflow/work-plan.md`가 Step 2로 표시됐지만 8장 결과 섹션이 없어 완료 기록 기준을 충족하지 못함.
- Decision: QA 티켓 전 `innerHTML XSS escape 보정 구현 결과 기록 보정 1차`로 전환.

## 2026-05-22 — innerHTML XSS escape 보정 구현 결과 기록 보정 1차 정밀검토
- Result: Step 2 보정 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: 8장 결과 섹션 존재. 보정 라인, old pattern 0건, 새 escape 패턴, innerHTML 38건 유지, 수정 금지 경로 diff 0 라인 기록 확인.
- Pass: 직접 검증에서도 old template pattern 0건, `escapeHTML(String(...))` 주요 패턴 매칭 확인.
- Preserve: inline handler/광고/canonical/JSON-LD/guideMedia* 0건, 수정 금지 경로 diff 0 라인.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `innerHTML XSS escape 보정 QA 1차`.

## 2026-05-22 — innerHTML XSS escape 보정 QA 1차 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: old template pattern grep 0건, MAJOR/MINOR 후보는 `escapeHTML(String(...))` 또는 동등 escape 경로로 보정 확인.
- Pass: `innerHTML|insertAdjacentHTML|outerHTML` 매칭은 38건 유지. inline handler/광고/canonical/JSON-LD/guideMedia* 0건.
- Pass: 악성 문자열 반실사용 정적 추적상 `p.age`, `p.prevWeekMissed.missedDays`, 평가 option/name/desc, workload 계열 값은 HTML 해석 경로 차단.
- Note: `escapeHTML(opt)`는 String 래핑이 없지만 `criteriaDB` option 실데이터가 문자열이라 후속 차단 이슈로 분류하지 않음.
- Issues: BLOCKER/MAJOR/MINOR 0건, NIT 0건.
- Next: `innerHTML XSS escape 보정 브라우저 실사용 확인 1차`.

## 2026-05-23 — innerHTML XSS escape 보정 브라우저 실사용 확인 1차
- Result: 사용자 확인 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- User: 평가 항목명·설명·select option 라벨, 워크로드 미실시/정상 문구와 `0` 보존, 모바일 overflow, 버튼 클릭·저장·다음 이동 정상.
- Deferred: 워크로드 초과 배지는 현재 데이터가 일주일 경과 전이라 조건 미충족으로 미수행.
- Preserve: `site/*` 코드 수정 없음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: 후속 큐 재정리 필요.

## 2026-05-23 — innerHTML XSS 잔여 surface 후속 분류 설계 1차 정밀검토
- Result: Step 2 설계 완료. Claude EPERM으로 중단되어 총괄 Codex가 읽기 전용으로 직접 분류.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `innerHTML|insertAdjacentHTML|outerHTML`은 `site/app.js` 38건, `site/index.html` 0건.
- 정적/숫자/상수 HTML 8건: 1120, 2143, 3909, 4250, 4252, 5644, 5652, 6132.
- escape/whitelist 완료 22건: 1631, 2152, 2696, 2789, 2794, 2799, 2910, 3350, 3440, 3561, 3646, 3683, 3818, 3861, 3916, 4245, 4453, 4471, 4871, 5862, 6098, 6171.
- DOM API 전환 후보 8건: clear sink 1610, 2803, 2897, 5520 / capture button HTML read-restore 6016, 6017, 6023, 6026.
- 추가 검토 필요 0건. 사용자/복원 데이터가 escape 없이 HTML sink로 들어가는 신규 MAJOR 후보 없음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `innerHTML 저위험 DOM API 전환 설계 1차`.

## 2026-05-23 — innerHTML 저위험 DOM API 전환 설계 1차 정밀검토
- Result: Step 2 설계 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS. `innerHTML|insertAdjacentHTML|outerHTML`은 `site/app.js` 38건, `site/index.html` 0건.
- Pass: 8건 판단표가 실제 코드 위치와 일치함.
- Decision: clear sink 4건 `1610`, `2803`, `2897`, `5520`은 `replaceChildren()` 전환 후보.
- Defer: capture button read/restore 4건 `6016`, `6017`, `6023`, `6026`은 lucide icon restore 회귀 위험 때문에 별도 설계 전까지 보류.
- Security: XSS 보정 티켓이 아니며 보안/QA 담당 호출 불필요.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `innerHTML clear sink DOM API 전환 구현 1차`.

## 2026-05-23 — innerHTML clear sink DOM API 전환 구현 1차 정밀검토
- Result: Step 2 구현 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `innerHTML|insertAdjacentHTML|outerHTML` count 34건. old clear patterns 0건.
- Pass: `replaceChildren()` target 4건 `1610`, `2803`, `2897`, `5520`.
- Preserve: capture button innerHTML read/restore `6016`, `6017`, `6023`, `6026` 무변경.
- Preserve: inline handler/광고/canonical/JSON-LD/guideMedia* 0건. 수정 금지 경로 diff 0 라인.
- Note: `site/`, `docs/`는 git untracked 상태라 `git diff`는 추적 기준 한계가 있음.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `innerHTML clear sink DOM API 전환 QA 1차`.

## 2026-05-23 — innerHTML clear sink DOM API 전환 QA 1차 정밀검토
- Result: Step 2 QA 완료.
- Static: `node --check site/app.js` PASS, `node --check site/data.js` PASS.
- Pass: `innerHTML|insertAdjacentHTML|outerHTML` count `site/app.js:34`, `site/index.html` 0건.
- Pass: `replaceChildren()` target 4건 `1610`, `2803`, `2897`, `5520`. old clear patterns 0건.
- Preserve: capture button innerHTML read/restore `6016`, `6017`, `6023`, `6026` 무변경.
- Preserve: 수정 금지 경로 diff 0 라인.
- Browser: 4항목 모두 미수행으로 정확히 분리됨.
- Issues: BLOCKER/MAJOR/MINOR/NIT 0건.
- Next: `innerHTML clear sink DOM API 전환 브라우저 실사용 확인 1차`.
