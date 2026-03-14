import React, { useState } from "react";
import { Cloud, CloudOff, RefreshCw, LogIn, LogOut } from "lucide-react";
import {
  signIn,
  signOut,
  isSignedIn,
  syncToDrive,
  restoreFromDrive,
} from "@/lib/google-drive";
import { toast } from "sonner";

interface Props {
  onRestored: () => void;
}

export const GoogleDriveSync: React.FC<Props> = ({ onRestored }) => {
  const [syncing, setSyncing] = useState(false);
  const [signedIn, setSignedIn] = useState(isSignedIn());

  const handleSignIn = async () => {
    try {
      await signIn();
      setSignedIn(true);
      toast.success("Signed in to Google");
    } catch (err: any) {
      toast.error("Sign-in failed: " + (err.message || "Unknown error"));
    }
  };

  const handleSignOut = () => {
    signOut();
    setSignedIn(false);
    toast.success("Signed out of Google");
  };

  const handleSync = async () => {
    if (!signedIn) {
      await handleSignIn();
      if (!isSignedIn()) return;
      setSignedIn(true);
    }
    setSyncing(true);
    try {
      await syncToDrive();
      toast.success("Synced to Google Drive!");
    } catch (err: any) {
      toast.error("Sync failed: " + (err.message || "Unknown error"));
    } finally {
      setSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (!signedIn) {
      await handleSignIn();
      if (!isSignedIn()) return;
      setSignedIn(true);
    }
    setSyncing(true);
    try {
      const count = await restoreFromDrive();
      toast.success(`Restored ${count} notes from Google Drive!`);
      onRestored();
    } catch (err: any) {
      toast.error(err.message || "Restore failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-1.5">
      {signedIn ? (
        <>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-primary/10 hover:bg-primary/20 text-primary transition-all disabled:opacity-50"
          >
            {syncing ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Cloud size={13} />
            )}
            {syncing ? "Syncing..." : "Sync to Drive"}
          </button>
          <button
            onClick={handleRestore}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} /> Restore from Drive
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-all"
          >
            <LogOut size={11} /> Sign out of Google
          </button>
        </>
      ) : (
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all"
        >
          <LogIn size={13} /> Sign in with Google
        </button>
      )}
    </div>
  );
};
