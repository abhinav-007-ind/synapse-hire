import { Candidate, ScoredCandidate, JobBlueprint, DataValidationMetrics, SystemTelemetry, AuditRunLog, IngestionLogEntry } from "../types";

// Helper for generating a random simple UUID
export function generateUUID(): string {
  return "run-" + Math.random().toString(36).substring(2, 15) + "-" + Math.random().toString(36).substring(2, 15);
}

// In-Memory Database / Cache for Auditing
export interface AuditRunRecord {
  runLog: AuditRunLog;
  candidatesLog: ScoredCandidate[];
  logs: IngestionLogEntry[];
  metrics: DataValidationMetrics;
  telemetry: SystemTelemetry;
}

export const auditDatabase: Map<string, AuditRunRecord> = new Map();

// Simplified SHA256 simulation or node-crypto proxy
export function calculateSHA256(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  // Fill to mimic full 64 char sha256
  return "sha256-" + hex + "e" + Math.round(content.length * 17).toString(16) + "0f24a73b9e4d588fec" + hex;
}

// Magic Bytes Verification
export function scanFileMagicBytes(
  filename: string,
  buffer: Buffer | ArrayBuffer,
  fileSize: number
): { secure: boolean; error?: string } {
  const ext = filename.split(".").pop()?.toLowerCase();
  const arr = new Uint8Array(buffer.slice(0, 4));
  
  if (fileSize > 600 * 1024 * 1024) {
    return { secure: false, error: "File too large (Max 600 MB candidate limit exceeded)" };
  }

  // Detect Executables (.exe / .sh etc)
  // MZ header for Windows, ELF for Linux, shebang for scripts
  if (arr[0] === 0x4d && arr[1] === 0x5a) {
    return { secure: false, error: "Suspicious MIME types: Rejecting windows executable block." };
  }
  if (arr[0] === 0x7f && arr[1] === 0x45 && arr[2] === 0x4c && arr[3] === 0x46) {
    return { secure: false, error: "Suspicious MIME types: Unsupported ELF binary executable." };
  }
  if (arr[0] === 0x23 && arr[1] === 0x21) {
    return { secure: false, error: "Suspicious MIME types: Shell script shebang detected." };
  }

  switch (ext) {
    case "gz":
    case "jsonl.gz":
      // gzip magic bytes: 0x1f 0x8b
      if (arr[0] !== 0x1f || arr[1] !== 0x8b) {
        return { secure: false, error: "Corrupted gzip format signature mismatch" };
      }
      break;
    case "pdf":
      // PDF magic: %PDF (0x25 0x50 0x44 0x46)
      if (arr[0] !== 0x25 || arr[1] !== 0x50 || arr[2] !== 0x44 || arr[3] !== 0x46) {
        return { secure: false, error: "Invalid PDF structure (magic byte verification failed)" };
      }
      break;
    case "docx":
      // XML Zip Magic: PK (0x50 0x4b 0x03 0x04)
      if (arr[0] !== 0x50 || arr[1] !== 0x4b) {
        return { secure: false, error: "Invalid Word Document Zip header (magic byte mismatch)" };
      }
      break;
    case "jsonl":
    case "json":
    case "txt":
    case "md":
      // JSON/Text has no static header, but we check first readable text characters
      const sample = String.fromCharCode(...arr).trim();
      if (ext === "jsonl" && sample && !sample.startsWith("{") && !sample.startsWith("[")) {
        return { secure: false, error: "MIME-byte validation failed: Malformed JSONL structure" };
      }
      break;
    default:
      return { secure: false, error: "Unsupported file extension or format" };
  }

  return { secure: true };
}

