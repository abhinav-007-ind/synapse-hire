export interface CandidateProfile {
  anonymized_name: string;
  headline: string;
  summary: string;
  location: string;
  country: string;
  years_of_experience: number;
  current_title: string;
  current_company: string;
  current_company_size: string;
  current_industry: string;
}

export interface CareerHistoryItem {
  company: string;
  title: string;
  start_date: string;
  end_date: string | null;
  duration_months: number;
  is_current: boolean;
  industry: string;
  company_size: string;
  description: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year: number;
  grade: string | null;
  tier: "tier_1" | "tier_2" | "tier_3" | "tier_4" | "unknown";
}

export interface SkillItem {
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  endorsements: number;
  duration_months?: number;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: number;
}

export interface LanguageItem {
  language: string;
  proficiency: "basic" | "conversational" | "professional" | "native";
}

export interface RedrobSignals {
  profile_completeness_score: number;
  signup_date: string;
  last_active_date: string;
  open_to_work_flag: boolean;
  profile_views_received_30d: number;
  applications_submitted_30d: number;
  recruiter_response_rate: number;
  avg_response_time_hours: number;
  skill_assessment_scores: Record<string, number>;
  connection_count: number;
  endorsements_received: number;
  notice_period_days: number;
  expected_salary_range_inr_lpa: {
    min: number;
    max: number;
  };
  preferred_work_mode: "remote" | "hybrid" | "onsite" | "flexible";
  willing_to_relocate: boolean;
  github_activity_score: number;
  search_appearance_30d: number;
  saved_by_recruiters_30d: number;
  interview_completion_rate: number;
  offer_acceptance_rate: number;
  verified_email: boolean;
  verified_phone: boolean;
  linkedin_connected: boolean;
}

export interface Candidate {
  candidate_id: string;
  profile: CandidateProfile;
  career_history: CareerHistoryItem[];
  education: EducationItem[];
  skills: SkillItem[];
  certifications?: CertificationItem[];
  languages?: LanguageItem[];
  redrob_signals: RedrobSignals;
}

// Staged Scoring breakdown
export interface ScoreBreakdown {
  semanticMatch: number;      // Stage 3
  skillMatch: number;         // Stage 2 & 5
  experienceFit: number;      // Stage 2 & 5
  careerQuality: number;      // Stage 2 & 5
  behavioralReliability: number; // Stage 2 & 5
  recruiterTrust: number;     // Stage 2 & 5
  trapPenalty: number;        // Stage 4
  trapRiskScore: number;      // Stage 4 (0-100)
  trapFlags: string[];        // Traps detected
  finalScore: number;         // Stage 5 Normalised
}

export interface IntelligenceExplanation {
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface ScoredCandidate {
  candidate: Candidate;
  scores: ScoreBreakdown;
  aiExplanation: IntelligenceExplanation;
  rank: number;
}

// JD Extraction Role Blueprint (Stage 1 Output)
export interface JobBlueprint {
  title: string;
  minExperience: number;
  maxExperience: number;
  mandatorySkills: string[];
  preferredSkills: string[];
  riskSensitivity?: number;
  weights: {
    semanticMatch: number;
    skillMatch: number;
    experienceFit: number;
    careerQuality: number;
    behavioralReliability: number;
    recruiterTrust: number;
  };
  trapsAndRedFlags: {
    label: string;
    penalty: number;
    conditions: string[];
  }[];
}

// Enterprise Upgrade Data Structures
export type JobState = "idle" | "pending" | "validating" | "processing" | "ranking" | "exporting" | "completed" | "failed";

export interface DataValidationMetrics {
  rowsParsed: number;
  malformedRows: number;
  duplicatesSkipped: number;
  anomaliesDetected: number;
  dataIntegrityScore: number;
  timelineOverlaps: number;
  skillContradictions: number;
  extremeValues: number;
}

export interface SystemTelemetry {
  cpuUsagePercent: number;
  ramUsageMB: number;
  runtimeMs: number;
  activeChunkCount: number;
}

export interface AuditRunLog {
  run_id: string;
  timestamp: string;
  dataset_hash: string;
  jd_hash: string;
  model_version: string;
  candidate_count: number;
  filtered_candidates: number;
  weights: JobBlueprint["weights"];
  anomaly_count: number;
  honeypot_detections: number;
}

export interface IngestionLogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}
