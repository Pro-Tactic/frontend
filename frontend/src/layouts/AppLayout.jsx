import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { fetchNavigation } from "../services/navigation";
import { clearSession } from "../services/auth";
import { api } from "../services/api";

import { Home, Users, Target, Activity, Building, Shield, LogOut, Trophy } from "lucide-react";

const ICONS = {
  home: Home,
  users: Users,
  target: Target,
  activity: Activity,
  building: Building,
  shield: Shield,
  trophy: Trophy,
};

function SidebarItem({ item }) {
  const Icon = ICONS[item.icon] || Home;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
          "text-pt-text-muted hover:text-pt-primary hover:bg-pt-primary/10",
          isActive
            ? "bg-pt-primary/20 text-pt-primary ring-1 ring-pt-primary/40 font-semibold"
            : "",
        ].join(" ")
      }
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{item.label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const [nav, setNav] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        await api.post("/logout/", { refresh });
      }
    } catch (e) {
      console.error("Erro ao fazer logout remoto:", e);
    } finally {
      clearSession();
      window.location.replace("/");
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchNavigation({ preferCache: true });
        if (!mounted) return;
        setNav(data);
      } catch (err) {
        const status = err?.response?.status;
        const msg =
          status
            ? `Falha ao carregar /navigation/. Status: ${status}`
            : `Falha ao carregar /navigation/. ${err?.message || "Erro desconhecido"}`;

        console.error("Navigation error:", err);
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-pt-bg text-pt-text flex">
      {/* Adicionei 'sticky top-0' para a sidebar não rolar com o conteúdo principal */}
      <aside className="w-[280px] md:w-[320px] h-screen sticky top-0 border-r border-pt-white/5 bg-pt-bg flex flex-col">
        
        {/* Header da Sidebar */}
        <div className="px-6 pt-6 pb-5 border-b border-pt-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pt-primary/15 ring-2 ring-pt-primary flex items-center justify-center">
              <span className="text-pt-primary font-black">PT</span>
            </div>
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight text-pt-primary">PROTACTIC</div>
              <div className="text-xs text-pt-text-muted font-medium uppercase tracking-wider">Assistente Técnico</div>
            </div>
          </div>
        </div>

        {/* Links de Navegação - O 'flex-1' faz ele ocupar todo o espaço disponível */}
        <nav className="px-4 py-5 flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
          {loading && (
            <div className="text-slate-400 text-sm px-4">Carregando menu...</div>
          )}

          {error && (
            <div className="mx-2 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-xs">
              {error}
              <div className="mt-2 text-slate-300">
                Dica: confira se o backend está em <span className="font-mono">8000</span>...
              </div>
            </div>
          )}

          {nav?.items?.map((item) => (
            <SidebarItem key={item.key} item={item} />
          ))}
        </nav>
        
        <div className="px-4 pt-3 pb-4 border-t border-pt-white/5 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-red-500/10 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-pt-bg min-h-screen overflow-y-auto">
        <div className="px-10 py-8">
          {!loading && !nav && (
            <div className="text-slate-300">
              Não consegui carregar a navegação. Veja o erro na sidebar.
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}