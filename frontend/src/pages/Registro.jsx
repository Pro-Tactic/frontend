import { useNavigate } from "react-router-dom";
import { UserPlus, Trophy, Building2, Swords } from "lucide-react";

export default function Registro() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">
          Registro
        </h1>
        <p className="text-sm text-slate-400">
          Cadastre jogadores e competições manualmente.
        </p>
      </div>

      {/* Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card - Jogadores */}
        <button
          type="button"
          onClick={() => navigate("/registro/jogadores")}
          className="group text-left bg-[#0b1220] border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 hover:bg-slate-900/30 transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/25 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-300" />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                Registrar Jogadores
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Adicione atletas com informações básicas e status.
              </p>
              <div className="mt-4 text-sm text-emerald-300 group-hover:text-emerald-200">
                Abrir registro →
              </div>
            </div>
          </div>
        </button>

        {/* Card - Clube */}
        <button
          type="button"
          onClick={() => navigate("/registro/clube")}
          className="group text-left bg-[#0b1220] border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 hover:bg-slate-900/30 transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/25 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-300" />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                Registrar Clube
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Cadastre clubes e informações institucionais.
              </p>

              <div className="mt-4 text-sm text-emerald-300 group-hover:text-emerald-200">
                Abrir registro →
              </div>
            </div>
          </div>
        </button>

        {/* Card - Competições */}
        <button
          type="button"
          onClick={() => navigate("/registro/competicoes")}
          className="group text-left bg-[#0b1220] border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 hover:bg-slate-900/30 transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-sky-500/15 ring-1 ring-sky-500/25 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-sky-300" />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                Registrar Competições
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Cadastre campeonatos e torneios.
              </p>

              <div className="mt-4 text-sm text-emerald-300 group-hover:text-emerald-200">
                Abrir registro →
              </div>
            </div>
          </div>
        </button>

        {/*Card - Partida */}
        <button
          type="button"
          onClick={() => navigate("/registro/partidas")}
          className="group text-left bg-[#0b1220] border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 hover:bg-slate-900/30 transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 ring-1 ring-rose-500/25 flex items-center justify-center">
              <Swords className="w-5 h-5 text-rose-300" />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                Criar Partida
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Agende novos jogos e gerencie placares.
              </p>
              <div className="mt-4 text-sm text-emerald-300 group-hover:text-emerald-200">
                Abrir registro →
              </div>
            </div>
          </div>
        </button>

      </div>
    </div>
  );
}