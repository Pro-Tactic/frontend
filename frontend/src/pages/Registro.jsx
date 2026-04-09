import { useNavigate } from "react-router-dom";
import { UserPlus, Trophy, Building2, Swords, UserCog } from "lucide-react";

export default function Registro() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-pt-primary">
          Registro
        </h1>
        <p className="text-sm text-pt-text-muted font-medium">
          Cadastre jogadores e competições manualmente.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate("/registro/jogadores")}
          className="group text-left bg-pt-surface border border-pt-slate/10 rounded-2xl p-6 hover:shadow-xl hover:shadow-pt-primary/5 hover:border-pt-primary/40 transition-all shadow-sm shadow-black/5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pt-primary/10 ring-2 ring-pt-primary/30 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-pt-primary" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-black text-pt-text tracking-tight">
                Registrar Jogadores
              </h2>
              <p className="text-xs text-pt-text-muted mt-1 font-bold">
                Adicione atletas com informações básicas e status.
              </p>
              <div className="mt-4 text-xs text-pt-primary font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Abrir registro →
              </div>
            </div>
          </div>
        </button>

        {/* Card - Clube */}
        <button
          type="button"
          onClick={() => navigate("/registro/clube")}
          className="group text-left bg-pt-surface border border-pt-slate/10 rounded-2xl p-6 hover:shadow-xl hover:shadow-pt-primary/5 hover:border-pt-primary/40 transition-all shadow-sm shadow-black/5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pt-primary/10 ring-2 ring-pt-primary/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-pt-primary" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-black text-pt-text tracking-tight">
                Registrar Clube
              </h2>
              <p className="text-xs text-pt-text-muted mt-1 font-bold">
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
          className="group text-left bg-pt-surface border border-pt-slate/10 rounded-2xl p-6 hover:shadow-xl hover:shadow-pt-primary/5 hover:border-pt-primary/40 transition-all shadow-sm shadow-black/5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pt-primary/10 ring-2 ring-pt-primary/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-pt-primary" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-black text-pt-text tracking-tight">
                Registrar Competições
              </h2>
              <p className="text-xs text-pt-text-muted mt-1 font-bold">
                Cadastre campeonatos e torneios.
              </p>

              <div className="mt-4 text-sm text-emerald-300 group-hover:text-emerald-200">
                Abrir registro →
              </div>
            </div>
          </div>
        </button>

        {/* Card - Técnico */}
        <button
          type="button"
          onClick={() => navigate("/registro/tecnico")}
          className="group text-left bg-pt-surface border border-pt-slate/10 rounded-2xl p-6 hover:shadow-xl hover:shadow-pt-primary/5 hover:border-pt-primary/40 transition-all shadow-sm shadow-black/5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pt-primary/10 ring-2 ring-pt-primary/30 flex items-center justify-center">
              <UserCog className="w-6 h-6 text-pt-primary" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-black text-pt-text tracking-tight">
                Cadastrar Técnico
              </h2>
              <p className="text-xs text-pt-text-muted mt-1 font-bold">
                Crie usuário treinador e vincule a um clube.
              </p>

              <div className="mt-4 text-xs text-pt-primary font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Abrir cadastro →
              </div>
            </div>
          </div>
        </button>

        {/*Card - Partida */}
        <button
          type="button"
          onClick={() => navigate("/registro/partidas")}
          className="group text-left bg-pt-surface border border-pt-slate/10 rounded-2xl p-6 hover:shadow-xl hover:shadow-pt-primary/5 hover:border-pt-primary/40 transition-all shadow-sm shadow-black/5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pt-primary/10 ring-2 ring-pt-primary/30 flex items-center justify-center">
              <Swords className="w-6 h-6 text-pt-primary" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-black text-pt-text tracking-tight">
                Criar Partida
              </h2>
              <p className="text-xs text-pt-text-muted mt-1 font-bold">
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