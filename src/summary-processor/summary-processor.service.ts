import { Injectable, Logger } from '@nestjs/common';
import { IAIAgent } from './interfaces/ai-agent.interface';
import { ClaudeAgentService } from './services/claude.service';
import { Caption } from 'src/video-source/interfaces/caption.interface';
import { AgentType } from './types/agent-type';
import { SummaryResult } from './interfaces/summary-result.interface';

@Injectable()
export class SummaryProcessorService {
  private agents: Map<AgentType, IAIAgent>;
  private readonly logger: Logger = new Logger('Summary Processor');

  constructor(private readonly claudeAgent: ClaudeAgentService) {
    this.agents = new Map([
      ['claude', claudeAgent],
      // 나중에 다른 AI 에이전트 추가 가능
      // ['gpt', gptAgent],
    ]);
  }

  async process(
    captions: Caption[],
    videoInfo: { title: string },
    agentType: AgentType = 'claude',
  ): Promise<SummaryResult> {
    try {
      const agent = this.agents.get(agentType);

      if (!agent) {
        throw new Error(`지원하지 않는 AI 에이전트입니다: ${agentType}`);
      }

      // 프롬프트 생성
      const prompt = this.createSummaryPrompt();

      // AI 에이전트에 요청
      const response = await agent.request(prompt, JSON.stringify(captions));

      console.log(response);

      // 응답 파싱
      const data = this.parseResponse(response);

      if (!data) {
        throw new Error('요약 데이터를 파싱할 수 없습니다.');
      }

      return data;
    } catch (error) {
      this.logger.error('요약 데이터 생성 중 오류가 발생했습니다:', error);
      throw this.handleError(error);
    }
  }

  private createSummaryPrompt(): string {
    return `당신은 전문적인 한국어 요약가입니다. 아래에 YouTube 영상의 자막이 제공됩니다. 이 자막을 분석하여 영상의 핵심 주제를 **자세하게 요약**하고, 
전체 내용을 최대한 빠짐 없이 여러 타임라인으로 나누어 각 타임라인 마다 내용을 요약해주세요.

[요구사항]
- **타임라인에는 최소한 8개의 섹션이 있어야 합니다.**
- 각 타임라인 섹션의 **'summary'는 해당 섹션의 주요 내용을 상세하고 구체적으로 작성된 4~5개의 포인트로 구성된 배열**로 작성해주세요.
- 모든 응답은 **JSON 형식**으로만 해주세요. **불필요한 설명이나 텍스트는 포함하지 마세요.**
- **응답은 반드시 JSON 형식으로 시작해야 합니다.**
- **응답은 8000 토큰을 넘지 않아야 합니다. 만약 8000 토큰을 넘는다면, script라고 되어있는 섹션 스크립트 원문 부분을 일부 ...(생략) 이런식으로 표현해주세요.**
- **모든 응답은 반드시 한국어로 작성해주세요.**

- JSON 스키마:
{
"mainTopics": "영상의 주요 주제 요약",
"totalSummary": [
  "전체 내용 요약 포인트 1",
  "전체 내용 요약 포인트 2",
  "전체 내용 요약 포인트 3",
  "전체 내용 요약 포인트 4",
  "전체 내용 요약 포인트 5"
],
"timeline": [
  {
    "title": "섹션 제목",
    "startTime": "hh:mm:ss",
    "startSeconds": 시작 시간(초),
    "summary": [
      "요약 포인트 1",
      "요약 포인트 2",
      "요약 포인트 3",
      "요약 포인트 4",
      "요약 포인트 5"
    ],
    "icon": "이모지(선택사항)"
  },
  ...
]
}
- 타임라인은 영상의 중요한 섹션을 나타내며, 각 섹션의 **시작 시간을 포함**해야 합니다.
- **스크립트 원문은 해당 섹션의 자막 내용을 포함**해야 합니다.
- 가능한 경우 **적절한 이모지를 섹션에 추가**해주세요.

- **모든 응답은 반드시 한국어로 작성해주세요.**

[예시]
{
"mainTopics": "영상의 주요 주제 요약",
"totalSummary": [
  "정보 혁명은 행복한 삶을 위한 다양한 솔루션을 필요로 한다.",
  "정보의 홍수 속에서 사람과 사회의 관계는 급격히 변화하고 있다.",
  "호트링크의 목표는 이러한 변화에 적응하며 유용한 해결책을 제공하는 것이다.",
  "데이터와 인공지능 기술을 통해 인간의 지혜를 모으면 사회 전반에 큰 도움이 될 수 있다.",
  "젊은이들은 스스로 생각하고 경험을 쌓아야 하며, 단순한 지식 습득보다 문제 해결 능력이 더 중요하다."
],
"timeline": [
  {
    "title": "대학생들의 취업 어려움과 경쟁 심화",
    "startTime": "00:00:00",
    "startSeconds": 0,
    "summary": [
      "이력서도 계속 고치고 인터뷰 괴롭힘으로 하루 이틀 아르바이트를 얻는데 시간이 많이 걸렸다.,
      "친구 아들 조차도 빠르게 일자리를 구했는데, 학교 내에서는 상관없이 자신이 누구든 솔로 경쟁하는 모습이 충격적이었다.",
      "금융관련 일을 하면서 자신감을 길러왔는데, 대학 졸업하고 4년째 근무하며 투자 분야를 공부하기 시작하였다.",
      "기타 외국계 업체들도 한달에 한 지점씩 라우터를 내 놓는데, 중요한 것은 지점을 개설할 때 필요한 월세가 많다는 점이었다.",
      "고객 가치 및 비용 측면에서 더 나은 성과를 내기 위해, 외국계 업체는 건물 임대료와 고객 만족도를 고려한 원가 구조를 잡아 나갈 필요가 있다는 생각을 했다."
    ],
    "icon": "🎓"
  },
  // 추가 섹션들...
]
}
`;
  }

  private parseResponse(response: string): SummaryResult | null {
    try {
      // JSON 시작 위치 찾기
      const jsonStart = response.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('JSON 형식을 찾을 수 없습니다.');
      }

      // JSON 끝 위치 찾기 (중첩된 중괄호 고려)
      let bracketCount = 0;
      let jsonEnd = -1;

      for (let i = jsonStart; i < response.length; i++) {
        if (response[i] === '{') {
          bracketCount++;
        } else if (response[i] === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            jsonEnd = i + 1;
            break;
          }
        }
      }

      if (jsonEnd === -1) {
        throw new Error('올바른 JSON 형식이 아닙니다.');
      }

      // JSON 부분만 추출하여 파싱
      const jsonStr = response.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonStr);

      // 필수 필드 검증
      if (!parsed.mainTopics || !parsed.totalSummary || !parsed.timeline) {
        throw new Error('필수 필드가 누락되었습니다.');
      }

      return parsed as SummaryResult;
    } catch (error) {
      this.logger.error('응답 파싱 중 오류:', error);
      return null;
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('요약 데이터 생성 중 오류가 발생했습니다.');
  }
}
