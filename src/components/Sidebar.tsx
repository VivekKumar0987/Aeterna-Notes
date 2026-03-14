import React from "react";
import type { Note, Folder, NoteType } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PenLine, FolderOpen, BarChart3, Calendar, Bot, Clock, Download, Upload,
  Plus, Trash2, ChevronLeft, ChevronRight, Scroll, BookOpen
} from "lucide-react";

const FOLDERS: (Folder | "All")[] = ["All", "Work", "Personal", "Ideas", "Journal", "Legacy", "Uncategorized"];

const folderColors: Record<string, string> = {
  Work: "bg-blue-500/20 text-blue-400",
  Personal: "bg-pink-500/20 text-pink-400",
  Ideas: "bg-yellow-500/20 text-yellow-400",
  Journal: "bg-emerald-500/20 text-emerald-400",
  Legacy: "bg-purple-500/20 text-purple-400",
  Uncategorized: "bg-muted text-muted-foreground",
  All: "bg-primary/20 text-primary",
};

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: (type?: NoteType) => void;
  onDeleteNote: (id: string) => void;
  filterFolder: Folder | "All";
  onFilterFolder: (f: Folder | "All") => void;
  activeView: string;
  onViewChange: (v: any) => void;
  onBackup: () => void;
  onRestore: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes, activeNoteId, onSelectNote, onCreateNote, onDeleteNote,
  filterFolder, onFilterFolder, activeView, onViewChange,
  onBackup, onRestore, isOpen, onToggle,
}) => {
  return (
    <>
      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-2 z-50 p-1.5 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <aside
        className={`h-screen glass flex flex-col transition-all duration-300 ${
          isOpen ? "w-72" : "w-0 overflow-hidden"
        }`}
      >
        {/* Header */}
        <div className="p-4 pt-12 border-b border-border/50">
          <h1 className="text-lg font-serif font-bold text-foreground tracking-wide">Aeterna</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your Legacy Vault</p>
        </div>

        {/* New Note */}
        <div className="p-3 flex gap-2">
          <button onClick={() => onCreateNote("standard")} className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-all">
            <Plus size={14} /> New Note
          </button>
          <button onClick={() => onCreateNote("future-letter")} className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all" title="Future Letter">
            <Scroll size={14} />
          </button>
        </div>

        {/* Folder Filters */}
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {FOLDERS.map(f => (
            <button
              key={f}
              onClick={() => onFilterFolder(f)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                filterFolder === f ? folderColors[f] + " ring-1 ring-current/30" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 pb-4">
            {notes.map(note => (
              <div
                key={note.id}
                className={`group flex items-start gap-2 p-2.5 rounded-xl cursor-pointer transition-all ${
                  activeNoteId === note.id
                    ? "glass border-primary/20"
                    : "hover:bg-secondary/50"
                }`}
                onClick={() => onSelectNote(note.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {note.type === "future-letter" && <Scroll size={12} className="text-purple-400 shrink-0" />}
                    {note.type === "journal" && <BookOpen size={12} className="text-emerald-400 shrink-0" />}
                    <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{note.content.slice(0, 60) || "Empty note"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${folderColors[note.folder]}`}>{note.folder}</span>
                    <span className="text-[10px] text-muted-foreground">{note.wordCount}w</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Bottom Nav */}
        <div className="p-3 border-t border-border/50 space-y-1">
          {[
            { view: "editor", icon: PenLine, label: "Editor" },
            { view: "timeline", icon: Clock, label: "Life Chronicle" },
            { view: "analytics", icon: BarChart3, label: "Emotion Stats" },
            { view: "digest", icon: Calendar, label: "Weekly Digest" },
            { view: "echo", icon: Bot, label: "Personality Echo" },
          ].map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                activeView === view ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}

          <div className="flex gap-2 pt-2">
            <button onClick={onBackup} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all">
              <Download size={13} /> Download Vault
            </button>
            <button onClick={onRestore} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all">
              <Upload size={13} /> Import Vault
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
