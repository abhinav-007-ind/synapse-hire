import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Award, Briefcase, Calendar, MapPin, ShieldAlert, Sparkles, User, CheckCircle2, AlertTriangle, Send, Cpu, Check, HelpCircle, FileText } from "lucide-react";
import { ScoredCandidate } from "../types";

interface CandidateModalProps {
  scoredCandidate: ScoredCandidate | null;
  onClose: () => void;
}

export default function CandidateModal({ scoredCandidate, onClose }: CandidateModalProps) {
  const [auditNotes, setAuditNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  if (!scoredCandidate) return null;

  const { candidate, scores, aiExplanation } = scoredCandidate;

  const handleTriggerAudit = async () => {
    setLoading(true);
    setAuditResult(null);
    setLoadingStep(0);

    const steps = [
      "De-obfuscating resume keyword clusters...",
      "Syncing engineering commits & activity...",
      "Cross-referencing behavioral timeline stability...",
      "Synthesizing founding executive-match recommendation..."
    ];

    const timer = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 1100);

    try {
      const res = await fetch("/api/audit-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.candidate_id,
          customNotes: auditNotes
        })
      });
      const data = await res.json();
      if (data.evaluation) {
        setAuditResult(data.evaluation.rawText);
      } else {
        setAuditResult("Failed to retrieve an intelligent audit review. Please try again.");
      }
    } catch (err: any) {
      setAuditResult(`Audit extraction error: ${err.message || "Unknown anomaly"}`);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const stepsText = [
    "De-obfuscating resume keyword clusters...",
    "Syncing engineering commits & activity...",
    "Cross-referencing behavioral timeline stability...",
    "Synthesizing founding executive-match recommendation..."
  ];

  // Helper for responsive custom SVG Skill Radar
  const radarSkills = candidate.skills.slice(0, 5);
  const angleStep = (2 * Math.PI) / radarSkills.length;
  const radarPoints = radarSkills.map((skill, index) => {
    const valueMap: Record<string, number> = { beginner: 35, intermediate: 60, advanced: 85, expert: 100 };
    const radius = valueMap[skill.proficiency] || 50;
    const angle = index * angleStep - Math.PI / 2;
    const x = 120 + (radius * 0.8) * Math.cos(angle);
    const y = 120 + (radius * 0.8) * Math.sin(angle);
    return { x, y, name: skill.name };
  });

  const radarPath = radarPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end" id="modal-container">
        {/* Backdrop overlay */}
        <motion.div
          id="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Drawer */}
        <motion.div
          id="modal-drawer"
          initial={{ x: "100%", opacity: 0.9 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="relative h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl md:p-8 text-white flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">{candidate.profile.anonymized_name}</h2>
                  <span className="rounded-full bg-slate-900 border border-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                    {candidate.candidate_id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{candidate.profile.headline}</p>
              </div>
            </div>

            <button
              id="close-modal-btn"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-8 flex-1">
            {/* Top Stat Overview Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-white/5 bg-white-5 p-4 backdrop-blur-md">
                <div className="text-xs text-slate-400 font-mono">Match Score</div>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mt-1">
                  {scores.finalScore} / 100
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white-5 p-4 backdrop-blur-md">
                <div className="text-xs text-slate-400 font-mono">Experience</div>
                <div className="text-2xl font-bold mt-1 text-slate-200">
                  {candidate.profile.years_of_experience} Yrs
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white-5 p-4 backdrop-blur-md">
                <div className="text-xs text-slate-400 font-mono">Semantic Overlap</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {scores.semanticMatch}%
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white-5 p-4 backdrop-blur-md">
                <div className="text-xs text-slate-400 font-mono">Trap Risk Score</div>
                <div className={`text-2xl font-bold mt-1 ${scores.trapRiskScore > 35 ? 'text-rose-400' : scores.trapRiskScore > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {scores.trapRiskScore}%
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <h3 className="text-sm font-semibold text-slate-300 font-mono mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-purple-400" />
                Professional Summary Intelligence
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">{candidate.profile.summary}</p>
            </div>

            {/* Trajectory & Radar split view */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Skills & Custom SVG Radar */}
              <div className="md:col-span-5 rounded-2xl border border-white/10 bg-slate-900/40 p-5 flex flex-col items-center">
                <h3 className="text-sm font-semibold text-slate-300 font-mono mb-4 w-full flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-purple-400" />
                  Skill Topology Radar
                </h3>

                {radarSkills.length > 2 ? (
                  <div className="relative h-[240px] w-[240px] mb-4">
                    <svg className="w-full h-full" viewBox="0 0 240 240">
                      {/* Concentric rings */}
                      {[25, 50, 75, 100].map((ring, idx) => (
                        <circle
                          key={idx}
                          cx="120"
                          cy="120"
                          r={ring * 0.8}
                          fill="none"
                          stroke="rgba(255,255,255,0.06)"
                          strokeDasharray={idx === 3 ? "none" : "3,3"}
                        />
                      ))}
                      {/* Core axes */}
                      {radarSkills.map((_, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        return (
                          <line
                            key={i}
                            x1="120"
                            y1="120"
                            x2={120 + 80 * Math.cos(angle)}
                            y2={120 + 80 * Math.sin(angle)}
                            stroke="rgba(255,255,255,0.08)"
                          />
                        );
                      })}
                      {/* Skill Poly */}
                      <polygon
                        points={radarPath}
                        fill="rgba(147, 51, 234, 0.25)"
                        stroke="rgba(147, 51, 234, 0.7)"
                        strokeWidth="2"
                      />
                      {/* Axes points and annotations */}
                      {radarPoints.map((point, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        const labelX = 120 + 102 * Math.cos(angle);
                        const labelY = 120 + 102 * Math.sin(angle);
                        return (
                          <g key={i}>
                            <circle cx={point.x} cy={point.y} r="3" fill="#a855f7" />
                            <text
                              x={labelX}
                              y={labelY}
                              fill="#94a3b8"
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="middle"
                              alignmentBaseline="middle"
                            >
                              {point.name.length > 10 ? point.name.slice(0, 9) + ".." : point.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-slate-500 font-mono text-xs">
                    Insufficient skills listed to model radar.
                  </div>
                )}

                {/* Key Skills breakdown list */}
                <div className="w-full space-y-2 mt-2">
                  {candidate.skills.slice(0, 6).map((skill, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono py-1 border-b border-white/5">
                      <span className="text-slate-300">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 text-[10px] capitalize bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {skill.proficiency}
                        </span>
                        <span className="text-slate-500">{skill.endorsements} endorsements</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Career History Trajectory */}
              <div className="md:col-span-7 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                <h3 className="text-sm font-semibold text-slate-300 font-mono mb-4 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-purple-400" />
                  Chronological Career Trajectory
                </h3>

                <div className="relative pl-4 border-l border-white/10 space-y-6">
                  {candidate.career_history.map((job, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 rounded-full bg-purple-500 ring-4 ring-slate-950" />

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{job.title}</h4>
                          <p className="text-xs text-purple-400 font-mono mt-0.5">
                            {job.company} <span className="text-slate-500">• {job.company_size} • {job.industry}</span>
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap bg-white/5 px-2 py-1 rounded">
                          {job.duration_months} Mos - {job.is_current ? 'Active' : 'Ended'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{job.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Behavioral & Ecosystem Signals */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <h3 className="text-sm font-semibold text-slate-300 font-mono mb-4 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-purple-400" />
                Ecosystem Behavioral Diagnostics
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border-r border-white/15 pr-2">
                  <div className="text-[10px] text-slate-500 font-mono">Response Rate</div>
                  <div className="text-base font-bold text-slate-300 mt-0.5">
                    {Math.round((candidate.redrob_signals?.recruiter_response_rate ?? 0) * 100)}%
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">Avg {candidate.redrob_signals?.avg_response_time_hours ?? 0} hrs</div>
                </div>

                <div className="border-r border-white/15 pr-2">
                  <div className="text-[10px] text-slate-500 font-mono">GitHub Verification</div>
                  <div className="text-base font-bold text-slate-300 mt-0.5 flex items-center gap-1">
                    {(candidate.redrob_signals?.github_activity_score ?? -1) > -1 ? (
                      <>
                        <span className="text-emerald-400 font-mono">{Math.round(candidate.redrob_signals?.github_activity_score ?? 0)}%</span>
                      </>
                    ) : (
                      <span className="text-rose-400 text-xs">Unlinked</span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">Commits, star index</div>
                </div>

                <div className="border-r border-white/15 pr-2">
                  <div className="text-[10px] text-slate-500 font-mono">Notice Period</div>
                  <div className="text-base font-bold text-slate-300 mt-0.5">
                    {candidate.redrob_signals?.notice_period_days ?? 0} Days
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">Willing to relocate: {candidate.redrob_signals?.willing_to_relocate ? 'Y' : 'N'}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-mono">Work Mode Focus</div>
                  <span className="text-xs font-bold text-slate-300 mt-1 inline-block capitalize bg-white/5 py-0.5 px-2 rounded">
                    {candidate.redrob_signals?.preferred_work_mode ?? "unknown"}
                  </span>
                  <div className="text-[9px] text-slate-500 font-mono">LPA: {candidate.redrob_signals?.expected_salary_range_inr_lpa?.min ?? 0}L - {candidate.redrob_signals?.expected_salary_range_inr_lpa?.max ?? 0}L</div>
                </div>
              </div>
            </div>

            {/* Explainability Strengths & Weaknesses (recruiter reasoning) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
                <h4 className="text-emerald-400 font-mono text-xs font-bold mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Primary Strategic Strengths
                </h4>
                <ul className="text-xs space-y-2.5 text-slate-300 leading-relaxed font-sans">
                  {aiExplanation.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-5">
                <h4 className="text-rose-400 font-mono text-xs font-bold mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Primary Weaknesses & Anomalies
                </h4>
                <ul className="text-xs space-y-2.5 text-slate-300 leading-relaxed font-sans">
                  {aiExplanation.weaknesses.map((wk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 mt-0.5">•</span>
                      <span className={wk.includes("Audit") ? "text-rose-300 font-semibold" : ""}>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RECRUITER AI RECOMMENDATION SUMMARY */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
              <h4 className="text-slate-400 text-xs font-mono font-bold mb-2">Recruiter Fast Verdict</h4>
              <p className="text-sm italic leading-relaxed text-slate-300">"{aiExplanation.recommendation}"</p>
            </div>

            {/* DEEP AI RECRUITER AUDIT PANEL (Gemini powered module!) */}
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-slate-950 via-slate-900/40 to-slate-950 p-6 relative overflow-hidden" id="deep-ai-audit-panel">
              {/* Background accent glow */}
              <div className="absolute right-0 bottom-0 h-44 w-44 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-3">
                <Cpu className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold tracking-tight text-slate-200">Stage 5 deep audit — Deep AI Recruiter Audit</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Execute deep neural semantic checks via the latest server-side Google Gemini intelligence. Automatically parses their entire lifecycle, flags timeline traps, identifies CV fluff, and provides direct interview screening recommendations.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Focus Directives (Optional)</label>
                  <input
                    type="text"
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="e.g., Audit their search relevance metrics & vector load indexing knowledge..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleTriggerAudit}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:cursor-not-allowed transition-colors py-2.5 px-4 font-mono text-xs flex items-center justify-center gap-2 text-white font-bold"
                  >
                    {loading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Trigger Deep AI Recruiter Audit
                      </>
                    )}
                  </button>

                  {auditResult && (
                    <button
                      onClick={() => setAuditResult(null)}
                      className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-[10px] font-mono"
                    >
                      Clear Audit Log
                    </button>
                  )}
                </div>

                {/* Loading state showing funny reassuring diagnostic messages */}
                {loading && (
                  <div className="mt-4 p-4 rounded-xl bg-purple-950/20 border border-purple-500/10 flex flex-col items-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-center"
                    >
                      <p className="text-xs text-purple-300 font-mono">{stepsText[loadingStep]}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">Calculating semantic embeddings on CPU core...</p>
                    </motion.div>
                  </div>
                )}

                {/* Audit Result Markdown renderer */}
                {auditResult && (
                  <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 text-xs leading-relaxed space-y-4 font-sans text-left max-h-[400px] overflow-y-auto">
                    <div className="border-b border-white/5 pb-2 mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-purple-400" />
                        Audit Concluded successfully
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Gemini model output ready</span>
                    </div>

                    <div className="prose prose-invert prose-xs whitespace-pre-line">
                      {auditResult}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
