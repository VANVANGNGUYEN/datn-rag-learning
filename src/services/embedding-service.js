const { tokenize } = require("../lib/text");

function hashToken(token) {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizeVector(vector) {
  const length = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (length === 0) return vector;
  return vector.map(value => value / length);
}

function localEmbedding(text, dimensions) {
  const tokens = tokenize(text);
  const vector = new Array(dimensions).fill(0);

  tokens.forEach((token, index) => {
    const tokenHash = hashToken(token);
    const tokenPosition = tokenHash % dimensions;
    const tokenSign = (tokenHash & 1) === 0 ? 1 : -1;
    vector[tokenPosition] += tokenSign;

    if (index < tokens.length - 1) {
      const pairHash = hashToken(`${token}_${tokens[index + 1]}`);
      const pairPosition = pairHash % dimensions;
      const pairSign = (pairHash & 1) === 0 ? 1 : -1;
      vector[pairPosition] += pairSign * 0.5;
    }
  });

  return normalizeVector(vector);
}

function apiEndpoint(baseUrl, route) {
  const normalized = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(route, normalized).toString();
}

async function apiEmbeddings(texts, config) {
  if (!config.apiUrl || !config.apiKey || !config.model) {
    throw new Error(
      "Chế độ embedding api cần EMBEDDING_API_URL, EMBEDDING_API_KEY và EMBEDDING_MODEL."
    );
  }

  const response = await fetch(apiEndpoint(config.apiUrl, "embeddings"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({ model: config.model, input: texts })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Dịch vụ embedding trả lỗi ${response.status}: ${details.slice(0, 300)}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.data) || payload.data.length !== texts.length) {
    throw new Error("Dữ liệu embedding trả về không đúng định dạng hoặc thiếu phần tử.");
  }

  return payload.data
    .sort((first, second) => first.index - second.index)
    .map(item => item.embedding);
}

function createEmbeddingService(config) {
  const provider = config.provider;

  if (provider === "local") {
    return {
      info: {
        provider: "local",
        model: "feature-hashing-v1",
        dimensions: config.dimensions
      },
      embedMany: async texts => texts.map(text => localEmbedding(text, config.dimensions)),
      embedOne: async text => localEmbedding(text, config.dimensions)
    };
  }

  if (provider === "api") {
    return {
      info: { provider: "api", model: config.model, dimensions: null },
      embedMany: async texts => apiEmbeddings(texts, config),
      embedOne: async text => (await apiEmbeddings([text], config))[0]
    };
  }

  throw new Error(`EMBEDDING_PROVIDER không được hỗ trợ: ${provider}`);
}

module.exports = { createEmbeddingService, localEmbedding };
