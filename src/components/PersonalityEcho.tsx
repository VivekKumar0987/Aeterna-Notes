import React, { useState, useMemo } from "react";
import type { Note } from "@/lib/db";
import { Bot, Send } from "lucide-react";

interface Props { notes: Note[]; }

interface Message { role: "user" | "echo"; text: string; }

export const PersonalityEcho: React.FC<Props> = ({ notes }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "echo", text: "I am your Personality Echo — a reflection based on everything you've written. Ask me anything." }
  ]);
  const [input, setInput] = useState("");

  // Build a simple vocabulary profile from notes
  const profile = useMemo(() => {
    const allText = notes.map(n => n.content).join(" ");
    const words = allText.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const freq: Record<string, number> = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(e => e[0]);
    return { totalWords: words.length, topWords, noteCount: notes.length };
  }, [notes]);

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes("who am i") || q.includes("about me")) {
      return `Based on ${profile.noteCount} notes and ${profile.totalWords} words, you seem deeply thoughtful. Your most used concepts are: ${profile.topWords.slice(0, 8).join(", ")}. Your writing reveals someone who values introspection.`;
    }
    if (q.includes("style") || q.includes("writing")) {
      return `Your writing style leans toward ${profile.totalWords > 5000 ? "detailed, expansive" : "concise, focused"} expression. You frequently use words like "${profile.topWords.slice(0, 5).join('", "')}".`;
    }
    if (q.includes("advice") || q.includes("suggest")) {
      return `Based on your patterns, I'd echo back: focus on what appears most in your thoughts — ${profile.topWords.slice(0, 3).join(", ")}. Your writing suggests these themes matter deeply to you.`;
    }
    // Generic response using user's vocabulary
    const randomWords = profile.topWords.slice(0, 5);
    return `Reflecting your voice: The themes of ${randomWords.join(", ")} weave through your thoughts. Based on your ${profile.noteCount} entries, your mind gravitates toward these ideas consistently.`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    const echoMsg: Message = { role: "echo", text: generateResponse(input) };
    setMessages(prev => [...prev, userMsg, echoMsg]);
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-serif font-semibold text-foreground">Personality Echo</h2>
          <p className="text-xs text-muted-foreground">A reflection of your writing self</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "glass text-foreground"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask your echo..."
          className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30"
        />
        <button onClick={handleSend} className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
