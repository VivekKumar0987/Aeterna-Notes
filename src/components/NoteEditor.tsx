import React, { useState, useRef, useCallback, useEffect } from "react";
import type { Note, NoteType } from "@/lib/db";
import {
  Sparkles, Wand2, AlignLeft, FileText, Mic, MicOff, Scroll,
  ChevronDown, BookOpen
} from "lucide-react";

interface NoteEditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onAIAction: (action: string) => void;
  prediction: string;
  sentimentLabel: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note, onUpdate, onAIAction, prediction, sentimentLabel,
}) => {
  const [showLens, setShowLens] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const isParchment = note.type === "future-letter";
  const [unlockDate, setUnlockDate] = useState(note.unlockDate ? new Date(note.unlockDate).toISOString().slice(0, 10) : "");

  // Handle Tab for predictive text
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab" && prediction) {
      e.preventDefault();
      onUpdate({ content: note.content + " " + prediction });
    }
  }, [prediction, note.content, onUpdate]);

  // Voice-to-Note
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onUpdate({ content: note.content + " " + transcript });
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, [isRecording, note.content, onUpdate]);

  const sealNote = useCallback(() => {
    if (!unlockDate) return;
    onUpdate({ sealed: true, unlockDate: new Date(unlockDate).getTime() });
  }, [unlockDate, onUpdate]);

  // Link detection: [[note title]]
  const renderLinkedContent = (text: string) => {
    return text.replace(/\[\[(.+?)\]\]/g, '🔗 $1');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 glass-subtle border-b border-border/30">
        <div className="flex items-center gap-3">
          {isParchment && <Scroll size={16} className="text-amber-400" />}
          {note.type === "journal" && <BookOpen size={16} className="text-emerald-400" />}
          <input
            value={note.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground w-64"
            placeholder="Note title..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full glass text-muted-foreground">
            {sentimentLabel}
          </span>
          <span className="text-xs text-muted-foreground">{note.wordCount} words</span>
        </div>
      </div>

      {/* AI Toolbar */}
      <div className="flex items-center gap-2 px-6 py-2 border-b border-border/20">
        <button onClick={() => onAIAction("summarize")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-primary/10 hover:bg-primary/20 text-primary transition-all">
          <FileText size={13} /> Summarize
        </button>
        <button onClick={() => onAIAction("expand")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-primary/10 hover:bg-primary/20 text-primary transition-all">
          <Wand2 size={13} /> Smart Expand
        </button>
        <button onClick={() => onAIAction("cleanup")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-primary/10 hover:bg-primary/20 text-primary transition-all">
          <AlignLeft size={13} /> AI Cleanup
        </button>

        {/* Philosopher Lens */}
        <div className="relative">
          <button onClick={() => setShowLens(!showLens)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all">
            <Sparkles size={13} /> Lens <ChevronDown size={11} />
          </button>
          {showLens && (
            <div className="absolute top-full left-0 mt-1 glass rounded-xl p-1 z-20 min-w-[160px]">
              {["stoicism", "existentialism", "buddhism"].map(lens => (
                <button
                  key={lens}
                  onClick={() => { onAIAction(lens); setShowLens(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary/50 text-foreground capitalize transition-all"
                >
                  {lens}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Voice */}
        <button onClick={toggleRecording} className={`p-2 rounded-lg transition-all ${isRecording ? "bg-destructive/20 text-destructive ai-pulse" : "bg-secondary hover:bg-secondary/80 text-muted-foreground"}`}>
          {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
      </div>

      {/* Future Letter unlock date */}
      {isParchment && !note.sealed && (
        <div className="flex items-center gap-3 px-6 py-2 parchment border-b border-border/20">
          <span className="text-xs text-amber-400/80">Unlock Date:</span>
          <input
            type="date"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            className="bg-transparent text-sm text-foreground outline-none border border-border/30 rounded px-2 py-1"
          />
          <button onClick={sealNote} className="px-3 py-1 rounded-lg text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-all">
            🔒 Seal Letter
          </button>
        </div>
      )}

      {/* Editor area */}
      <div className="flex-1 relative overflow-hidden">
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onKeyDown={handleKeyDown}
          className={`w-full h-full resize-none outline-none p-6 text-foreground/90 leading-relaxed ${
            isParchment ? "parchment font-serif text-lg" : "bg-transparent"
          }`}
          placeholder={note.type === "journal" ? "Begin your reflection..." : "Start writing your thoughts..."}
          style={{ fontSize: isParchment ? "1.15rem" : undefined }}
        />

        {/* Predictive text ghost */}
        {prediction && (
          <div className="absolute bottom-4 right-6 text-xs text-muted-foreground/50 italic">
            Tab → {prediction}
          </div>
        )}
      </div>
    </div>
  );
};
