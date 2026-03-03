import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, AlertCircle } from "lucide-react";
import { api } from "../services/api";
import { resolveMediaUrl } from "../services/media";

export default function Competicoes() {
  const [competicoes, setCompeticoes] = useState([]);
  const [times, setTimes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const [filtroJogos, setFiltroJogos] = useState("5");
  const [mostrarTodasEscalacoes, setMostrarTodasEscalacoes] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [error, setError] = useState("");
  const [timesError, setTimesError] = useState("");
  const [statsError, setStatsError] = useState("");

  const [clubeStats, setClubeStats] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const competicoesRes = await api.get("/competicoes/");

        if (!mounted) return;

        const listaCompeticoes = competicoesRes.data?.results || competicoesRes.data || [];
        setCompeticoes(listaCompeticoes);

        if (listaCompeticoes.length > 0) {
          setSelectedId(String(listaCompeticoes[0].id));
        }
      } catch {
        if (!mounted) return;
        setError("Não foi possível carregar competições.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadTimes() {
      if (!selectedId) {
        setTimes([]);
        setSelectedClub(null);
        setClubeStats(null);
        return;
      }

      setLoadingTimes(true);
      setTimesError("");
      setMostrarTodasEscalacoes(false);

      try {
        const response = await api.get(`/competicoes/${selectedId}/times/`);
        if (!mounted) return;

        const lista = response.data || [];
        setTimes(lista);
        setSelectedClub(null);
        setClubeStats(null);
      } catch {
        if (!mounted) return;
        setTimesError("Não foi possível carregar os times.");
        setTimes([]);
        setSelectedClub(null);
        setClubeStats(null);
      } finally {
        if (mounted) setLoadingTimes(false);
      }
    }

    loadTimes();
    return () => {
      mounted = false;
    };
  }, [selectedId]);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      if (!selectedId || !selectedClub) {
        setClubeStats(null);
        return;
      }

      setLoadingStats(true);
      setStatsError("");

      try {
        const response = await api.get(
          `/competicoes/${selectedId}/clubes/${selectedClub.id}/estatisticas/`,
          {
            params: {
              ultimos_jogos: filtroJogos,
            },
          }
        );

        if (!mounted) return;
        setClubeStats(response.data || null);
      } catch {
        if (!mounted) return;
        setStatsError("Não foi possível carregar as estatísticas do clube.");
        setClubeStats(null);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    }

    loadStats();
    return () => {
      mounted = false;
    };
  }, [selectedId, selectedClub, filtroJogos]);

  const timesDaCompeticao = useMemo(() => times, [times]);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">Competições & Clubes</h1>
        <p className="text-sm text-slate-400">
          Selecione uma competição, escolha um clube participante e veja estatísticas, escalações e rankings.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-200">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold">Selecionar competição</h2>
          </div>

          {loading ? (
            <div className="text-sm text-slate-400">Carregando...</div>
          ) : error ? (
            <div className="flex items-start gap-2 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500/60 transition"
            >
              {competicoes.length === 0 ? (
                <option value="">Nenhuma competição cadastrada</option>
              ) : (
                competicoes.map((competicao) => (
                  <option key={competicao.id} value={competicao.id}>
                    {competicao.nome}
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        <div className="lg:col-span-2 bg-[#0b1220] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-slate-200 mb-4">
            <Users className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-semibold">Times participantes</h2>
          </div>

          {loadingTimes ? (
            <div className="text-sm text-slate-400">Carregando times...</div>
          ) : timesError ? (
            <div className="text-sm text-red-300">{timesError}</div>
          ) : timesDaCompeticao.length === 0 ? (
            <div className="text-sm text-slate-400">Nenhum time encontrado para esta competição.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {timesDaCompeticao.map((clube) => (
                <div
                  key={clube.id}
                  onClick={() => {
                    setSelectedClub(clube);
                    setMostrarTodasEscalacoes(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                    selectedClub?.id === clube.id
                      ? "border-emerald-500/70 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-600"
                  }`}
                >
                  {clube.escudo ? (
                    <img
                      src={resolveMediaUrl(clube.escudo)}
                      alt={clube.nome}
                      className="w-10 h-10 object-contain rounded-lg bg-white/5 p-1"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                  <span className="text-slate-200 font-medium">{clube.nome}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-[#0b1220] border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between text-slate-200 mb-4 gap-3">
          <h2 className="text-lg font-semibold">Estatísticas do clube na competição</h2>

          <div className="flex items-center gap-3">
            <select
              value={filtroJogos}
              onChange={(e) => setFiltroJogos(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200"
            >
              <option value="5">Últimos 5 jogos</option>
              <option value="10">Últimos 10 jogos</option>
              <option value="all">Todos os jogos</option>
            </select>

            {selectedClub ? (
              <div className="flex items-center gap-2">
                {selectedClub.escudo && (
                  <img
                    src={resolveMediaUrl(selectedClub.escudo)}
                    alt={selectedClub.nome}
                    className="w-8 h-8 object-contain rounded bg-white/5 p-0.5"
                  />
                )}
                <span className="text-sm text-slate-300 font-medium">{selectedClub.nome}</span>
              </div>
            ) : (
              <span className="text-sm text-slate-500">Selecione um time</span>
            )}
          </div>
        </div>

        {loadingStats ? (
          <div className="text-sm text-slate-400">Carregando estatísticas...</div>
        ) : statsError ? (
          <div className="text-sm text-red-300">{statsError}</div>
        ) : !clubeStats ? (
          <div className="text-sm text-slate-400">Clique em um clube para ver as estatísticas na competição.</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatBox label="Jogos" value={clubeStats.estatisticas.total_jogos} />
              <StatBox label="Vitórias" value={clubeStats.estatisticas.vitorias} />
              <StatBox label="Derrotas" value={clubeStats.estatisticas.derrotas} />
              <StatBox label="Empates" value={clubeStats.estatisticas.empates} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                <h3 className="font-semibold text-slate-100 mb-3">Escalação mais usada</h3>
                {clubeStats.escalacao_mais_usada ? (
                  <>
                    <div className="text-3xl font-black text-emerald-400">{clubeStats.escalacao_mais_usada.formacao}</div>
                    <div className="text-sm text-slate-400 mt-1">Usada {clubeStats.escalacao_mais_usada.vezes} vezes</div>
                  </>
                ) : (
                  <div className="text-sm text-slate-400">Sem dados de formação.</div>
                )}

                <button
                  type="button"
                  onClick={() => setMostrarTodasEscalacoes((prev) => !prev)}
                  className="mt-4 px-3 py-2 rounded-lg border border-slate-700 text-sm text-slate-200 hover:bg-slate-800/70"
                >
                  {mostrarTodasEscalacoes ? "Ocultar todas as escalações" : "Ver todas as escalações"}
                </button>

                {mostrarTodasEscalacoes && (
                  <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(clubeStats.todas_escalacoes || []).map((f) => (
                      <div key={f.formacao} className="flex items-center justify-between text-sm border border-slate-700 rounded-lg px-3 py-2">
                        <span>{f.formacao}</span>
                        <span className="text-slate-400">{f.vezes}x</span>
                      </div>
                    ))}

                    {(clubeStats.formacoes_partida || []).map((f) => (
                      <div key={f.partida_id} className="text-sm border border-slate-700 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{f.formacao}</span>
                          <span className="text-slate-400">{f.data}</span>
                        </div>
                        <div className="text-slate-500">vs {f.adversario}</div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                <h3 className="font-semibold text-slate-100 mb-3">Jogos na competição</h3>
                {clubeStats.jogos.length === 0 ? (
                  <div className="text-sm text-slate-400">Nenhum jogo encontrado para este clube na competição.</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {clubeStats.jogos.map((jogo) => (
                      <div key={jogo.id} className="rounded-lg border border-slate-800 px-3 py-2">
                        <div className="text-slate-200 text-sm">
                          {jogo.mandante} {jogo.placar_mandante} x {jogo.placar_visitante} {jogo.visitante}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{jogo.data} • Resultado: {jogo.resultado}</div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                <h3 className="font-semibold text-slate-100 mb-3">Ranking de artilheiros</h3>
                {(clubeStats.ranking_artilheiros || []).length === 0 ? (
                  <div className="text-sm text-slate-400">Nenhum gol no filtro selecionado.</div>
                ) : (
                  <div className="space-y-2">
                    {clubeStats.ranking_artilheiros.map((item, index) => (
                      <div key={item.jogador_id} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2 text-sm">
                        <span>{index + 1}. {item.nome}</span>
                        <span className="text-amber-400 font-semibold">{item.gols}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                <h3 className="font-semibold text-slate-100 mb-3">Ranking de assistentes</h3>
                {(clubeStats.ranking_assistentes || []).length === 0 ? (
                  <div className="text-sm text-slate-400">Nenhuma assistência no filtro selecionado.</div>
                ) : (
                  <div className="space-y-2">
                    {clubeStats.ranking_assistentes.map((item, index) => (
                      <div key={item.jogador_id} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2 text-sm">
                        <span>{index + 1}. {item.nome}</span>
                        <span className="text-sky-400 font-semibold">{item.assistencias}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
              <h3 className="font-semibold text-slate-100 mb-3">Gols e assistências do clube</h3>
              {(clubeStats.participacoes_gols || []).length === 0 ? (
                <div className="text-sm text-slate-400">Sem participações em gol no filtro selecionado.</div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {clubeStats.participacoes_gols.map((item, index) => (
                    <div key={`${item.partida_id}-${index}`} className="rounded-lg border border-slate-800 px-3 py-2 text-sm">
                      <div className="text-slate-300">{item.data} • vs {item.adversario}</div>
                      <div className="text-slate-200 mt-1">
                        Gol: {item.autor}
                        {item.assistencia ? ` • Assistência: ${item.assistencia}` : " • Sem assistência"}
                        {item.minuto ? ` • ${item.minuto}'` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-slate-100">{value}</div>
    </div>
  );
}
