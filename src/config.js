const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) process.env[key] = value;
  }
}

function numberFromEnv(name, fallback, minimum) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value < minimum) {
    throw new Error(`${name} phải là số lớn hơn hoặc bằng ${minimum}.`);
  }
  return value;
}

loadEnvFile(path.join(projectRoot, ".env"));

const config = {
  projectRoot,
  chunkSize: numberFromEnv("CHUNK_SIZE", 700, 200),
  chunkOverlap: numberFromEnv("CHUNK_OVERLAP", 120, 0),
  topK: Math.floor(numberFromEnv("TOP_K", 3, 1)),
  minSimilarity: numberFromEnv("MIN_SIMILARITY", 0.08, 0),
  embedding: {
    provider: (process.env.EMBEDDING_PROVIDER || "local").toLowerCase(),
    dimensions: Math.floor(numberFromEnv("EMBEDDING_DIMENSIONS", 4096, 64)),
    apiUrl: process.env.EMBEDDING_API_URL || "",
    apiKey: process.env.EMBEDDING_API_KEY || "",
    model: process.env.EMBEDDING_MODEL || ""
  },
  llm: {
    apiUrl: process.env.LLM_API_URL || "",
    apiKey: process.env.LLM_API_KEY || "",
    model: process.env.LLM_MODEL || ""
  },
  server: {
    port: Math.floor(numberFromEnv("PORT", 3000, 1)),
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshTokenDays: Math.floor(numberFromEnv("REFRESH_TOKEN_DAYS", 7, 1)),
    cookieSecure: (process.env.COOKIE_SECURE || "false").toLowerCase() === "true"
  },
  database: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Math.floor(numberFromEnv("DB_PORT", 3306, 1)),
    name: process.env.DB_NAME || "datn_learning",
    user: process.env.DB_USER || "datn_app",
    password: process.env.DB_PASSWORD || ""
  },
  paths: {
    topics: path.join(projectRoot, "data", "generated", "topics.json"),
    questionBank: path.join(projectRoot, "data", "generated", "question-bank.json"),
    ragDev: path.join(projectRoot, "data", "generated", "rag-dev.json"),
    ragTest: path.join(projectRoot, "data", "generated", "rag-test.json"),
    vectorIndex: path.join(projectRoot, "data", "vector-store", "index.json"),
    evaluation: path.join(projectRoot, "data", "evaluation", "retrieval-results.json"),
    generationEvaluation: path.join(projectRoot, "data", "evaluation", "generation-results.json"),
    manualEvaluation: path.join(projectRoot, "data", "evaluation", "manual-evaluation.csv")
  }
};

if (config.chunkOverlap >= config.chunkSize) {
  throw new Error("CHUNK_OVERLAP phải nhỏ hơn CHUNK_SIZE.");
}

module.exports = config;
