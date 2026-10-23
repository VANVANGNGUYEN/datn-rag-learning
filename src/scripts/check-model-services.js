const config = require("../config");
const { createEmbeddingService } = require("../services/embedding-service");
const { requestLlm } = require("../services/llm-service");

async function main() {
  if (config.embedding.provider !== "api") {
    throw new Error("Đặt EMBEDDING_PROVIDER=api trong .env để kiểm tra mô hình embedding thật.");
  }

  const embeddingService = createEmbeddingService(config.embedding);
  const vector = await embeddingService.embedOne("JavaScript là ngôn ngữ lập trình.");
  if (!Array.isArray(vector) || !vector.length) {
    throw new Error("Mô hình embedding không trả về vector hợp lệ.");
  }

  const llmAnswer = await requestLlm(
    "Hãy trả lời đúng một từ: OK",
    "",
    config.llm,
    { useContext: false }
  );

  console.log("Kết nối mô hình thành công.");
  console.log(`- Embedding model: ${config.embedding.model}`);
  console.log(`- Số chiều vector: ${vector.length}`);
  console.log(`- LLM model: ${config.llm.model}`);
  console.log(`- Phản hồi kiểm tra LLM: ${llmAnswer.slice(0, 100)}`);
}

main().catch(error => {
  console.error(`Kiểm tra mô hình thất bại: ${error.message}`);
  process.exitCode = 1;
});
