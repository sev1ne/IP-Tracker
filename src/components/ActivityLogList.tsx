import { History, Search, Trash2, Globe, MapPin, Compass, ArrowRight } from "lucide-react";
import { useState } from "react";
import { ActivityLog } from "../types";

interface ActivityLogListProps {
  logs: ActivityLog[];
  onSelectIP: (ip: string) => void;
  onClearLogs: () => void;
  activeIp: string;
}

export default function ActivityLogList({ logs, onSelectIP, onClearLogs, activeIp }: ActivityLogListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.ip.toLowerCase().includes(term) ||
      log.city.toLowerCase().includes(term) ||
      log.countryName.toLowerCase().includes(term) ||
      log.org.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Historical Diagnostics Log</h3>
            <p className="text-xs text-gray-500 font-medium">{logs.length} previous scans cached locally</p>
          </div>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-lg text-xs font-semibold border border-gray-150 transition-all duration-300"
            title="Wipe persistent telemetry"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Diagnostics</span>
          </button>
        )}
      </div>

      {logs.length > 0 ? (
        <div className="space-y-3">
          
          {/* Inner log seeker bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search history by IP, city, network, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-medium pl-9 pr-4 py-2 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-xl border border-gray-100 focus:border-indigo-500 outline-none transition-all duration-200"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 pr-1">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const isActive = log.ip === activeIp;
                return (
                  <div
                    key={log.id}
                    onClick={() => onSelectIP(log.ip)}
                    className={`flex items-center justify-between py-3 px-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                      isActive
                        ? "bg-indigo-50/70 border border-indigo-100"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      
                      {/* Interactive network indicator badge */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] uppercase font-bold shrink-0 ${
                        log.type === "auto-detect"
                          ? "bg-cyan-50 text-cyan-700"
                          : log.type === "manual-search"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {log.countryCode || "??"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold leading-none ${
                            isActive ? "text-indigo-900" : "text-gray-800"
                          }`}>
                            {log.ip}
                          </span>
                          
                          {/* Diagnostics query type designation */}
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            log.type === "auto-detect"
                              ? "bg-cyan-50 text-cyan-700"
                              : "bg-indigo-50 text-indigo-700"
                          }`}>
                            {log.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-gray-500 truncate max-w-[140px] sm:max-w-[180px]">
                            {log.city}, {log.countryName}
                          </span>
                          <span className="text-[10px] text-gray-300">&bull;</span>
                          <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]" title={log.org}>
                            {log.org}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-gray-400 font-medium">
                No matching diagnostics rows found.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl space-y-1">
          <History className="w-8 h-8 text-gray-300 mx-auto" />
          <h4 className="text-xs font-bold text-gray-500 mt-2">Log Is Workspace Empty</h4>
          <p className="text-[11px] text-gray-400 max-w-[240px] mx-auto leading-relaxed">
            Scan network addresses, search domains, or click the geolocation triggers above to populate the local cache.
          </p>
        </div>
      )}
    </div>
  );
}
