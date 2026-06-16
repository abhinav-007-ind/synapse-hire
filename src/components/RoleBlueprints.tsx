import React from "react";
import { Sliders, Cpu, Sparkles, Filter, ShieldAlert, Award, Calendar, HelpCircle, Check, Info } from "lucide-react";
import { JobBlueprint } from "../types";

interface RoleBlueprintsProps {
  blueprint: JobBlueprint;
  onUpdateBlueprint: (updated: JobBlueprint) => void;
  onTriggerRank: () => void;
}

export default function RoleBlueprints({ blueprint, onUpdateBlueprint, onTriggerRank }: RoleBlueprintsProps) {
  const handleWeightChange = (key: keyof JobBlueprint["weights"], val: number) => {
    // Normalise sum to ensure constraints are reasonable
    const updatedWeights = { ...blueprint.weights, [key]: val };
    onUpdateBlueprint({
      ...blueprint,
      weights: updatedWeights
    });
  };

  const totalWeights = Object.values(blueprint.weights).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6 backdrop-blur-md shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white font-mono">Stage 1 — Job Intelligence</h3>
            <p className="text-[10px] text-slate-400 font-sans">Semantic role blueprint extraction</p>
          </div>
        </div>
        <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-bold text-indigo-400 font-mono tracking-wider">
          ACTIVE DESIGN
        </span>
      </div>

      <div className="space-y-4 flex-1">
        {/* Core details */}
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Target Profile Title</span>
          <div className="rounded-xl border border-white/5 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200">
            {blueprint.title}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Min Exp Target</span>
            <div className="rounded-xl border border-white/5 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200">
              {blueprint.minExperience} Years
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Max Exp Target</span>
            <div className="rounded-xl border border-white/5 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200">
              {blueprint.maxExperience} Years
            </div>
          </div>
        </div>

        {/* Mandatory & Preferred Skills tags */}
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Mandatory Core Skills</span>
          <div className="flex flex-wrap gap-1.5">
            {blueprint.mandatorySkills.map((skill, idx) => (
              <span key={idx} className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5 font-bold">Preferred / Bonus</span>
          <div className="flex flex-wrap gap-1.5">
            {blueprint.preferredSkills.map((skill, idx) => (
              <span key={idx} className="rounded bg-slate-800 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Weight sliders */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">Dynamic Tuning Control</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${Math.round(totalWeights * 100) === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              Sum: {Math.round(totalWeights * 100)}%
            </span>
          </div>

          <div className="space-y-3.5">
            {[
              { key: "semanticMatch", label: "Semantic Similarity", color: "from-blue-400 to-indigo-500" },
              { key: "skillMatch", label: "Skill Matches Matcher", color: "from-purple-400 to-indigo-500" },
              { key: "experienceFit", label: "Tenure Fit", color: "from-violet-400 to-indigo-500" },
              { key: "careerQuality", label: "Career Stability / Growth", color: "from-indigo-400 to-purple-500" },
              { key: "behavioralReliability", label: "Interaction Reliability", color: "from-violet-500 to-fuchsia-500" },
              { key: "recruiterTrust", label: "Recruiter Trust Index", color: "from-purple-500 to-pink-500" }
            ].map((slider) => (
              <div key={slider.key}>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>{slider.label}</span>
                  <span className="text-white font-bold">{Math.round(blueprint.weights[slider.key as keyof JobBlueprint["weights"]] * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.6"
                  step="0.05"
                  value={blueprint.weights[slider.key as keyof JobBlueprint["weights"]]}
                  onChange={(e) => handleWeightChange(slider.key as keyof JobBlueprint["weights"], parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Warning about sum calibration */}
        {Math.round(totalWeights * 100) !== 100 && (
          <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 flex items-start gap-2 text-[10px] leading-relaxed text-amber-300">
            <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>Optimal reranking requires tuned parameter sum calibration to exactly 100% currently: {Math.round(totalWeights * 100)}%</span>
          </div>
        )}
      </div>

      <button
        onClick={onTriggerRank}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all py-3 px-4 mt-6 text-xs text-white font-bold font-mono tracking-wider shadow-lg flex items-center justify-center gap-2"
      >
        <Sliders className="h-3.5 w-3.5" />
        RE-EXECUTE HYBRID RERANKER
      </button>
    </div>
  );
}
