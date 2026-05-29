import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, Eye, Layers, Monitor, Library } from "lucide-react";
import { getSession, setSession } from "@/lib/store";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const tabs = [
  { to: "/app/preview", label: "Preview", icon: Eye },
  { to: "/app/presentations", label: "Apresentações", icon: Layers },
  { to: "/app/terminals", label: "Atribuições", icon: Monitor },
  { to: "/app/library", label: "Biblioteca", icon: Library },
] as const;

function AppLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    const s = getSession();
    if (!s || s.kind !== "admin") nav({ to: "/" });
  }, [nav]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-9 w-9" />
            <div>
              <p className="text-sm font-bold">ClubeON <span className="text-primary">CCP</span></p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((t) => {
              const Active = loc.pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <Link key={t.to} to={t.to} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${Active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => { setSession(null); nav({ to: "/" }); }}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
        <div className="md:hidden flex overflow-x-auto border-t">
          {tabs.map((t) => {
            const Active = loc.pathname.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to} className={`flex-1 min-w-fit text-center px-4 py-2 text-xs font-medium ${Active ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
                {t.label}
              </Link>
            );
          })}
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}