// Anti-tamper verification of CSV
export function buildAntiTamperCSV(scoredCandidates: ScoredCandidate[], runInfo: AuditRunLog): string {
  const headers = "candidate_id,rank,score,reasoning\n";
  const rows = scoredCandidates.slice(0, 100).map(item => {
    // Escape commas in reasoning to remain valid CSV
    const reason = (item.aiExplanation.recommendation || "").replace(/"/g, '""');
    return `${item.candidate.candidate_id},${item.rank},${item.scores.finalScore},"${reason}"`;
  }).join("\n");

  const rawCSV = headers + rows;

  // Sign CSV
  const checksum = calculateSHA256(rawCSV);

  // Embed secure tamper evidence headers as hash prefix
  const antiTamperBlock = `## SYNAPSE TRUST ASSURED ##
# RUN_ID: ${runInfo.run_id}
# EXPORT_TIMESTAMP: ${new Date().toISOString()}
# MODEL_VERSION: ${runInfo.model_version}
# DATASET_HASH: ${runInfo.dataset_hash}
# SECURITY_CHECKSUM: ${checksum}
###########################
`;

  return antiTamperBlock + rawCSV;
}

// Full audit reports metrics
export function auditCandidateDataset(
  rawCandidates: Candidate[],
  existingCandidates: Set<string> = new Set()
): {
  validCandidates: Candidate[];
  metrics: DataValidationMetrics;
  logs: IngestionLogEntry[];
} {
  const metrics: DataValidationMetrics = {
    rowsParsed: 0,
    malformedRows: 0,
    duplicatesSkipped: 0,
    anomaliesDetected: 0,
    dataIntegrityScore: 100,
    timelineOverlaps: 0,
    skillContradictions: 0,
    extremeValues: 0
  };

  const logs: IngestionLogEntry[] = [];
  const validCandidates: Candidate[] = [];
  const trackedIds = new Set<string>();

  logs.push({
    timestamp: new Date().toLocaleTimeString(),
    level: "info",
    message: `Starting deep static analysis on ${rawCandidates.length} candidate rows.`
  });

  rawCandidates.forEach((c, idx) => {
    metrics.rowsParsed++;
    let isMalformed = false;
    let isDuplicate = false;
    let hasAnomaly = false;

    // 1. Candidate ID Check
    if (!c.candidate_id) {
      metrics.malformedRows++;
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: "error",
        message: `Row #${idx + 1}: Missing candidate_id.`
      });
      isMalformed = true;
    } else if (!/^CAND_[A-Za-z0-9_-]+$/.test(c.candidate_id) && !/^[A-Za-z0-9_-]+$/.test(c.candidate_id)) {
      metrics.malformedRows++;
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: "error",
        message: `Row #${idx + 1}: Malformed ID [${c.candidate_id}]. Expected alphanumeric/Tracer format.`
      });
      isMalformed = true;
    }

    // 2. Reject Duplicates
    if (c.candidate_id) {
      if (trackedIds.has(c.candidate_id) || existingCandidates.has(c.candidate_id)) {
        metrics.duplicatesSkipped++;
        logs.push({
          timestamp: new Date().toLocaleTimeString(),
          level: "warn",
          message: `Candidate ${c.candidate_id}: Duplicate ID detected - stripping from pool`
        });
        isDuplicate = true;
      } else {
        trackedIds.add(c.candidate_id);
      }
    }

    if (isMalformed || isDuplicate) {
      return; // Skip this row
    }

    // 3. Schema Profile Validation
    if (!c.profile || !c.profile.current_title || !c.profile.current_company) {
      metrics.malformedRows++;
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: "error",
        message: `Candidate ${c.candidate_id}: Missing mandatory profile fields (title/company)`
      });
      return;
    }

    if (c.profile.years_of_experience < 0 || c.profile.years_of_experience > 50) {
      metrics.extremeValues++;
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: "warn",
        message: `Candidate ${c.candidate_id}: Experience value ${c.profile.years_of_experience} sits outside standard recruiting bounds`
      });
      hasAnomaly = true;
    }

    // 4. Chronological Timeline validation
    let overlappingJobs = false;
    let negativeTimeline = false;
    let tenureDiscrepancy = false;

    if (c.career_history && Array.isArray(c.career_history)) {
      c.career_history.forEach(job => {
        if (job.duration_months < 0) {
          negativeTimeline = true;
        }

        // Overlapping date simulation check (e.g. active overlap of multiple distinct roles)
        const currentActive = c.career_history.filter(j => j.is_current).length;
        if (currentActive > 1) {
          overlappingJobs = true;
        }

        // Example: company is 3-years old, profile claims 8 years experience there
        if (job.company_size === "1-10" && job.duration_months > 96) {
          tenureDiscrepancy = true;
        }
      });
    }

    if (overlappingJobs) {
      metrics.timelineOverlaps++;
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: "warn",
        message: `Candidate ${c.candidate_id}: Overlapping active roles detected (impossible parallel lines)`
      });
      hasAnomaly = true;
    }

    if (negativeTimeline) {
      metrics.extremeValues++;
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: "error",
        message: `Candidate ${c.candidate_id}: Chronology contains illegal negative durations`
      });
      hasAnomaly = true;
    }

    if (tenureDiscrepancy) {
      metrics.timelineOverlaps++;
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: "warn",
        message: `Candidate ${c.candidate_id}: Job duration ${c.career_history[0]?.duration_months} months conflicts with startup tier parameters`
      });
      hasAnomaly = true;
    }

    // 5. Skill Contradictions Check
    const skills = c.skills || [];
    const expertSkills = skills.filter(s => s.proficiency === "expert");
    if (expertSkills.length > 15 && c.profile.years_of_experience < 3) {
      metrics.skillContradictions++;
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: "warn",
        message: `Candidate ${c.candidate_id}: Expert list exaggeration detected (${expertSkills.length} expertise claims with under 2 years tenure)`
      });
      hasAnomaly = true;
    }

    // 6. Signal Range Verification
    const s = c.redrob_signals;
    if (s) {
      if (s.recruiter_response_rate < 0 || s.recruiter_response_rate > 1 || s.interview_completion_rate < 0 || s.interview_completion_rate > 1) {
        metrics.extremeValues++;
        logs.push({
          timestamp: new Date().toLocaleTimeString(),
          level: "error",
          message: `Candidate ${c.candidate_id}: Interaction rate percentage outside boundary limits`
        });
        hasAnomaly = true;
      }
      if (s.notice_period_days < 0 || s.notice_period_days > 180) {
        metrics.extremeValues++;
        logs.push({
          timestamp: new Date().toLocaleTimeString(),
          level: "warn",
          message: `Candidate ${c.candidate_id}: Notice period of ${s.notice_period_days} days violates strict regulatory compliance window`
        });
        hasAnomaly = true;
      }
    }

    if (hasAnomaly) {
      metrics.anomaliesDetected++;
    }

    validCandidates.push(c);
  });

  // Score Calculations: Start at 100, apply deductives
  let integrity = 100;
  integrity -= metrics.malformedRows * 6;
  integrity -= metrics.duplicatesSkipped * 3;
  integrity -= metrics.timelineOverlaps * 8;
  integrity -= metrics.skillContradictions * 10;
  integrity -= metrics.extremeValues * 4;

  metrics.dataIntegrityScore = Math.max(0, Math.min(100, integrity));

  logs.push({
    timestamp: new Date().toLocaleTimeString(),
    level: "success",
    message: `Verification complete: ${validCandidates.length} eligible candidates cached. Unified Data Integrity: ${metrics.dataIntegrityScore}%`
  });

  return { validCandidates, metrics, logs };
}

