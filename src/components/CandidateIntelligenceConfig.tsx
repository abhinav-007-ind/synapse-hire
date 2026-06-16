import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sliders, Cpu, Sparkles, AlertTriangle, ShieldCheck, 
  HelpCircle, Check, Info, ChevronDown, ChevronUp, 
  Upload, FileText, Database, RefreshCw, Play, X, FileUp
} from "lucide-react";
import { JobBlueprint } from "../types";

interface CandidateIntelligenceConfigProps {
  initialBlueprint: JobBlueprint;
  onStartRanking: (config: {
    targetProfileTitle: string;
    minExperience: number;
    maxExperience: number;
    riskFactor: number;
    weights: JobBlueprint["weights"];
    datasetFile: { name: string; size: number; content: string; isSimulated: boolean } | null;
    jdFile: { name: string; content: string; size: number } | null;
  }) => void;
  onBack?: () => void;
}

export default function CandidateIntelligenceConfig({ 
  initialBlueprint, 
  onStartRanking,
  onBack
}: CandidateIntelligenceConfigProps) {
  // Title state
  const [title, setTitle] = useState(initialBlueprint.title);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const titleSuggestions = [
    "AI Engineer", 
    "Senior AI Engineer", 
    "ML Engineer", 
    "Data Scientist", 
    "AI Architect", 
    "GenAI Engineer", 
    "Search Engineer", 
    "Recommendation Engineer"
  ];

  // Experience states
  const [minExp, setMinExp] = useState(initialBlueprint.minExperience);
  const [maxExp, setMaxExp] = useState(initialBlueprint.maxExperience);
  const [expError, setExpError] = useState("");

  // Validate Experience
  useEffect(() => {
    if (maxExp <= minExp) {
      setExpError("Maximum experience must be strictly greater than minimum experience.");
    } else {
      setExpError("");
    }
  }, [minExp, maxExp]);

  // Risk Sensitivity state
  const [riskFactor, setRiskFactor] = useState(initialBlueprint.riskSensitivity ?? 70);
  const [showRiskTooltip, setShowRiskTooltip] = useState(false);

  // Get Risk Category Label
  const getRiskLabel = (val: number) => {
    if (val <= 20) return { label: "Aggressive Hiring", desc: "Tolerant of risky profiles", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" };
    if (val <= 50) return { label: "Balanced", desc: "Standard screening checks", color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" };
    if (val <= 80) return { label: "Risk Aware", desc: "Rigorous profile filtering", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" };
    return { label: "Strict / Zero Trust", desc: "Aggressive red-flag penalty matrix", color: "text-rose-400 border-rose-500/20 bg-rose-500/5" };
  };
  const riskInfo = getRiskLabel(riskFactor);

  // Weights states (0-100 UI, mapped to 0-1 on start)
  const [weights, setWeights] = useState({
    semanticMatch: Math.round(initialBlueprint.weights.semanticMatch * 100),
    skillMatch: Math.round(initialBlueprint.weights.skillMatch * 100),
    experienceFit: Math.round(initialBlueprint.weights.experienceFit * 100),
    careerQuality: Math.round(initialBlueprint.weights.careerQuality * 100),
    behavioralReliability: Math.round(initialBlueprint.weights.behavioralReliability * 100),
    recruiterTrust: Math.round(initialBlueprint.weights.recruiterTrust * 100),
  });
  const [showAdvancedWeights, setShowAdvancedWeights] = useState(false);

  // Adjust advanced weights with auto-normalization
  const handleWeightChange = (key: keyof typeof weights, val: number) => {
    const currentWeights = { ...weights };
    currentWeights[key] = val;

    const sumOthers = Object.keys(currentWeights)
      .filter(k => k !== key)
      .reduce((sum, k) => sum + currentWeights[k as keyof typeof weights], 0);

    const targetOthers = 100 - val;

    if (sumOthers > 0) {
      Object.keys(currentWeights).forEach(k => {
        if (k !== key) {
          const currentVal = currentWeights[k as keyof typeof weights];
          currentWeights[k as keyof typeof weights] = Math.round((currentVal / sumOthers) * targetOthers);
        }
      });
    } else {
      const keys = Object.keys(currentWeights).filter(k => k !== key);
      keys.forEach(k => {
        currentWeights[k as keyof typeof weights] = Math.round(targetOthers / keys.length);
      });
    }

    // Adjust any rounding errors to force sum exactly 100
    const finalSum = Object.values(currentWeights).reduce((a, b) => a + b, 0);
    if (finalSum !== 100) {
      const diff = 100 - finalSum;
      const firstOtherKey = Object.keys(currentWeights).find(k => k !== key) as keyof typeof weights;
      if (firstOtherKey) currentWeights[firstOtherKey] += diff;
    }

    setWeights(currentWeights);
  };

  const handleResetWeights = () => {
    setWeights({
      semanticMatch: 30,
      skillMatch: 25,
      experienceFit: 15,
      careerQuality: 10,
      behavioralReliability: 10,
      recruiterTrust: 10,
    });
  };

  const totalWeights = Object.values(weights).reduce((a, b) => a + b, 0);

  // Dataset uploader states
  const [datasetFile, setDatasetFile] = useState<{ name: string; size: number; content: string; isSimulated: boolean } | null>(null);
  const [datasetUploadState, setDatasetUploadState] = useState<"idle" | "dragging" | "uploading" | "success" | "failure">("idle");
  const [datasetError, setDatasetError] = useState("");

  const handleDatasetDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDatasetUploadState("dragging");
    } else if (e.type === "dragleave") {
      setDatasetUploadState("idle");
    }
  };

  const handleDatasetDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDatasetUploadState("idle");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processDatasetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDatasetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processDatasetFile(e.target.files[0]);
    }
  };

  const processDatasetFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "json" && ext !== "jsonl" && ext !== "gz") {
      setDatasetError("Unsupported file extension. Please upload .json, .jsonl, or .jsonl.gz files.");
      setDatasetUploadState("failure");
      return;
    }
    if (file.size > 600 * 1024 * 1024) {
      setDatasetError("File exceeds 600 MB candidate limit restriction.");
      setDatasetUploadState("failure");
      return;
    }

    setDatasetUploadState("uploading");
    setDatasetError("");

    const reader = new FileReader();
    reader.onload = () => {
      setDatasetFile({
        name: file.name,
        size: file.size,
        content: reader.result as string,
        isSimulated: false
      });
      setDatasetUploadState("success");
    };
    reader.onerror = () => {
      setDatasetError("Failed to read candidate dataset file.");
      setDatasetUploadState("failure");
    };
    reader.readAsDataURL(file);
  };

  // Job Description uploader states
  const [jdTab, setJdTab] = useState<"upload" | "paste">("upload");
  const [jdFile, setJdFile] = useState<{ name: string; content: string; size: number } | null>(null);
  const [pastedJd, setPastedJd] = useState("");
  const [jdUploadState, setJdUploadState] = useState<"idle" | "uploading" | "success" | "failure">("idle");
  const [jdError, setJdError] = useState("");

  const handleJdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setJdUploadState("uploading");
      setJdError("");

      const reader = new FileReader();
      reader.onload = () => {
        setJdFile({
          name: file.name,
          content: reader.result as string,
          size: file.size
        });
        setJdUploadState("success");
      };
      reader.onerror = () => {
        setJdError("Failed to read Job Description file.");
        setJdUploadState("failure");
      };
      reader.readAsDataURL(file);
    }
  };

  // Record Estimate Helper
  const getRecordEstimate = (name: string, size: number) => {
    const isGz = name.endsWith(".gz");
    const bytesPerRecord = 4000; // Average JSON profile bytes
    const compressionRatio = isGz ? 10 : 1;
    const est = Math.round((size * compressionRatio) / bytesPerRecord);
    return est.toLocaleString();
  };

  // Load Demo Dataset Handler
  const handleLoadDemo = () => {
    setDatasetUploadState("uploading");
    setTimeout(() => {
      setDatasetFile({
        name: "enterprise_candidates_100k.jsonl.gz",
        size: 4521000,
        content: "", // Simulated flag handled by backend
        isSimulated: true
      });
      setDatasetUploadState("success");
    }, 800);

    // Populate a sample JD
    setPastedJd(
      "Role: Senior AI Engineer (Founding Team)\n\n" +
      "We are building a next-generation semantic search and ranking engine. " +
      "We need a founding engineer with 5-9 years of experience with Python, " +
      "embeddings, vector databases (FAISS, Pinecone), retrieval systems, and search evaluation metrics (NDCG, MAP, MRR)."
    );
    setJdTab("paste");
  };

  // Submit trigger
  const [validationMsg, setValidationMsg] = useState("");
  const handleStartRanking = () => {
    setValidationMsg("");
    
    if (!title.trim()) {
      setValidationMsg("Role configuration incomplete: Target profile title is required.");
      return;
    }
    if (maxExp <= minExp) {
      setValidationMsg("Role configuration incomplete: Resolve experience bound conflict.");
      return;
    }
    if (!datasetFile) {
      setValidationMsg("Dataset Ingestion incomplete: Please upload candidates dataset or load demo.");
      return;
    }
    
    let finalJd: { name: string; content: string; size: number } | null = null;
    if (jdTab === "upload" && jdFile) {
      finalJd = jdFile;
    } else if (jdTab === "paste" && pastedJd.trim()) {
      finalJd = {
        name: "pasted_job_description.txt",
        content: btoa(unescape(encodeURIComponent(pastedJd))), // Safe base64 encode
        size: pastedJd.length
      };
    }

    if (!finalJd) {
      setValidationMsg("Role configuration incomplete: Please upload or paste a Job Description.");
      return;
    }

    // Convert weights back to 0-1 scale
    const normalizedWeights = {
      semanticMatch: weights.semanticMatch / 100,
      skillMatch: weights.skillMatch / 100,
      experienceFit: weights.experienceFit / 100,
      careerQuality: weights.careerQuality / 100,
      behavioralReliability: weights.behavioralReliability / 100,
      recruiterTrust: weights.recruiterTrust / 100,
    };

    onStartRanking({
      targetProfileTitle: title,
      minExperience: minExp,
      maxExperience: maxExp,
      riskFactor,
      weights: normalizedWeights,
      datasetFile,
      jdFile: finalJd
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden py-12 px-4 md:px-8">
      {/* Background radial effects */}
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full z-10 flex-1 flex flex-col justify-center space-y-8">
        
        {/* Header Title Block */}
        <div className="text-center md:text-left space-y-2 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-mono text-[10px] uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Stage 0 — Pipeline Preparation
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Candidate <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Intelligence</span> Configuration
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-sans leading-relaxed">
            Configure the target role parameters, adjust dynamic ranking sensitivity, and load candidate profiles before executing our semantic intelligence matching pipeline.
          </p>
        </div>

        {/* Two Column Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: CONFIGURATION CONTROLS */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Frosted Glass Container */}
            <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col space-y-6">
              
              {/* Highlight Streak */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Sliders className="h-4.5 w-4.5 text-indigo-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Target Role Parameters</span>
              </div>

              {/* 1. Target Profile Title */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Target Profile Title</label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setShowTitleSuggestions(true)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all font-sans"
                    placeholder="Enter or select profile title..."
                  />
                  <button 
                    onClick={() => setShowTitleSuggestions(!showTitleSuggestions)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                  >
                    <ChevronDown className={`h-4.5 w-4.5 transition-transform duration-200 ${showTitleSuggestions ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showTitleSuggestions && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowTitleSuggestions(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute w-full mt-1.5 z-30 rounded-xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden text-xs max-h-48 overflow-y-auto"
                      >
                        {titleSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setTitle(s);
                              setShowTitleSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white transition-colors border-b border-white/5 last:border-b-0"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Experience Targets (Min/Max Sliders) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Min Exp */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    <span>Minimum Experience</span>
                    <span className="text-white font-bold text-xs">{minExp} years</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={minExp}
                      onChange={(e) => setMinExp(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={minExp}
                      onChange={(e) => setMinExp(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                      className="w-14 bg-slate-950 border border-white/10 rounded-lg py-1 text-center text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Max Exp */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    <span>Maximum Experience</span>
                    <span className="text-white font-bold text-xs">{maxExp} years</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={maxExp}
                      onChange={(e) => setMaxExp(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={maxExp}
                      onChange={(e) => setMaxExp(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                      className="w-14 bg-slate-950 border border-white/10 rounded-lg py-1 text-center text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Exp Bounds Warning */}
              {expError && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 flex items-start gap-2 text-[10px] leading-relaxed text-rose-300"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{expError}</span>
                </motion.div>
              )}

              {/* 3. Risk Sensitivity Slider */}
              <div className="space-y-2 relative">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    Risk Factor Sensitivity
                    <button 
                      onMouseEnter={() => setShowRiskTooltip(true)}
                      onMouseLeave={() => setShowRiskTooltip(false)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </span>
                  <span className="text-white font-bold text-xs">{riskFactor}</span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={riskFactor}
                    onChange={(e) => setRiskFactor(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className={`px-2.5 py-0.75 rounded border text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 ${riskInfo.color}`}>
                    {riskInfo.label}
                  </span>
                </div>

                <div className="flex justify-between text-[8px] font-mono text-slate-600 uppercase tracking-wider">
                  <span>Low Risk Tolerance</span>
                  <span>High Risk Tolerance</span>
                </div>

                {/* Risk tooltip block */}
                <AnimatePresence>
                  {showRiskTooltip && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 bottom-full mb-2 z-20 max-w-sm rounded-xl border border-white/10 bg-slate-950 p-3 shadow-2xl text-[10px] text-slate-400 leading-normal space-y-1.5"
                    >
                      <p className="font-bold text-white uppercase tracking-wider border-b border-white/5 pb-1">Risk Factor Audit Specs:</p>
                      <p>Controls how aggressively the ranking engine penalizes suspicious profile attributes, including:</p>
                      <ul className="list-disc pl-3 space-y-0.5">
                        <li>Keyword stuffing & non-technical hype competencies</li>
                        <li>Missing developer verifications (unlinked/dead GitHub)</li>
                        <li>Chronic job hopping (tenure &lt; 18 months)</li>
                        <li>Suboptimal recruiter responsiveness thresholds</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Collapsible Advanced Weights */}
              <div className="border-t border-white/5 pt-4">
                <button
                  onClick={() => setShowAdvancedWeights(!showAdvancedWeights)}
                  className="w-full flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="h-4 w-4" />
                    Advanced Score weights Tuning
                  </span>
                  <ChevronDown className={`h-4.5 w-4.5 transition-transform duration-200 ${showAdvancedWeights ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showAdvancedWeights && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-4 space-y-4"
                    >
                      <div className="flex justify-between items-center bg-slate-950/40 p-2 border border-white/5 rounded-xl text-[10px] font-mono text-slate-400">
                        <span>Sliders auto-normalize to sum to 100%</span>
                        <button 
                          onClick={handleResetWeights}
                          className="text-indigo-400 hover:text-white font-bold uppercase"
                        >
                          [ Reset to default ]
                        </button>
                      </div>

                      <div className="space-y-3">
                        {[
                          { key: "semanticMatch", label: "Semantic Proximity Match" },
                          { key: "skillMatch", label: "Skills Overlap Alignment" },
                          { key: "experienceFit", label: "Tenure Bounds Match" },
                          { key: "careerQuality", label: "Stability & Growth Indicators" },
                          { key: "behavioralReliability", label: "Platform Interaction Velocity" },
                          { key: "recruiterTrust", label: "Identity & Connect Trust Index" }
                        ].map((s) => (
                          <div key={s.key} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400">
                              <span>{s.label}</span>
                              <span className="text-white font-bold">{weights[s.key as keyof typeof weights]}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={weights[s.key as keyof typeof weights]}
                              onChange={(e) => handleWeightChange(s.key as keyof typeof weights, parseInt(e.target.value) || 0)}
                              className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: DATASET UPLOAD + PREVIEW */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* A. Candidate Dataset Upload */}
            <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-4">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Database className="h-4.5 w-4.5 text-purple-400" />
                  Upload Candidates Dataset
                </span>
                <span className="text-[9px] font-mono text-slate-500">Max size 600MB</span>
              </div>

              <div
                onDragEnter={handleDatasetDrag}
                onDragOver={handleDatasetDrag}
                onDragLeave={handleDatasetDrag}
                onDrop={handleDatasetDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  datasetUploadState === "dragging" 
                    ? "border-purple-500 bg-purple-500/5 scale-[1.01]" 
                    : datasetUploadState === "success"
                    ? "border-emerald-500/30 bg-emerald-500/2"
                    : "border-white/10 hover:border-white/20 bg-slate-950/40"
                } relative cursor-pointer group`}
              >
                <input
                  type="file"
                  accept=".json,.jsonl,.gz"
                  onChange={handleDatasetFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="space-y-3">
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center mx-auto transition-all ${
                    datasetUploadState === "success" 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "bg-white/5 text-slate-400 group-hover:text-white"
                  }`}>
                    {datasetUploadState === "uploading" ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                  </div>
                  
                  {datasetUploadState === "success" && datasetFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-emerald-400">Dataset Loaded Successfully</p>
                      <p className="text-[10px] text-slate-300 font-mono truncate max-w-xs mx-auto">{datasetFile.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono">
                        {(datasetFile.size / (1024 * 1024)).toFixed(2)} MB • ≈ {getRecordEstimate(datasetFile.name, datasetFile.size)} profiles detected
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-200 font-medium">Drop candidate dataset here or click to browse</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-1">Supports: <span className="text-indigo-400">.json, .jsonl, .jsonl.gz</span></p>
                    </div>
                  )}
                </div>
              </div>

              {datasetError && (
                <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-2.5 text-[10px] text-rose-400 font-mono">
                  {datasetError}
                </div>
              )}
            </div>

            {/* B. Job Description Upload / Paste */}
            <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-4">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5 text-emerald-400" />
                  Job Description Ingestion
                </span>
                
                {/* Tabs */}
                <div className="flex border border-white/10 rounded-lg bg-slate-950 p-0.5 font-mono text-[9px]">
                  <button
                    onClick={() => setJdTab("upload")}
                    className={`px-2 py-0.75 rounded ${jdTab === "upload" ? "bg-white/10 text-white font-bold" : "text-slate-500"}`}
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setJdTab("paste")}
                    className={`px-2 py-0.75 rounded ${jdTab === "paste" ? "bg-white/10 text-white font-bold" : "text-slate-500"}`}
                  >
                    Paste JD
                  </button>
                </div>
              </div>

              {jdTab === "upload" ? (
                <div className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                  jdUploadState === "success" 
                    ? "border-emerald-500/30 bg-emerald-500/2" 
                    : "border-white/10 hover:border-white/20 bg-slate-950/40"
                } relative cursor-pointer`}>
                  <input
                    type="file"
                    accept=".txt,.md,.docx,.pdf"
                    onChange={handleJdFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                      <FileUp className="h-4.5 w-4.5" />
                    </div>
                    {jdUploadState === "success" && jdFile ? (
                      <div>
                        <p className="text-xs font-bold text-emerald-400">JD Uploaded Successfully</p>
                        <p className="text-[10px] text-slate-300 font-mono truncate max-w-xs mx-auto">{jdFile.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-slate-200">Drag & drop JD file or browse</p>
                        <p className="text-[9px] text-slate-500 font-mono">Accepts: .txt, .md, .pdf, .docx</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <textarea
                  value={pastedJd}
                  onChange={(e) => setPastedJd(e.target.value)}
                  placeholder="Paste the target job description text here..."
                  className="w-full h-24 bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-sans resize-none"
                />
              )}

              {jdError && (
                <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-2.5 text-[10px] text-rose-400 font-mono">
                  {jdError}
                </div>
              )}
            </div>

            {/* C. Live Blueprint Preview Panel */}
            <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-3">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4" />
                  Role Blueprint Preview
                </span>
                <span className="inline-flex items-center gap-1 py-0.25 px-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AI STATUS ● ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[10px] text-slate-400 bg-slate-950/50 p-4 rounded-xl border border-white/5 leading-relaxed">
                <div>
                  <span className="text-slate-500">Target Title:</span>
                  <div className="font-bold text-slate-200 truncate mt-0.5">{title || "Not defined"}</div>
                </div>
                <div>
                  <span className="text-slate-500">Experience Target:</span>
                  <div className="font-bold text-slate-200 mt-0.5">{minExp} - {maxExp} years</div>
                </div>
                <div>
                  <span className="text-slate-500">Risk Factor Sensitivity:</span>
                  <div className="font-bold text-slate-200 mt-0.5">{riskFactor} / 100</div>
                </div>
                <div>
                  <span className="text-slate-500">Semantic Weight:</span>
                  <div className="font-bold text-slate-200 mt-0.5">{weights.semanticMatch}%</div>
                </div>
                <div className="col-span-2 border-t border-white/5 pt-2 mt-1">
                  <span className="text-slate-500 block mb-1">Normalized Weight Distributions:</span>
                  <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-1">
                    <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/5">SEM: {weights.semanticMatch}%</span>
                    <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/5">SKL: {weights.skillMatch}%</span>
                    <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/5">EXP: {weights.experienceFit}%</span>
                    <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/5">CAR: {weights.careerQuality}%</span>
                    <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/5">BEH: {weights.behavioralReliability}%</span>
                    <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/5">TRU: {weights.recruiterTrust}%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM CTA SECTION */}
        <div className="flex flex-col items-center space-y-4 pt-4 border-t border-white/5">
          {validationMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              {validationMsg}
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Start AI Ranking button */}
            <button
              onClick={handleStartRanking}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 font-mono font-extrabold uppercase text-xs tracking-wider rounded-full shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Play className="h-4 w-4 text-white" />
              Start AI Ranking
            </button>

            {/* Load demo dataset button */}
            <button
              onClick={handleLoadDemo}
              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-mono font-bold uppercase text-xs tracking-wider rounded-full flex items-center gap-2 cursor-pointer transition-all"
            >
              <Database className="h-4 w-4" />
              Load Demo Dataset
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="text-slate-500 hover:text-slate-300 font-mono text-[10px] uppercase font-bold tracking-wider hover:underline"
              >
                Back to Welcome
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
