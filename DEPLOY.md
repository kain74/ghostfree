# Deployment Guide (Render + Vercel + PostgreSQL)

## 1) PostgreSQL 준비

1. Supabase(또는 Neon)에서 PostgreSQL 데이터베이스를 생성합니다.
2. 연결 문자열을 복사합니다.
    - 예: `postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public&sslmode=require`

## 2) Render에 API 배포

1. Render에서 New + Web Service를 선택합니다.
2. 이 저장소를 연결합니다.
3. Render는 `render.yaml`을 읽어 자동 설정됩니다.
4. Render 환경변수에 아래 값을 입력합니다.
    - `DATABASE_URL`: PostgreSQL 연결 문자열
    - `ADMIN_SECRET`: 게시판 관리자 비밀번호 (프론트 입력값과 동일해야 함)
    - `FRONTEND_URL`: Vercel 프론트 주소 (예: `https://your-app.vercel.app`)
    - `PORT`: `4000`

## 3) Vercel에 프론트 배포

1. Vercel에서 New Project로 저장소를 연결합니다.
2. Build 설정은 Vite 기본값을 사용합니다.
3. Vercel 환경변수를 추가합니다.
    - `VITE_API_BASE_URL`: Render API 주소 (예: `https://portfolio-api.onrender.com`)

## 4) 동작 확인

1. 프론트 배포 주소 접속
2. 게시판에서 글 작성/수정/삭제 테스트
3. API 헬스체크 확인
    - `https://YOUR_RENDER_URL/api/health`

## 참고

- 프론트는 `VITE_API_BASE_URL`이 비어 있으면 로컬 프록시(`/api`)를 사용합니다.
- 운영에서는 CORS 허용 출처를 `FRONTEND_URL`로 제한합니다.
- 게시글 목록을 재시작 후에도 유지하려면 `DATABASE_URL`이 반드시 정상 연결되어 있어야 합니다.
- Prisma 마이그레이션 파일은 `prisma/migrations`에 포함되어 있습니다.
