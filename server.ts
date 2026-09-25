import express from "express";
import path from "path";
import { isIP } from "net";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client strictly according to guidelines
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Utility: Checks if an IP is a private/local subnet
 */
function isPrivateIP(ip: string): boolean {
  if (!ip) return true;
  if (ip === "::1" || ip === "127.0.0.1" || ip.slice(0, 7) === "::ffff:") return true;
  
  const parsed = ip.split(".");
  if (parsed.length === 4) {
    const first = parseInt(parsed[0], 10);
    const second = parseInt(parsed[1], 10);
    if (first === 10) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
    if (first === 192 && second === 168) return true;
  }
  return false;
}

/**
 * Helper: Retrieve public egress IP of our own server for loopback requests
 */
async function getServerEgressIP(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (response.ok) {
      const data = await response.json();
      if (data.ip && !isPrivateIP(data.ip)) {
        return data.ip;
      }
    }
  } catch (err) {
    console.error("Error fetching engine egress fallback IP:", err);
  }
  return "8.8.8.8"; // Robust default fallback if all fails
}

/**
 * Helper: Geolocation resolver that queries multiple free endpoints for maximal reliability
 */
async function geolocateIP(ipAddress: string): Promise<any> {
  // 1. Primary Try: ipapi.co
  try {
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    if (response.ok) {
      const data = await response.json();
      if (data && !data.error) {
        return {
          ip: data.ip || ipAddress,
          city: data.city || "Unknown City",
          region: data.region || "Unknown Region",
          regionCode: data.region_code || "",
          country: data.country_name || "Unknown Country",
          countryCode: data.country || "",
          postal: data.postal || "N/A",
          latitude: typeof data.latitude === "number" ? data.latitude : 0,
          longitude: typeof data.longitude === "number" ? data.longitude : 0,
          timezone: data.timezone || "UTC",
          asn: data.asn || "Unknown",
          org: data.org || "Unknown ISP",
          currency: data.currency || "USD",
        };
      }
    }
  } catch (err) {
    console.warn("Primary IP Geolocation API failed, trying failover...", err);
  }

  // 2. Secondary Try: ip-api.com
  try {
    const response = await fetch(`http://ip-api.com/json/${ipAddress}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.status === "success") {
        return {
          ip: data.query || ipAddress,
          city: data.city || "Unknown City",
          region: data.regionName || "Unknown Region",
          regionCode: data.region || "",
          country: data.country || "Unknown Country",
          countryCode: data.countryCode || "",
          postal: data.zip || "N/A",
          latitude: typeof data.lat === "number" ? data.lat : 0,
          longitude: typeof data.lon === "number" ? data.lon : 0,
          timezone: data.timezone || "UTC",
          asn: data.as ? data.as.split(" ")[0] : "Unknown",
          org: data.isp || data.org || "Unknown ISP",
          currency: "USD",
        };
      }
    }
  } catch (err) {
    console.error("Failover Geolocation API failed as well:", err);
  }

  // 3. Last-ditch Try: freeipapi.com
  try {
    const response = await fetch(`https://freeipapi.com/api/json/${ipAddress}`);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        return {
          ip: data.ipAddress || ipAddress,
          city: data.cityName || "Unknown City",
          region: data.regionName || "Unknown Region",
          regionCode: "",
          country: data.countryName || "Unknown Country",
          countryCode: data.countryCode || "",
          postal: data.zipCode || "N/A",
          latitude: typeof data.latitude === "number" ? data.latitude : 0,
          longitude: typeof data.longitude === "number" ? data.longitude : 0,
          timezone: data.timeZone || "UTC",
          asn: "Unknown",
          org: "Unknown Network",
          currency: "USD",
        };
      }
    }
  } catch (err) {
    console.error("All geolocation fallback routes failed:", err);
  }

  // Return a generic placeholder fallback of coordinates
  return {
    ip: ipAddress,
    city: "Mountain View",
    region: "California",
    regionCode: "CA",
    country: "United States",
    countryCode: "US",
    postal: "94043",
    latitude: 37.4056,
    longitude: -122.0775,
    timezone: "America/Los_Angeles",
    asn: "AS15169",
    org: "Google LLC",
    currency: "USD",
  };
}

// ==========================================
// API ENDPOINTS
// ==========================================

/**
 * Endpoint to auto-detect client IP and return coordinates
 */
