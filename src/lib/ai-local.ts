// Local AI helpers — keyword and rule-based (no external API needed)

import type { Folder } from "./db";

// Auto-classify based on content keywords
export function classifyNote(text: string): Folder {
  const lower = text.toLowerCase();
  const workKeywords = ["meeting", "project", "deadline", "client", "report", "budget", "team", "task", "agenda", "presentation", "email", "office", "manager", "sprint"];
  const personalKeywords = ["family", "friend", "birthday", "vacation", "health", "home", "dinner", "weekend", "holiday", "relationship", "love", "feeling"];
  const ideasKeywords = ["idea", "concept", "brainstorm", "innovation", "startup", "design", "create", "imagine", "what if", "prototype", "experiment", "hypothesis"];

  let scores = { Work: 0, Personal: 0, Ideas: 0 };
  for (const w of workKeywords) if (lower.includes(w)) scores.Work++;
  for (const w of personalKeywords) if (lower.includes(w)) scores.Personal++;
  for (const w of ideasKeywords) if (lower.includes(w)) scores.Ideas++;

  const max = Math.max(scores.Work, scores.Personal, scores.Ideas);
  if (max === 0) return "Uncategorized";
  if (scores.Work === max) return "Work";
  if (scores.Personal === max) return "Personal";
  return "Ideas";
}

// Simple extractive summarization — returns summary with marker
export function summarizeText(text: string): string {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
  if (sentences.length <= 3) return text;
  const scored = sentences.map((s, i) => ({
    text: s,
    score: (i === 0 ? 3 : 1) + (s.length > 50 ? 2 : 0) + (s.split(" ").length > 8 ? 1 : 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(s => s.text).join(". ") + ".";
}

// Smart expand: turn bullet points into rough paragraphs
export function smartExpand(text: string): string {
  const lines = text.split("\n").filter(l => l.trim());
  return lines.map(line => {
    const clean = line.replace(/^[-•*]\s*/, "").trim();
    if (clean.length < 5) return clean;
    // Check if line is already a full sentence (ends with punctuation)
    const endsWithPunct = /[.!?]$/.test(clean);
    if (endsWithPunct && clean.split(" ").length > 10) return clean;
    return `${clean.charAt(0).toUpperCase()}${clean.slice(1)}${endsWithPunct ? "" : "."} This is an important point worth expanding upon, as it ties into the broader narrative of your thoughts.`;
  }).join("\n\n");
}

// AI Cleanup: fix common issues without mangling content
export function cleanupText(text: string): string {
  let result = text;
  // Collapse multiple spaces (but not newlines)
  result = result.replace(/[^\S\n]{2,}/g, " ");
  // Collapse 3+ newlines into 2
  result = result.replace(/\n{3,}/g, "\n\n");
  // Trim leading/trailing whitespace per line
  result = result.split("\n").map(line => line.trim()).join("\n");
  // Capitalize first letter of each sentence (after . ! ?)
  result = result.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase());
  // Capitalize first character of the entire text
  if (result.length > 0 && /[a-z]/.test(result[0])) {
    result = result[0].toUpperCase() + result.slice(1);
  }
  // Fix common punctuation issues
  result = result.replace(/\s+([.,!?;:])/g, "$1"); // remove space before punctuation
  result = result.replace(/([.,!?;:])([A-Za-z])/g, "$1 $2"); // add space after punctuation if missing
  return result.trim();
}

// Philosopher lens reframe
export function philosopherLens(text: string, lens: string): string {
  const prefix: Record<string, string> = {
    stoicism: "Through the Stoic lens: Focus on what you can control. ",
    existentialism: "From an Existentialist perspective: You are the author of meaning. ",
    buddhism: "With Buddhist mindfulness: Observe without attachment. ",
  };
  const p = prefix[lens] || "";
  return `${p}Reflecting on: "${text.slice(0, 100)}..." — Consider how this thought shapes your inner world and what action it calls for.`;
}

// Predictive text - simple frequency-based
export function predictNextWords(allNotes: string[], currentText: string): string {
  const lastWords = currentText.trim().split(/\s+/).slice(-2).join(" ").toLowerCase();
  if (lastWords.length < 3) return "";
  
  const allText = allNotes.join(" ");
  const words = allText.split(/\s+/);
  
  for (let i = 0; i < words.length - 3; i++) {
    const pair = `${words[i]} ${words[i + 1]}`.toLowerCase();
    if (pair.includes(lastWords)) {
      return words.slice(i + 2, i + 5).join(" ");
    }
  }
  return "";
}

// Generate daily reflection prompt
const prompts = [
  "What are you most grateful for today?",
  "What challenge did you overcome recently?",
  "If you could tell your past self one thing, what would it be?",
  "What small moment brought you unexpected joy?",
  "What would make today meaningful?",
  "What lesson have you learned this week?",
  "Describe a moment of peace from your recent memory.",
  "What's something you've been putting off? Why?",
  "Who made a positive impact on your life recently?",
  "What does your ideal tomorrow look like?",
];

export function getDailyPrompt(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return prompts[dayOfYear % prompts.length];
}
