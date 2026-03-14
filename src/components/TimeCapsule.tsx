import React from "react";
import type { Note } from "@/lib/db";
import { Lock, Clock } from "lucide-react";

interface TimeCapsuleProps {
  note: Note;
  onUnseal: (id: string) => void;
}

export const TimeCapsule: React.FC<TimeCapsuleProps> = ({ note, onUnseal }) => {
  const now = Date.now();
  const unlockDate = note.unlockDate || now;
  const isUnlocked = now >= unlockDate;
  const remaining = unlockDate - now;

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="glass rounded-2xl p-10 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          {isUnlocked ? <Clock size={28} className="text-primary" /> : <Lock size={28} className="text-amber-400" />}
        </div>

        <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">{note.title}</h2>

        {isUnlocked ? (
          <>
            <p className="text-muted-foreground mb-6">This time capsule is ready to be opened.</p>
            <button
              onClick={() => onUnseal(note.id)}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Open Time Capsule
            </button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">Sealed until {new Date(unlockDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            <div className="flex justify-center gap-4 mb-6">
              <div className="glass rounded-xl px-4 py-3 text-center min-w-[70px]">
                <p className="text-2xl font-bold text-foreground">{days}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="glass rounded-xl px-4 py-3 text-center min-w-[70px]">
                <p className="text-2xl font-bold text-foreground">{hours}</p>
                <p className="text-xs text-muted-foreground">hours</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">Your words are waiting for the right moment.</p>
          </>
        )}
      </div>
    </div>
  );
};
