import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

type PromptOpts = {
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ConfirmOpts = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type DialogItem =
  | { kind: "prompt"; id: number; opts: PromptOpts; resolve: (v: string | null) => void }
  | { kind: "confirm"; id: number; opts: ConfirmOpts; resolve: (v: boolean) => void };

let listeners: ((items: DialogItem[]) => void)[] = [];
let queue: DialogItem[] = [];
let nextId = 1;

function push(item: DialogItem) {
  queue = [...queue, item];
  listeners.forEach((l) => l(queue));
}
function dismiss(id: number) {
  queue = queue.filter((q) => q.id !== id);
  listeners.forEach((l) => l(queue));
}

export const dialog = {
  prompt(opts: PromptOpts) {
    return new Promise<string | null>((resolve) => {
      push({ kind: "prompt", id: nextId++, opts, resolve });
    });
  },
  confirm(opts: ConfirmOpts) {
    return new Promise<boolean>((resolve) => {
      push({ kind: "confirm", id: nextId++, opts, resolve });
    });
  },
};

export function DialogHost() {
  const [items, setItems] = useState<DialogItem[]>(queue);
  useEffect(() => {
    const l = (q: DialogItem[]) => setItems([...q]);
    listeners.push(l);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);

  return (
    <AnimatePresence>
      {items.map((it) => (
        <DialogShell key={it.id} item={it} onClose={() => dismiss(it.id)} />
      ))}
    </AnimatePresence>
  );
}

function DialogShell({ item, onClose }: { item: DialogItem; onClose: () => void }) {
  const [value, setValue] = useState(item.kind === "prompt" ? item.opts.defaultValue ?? "" : "");

  const cancel = () => {
    if (item.kind === "prompt") item.resolve(null);
    else item.resolve(false);
    onClose();
  };
  const confirm = () => {
    if (item.kind === "prompt") item.resolve(value.trim() ? value.trim() : null);
    else item.resolve(true);
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
      if (e.key === "Enter" && item.kind !== "prompt") confirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const destructive = item.kind === "confirm" && item.opts.destructive;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={cancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 6 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 text-white shadow-2xl shadow-black/60"
      >
        <button
          onClick={cancel}
          className="absolute top-3 right-3 rounded-full p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-3 mb-2">
            {destructive && (
              <div className="rounded-full bg-primary/15 p-2 ring-1 ring-primary/30">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold tracking-tight">{item.opts.title}</h3>
              {item.opts.description && (
                <p className="mt-1 text-sm text-white/60">{item.opts.description}</p>
              )}
            </div>
          </div>

          {item.kind === "prompt" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirm();
              }}
              className="mt-4"
            >
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={item.opts.placeholder}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </form>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={cancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              {item.opts.cancelLabel ?? "Cancelar"}
            </button>
            <button
              onClick={confirm}
              className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-lg transition ${
                destructive
                  ? "bg-primary text-primary-foreground shadow-primary/30 hover:brightness-110"
                  : "bg-primary text-primary-foreground shadow-primary/30 hover:brightness-110"
              }`}
            >
              {item.opts.confirmLabel ?? (item.kind === "prompt" ? "Confirmar" : "Sim")}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}