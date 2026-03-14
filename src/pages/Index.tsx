import React, { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuid } from "uuid";
import type { Note, Folder, NoteType } from "@/lib/db";
import { getAllNotes, saveNote, deleteNote, getSettings, saveSettings } from "@/lib/db";
import { analyzeSentiment, getSentimentGradient, getSentimentLabel } from "@/lib/sentiment";
import { classifyNote, summarizeText, smartExpand, cleanupText, philosopherLens, predictNextWords, getDailyPrompt } from "@/lib/ai-local";
import { downloadBackup, restoreBackup } from "@/lib/backup";
import { loadGoogleScript, isSignedIn, signIn, checkDriveBackup } from "@/lib/google-drive";
import { Sidebar } from "@/components/Sidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { TimeCapsule } from "@/components/TimeCapsule";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { WeeklyDigest } from "@/components/WeeklyDigest";
import { PersonalityEcho } from "@/components/PersonalityEcho";
import { DriveRecoveryModal } from "@/components/DriveRecoveryModal";
import { toast } from "sonner";

type View = "editor" | "analytics" | "digest" | "echo" | "timeline";

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>("editor");
  const [sentiment, setSentiment] = useState(analyzeSentiment(""));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterFolder, setFilterFolder] = useState<Folder | "All">("All");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Load notes on mount
  useEffect(() => {
    getAllNotes().then(n => {
      setNotes(n);
      if (n.length > 0) setActiveNoteId(n[0].id);
    });
    // Create daily journal if none exists for today
    const today = new Date().toISOString().slice(0, 10);
    getAllNotes().then(allNotes => {
      const hasToday = allNotes.some(n => n.type === "journal" && new Date(n.createdAt).toISOString().slice(0, 10) === today);
      if (!hasToday) {
        const journal: Note = {
          id: uuid(),
          title: `Journal — ${today}`,
          content: `${getDailyPrompt()}\n\n`,
          type: "journal",
          folder: "Journal",
          sentiment: "neutral",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          wordCount: 0,
          tags: [],
        };
        saveNote(journal).then(() => getAllNotes().then(setNotes));
      }
    });
  }, []);

  // Update sentiment in real-time
  useEffect(() => {
    if (activeNote) {
      const s = analyzeSentiment(activeNote.content);
      setSentiment(s);
    }
  }, [activeNote?.content]);

  const createNote = useCallback((type: NoteType = "standard") => {
    const note: Note = {
      id: uuid(),
      title: type === "future-letter" ? "Letter to My Future Self" : "Untitled Note",
      content: "",
      type,
      folder: type === "journal" ? "Journal" : type === "future-letter" ? "Legacy" : "Uncategorized",
      sentiment: "neutral",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount: 0,
      tags: [],
      sealed: false,
    };
    saveNote(note).then(() => {
      setNotes(prev => [note, ...prev]);
      setActiveNoteId(note.id);
      setActiveView("editor");
    });
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const updated = {
        ...n,
        ...updates,
        updatedAt: Date.now(),
        wordCount: (updates.content ?? n.content).split(/\s+/).filter(Boolean).length,
      };
      // Auto-classify
      if (updates.content && n.type === "standard" && n.folder === "Uncategorized") {
        updated.folder = classifyNote(updates.content);
      }
      updated.sentiment = analyzeSentiment(updated.content);
      saveNote(updated);
      return updated;
    }));
    // Update streak
    const today = new Date().toISOString().slice(0, 10);
    getSettings().then(s => {
      if (s.lastWriteDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        saveSettings({
          ...s,
          writingStreak: s.lastWriteDate === yesterday ? s.writingStreak + 1 : 1,
          lastWriteDate: today,
        });
      }
    });
  }, []);

  const removeNote = useCallback((id: string) => {
    deleteNote(id).then(() => {
      setNotes(prev => prev.filter(n => n.id !== id));
      if (activeNoteId === id) {
        setActiveNoteId(notes.find(n => n.id !== id)?.id || null);
      }
    });
    toast.success("Note deleted");
  }, [activeNoteId, notes]);

  const handleAIAction = useCallback((action: string) => {
    if (!activeNote) return;
    let result = activeNote.content;
    switch (action) {
      case "summarize":
        result = summarizeText(activeNote.content);
        toast.success("Summarized!");
        break;
      case "expand":
        result = smartExpand(activeNote.content);
        toast.success("Expanded!");
        break;
      case "cleanup":
        result = cleanupText(activeNote.content);
        toast.success("Cleaned up!");
        break;
      case "stoicism":
      case "existentialism":
      case "buddhism":
        result = activeNote.content + "\n\n---\n" + philosopherLens(activeNote.content, action);
        toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} lens applied!`);
        break;
    }
    updateNote(activeNote.id, { content: result });
  }, [activeNote, updateNote]);

  const handleBackup = useCallback(() => {
    downloadBackup().then(() => toast.success("Vault downloaded!"));
  }, []);

  const handleRestore = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    restoreBackup(file).then(count => {
      toast.success(`Restored ${count} notes!`);
      getAllNotes().then(setNotes);
    }).catch(() => toast.error("Invalid backup file"));
    e.target.value = "";
  }, []);

  const prediction = activeNote
    ? predictNextWords(notes.map(n => n.content), activeNote.content)
    : "";

  const filteredNotes = filterFolder === "All"
    ? notes
    : notes.filter(n => n.folder === filterFolder);

  const bgGradient = getSentimentGradient(sentiment);

  return (
    <div className="h-screen w-screen flex overflow-hidden dynamic-bg" style={{ background: bgGradient }}>
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        className="hidden"
        onChange={handleFileImport}
      />

      {/* Sidebar */}
      <Sidebar
        notes={filteredNotes}
        activeNoteId={activeNoteId}
        onSelectNote={(id) => { setActiveNoteId(id); setActiveView("editor"); }}
        onCreateNote={createNote}
        onDeleteNote={removeNote}
        filterFolder={filterFolder}
        onFilterFolder={setFilterFolder}
        activeView={activeView}
        onViewChange={setActiveView}
        onBackup={handleBackup}
        onRestore={handleRestore}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeView === "editor" && activeNote && (
          activeNote.type === "future-letter" && activeNote.sealed ? (
            <TimeCapsule note={activeNote} onUnseal={(id) => updateNote(id, { sealed: false })} />
          ) : (
            <NoteEditor
              note={activeNote}
              onUpdate={(updates) => updateNote(activeNote.id, updates)}
              onAIAction={handleAIAction}
              prediction={prediction}
              sentimentLabel={getSentimentLabel(sentiment)}
            />
          )
        )}
        {activeView === "editor" && !activeNote && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center glass rounded-2xl p-12 max-w-md">
              <h2 className="text-2xl font-semibold text-foreground mb-2 font-serif">Welcome to Aeterna</h2>
              <p className="text-muted-foreground mb-6">Your thoughts deserve a permanent home.</p>
              <button
                onClick={() => createNote()}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                Create Your First Note
              </button>
            </div>
          </div>
        )}
        {activeView === "analytics" && <AnalyticsDashboard notes={notes} />}
        {activeView === "digest" && <WeeklyDigest notes={notes} />}
        {activeView === "echo" && <PersonalityEcho notes={notes} />}
        {activeView === "timeline" && (
          <div className="flex-1 overflow-y-auto p-8">
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">Life Chronicle</h2>
            <div className="relative border-l-2 border-border ml-4 space-y-6">
              {notes.sort((a, b) => a.createdAt - b.createdAt).map(note => (
                <div key={note.id} className="ml-6 relative">
                  <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-primary" />
                  <button onClick={() => { setActiveNoteId(note.id); setActiveView("editor"); }} className="glass rounded-xl p-4 w-full text-left hover:border-primary/30 transition-all">
                    <p className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    <h3 className="font-medium text-foreground mt-1">{note.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{note.content.slice(0, 120)}</p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pomodoro - floating */}
        <PomodoroTimer />
      </main>
    </div>
  );
};

export default Index;
