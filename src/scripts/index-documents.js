const crypto = require("crypto");
const config = require("../config");
const { createDocumentChunks } = require("../lib/text");
const { loadDocuments } = require("../services/document-service");
const { createEmbeddingService } = require("../services/embedding-service");
const { VectorStore } = require("../services/vector-store");

async function main() {
  const documents = loadDocuments(config);
  const chunks = documents.flatMap(document =>
    createDocumentChunks(document, {
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap
    })
  );

  if (!chunks.length) throw new Error("Không tạo được chunk nào từ học liệu.");

  const embeddingService = createEmbeddingService(config.embedding);
  console.log(`Đang tạo embedding cho ${chunks.length} chunk bằng ${embeddingService.info.provider}/${embeddingService.info.model}...`);
  const vectors = await embeddingService.embedMany(chunks.map(chunk => chunk.text));

  const indexData = {
    version: 1,
    createdAt: new Date().toISOString(),
    embedding: {
      ...embeddingService.info,
      dimensions: vectors[0].length
    },
    chunking: {
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap
    },
    documentCount: documents.length,
    chunkCount: chunks.length,
    chunks: chunks.map((chunk, index) => ({
      ...chunk,
      contentHash: crypto.createHash("sha256").update(chunk.text).digest("hex"),
      vector: vectors[index]
    }))
  };

  const vectorStore = new VectorStore(config.paths.vectorIndex);
  vectorStore.save(indexData);

  console.log("Lập chỉ mục hoàn tất.");
  console.log(`- Tài liệu: ${documents.length}`);
  console.log(`- Chunk: ${chunks.length}`);
  console.log(`- Số chiều vector: ${vectors[0].length}`);
  console.log(`- Chỉ mục: ${config.paths.vectorIndex}`);
}

main().catch(error => {
  console.error(`Lập chỉ mục thất bại: ${error.message}`);
  process.exitCode = 1;
});
