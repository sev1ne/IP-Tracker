import { ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Terminal, BookOpen, AlertCircle } from "lucide-react";
import { IPAnalysis } from "../types";

interface AIPanelProps {
  analysis?: IPAnalysis;
  isAnalyzing: boolean;
  onTrigger: () => void;
  ip: string;
}

export default function AIPanel({ analysis, isAnalyzing, onTrigger, ip }: AIPanelProps) {
  
  // Style config for reputation indicators
  const getReputationStyles = (rep?: string) => {
    switch (rep) {
      case "Safe/Clean":
        return {
          icon: ShieldCheck,
          text: "Safe & Clean",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
          desc: "No active threat markers or spam campaigns detected on this segment."
        };
      case "Low Risk":
        return {
          icon: CheckCircle2,
          text: "Low Risk",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-100",
          desc: "Typical residential or dynamic IP node. General low-risk classification."
        };
      case "Suspicious/Medium":
        return {
          icon: AlertTriangle,
          text: "Suspicious Risk",
          bg: "bg-amber-50 text-amber-700 border-amber-100",
          desc: "Hosting or enterprise range that may exhibit shared hosting proxy or scraper activities."
        };
      case "High Risk":
        return {
          icon: ShieldAlert,
          text: "High Threat Risk",
          bg: "bg-rose-50 text-rose-700 border-rose-100",
          desc: "Active scrapers, brute forces, spam botnets, or blacklisted Tor egress nodes."
        };
      default:
        return {
          icon: ShieldCheck,
          text: "Safe / Unlisted",
          bg: "bg-gray-50 text-gray-700 border-gray-100",
          desc: "Clean threat intelligence report."
        };
    }
  };

  const reputation = getReputationStyles(analysis?.reputation);
  const RepIcon = reputation.icon;

  if (isAnalyzing) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden shadow-lg min-h-[280px] flex flex-col justify-center items-center">
        {/* Animated ambient mesh in background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-30 animate-pulse"></div>
        <div className="relative text-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-12 h-12 rounded-full border border-indigo-500/30 animate-ping"></div>
            <div className="w-10 h-10 rounded-full border border-t-indigo-500 border-indigo-500/10 animate-spin flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-100">Consulting AI Threat Model...</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Scanning dynamic Autonomous System reputation, looking up PTR host record history, and classifying network usage profiles...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]"></div>
        <div className="relative flex flex-col items-center justify-center text-center py-6">
          <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">AI-Powered Network Intelligence</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
            Querying Gemini to verify network categories, risk level, estimated hostname PTR pointers, and enterprise routing profiles.
          </p>
          <button
            onClick={onTrigger}
            className="cursor-pointer bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800 hover:border-indigo-500/30 font-semibold px-4 py-2 rounded-xl text-xs transition-all duration-300 shadow-sm"
          >
            Spawn Security Intelligence
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header and Brand */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-sm">Gemini Security Intelligence</h3>
            <p className="text-[10px] text-slate-400 font-mono">NODE: {ip}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 font-mono">
          <Terminal className="w-3 h-3 text-indigo-400" />
          <span>v3.5-flash-grounded</span>
        </div>
      </div>

      {/* Core Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Reputation Panel */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 divide-y divide-slate-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reputation Status</span>
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${reputation.bg}`}>
              {reputation.text}
            </span>
          </div>
          <div className="pt-3 flex gap-2">
            <RepIcon className="w-5 h-5 mt-0.5 shrink-0 text-indigo-400" />
            <p className="text-xs text-slate-300 leading-normal">{reputation.desc}</p>
          </div>
        </div>

        {/* 2. Network Classification */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 divide-y divide-slate-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Classification</span>
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-md border text-amber-400 border-amber-500/20 bg-amber-500/5">
              {analysis.networkType}
            </span>
          </div>
          <div className="pt-3 flex gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
            <p className="text-xs text-slate-300 leading-normal">
              Estimated usage: <strong className="text-white">{analysis.useCase}</strong>
            </p>
          </div>
        </div>

        {/* 3. Administrative Owner */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 divide-y divide-slate-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Owner Signature</span>
            <span className="text-[10px] font-mono text-indigo-400 font-bold max-w-[120px] truncate">
              {analysis.hostName || "N/A PTR"}
            </span>
          </div>
          <div className="pt-3 flex gap-2">
            <BookOpen className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" />
            <p className="text-xs text-slate-300 leading-normal">
              AS Administered officially by <strong className="text-white">{analysis.asOwner}</strong>
            </p>
          </div>
        </div>

      </div>

      {/* Threat Summary Banner */}
      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3">
        <div className="shrink-0 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/25 h-fit w-fit">
          <AlertCircle className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200 font-sans tracking-wide">Threat Descriptor & Behavioral Footprint</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {analysis.threatDescription}
          </p>
        </div>
      </div>

      {/* Recommended Security Gates */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommended Security Policies</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {analysis.securityPractices.map((practice, idx) => (
            <div key={idx} className="p-3 bg-slate-950/25 rounded-lg border border-slate-800/60 flex gap-2.5">
              <span className="text-indigo-400 font-mono text-xs font-bold">0{idx + 1}.</span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-normal">{practice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
