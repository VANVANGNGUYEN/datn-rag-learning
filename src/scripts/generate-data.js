const fs = require("fs");
const path = require("path");
const config = require("../config");
const knowledge = require("../../data/seed/topic-knowledge");

const optionLabels = ["A", "B", "C", "D"];

function writeJson(fileName, data) {
  const filePath = path.join(config.projectRoot, "data", "generated", fileName);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return filePath;
}

function difficultyForFact(index) {
  if (index < 4) return "easy";
  if (index < 8) return "medium";
  return "hard";
}

function buildConceptQuestion(topic, topicIndex, fact, factIndex) {
  const correctAnswer = fact[1];
  const offsets = [1, 3, 6];
  const distractors = offsets.map(offset => {
    const otherIndex = (factIndex + offset) % topic.facts.length;
    return topic.facts[otherIndex][1];
  });
  const correctPosition = (topicIndex + factIndex) % 4;
  const options = new Array(4);
  options[correctPosition] = correctAnswer;

  let distractorIndex = 0;
  for (let index = 0; index < options.length; index += 1) {
    if (!options[index]) {
      options[index] = distractors[distractorIndex];
      distractorIndex += 1;
    }
  }

  return {
    question_id: `Q-T${String(topicIndex + 1).padStart(2, "0")}-${String(factIndex + 1).padStart(3, "0")}`,
    topic: topic.id,
    difficulty: difficultyForFact(factIndex),
    question_text: `Mô tả nào đúng nhất về “${fact[0]}” trong JavaScript?`,
    options,
    correct_option: optionLabels[correctPosition],
    correct_answer: correctAnswer,
    source: topic.source,
    explanation: correctAnswer
  };
}

function buildApplicationQuestion(topic, topicIndex, application, applicationIndex) {
  const number = topic.facts.length + applicationIndex + 1;
  return {
    question_id: `Q-T${String(topicIndex + 1).padStart(2, "0")}-${String(number).padStart(3, "0")}`,
    topic: topic.id,
    difficulty: application.difficulty,
    question_text: application.question,
    options: application.options,
    correct_option: optionLabels[application.correctIndex],
    correct_answer: application.options[application.correctIndex],
    source: topic.source,
    explanation: application.explanation
  };
}

function buildQuestionBank() {
  return knowledge.flatMap((topic, topicIndex) => [
    ...topic.facts.map((fact, factIndex) =>
      buildConceptQuestion(topic, topicIndex, fact, factIndex)
    ),
    ...topic.applications.map((application, applicationIndex) =>
      buildApplicationQuestion(topic, topicIndex, application, applicationIndex)
    )
  ]);
}

function buildRagDataset(kind) {
  const indexes = kind === "test" ? [0, 2, 4, 6, 8] : [1, 7];
  return knowledge.flatMap((topic, topicIndex) =>
    indexes.map((factIndex, itemIndex) => {
      const fact = topic.facts[factIndex];
      const prefix = kind === "test" ? "RT" : "RD";
      const question = kind === "test"
        ? `Trong JavaScript, “${fact[0]}” có ý nghĩa hoặc hoạt động như thế nào?`
        : `Hãy giải thích ngắn gọn khái niệm “${fact[0]}” khi học JavaScript.`;

      return {
        test_id: `${prefix}-${String(topicIndex + 1).padStart(2, "0")}-${String(itemIndex + 1).padStart(2, "0")}`,
        topic: topic.id,
        question,
        gold_answer: fact[1],
        gold_source: topic.source
      };
    })
  );
}

function main() {
  const topics = knowledge.map((topic, index) => ({
    order: index + 1,
    id: topic.id,
    title: topic.title,
    source: topic.source
  }));
  const questionBank = buildQuestionBank();
  const ragDev = buildRagDataset("dev");
  const ragTest = buildRagDataset("test");

  const files = [
    writeJson("topics.json", topics),
    writeJson("question-bank.json", questionBank),
    writeJson("rag-dev.json", ragDev),
    writeJson("rag-test.json", ragTest),
    writeJson("manifest.json", {
      generated_at: new Date().toISOString(),
      topic_count: topics.length,
      question_count: questionBank.length,
      rag_dev_count: ragDev.length,
      rag_test_count: ragTest.length,
      note: "Dữ liệu mẫu cần được sinh viên và giảng viên rà soát trước khi khảo sát thực tế."
    })
  ];

  console.log("Đã sinh dữ liệu Tuần 2:");
  files.forEach(file => console.log(`- ${path.relative(config.projectRoot, file)}`));
  console.log(`Tổng: ${topics.length} chủ đề, ${questionBank.length} câu ngân hàng, ${ragDev.length} câu dev, ${ragTest.length} câu test.`);
}

main();
