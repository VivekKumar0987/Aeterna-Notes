import React, { useState } from "react";
import { Cloud, RefreshCw, X } from "lucide-react";
import { signIn, isSignedIn, restoreFromDrive } from "@/lib/google-drive";
import { toast } from "sonner";

interface Props {
  onRestored: () => void;
  onDismiss: () => void;
}

export const DriveRecoveryModal: React.FC<Props> = ({ onRestored, onDismiss }) => {
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    setLoading(true);
    try {
      if (!isSignedIn()) {
        await signIn();
      }
      const count = await restoreFromDrive();
      toast.success(`Restored ${count} notes from Google Drive!`);
      onRestored();
    } catch (err: any) {
      toast.error(err.message || "Restore failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center relative">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Cloud size={26} className="text-primary" />
        </div>

        <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
          Recovery Available
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          No local notes found, but a backup exists on your Google Drive. Would you like to restore it?
        </p>

        <button
          onClick={handleRestore}
          disabled={loading}
          className="w-full px-5 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Restoring...
            </>
          ) : (
            <>
              <Cloud size={16} /> Restore All Notes
            </>
          )}
        </button>

        <button
          onClick={onDismiss}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Start fresh instead
        </button>
      </div>
    </div>
  );
};
