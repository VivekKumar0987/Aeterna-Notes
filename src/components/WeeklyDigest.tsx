import React, { useMemo } from "react";
import type { Note } from "@/lib/db";
import { summarizeText } from "@/lib/ai-local";
import { analyzeSentiment, getSentimentLabel } from "@/lib/sentiment";

interface Props { notes: Note[]; }

export const WeeklyDigest: React.FC<Props> = ({ notes }) => {
  const weekNotes = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return notes.filter(n => n.updatedAt > weekAgo);
  }, [notes]);

  const summary = useMemo(() => {
    const allText = weekNotes.map(n => n.content).join(". ");
    return summarizeText(allText);
  }, [weekNotes]);

  const dominantSentiment = useMemo(() => {
    if (weekNotes.length === 0) return "neutral";
    const sentiments = weekNotes.map(n => analyzeSentiment(n.content));
    const counts: Record<string, number> = {};
    sentiments.forEach(s => counts[s] = (counts[s] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
  }, [weekNotes]);

  // Extract action items (lines starting with - [ ] or TODO or action:)
  const actionItems = useMemo(() => {
    const items: string[] = [];
    weekNotes.forEach(n => {
      n.content.split("\n").forEach(line => {
        const l = line.trim().toLowerCase();
        if (l.startsWith("- [ ]") || l.startsWith("todo") || l.includes("action:")) {
          items.push(line.trim());
        }
      });
    });
    return items;
  }, [weekNotes]);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Weekly Digest</h2>
      <p className="text-sm text-muted-foreground mb-8">Your thoughts from the past 7 days</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{weekNotes.length}</p>
          <p className="text-xs text-muted-foreground">Notes This Week</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{weekNotes.reduce((a, n) => a + n.wordCount, 0)}</p>
          <p className="text-xs text-muted-foreground">Words Written</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-foreground">{getSentimentLabel(dominantSentiment as any)}</p>
          <p className="text-xs text-muted-foreground">Dominant Mood</p>
        </div>
      </div>

      <div className="glass rounded-xl p-6 mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">AI Summary</h3>
        <p className="text-muted-foreground leading-relaxed">{summary || "Write more notes this week to generate a summary."}</p>
      </div>

      {actionItems.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Action Items</h3>
          <ul className="space-y-2">
            {actionItems.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
