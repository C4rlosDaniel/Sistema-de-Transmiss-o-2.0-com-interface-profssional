import { useEffect, useState } from "react";

export type Media = {
  id: string;
  name: string;
  type: "image" | "video";
  dataUrl: string;
  createdAt: number;
};

export type Presentation = {
  id: string;
  name: string;
  mediaIds: string[];
  durationMs: number; // per-image duration
  loop: boolean;
  description?: string; // rich text HTML
  transition?: "fade" | "zoom" | "slide" | "push";
};

export type Terminal = {
  id: string;
  name: string;
  presentationId: string | null;
  active: boolean;
  resolution: string;
  lastSync: number;
};

export type AppState = {
  media: Media[];
  presentations: Presentation[];
  terminals: Terminal[];
};

const KEY = "clubeon_ccp_state_v1";
const CH = "clubeon_ccp_channel";

const defaultState: AppState = {
  media: [],
  presentations: [],
  terminals: [
    {
      id: crypto.randomUUID(),
      name: "Terminal 1",
      presentationId: null,
      active: true,
      resolution: "1920x1080",
      lastSync: Date.now(),
    },
  ],
};

function load(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function save(s: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {
    console.error("Storage quota exceeded", e);
  }
}

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (typeof window === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(CH);
  return channel;
}

type Listener = (s: AppState) => void;
const listeners = new Set<Listener>();
let currentState: AppState | null = null;

function getState(): AppState {
  if (!currentState) currentState = load();
  return currentState;
}

export function setState(updater: (s: AppState) => AppState, broadcast = true) {
  const next = updater(getState());
  currentState = next;
  save(next);
  listeners.forEach((l) => l(next));
  if (broadcast) {
    getChannel()?.postMessage({ type: "state", state: next });
  }
}

export function pingTerminal(terminalId: string) {
  getChannel()?.postMessage({ type: "refresh", terminalId });
  setState((s) => ({
    ...s,
    terminals: s.terminals.map((t) =>
      t.id === terminalId ? { ...t, lastSync: Date.now() } : t
    ),
  }));
}

export function onTerminalRefresh(terminalId: string, cb: () => void) {
  const ch = getChannel();
  if (!ch) return () => {};
  const handler = (e: MessageEvent) => {
    if (e.data?.type === "refresh" && e.data.terminalId === terminalId) cb();
  };
  ch.addEventListener("message", handler);
  return () => ch.removeEventListener("message", handler);
}

if (typeof window !== "undefined") {
  getChannel()?.addEventListener("message", (e) => {
    if (e.data?.type === "state") {
      currentState = e.data.state;
      listeners.forEach((l) => l(e.data.state));
    }
  });
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        currentState = JSON.parse(e.newValue);
        listeners.forEach((l) => l(currentState!));
      } catch {}
    }
  });
}

export function useStore(): AppState {
  const [s, setS] = useState<AppState>(() => getState());
  useEffect(() => {
    const l: Listener = (n) => setS(n);
    listeners.add(l);
    setS(getState());
    return () => {
      listeners.delete(l);
    };
  }, []);
  return s;
}

// Auth (session)
const AUTH_KEY = "clubeon_ccp_auth";
export type Session =
  | { kind: "admin" }
  | { kind: "terminal"; terminalId: string }
  | null;

export function getSession(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function setSession(s: Session) {
  if (s) sessionStorage.setItem(AUTH_KEY, JSON.stringify(s));
  else sessionStorage.removeItem(AUTH_KEY);
}

export function useSession(): Session {
  const [s, setS] = useState<Session>(() => getSession());
  useEffect(() => {
    const handler = () => setS(getSession());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return s;
}

// helpers
export function addMedia(files: FileList | File[]) {
  const arr = Array.from(files);
  return Promise.all(
    arr.map(
      (file) =>
        new Promise<Media>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const m: Media = {
              id: crypto.randomUUID(),
              name: file.name,
              type: file.type.startsWith("video") ? "video" : "image",
              dataUrl: String(reader.result),
              createdAt: Date.now(),
            };
            resolve(m);
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    )
  ).then((items) => {
    setState((s) => ({ ...s, media: [...items, ...s.media] }));
    return items;
  });
}

export function deleteMediaFromLibrary(id: string) {
  setState((s) => ({
    ...s,
    media: s.media.filter((m) => m.id !== id),
    presentations: s.presentations.map((p) => ({
      ...p,
      mediaIds: p.mediaIds.filter((mid) => mid !== id),
    })),
  }));
}

export function renameMedia(id: string, name: string) {
  setState((s) => ({
    ...s,
    media: s.media.map((m) => (m.id === id ? { ...m, name } : m)),
  }));
}

export function createPresentation(name: string): string {
  const id = crypto.randomUUID();
  setState((s) => ({
    ...s,
    presentations: [
      ...s.presentations,
      { id, name, mediaIds: [], durationMs: 5000, loop: true, description: "", transition: "fade" },
    ],
  }));
  return id;
}

export function updatePresentation(id: string, patch: Partial<Presentation>) {
  setState((s) => ({
    ...s,
    presentations: s.presentations.map((p) =>
      p.id === id ? { ...p, ...patch } : p
    ),
  }));
}

export function deletePresentation(id: string) {
  setState((s) => ({
    ...s,
    presentations: s.presentations.filter((p) => p.id !== id),
    terminals: s.terminals.map((t) =>
      t.presentationId === id ? { ...t, presentationId: null } : t
    ),
  }));
}

export function createTerminal(name: string) {
  setState((s) => ({
    ...s,
    terminals: [
      ...s.terminals,
      {
        id: crypto.randomUUID(),
        name,
        presentationId: null,
        active: true,
        resolution: "1920x1080",
        lastSync: Date.now(),
      },
    ],
  }));
}

export function updateTerminal(id: string, patch: Partial<Terminal>) {
  setState((s) => ({
    ...s,
    terminals: s.terminals.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  }));
}

export function deleteTerminal(id: string) {
  setState((s) => ({
    ...s,
    terminals: s.terminals.filter((t) => t.id !== id),
  }));
}