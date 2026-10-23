const { tokenize } = require("./text");

function tokenCounts(text) {
  return tokenize(text).reduce((counts, token) => {
    counts.set(token, (counts.get(token) || 0) + 1);
    return counts;
  }, new Map());
}

function overlapCount(firstCounts, secondCounts) {
  let overlap = 0;
  for (const [token, count] of firstCounts.entries()) {
    overlap += Math.min(count, secondCounts.get(token) || 0);
  }
  return overlap;
}

function tokenF1(generatedAnswer, goldAnswer) {
  const generatedCounts = tokenCounts(generatedAnswer);
  const goldCounts = tokenCounts(goldAnswer);
  const generatedTotal = [...generatedCounts.values()].reduce((sum, count) => sum + count, 0);
  const goldTotal = [...goldCounts.values()].reduce((sum, count) => sum + count, 0);
  if (!generatedTotal || !goldTotal) return 0;

  const overlap = overlapCount(generatedCounts, goldCounts);
  const precision = overlap / generatedTotal;
  const recall = overlap / goldTotal;
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

function groundedness(generatedAnswer, context) {
  const answerCounts = tokenCounts(generatedAnswer);
  const contextCounts = tokenCounts(context);
  const answerTotal = [...answerCounts.values()].reduce((sum, count) => sum + count, 0);
  if (!answerTotal) return 0;
  return overlapCount(answerCounts, contextCounts) / answerTotal;
}

module.exports = { groundedness, tokenF1 };