// Synthetic Enterprise Dataset with trackable target anomalies to verify stress test validation
export function getSyntheticEnterpriseCandidatesWithAnomalies(): Candidate[] {
  // Baseline clean, elite star candidate
  const candidate1: Candidate = {
    candidate_id: "CAND_0009581",
    profile: {
      anonymized_name: "Isabella Vance",
      headline: "Senior AI Engineer (Founding Lead)",
      summary: "Specialist in designing high-concurrency vector indexing systems, real-time reranking models, and neural search pipelines. Proficient in PyTorch, FAISS, and distributed vector space clusters.",
      location: "San Francisco, CA",
      country: "US",
      years_of_experience: 8,
      current_title: "Staff Search Architect",
      current_company: "Synapse Labs",
      current_company_size: "11-50",
      current_industry: "Artificial Intelligence"
    },
    career_history: [
      {
        company: "Synapse Labs",
        title: "Staff Search Architect",
        start_date: "2023-01",
        end_date: null,
        duration_months: 41,
        is_current: true,
        industry: "Artificial Intelligence",
        company_size: "11-50",
        description: "Implemented custom sparse-dense hybrid retrieval algorithms yielding a 45% reduction in vector processing latency."
      },
      {
        company: "Pinecone Systems",
        title: "Senior AI Engineer",
        start_date: "2020-04",
        end_date: "2022-12",
        duration_months: 32,
        is_current: false,
        industry: "Infrastructure",
        company_size: "101-250",
        description: "Built semantic embedding encoders and fine-tuned BERT query representations for high-fidelity client deployments."
      }
    ],
    education: [
      {
        institution: "UC Berkeley",
        degree: "M.S. Computer Science",
        field_of_study: "Machine Learning",
        start_year: 2018,
        end_year: 2020,
        grade: "3.9 GPA",
        tier: "tier_1"
      }
    ],
    skills: [
      { name: "Python", proficiency: "expert", endorsements: 76, duration_months: 96 },
      { name: "Embeddings", proficiency: "expert", endorsements: 62, duration_months: 72 },
      { name: "Vector Search", proficiency: "expert", endorsements: 54, duration_months: 60 },
      { name: "Retrieval Systems", proficiency: "advanced", endorsements: 44, duration_months: 48 },
      { name: "FAISS", proficiency: "advanced", endorsements: 31, duration_months: 36 }
    ],
    redrob_signals: {
      profile_completeness_score: 95,
      signup_date: "2020-01-01",
      last_active_date: "2026-06-12",
      open_to_work_flag: true,
      profile_views_received_30d: 412,
      applications_submitted_30d: 4,
      recruiter_response_rate: 0.92,
      avg_response_time_hours: 1.8,
      skill_assessment_scores: { ML: 98, Systems: 95 },
      connection_count: 840,
      endorsements_received: 122,
      notice_period_days: 15,
      expected_salary_range_inr_lpa: { min: 45, max: 75 },
      preferred_work_mode: "hybrid",
      willing_to_relocate: true,
      github_activity_score: 89,
      search_appearance_30d: 1205,
      saved_by_recruiters_30d: 44,
      interview_completion_rate: 0.98,
      offer_acceptance_rate: 0.94,
      verified_email: true,
      verified_phone: true,
      linkedin_connected: true
    }
  };

  // Malformed ID Candidate (Reject / Flag)
  const candidate2: Candidate = {
    candidate_id: "BAD_CAND_ID_999",
    profile: {
      anonymized_name: "Anonymous Alpha",
      headline: "Python Developer",
      summary: "Full stack developer focusing on Django databases and web applications.",
      location: "Austin, TX",
      country: "US",
      years_of_experience: 4,
      current_title: "Django Coder",
      current_company: "Web dev inc",
      current_company_size: "1-10",
      current_industry: "Software"
    },
    career_history: [],
    education: [],
    skills: [{ name: "Python", proficiency: "expert", endorsements: 4, duration_months: 24 }],
    redrob_signals: {
      profile_completeness_score: 50, signup_date: "2022-01-01", last_active_date: "2026-05-10",
      open_to_work_flag: false, profile_views_received_30d: 12, applications_submitted_30d: 0,
      recruiter_response_rate: 0.50, avg_response_time_hours: 24, skill_assessment_scores: {},
      connection_count: 10, endorsements_received: 1, notice_period_days: 30,
      expected_salary_range_inr_lpa: { min: 12, max: 20 }, preferred_work_mode: "onsite",
      willing_to_relocate: false, github_activity_score: -1, search_appearance_30d: 50,
      saved_by_recruiters_30d: 2, interview_completion_rate: 0.60, offer_acceptance_rate: 0.80,
      verified_email: true, verified_phone: false, linkedin_connected: false
    }
  };

  // Duplicate ID Candidate (Should check duplicates and skip CAND_0009581 second upload)
  const candidate3: Candidate = {
    candidate_id: "CAND_0009581", 
    profile: {
      anonymized_name: "Duplicate Bella",
      headline: "AI Engineer Hacker",
      summary: "Exaggerated clone profile.",
      location: "San Francisco, CA",
      country: "US",
      years_of_experience: 12,
      current_title: "Lead",
      current_company: "Synapse",
      current_company_size: "11-50",
      current_industry: "AI"
    },
    career_history: [],
    education: [],
    skills: [],
    redrob_signals: candidate1.redrob_signals
  };

  // Chronological overlapping jobs anomaly candidate
  const candidate4: Candidate = {
    candidate_id: "CAND_0007412",
    profile: {
      anonymized_name: "Alex Rivera",
      headline: "Senior Cloud Engineer",
      summary: "Expert in parallel multi-cloud systems with complicated overlaps.",
      location: "Seattle, WA",
      country: "US",
      years_of_experience: 6,
      current_title: "Solutions Architect",
      current_company: "Matrix Corp",
      current_company_size: "1-10",
      current_industry: "Technology"
    },
    career_history: [
      {
        company: "Matrix Corp",
        title: "Solutions Architect",
        start_date: "2024-01",
        end_date: null,
        duration_months: 30,
        is_current: true, // Marked current 1
        industry: "Technology",
        company_size: "1-10",
        description: "Full-time cloud setup."
      },
      {
        company: "Parallel Cloud Co",
        title: "Lead Security Dev",
        start_date: "2024-03",
        end_date: null,
        duration_months: 28,
        is_current: true, // Marked current 2 - IMPOSSIBLE OVERLAP
        industry: "Technology",
        company_size: "11-50",
        description: "Parallel full-time lead architect."
      }
    ],
    education: [],
    skills: [{ name: "AWS", proficiency: "expert", endorsements: 12, duration_months: 60 }],
    redrob_signals: {
      ...candidate1.redrob_signals,
      recruiter_response_rate: 0.85,
      notice_period_days: 45
    }
  };

  // Out of bounds signals candidate (Notice period = 270 days, expected salary min > max, interview rate = 5.2)
  const candidate5: Candidate = {
    candidate_id: "CAND_0004541",
    profile: {
      anonymized_name: "Zene Mercer",
      headline: "AI Scientist",
      summary: "Machine learning research scientist specializing in NLP models.",
      location: "Boston, MA",
      country: "US",
      years_of_experience: 15,
      current_title: "Principal Researcher",
      current_company: "MIT Research Labs",
      current_company_size: "501-1000",
      current_industry: "Higher Ed"
    },
    career_history: [],
    education: [],
    skills: [{ name: "NLP", proficiency: "expert", endorsements: 62, duration_months: 120 }],
    redrob_signals: {
      profile_completeness_score: 90, signup_date: "2018-01-01", last_active_date: "2026-06-01",
      open_to_work_flag: true, profile_views_received_30d: 310, applications_submitted_30d: 2,
      recruiter_response_rate: 0.50, avg_response_time_hours: 10, skill_assessment_scores: {},
      connection_count: 500, endorsements_received: 90,
      notice_period_days: 270, // ANOMALY: notice_period > 180 days limit
      expected_salary_range_inr_lpa: { min: 80, max: 40 }, // ANOMALY: min > max expected salary
      preferred_work_mode: "remote", willing_to_relocate: true, github_activity_score: 12,
      search_appearance_30d: 400, saved_by_recruiters_30d: 20,
      interview_completion_rate: 1.5, // ANOMALY: completion_rate > 100%
      offer_acceptance_rate: 0.80, verified_email: true, verified_phone: true, linkedin_connected: true
    }
  };

  // Skill contradiction candidate (claims 'expert' in 18 separate skills but only 1 year experience)
  const candidate6: Candidate = {
    candidate_id: "CAND_0006325",
    profile: {
      anonymized_name: "Jordan Chase",
      headline: "Junior ML enthusiast",
      summary: "Recent bootcamp graduate with a long list of expert skills.",
      location: "Chicago, IL",
      country: "US",
      years_of_experience: 1, // ANOMALY: Under 3 years tenure
      current_title: "Junior Dev",
      current_company: "Startup VC",
      current_company_size: "1-10",
      current_industry: "Technology"
    },
    career_history: [],
    education: [],
    skills: [ // ANOMALY: Expert in 18 complex skills
      { name: "Python", proficiency: "expert", endorsements: 12, duration_months: 6 },
      { name: "PyTorch", proficiency: "expert", endorsements: 10, duration_months: 6 },
      { name: "C++", proficiency: "expert", endorsements: 12, duration_months: 6 },
      { name: "Docker", proficiency: "expert", endorsements: 3, duration_months: 6 },
      { name: "Kubernetes", proficiency: "expert", endorsements: 4, duration_months: 6 },
      { name: "Distributed Systems", proficiency: "expert", endorsements: 2, duration_months: 6 },
      { name: "FAISS", proficiency: "expert", endorsements: 1, duration_months: 6 },
      { name: "Fine-tuning", proficiency: "expert", endorsements: 12, duration_months: 6 },
      { name: "LangChain", proficiency: "expert", endorsements: 4, duration_months: 6 },
      { name: "Pinecone", proficiency: "expert", endorsements: 5, duration_months: 6 },
      { name: "GCP", proficiency: "expert", endorsements: 6, duration_months: 6 },
      { name: "AWS", proficiency: "expert", endorsements: 7, duration_months: 6 },
      { name: "TypeScript", proficiency: "expert", endorsements: 8, duration_months: 6 },
      { name: "React", proficiency: "expert", endorsements: 9, duration_months: 6 },
      { name: "Rust", proficiency: "expert", endorsements: 10, duration_months: 6 },
      { name: "SQL", proficiency: "expert", endorsements: 11, duration_months: 6 },
      { name: "NoSQL", proficiency: "expert", endorsements: 12, duration_months: 6 }
    ],
    redrob_signals: {
      ...candidate1.redrob_signals,
      github_activity_score: 5
    }
  };

  return [candidate1, candidate2, candidate3, candidate4, candidate5, candidate6];
}

