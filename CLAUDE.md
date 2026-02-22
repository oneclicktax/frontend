# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 답변 언어

모든 답변과 주석은 **한국어**로 작성한다.

## Build & Run Commands

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트
pnpm lint
```

- 개발 서버 포트: `3000`
- 패키지 매니저: **pnpm** (반드시 pnpm 사용)

## Tech Stack

- **Next.js 16.1.6** (App Router), **React 19**, **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (new-york 스타일)
- **TanStack React Query** (서버 상태 관리)
- **overlay-kit** (오버레이/모달 관리)
- **sonner** (토스트 알림)
- **vaul** (드로어)
- **MSW** (API 모킹, 개발용)
- **lucide-react** (아이콘)

## 프로젝트 구조

```
src/
  ├── app/                  # Next.js App Router
  │     ├── layout.tsx      # 루트 레이아웃
  │     ├── page.tsx        # 루트 페이지
  │     ├── globals.css     # 글로벌 스타일 (Tailwind)
  │     ├── login/          # 로그인 페이지
  │     └── (main)/         # 메인 레이아웃 그룹
  │           ├── layout.tsx
  │           ├── home/         # 홈
  │           ├── business/     # 사업장
  │           ├── documents/    # 서류
  │           └── profile/      # 프로필
  ├── components/           # 공통 컴포넌트
  │     └── ui/             # shadcn/ui 컴포넌트
  ├── lib/                  # 유틸리티
  │     └── utils.ts        # cn() 등
  └── mocks/                # MSW 핸들러 (API 모킹)
```

## 경로 별칭

- `@/*` → `./src/*` (tsconfig paths)

## shadcn/ui 사용

- 컴포넌트 추가: `pnpm dlx shadcn@latest add <component>`
- 설치 경로: `src/components/ui/`
- shadcn/ui 컴포넌트는 직접 수정 가능 (복사 기반)

## 코딩 규칙

- **컴포넌트**: 함수형 컴포넌트 + TypeScript
- **스타일링**: Tailwind CSS 유틸리티 클래스 사용, `cn()` 으로 조건부 클래스 조합
- **서버/클라이언트 구분**: 기본은 서버 컴포넌트, 필요시 `"use client"` 명시
- **상태 관리**: 서버 상태는 React Query, 클라이언트 상태는 React 내장 훅 사용
