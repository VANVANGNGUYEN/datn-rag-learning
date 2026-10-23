const config = require("../config");
const { createRagService } = require("../services/rag-service");

function parseArguments(values) {
  const argumentsCopy = [...values];
  let topicId = null;
  const topicIndex = argumentsCopy.indexOf("--topic");

  if (topicIndex !== -1) {
    topicId = argumentsCopy[topicIndex + 1];
    argumentsCopy.splice(topicIndex, 2);
  }

  return { question: argumentsCopy.join(" ").trim(), topicId };
}

async function main() {
  const { question, topicId } = parseArguments(process.argv.slice(2));
  if (!question) {
    console.log('Cách dùng: npm run ask -- "Câu hỏi" [--topic ma-chu-de]');
    process.exitCode = 1;
    return;
  }

  const ragService = createRagService(config);
  const result = await ragService.ask(question, { topicId });

  console.log(`\nCâu hỏi: ${question}`);
  if (topicId) console.log(`Giới hạn chủ đề: ${topicId}`);
  console.log(`Chế độ: ${result.mode}`);
  console.log(`\nTrả lời:\n${result.answer}`);
  console.log("\nNguồn truy xuất:");

  if (!result.sources.length) {
    console.log("- Không có nguồn đạt ngưỡng liên quan.");
  } else {
    result.sources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.source} | ${source.heading} | score=${source.score}`);
    });
  }

  console.log("\nTop-k trước khi áp dụng ngưỡng:");
  result.retrieved.forEach((chunk, index) => {
    console.log(`${index + 1}. ${chunk.metadata.source} | ${chunk.metadata.heading} | score=${chunk.score.toFixed(4)}`);
  });
}

main().catch(error => {
  console.error(`Hỏi đáp thất bại: ${error.message}`);
  process.exitCode = 1;
});
