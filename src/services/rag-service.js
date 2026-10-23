const config = require("../config");
const { createEmbeddingService } = require("./embedding-service");
const { VectorStore } = require("./vector-store");
const { answerQuestion } = require("./llm-service");

function validateEmbeddingCompatibility(indexData, embeddingService) {
  const indexed = indexData.embedding;
  const current = embeddingService.info;

  if (indexed.provider !== current.provider || indexed.model !== current.model) {
    throw new Error(
      `Chỉ mục dùng embedding ${indexed.provider}/${indexed.model}, ` +
      `nhưng cấu hình hiện tại là ${current.provider}/${current.model}. Hãy chạy lại npm run index.`
    );
  }
}

function createRagService(customConfig = config) {
  const embeddingService = createEmbeddingService(customConfig.embedding);
  const vectorStore = new VectorStore(customConfig.paths.vectorIndex);
  const indexData = vectorStore.load();
  validateEmbeddingCompatibility(indexData, embeddingService);

  return {
    async retrieve(question, options = {}) {
      const queryVector = await embeddingService.embedOne(question);
      return vectorStore.search(queryVector, {
        topK: options.topK || customConfig.topK,
        topicId: options.topicId
      });
    },

    async ask(question, options = {}) {
      const rankedChunks = await this.retrieve(question, options);
      const relevantChunks = rankedChunks.filter(
        chunk => chunk.score >= customConfig.minSimilarity
      );

      if (!relevantChunks.length) {
        return {
          mode: "no-context",
          answer: "Không tìm thấy nội dung đủ liên quan trong học liệu hiện có.",
          sources: [],
          retrieved: rankedChunks
        };
      }

      const result = await answerQuestion(question, relevantChunks, customConfig.llm);
      return { ...result, retrieved: rankedChunks };
    }
  };
}

module.exports = { createRagService, validateEmbeddingCompatibility };
