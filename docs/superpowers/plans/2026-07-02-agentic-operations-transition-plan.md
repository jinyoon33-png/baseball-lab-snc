# Agentic Operations Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old always-on Claude role structure with a Codex-led, ticket-scoped subagent operating model.

**Architecture:** Codex remains the single accountable PM/architect/reviewer. Subagents are created only when a ticket needs bounded implementation, security/QA, browser verification, evidence research, or release checks; Codex writes the work-plan, assigns the role, validates outputs, and reports to the user.

**Tech Stack:** Local Markdown operating docs, `docs/workflow/work-plan.md`, `docs/project/*`, `docs/security/*`, multi-agent worker/explorer delegation.

---

### Task 1: Update Project Role Map

**Files:**
- Modify: `/Users/jinyoon/Desktop/Baseball Lab S&C/docs/project/workspace-map.md`
- Modify: `/Users/jinyoon/Desktop/Baseball Lab S&C/docs/project/ticket-conventions.md`

- [x] **Step 1: Replace static Claude ownership with Codex-led subagent ownership**

Set the project map to say:
- Codex owns ticket selection, work-plan writing, final review, and final reporting.
- Code, security/QA, browser QA, evidence, and release work are handled by ticket-scoped subagents as needed.
- Subagents do not choose next tickets and do not decide final completion.

- [x] **Step 2: Preserve safety boundaries**

Keep these rules explicit:
- Code workers may only edit files allowed by the active ticket.
- Security/QA agents are read-only.
- Evidence agents do not edit `site/*` or workflow files.
- Browser QA agents do not modify files.
- Codex spot-checks outputs before approval.

### Task 2: Replace Prompt Library

**Files:**
- Modify: `/Users/jinyoon/Desktop/Baseball Lab S&C/docs/project/role-prompts.md`

- [x] **Step 1: Convert old persistent Claude prompts to subagent prompt templates**

Add templates for:
- Code implementation worker.
- Security/QA read-only worker.
- Browser practical QA worker.
- Evidence/research worker.
- Release/checklist worker.
- Codex coordinator.

- [x] **Step 2: Add model selection guidance**

Document:
- `gpt-5.4-mini`: repetitive grep, document inventory, simple browser checklist.
- `gpt-5.4`: bounded implementation, CSS/HTML/JS patching, medium QA.
- Codex/current high-capability path: final decisions, AdSense/release risk, schema/security architecture.

### Task 3: Update Workflow and Security Hubs

**Files:**
- Modify: `/Users/jinyoon/Desktop/Baseball Lab S&C/docs/workflow/README.md`
- Modify: `/Users/jinyoon/Desktop/Baseball Lab S&C/docs/security/README.md`

- [x] **Step 1: Update workflow handoff**

State that implementation can be direct Codex or worker-based depending on scope, but the active ticket remains the source of truth.

- [x] **Step 2: Update security process**

State that security/QA is now a ticket-scoped read-only subagent role, not a standing Claude terminal.

### Task 4: Record Active Work-Plan Result

**Files:**
- Modify: `/Users/jinyoon/Desktop/Baseball Lab S&C/docs/workflow/work-plan.md`

- [x] **Step 1: Register the transition**

Add an active/result section named `총괄 Codex 에이전트 운영 체계 전환 1차`.

- [x] **Step 2: Record verification**

Record that only project/workflow/security docs and this plan were changed, with no `site/*` changes.

### Task 5: Verify

**Files:**
- No code files.

- [x] **Step 1: Check changed paths**

Run:

```bash
git status --short
git diff --stat
git diff -- site
```

Expected:
- No `site/*` diff.
- Only docs changed.

- [x] **Step 2: Check legacy role references**

Run:

```bash
rg -n "Claude Code|보안/QA Claude|근거문서 Claude" docs/project docs/workflow/README.md docs/security/README.md
```

Expected:
- No current operating-rule references to old standing Claude roles.
- Historical archive references may remain outside these current policy docs.
