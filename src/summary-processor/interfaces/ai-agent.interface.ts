export interface IAIAgent {
  request(systemPrompt: string, userPrompt: string): Promise<string>;
  getName(): string;
}
