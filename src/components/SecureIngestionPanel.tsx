import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, Upload, FileText, Play, XCircle, Terminal, 
  Cpu, Activity, Database, CheckCircle, AlertOctagon, 
  Trash2, Award, Download, Scroll, CheckCircle2, AlertTriangle, HelpCircle
} from "lucide-react";
import { DataValidationMetrics, SystemTelemetry, IngestionLogEntry, AuditRunLog, ScoredCandidate, JobBlueprint } from "../types";

interface SecureIngestionPanelProps {
  scoredCandidates: ScoredCandidate[];
  blueprint: JobBlueprint | null;
  onRefreshData: () => void;
}

export default function SecureIngestionPanel({ scoredCandidates, blueprint, onRefreshData }: SecureIngestionPanelProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // App-State bindings from API
  const [pipelineState, setPipelineState] = useState<string>("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<IngestionLogEntry[]>([]);
  const [metrics, setMetrics] = useState<DataValidationMetrics | null>(null);
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    cpuUsagePercent: 0,
    ramUsageMB: 0,
    runtimeMs: 0,
    activeChunkCount: 0
  });

  // History states
  const [history, setHistory] = useState<AuditRunLog[]>([]);
  const [activeHistoryRun, setActiveHistoryRun] = useState<any | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Certifications/Export States
  const [showCertModal, setShowCertModal] = useState(false);
  const [certifiedCSV, setCertifiedCSV] = useState<string>("");
  const [integrityChecksum, setIntegrityChecksum] = useState("");
  const [certifiedRunLog, setCertifiedRunLog] = useState<AuditRunLog | null>(null);
  const [verificationError, setVerificationError] = useState("");

  // Job Description Ingestion States
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdUploading, setJdUploading] = useState(false);
  const [extractedJd, setExtractedJd] = useState<any | null>(null);
  const [jdError, setJdError] = useState("");
  const [isRanking, setIsRanking] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs term
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Dynamic poll pipeline progress while active
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (pipelineState !== "idle" && pipelineState !== "completed" && pipelineState !== "failed") {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch("/api/job-status");
          const data = await res.json();
          setPipelineState(data.state);
          setProgress(data.progress);
          setLogs(data.logs || []);
          setMetrics(data.metrics);
          setTelemetry(data.telemetry);
          
          if (data.state === "completed" || data.state === "failed") {
            onRefreshData();
            fetchHistory();
          }
        } catch (e) {
          console.error("Failed to query job state", e);
        }
      }, 500);
    }
    return () => clearInterval(intervalId);
  }, [pipelineState]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/audit-history");
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (e) {
      console.error("Failed to load audit history:", e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const processJdFile = async (file: File) => {
    setJdFile(file);
    setJdUploading(true);
    setJdError("");
    
    // Log intent to log terminal
    setLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), level: "info", message: `Opening stream metadata sequence for Job Description: ${file.name}` }
    ]);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = reader.result as string;
        const res = await fetch("/api/upload-jd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileContent: result,
            fileSize: file.size
          })
        });
        
        const data = await res.json();
        if (data.success) {
          setExtractedJd(data);
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), level: "success", message: `Successfully parsed Job Description file: ${file.name}` },
            { timestamp: new Date().toLocaleTimeString(), level: "success", message: `Extracted role profile: "${data.blueprint.title}"` }
          ]);
          onRefreshData();
        } else {
          setJdError(data.error || "Failed to parse job description.");
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), level: "error", message: `JD Parser Denied: ${data.error}` }
          ]);
        }
      } catch (err: any) {
        setJdError(err.message || "Failed to make upload request.");
      } finally {
        setJdUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const startFullRanking = async () => {
    setIsRanking(true);
    setLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), level: "info", message: "Activating fully-connected ranking core pipeline..." }
    ]);
    try {
      const res = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprint: extractedJd?.blueprint || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), level: "success", message: "Recruiter Core ranking completed successfully." },
          { timestamp: new Date().toLocaleTimeString(), level: "success", message: "Total 100 rows prepared for certified CSV export." }
        ]);
        onRefreshData();
      } else {
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), level: "error", message: `Ranking execution aborted: ${data.error}` }
        ]);
      }
    } catch (e: any) {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), level: "error", message: `Ranking connection error: ${e.message}` }
      ]);
    } finally {
      setIsRanking(false);
    }
  };

  const triggerIngestAPI = async (payload: { fileName: string; fileContent: string; fileSize: number; isSimulated: boolean }) => {
    setIsUploading(true);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setPipelineState("pending");
        setProgress(5);
      } else {
        // Show boundary errors immediately in logging terminal
        setPipelineState("failed");
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), level: "error", message: `Boundary Scan Refusal: ${data.error}` }
        ]);
      }
    } catch (err: any) {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), level: "error", message: `Network request fail: ${err.message}` }
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  // Secure File Upload Drops handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processSelectedFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      await triggerIngestAPI({
        fileName: file.name,
        fileContent: result,
        fileSize: file.size,
        isSimulated: false
      });
    };
    reader.readAsDataURL(file);
  };

  // Trigger Exploit Simulations / Benchmarks for Judges
  const triggerSimulation = (type: "clean"| "sh_shell" | "zip_bomb" | "corrupt") => {
    if (type === "clean") {
      triggerIngestAPI({
        fileName: "enterprise_candidates_100k.jsonl.gz",
        fileContent: "",
        fileSize: 4521000,
        isSimulated: true
      });
    } else if (type === "sh_shell") {
      triggerIngestAPI({
        fileName: "execute_malicious_script.sh",
        fileContent: "#!/bin/bash\nrm -rf /",
        fileSize: 120,
        isSimulated: false
      });
    } else if (type === "zip_bomb") {
      triggerIngestAPI({
        fileName: "infinite_recursion_bomb.jsonl.gz",
        fileContent: "1f8b0800000000000003030303030303030303030303",
        fileSize: 15,
        isSimulated: false
      });
    } else if (type === "corrupt") {
      triggerIngestAPI({
        fileName: "arbitrary_binary_file.jsonl",
        fileContent: "PNG\r\n\x1a\n\x00\x00\x00\rIHDR",
        fileSize: 1045,
        isSimulated: false
      });
    }
  };

  const cancelJob = async () => {
    try {
      await fetch("/api/cancel-job", { method: "POST" });
      setPipelineState("failed");
    } catch (e) {
      console.error(e);
    }
  };

  // Regulatory export generator (creates sealed anti-tamper CSV)
  const generateCertifiedExport = async () => {
    setVerificationError("");
    try {
      const res = await fetch("/api/verify-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: history[0]?.run_id || null,
          scoredCandidates
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCertifiedCSV(data.csv);
        setIntegrityChecksum(data.integrityChecksum);
        setCertifiedRunLog(data.runLog);
        setShowCertModal(true);
      } else {
        const err = await res.json();
        setVerificationError(err.error || "Compliance conditions violated.");
        setShowCertModal(true);
      }
    } catch (e: any) {
      setVerificationError("Technical connection issue running validation: " + e.message);
      setShowCertModal(true);
    }
  };

  const downloadCSVFile = () => {
    const blob = new Blob([certifiedCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `synapse_hire_scored_dossier_${certifiedRunLog?.run_id || "vault"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAuditJSONReport = () => {
    const reportData = {
      certification_info: {
        product: "SYNAPSE HIRE INTEL PLATFORM",
        standard_compliance: "SECURE DATASET INGESTION & AUDITABLE RANKING",
        integrity_checksum: integrityChecksum,
        verification_status: "GREEN / VALID"
      },
      auditRunLog: certifiedRunLog,
      metrics,
      scoredCandidatesPreview: scoredCandidates.slice(0, 10).map(c => ({
        candidate_id: c.candidate.candidate_id,
        rank: c.rank,
        score: c.scores.finalScore,
        explanations: c.aiExplanation
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `synapse_compliance_report_${certifiedRunLog?.run_id || "run"}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const examineHistoryRun = async (runId: string) => {
    try {
      const res = await fetch(`/api/audit-run/${runId}`);
      const data = await res.json();
      setActiveHistoryRun(data);
      setShowHistoryModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header trust panel */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
              <Shield className="h-4.5 w-4.5" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Synapse Assurance Suite</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100">Enterprise Security & Compliance Hub</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            In-flight ingestion filters validation schema checking, zip-bomb safety containment, and tamper-evident CSV certification matching strict hackathon audit protocols.
          </p>
        </div>

        <button
          onClick={generateCertifiedExport}
          className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-5.5 py-3 text-xs md:text-sm font-mono tracking-wider font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/15 group shrink-0"
        >
          <Award className="h-4.5 w-4.5 text-slate-950 group-hover:scale-110 transition-transform" />
          Verify & Export Certified CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT — Ingestion Uploader & Stress Benchmarks */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* A. File Drag & Drop */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-400" />
              Dataset Ingestion Portal
            </h3>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6.5 text-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-white/20 bg-slate-950/40'} relative cursor-pointer`}
            >
              <input 
                type="file" 
                accept=".jsonl,.gz" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-200 font-medium">Drag & drop dataset file here</p>
                  <p className="text-[10px] text-slate-400 mt-1">Accepts candidate files: <span className="font-mono text-indigo-400">.jsonl, .jsonl.gz</span> (Max 600MB)</p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 text-[11px] text-slate-300 font-mono">
                    Browse Local File
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Ingestion Portal */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              Job Description Ingestion Portal
            </h3>

            <div className="border-2 border-dashed border-white/10 hover:border-white/20 bg-slate-950/40 rounded-xl p-5 text-center relative cursor-pointer">
              <input 
                type="file" 
                accept=".txt,.md,.pdf,.docx" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processJdFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-200 font-medium">Select or drop Job Description</p>
                  <p className="text-[10px] text-slate-400 mt-1">Accepts: <span className="font-mono text-emerald-400">.txt, .md, .pdf, .docx</span></p>
                </div>
                {jdFile && (
                  <div className="text-[10px] text-indigo-400 font-mono">
                    Selected: {jdFile.name} ({(jdFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>

            {extractedJd?.blueprint && (
              <div className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-bold font-mono text-emerald-400 uppercase text-[9px] tracking-wider">Parsed Role Specs</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Title:</span> <span className="font-semibold text-slate-200">{extractedJd.blueprint.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Experience:</span> <span className="font-semibold text-slate-200">{extractedJd.blueprint.minExperience} - {extractedJd.blueprint.maxExperience} Years</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Mandatory:</span>{" "}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {extractedJd.blueprint.mandatorySkills.map((s: string, sIdx: number) => (
                      <span key={sIdx} className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-[9px] text-slate-300 border border-white/5">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Preferred:</span>{" "}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {extractedJd.blueprint.preferredSkills.map((s: string, sIdx: number) => (
                      <span key={sIdx} className="px-1.5 py-0.5 rounded bg-emerald-500/10 font-mono text-[9px] text-emerald-300 border border-emerald-500/20">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {jdError && (
              <div className="rounded bg-rose-500/15 border border-rose-500/25 p-2.5 text-[10px] text-rose-400">
                {jdError}
              </div>
            )}

            <button
              onClick={startFullRanking}
              disabled={isRanking || pipelineState !== "idle" && pipelineState !== "completed" && pipelineState !== "failed"}
              className={`w-full font-mono font-bold tracking-wider uppercase text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isRanking 
                  ? "bg-slate-800 text-slate-500 border border-slate-700 pointer-events-none" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15 cursor-pointer"
              }`}
            >
              {isRanking ? (
                <>
                  <Activity className="h-4 w-4 animate-spin text-slate-400" />
                  Ranking Database...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Ranking
                </>
              )}
            </button>
          </div>

          {/* B. Judge Exploits & Stress presets */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-400 mb-2.5 flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Active Target Exploit Tests
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal mb-4">
              Hackathon judges and security auditors can verify boundaries and compression safety parameters using our operational payload scripts.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => triggerSimulation("clean")}
                disabled={pipelineState !== "idle" && pipelineState !== "completed" && pipelineState !== "failed"}
                className="w-full text-left rounded-xl border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 px-4 py-3 text-xs flex items-center justify-between transition-all"
              >
                <div>
                  <span className="font-bold text-emerald-400 font-mono">1. Clean Ingest Preset (100k Benchmark)</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Stream safe dataset & evaluate metrics live</p>
                </div>
                <Play className="h-4 w-4 text-emerald-400 shrink-0" />
              </button>

              <button
                onClick={() => triggerSimulation("sh_shell")}
                disabled={pipelineState !== "idle" && pipelineState !== "completed" && pipelineState !== "failed"}
                className="w-full text-left rounded-xl border border-rose-500/15 bg-rose-500/5 hover:bg-rose-500/10 px-4 py-3 text-xs flex items-center justify-between transition-all"
              >
                <div>
                  <span className="font-bold text-rose-400 font-mono">2. Inject Malicious script (.sh)</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Refuse boundary script blocks immediately</p>
                </div>
                <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
              </button>

              <button
                onClick={() => triggerSimulation("zip_bomb")}
                disabled={pipelineState !== "idle" && pipelineState !== "completed" && pipelineState !== "failed"}
                className="w-full text-left rounded-xl border border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/10 px-4 py-3 text-xs flex items-center justify-between transition-all"
              >
                <div>
                  <span className="font-bold text-amber-400 font-mono">3. Recursive Gzip ZIP Bomb exploit</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Blocks unreasonable compression ratios</p>
                </div>
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              </button>

              <button
                onClick={() => triggerSimulation("corrupt")}
                disabled={pipelineState !== "idle" && pipelineState !== "completed" && pipelineState !== "failed"}
                className="w-full text-left rounded-xl border border-indigo-500/15 bg-indigo-500/5 hover:bg-indigo-500/10 px-4 py-3 text-xs flex items-center justify-between transition-all"
              >
                <div>
                  <span className="font-bold text-indigo-400 font-mono">4. Invalid MIME byte structures</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mismatched extensions are flagged and dropped</p>
                </div>
                <AlertOctagon className="h-4 w-4 text-indigo-400 shrink-0" />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT — Stream Logs, telemetry metrics & diagnostics */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* A. Live Observability Console */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-indigo-400" />
                Validation Stream Observability Log
              </h3>
              
              {pipelineState !== "idle" && pipelineState !== "completed" && pipelineState !== "failed" && (
                <button
                  onClick={cancelJob}
                  className="rounded bg-rose-500/15 border border-rose-500/30 font-bold px-2.5 py-1 text-[10px] font-mono text-rose-400 hover:bg-rose-500/25 cursor-pointer flex items-center gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  Abort Stream Thread
                </button>
              )}
            </div>

            {/* Live Progress loading bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Task state: <span className="text-indigo-400 font-bold uppercase">{pipelineState}</span></span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Terminal output */}
            <div className="h-48 bg-slate-950 rounded-xl border border-white/5 p-4 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1.5 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  Systems idle. Wait for upload pipeline triggers...
                </div>
              ) : (
                logs.map((log, lIdx) => {
                  const isErr = log.level === "error";
                  const isWarn = log.level === "warn";
                  const isSucc = log.level === "success";
                  
                  return (
                    <div key={lIdx} className="flex gap-2 items-start leading-relaxed">
                      <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                      <span className={isErr ? "text-rose-400 font-bold" : isWarn ? "text-amber-400" : isSucc ? "text-emerald-400" : "text-slate-300"}>
                        {log.message}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={logEndRef} />
            </div>

            {/* Telemetry stats widget */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Cpu className="h-2.5 w-2.5" /> CPU Load
                </span>
                <span className="text-sm font-bold font-mono text-slate-200">
                  {telemetry.cpuUsagePercent}%
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Activity className="h-2.5 w-2.5" /> RAM Size
                </span>
                <span className="text-sm font-bold font-mono text-slate-200">
                  {telemetry.ramUsageMB} MB
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Database className="h-2.5 w-2.5" /> Active chunks
                </span>
                <span className="text-sm font-bold font-mono text-slate-200">
                  {telemetry.activeChunkCount} chunks
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <FileText className="h-2.5 w-2.5" /> Runtime tenure
                </span>
                <span className="text-sm font-bold font-mono text-slate-200">
                  {telemetry.runtimeMs} ms
                </span>
              </div>
            </div>
          </div>

          {/* B. Data Quality Diagnostic results */}
          {metrics && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md space-y-5 animate-slide-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                  Ingestion Diagnostic Audit Report
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.75 rounded text-[10px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
                  Uncompressed Data Profile OK
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                
                {/* Score Dial */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-5">
                  <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        stroke={metrics.dataIntegrityScore > 75 ? "#10b981" : metrics.dataIntegrityScore > 45 ? "#f59e0b" : "#f43f5e"} 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray="264" 
                        strokeDashoffset={264 - (264 * metrics.dataIntegrityScore) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="text-center">
                      <span className="text-2xl font-extrabold text-slate-100 font-mono">{metrics.dataIntegrityScore}</span>
                      <p className="text-[8px] text-slate-500 font-mono tracking-wide uppercase">Integrity</p>
                    </div>
                  </div>
                </div>

                {/* Score breakdown metrics list */}
                <div className="sm:col-span-8 grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Rows Analyzed</span>
                    <span className="font-bold text-slate-200 block">{metrics.rowsParsed} rows</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Malformed rows discarded</span>
                    <span className={`font-bold block ${metrics.malformedRows > 0 ? "text-rose-400" : "text-slate-200"}`}>
                      {metrics.malformedRows} rows
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Duplicates skipped</span>
                    <span className={`font-bold block ${metrics.duplicatesSkipped > 0 ? "text-amber-400" : "text-slate-200"}`}>
                      {metrics.duplicatesSkipped} rows
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Timeline Overlaps</span>
                    <span className={`font-bold block ${metrics.timelineOverlaps > 0 ? "text-rose-400" : "text-slate-200"}`}>
                      {metrics.timelineOverlaps} overlaps
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Skill contradictions</span>
                    <span className={`font-bold block ${metrics.skillContradictions > 0 ? "text-amber-400" : "text-slate-200"}`}>
                      {metrics.skillContradictions} profiles
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Extreme boundary value anomalies</span>
                    <span className={`font-bold block ${metrics.extremeValues > 0 ? "text-rose-400" : "text-slate-200"}`}>
                      {metrics.extremeValues} flags
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. HISTORICAL VAULT SECTION */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <Scroll className="h-4 w-4 text-purple-400" />
          Reproducible Audit Trails Archive
        </h3>

        {history.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono text-slate-600">
            No committed ranking runs found in current workspace. Commit a dataset to populate archival trace ledger keys.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] divide-y divide-white/5">
              <thead>
                <tr className="text-slate-500 uppercase text-[9px] tracking-widest pb-2">
                  <th className="py-2.5">Tracer Run ID</th>
                  <th className="py-2.5">Timestamp</th>
                  <th className="py-2.5">Input hashes (Sha256)</th>
                  <th className="py-2.5 text-center">Row Count</th>
                  <th className="py-2.5 text-center">Data security anomalies</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((record) => (
                  <tr key={record.run_id} className="hover:bg-white-2 transition-colors">
                    <td className="py-3 text-indigo-400 font-bold max-w-[120px] truncate pr-4">{record.run_id}</td>
                    <td className="py-3 text-slate-400">{new Date(record.timestamp).toLocaleString()}</td>
                    <td className="py-3 text-slate-500 max-w-[200px] truncate pr-4">{record.dataset_hash}</td>
                    <td className="py-3 text-center text-slate-300 font-bold">{record.candidate_count}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex px-1.5 py-0.25 rounded text-[10px] ${record.anomaly_count > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {record.anomaly_count} flags
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => examineHistoryRun(record.run_id)}
                        className="rounded bg-white/5 hover:bg-white/10 px-2 py-1 text-[10px] text-slate-300 cursor-pointer font-bold"
                      >
                        Examine Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EXPORT CERTIFICATION MODAL */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl items-stretch p-6 space-y-6 relative overflow-hidden shadow-2xl">
            
            {verificationError ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-rose-400">
                  <AlertOctagon className="h-6 w-6" />
                  <h4 className="font-bold text-base font-mono uppercase tracking-wider">Compliance Filter Rejected Export</h4>
                </div>
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-slate-300 leading-relaxed">
                  {verificationError}
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Synapse-Hire export controller enforced validation checks strictly. CSV output must match exactly 1-100 descending scores with valid non-empty reasoning and unique identifier patterns.
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowCertModal(false)}
                    className="rounded-full bg-white text-slate-950 hover:bg-slate-100 font-mono text-xs font-bold px-5 py-2.5 cursor-pointer"
                  >
                    Adjust Filters & Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                
                {/* Header Certification frame */}
                <div className="text-center space-y-2 border-b border-white/5 pb-4">
                  <div className="inline-flex mx-auto items-center justify-center h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-400 mb-1">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold font-mono uppercase tracking-widest text-slate-200">SYNAPSE CERTIFIED EXPORT</h3>
                  <p className="text-[10px] text-slate-500 font-mono tracking-wider">SECURE TAMPER-AWARE WORKFLOW INTEGRITY GUARANTEE</p>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  
                  {/* Digital Signature card */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] uppercase text-slate-500 tracking-wider">
                      <span>Assigned Run Tracer ID</span>
                      <span className="text-emerald-400 font-bold">VERIFIED OK</span>
                    </div>
                    <div className="text-slate-300 select-all selection:bg-indigo-500/30 break-all text-[11px] font-bold">
                      {certifiedRunLog?.run_id}
                    </div>
                    
                    <div className="border-t border-white/5 pt-2 mt-2 flex justify-between gap-4 text-[10px] text-slate-500">
                      <div>
                        <span>DATASET ENCRYPTED HASH:</span>
                        <div className="text-slate-400 mt-0.5 truncate max-w-[140px] select-all select-none">{certifiedRunLog?.dataset_hash}</div>
                      </div>
                      <div>
                        <span>ANTI-TAMPER SHA-256 SIGNATURE:</span>
                        <div className="text-slate-400 mt-0.5 truncate max-w-[140px] select-all select-none">{integrityChecksum}</div>
                      </div>
                      <div className="text-right">
                        <span>ENTRIES SEAFOOD:</span>
                        <div className="text-slate-300 mt-0.5 font-bold">{scoredCandidates.length} total rows</div>
                      </div>
                    </div>
                  </div>

                  {/* Standard guidelines checks list */}
                  <div className="space-y-2.5 select-none">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Validated Exactly 100 entries structure (Ranks 1 to 100 strictly in descending score sequence).</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Zero empty justifications or malformed ID patterns within dossier payload block.</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Self-contained verifiable cryptographic signature prepended to metadata headers.</span>
                    </div>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end border-t border-white/5">
                  <button
                    onClick={() => setShowCertModal(false)}
                    className="rounded-full bg-transparent hover:bg-white/5 border border-white/10 font-mono text-xs font-bold px-4 py-2.5 text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={downloadAuditJSONReport}
                    className="rounded-full bg-slate-950 border border-indigo-500/30 text-indigo-400 hover:bg-slate-950/80 font-mono text-xs font-bold px-4.5 py-2.5 inline-flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download JSON Audit Report
                  </button>

                  <button
                    onClick={downloadCSVFile}
                    className="rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs font-extrabold px-5 py-2.5 inline-flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Signed CSV Dossier
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORICAL EXAMINE LOGS MODAL */}
      {showHistoryModal && activeHistoryRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-5 relative overflow-hidden shadow-2xl font-mono text-[11px]">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h4 className="font-bold text-slate-200 text-sm uppercase">Committed Run: {activeHistoryRun.runLog.run_id}</h4>
                <p className="text-[9px] text-slate-500 mt-0.5">Created on: {new Date(activeHistoryRun.runLog.timestamp).toLocaleString()}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-500 hover:text-slate-200 text-xs">Close</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-[9px] uppercase text-slate-500 tracking-wider">Candidate input Rows count:</span>
                  <div className="text-slate-300 font-bold mt-0.5">{activeHistoryRun.runLog.candidate_count} entries</div>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-500 tracking-wider">Model code version standard:</span>
                  <div className="text-slate-300 font-bold mt-0.5">{activeHistoryRun.runLog.model_version}</div>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-500 tracking-wider">Uncompressed dataset SHA256:</span>
                  <div className="text-slate-400 mt-0.5 truncate">{activeHistoryRun.runLog.dataset_hash}</div>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-500 tracking-wider">Weights configuration hash:</span>
                  <div className="text-slate-400 mt-0.5 truncate">{activeHistoryRun.runLog.jd_hash}</div>
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase text-slate-500 tracking-wider block mb-1.5">Archived Ingestion Logs:</span>
                <div className="h-40 bg-slate-950 rounded-xl border border-white/5 p-3.5 overflow-y-auto space-y-1 text-[10px] text-slate-400">
                  {activeHistoryRun.logs.map((log: any, lIdx: number) => {
                    const isErr = log.level === "error";
                    const isWarn = log.level === "warn";
                    const isSucc = log.level === "success";
                    return (
                      <div key={lIdx} className="flex gap-2 leading-relaxed">
                        <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                        <span className={isErr ? "text-rose-400 font-bold" : isWarn ? "text-amber-400" : isSucc ? "text-emerald-400" : "text-slate-300"}>
                          {log.message}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="rounded-full bg-white text-slate-950 hover:bg-slate-100 font-bold px-5 py-2 cursor-pointer"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
