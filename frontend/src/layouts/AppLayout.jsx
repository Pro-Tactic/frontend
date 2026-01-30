import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { fetchNavigation } from "../services/navigation";

import { Home, Users, Target, Activity, Building, Shield, LogOut } from "lucide-react";

const ICONS = {
  home: Home,
  users: Users,
  target: Target,
  activity: Activity,
  building: Building,
  shield: Shield,
};

function SidebarItem({ item }) {
  const Icon = ICONS[item.icon] || Home;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
          "text-slate-300 hover:text-white hover:bg-slate-800/60",
          isActive
            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40"
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

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user_type");
    window.location.href = "/";
}

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchNavigation();
        if (!mounted) return;
        setNav(data);
      } catch (err) {
        // NÃO redireciona ainda: vamos mostrar o erro pra você ver o que é
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

  // Base screen sempre visível
  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* Sidebar */}
      <aside className="w-[320px] border-r border-slate-800/60 bg-[#01040f] flex flex-col">
        <div className="px-6 pt-6 pb-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 font-bold">PT</span>
            </div>

            <div className="leading-tight">
              <div className="text-lg font-semibold tracking-wide">PROTACTIC</div>
              <div className="text-xs text-slate-400">Assistente Técnico</div>
            </div>
          </div>
        </div>

        <nav className="px-4 py-5 flex flex-col gap-2">
          {loading && (
            <div className="text-slate-400 text-sm px-4">Carregando menu...</div>
          )}

          {error && (
            <div className="mx-2 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-xs">
              {error}
              <div className="mt-2 text-slate-300">
                Dica: confira se o backend está em{" "}
                <span className="font-mono">http://127.0.0.1:8000</span> e se o
                token está sendo enviado.
              </div>
            </div>
          )}

          {/* Se nav existir, renderiza itens */}
          {nav?.items?.map((item) => (
            <SidebarItem key={item.key} item={item} />
          ))}
        </nav>
        
        {/* Botão Sair */}
            <div className="mt-auto p-4">
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-red-500/10 transition"
            >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
            </button>
            </div>

      </aside>

      {/* Conteúdo */}
      <main className="flex-1 bg-[#020617]">
        <div className="min-h-screen px-10 py-8">
          {/* Se não houver nav, ainda mostra algo */}
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