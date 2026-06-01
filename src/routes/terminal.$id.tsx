import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useStore, setSession, onTerminalRefresh } from "@/lib/store";
import { PresentationPlayer } from "@/components/PresentationPlayer";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/terminal/$id")({ component: TerminalScreen });

function TerminalScreen() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { terminals } = useStore();
  const terminal = terminals.find((t) => t.id === id);
  const [tick, setTick] = useState(0);
  const [showUI, setShowUI] = useState(false);

  useEffect(() => onTerminalRefresh(id, () => setTick((t) => t + 1)), [id]);

  useEffect(() => {
    let timeout: number | undefined;
    const show = () => {
      setShowUI(true);
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setShowUI(false), 2500);
    };
    window.addEventListener("mousemove", show);
    window.addEventListener("touchstart", show);
    return () => {
      window.removeEventListener("mousemove", show);
      window.removeEventListener("touchstart", show);
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);

  const toggleFs = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  const exit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setSession(null);
    nav({ to: "/" });
  };

  if (!terminal) {
    return (
      <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p>Terminal não encontrado</p>
        <button onClick={() => nav({ to: "/" })} className="rounded bg-primary px-4 py-2">Voltar</button>
      </div>
    );
  }

  return (
    <div onClick={toggleFs} className="h-screen w-screen bg-black overflow-hidden cursor-pointer relative">
      <PresentationPlayer key={tick} presentationId={terminal.presentationId} />

      {/* Marca d'água discreta no canto inferior direito */}
      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 opacity-50">
        <img src={logo} alt="" className="h-4 w-4" />
        <span className="text-[10px] font-medium text-white/80 tracking-wide">ClubeON</span>
      </div>

      <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center transition-opacity duration-300 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-2 rounded-full bg-black/60 text-white px-3 py-1.5 text-xs backdrop-blur">
          <img src={logo} alt="" className="h-5 w-5" />
          <span className="font-semibold">{terminal.name}</span>
          <span className="text-white/50">·</span>
          <span className="text-white/60">ClubeON CCP</span>
        </div>
        <button onClick={exit} className="flex items-center gap-2 rounded-full bg-black/60 hover:bg-primary text-white px-3 py-1.5 text-xs backdrop-blur transition">
          <LogOut className="h-3 w-3" /> Sair do Terminal
        </button>
      </div>

      {!terminal.presentationId && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white/40">
            <img src={logo} alt="" className="h-24 w-24 mx-auto mb-4 opacity-60" />
            <p className="text-sm">Nenhuma apresentação vinculada</p>
            <p className="text-xs mt-1">Atribua uma apresentação no painel administrativo.</p>
          </div>
        </div>
      )}
    </div>
  );
}