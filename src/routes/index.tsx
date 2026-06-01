import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Lock, User, Monitor, LogIn } from "lucide-react";
import { useStore, setSession } from "@/lib/store";
import logo from "@/assets/logo.png";
import loginBg from "@/assets/login-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — ClubeON CCP" },
      { name: "description", content: "Acesse o painel de transmissão digital ClubeON CCP." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { terminals } = useStore();
  const [mode, setMode] = useState<"admin" | "terminal">("admin");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const activeTerms = useMemo(() => terminals.filter((t) => t.active), [terminals]);
  const [termId, setTermId] = useState<string>("");
  const [err, setErr] = useState("");

  const handleAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === "Club" && pass === "@4922") {
      setSession({ kind: "admin" });
      navigate({ to: "/app/preview" });
    } else setErr("Credenciais inválidas.");
  };

  const handleTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termId) return setErr("Selecione um terminal.");
    setSession({ kind: "terminal", terminalId: termId });
    navigate({ to: "/terminal/$id", params: { id: termId } });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 bg-[#0b0b0d] text-white">
      <div className="flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <img src={logo} alt="Clube Pirassununga" className="h-14 w-14" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ClubeON <span className="text-primary">CCP</span></h1>
              <p className="text-xs text-white/60">Transmissão Digital Multi-Telas</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-1">Faça seu login<span className="text-primary">.</span></h2>
          <p className="text-sm text-white/60 mb-8">Acesse como administrador ou entre como terminal de exibição.</p>

          <div className="flex gap-2 mb-6 rounded-lg bg-white/5 p-1">
            <button onClick={() => { setMode("admin"); setErr(""); }} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${mode === "admin" ? "bg-primary text-primary-foreground" : "text-white/70 hover:text-white"}`}>
              Administrador
            </button>
            <button onClick={() => { setMode("terminal"); setErr(""); }} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${mode === "terminal" ? "bg-primary text-primary-foreground" : "text-white/70 hover:text-white"}`}>
              Terminal
            </button>
          </div>

          {mode === "admin" ? (
            <form onSubmit={handleAdmin} className="space-y-5">
              <div>
                <label className="block text-sm mb-2">Usuário</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input value={user} onChange={(e) => setUser(e.target.value)} className="w-full rounded-md bg-white/5 border border-white/10 py-3 pl-10 pr-4 outline-none focus:border-primary transition" placeholder="Usuário" autoComplete="username" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full rounded-md bg-white/5 border border-white/10 py-3 pl-10 pr-4 outline-none focus:border-primary" placeholder="••••" />
                </div>
              </div>
              {err && <p className="text-sm text-primary">{err}</p>}
              <button type="submit" className="w-full rounded-md bg-primary hover:bg-[oklch(0.5_0.2_27)] py-3 font-semibold transition flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" /> Entrar
              </button>
            </form>
          ) : (
            <form onSubmit={handleTerminal} className="space-y-5">
              <div>
                <label className="block text-sm mb-2">Selecione o terminal</label>
                <div className="relative">
                  <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <select value={termId} onChange={(e) => setTermId(e.target.value)} className="w-full appearance-none rounded-md bg-white/5 border border-white/10 py-3 pl-10 pr-4 outline-none focus:border-primary">
                    <option value="" className="bg-[#0b0b0d]">— escolher —</option>
                    {activeTerms.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0b0b0d]">{t.name}</option>
                    ))}
                  </select>
                </div>
                {activeTerms.length === 0 && (
                  <p className="mt-2 text-xs text-white/50">Nenhum terminal cadastrado. Entre como administrador para criar.</p>
                )}
              </div>
              {err && <p className="text-sm text-primary">{err}</p>}
              <button type="submit" className="w-full rounded-md bg-primary hover:bg-[oklch(0.5_0.2_27)] py-3 font-semibold transition flex items-center justify-center gap-2">
                <Monitor className="h-4 w-4" /> Entrar como Terminal
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="hidden md:block relative">
        <img src={loginBg} alt="Clube Pirassununga" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/40 to-[#0b0b0d]" />
        <div className="absolute bottom-8 left-8 right-8 text-right">
          <p className="text-xs uppercase tracking-widest text-white/60">Clube Pirassununga · 1928</p>
          <p className="text-lg font-semibold">Sistema oficial de transmissão</p>
        </div>
      </div>
    </div>
  );
}
