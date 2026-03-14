import React, { useState, useMemo } from "react";
import type { Note } from "@/lib/db";
import { Bot, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props { notes: Note[]; }

interface Message { role: "user" | "echo"; text: string; }

export const PersonalityEcho: React.FC<Props> = ({ notes }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "echo", text: "I am your Personality Echo — a reflection built from everything you've written. Ask me anything about yourself." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const profile = useMemo(() => {
    const allText = notes.map(n => n.content).join(" ");
    const words = allText.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const freq: Record<string, number> = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(e => e[0]);

    // Folder breakdown
    const folderCounts: Record<string, number> = {};
    notes.forEach(n => folderCounts[n.folder] = (folderCounts[n.folder] || 0) + 1);
    const folderBreakdown = Object.entries(folderCounts).map(([k, v]) => `${k}: ${v}`).join(", ");

    // Dominant sentiment
    const sentCounts: Record<string, number> = {};
    notes.forEach(n => sentCounts[n.sentiment] = (sentCounts[n.sentiment] || 0) + 1);
    const dominantSentiment = Object.entries(sentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

    const avgLength = notes.length > 0 ? Math.round(words.length / notes.length) : 0;

    return { totalWords: words.length, topWords, noteCount: notes.length, avgLength, dominantSentiment, folderBreakdown };
  }, [notes]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("personality-echo", {
        body: { question: input, profile },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: "echo", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "echo", text: "I'm having trouble reflecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-serif font-semibold text-foreground">Personality Echo</h2>
          <p className="text-xs text-muted-foreground">AI reflection of your writing self • {profile.noteCount} notes analyzed</p>
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
        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Reflecting...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask your echo..."
          disabled={loading}
          className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30 disabled:opacity-50"
        />
        <button onClick={handleSend} disabled={loading} className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
