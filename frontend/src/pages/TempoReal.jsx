import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, extractList } from "../services/api";
import { Play, Square, RefreshCcw, Shield, Clock, Activity, Target } from "lucide-react";

export default function TempoReal() {
  const [step, setStep] = useState(1);
  const [partidas, setPartidas] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Form states
  const [selectedPartida, setSelectedPartida] = useState("");
  const [estiloAdversario, setEstiloAdversario] = useState("Equilibrado");

  // Simulation states
  const [isPaused, setIsPaused] = useState(false);
  const [gameTime, setGameTime] = useState(3);
  const [stats, setStats] = useState({
    placarCasa: 0,
    placarFora: 0,
    posseBola: 61,
    finalizacoes: 1,
    noGol: 0,
    escanteios: 0,
    faltas: 0
  });

  const [jogadores, setJogadores] = useState([
    { id: 1, numero: 4, nome: "Rafael Costa", fadiga: 35 },
    { id: 2, numero: 11, nome: "João Victor", fadiga: 32 },
    { id: 3, numero: 10, nome: "Gabriel Nunes", fadiga: 30 },
    { id: 4, numero: 7, nome: "Marcos Paulo", fadiga: 30 },
    { id: 5, numero: 3, nome: "Lucas Mendes", fadiga: 29 },
    { id: 6, numero: 8, nome: "Pedro Almeida", fadiga: 28 },
  ]);

  useEffect(() => {
    async function loadPartidas() {
      try {
        const response = await api.get("/partidas/");
        setPartidas(extractList(response.data));
      } catch (error) {
        console.error("Erro ao carregar partidas", error);
      } finally {
        setLoadingConfig(false);
      }
    }
    loadPartidas();
  }, []);

  const handleStartSimulation = (e) => {
    e.preventDefault();
    if (!selectedPartida) {
      alert("Por favor, selecione uma partida.");
      return;
    }
    setStep(2);
  };

  const currentMatch = partidas.find(p => p.id === selectedPartida);

  const getFadigaColor = (fadiga) => {
    if (fadiga < 30) return "bg-emerald-500";
    if (fadiga < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-white">
            Configurar Simulação
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Selecione uma partida e defina o estilo do adversário para inicializar o Tempo Real.
          </p>
        </div>

        <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-8">
          {loadingConfig ? (
            <div className="text-slate-400">Carregando dados...</div>
          ) : (
            <form onSubmit={handleStartSimulation} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Partida</label>
                {partidas.length === 0 ? (
                  <div className="text-sm text-slate-500 border border-slate-800 rounded-lg p-3 bg-slate-900/50">
                    Nenhuma partida agendada. <Link to="/partidas" className="text-emerald-500 hover:underline">Vá para Partidas</Link> para adicionar uma.
                  </div>
                ) : (
                  <select
                    className="w-full bg-[#020617] text-white border border-slate-700 rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-colors"
                    value={selectedPartida}
                    onChange={(e) => setSelectedPartida(e.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione uma partida</option>
                    {partidas.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome_mandante || p?.mandante?.nome || 'Time Casa'} x {p.nome_visitante || p?.visitante?.nome || 'Time Fora'} - {new Date(p.data_hora).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Estilo de Jogo do Adversário</label>
                <select
                  className="w-full bg-[#020617] text-white border border-slate-700 rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  value={estiloAdversario}
                  onChange={(e) => setEstiloAdversario(e.target.value)}
                >
                  <option value="Equilibrado">Equilibrado</option>
                  <option value="Ofensivo">Ofensivo</option>
                  <option value="Muito Ofensivo">Muito Ofensivo</option>
                  <option value="Defensivo">Defensivo (Retranca)</option>
                  <option value="Contra-Ataque">Contra-Ataque</option>
                  <option value="Posse de Bola">Controle de Posse</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedPartida}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Simulação
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- FAse 2: Simulação ---
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-white">
            Tempo Real
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Sugestões táticas e de substituições ao vivo
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 bg-[#0b1220] border border-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {isPaused ? "Retomar" : "Pausar"}
          </button>
          <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-medium transition border border-red-500/20"
          >
            <RefreshCcw className="w-4 h-4" />
            Resetar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Jogo & Fadiga */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Card Status do Jogo */}
          <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-white font-medium mb-6">
              <Clock className="w-5 h-5 text-emerald-500" />
              <h2>Status do Jogo</h2>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="text-4xl font-bold text-emerald-400 mb-2">{gameTime}'</div>
              <div className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
                Ao Vivo
              </div>
              
              <div className="w-full flex justify-between items-center px-4">
                <div className="text-center flex-1">
                  <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Casa</div>
                  <div className="text-4xl font-bold text-white">{stats.placarCasa}</div>
                </div>
                <div className="text-2xl text-slate-600 font-bold px-4">X</div>
                <div className="text-center flex-1">
                  <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Fora</div>
                  <div className="text-4xl font-bold text-white">{stats.placarFora}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Posse de Bola</span>
                  <span className="text-emerald-400 font-medium">{stats.posseBola}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${stats.posseBola}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                  <p className="text-xs text-slate-400 mb-1">Finalizações</p>
                  <p className="text-lg font-bold text-white">{stats.finalizacoes}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                  <p className="text-xs text-slate-400 mb-1">No Gol</p>
                  <p className="text-lg font-bold text-white">{stats.noGol}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                  <p className="text-xs text-slate-400 mb-1">Escanteios</p>
                  <p className="text-lg font-bold text-white">{stats.escanteios}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                  <p className="text-xs text-slate-400 mb-1">Faltas</p>
                  <p className="text-lg font-bold text-white">{stats.faltas}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Fadiga */}
          <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-white font-medium mb-6">
              <Activity className="w-5 h-5 text-yellow-500" />
              <h2>Nível de Fadiga</h2>
            </div>
            
            <div className="space-y-4">
              {jogadores.map((jogador) => (
                <div key={jogador.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                    {jogador.numero}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex flex-col mb-1">
                       <span className="text-sm font-medium text-slate-200 truncate">{jogador.nome}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full ${getFadigaColor(jogador.fadiga)}`} 
                        style={{ width: `${jogador.fadiga}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-400 w-8 text-right flex-shrink-0">
                    {jogador.fadiga}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* Right Column - Sugestões da IA */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-8 flex-1 flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-2 text-white font-medium mb-8">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg">Sugestões da IA</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-slate-800/50 border border-slate-700/50">
                <Target className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-medium text-slate-300 mb-2">Analisando o jogo...</h3>
              <p className="text-slate-500 max-w-md">
                Aqui será integrado o nosso modelo de IA. As sugestões táticas e de substituições aparecerão dinamicamente conforme os eventos da partida ocorrerem.
              </p>
              
              {/* Espaço reservado para inserção futura dos cards de IA */}
              <div className="mt-12 w-full max-w-lg hidden">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-5 text-left mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Substituição</span>
                    <span className="text-slate-400 text-xs">Agora</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Recomendamos substituir <span className="font-bold text-white">Rafael Costa</span>. O nível de fadiga está aumentando e o time adversário está explorando as costas do lateral.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Efeito de brilho de fundo opcional */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>

      </div>
    </div>
  );
}