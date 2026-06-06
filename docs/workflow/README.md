# 코드 작업/워크플랜 공간

## 담당
- Claude Code: 구현 담당.
- 현재 Codex: 최종 정밀검토, 이슈 분류, 다음 워크플랜 작성.
- 보안/QA Claude Code: 보안 영향이 있는 경우 별도 읽기 전용 점검.

## 주 파일
- 현재 티켓: `docs/workflow/work-plan.md`
- 지난 티켓 요약: `docs/workflow/work-plan-archive.md`
- 후속 큐: `docs/workflow/follow-up-queue.md`
- 공통 검증: `docs/security/verify-common.md`
- 이슈 분류 기준: `docs/project/ticket-conventions.md`

## 작업 규칙
- 코드 구현은 `docs/workflow/work-plan.md`의 활성 티켓 기준으로만 수행한다.
- Claude Code는 활성 티켓의 수정 허용 파일만 변경한다.
- Claude Code는 다음 티켓을 임의로 선택하지 않는다.
- Claude Code는 자체 정밀검토 결론을 확정하지 않는다.
- 현재 Codex는 검토 통과 시 후속 큐 기준으로 다음 티켓을 작성한다.
- 근거 조사 내용은 코드 티켓 본문에 직접 붙이지 않는다. 앱 반영은 현재 Codex가 별도 티켓으로 전환할 때만 진행한다.
- 권한 차단이나 파일 접근 실패가 발생하면 우회하지 않고 중단 보고한다.
- 보안 영향이 있는 티켓은 총괄 Codex가 보안/QA Claude Code 호출 여부를 결정한다.

## 보고 형식
- 변경 파일
- 변경 요약
- 실행 검증
- 잔여 리스크

긴 정밀검토 프롬프트는 Claude Code가 작성하지 않는다.
담당별 전체 시작 프롬프트는 `docs/project/role-prompts.md`를 사용한다.
