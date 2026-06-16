import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, Search, Sparkles, Sliders, AlertTriangle, ShieldCheck, 
  MapPin, CheckCircle2, ChevronRight, BarChart3, Database, 
  UserCheck, RefreshCw, Layers, Zap, Info, Filter, ArrowUpRight, Grid, List,
  Download, X, Check
} from "lucide-react";

import { ScoredCandidate, JobBlueprint } from "./types";
import { defaultJobBlueprint } from "./ranking";
import CandidateModal from "./components/CandidateModal";
import RoleBlueprints from "./components/RoleBlueprints";
import AnalyticsCharts from "./components/AnalyticsCharts";
import SecureIngestionPanel from "./components/SecureIngestionPanel";
import CandidateIntelligenceConfig from "./components/CandidateIntelligenceConfig";

export default function App() {
  const [flowStep, setFlowStep] = useState<"welcome" | "config" | "dashboard">("welcome");
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineStateMsg, setPipelineStateMsg] = useState("");
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);

  const executeRankingPipeline = async (config: {
    targetProfileTitle: string;
    minExperience: number;
    maxExperience: number;
    riskFactor: number;
    weights: JobBlueprint["weights"];
    datasetFile: { name: string; size: number; content: string; isSimulated: boolean } | null;
    jdFile: { name: string; content: string; size: number } | null;
  }) => {
    setIsPipelineRunning(true);
    setPipelineProgress(5);
    setPipelineStateMsg("Synchronizing role blueprint configurations...");

    try {
      // 1. Post configured blueprint
      const bpRes = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprint: {
            title: config.targetProfileTitle,
            minExperience: config.minExperience,
            maxExperience: config.maxExperience,
            riskSensitivity: config.riskFactor,
            weights: config.weights
          }
        })
      });
      if (!bpRes.ok) throw new Error("Failed to configure blueprint parameters.");

      // 2. Ingest Job Description
      if (config.jdFile) {
        setPipelineProgress(20);
        setPipelineStateMsg("Parsing target job description semantic anchors...");
        const jdRes = await fetch("/api/upload-jd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: config.jdFile.name,
            fileContent: config.jdFile.content,
            fileSize: config.jdFile.size
          })
        });
        if (!jdRes.ok) throw new Error("Failed to parse Job Description file.");
      }

      // 3. Ingest candidate dataset
      if (config.datasetFile) {
        setPipelineProgress(40);
        setPipelineStateMsg("Initializing dataset ingestion streams...");
        const ingestRes = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: config.datasetFile.name,
            fileContent: config.datasetFile.content,
            fileSize: config.datasetFile.size,
            isSimulated: config.datasetFile.isSimulated
          })
        });
        const ingestData = await ingestRes.json();
        if (!ingestData.success) {
          throw new Error(ingestData.error || "Dataset ingestion failed boundary scanner checks.");
        }

        // Poll for completion of the ingestion job
        setPipelineProgress(50);
        setPipelineStateMsg("Validating schema fields & scanning timeline integrity...");
        
        let polledState = "pending";
        while (polledState !== "completed" && polledState !== "failed") {
          await new Promise(resolve => setTimeout(resolve, 400));
          const statusRes = await fetch("/api/job-status");
          const statusData = await statusRes.json();
          polledState = statusData.state;
          
          if (polledState === "failed") {
            throw new Error("Data integrity scan rejected the candidate dataset.");
          }
          
          if (statusData.state === "validating") {
            setPipelineProgress(65);
            setPipelineStateMsg("Evaluating chronological resume stability indices...");
          } else if (statusData.state === "processing") {
            setPipelineProgress(75);
            setPipelineStateMsg("Extracting technical skill competency matrices...");
          } else if (statusData.state === "ranking") {
            setPipelineProgress(85);
            setPipelineStateMsg("Executing vector proximity matches & auditing traps...");
          }
        }
      }

      // 4. Trigger rank calculation
      setPipelineProgress(90);
      setPipelineStateMsg("Compiling final candidate dossiers and export ledger...");
      const rankRes = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const rankData = await rankRes.json();
      if (!rankData.success) {
        throw new Error(rankData.error || "Failed final rank scoring execution.");
      }

      setPipelineProgress(100);
      setPipelineStateMsg("AI scoring and rank matching complete!");
      
      // Update local React app states
      setScoredCandidates(rankData.data);
      setRetrievalMetrics(rankData.metrics);
      setBlueprint(rankData.blueprint);
      
      setTimeout(() => {
        setFlowStep("dashboard");
        setIsPipelineRunning(false);
      }, 500);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "An unexpected pipeline execution error occurred.");
      setIsPipelineRunning(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "security">("dashboard");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const [loading, setLoading] = useState(true);
  const [scoredCandidates, setScoredCandidates] = useState<ScoredCandidate[]>([]);
  const [retrievalMetrics, setRetrievalMetrics] = useState({ ndcg: 0.942, map: 0.891, mrr: 0.95 });
  const [blueprint, setBlueprint] = useState<JobBlueprint | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  
  // Filters state
  const [globalSearch, setGlobalSearch] = useState("");
  const [showTraps, setShowTraps] = useState(true);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [onlyOpenToWork, setOnlyOpenToWork] = useState(false);
  
  // Candidate dossier modal state
  const [selectedCandidate, setSelectedCandidate] = useState<ScoredCandidate | null>(null);

  // Export Compliance Guard Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportReport, setExportReport] = useState<any | null>(null);
  const [exportCSVContent, setExportCSVContent] = useState("");
  const [exportChecksum, setExportChecksum] = useState("");
  const [exportError, setExportError] = useState("");

  const handleValidateAndDownloadSubmissionCSV = async () => {
    setExportError("");
    setExportCSVContent("");
    setExportChecksum("");
    
    if (scoredCandidates.length === 0) {
      setExportError("Compliance check aborted: No candidate scores have been calculated yet.");
      setExportReport({
        isValid: false,
        countCheck: { success: false, message: "Candidate roster count is 0/100." },
        sequentialRankCheck: { success: false, message: "Sequential rankings cannot be calculated on empty sets." },
        uniquenessCheck: { success: false, message: "No profiles loaded to scan for ID collisions." },
        scoreOrderCheck: { success: false, message: "Dynamic score order evaluation failed." },
        reasoningCheck: { success: false, message: "No reasoning text found." }
      });
      setShowExportModal(true);
      return;
    }

    // Always validate the top 100 overall candidates for the official submission file
    const targetList = scoredCandidates.slice(0, 100);

    const countCheck = {
      success: targetList.length === 100,
      message: targetList.length === 100 
        ? "Exact 100-profile cluster successfully compiled." 
        : `Non-compliant roster count: Detected ${targetList.length}/100 rows. Ingest full candidates file.`
    };

    let ordinalBreak = false;
    for (let i = 0; i < targetList.length; i++) {
      if (targetList[i].rank !== i + 1) {
        ordinalBreak = true;
        break;
      }
    }
    const sequentialRankCheck = {
      success: !ordinalBreak && targetList.length > 0,
      message: !ordinalBreak && targetList.length > 0
        ? "Sequential rank continuity checked from 1 to 100."
        : "Sequential ranks mismatch. Please re-run ranking pipeline."
    };

    const uniqueIds = new Set<string>();
    let duplicateFound = false;
    for (const c of targetList) {
      if (uniqueIds.has(c.candidate.candidate_id)) {
        duplicateFound = true;
      }
      uniqueIds.add(c.candidate.candidate_id);
    }
    const uniquenessCheck = {
      success: !duplicateFound && targetList.length > 0,
      message: !duplicateFound && targetList.length > 0
        ? "Uniqueness clean: Zero colliding candidate ID fingerprints detected."
        : "Collision alert: Duplicate candidate IDs detected."
    };

    let scoreBroken = false;
    for (let i = 1; i < targetList.length; i++) {
      if (targetList[i].scores.finalScore > targetList[i - 1].scores.finalScore) {
        scoreBroken = true;
        break;
      }
    }
    const scoreOrderCheck = {
      success: !scoreBroken && targetList.length > 0,
      message: !scoreBroken && targetList.length > 0
        ? "Monotonically non-increasing score order verified ✓"
        : "Order regression detected: Lower rank has higher score."
    };

    let missingReasoning = false;
    for (const c of targetList) {
      if (!c.aiExplanation?.recommendation || c.aiExplanation.recommendation.trim().length === 0) {
        missingReasoning = true;
        break;
      }
    }
    const reasoningCheck = {
      success: !missingReasoning && targetList.length > 0,
      message: !missingReasoning && targetList.length > 0
        ? "Human-style decision descriptions fully generated for all 100 entries."
        : "Failed: Missing critical justification reasoning in some candidates."
    };

    const isValid = countCheck.success && sequentialRankCheck.success && uniquenessCheck.success && scoreOrderCheck.success && reasoningCheck.success;

    const report = {
      isValid,
      countCheck,
      sequentialRankCheck,
      uniquenessCheck,
      scoreOrderCheck,
      reasoningCheck
    };

    setExportReport(report);
    setShowExportModal(true);

    if (isValid) {
      try {
        const res = await fetch("/api/verify-export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId: currentRunId || null,
            scoredCandidates: targetList
          })
        });
        if (res.ok) {
          const data = await res.json();
          setExportCSVContent(data.csv);
          setExportChecksum(data.integrityChecksum);
        } else {
          const err = await res.json();
          setExportError(err.error || "Compliance API rejected generated data.");
        }
      } catch (e: any) {
        setExportError("Failed connecting to secure verification API: " + e.message);
      }
    }
  };

  const handleDownloadCSVContent = () => {
    if (!exportCSVContent) return;
    const blob = new Blob([exportCSVContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "submission.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch active run ID
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/job-status");
        const data = await res.json();
        setCurrentRunId(data.runId);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStatus();
  }, [scoredCandidates]);

  // Fetch initial rank on boot
  const fetchRankedData = async (customBlueprint?: JobBlueprint) => {
    setLoading(true);
    try {
      const response = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customBlueprint ? { blueprint: customBlueprint } : {})
      });
      const data = await response.json();
      if (data.success) {
        setScoredCandidates(data.data);
        setRetrievalMetrics(data.metrics);
        setBlueprint(data.blueprint);
      }
    } catch (error) {
      console.error("Failed to load candidate metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankedData();
  }, []);

  const handleUpdateBlueprint = (updated: JobBlueprint) => {
    setBlueprint(updated);
  };

  const handleTriggerRank = () => {
    if (blueprint) {
      fetchRankedData(blueprint);
    }
  };

  // Filter implementation
  const filteredCandidates = scoredCandidates.filter((item) => {
    if (!item || !item.candidate) return false;
    
    // 1. Text overlap
    const searchString = (
      (item.candidate.profile?.anonymized_name || "") + " " +
      (item.candidate.profile?.headline || "") + " " +
      (item.candidate.profile?.summary || "") + " " +
      (item.candidate.candidate_id || "")
    ).toLowerCase();
    
    if (globalSearch && !searchString.includes(globalSearch.toLowerCase())) {
      return false;
    }

    // 2. Traps visibility
    const isTrap = (item.scores?.trapRiskScore ?? 0) > 35;
    if (!showTraps && isTrap) return false;

    // 3. Work mode filter
    if (selectedWorkMode !== "all" && item.candidate.redrob_signals?.preferred_work_mode !== selectedWorkMode) {
      return false;
    }

    // 4. Open-to-work filter
    if (onlyOpenToWork && !item.candidate.redrob_signals?.open_to_work_flag) {
      return false;
    }

    return true;
  });

  const matchedCount = filteredCandidates.filter(c => (c?.scores?.trapRiskScore ?? 0) <= 35).length;
  const trapCount = filteredCandidates.filter(c => (c?.scores?.trapRiskScore ?? 0) > 35).length;
  const averageMatch = Math.round(
    filteredCandidates.length > 0
      ? filteredCandidates.reduce((sum, item) => sum + (item?.scores?.finalScore ?? 0), 0) / filteredCandidates.length
      : 0
  );

  // Splash Screen render
  if (flowStep === "welcome") {
    return (
      <div className="relative min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center overflow-hidden p-6 font-sans">
        {/* Abstract neural matrix background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative text-center max-w-2xl z-10 space-y-6 px-4">
          {/* Logo badge with micro particle glow */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-mono text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.15)] mb-3"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            SYNAPSE SYSTEMS INTEL
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            SYNAPSE <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">HIRE</span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-base md:text-lg text-slate-400 max-w-lg mx-auto font-sans leading-relaxed"
          >
            "Hire the right talent beyond keywords." Evolve from keyword-stuffing ATS matching to semantic behavioral intelligence.
          </motion.p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-4"
          >
            <button
              onClick={() => setFlowStep("config")}
              className="rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold px-8 py-3.5 text-sm tracking-wide shadow-2xl transition-transform hover:scale-105 duration-200 cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              Analyze Resume
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        {/* Humble footer */}
        <div className="absolute bottom-6 text-[10px] text-slate-400 font-mono tracking-widest uppercase">
          Redrob AI Discovery Challenge • Version 2026.1
        </div>
      </div>
    );
  }

  // Configuration Page render
  if (flowStep === "config") {
    return (
      <>
        <CandidateIntelligenceConfig 
          initialBlueprint={blueprint || defaultJobBlueprint}
          onStartRanking={executeRankingPipeline}
          onBack={() => setFlowStep("welcome")}
        />

        {/* Fullscreen premium pipeline progress loader overlay */}
        {isPipelineRunning && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="relative max-w-md w-full rounded-3xl border border-white/12 bg-slate-900/60 p-8 shadow-2xl text-center space-y-6 overflow-hidden">
              {/* Highlight Streak */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                <RefreshCw className="h-7 w-7 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-sans">Running AI Ranking Pipeline</h3>
                <p className="text-xs text-slate-400 font-mono leading-normal min-h-[32px] flex items-center justify-center">
                  {pipelineStateMsg}
                </p>
              </div>

              {/* Loading progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full" 
                    style={{ width: `${pipelineProgress}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>PIPELINE OVERLAY ACTIVE</span>
                  <span>{pipelineProgress}% COMPLETE</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Global abstract mesh/glow accents */}
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* Modern navigation bar */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer" onClick={() => setFlowStep("welcome")}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white p-1">
              <Zap className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-sm font-mono text-white">SYNAPSE HIRE</span>
              <p className="text-[10px] text-slate-400 font-sans tracking-tight">AI Talent Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all ${activeTab === "dashboard" ? 'bg-white/10 text-white font-bold border border-white/15 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Control Deck
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all ${activeTab === "analytics" ? 'bg-white/10 text-white font-bold border border-white/15 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Vector Space
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all ${activeTab === "security" ? 'bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/25 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Assurance Suite
            </button>
            <button
              onClick={() => setFlowStep("config")}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/10 bg-white/5"
            >
              Configure Role
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* TAB 1: DASHBOARD CONTROL DECK */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column — Job blueprint tuning interface */}
            <div className="lg:col-span-4">
              {blueprint ? (
                <RoleBlueprints 
                  blueprint={blueprint} 
                  onUpdateBlueprint={handleUpdateBlueprint} 
                  onTriggerRank={handleTriggerRank} 
                />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 flex flex-col justify-center h-48 items-center text-slate-500 font-mono text-xs">
                  <RefreshCw className="h-5 w-5 animate-spin mb-2" />
                  Loading parameters...
                </div>
              )}
            </div>

            {/* Right Column — Main dynamic ranks and dashboard telemetry */}
            <div className="lg:col-span-8 space-y-6">

              {/* Staged metrics overview deck */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:p-5 backdrop-blur-md">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-slate-400" /> Matches
                  </div>
                  <div className="text-xl md:text-3xl font-extrabold text-slate-200 mt-1">{matchedCount}</div>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">Audit verified stars</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:p-5 backdrop-blur-md">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-rose-500" /> Traps flagged
                  </div>
                  <div className="text-xl md:text-3xl font-extrabold text-rose-400 mt-1">{trapCount}</div>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">Penalized profiles</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:p-5 backdrop-blur-md">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1">
                    <Layers className="h-3 w-3 text-indigo-400" /> Average Match
                  </div>
                  <div className="text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mt-1">{averageMatch}%</div>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">Unified dynamic threshold</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:p-5 backdrop-blur-md">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1">
                    <BarChart3 className="h-3 w-3 text-emerald-400" /> MAP Rating
                  </div>
                  <div className="text-xl md:text-3xl font-extrabold text-emerald-400 mt-1">
                    {retrievalMetrics.map}
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">NDCG: {retrievalMetrics.ndcg} • MRR: {retrievalMetrics.mrr}</p>
                </div>
              </div>

              {/* Intelligence Control strip & Filters */}
              <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                
                {/* Search box */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Search candidate profiles by ID, summary or keywords..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-all font-sans"
                  />
                </div>

                {/* Filter chip controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setOnlyOpenToWork(!onlyOpenToWork)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono whitespace-nowrap transition-colors ${onlyOpenToWork ? 'bg-purple-500/15 border-purple-500/30 text-purple-400 font-bold' : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-slate-200'}`}
                    >
                      Open to Work
                    </button>
                    
                    <button
                      onClick={() => setShowTraps(!showTraps)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono whitespace-nowrap transition-colors flex items-center gap-1 ${showTraps ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold' : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-slate-200'}`}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Show Traps
                    </button>
                  </div>

                  <select
                    value={selectedWorkMode}
                    onChange={(e) => setSelectedWorkMode(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.25 text-[11px] text-slate-400 font-mono focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Modes</option>
                    <option value="remote">Remote Prefix</option>
                    <option value="hybrid">Hybrid Pivot</option>
                    <option value="onsite">Onsite Focus</option>
                  </select>

                  <div className="flex border border-white/10 rounded-lg  bg-slate-950/80 p-0.5">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1 rounded ${viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500"}`}
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1 rounded ${viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-500"}`}
                    >
                      <Grid className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Rankings list holder */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 bg-slate-950/40 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">Staged Evaluation rankings</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-slate-500">Showing {filteredCandidates.length} evaluated dossiers</p>
                      {currentRunId && (
                        <span className="inline-flex items-center gap-1 py-0.25 px-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-400">
                          <CheckCircle2 className="h-2.5 w-2.5" /> ID Verified Run
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleValidateAndDownloadSubmissionCSV}
                      className="rounded bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1 text-[10px] font-mono text-slate-950 font-extrabold flex items-center gap-1 cursor-pointer select-none transition-colors"
                    >
                      <Download className="h-3 w-3 animate-pulse" /> Download Submission CSV
                    </button>
                    <button
                      onClick={() => setActiveTab("security")}
                      className="rounded bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 text-[10px] font-mono text-indigo-400 font-bold border border-indigo-500/20 flex items-center gap-1 cursor-pointer select-none"
                    >
                      <ShieldCheck className="h-3 w-3" /> Secure Ingest/Export
                    </button>
                    <span className="hidden md:inline text-[9px] font-mono text-slate-500">Sorted by dynamic score</span>
                  </div>
                </div>

                {loading ? (
                  <div className="py-24 flex flex-col items-center justify-center text-xs font-mono text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mb-3 text-purple-500" />
                    Recalculating spatial parameters & ranks...
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="py-24 text-center text-xs font-mono text-slate-500">
                    No matching candidate profiles conform with active filter arrays.
                  </div>
                ) : viewMode === "list" ? (
                  // LIST VIEW
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left font-sans text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-950/20">
                          <th className="px-5 py-3 w-16">Rank</th>
                          <th className="px-5 py-3">Profile Identity</th>
                          <th className="px-5 py-3 w-32">Weights Matrix</th>
                          <th className="px-5 py-3 w-28">Risk Factor</th>
                          <th className="px-5 py-3">Verdict</th>
                          <th className="px-5 py-3 w-24 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredCandidates.map((item) => {
                          const isTrap = item.scores.trapRiskScore > 35;
                          const isStar = item.scores.finalScore >= 80;

                          return (
                            <tr 
                              key={item.candidate.candidate_id}
                              className={`group hover:bg-white-5 transition-colors ${isTrap ? 'border-l-2 border-l-rose-500/60 bg-rose-500/2' : ''}`}
                            >
                              <td className="px-5 py-4 font-mono text-slate-400">
                                <span className={`inline-flex items-center justify-center h-6 w-6 rounded-md font-bold text-xs ${isTrap ? "bg-rose-500/10 text-rose-400" : isStar ? "bg-purple-500/20 text-purple-300 border border-purple-500/20" : "bg-white/5 text-slate-300"}`}>
                                  #{item.rank}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
                                      {item.candidate.profile.anonymized_name}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-500 px-1.5 py-0.25 bg-slate-950 border border-white/5 rounded">
                                      {item.candidate.candidate_id}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                                    {item.candidate.profile.headline}
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <div className="h-1.5 w-24 bg-slate-950 rounded-full overflow-hidden">
                                    <div className={`h-full ${isTrap ? 'bg-rose-500' : isStar ? 'bg-purple-500' : 'bg-indigo-500'}`} style={{ width: `${item.scores.finalScore}%` }} />
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-300 font-bold">{item.scores.finalScore}% Match</div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                {isTrap ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-bold">
                                    <AlertTriangle className="h-3 w-3" /> Flagged Trap {item.scores.trapRiskScore}%
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    <ShieldCheck className="h-3 w-3" /> Trustworthy {item.scores.trapRiskScore}%
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-[10.5px] italic text-slate-400 truncate max-w-[190px]">
                                  "{item.aiExplanation.recommendation}"
                                </p>
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  onClick={() => setSelectedCandidate(item)}
                                  className="inline-flex items-center gap-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.25 text-[10px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer font-bold uppercase tracking-wider"
                                >
                                  Open dossier
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // GRID VIEW
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                    {filteredCandidates.map((item) => {
                      const isTrap = item.scores.trapRiskScore > 35;
                      const isStar = item.scores.finalScore >= 80;

                      return (
                        <div
                          key={item.candidate.candidate_id}
                          className={`rounded-2xl border bg-slate-950/40 p-5 flex flex-col justify-between hover:bg-slate-900/30 transition-all ${isTrap ? 'border-rose-500/30 ring-1 ring-rose-500/10 bg-rose-500/1' : 'border-white/10'}`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`inline-flex items-center justify-center text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isTrap ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : isStar ? "bg-purple-500/25 text-purple-300 border border-purple-500/20" : "bg-white/5 text-slate-400"}`}>
                                RANK #{item.rank}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">{item.candidate.candidate_id}</span>
                            </div>

                            <div>
                              <h4 className="font-bold text-sm text-slate-200">{item.candidate.profile.anonymized_name}</h4>
                              <p className="text-xs text-purple-400 font-mono line-clamp-1 mt-0.5">{item.candidate.profile.headline}</p>
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {item.candidate.profile.summary}
                            </p>

                            <div className="flex items-center gap-4 border-t border-white/5 pt-3">
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Match Rating</span>
                                <div className="text-xs font-bold font-mono text-slate-200">{item.scores.finalScore}%</div>
                              </div>
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Exp tenure</span>
                                <div className="text-xs font-bold font-mono text-slate-200">{item.candidate.profile.years_of_experience} yrs</div>
                              </div>
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Trust Risk</span>
                                <div className={`text-xs font-bold font-mono ${isTrap ? "text-rose-400" : "text-emerald-400"}`}>
                                  {item.scores.trapRiskScore}%
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedCandidate(item)}
                            className="w-full text-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono py-2 mt-4 text-slate-300 hover:text-white transition-all cursor-pointer font-bold uppercase tracking-wider"
                          >
                            OPEN INTELLIGENCE DOSSIER
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VECTOR CLUSTER ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-pulse-once">
            {/* Context Notice */}
            <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-4 flex items-start gap-4">
              <Info className="h-5 w-5 shrink-0 text-indigo-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest mb-0.5">Stage 3 — Vector Space Retrieval Analytics</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Interactive bento charts plotting candidate embeddings proximity. Move slider weights in the Control deck, to see relevant score vectors transform dynamically across clusters. Click on any spatial point in the quadrant to inspect their dossier.
                </p>
              </div>
            </div>

            <AnalyticsCharts 
              scoredCandidates={scoredCandidates} 
              onOpenCandidate={(c) => setSelectedCandidate(c)} 
            />
          </div>
        )}

        {/* TAB 3: ENTERPRISE SECURITY & ASSURANCE SUITE */}
        {activeTab === "security" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <SecureIngestionPanel 
              scoredCandidates={scoredCandidates} 
              blueprint={blueprint} 
              onRefreshData={() => fetchRankedData(blueprint || undefined)} 
            />
          </motion.div>
        )}
      </main>

      {/* Floating Dossier drawer triggers */}
      <CandidateModal 
        scoredCandidate={selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
      />

      {/* Dynamic Export Compliance Modal */}
      <AnimatePresence>
        {showExportModal && exportReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-xl w-full rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-6 overflow-hidden text-left"
            >
              {/* Decorative side accent */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />
              
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">Synapse Compliance Engine</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans mt-1">Regulatory Submission CSV Validator</h3>
                </div>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  The Redrob Data & AI Challenge requires top-tier audit rigour. Before exporting, our failsafe suite scans the evaluation dossier for 5 critical regulatory conditions:
                </p>

                {/* Audit checklist */}
                <div className="space-y-3 rounded-xl border border-white/5 bg-slate-950/40 p-4 font-mono text-[11px]">
                  
                  {/* Condition 1 */}
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${exportReport.countCheck.success ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {exportReport.countCheck.success ? <Check className="h-2.5 w-2.5 font-bold" /> : <X className="h-2.5 w-2.5 font-bold" />}
                    </div>
                    <div>
                      <span className={`font-bold uppercase ${exportReport.countCheck.success ? "text-emerald-400" : "text-rose-400"}`}>[P0] Target count check</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">{exportReport.countCheck.message}</p>
                    </div>
                  </div>

                  {/* Condition 2 */}
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${exportReport.sequentialRankCheck.success ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {exportReport.sequentialRankCheck.success ? <Check className="h-2.5 w-2.5 font-bold" /> : <X className="h-2.5 w-2.5 font-bold" />}
                    </div>
                    <div>
                      <span className={`font-bold uppercase ${exportReport.sequentialRankCheck.success ? "text-emerald-400" : "text-rose-400"}`}>[P0] Rank continuity sequencing</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">{exportReport.sequentialRankCheck.message}</p>
                    </div>
                  </div>

                  {/* Condition 3 */}
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${exportReport.uniquenessCheck.success ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {exportReport.uniquenessCheck.success ? <Check className="h-2.5 w-2.5 font-bold" /> : <X className="h-2.5 w-2.5 font-bold" />}
                    </div>
                    <div>
                      <span className={`font-bold uppercase ${exportReport.uniquenessCheck.success ? "text-emerald-400" : "text-rose-400"}`}>[P0] Collision-free unique IDs</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">{exportReport.uniquenessCheck.message}</p>
                    </div>
                  </div>

                  {/* Condition 4 */}
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${exportReport.scoreOrderCheck.success ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {exportReport.scoreOrderCheck.success ? <Check className="h-2.5 w-2.5 font-bold" /> : <X className="h-2.5 w-2.5 font-bold" />}
                    </div>
                    <div>
                      <span className={`font-bold uppercase ${exportReport.scoreOrderCheck.success ? "text-emerald-400" : "text-rose-400"}`}>[P1] Non-regression score sort</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">{exportReport.scoreOrderCheck.message}</p>
                    </div>
                  </div>

                  {/* Condition 5 */}
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${exportReport.reasoningCheck.success ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {exportReport.reasoningCheck.success ? <Check className="h-2.5 w-2.5 font-bold" /> : <X className="h-2.5 w-2.5 font-bold" />}
                    </div>
                    <div>
                      <span className={`font-bold uppercase ${exportReport.reasoningCheck.success ? "text-emerald-400" : "text-rose-400"}`}>[P1] Decision justification check</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">{exportReport.reasoningCheck.message}</p>
                    </div>
                  </div>

                </div>

                {exportError && (
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] font-mono text-rose-400 flex items-start gap-2 leading-relaxed">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{exportError}</span>
                  </div>
                )}
              </div>

              {exportReport.isValid ? (
                <div className="space-y-4">
                  <div className="p-3 border border-indigo-500/10 rounded-xl bg-slate-950/45 space-y-1 text-[10px] font-mono font-sans">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Integrity SHA256 Hash:</span>
                      <span className="text-emerald-400 font-bold tracking-tight">{exportChecksum ? `${exportChecksum.substring(0, 24)}...` : "Signing CSV content..."}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Verification Target:</span>
                      <span>exactly 100 rows</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Certified Status:</span>
                      <span className="text-emerald-400 font-bold">SEALED AGAINST TAMPERING</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDownloadCSVContent}
                      disabled={!exportCSVContent}
                      className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 disabled:text-emerald-950/60 transition-colors text-slate-950 font-extrabold py-3 text-xs tracking-wider cursor-pointer font-sans text-center select-none shadow-lg hover:shadow-emerald-500/10 uppercase"
                    >
                      {exportCSVContent ? "Download validated submission.csv" : "Signing CSV with keys..."}
                    </button>
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-bold px-4 py-3 text-xs tracking-wider transition-all cursor-pointer select-none"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-4 text-xs font-sans leading-relaxed text-rose-300">
                    <span className="font-bold flex items-center gap-1.5 uppercase text-rose-400 mb-1">
                      <AlertTriangle className="h-4 w-4 text-rose-400" /> Actions Required to Pass Audit:
                    </span>
                    One or more critical P0 checks failed. If your currently processed candidate pool has not hit 100 entries, please head over to the <span className="font-bold text-white uppercase decoration-indigo-400 font-mono">Assurance Suite</span> tab, and perform a secure dataset file upload (.jsonl or simulated enterprise trigger) to complete the 100,000 candidate ranking run.
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowExportModal(false);
                        setActiveTab("security");
                      }}
                      className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-bold py-3 text-xs tracking-wider cursor-pointer font-sans text-center uppercase"
                    >
                      Execute pipeline under Assurance Suite
                    </button>
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-bold px-4 py-3 text-xs tracking-wider transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium responsive system footer */}
      <footer className="border-t border-white/10 bg-slate-950 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All spatial nodes indexed</span>
          </div>
          <div>CPU Fast Hybrid scoring algorithm ready. © 2026 Synapse Hire Systems.</div>
        </div>
      </footer>
    </div>
  );
}
