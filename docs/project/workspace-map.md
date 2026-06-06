# Baseball Lab S&C 작업 공간 맵

## 1. 목적
- 코드 작업, 근거 조사, 보안 점검을 서로 다른 파일과 담당 흐름으로 분리한다.
- 현재 Codex는 최종 정밀검토와 다음 작업 등록을 담당한다.
- Claude Code, 근거문서 Claude, 보안/QA Claude Code는 서로의 파일을 임의로 수정하지 않는다.
- 전체 문서 분류표는 `docs/README.md`를 기준으로 확인한다.
- 담당별 시작 프롬프트는 `docs/project/role-prompts.md`를 기준으로 복사해 사용한다.

## 1-1. 업무별 허브
- 코드 작업/워크플랜: `docs/workflow/README.md`
- 근거 조사/검토: `docs/evidence/README.md`
- 보안/QA 점검: `docs/security/README.md`
- 프로젝트 운영 기준: `docs/project/README.md`

## 2. 코드 작업 공간
- 현재 티켓: `docs/workflow/work-plan.md`
- 지난 기록: `docs/workflow/work-plan-archive.md`
- 업무 허브: `docs/workflow/README.md`
- 담당:
  - Claude Code: 구현 담당
  - 현재 Codex: 최종 정밀검토 + 다음 워크플랜 작성
- 원칙:
  - 코드 티켓은 `site/*`와 코드 관련 문서만 다룬다.
  - Claude Code는 활성 티켓에 명시된 허용 파일만 수정한다.
  - Claude Code는 다음 티켓을 임의로 선택하지 않고, 완료 보고만 남긴다.
  - 총괄 Codex가 직접 검증한 뒤 이슈가 있으면 수정 티켓, 없으면 다음 티켓을 등록한다.
  - 근거 조사 내용은 코드 티켓에 직접 붙이지 않는다.
  - Operation not permitted 같은 권한 차단은 우회하지 않고 중단 보고한다.

## 3. 근거 조사 공간
- 현재 근거 작업: `docs/evidence/evidence-research.md`
- 지난 근거 기록: `docs/evidence/evidence-archive.md`
- 업무 허브: `docs/evidence/README.md`
- 담당:
  - 근거문서 Claude: 출처 조사와 보고서 초안 작성
  - 근거문서 검토 Codex: 출처 신뢰도, 표현 위험, 앱 반영 가능성 검토
  - 현재 Codex: 근거문서 검토 결과를 받아 최종 코드 반영 여부 판단
- 원칙:
  - 근거문서는 구현 지시서가 아니다.
  - 앱 반영은 별도 `docs/workflow/work-plan.md` 티켓으로만 진행한다.
  - 출처가 약한 자료는 보조 근거 또는 보류로 분류한다.
  - 총괄 Codex 판단 질문은 최대 3개로 압축한다.

## 4. 보안 점검 공간
- 담당: 보안/정적 점검 전용 Claude Code
- 업무 허브: `docs/security/README.md`
- 허용:
  - 읽기
  - 정적 명령 실행
  - 보안 보고서 작성
- 금지:
  - 파일 수정
  - 삭제/이동
  - 커밋
  - 설치
  - 서버 설정 변경
- 호출 기준:
  - CSP, 보안 헤더, localStorage/백업 복원, 외부 링크, 라이선스, 개인정보, XSS/HTML 삽입 경로 변경 시 사용한다.
  - 단순 CSS, 문구, QA 기록만 바꾸는 티켓에서는 기본적으로 호출하지 않는다.
  - 보안/QA Claude Code는 총괄이 지정한 범위만 점검하고 수정하지 않는다.
  - 보안/QA 보고는 총괄 Codex 판단 자료이며, 그 자체로 최종 결론이 아니다.

## 5. 최종 판단 흐름
- Claude Code 또는 근거문서 Claude가 완료 보고를 한다.
- 현재 Codex가 실제 파일과 보고 내용을 대조한다.
- 보안 영향이 있으면 보안/QA Claude Code 점검을 요청한다.
- 이슈가 있으면 수정 티켓을 작성한다.
- 이슈가 없으면 다음 작업 티켓을 작성한다.
- 사용자 실사용 확인이 완료 조건인 경우, 총괄 Codex는 사용자가 확인한 항목만 OK로 기록한다.
- 실사용 확인 티켓은 총괄 Codex가 확인 항목을 안내하기 전에 인앱 브라우저를 최신 cache bust URL로 갱신한다.
- 실사용 확인 티켓의 기본 순서는 활성 티켓 확인 → 사전 정적 확인 → 브라우저 최신화 → 사용자 확인 항목 안내 → 사용자 회신 기록이다.
- 토큰 절감이 필요한 경우 총괄 Codex는 긴 정밀검토, 반복 정적 검증, 브라우저 실사용 확인, 워크플랜 초안 작성을 작업 성격에 맞는 담당 Claude 또는 하위 에이전트에 위임한다.
- 총괄 Codex는 후속 티켓 결정, 작업 지시 확정, 최종 판단에 집중하되, 위임 결과는 핵심 명령 1~3개로 직접 spot-check한 뒤 승인한다.
- 하위 에이전트 모델은 작업 난이도에 맞춰 선택한다. 단순 반복 작업은 낮은 모델, 보안·출시·아키텍처 판단은 높은 모델을 사용한다.

## 6. 금지
- 코드 작업자가 근거문서 결론을 확정하지 않는다.
- 근거문서 작업자가 `site/*` 구현 지시를 직접 수행하지 않는다.
- 보안/QA Claude Code는 파일을 수정하지 않는다.
- 현재 Codex는 사용자 지시 없이 `site/*` 코드를 수정하지 않는다.
- 어떤 담당도 다음 티켓을 임의로 선택하지 않는다.
