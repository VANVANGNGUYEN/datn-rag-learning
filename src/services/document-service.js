const fs = require("fs");
const path = require("path");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Không tìm thấy ${filePath}. Hãy chạy npm run generate:data trước.`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadDocuments(config) {
  const topics = readJson(config.paths.topics);
  return topics.map(topic => {
    const absoluteSource = path.join(config.projectRoot, topic.source);
    if (!fs.existsSync(absoluteSource)) {
      throw new Error(`Không tìm thấy học liệu của chủ đề ${topic.id}: ${topic.source}`);
    }

    return {
      topicId: topic.id,
      title: topic.title,
      source: topic.source.replace(/\\/g, "/"),
      content: fs.readFileSync(absoluteSource, "utf8")
    };
  });
}

module.exports = { loadDocuments, readJson };
