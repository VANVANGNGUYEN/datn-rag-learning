const fs = require("fs");
const path = require("path");
const config = require("../config");
const { readJson } = require("../services/document-service");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function uniqueCount(values) {
  return new Set(values).size;
}

function main() {
  const topics = readJson(config.paths.topics);
  const questionBank = readJson(config.paths.questionBank);
  const ragDev = readJson(config.paths.ragDev);
  const ragTest = readJson(config.paths.ragTest);

  assert(topics.length === 10, `Cần đúng 10 chủ đề, hiện có ${topics.length}.`);
  assert(questionBank.length === 120, `Cần đúng 120 câu ngân hàng, hiện có ${questionBank.length}.`);
  assert(ragDev.length === 20, `Cần đúng 20 câu dev, hiện có ${ragDev.length}.`);
  assert(ragTest.length === 50, `Cần đúng 50 câu test, hiện có ${ragTest.length}.`);

  assert(
    uniqueCount(questionBank.map(item => item.question_id)) === questionBank.length,
    "Ngân hàng có question_id bị trùng."
  );
  assert(
    uniqueCount([...ragDev, ...ragTest].map(item => item.test_id)) === ragDev.length + ragTest.length,
    "Tập dev/test có test_id bị trùng."
  );
  assert(
    !ragDev.some(devItem => ragTest.some(testItem => testItem.question === devItem.question)),
    "Câu chữ của tập dev và test không được trùng nhau."
  );

  const validTopicIds = new Set(topics.map(topic => topic.id));
  const validDifficulties = new Set(["easy", "medium", "hard"]);

  for (const topic of topics) {
    const absoluteSource = path.join(config.projectRoot, topic.source);
    assert(fs.existsSync(absoluteSource), `Thiếu học liệu: ${topic.source}`);
    assert(
      questionBank.filter(item => item.topic === topic.id).length === 12,
      `Chủ đề ${topic.id} phải có 12 câu hỏi.`
    );
    assert(
      ragTest.filter(item => item.topic === topic.id).length === 5,
      `Chủ đề ${topic.id} phải có 5 câu test.`
    );
  }

  for (const item of questionBank) {
    assert(validTopicIds.has(item.topic), `${item.question_id} có topic không hợp lệ.`);
    assert(validDifficulties.has(item.difficulty), `${item.question_id} có difficulty không hợp lệ.`);
    assert(Array.isArray(item.options) && item.options.length === 4, `${item.question_id} phải có 4 lựa chọn.`);
    assert(item.options.includes(item.correct_answer), `${item.question_id} có đáp án không nằm trong options.`);
    assert(item.explanation, `${item.question_id} thiếu giải thích.`);
  }

  for (const item of [...ragDev, ...ragTest]) {
    assert(validTopicIds.has(item.topic), `${item.test_id} có topic không hợp lệ.`);
    assert(item.gold_answer && item.gold_source, `${item.test_id} thiếu gold_answer hoặc gold_source.`);
  }

  const distribution = questionBank.reduce((result, item) => {
    result[item.difficulty] = (result[item.difficulty] || 0) + 1;
    return result;
  }, {});

  console.log("Dữ liệu hợp lệ.");
  console.log(`- Chủ đề: ${topics.length}`);
  console.log(`- Ngân hàng câu hỏi: ${questionBank.length}`);
  console.log(`- Phân bố độ khó: easy=${distribution.easy}, medium=${distribution.medium}, hard=${distribution.hard}`);
  console.log(`- Tập phát triển: ${ragDev.length}`);
  console.log(`- Bộ test RAG: ${ragTest.length}`);
}

try {
  main();
} catch (error) {
  console.error(`Kiểm tra dữ liệu thất bại: ${error.message}`);
  process.exitCode = 1;
}
