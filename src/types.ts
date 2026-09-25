/**
 * Shared types for the IP Tracker application.
 */

export interface IPAnalysis {
  networkType: "Residential" | "Datacenter/Hosting" | "Commercial/Enterprise" | "Mobile/Cellular" | "VPN/Proxy/Tor Node";
  reputation: "Safe/Clean" | "Low Risk" | "Suspicious/Medium" | "High Risk";
  asOwner: string;
  threatDescription: string;
  securityPractices: string[];
  hostName: string;
  useCase: string;
}

export interface IPRecord {
  ip: string;
  city: string;
  region: string;
  regionCode: string;
  country: string;
  countryCode: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  asn: string;
  org: string;
  currency: string;
  timestamp: string;
  aiAnalysis?: IPAnalysis;
}

export interface ActivityLog {
  id: string;
  ip: string;
  city: string;
  countryCode: string;
  timestamp: string;
  type: "auto-detect" | "manual-search" | "history-click";
  countryName: string;
  org: string;
}
