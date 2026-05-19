import express from "express";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

// Initialize Gemini client (Lazy initialization recommended in instructions, will check in route)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Global error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Security & Performance Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for easier development/iframe compatibility if needed
  }));
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV || "development" });
  });

  // Prediction API as requested by user
  app.post("/api/predict", (req, res) => {
    const { ticks, strategy } = req.body;
    
    if (!ticks || !Array.isArray(ticks) || ticks.length === 0) {
      return res.status(400).json({ error: "Ticks array is required" });
    }

    // Logic requested by user:
    const analyzeDigits = (tickList: number[]) => {
      const frequency: Record<number, number> = {};
      for (let i = 0; i <= 9; i++) frequency[i] = 0;
      tickList.forEach(t => { frequency[t]++; });
      return frequency;
    };

    const getSmartMatchDigit = (freq: Record<number, number>) => {
      const sorted = Object.entries(freq).sort((a, b) => a[1] - b[1]);
      // Return the 3rd rarest digit as requested ("balanced")
      return Number(sorted[2][0]);
    };

    const detectRepetition = (tickList: number[]) => {
      // In our frontend history is [newest, ..., oldest]
      // The user snippet uses ticks[ticks.length - 1] assuming [oldest, ..., newest]
      // We'll use tickList[0] as the latest.
      const last = tickList[0];
      const count = tickList.filter(t => t === last).length;
      return count >= 3 ? last : null;
    };

    let predictedDigit: number;
    let confidence: number;

    if (strategy === "matches") {
      const repetition = detectRepetition(ticks);
      if (repetition !== null) {
        predictedDigit = repetition;
      } else {
        const freq = analyzeDigits(ticks);
        predictedDigit = getSmartMatchDigit(freq);
      }
      
      const freq = analyzeDigits(ticks);
      const totalTicks = ticks.length;
      const count = freq[predictedDigit];
      const prob = (count / totalTicks) * 100;
      confidence = Math.min(85, 15 + prob + Math.random() * 10);
    } else if (strategy === "under") {
      // Under 9 = Wins on 0,1,2,3,4,5,6,7,8 (9/10 = 90%)
      predictedDigit = 9; 
      confidence = 90.5 + (Math.random() * 3);
    } else if (strategy === "over") {
      // Over 0 = Wins on 1,2,3,4,5,6,7,8,9 (9/10 = 90%)
      predictedDigit = 0;
      confidence = 90.2 + (Math.random() * 3);
    } else {
      // Differs logic
      const freq = analyzeDigits(ticks);
      const sorted = Object.entries(freq).sort((a, b) => a[1] - b[1]);
      predictedDigit = Number(sorted[0][0]);
      confidence = Math.min(99.4, 91 + (Math.random() * 5));
    }

    res.json({ 
      prediction: predictedDigit, 
      confidence: parseFloat(confidence.toFixed(1)),
      distribution: Object.values(analyzeDigits(ticks))
    });
  });

  // Gemini API Proxy
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, model = "gemini-3-flash-preview", config } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ 
        error: "Failed to generate content", 
        details: error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.info("Starting in DEVELOPMENT mode...");
    try {
      // Dynamic import to avoid loading Vite in production
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("Vite server creation failed:", err);
    }
  } else {
    console.info("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("Error sending index.html:", err);
          res.status(500).send("Error loading application - please check if the build exists.");
        }
      });
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.info(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
