import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Save, Search, User as UserIcon, Activity } from "lucide-react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Notas() {
  const [partidas, setPartidas] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [partidaSelecionada, setPartidaSelecionada] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [performanceData, setPerformanceData] = useState({});

  const partidaAtual = partidas.find((p) => p.id === partidaSelecionada) || null;

  const toInt = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getGolsDoMeuTime = (partida, elenco) => {
    if (!partida || !elenco?.length) return null;
    const meuClubeId = elenco[0]?.clube;
    if (!meuClubeId) return null;

    if (partida.mandante === meuClubeId) return Number(partida.placar_mandante || 0);
    if (partida.visitante === meuClubeId) return Number(partida.placar_visitante || 0);
    return null;
  };

  useEffect(() => {
    async function loadPartidas() {
      try {
        const response = await api.get("/partidas/");
        setPartidas(response.data);
      } catch (error) {
        console.error("Erro ao carregar partidas", error);
      }
    }
    loadPartidas();
  }, []);

  useEffect(() => {
    if (!partidaSelecionada) return;

    async function loadDadosPartida() {
      setLoading(true);
      try {
        const resJogadores = await api.get("/jogadores/"); 
        const resDesempenhos = await api.get(`/desempenhos/?partida=${partidaSelecionada}`);
        
        setJogadores(resJogadores.data);

        const dadosIniciais = {};
        resDesempenhos.data.forEach(d => {
            dadosIniciais[d.jogador] = {
                id: d.id,
                nota: d.nota,
                gols: d.gols,
            gols_contra: d.gols_contra,
                assistencias: d.assistencias
            };
        });
        setPerformanceData(dadosIniciais);

      } catch (error) {
        console.error("Erro ao carregar dados", error);
        MySwal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível carregar os dados.' });
      } finally {
        setLoading(false);
      }
    }

    loadDadosPartida();
  }, [partidaSelecionada]);

  const handleInputChange = (jogadorId, field, value) => {
    setPerformanceData(prev => ({
      ...prev,
      [jogadorId]: {
        ...prev[jogadorId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!partidaSelecionada) {
      MySwal.fire({ icon: 'warning', title: 'Selecione uma partida', text: 'Escolha uma partida antes de salvar.' });
      return;
    }

    const desempenhosPayload = jogadores.map((jogador) => {
      const dados = performanceData[jogador.id] || {};
      return {
        partida: partidaSelecionada,
        jogador: jogador.id,
        nota: dados.nota === "" || dados.nota === undefined ? 0 : dados.nota,
        gols: toInt(dados.gols),
        gols_contra: toInt(dados.gols_contra),
        assistencias: toInt(dados.assistencias),
      };
    });

    const golsDoTime = getGolsDoMeuTime(partidaAtual, jogadores);
    if (golsDoTime === null) {
      MySwal.fire({
        icon: 'error',
        title: 'Erro de validacao',
        text: 'Nao foi possivel identificar os gols do seu time para esta partida.',
      });
      return;
    }

    const totalGols = desempenhosPayload.reduce((acc, item) => acc + item.gols, 0);
    const totalGolsContra = desempenhosPayload.reduce((acc, item) => acc + item.gols_contra, 0);
    const totalAssistencias = desempenhosPayload.reduce((acc, item) => acc + item.assistencias, 0);

    if (totalGols + totalGolsContra !== golsDoTime) {
      MySwal.fire({
        icon: 'warning',
        title: 'Gols inconsistentes',
        text: `A soma de gols + gols contra (${totalGols + totalGolsContra}) deve ser igual aos gols do time (${golsDoTime}).`,
      });
      return;
    }

    if (totalAssistencias > golsDoTime) {
      MySwal.fire({
        icon: 'warning',
        title: 'Assistencias inconsistentes',
        text: `A soma de assistencias (${totalAssistencias}) deve ser menor ou igual aos gols do time (${golsDoTime}).`,
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/desempenhos/bulk-save/', { desempenhos: desempenhosPayload });
      MySwal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Notas e estatísticas salvas.',
        background: '#0f172a',
        color: '#e2e8f0'
      });
    } catch (err) {
      const apiMsg = err?.response?.data?.gols || err?.response?.data?.assistencias || err?.response?.data?.detail;
      MySwal.fire({
        icon: 'error',
        title: 'Nao foi possivel salvar',
        text: Array.isArray(apiMsg) ? apiMsg[0] : (apiMsg || 'Valide gols/assistencias em relacao ao placar da partida.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const golsDoTime = getGolsDoMeuTime(partidaAtual, jogadores);
  const resumoGols = jogadores.reduce((acc, jogador) => {
    const dados = performanceData[jogador.id] || {};
    acc.gols += toInt(dados.gols);
    acc.golsContra += toInt(dados.gols_contra);
    acc.assistencias += toInt(dados.assistencias);
    return acc;
  }, { gols: 0, golsContra: 0, assistencias: 0 });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-10">
      
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-green-500" /> Avaliação de Desempenho
          </h1>
          <p className="text-slate-400 mt-2">
            Atribua notas, gols, gols contra e assistencias para o elenco na partida selecionada.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8">
        
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Selecione a Partida
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
            <select
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all appearance-none"
              value={partidaSelecionada}
              onChange={(e) => setPartidaSelecionada(e.target.value)}
            >
              <option value="">-- Escolha o confronto --</option>
              {partidas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome_mandante} vs {p.nome_visitante} - {new Date(p.data_hora).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {partidaSelecionada && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Elenco Relacionado</h2>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-slate-900 font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
                <Save className="h-5 w-5" />
              </button>
            </div>

            {partidaAtual && (
              <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
                <div>
                  Placar do time na partida: <span className="font-bold text-white">{golsDoTime ?? '-'} gol(s)</span>
                </div>
                <div className="mt-1">
                  Soma atual: gols <span className="font-bold text-emerald-400">{resumoGols.gols}</span> + gols contra <span className="font-bold text-amber-400">{resumoGols.golsContra}</span> = <span className="font-bold text-white">{resumoGols.gols + resumoGols.golsContra}</span>
                </div>
                <div className="mt-1">
                  Assistencias atuais: <span className="font-bold text-sky-400">{resumoGols.assistencias}</span>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="p-4">Atleta</th>
                    <th className="p-4 text-center w-32">Nota (0-10)</th>
                    <th className="p-4 text-center w-24">Gols</th>
                    <th className="p-4 text-center w-28">Gols Contra</th>
                    <th className="p-4 text-center w-24">Assis.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {jogadores.map((jogador) => {
                     const dados = performanceData[jogador.id] || {};
                     return (
                      <tr key={jogador.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                              <UserIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-200">{jogador.nome}</div>
                              <div className="text-xs text-slate-500">{jogador.posicao}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="-"
                            value={dados.nota || ""}
                            onChange={(e) => handleInputChange(jogador.id, "nota", e.target.value)}
                            className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-center text-green-400 font-bold focus:border-green-500 focus:outline-none"
                          />
                        </td>

                        <td className="p-4 text-center">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={dados.gols || ""}
                            onChange={(e) => handleInputChange(jogador.id, "gols", e.target.value)}
                            className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-center text-slate-200 focus:border-green-500 focus:outline-none"
                          />
                        </td>

                        <td className="p-4 text-center">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={dados.gols_contra || ""}
                            onChange={(e) => handleInputChange(jogador.id, "gols_contra", e.target.value)}
                            className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-center text-amber-300 focus:border-green-500 focus:outline-none"
                          />
                        </td>

                        <td className="p-4 text-center">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={dados.assistencias || ""}
                            onChange={(e) => handleInputChange(jogador.id, "assistencias", e.target.value)}
                            className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-center text-slate-200 focus:border-green-500 focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {jogadores.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  Nenhum jogador encontrado para o clube.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}