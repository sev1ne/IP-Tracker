import { useEffect, useState } from "react";
import { 
  Network, 
  Search, 
  Sparkles, 
  Globe, 
  Clock, 
  Flame, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  Compass
} from "lucide-react";
import { IPRecord, ActivityLog } from "./types";
import IPMap from "./components/IPMap";
import IPDetailsCard from "./components/IPDetailsCard";
import AIPanel from "./components/AIPanel";
import ActivityLogList from "./components/ActivityLogList";

export default function App() {
  const [activeRecord, setActiveRecord] = useState<IPRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Current system UTC reading from environment metadata
  const systemTime = "2026-05-22 07:14:06 UTC";

  // Quick preset targets for rapid diagnostic tests
  const presetIPs = [
    { label: "Google Public DNS", value: "8.8.8.8" },
    { label: "Cloudflare Core", value: "1.1.1.1" },
    { label: "OpenDNS Shield", value: "208.67.222.222" },
    { label: "Quad9 Security", value: "9.9.9.9" }
  ];

  // Retrieve cached logs on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ip_tracker_activity_logs");
      if (saved) {
        setLogs(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load historical cache:", e);
    }
    
    // Automatically detect connection IP address on start
    triggerAutoDetection();
  }, []);

  // Write history updates to local storage
  const saveLogs = (updatedLogs: ActivityLog[]) => {
    setLogs(updatedLogs);
    try {
      localStorage.setItem("ip_tracker_activity_logs", JSON.stringify(updatedLogs));
    } catch (e) {
      console.error("Failed to write to historical cache:", e);
    }
  };

  /**
   * Automatically resolve visitor's egress public IP
   */
  const triggerAutoDetection = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/ip/detect");
      if (!response.ok) {
        throw new Error("Egress detector endpoint failed. Check network link.");
      }
      const data: IPRecord = await response.json();
      data.timestamp = new Date().toISOString();
      setActiveRecord(data);
      
      // Append row to diagnostics log flow
      appendActivityLog(data, "auto-detect");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to auto-detect client IP coordinates.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Search an IP address or domain query
   */
  const handleIPSearch = async (target: string) => {
    if (!target.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/ip/resolve?q=${encodeURIComponent(target.trim())}`);
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || `Failed to resolve target: "${target}"`);
      }
      const data: IPRecord = await res.json();
      data.timestamp = new Date().toISOString();
      setActiveRecord(data);
      
      // Log in historical cache
      appendActivityLog(data, "manual-search");
    } catch (err: any) {
      setErrorMessage(err.message || "Target lookup resolution query failed.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Append a completed check to local storage diagnostics timeline
   */
  const appendActivityLog = (record: IPRecord, type: "auto-detect" | "manual-search") => {
    // Avoid double logging identical sequential IPs in log tree
    const newLog: ActivityLog = {
      id: `${record.ip}-${Date.now()}`,
      ip: record.ip,
      city: record.city || "Unknown City",
      countryCode: record.countryCode || "UN",
      countryName: record.country || "Unknown Country",
      timestamp: new Date().toISOString(),
      type,
      org: record.org || "Unknown ISP Node"
    };

    setLogs((prev) => {
      // Keep only most recent 30 diagnostics queries
      const filtered = prev.filter((item) => item.ip !== record.ip);
      const combined = [newLog, ...filtered].slice(0, 30);
      saveLogs(combined);
      return combined;
    });
  };

  /**
   * Asynchronously execute on-demand Gemini AI routing and threat classification
   */
  const executeGeminiAnalysis = async () => {
    if (!activeRecord || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ip/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeRecord),
      });
      if (!response.ok) {
        throw new Error("AI intelligence model endpoint timed out or failed.");
      }
      const aiResponse = await response.json();
      setActiveRecord((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          aiAnalysis: aiResponse,
        };
      });
    } catch (err: any) {
      setErrorMessage(`Gemini Intelligence analysis error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Warp map coordinates to an active target from the log index
   */
  const warpToTargetIP = async (ip: string) => {
    setSearchQuery(ip);
    await handleIPSearch(ip);
  };

  const clearCachedHistory = () => {
    saveLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      
      {/* Dynamic Navigation Rails */}
      <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-sm flex items-center justify-center">
              <Network className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 tracking-tight font-sans">
                IP Tracker &amp; Network Intelligence Hub
              </h1>
              <span className="text-[10px] text-gray-400 font-mono tracking-wide uppercase font-semibold">
                Autonomous system diagnostics &bull; Node mapping
              </span>
            </div>
          </div>

          {/* Diagnostics telemetery */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-gray-100 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-mono text-gray-700 font-medium">
                {systemTime}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest font-sans">
                Active Client
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container Dashboard */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6 flex-1">
        
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 transition-all duration-300">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold font-sans">Diagnostic Warning Flagged</h4>
              <p className="text-xs mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-rose-500 hover:text-rose-700 text-xs font-semibold px-2 hover:bg-rose-100 py-1 rounded-md"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* Dynamic Search Interface and Quick Presets */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-gray-900 font-sans">
              Global Geolocation Diagnostic Terminal
            </h3>
            <p className="text-xs text-gray-500 font-medium max-w-2xl">
              Lookup regional latitude/longitude coordinates, local ISPs, currency networks, timezone parameters, or generate a threat reputational index for any active IPv4 target or web domain host.
            </p>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleIPSearch(searchQuery); }}
            className="flex flex-col md:flex-row gap-3.5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter active IP address (e.g., 1.1.1.1) or web domain name (e.g., github.com)..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/60 focus:bg-white rounded-xl border border-gray-150 focus:border-indigo-500 outline-none font-medium text-xs md:text-sm text-gray-800 transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="cursor-pointer px-5 py-3 h-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none w-full md:w-auto shrink-0"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                <span>Resolve Target</span>
              </button>

              <button
                type="button"
                onClick={triggerAutoDetection}
                disabled={isLoading}
                title="Identify My Network Location"
                className="cursor-pointer p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100 rounded-xl transition-all duration-200 disabled:opacity-40"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-gray-50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0 mr-1">
              Popular Presets
            </span>
            {presetIPs.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => warpToTargetIP(preset.value)}
                className="cursor-pointer px-3 py-1.5 bg-gray-50/70 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 border border-gray-100 hover:border-indigo-200 rounded-xl text-[11px] font-semibold transition-all duration-200"
              >
                {preset.label} &bull; <span className="font-mono text-[10px]">{preset.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Dynamic Coordinates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Visual Map Widget (7 cols) */}
          <div className="lg:col-span-7 h-[420px] lg:h-auto min-h-[420px] bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                <span className="text-xs font-bold text-gray-800 tracking-tight font-sans">
                  OpenStreetMap Vector Tracking Console
                </span>
              </div>
              {activeRecord && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[9px] text-slate-600 font-bold border border-slate-200">
                  {activeRecord.ip}
                </span>
              )}
            </div>

            {/* Render Map Component */}
            <div className="flex-1 pt-3">
              {activeRecord ? (
                <IPMap 
                  latitude={activeRecord.latitude} 
                  longitude={activeRecord.longitude} 
                  ip={activeRecord.ip}
                  city={activeRecord.city}
                  country={activeRecord.country}
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <Globe className="w-10 h-10 text-gray-300 animate-bounce" />
                  <h4 className="text-xs font-bold text-gray-500">Awaiting Target Node Location</h4>
                  <p className="text-[11px] text-gray-400 max-w-xs leading-normal">
                    Search an IP parameter or coordinate to plot the geographical path vector.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Primary Stats Widget Dashboard (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {activeRecord ? (
              <IPDetailsCard 
                record={activeRecord} 
                onAnalyze={executeGeminiAnalysis} 
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm space-y-2 py-12">
                <Compass className="w-8 h-8 text-gray-300 mx-auto" />
                <h4 className="text-xs font-bold text-gray-600">No Location Loaded</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Automatic identification resolves coordinates dynamically. If loopback tests are in progress, our backend resolves local queries gracefully.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Gemini AI Detailed Diagnostics Block */}
        <div className="w-full">
          {activeRecord && (
            <AIPanel 
              analysis={activeRecord.aiAnalysis} 
              isAnalyzing={isAnalyzing} 
              onTrigger={executeGeminiAnalysis} 
              ip={activeRecord.ip}
            />
          )}
        </div>

        {/* Historial diagnostics timeline list */}
        <div className="w-full">
          <ActivityLogList 
            logs={logs} 
            onSelectIP={warpToTargetIP} 
            onClearLogs={clearCachedHistory} 
            activeIp={activeRecord?.ip || ""}
          />
        </div>

      </main>

      {/* Humble footer */}
      <footer className="bg-white border-t border-gray-100 py-6 px-12 text-center text-[11px] text-gray-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 IP Tracker Diagnostics Hub &bull; All telemetry is cached within the local user context.</p>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-150">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            <span className="font-mono text-[9px] uppercase font-bold text-gray-500">Secure Web Sandbox Interface</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
