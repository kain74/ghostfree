# Portfolio Project

## 로컬 개발 실행 순서

### 1) PostgreSQL 먼저 실행
게시판 데이터가 재시작 후에도 유지되려면 PostgreSQL이 실행 중이어야 합니다.

### 2) 의존성 설치 (최초 1회)
```bash
npm install
```

### 3) DB 스키마 반영 (최초 1회 또는 스키마 변경 시)
```bash
npm run db:migrate:deploy
```

### 4) 개발 서버 2개 실행
터미널 A:
```bash
npm run dev
```

터미널 B:
```bash
npm run dev:server
```

## 평소에는 무엇만 실행하면 되나요?
평소 개발은 아래 2개만 실행하면 됩니다.
- npm run dev
- npm run dev:server

단, PostgreSQL이 꺼져 있으면 게시판 등록/조회가 정상 동작하지 않을 수 있습니다.

## 환경 변수
프로젝트 루트의 `.env` 파일에 아래 값이 필요합니다.

- DATABASE_URL
- FRONTEND_URL
- ADMIN_SECRET

서버 스크립트는 `.env`를 자동으로 읽도록 설정되어 있습니다.

### 개발용 / 배포용 섹션 안내
- `.env.example`은 **Local Development**와 **Production Deployment** 두 섹션으로 분리되어 있습니다.
- 로컬에서는 Local Development 값을 기준으로 `.env`를 만들고 실행하세요.
- 배포 시에는 Production Deployment 예시를 참고해 Vercel/Render 환경 변수에 각각 입력하세요.

## 게시판 500 에러가 날 때 점검

1. PostgreSQL이 실행 중인지 확인
2. `.env`의 DATABASE_URL이 올바른지 확인
3. 마이그레이션 적용 여부 확인
```bash
npm run db:migrate:deploy
```
4. 백엔드 서버 실행 여부 확인
```bash
npm run dev:server
```

## 배포 시 필수 설정
Render 기준 환경 변수:
- DATABASE_URL
- ADMIN_SECRET
- FRONTEND_URL
- PORT
