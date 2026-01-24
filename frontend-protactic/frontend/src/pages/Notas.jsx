import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Save, Search, Trophy, User as UserIcon, Activity } from "lucide-react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Notas() {
  const [partidas, setPartidas] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [partidaSelecionada, setPartidaSelecionada] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [performanceData, setPerformanceData] = useState({});

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
    setLoading(true);
    let erros = 0;

    const promises = Object.keys(performanceData).map(async (jogadorId) => {
      const dados = performanceData[jogadorId];
      if (!dados) return;

      const payload = {
        partida: partidaSelecionada,
        jogador: jogadorId,
        nota: dados.nota,
        gols: dados.gols || 0,
        assistencias: dados.assistencias || 0
      };

      try {
        if (dados.id) {
           await api.patch(`/desempenhos/${dados.id}/`, payload);
        } else {
           await api.post("/desempenhos/", payload);
        }
      } catch (err) {
        console.error(`Erro ao salvar jogador ${jogadorId}`, err);
        erros++;
      }
    });

    await Promise.all(promises);
    setLoading(false);

    if (erros === 0) {
      MySwal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Notas e estatísticas salvas.',
        background: '#0f172a',
        color: '#e2e8f0'
      });
    } else {
      MySwal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Alguns dados podem não ter sido salvos. Verifique a conexão.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-10">
      
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-green-500" /> Avaliação de Desempenho
          </h1>
          <p className="text-slate-400 mt-2">
            Atribua notas, gols e assistências para o elenco na partida selecionada.
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

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="p-4">Atleta</th>
                    <th className="p-4 text-center w-32">Nota (0-10)</th>
                    <th className="p-4 text-center w-24">Gols</th>
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