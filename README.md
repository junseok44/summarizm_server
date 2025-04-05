# YouTube Summary Bot

YouTube 영상의 자막을 분석하여 요약을 생성하고, 이를 Slack 봇을 통해 제공하는 서비스입니다.

## 주요 기능

- YouTube 영상 자막 추출 및 분석
- AI를 활용한 영상 내용 요약 생성
- Slack 봇을 통한 요약 내용 제공
- 다양한 출력 형식 지원 (텍스트, 마크다운 등)

## 기술 스택

- NestJS (Node.js 백엔드 프레임워크)
- TypeScript
- Claude API (AI 모델)
- Slack Bot API
- YouTube Data API

## 프로젝트 구조

```
src/
├── bot/              # Slack 봇 관련 모듈
├── summary/          # 요약 생성 관련 모듈
├── summary-processor/# 요약 처리 관련 모듈
├── video-source/     # YouTube 영상 처리 모듈
├── output-channel/   # 출력 형식 처리 모듈
└── common/           # 공통 유틸리티
```

## 설치 및 실행 방법

1. 저장소 클론

```bash
git clone [repository-url]
cd youtube_summary
```

2. 의존성 설치

```bash
yarn install
```

3. 환경 변수 설정
   `.env` 파일을 생성하고 다음 변수들을 설정합니다:

```
YOUTUBE_API_KEY=your_youtube_api_key
CLAUDE_API_KEY=your_claude_api_key
FILE_STORAGE_PATH=your_file_storage_path
```

4. 개발 서버 실행

```bash
yarn start:dev
```

5. 프로덕션 빌드

```bash
yarn build
yarn start:prod
```

## API 엔드포인트

### Summary API

- `POST /summary`: YouTube 영상 URL을 받아 요약을 생성

### Slack Bot API

- `POST /bot/slack/events`: Slack 이벤트 처리 (URL 검증 및 메시지 처리)

## 라이선스

MIT License
