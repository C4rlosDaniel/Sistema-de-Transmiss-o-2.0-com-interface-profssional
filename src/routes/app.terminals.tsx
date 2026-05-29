import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, RefreshCw, ExternalLink, Power, Pencil, Check, X } from "lucide-react";
import { useStore, createTerminal, updateTerminal, deleteTerminal, pingTerminal } from "@/lib/store";

export const Route = createFileRoute("/app/terminals")({ component: Terms });

function Terms() {
  const { terminals, presentations } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleNew = () => {
    const name = prompt("Nome do terminal:");
    if (name) createTerminal(name);
  };

  const openTerminal = (id: string) => {
    window.open(`/terminal/${id}`, "_blank", "noopener");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Atribuições aos Terminais</h1>
          <p className="text-sm text-muted-foreground">Vincule apresentações às telas e sincronize em tempo real.</p>
        </div>
        <button onClick={handleNew} className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo Terminal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {terminals.map((t) => {
          const pres = presentations.find((p) => p.id === t.presentationId);
          return (
            <div key={t.id} className="rounded-lg border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                {editing === t.id ? (
                  <div className="flex gap-1 items-center flex-1">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 rounded border px-2 py-1 text-sm" />
                    <button onClick={() => { updateTerminal(t.id, { name: editName }); setEditing(null); }} className="p-1 text-primary"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditing(null)}><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{t.name}</h3>
                      <button onClick={() => { setEditing(t.id); setEditName(t.name); }} className="text-muted-foreground"><Pencil className="h-3 w-3" /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ID: {t.id.slice(0, 8)}</p>
                  </div>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.active ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>
                  {t.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Apresentação vinculada</label>
                <select value={t.presentationId ?? ""} onChange={(e) => { updateTerminal(t.id, { presentationId: e.target.value || null }); pingTerminal(t.id); }} className="w-full mt-1 rounded border bg-background px-3 py-2 text-sm">
                  <option value="">— nenhuma —</option>
                  {presentations.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Resolução:</span> {t.resolution}</div>
                <div><span className="text-muted-foreground">Sync:</span> {new Date(t.lastSync).toLocaleTimeString()}</div>
              </div>
              <p className="text-xs text-muted-foreground truncate">Mídias: {pres ? pres.mediaIds.length : 0}</p>

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => openTerminal(t.id)} className="flex-1 flex items-center justify-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-2 text-xs font-medium">
                  <ExternalLink className="h-3 w-3" /> Abrir
                </button>
                <button onClick={() => pingTerminal(t.id)} className="flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent">
                  <RefreshCw className="h-3 w-3" /> Atualizar
                </button>
                <button onClick={() => updateTerminal(t.id, { active: !t.active })} className="flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-xs">
                  <Power className="h-3 w-3" />
                </button>
                <button onClick={() => { if (confirm("Excluir terminal?")) deleteTerminal(t.id); }} className="flex items-center justify-center gap-1 rounded-md border border-destructive/40 text-destructive px-3 py-2 text-xs">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}