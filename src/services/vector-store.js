const fs = require("fs");
const path = require("path");

function dotProduct(first, second) {
  if (first.length !== second.length) {
    throw new Error(`Vector không cùng số chiều: ${first.length} và ${second.length}.`);
  }
  let total = 0;
  for (let index = 0; index < first.length; index += 1) {
    total += first[index] * second[index];
  }
  return total;
}

class VectorStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.index = null;
  }

  save(indexData) {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, `${JSON.stringify(indexData, null, 2)}\n`, "utf8");
    this.index = indexData;
  }

  load() {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`Chưa có chỉ mục vector tại ${this.filePath}. Hãy chạy npm run index.`);
    }
    this.index = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
    return this.index;
  }

  search(queryVector, options = {}) {
    const indexData = this.index || this.load();
    const topK = options.topK || 3;
    const topicId = options.topicId || null;

    return indexData.chunks
      .filter(chunk => !topicId || chunk.metadata.topicId === topicId)
      .map(chunk => ({
        id: chunk.id,
        text: chunk.text,
        metadata: chunk.metadata,
        score: dotProduct(queryVector, chunk.vector)
      }))
      .sort((first, second) => second.score - first.score)
      .slice(0, topK);
  }
}

module.exports = { VectorStore, dotProduct };
