# Baseball Lab S&C 문서 구조

## 1. 원칙
- 활성 파일은 업무별 하위 폴더로 분리한다.
- 담당자는 루트 `docs/*.md`가 아니라 아래 표의 하위 폴더 경로를 기준으로 작업한다.
- 하위 폴더 README는 "어떤 담당이 어떤 파일을 볼지"를 안내하는 허브 역할만 한다.
- 실제 활성 티켓과 근거 작업은 아래 표의 현재 파일에서만 관리한다.

## 2. 업무별 분류
| 업무 | 허브 | 현재 파일 | 아카이브/보조 파일 |
| --- | --- | --- | --- |
| 코드 작업/워크플랜 | `docs/workflow/README.md` | `docs/workflow/work-plan.md` | `docs/workflow/work-plan-archive.md`, `docs/workflow/follow-up-queue.md` |
| 근거 조사/검토 | `docs/evidence/README.md` | `docs/evidence/evidence-research.md` | `docs/evidence/evidence-archive.md` |
| 보안/QA 점검 | `docs/security/README.md` | 보안 담당 보고는 필요 시 별도 파일 또는 사용자 보고 | `docs/security/verify-common.md`, `docs/project/ticket-conventions.md` |
| 프로젝트 운영 기준 | `docs/project/README.md` | `docs/project/workspace-map.md` | `docs/project/ticket-conventions.md`, `docs/security/verify-common.md`, `docs/project/role-prompts.md` |

## 3. 담당별 사용법
- Claude Code는 `docs/workflow/README.md`와 `docs/workflow/work-plan.md`만 확인하고 코드 작업을 진행한다.
- 근거문서 Claude와 근거문서 검토 담당은 `docs/evidence/README.md`와 `docs/evidence/evidence-research.md`를 기준으로 작업한다.
- 보안/QA Claude Code는 `docs/security/README.md`를 기준으로 읽기 전용 점검을 수행한다.
- 현재 Codex는 `docs/project/workspace-map.md`, `docs/workflow/work-plan.md`, `docs/workflow/follow-up-queue.md`를 기준으로 최종 판단과 다음 티켓 작성을 수행한다.
- 담당별 시작 프롬프트는 `docs/project/role-prompts.md`를 사용한다.

## 4. 현재 표준 경로
- `docs/workflow/work-plan.md`
- `docs/evidence/evidence-research.md`
- `docs/workflow/work-plan-archive.md`
- `docs/evidence/evidence-archive.md`
- `docs/workflow/follow-up-queue.md`
- `docs/project/ticket-conventions.md`
- `docs/security/verify-common.md`
- `docs/project/workspace-map.md`

이 파일들은 현재 표준 경로다. 이후 프롬프트와 검증 명령은 이 경로를 기준으로 작성한다.