app.get("/api/ip/detect", async (req, res) => {
  try {
    let clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    if (Array.isArray(clientIp)) {
      clientIp = clientIp[0];
    }
    if (clientIp.includes(",")) {
      clientIp = clientIp.split(",")[0].trim();
    }

    // Clean IPv6 to IPv4 translation if applicable
    if (clientIp.startsWith("::ffff:")) {
      clientIp = clientIp.substring(7);
    }

    // fallback for local hosting
    if (isPrivateIP(clientIp)) {
      clientIp = await getServerEgressIP();
    }

    const payload = await geolocateIP(clientIp);
    res.json(payload);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to auto-detect connection geolocation", details: error.message });
  }
});

/**
 * Endpoint to resolve an IP or resolve a domain first
 */
app.get("/api/ip/resolve", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Search query query parameter is required" });
    }

    const cleanedQuery = query.trim().toLowerCase();
    let targetIp = cleanedQuery;

    // Check if it's already an IP address
    if (isIP(cleanedQuery) === 0) {
      // It is a domain! Resolve it to IPv4
      try {
        const addresses = await dns.promises.resolve4(cleanedQuery);
        if (addresses && addresses.length > 0) {
          targetIp = addresses[0];
        } else {
          return res.status(404).json({ error: `Could not resolve domain ${cleanedQuery} to an active IPv4 address` });
        }
      } catch (dnsErr: any) {
        return res.status(400).json({ error: `DNS query failed representing host: ${cleanedQuery}`, details: dnsErr.message });
      }
    }

    const payload = await geolocateIP(targetIp);
    res.json(payload);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to resolve search target", details: error.message });
  }
});

/**
 * Lazy AI Analysis helper triggered on-demand via the dashboard
 */
app.post("/api/ip/analyze", async (req, res) => {
  try {
    const record = req.body;
    if (!record || !record.ip) {
      return res.status(400).json({ error: "Missing active IP record object for AI intelligence analysis" });
    }

    const ai = getGeminiClient();

    const prompt = `Perform a comprehensive technical network, security, and reputation analysis for the following global endpoint:
IP Address: ${record.ip}
City: ${record.city}
Region: ${record.region} (${record.regionCode})
Country: ${record.country}
ISP/Organization: ${record.org}
Autonomous System: ${record.asn}

Please produce a precise, JSON intelligence profile strictly conforming to the response schema. 
Use your knowledge of autonomous web systems, network infrastructure, hosting hubs, residential ISPs, and carrier blocks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite cybersecurity threat analyst and infrastructure specialist. You analyze IP ranges, hosts, and routing profiles to help network admins run clean diagnostics.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            networkType: {
              type: Type.STRING,
              description: "Must be exactly one of: 'Residential', 'Datacenter/Hosting', 'Commercial/Enterprise', 'Mobile/Cellular', 'VPN/Proxy/Tor Node'."
            },
            reputation: {
              type: Type.STRING,
              description: "Must be exactly one of: 'Safe/Clean', 'Low Risk', 'Suspicious/Medium', 'High Risk'."
            },
            asOwner: {
              type: Type.STRING,
              description: "Name of the legal company owning or administering this Autononmous System block."
            },
            threatDescription: {
              type: Type.STRING,
              description: "A professional 3-sentence summary of the threat history, port profiles, or abuse metrics associated generally with this class of network."
            },
            securityPractices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 standard security recommendations or verification gates to deploy for connection requests originating from this host category."
            },
            hostName: {
              type: Type.STRING,
              description: "Estimated pointer PTR record or canonical hostname suffix."
            },
            useCase: {
              type: Type.STRING,
              description: "Likely typical endpoint utility (e.g. AWS server hosting, residential home connection, cellular roaming client, etc)."
            }
          },
          required: ["networkType", "reputation", "asOwner", "threatDescription", "securityPractices", "hostName", "useCase"]
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error("No response output from Gemini AI model");
    }

    const aiAnalysis = JSON.parse(bodyText.trim());
    res.json(aiAnalysis);
  } catch (error: any) {
    console.error("Gemini context analysis failed:", error);
    res.status(500).json({ error: "Network intelligence model failed to run", details: error.message });
  }
});

// ==========================================
// STATIC FILES & VITE BOOTSTRAP
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[IP Tracker Server] Fullstack service running on http://0.0.0.0:${PORT}`);
  });
}

start();
