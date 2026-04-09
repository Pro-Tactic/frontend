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
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-pt-primary">Início</h1>
        <p className="text-sm text-pt-text-muted font-medium">
          Visão geral do clube e informações do próximo jogo.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-pt-text-muted">Carregando...</div>
      ) : error ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-red-300">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="bg-pt-surface border border-pt-slate/10 rounded-2xl p-6 shadow-sm shadow-black/5">
            <div className="flex items-center gap-4">
              {data?.clube?.escudo ? (
                <img
                  src={data.clube.escudo}
                  alt={data.clube.nome}
                  className="w-14 h-14 object-contain rounded-xl bg-pt-bg/30 p-2"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-pt-bg/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-pt-primary/60" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-pt-text">{data?.clube?.nome}</h2>
                <p className="text-xs text-pt-text-muted font-semibold">
                  {data?.clube?.pais}
                  {data?.clube?.data_criacao ? ` • ${new Date(data.clube.data_criacao).getFullYear()}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <StatBox label="Jogos" value={data?.estatisticas?.total_jogos} />
              <StatBox label="Vitórias" value={data?.estatisticas?.vitorias} />
              <StatBox label="Empates" value={data?.estatisticas?.empates} />
              <StatBox label="Derrotas" value={data?.estatisticas?.derrotas} />
            </div>
            <div className="mt-4 text-xs text-pt-text-muted font-medium">
              Aproveitamento: <span className="text-pt-text font-bold">{data?.estatisticas?.aproveitamento}%</span>
            </div>
          </section>

          <section className="lg:col-span-2 bg-pt-surface border border-pt-slate/10 rounded-2xl p-6 shadow-sm shadow-black/5">
            <div className="flex items-center gap-2 text-pt-text">
              <Calendar className="w-5 h-5 text-pt-primary" />
              <h2 className="text-lg font-bold">Próximo jogo</h2>
            </div>

            {data?.proximo_jogo ? (
              <div className="mt-4 rounded-xl border border-pt-slate/10 bg-pt-bg/20 px-4 py-4">
                <div className="text-sm text-pt-text-muted font-bold tracking-wide">{data.proximo_jogo.competicao || "Amistoso"}</div>
                <div className="text-2xl text-pt-text font-black mt-1">
                  {data.proximo_jogo.adversario} ({data.proximo_jogo.local})
                </div>
                <div className="text-sm text-pt-text-muted mt-2 font-medium">
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
                <h3 className="text-base font-bold text-pt-text">Provável escalação</h3>
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
                      className="rounded-xl border border-pt-slate/10 bg-pt-bg/20 px-4 py-3"
                    >
                      <div className="text-pt-text font-bold">{jogador.nome}</div>
                      <div className="text-xs text-pt-text-muted font-semibold">{jogador.posicao}</div>
                      {jogador.frequencia_titular && (
                        <div className="text-[11px] text-pt-text-muted/70 mt-1 font-medium italic">
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
    <div className="rounded-xl border border-pt-slate/10 bg-pt-bg/20 px-4 py-3">
      <div className="text-[10px] text-pt-text-muted uppercase font-bold tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-black text-pt-text">{value ?? 0}</div>
    </div>
  );
}