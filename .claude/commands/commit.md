---
description: 변경사항을 확인하고 프로젝트 컨벤션에 맞는 커밋 메시지로 커밋합니다
argument-hint: "[커밋에 포함할 파일이나 의도에 대한 힌트 (선택)]"
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

## 상황 파악

- `git status`로 추적되지 않은 파일까지 확인
- `git diff`(unstaged)와 `git diff --staged`로 실제 변경 내용 확인
- `git log --oneline -10`으로 최근 커밋 메시지 스타일 확인

$ARGUMENTS

## 커밋 메시지 작성

- 변경사항의 "무엇"보다 "왜"에 집중해서 1~2문장으로 간결하게 작성
- 구어체 없이 깔끔한 기술 서술체 한국어로 작성 (예: "~함", "~수정", "~추가" 등 명사형/서술형 종결)
- `Co-Authored-By`, `Claude-Session` 등 어떤 트레일러도 절대 추가하지 않음
- `.env`, credentials 등 비밀값이 들어있을 만한 파일은 커밋 대상에서 제외하고 사용자에게 경고
