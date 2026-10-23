const DEFAULT_STOP_WORDS = new Set([
  "a", "ai", "bi", "bo", "cac", "cach", "can", "chi", "cho", "co", "cua",
  "da", "de", "do", "duoc", "dung", "gi", "giai", "giua", "gon", "hay", "hoac", "hoat",
  "hoc", "khi", "khai", "khong", "la", "lam", "mot", "nao", "ngan", "nghia",
  "neu", "nhu", "niem", "nhung", "o", "phai", "qua", "ra", "sau", "se", "the",
  "thi", "thich", "trong", "tu", "va", "voi", "javascript", "dong"
]);

function removeVietnameseMarks(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeForSearch(value) {
  return removeVietnameseMarks(String(value))
    .toLowerCase()
    .replace(/[^a-z0-9_$\.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeForSearch(value)
    .split(" ")
    .filter(token => token.length > 1 && !DEFAULT_STOP_WORDS.has(token));
}

function splitIntoSentences(value) {
  const compact = String(value).replace(/\s+/g, " ").trim();
  if (!compact) return [];
  return compact
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ỹ0-9`])/u)
    .map(sentence => sentence.trim())
    .filter(Boolean);
}

function splitLongText(text, maxLength) {
  if (text.length <= maxLength) return [text];

  const sentences = splitIntoSentences(text);
  const parts = [];
  let current = "";

  for (const sentence of sentences.length ? sentences : [text]) {
    if (sentence.length > maxLength) {
      if (current) {
        parts.push(current);
        current = "";
      }
      for (let start = 0; start < sentence.length; start += maxLength) {
        parts.push(sentence.slice(start, start + maxLength).trim());
      }
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxLength) {
      parts.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) parts.push(current);
  return parts.filter(Boolean);
}

function parseMarkdownSections(markdown, fallbackHeading) {
  const sections = [];
  let heading = fallbackHeading;
  let contentLines = [];

  function flush() {
    const content = contentLines.join("\n").trim();
    if (content) sections.push({ heading, content });
    contentLines = [];
  }

  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      flush();
      heading = headingMatch[1].trim();
    } else {
      contentLines.push(line);
    }
  }
  flush();

  return sections;
}

function createDocumentChunks(document, options) {
  const maxLength = options.chunkSize;
  const overlapLength = options.chunkOverlap;
  const sections = parseMarkdownSections(document.content, document.title);
  const chunks = [];
  let previousTail = "";

  for (const section of sections) {
    const paragraphs = section.content
      .split(/\n\s*\n/)
      .map(part => part.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .flatMap(part => splitLongText(part, maxLength));

    let current = "";
    const sectionChunks = [];

    for (const paragraph of paragraphs) {
      const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
      if (candidate.length > maxLength && current) {
        sectionChunks.push(current);
        current = paragraph;
      } else {
        current = candidate;
      }
    }
    if (current) sectionChunks.push(current);

    for (const sectionChunk of sectionChunks) {
      const prefix = previousTail ? `${previousTail}\n\n` : "";
      const text = `${prefix}${sectionChunk}`.slice(0, maxLength + overlapLength).trim();
      const chunkIndex = chunks.length + 1;
      chunks.push({
        id: `${document.topicId}-${String(chunkIndex).padStart(4, "0")}`,
        text,
        metadata: {
          topicId: document.topicId,
          topicTitle: document.title,
          source: document.source,
          heading: section.heading,
          chunkIndex
        }
      });
      previousTail = sectionChunk.slice(-overlapLength).trim();
    }
  }

  return chunks;
}

module.exports = {
  createDocumentChunks,
  normalizeForSearch,
  removeVietnameseMarks,
  splitIntoSentences,
  tokenize
};
