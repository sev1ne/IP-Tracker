import { Compass, Info, MapPin, Server, Sparkles, Hash, Wifi, Globe, Copy, Check } from "lucide-react";
import { useState } from "react";
import { IPRecord } from "../types";

interface IPDetailsCardProps {
  record: IPRecord;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export default function IPDetailsCard({ record, onAnalyze, isAnalyzing }: IPDetailsCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const infoItems = [
    {
      label: "IP Geolocation",
      value: record.ip,
      subtext: `${record.city}, ${record.region} (${record.countryCode})`,
      icon: MapPin,
      color: "text-indigo-600 bg-indigo-50",
      copyable: true,
    },
    {
      label: "ISP / Network Owner",
      value: record.org,
      subtext: record.asn || "Unknown Autonomous System",
      icon: Server,
      color: "text-emerald-600 bg-emerald-50",
      copyable: true,
    },
    {
      label: "Timezone Identifier",
      value: record.timezone,
      subtext: `Current UTC reference time`,
      icon: Compass,
      color: "text-amber-600 bg-amber-50",
      copyable: false,
    },
    {
      label: "Global Coordinates",
      value: `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`,
      subtext: "Latitude / Longitude index",
      icon: Globe,
      color: "text-pink-600 bg-pink-50",
      copyable: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md tracking-wider uppercase">
              Selected Node
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-sans mt-1">
            {record.ip}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Originating server node &bull; Postal {record.postal || "N/A"}
          </p>
        </div>

        {/* intelligence trigger button */}
        {!record.aiAnalysis && (
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-300 border font-sans ${
              isAnalyzing
                ? "bg-gray-50 text-gray-400 border-gray-100 pointer-events-none"
                : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-transparent hover:from-indigo-700 hover:to-indigo-800 hover:shadow-md"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "Evaluating AI Risk Profile..." : "Analyze with Gemini Intelligence"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {infoItems.map((item, idx) => {
          const IconComp = item.icon;
          const isCopied = copiedField === item.label;
          return (
            <div
              key={idx}
              className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-white select-all group relative cursor-pointer transition-all duration-200"
              onClick={() => item.copyable && copyToClipboard(item.value, item.label)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${item.color} mt-0.5`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="block text-sm font-semibold text-gray-800 font-sans mt-0.5 truncate">
                    {item.value}
                  </span>
                  <span className="block text-xs text-gray-500 truncate mt-0.5">
                    {item.subtext}
                  </span>
                </div>
              </div>

              {item.copyable && (
                <button
                  className="absolute right-3 top-3 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Copy to clipboard"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-150 text-[11px] text-amber-800 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          The geolocation resolved is verified by the upstream registry network records. Local routing policies, VPN tunnels, and carrier carrier configuration may affect postal coordinate distance accuracy.
        </p>
      </div>
    </div>
  );
}
