export interface SummaryResult {
  mainTopics: string;
  totalSummary: string[];
  timeline: {
    title: string;
    startTime: string;
    startSeconds: number;
    summary: string[];
    icon: string;
  }[];
}
