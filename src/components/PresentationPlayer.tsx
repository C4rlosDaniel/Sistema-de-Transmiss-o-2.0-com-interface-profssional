import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

export function PresentationPlayer({ presentationId }: { presentationId: string | null }) {
  const { presentations, media } = useStore();
  const pres = presentations.find((p) => p.id === presentationId);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  const items = (pres?.mediaIds ?? [])
    .map((id) => media.find((m) => m.id === id))
    .filter(Boolean) as ReturnType<typeof useStore>["media"];

  useEffect(() => { setIdx(0); }, [presentationId]);

  useEffect(() => {
    if (!pres || items.length === 0) return;
    const cur = items[idx % items.length];
    if (!cur) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (cur.type === "image") {
      timerRef.current = window.setTimeout(() => {
        setIdx((i) => (pres.loop ? (i + 1) % items.length : Math.min(i + 1, items.length - 1)));
      }, pres.durationMs);
    }
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [idx, items, pres]);

  if (!pres) return <div className="h-full w-full flex items-center justify-center text-white/50 text-sm">Sem apresentação</div>;
  if (items.length === 0) return <div className="h-full w-full flex items-center justify-center text-white/50 text-sm">Apresentação vazia</div>;

  const cur = items[idx % items.length];

  return (
    <div className="h-full w-full bg-black relative">
      {cur.type === "image" ? (
        <img key={cur.id + idx} src={cur.dataUrl} alt="" className="h-full w-full object-contain animate-in fade-in duration-500" />
      ) : (
        <video
          key={cur.id + idx}
          src={cur.dataUrl}
          className="h-full w-full object-contain"
          autoPlay
          muted
          playsInline
          onEnded={() => setIdx((i) => (pres.loop ? (i + 1) % items.length : Math.min(i + 1, items.length - 1)))}
        />
      )}
    </div>
  );
}