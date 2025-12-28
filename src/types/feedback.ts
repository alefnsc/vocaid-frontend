/**
 * Feedback Types for Frontend
 * 
 * Mirrors the backend StructuredFeedback types for type-safe consumption.
 */

// ============================================
// LEGACY FEEDBACK FORMAT (v1.0)
// ============================================

export interface LegacyFeedback {
  overall_rating: number; // 1-5
  strengths: string[];
  areas_for_improvement: string[];
  technical_skills_rating: number; // 1-5
  communication_skills_rating: number; // 1-5
  problem_solving_rating: number; // 1-5
  detailed_feedback: string;
  recommendations: string[];
  was_interrupted: boolean;
}

// ============================================
// STRUCTURED FEEDBACK FORMAT (v2.0)
// ============================================

export type Seniority = 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
export type SupportedLanguage = 'en' | 'es' | 'pt-BR' | 'zh-CN';

export interface SessionMetadata {
  sessionId: string;
  roleTitle: string;
  seniority: Seniority;
  language: SupportedLanguage;
  resumeUsed: boolean;
  interviewDuration: number;
  totalExchanges: number;
  interviewDate: string;
  wasInterrupted: boolean;
  interruptionReason?: string;
}

export interface CompetencyScore {
  key: string;
  name: string;
  score: number; // 0-5
  weight: number; // 0-1
  evidence: string;
  timestampRefs: number[];
}

export interface StrengthItem {
  title: string;
  evidence: string;
  timestampRef?: number;
  impactLevel: 'high' | 'medium' | 'low';
}

export interface ImprovementItem {
  title: string;
  currentGap: string;
  howToImprove: string;
  priority: 1 | 2 | 3;
  relatedCompetency: string;
}

export interface InterviewHighlight {
  type: 'positive' | 'negative';
  timestampSeconds: number;
  quote: string;
  analysis: string;
}

export interface CommunicationAnalysis {
  overallScore: number;
  pace: {
    wpm: number;
    assessment: 'too_slow' | 'slow' | 'good' | 'fast' | 'too_fast';
  };
  fillerWords: {
    count: number;
    examples: string[];
    frequency: 'none' | 'low' | 'moderate' | 'high';
  };
  clarity: {
    score: number;
    assessment: string;
  };
  structure: {
    score: number;
    assessment: string;
    usedFrameworks: string[];
  };
  technicalVocabulary: {
    score: number;
    assessment: string;
  };
}

export interface StudyPlanItem {
  topic: string;
  rationale: string;
  priority: 1 | 2 | 3;
  estimatedHours: number;
  exercises: string[];
  competency: string;
}

export interface NextSessionGoal {
  goal: string;
  metric: string;
  targetScore: number;
}

export interface DataQualityWarning {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface StructuredFeedback {
  schemaVersion: '1.0';
  promptVersion: string;
  model: string;
  generatedAt: string;
  
  session: SessionMetadata;
  overallScore: number; // 0-100
  scoreConfidence?: {
    lower: number;
    upper: number;
  };
  executiveSummary: string;
  
  competencies: CompetencyScore[];
  strengths: StrengthItem[];
  improvements: ImprovementItem[];
  highlights: InterviewHighlight[];
  communication: CommunicationAnalysis;
  studyPlan: StudyPlanItem[];
  nextSessionGoals: NextSessionGoal[];
  warnings: DataQualityWarning[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface FeedbackApiResponse {
  status: 'success' | 'error';
  call_id: string;
  feedback: LegacyFeedback;
  structured_feedback?: StructuredFeedback | null;
  call_status: {
    end_call_reason?: string;
    disconnection_reason?: string;
    call_duration_ms?: number;
    call_status?: string;
  };
  version: '1.0' | '2.0';
  message?: string;
  // Legacy fields that may be returned directly
  summary?: string;
  feedback_text?: string;
  score?: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if response contains structured feedback
 */
export function hasStructuredFeedback(response: FeedbackApiResponse): boolean {
  return response.version === '2.0' && response.structured_feedback !== null;
}

/**
 * Get display score (0-100) from either feedback format
 */
export function getDisplayScore(response: FeedbackApiResponse): number {
  if (hasStructuredFeedback(response) && response.structured_feedback) {
    return response.structured_feedback.overallScore;
  }
  // Convert legacy 1-5 to 0-100
  return response.feedback.overall_rating * 20;
}

/**
 * Get formatted strengths from either format
 */
export function getStrengths(response: FeedbackApiResponse): string[] {
  if (hasStructuredFeedback(response) && response.structured_feedback) {
    return response.structured_feedback.strengths.map(s => 
      s.impactLevel === 'high' ? `⭐ ${s.title}: ${s.evidence}` : `${s.title}: ${s.evidence}`
    );
  }
  return response.feedback.strengths;
}

/**
 * Get formatted improvements from either format
 */
export function getImprovements(response: FeedbackApiResponse): string[] {
  if (hasStructuredFeedback(response) && response.structured_feedback) {
    return response.structured_feedback.improvements.map(i => 
      `${i.title}: ${i.howToImprove}`
    );
  }
  return response.feedback.areas_for_improvement;
}

/**
 * Get study plan items (only available in structured format)
 */
export function getStudyPlan(response: FeedbackApiResponse): StudyPlanItem[] {
  if (hasStructuredFeedback(response) && response.structured_feedback) {
    return response.structured_feedback.studyPlan;
  }
  return [];
}

/**
 * Get competency scores (only available in structured format)
 */
export function getCompetencies(response: FeedbackApiResponse): CompetencyScore[] {
  if (hasStructuredFeedback(response) && response.structured_feedback) {
    return response.structured_feedback.competencies;
  }
  return [];
}

/**
 * Get communication analysis (only available in structured format)
 */
export function getCommunicationAnalysis(response: FeedbackApiResponse): CommunicationAnalysis | null {
  if (hasStructuredFeedback(response) && response.structured_feedback) {
    return response.structured_feedback.communication;
  }
  return null;
}
