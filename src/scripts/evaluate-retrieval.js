const fs = require("fs");
const path = require("path");
const config = require("../config");
const { readJson } = require("../services/document-service");
const { createRagService } = require("../services/rag-service");

function parseDataset(values) {
  const datasetIndex = values.indexOf("--dataset");
  if (datasetIndex === -1) return "test";
  return values[datasetIndex + 1] || "test";
}

async function main() {
  const datasetName = parseDataset(process.argv.slice(2));
  if (!["dev", "test"].includes(datasetName)) {
    throw new Error("--dataset chỉ nhận dev hoặc test.");
  }

  const datasetPath = datasetName === "dev" ? config.paths.ragDev : config.paths.ragTest;
  const dataset = readJson(datasetPath);
  const ragService = createRagService(config);
  const results = [];

  for (const item of dataset) {
    const retrieved = await ragService.retrieve(item.question, { topK: config.topK });
    const rankIndex = retrieved.findIndex(chunk => chunk.metadata.source === item.gold_source);
    results.push({
      test_id: item.test_id,
      topic: item.topic,
      question: item.question,
      gold_source: item.gold_source,
      hit: rankIndex !== -1,
      rank: rankIndex === -1 ? null : rankIndex + 1,
      retrieved: retrieved.map(chunk => ({
        source: chunk.metadata.source,
        heading: chunk.metadata.heading,
        score: Number(chunk.score.toFixed(6))
      }))
    });
  }

  const hits = results.filter(item => item.hit).length;
  const hitRate = hits / results.length;
  const meanReciprocalRank = results.reduce(
    (sum, item) => sum + (item.rank ? 1 / item.rank : 0),
    0
  ) / results.length;

  const output = {
    evaluated_at: new Date().toISOString(),
    dataset: datasetName,
    configuration: {
      top_k: config.topK,
      chunk_size: config.chunkSize,
      chunk_overlap: config.chunkOverlap,
      embedding_provider: config.embedding.provider,
      embedding_model: config.embedding.provider === "local"
        ? "feature-hashing-v1"
        : config.embedding.model
    },
    summary: {
      total: results.length,
      hits,
      hit_at_k: Number(hitRate.toFixed(4)),
      mean_reciprocal_rank: Number(meanReciprocalRank.toFixed(4))
    },
    results
  };

  const outputPath = datasetName === "test"
    ? config.paths.evaluation
    : path.join(path.dirname(config.paths.evaluation), "retrieval-dev-results.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`Đánh giá retrieval trên tập ${datasetName}:`);
  console.log(`- Số câu: ${results.length}`);
  console.log(`- Hit@${config.topK}: ${hits}/${results.length} = ${(hitRate * 100).toFixed(2)}%`);
  console.log(`- MRR: ${meanReciprocalRank.toFixed(4)}`);
  console.log(`- Chi tiết: ${outputPath}`);
}

main().catch(error => {
  console.error(`Đánh giá retrieval thất bại: ${error.message}`);
  process.exitCode = 1;
});
