import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Users, Calendar, AlertCircle } from "lucide-react";

export default function Inicio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await api.get("/inicio/");
        if (!mounted) return;
        setData(response.data);
      } catch (err) {
        if (!mounted) return;
        const status = err?.response?.status;
        if (status === 403) {
          setError("Área inicial disponível apenas para técnico com clube associado.");
        } else {
          setError("Não foi possível carregar o início do clube.");
        }
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
    <div className="max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">Início</h1>
        <p className="text-sm text-slate-400">
          Visão geral do clube e informações do próximo jogo.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-slate-400">Carregando...</div>
      ) : error ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-red-300">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              {data?.clube?.escudo ? (
                <img
                  src={data.clube.escudo}
                  alt={data.clube.nome}
                  className="w-12 h-12 object-contain rounded-lg bg-white/5 p-1"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-500" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{data?.clube?.nome}</h2>
                <p className="text-xs text-slate-400">
                  {data?.clube?.pais}
                  {data?.clube?.data_criacao ? ` • Criado em ${new Date(data.clube.data_criacao).toLocaleDateString("pt-BR")}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <StatBox label="Jogos" value={data?.estatisticas?.total_jogos} />
              <StatBox label="Vitórias" value={data?.estatisticas?.vitorias} />
              <StatBox label="Empates" value={data?.estatisticas?.empates} />
              <StatBox label="Derrotas" value={data?.estatisticas?.derrotas} />
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Aproveitamento: <span className="text-slate-200 font-semibold">{data?.estatisticas?.aproveitamento}%</span>
            </div>
          </section>

          <section className="lg:col-span-2 bg-[#0b1220] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-200">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Próximo jogo</h2>
            </div>

            {data?.proximo_jogo ? (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-4">
                <div className="text-sm text-slate-400">{data.proximo_jogo.competicao || "Amistoso"}</div>
                <div className="text-xl text-slate-100 font-semibold mt-1">
                  {data.proximo_jogo.adversario} ({data.proximo_jogo.local})
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  {new Date(data.proximo_jogo.data_hora).toLocaleString("pt-BR")}
                  {data.proximo_jogo.estadio ? ` • ${data.proximo_jogo.estadio}` : ""}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-400">
                Nenhum jogo futuro encontrado para o seu clube.
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-200">Provável escalação</h3>
                {data?.origem_escalacao && (
                  <span className="text-xs text-slate-500">
                    Origem: {data.origem_escalacao === "partida" ? "próximo jogo" : "histórico"}
                  </span>
                )}
              </div>

              {data?.provavel_escalacao?.length ? (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.provavel_escalacao.map((jogador) => (
                    <div
                      key={jogador.jogador_id}
                      className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
                    >
                      <div className="text-slate-100 font-semibold">{jogador.nome}</div>
                      <div className="text-xs text-slate-400">{jogador.posicao}</div>
                      {jogador.frequencia_titular && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          Aparições como titular: {jogador.frequencia_titular}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-400">
                  Sem escalação provável disponível.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-slate-100">{value ?? 0}</div>
    </div>
  );
}