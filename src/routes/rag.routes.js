const express = require("express");
const config = require("../config");
const { requireAuth } = require("../middleware/auth");
const { createRagService } = require("../services/rag-service");
const { asyncHandler, httpError } = require("../utils/http");

const router = express.Router();
let ragService;

function getRagService() {
  if (!ragService) ragService = createRagService(config);
  return ragService;
}

router.post("/ask", requireAuth, asyncHandler(async (request, response) => {
  const question = String(request.body.question || "").trim();
  const topicId = String(request.body.topicId || "").trim() || null;
  if (question.length < 3 || question.length > 1000) {
    throw httpError(400, "Câu hỏi phải từ 3 đến 1.000 ký tự.");
  }

  const result = await getRagService().ask(question, { topicId });
  response.json({
    answer: result.answer,
    mode: result.mode,
    sources: result.sources,
    retrieved: result.retrieved.map(item => ({
      source: item.metadata.source,
      heading: item.metadata.heading,
      topicId: item.metadata.topicId,
      score: Number(item.score.toFixed(4))
    }))
  });
}));

module.exports = router;
