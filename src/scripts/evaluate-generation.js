const fs = require("fs");
const path = require("path");
const config = require("../config");
const { groundedness, tokenF1 } = require("../lib/metrics");
const { readJson } = require("../services/document-service");
const { buildContext, requestLlm } = require("../services/llm-service");
const { createRagService } = require("../services/rag-service");

function parseLimit(values, total) {
  const limitIndex = values.indexOf("--limit");
  if (limitIndex === -1) return total;
  const limit = Number(values[limitIndex + 1]);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit phải là số nguyên dương.");
  }
  return Math.min(limit, total);
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function csvValue(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function writeOutputs(results, limit, startedAt) {
  const baselineRows = results.map(item => item.baseline);
  const ragRows = results.map(item => item.rag);
  const output = {
    experiment_name: `baseline-vs-rag-${startedAt.replace(/[:.]/g, "-")}`,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    dataset: "rag-test",
    evaluated_count: limit,
    configuration: {
      top_k: config.topK,
      chunk_size: config.chunkSize,
      chunk_overlap: config.chunkOverlap,
      embedding_model: config.embedding.model,
      llm_model: config.llm.model,
      temperature: 0.1
    },
    summary: {
      baseline_average_token_f1: Number(average(baselineRows.map(row => row.token_f1)).toFixed(6)),
      rag_average_token_f1: Number(average(ragRows.map(row => row.token_f1)).toFixed(6)),
      rag_average_groundedness: Number(average(ragRows.map(row => row.groundedness)).toFixed(6)),
      baseline_average_response_ms: Math.round(average(baselineRows.map(row => row.response_time_ms))),
      rag_average_response_ms: Math.round(average(ragRows.map(row => row.response_time_ms)))
    },
    results
  };

  fs.mkdirSync(path.dirname(config.paths.generationEvaluation), { recursive: true });
  fs.writeFileSync(
    config.paths.generationEvaluation,
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8"
  );

  const header = [
    "test_id", "mode", "question", "generated_answer", "gold_answer", "gold_source",
    "token_f1", "groundedness", "response_time_ms", "manual_correctness_0_2",
    "manual_groundedness_0_2", "manual_completeness_0_2", "manual_note"
  ];
  const lines = [header.map(csvValue).join(",")];
  for (const item of results) {
    for (const mode of ["baseline", "rag"]) {
      const row = item[mode];
      lines.push([
        item.test_id, mode, item.question, row.answer, item.gold_answer, item.gold_source,
        row.token_f1, row.groundedness ?? "", row.response_time_ms, "", "", "", ""
      ].map(csvValue).join(","));
    }
  }
  fs.writeFileSync(config.paths.manualEvaluation, `${lines.join("\n")}\n`, "utf8");
  return output;
}

async function main() {
  if (config.embedding.provider !== "api") {
    throw new Error("Thực nghiệm sinh câu trả lời bắt buộc EMBEDDING_PROVIDER=api.");
  }
  if (!config.llm.apiUrl || !config.llm.apiKey || !config.llm.model) {
    throw new Error("Thiếu LLM_API_URL, LLM_API_KEY hoặc LLM_MODEL trong .env.");
  }

  const dataset = readJson(config.paths.ragTest);
  const limit = parseLimit(process.argv.slice(2), dataset.length);
  const selectedItems = dataset.slice(0, limit);
  const ragService = createRagService(config);
  const results = [];
  const startedAt = new Date().toISOString();

  for (const [index, item] of selectedItems.entries()) {
    console.log(`[${index + 1}/${limit}] ${item.test_id}`);

    const baselineStarted = Date.now();
    const baselineAnswer = await requestLlm(
      item.question,
      "",
      config.llm,
      { useContext: false }
    );
    const baselineTime = Date.now() - baselineStarted;

    const retrieved = await ragService.retrieve(item.question, { topK: config.topK });
    const relevant = retrieved.filter(chunk => chunk.score >= config.minSimilarity);
    const context = buildContext(relevant);
    const ragStarted = Date.now();
    const ragAnswer = await requestLlm(
      item.question,
      context,
      config.llm,
      { useContext: true }
    );
    const ragTime = Date.now() - ragStarted;

    results.push({
      test_id: item.test_id,
      topic: item.topic,
      question: item.question,
      gold_answer: item.gold_answer,
      gold_source: item.gold_source,
      baseline: {
        answer: baselineAnswer,
        response_time_ms: baselineTime,
        token_f1: Number(tokenF1(baselineAnswer, item.gold_answer).toFixed(6))
      },
      rag: {
        answer: ragAnswer,
        response_time_ms: ragTime,
        token_f1: Number(tokenF1(ragAnswer, item.gold_answer).toFixed(6)),
        groundedness: Number(groundedness(ragAnswer, context).toFixed(6)),
        retrieved_sources: relevant.map((chunk, position) => ({
          position: position + 1,
          source: chunk.metadata.source,
          heading: chunk.metadata.heading,
          score: Number(chunk.score.toFixed(6))
        }))
      }
    });

    writeOutputs(results, results.length, startedAt);
  }

  const output = writeOutputs(results, limit, startedAt);
  console.log("Thực nghiệm hoàn tất.");
  console.log(`- Baseline token F1: ${output.summary.baseline_average_token_f1}`);
  console.log(`- RAG token F1: ${output.summary.rag_average_token_f1}`);
  console.log(`- RAG groundedness: ${output.summary.rag_average_groundedness}`);
  console.log(`- Kết quả JSON: ${config.paths.generationEvaluation}`);
  console.log(`- Phiếu chấm thủ công: ${config.paths.manualEvaluation}`);
}

main().catch(error => {
  console.error(`Thực nghiệm sinh câu trả lời thất bại: ${error.message}`);
  process.exitCode = 1;
});
