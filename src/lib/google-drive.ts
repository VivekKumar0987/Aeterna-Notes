// Google Drive Sync — client-side only, no backend needed
// Uses Google Identity Services (GIS) for OAuth 2.0
// Uses Google Drive API v3 REST endpoints with drive.file scope

import { exportAll, importAll } from "./db";

const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your OAuth 2.0 Client ID
const SCOPES = "https://www.googleapis.com/auth/drive.file";
const FOLDER_NAME = "Aeterna App Backups";
const BACKUP_FILENAME = "Aeterna_Backup.json";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

let accessToken: string | null = null;
let tokenClient: any = null;

// Load the GIS script dynamically
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("google-gis")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gis";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

// Initialize the token client
function getTokenClient(): Promise<any> {
  return new Promise((resolve) => {
    if (tokenClient) {
      resolve(tokenClient);
      return;
    }
    const g = (window as any).google;
    if (!g?.accounts?.oauth2) {
      throw new Error("Google Identity Services not loaded");
    }
    tokenClient = g.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: () => {}, // overridden per-call
    });
    resolve(tokenClient);
  });
}

// Request access token via Google OAuth popup
export function signIn(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      await loadGoogleScript();
      const client = await getTokenClient();
      client.callback = (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        accessToken = response.access_token;
        resolve(response.access_token);
      };
      client.requestAccessToken({ prompt: "consent" });
    } catch (err) {
      reject(err);
    }
  });
}

// Sign out / revoke token
export function signOut() {
  if (accessToken) {
    const g = (window as any).google;
    g?.accounts?.oauth2?.revoke?.(accessToken);
    accessToken = null;
  }
}

export function isSignedIn(): boolean {
  return !!accessToken;
}

// Helper: authenticated fetch
async function driveFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (!accessToken) throw new Error("Not signed in to Google");
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(url, { ...options, headers });
}

// Find or create the "Aeterna App Backups" folder
async function getOrCreateFolder(): Promise<string> {
  // Search for existing folder
  const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const res = await driveFetch(`${DRIVE_API}/files?q=${q}&fields=files(id,name)&spaces=drive`);
  const data = await res.json();

  if (data.files?.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createRes = await driveFetch(`${DRIVE_API}/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  const folder = await createRes.json();
  return folder.id;
}

// Find existing backup file in the folder
async function findBackupFile(folderId: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${BACKUP_FILENAME}' and '${folderId}' in parents and trashed=false`);
  const res = await driveFetch(`${DRIVE_API}/files?q=${q}&fields=files(id,name,modifiedTime)&spaces=drive`);
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

// Upload backup to Google Drive (create or update)
export async function syncToDrive(): Promise<void> {
  const json = await exportAll();
  const folderId = await getOrCreateFolder();
  const existingFileId = await findBackupFile(folderId);

  const metadata = {
    name: BACKUP_FILENAME,
    mimeType: "application/json",
    ...(existingFileId ? {} : { parents: [folderId] }),
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", new Blob([json], { type: "application/json" }));

  const url = existingFileId
    ? `${UPLOAD_API}/files/${existingFileId}?uploadType=multipart`
    : `${UPLOAD_API}/files?uploadType=multipart`;

  const method = existingFileId ? "PATCH" : "POST";

  const res = await driveFetch(url, { method, body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Upload failed");
  }
}

// Download backup from Google Drive
export async function restoreFromDrive(): Promise<number> {
  const folderId = await getOrCreateFolder();
  const fileId = await findBackupFile(folderId);

  if (!fileId) {
    throw new Error("No backup found on Google Drive");
  }

  const res = await driveFetch(`${DRIVE_API}/files/${fileId}?alt=media`);
  if (!res.ok) throw new Error("Failed to download backup");

  const json = await res.text();
  return importAll(json);
}

// Check if a backup exists on Drive (for recovery mode)
export async function checkDriveBackup(): Promise<boolean> {
  try {
    const folderId = await getOrCreateFolder();
    const fileId = await findBackupFile(folderId);
    return !!fileId;
  } catch {
    return false;
  }
}
