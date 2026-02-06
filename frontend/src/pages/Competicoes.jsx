import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, AlertCircle } from "lucide-react";
import { api } from "../services/api";

export default function Competicoes() {
  const [competicoes, setCompeticoes] = useState([]);
  const [times, setTimes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [error, setError] = useState("");
  const [timesError, setTimesError] = useState("");

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
      } catch (err) {
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
        return;
      }

      setLoadingTimes(true);
      setTimesError("");

      try {
        const response = await api.get(`/competicoes/${selectedId}/times/`);
        if (!mounted) return;
        setTimes(response.data || []);
      } catch (err) {
        if (!mounted) return;
        setTimesError("Não foi possível carregar os times.");
        setTimes([]);
      } finally {
        if (mounted) setLoadingTimes(false);
      }
    }

    loadTimes();
    return () => {
      mounted = false;
    };
  }, [selectedId]);

  const timesDaCompeticao = useMemo(() => times, [times]);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">
          Competições
        </h1>
        <p className="text-sm text-slate-400">
          Escolha uma competição para ver os times participantes.
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
            <div className="text-sm text-slate-400">
              Nenhum time encontrado para esta competição.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {timesDaCompeticao.map((clube) => (
                <div
                  key={clube.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
                >
                  <span className="text-slate-200">{clube.nome}</span>
                  <span className="text-xs text-slate-500">ID {clube.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
