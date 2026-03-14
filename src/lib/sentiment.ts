// Simple keyword-based sentiment analysis for real-time background changes

const positiveWords = new Set([
  "happy", "joy", "love", "great", "wonderful", "amazing", "excellent", "beautiful",
  "grateful", "thankful", "blessed", "excited", "fantastic", "brilliant", "awesome",
  "celebrate", "success", "win", "achieve", "inspire", "hope", "dream", "laugh",
  "smile", "fun", "delight", "paradise", "bliss", "perfect", "magnificent",
]);

const calmWords = new Set([
  "work", "meeting", "project", "deadline", "task", "plan", "review", "report",
  "think", "reflect", "meditate", "peace", "calm", "quiet", "focus", "study",
  "read", "learn", "understand", "analyze", "consider", "ponder", "contemplate",
  "balance", "harmony", "serene", "still", "gentle", "breath", "mindful",
]);

const creativeWords = new Set([
  "create", "imagine", "design", "build", "art", "paint", "draw", "write",
  "compose", "invent", "innovate", "explore", "discover", "experiment", "craft",
  "vision", "muse", "inspire", "color", "shape", "form", "idea", "concept",
  "brainstorm", "sketch", "prototype", "canvas", "melody", "rhythm", "poetry",
]);

const negativeWords = new Set([
  "sad", "angry", "frustrated", "tired", "exhausted", "worried", "anxious",
  "stress", "fear", "pain", "hurt", "lost", "alone", "struggle", "difficult",
  "problem", "issue", "fail", "mistake", "regret", "sorry", "miss", "cry",
]);

export type Sentiment = "positive" | "calm" | "creative" | "melancholy" | "neutral";

export function analyzeSentiment(text: string): Sentiment {
  if (!text || text.length < 10) return "neutral";

  const words = text.toLowerCase().split(/\W+/);
  let scores = { positive: 0, calm: 0, creative: 0, melancholy: 0 };

  for (const word of words) {
    if (positiveWords.has(word)) scores.positive++;
    if (calmWords.has(word)) scores.calm++;
    if (creativeWords.has(word)) scores.creative++;
    if (negativeWords.has(word)) scores.melancholy++;
  }

  const max = Math.max(scores.positive, scores.calm, scores.creative, scores.melancholy);
  if (max === 0) return "neutral";
  if (scores.positive === max) return "positive";
  if (scores.creative === max) return "creative";
  if (scores.melancholy === max) return "melancholy";
  return "calm";
}

export function getSentimentGradient(sentiment: Sentiment): string {
  switch (sentiment) {
    case "positive":
      return "linear-gradient(135deg, hsl(142, 69%, 18%), hsl(160, 60%, 12%), hsl(48, 50%, 15%))";
    case "calm":
      return "linear-gradient(135deg, hsl(213, 60%, 14%), hsl(232, 50%, 16%), hsl(250, 40%, 12%))";
    case "creative":
      return "linear-gradient(135deg, hsl(25, 70%, 16%), hsl(340, 50%, 14%), hsl(280, 40%, 12%))";
    case "melancholy":
      return "linear-gradient(135deg, hsl(220, 30%, 12%), hsl(240, 20%, 10%), hsl(200, 25%, 14%))";
    default:
      return "linear-gradient(135deg, hsl(215, 28%, 10%), hsl(220, 25%, 12%), hsl(210, 30%, 8%))";
  }
}

export function getSentimentLabel(sentiment: Sentiment): string {
  switch (sentiment) {
    case "positive": return "✨ Positive";
    case "calm": return "🌊 Calm";
    case "creative": return "🎨 Creative";
    case "melancholy": return "🌧 Melancholy";
    default: return "⚡ Neutral";
  }
}
