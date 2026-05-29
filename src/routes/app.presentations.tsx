import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Plus, Trash2, Eye, Pencil, Check, X, Upload, Image as ImageIcon, Film, ChevronRight } from "lucide-react";
import { useStore, createPresentation, updatePresentation, deletePresentation, addMedia, type Media, type Presentation } from "@/lib/store";

export const Route = createFileRoute("/app/presentations")({ component: Pres });

function Pres() {
  const { presentations, media } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(presentations[0]?.id ?? null);
  const selected = presentations.find((p) => p.id === selectedId) ?? null;

  const handleCreate = () => {
    const name = prompt("Nome da apresentação:");
    if (name) setSelectedId(createPresentation(name));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      <aside className="space-y-2">
        <button onClick={handleCreate} className="w-full flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Nova Apresentação
        </button>
        <div className="space-y-1">
          {presentations.map((p) => (
            <button key={p.id} onClick={() => setSelectedId(p.id)} className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm ${selectedId === p.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}>
              <span className="truncate">{p.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">{p.mediaIds.length} <ChevronRight className="h-3 w-3" /></span>
            </button>
          ))}
          {!presentations.length && <p className="text-sm text-muted-foreground p-4 text-center">Nenhuma apresentação ainda.</p>}
        </div>
      </aside>
      <section>
        {selected ? <Editor pres={selected} media={media} /> : <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">Selecione ou crie uma apresentação.</div>}
      </section>
    </div>
  );
}

function Editor({ pres, media }: { pres: Presentation; media: Media[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(pres.name);
  const [showLib, setShowLib] = useState(false);
  const [preview, setPreview] = useState<Media | null>(null);

  const items = pres.mediaIds.map((id) => media.find((m) => m.id === id)).filter(Boolean) as Media[];

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const added = await addMedia(files);
    updatePresentation(pres.id, { mediaIds: [...pres.mediaIds, ...added.map((a) => a.id)] });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {editingName ? (
          <div className="flex gap-2 items-center">
            <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border px-3 py-2 text-lg font-bold" />
            <button onClick={() => { updatePresentation(pres.id, { name }); setEditingName(false); }} className="p-2 text-primary"><Check className="h-5 w-5" /></button>
            <button onClick={() => { setName(pres.name); setEditingName(false); }} className="p-2"><X className="h-5 w-5" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{pres.name}</h2>
            <button onClick={() => setEditingName(true)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-muted-foreground">Duração (s):</label>
          <input type="number" min={1} value={pres.durationMs / 1000} onChange={(e) => updatePresentation(pres.id, { durationMs: Math.max(1, Number(e.target.value)) * 1000 })} className="w-20 rounded border px-2 py-1 text-sm" />
          <label className="flex items-center gap-1 text-xs ml-3">
            <input type="checkbox" checked={pres.loop} onChange={(e) => updatePresentation(pres.id, { loop: e.target.checked })} /> Loop
          </label>
          <button onClick={() => { if (confirm("Excluir apresentação?")) deletePresentation(pres.id); }} className="ml-3 text-destructive flex items-center gap-1 text-sm"><Trash2 className="h-4 w-4" /> Excluir</button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" multiple accept="image/*,video/mp4" className="hidden" onChange={(e) => onUpload(e.target.files)} />
        <button onClick={() => inputRef.current?.click()} className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"><Upload className="h-4 w-4" /> Upload</button>
        <button onClick={() => setShowLib((v) => !v)} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium">{showLib ? "Ocultar" : "Adicionar da"} Biblioteca</button>
      </div>

      {showLib && (
        <div className="rounded-lg border p-4 bg-card">
          <p className="text-sm font-medium mb-3">Clique para adicionar à apresentação</p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {media.map((m) => {
              const added = pres.mediaIds.includes(m.id);
              return (
                <button key={m.id} onClick={() => updatePresentation(pres.id, { mediaIds: added ? pres.mediaIds.filter((x) => x !== m.id) : [...pres.mediaIds, m.id] })} className={`relative aspect-video overflow-hidden rounded border-2 ${added ? "border-primary" : "border-transparent"}`}>
                  {m.type === "image" ? <img src={m.dataUrl} alt="" className="w-full h-full object-cover" /> : <video src={m.dataUrl} className="w-full h-full object-cover" muted />}
                  {added && <div className="absolute inset-0 bg-primary/30 flex items-center justify-center"><Check className="h-6 w-6 text-white" /></div>}
                </button>
              );
            })}
            {!media.length && <p className="col-span-full text-sm text-muted-foreground">Biblioteca vazia.</p>}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-3">Mídias da apresentação ({items.length})</h3>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground text-sm">Nenhuma mídia. Envie ou selecione da biblioteca.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((m, idx) => (
              <div key={m.id + idx} className="group rounded-lg border bg-card overflow-hidden">
                <div className="relative aspect-video bg-black">
                  {m.type === "image" ? <img src={m.dataUrl} className="w-full h-full object-cover" alt="" /> : <video src={m.dataUrl} className="w-full h-full object-cover" muted />}
                  <button onClick={() => setPreview(m)} className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition">
                    <Eye className="h-7 w-7 text-white opacity-0 group-hover:opacity-100" />
                  </button>
                  <span className="absolute top-2 left-2 rounded bg-black/70 text-white text-[10px] px-2 py-0.5">#{idx + 1}</span>
                </div>
                <div className="p-2 flex items-center justify-between gap-2">
                  <span className="text-xs truncate flex items-center gap-1">{m.type === "image" ? <ImageIcon className="h-3 w-3" /> : <Film className="h-3 w-3" />} {m.name}</span>
                  <button onClick={() => { if (confirm("Remover desta apresentação? A mídia continua na biblioteca.")) updatePresentation(pres.id, { mediaIds: pres.mediaIds.filter((_, i) => i !== idx) }); }} className="text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div onClick={() => setPreview(null)} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 cursor-zoom-out">
          {preview.type === "image" ? <img src={preview.dataUrl} className="max-h-full max-w-full object-contain" alt="" /> : <video src={preview.dataUrl} className="max-h-full max-w-full" controls autoPlay />}
        </div>
      )}
    </div>
  );
}