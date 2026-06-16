import React, { useState } from "react";
import { AreaChart, TrendingUp, AlertTriangle, ShieldCheck, Heart, User, Sparkles, PieChart, Activity } from "lucide-react";
import { ScoredCandidate } from "../types";

interface AnalyticsChartsProps {
  scoredCandidates: ScoredCandidate[];
  onOpenCandidate: (c: ScoredCandidate) => void;
}

export default function AnalyticsCharts({ scoredCandidates, onOpenCandidate }: AnalyticsChartsProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ScoredCandidate | null>(null);

  // Group candidates into Quadrants for visual segment analysis
  const stats = scoredCandidates.reduce(
    (acc, item) => {
      if (item.scores.trapRiskScore > 35) {
        acc.traps++;
      } else if (item.scores.finalScore >= 80) {
        acc.stars++;
      } else if (item.scores.finalScore >= 55) {
        acc.highFit++;
      } else {
        acc.lowFit++;
      }
      return acc;
    },
    { stars: 0, highFit: 0, lowFit: 0, traps: 0 }
  );

  const total = scoredCandidates.length || 1;

  // Custom Responsive SVG Scatter Data
  // X axis: Years of experience (mapped 0 to 15, padding)
  // Y axis: Final match score (0 to 100)
  const experienceMax = 15;
  const paddingX = 40;
  const paddingY = 30;
  const width = 500;
  const height = 280;

  const points = scoredCandidates.map(c => {
    const exp = Math.min(experienceMax, c.candidate.profile.years_of_experience);
    const score = c.scores.finalScore;

    // Coordinate mapping
    const cx = paddingX + (exp / experienceMax) * (width - 2 * paddingX);
    const cy = height - paddingY - (score / 100) * (height - 2 * paddingY);

    return { cx, cy, original: c };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="analytics-section">
      {/* Dynamic Segment Distribution Bento Card */}
      <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="h-4 w-4 text-purple-400" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Ecosystem Segments</h4>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Intelligence Segmentation</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1 mb-5">
            Distribution frequency of candidate quality and actively audited platform trap anomalies.
          </p>
        </div>

        <div className="space-y-3.5">
          {[
            { label: "Elite Star Matched", value: stats.stars, pct: Math.round((stats.stars/total)*100), color: "bg-purple-500", text: "text-purple-400" },
            { label: "High Core Qualfied", value: stats.highFit, pct: Math.round((stats.highFit/total)*100), color: "bg-indigo-500", text: "text-indigo-400" },
            { label: "Sub-Optimal Matched", value: stats.lowFit, pct: Math.round((stats.lowFit/total)*100), color: "bg-slate-700", text: "text-slate-500" },
            { label: "Flagged Platform Traps", value: stats.traps, pct: Math.round((stats.traps/total)*100), color: "bg-rose-500", text: "text-rose-400" }
          ].map((seg, i) => (
            <div key={i} className="group">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${seg.color}`} />
                  {seg.label}
                </span>
                <span className="text-slate-400">{seg.value} ({seg.pct}%)</span>
              </div>
              <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className={`h-full ${seg.color}`} style={{ width: `${seg.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic 2D Scatter Matrix Bento Card */}
      <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6 backdrop-blur-md flex flex-col">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="h-4 w-4 text-purple-400" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Spatial Vector Clustering</h4>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Active Quadrant Scatter Matrix</h3>
          </div>

          {/* Interactive Legend / Hover Indicator card */}
          {hoveredPoint && (
            <div className="rounded-xl border border-white/5 bg-slate-950 px-3 py-1.5 text-[10px] font-mono text-slate-300 max-w-[240px] truncate animate-pulse">
              <span className="text-purple-400 font-bold">{hoveredPoint.candidate.profile.anonymized_name}</span>
              <br />
              Score: {hoveredPoint.scores.finalScore} • Exp: {hoveredPoint.candidate.profile.years_of_experience} yrs
            </div>
          )}
        </div>

        {/* Custom Interactive SVG Scatter Plot */}
        <div className="w-full aspect-[2/1] min-h-[220px] bg-slate-950/80 rounded-2xl border border-white/5 p-2 relative overflow-hidden flex-1">
          <svg className="w-full h-full text-slate-600" viewBox={`0 0 ${width} ${height}`}>
            {/* Quadrant grid boundaries */}
            {/* Mid Match score line (50%) */}
            <line
              x1={paddingX}
              y1={height / 2}
              x2={width - paddingX}
              y2={height / 2}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="4,4"
            />
            {/* Target 5-9 Yrs experience boundaries */}
            <line
              x1={paddingX + (5 / experienceMax) * (width - 2 * paddingX)}
              y1={paddingY}
              x2={paddingX + (5 / experienceMax) * (width - 2 * paddingX)}
              y2={height - paddingY}
              stroke="rgba(168, 85, 247, 0.12)"
              strokeDasharray="2,2"
            />
            <line
              x1={paddingX + (9 / experienceMax) * (width - 2 * paddingX)}
              y1={paddingY}
              x2={paddingX + (9 / experienceMax) * (width - 2 * paddingX)}
              y2={height - paddingY}
              stroke="rgba(168, 85, 247, 0.12)"
              strokeDasharray="2,2"
            />

            {/* Axes Labels */}
            <text
              x={width / 2}
              y={height - 6}
              fill="#64748b"
              fontSize="9"
              textAnchor="middle"
              fontFamily="monospace"
            >
              Candidate Tenure Experience (Years)
            </text>
            <text
              x="10"
              y={height / 2}
              fill="#64748b"
              fontSize="9"
              transform={`rotate(-90 10 ${height / 2})`}
              textAnchor="middle"
              fontFamily="monospace"
            >
              Final Synthesized Match Score
            </text>

            <text
              x={width - paddingX - 10}
              y={paddingY + 15}
              fill="rgba(255,255,255,0.12)"
              fontSize="9"
              textAnchor="end"
              fontFamily="monospace"
            >
              Target Window (5-9 Yrs)
            </text>

            {/* Plotting points */}
            {points.map((pt, i) => {
              const isTrap = pt.original.scores.trapRiskScore > 35;
              const isStar = pt.original.scores.finalScore >= 80;

              let fillColor = "#64748b"; // default grey
              let radius = 4.5;
              
              if (isTrap) {
                fillColor = "#f43f5e"; // rose red for traps
                radius = 5.5;
              } else if (isStar) {
                fillColor = "#c084fc"; // purple for stars
                radius = 6;
              } else if (pt.original.scores.finalScore >= 55) {
                fillColor = "#818cf8"; // indigo for matches
              }

              const isHovered = hoveredPoint?.candidate.candidate_id === pt.original.candidate.candidate_id;

              return (
                <circle
                  key={i}
                  cx={pt.cx}
                  cy={pt.cy}
                  r={isHovered ? radius * 2 : radius}
                  fill={fillColor}
                  className="transition-all hover:scale-150 cursor-pointer duration-200"
                  style={{
                    opacity: isHovered ? 1 : 0.72,
                    stroke: isHovered ? "#ffffff" : "none",
                    strokeWidth: isHovered ? 1.5 : 0
                  }}
                  onMouseEnter={() => setHoveredPoint(pt.original)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => onOpenCandidate(pt.original)}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
