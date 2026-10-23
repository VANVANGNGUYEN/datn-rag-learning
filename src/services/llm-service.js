const { splitIntoSentences, tokenize } = require("../lib/text");

function buildContext(retrievedChunks) {
  return retrievedChunks
    .map((chunk, index) => {
      const sourceNumber = index + 1;
      return [
        `[Nguồn ${sourceNumber}: ${chunk.metadata.source} | Mục: ${chunk.metadata.heading}]`,
        chunk.text
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

function uniqueSources(retrievedChunks) {
  const seen = new Set();
  return retrievedChunks
    .filter(chunk => {
      const key = `${chunk.metadata.source}|${chunk.metadata.heading}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(chunk => ({
      source: chunk.metadata.source,
      heading: chunk.metadata.heading,
      topicId: chunk.metadata.topicId,
      score: Number(chunk.score.toFixed(4))
    }));
}

function extractiveAnswer(question, retrievedChunks) {
  const queryTokens = new Set(tokenize(question));
  const candidates = [];
  const chunksWithHeadingScore = retrievedChunks.map(chunk => ({
    chunk,
    headingOverlap: tokenize(chunk.metadata.heading)
      .filter(token => queryTokens.has(token)).length
  }));
  const bestHeadingOverlap = Math.max(
    0,
    ...chunksWithHeadingScore.map(item => item.headingOverlap)
  );
  const answerChunks = bestHeadingOverlap > 0
    ? chunksWithHeadingScore.filter(item => item.headingOverlap === bestHeadingOverlap)
    : chunksWithHeadingScore;

  answerChunks.forEach(({ chunk, headingOverlap }, chunkIndex) => {
    splitIntoSentences(chunk.text).forEach((sentence, sentenceIndex) => {
      const sentenceTokens = tokenize(sentence);
      const overlap = sentenceTokens.filter(token => queryTokens.has(token)).length;
      const score =
        overlap / Math.max(queryTokens.size, 1) +
        headingOverlap * 0.5 +
        chunk.score * 0.3;
      candidates.push({ sentence, score, chunkIndex, sentenceIndex });
    });
  });

  const selected = candidates
    .sort((first, second) => second.score - first.score)
    .filter((candidate, index, all) => {
      const normalized = candidate.sentence.toLowerCase();
      return all.findIndex(item => item.sentence.toLowerCase() === normalized) === index;
    })
    .slice(0, 2)
    .sort((first, second) => {
      if (first.chunkIndex !== second.chunkIndex) return first.chunkIndex - second.chunkIndex;
      return first.sentenceIndex - second.sentenceIndex;
    });

  if (!selected.length) {
    return "Không tìm thấy nội dung đủ liên quan trong học liệu hiện có.";
  }

  return [
    "[Chế độ trích xuất khi chưa cấu hình LLM]",
    selected.map(item => item.sentence).join(" ")
  ].join("\n");
}

function apiEndpoint(baseUrl, route) {
  const normalized = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(route, normalized).toString();
}

async function requestLlm(question, context, config, options = {}) {
  const useContext = options.useContext !== false;
  const systemMessage = useContext
    ? [
        "Bạn là trợ lý học JavaScript cho sinh viên.",
        "Chỉ trả lời dựa trên NGỮ CẢNH được cung cấp.",
        "Nếu ngữ cảnh không đủ, hãy nói rõ chưa đủ dữ liệu.",
        "Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu và không tự tạo nguồn."
      ].join(" ")
    : [
        "Bạn là trợ lý học JavaScript cho sinh viên.",
        "Trả lời bằng kiến thức sẵn có, bằng tiếng Việt, ngắn gọn và dễ hiểu."
      ].join(" ");
  const userContent = useContext
    ? `NGỮ CẢNH:\n${context}\n\nCÂU HỎI:\n${question}`
    : question;

  const response = await fetch(apiEndpoint(config.apiUrl, "chat/completions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userContent }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Dịch vụ LLM trả lỗi ${response.status}: ${details.slice(0, 300)}`);
  }

  const payload = await response.json();
  const answer = payload.choices?.[0]?.message?.content;
  if (!answer) throw new Error("Dịch vụ LLM không trả về nội dung câu trả lời.");
  return answer.trim();
}

async function answerQuestion(question, retrievedChunks, config) {
  const context = buildContext(retrievedChunks);
  const canUseApi = Boolean(config.apiUrl && config.apiKey && config.model);
  const answer = canUseApi
    ? await requestLlm(question, context, config)
    : extractiveAnswer(question, retrievedChunks);

  return {
    mode: canUseApi ? "llm-api" : "extractive-fallback",
    answer,
    context,
    sources: uniqueSources(retrievedChunks)
  };
}

module.exports = {
  answerQuestion,
  buildContext,
  extractiveAnswer,
  requestLlm,
  uniqueSources
};
