import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, extractList } from "../services/api";
import { Play, Square, RefreshCcw, Shield, Clock, Activity, Target, ChevronRight, Zap, Info, Cpu, Thermometer } from "lucide-react";

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
    { id: 1, numero: 4, nome: "RAFAEL COSTA", fadiga: 35 },
    { id: 2, numero: 11, nome: "JOÃO VICTOR", fadiga: 32 },
    { id: 3, numero: 10, nome: "GABRIEL NUNES", fadiga: 30 },
    { id: 4, numero: 7, nome: "MARCOS PAULO", fadiga: 30 },
    { id: 5, numero: 3, nome: "LUCAS MENDES", fadiga: 29 },
    { id: 6, numero: 8, nome: "PEDRO ALMEIDA", fadiga: 28 },
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
    if (!selectedPartida) return;
    setStep(2);
  };

  const getFadigaColor = (fadiga) => {
    if (fadiga < 30) return "bg-pt-primary";
    if (fadiga < 60) return "bg-pt-primary/60";
    return "bg-red-500/80";
  };

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[20px] bg-pt-primary/10 flex items-center justify-center border border-pt-primary/20">
                    <Cpu className="text-pt-primary w-6 h-6" />
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Tempo Real</h1>
            </div>
            <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] ml-1">
                Inicialize o protocolo de monitoramento tático.
            </p>
        </header>

        <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-pt-primary/5 rounded-full blur-[140px] -mr-48 -mt-48 group-hover:bg-pt-primary/10 transition-all duration-1000" />

          {loadingConfig ? (
            <div className="flex flex-col items-center justify-center py-16">
               <div className="relative">
                  <div className="w-12 h-12 border-4 border-pt-white/5 border-t-pt-primary rounded-full animate-spin" />
                  <div className="absolute inset-0 w-12 h-12 border-4 border-pt-primary/30 rounded-full blur-md animate-pulse" />
               </div>
               <p className="mt-8 text-pt-text-muted font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Sincronizando Base de Dados...</p>
            </div>
          ) : (
            <form onSubmit={handleStartSimulation} className="space-y-10 relative z-10">
              <div className="space-y-5">
                <label className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em] ml-2">Alvo de Monitoramento</label>
                {partidas.length === 0 ? (
                  <div className="p-10 rounded-[32px] bg-pt-bg/50 border border-dashed border-pt-white/10 text-center">
                    <p className="text-pt-text-muted text-xs font-black italic uppercase tracking-widest opacity-60">Nenhum evento detectado no radar.</p>
                    <Link to="/partidas" className="inline-block mt-6 text-pt-primary text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 border border-pt-primary/20 rounded-full hover:bg-pt-primary hover:text-pt-bg transition-all">Configurar Eventos</Link>
                  </div>
                ) : (
                  <div className="relative group/field">
                    <select
                      className="w-full bg-pt-bg text-pt-text border border-pt-white/10 rounded-[24px] py-5 pl-8 pr-12 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-pt-primary appearance-none cursor-pointer shadow-inner transition-all hover:bg-pt-bg/80"
                      value={selectedPartida}
                      onChange={(e) => setSelectedPartida(e.target.value)}
                      required
                    >
                      <option value="" disabled>SELECIONAR PROTOCOLO DE PARTIDA</option>
                      {partidas.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nome_mandante || 'TIME A'} vs {p.nome_visitante || 'TIME B'} // {new Date(p.data_hora).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-pt-primary w-5 h-5 pointer-events-none rotate-90" />
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <label className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em] ml-2">Assinatura do Alvo</label>
                <div className="relative group/field">
                  <select
                    className="w-full bg-pt-bg text-pt-text border border-pt-white/10 rounded-[24px] py-5 pl-8 pr-12 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-pt-primary appearance-none cursor-pointer shadow-inner transition-all hover:bg-pt-bg/80"
                    value={estiloAdversario}
                    onChange={(e) => setEstiloAdversario(e.target.value)}
                  >
                    <option value="Equilibrado">ESTRATÉGIA: EQUILIBRADA</option>
                    <option value="Ofensivo">ESTRATÉGIA: OFENSIVA (LIGHT)</option>
                    <option value="Muito Ofensivo">ESTRATÉGIA: AGRESSIVA (FULL)</option>
                    <option value="Defensivo">ESTRATÉGIA: DEFENSIVA (SEALED)</option>
                    <option value="Contra-Ataque">ESTRATÉGIA: REAÇÃO RÁPIDA</option>
                    <option value="Posse de Bola">ESTRATÉGIA: FLUXO DE POSSE</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-pt-primary w-5 h-5 pointer-events-none rotate-90" />
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={!selectedPartida}
                  className="w-full group flex items-center justify-center gap-4 bg-pt-primary hover:bg-pt-primary/90 text-pt-bg disabled:opacity-20 px-10 py-6 rounded-[28px] font-black text-sm uppercase tracking-[0.2em] transition-all transform active:scale-[0.97] shadow-2xl shadow-pt-primary/20"
                >
                  <Play className="w-5 h-5 fill-current" />
                  ATIVAR ENGINE EM TEMPO REAL
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex items-center gap-4 opacity-30 mt-8 justify-center">
            <Shield className="w-4 h-4 text-pt-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] italic">Deep Tactical Processing: Online</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-[24px] bg-pt-primary/10 flex items-center justify-center border border-pt-primary/30 shadow-2xl shadow-pt-primary/10">
                <Activity className="text-pt-primary w-8 h-8 animate-pulse" />
             </div>
             <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Terminal em Tempo Real</h1>
          </div>
          <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] ml-2">
            Monitoramento de fluxo tático e carga fisiológica.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-pt-surface p-2.5 rounded-[28px] border border-pt-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${isPaused ? 'bg-pt-primary text-pt-bg shadow-xl shadow-pt-primary/30' : 'text-pt-text-muted hover:text-white hover:bg-white/5'}`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Square className="w-4 h-4 fill-current" />}
            {isPaused ? "RESUMIR" : "PAUSAR"}
          </button>
          <div className="w-px h-8 bg-pt-white/10 mx-1" />
          <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-3 text-pt-text-muted hover:text-red-400 px-8 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-500/5 group"
          >
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            RESET
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column - Score & Bio-Metrics */}
        <div className="lg:col-span-4 space-y-10 flex flex-col">
          
          {/* Card Scoreboard */}
          <div className="bg-pt-surface border border-pt-white/10 rounded-[44px] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-1000 rotate-12">
               <Clock className="w-40 h-40 text-pt-primary" />
            </div>

            <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.3em] mb-12 relative z-10 opactity-60 italic">
              <Zap className="w-4 h-4 text-pt-primary fill-pt-primary/20" />
              <span>Status do Motor: Ativo</span>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-12 relative z-10">
              <div className="text-7xl font-black text-pt-primary tracking-tighter italic mb-2 drop-shadow-[0_0_20px_rgba(162,255,1,0.3)]">{gameTime}'</div>
              <div className="bg-white/5 border border-pt-white/10 backdrop-blur-xl text-pt-primary text-[9px] font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-pt-primary animate-ping" />
                DADOS EM TEMPO REAL
              </div>
              
              <div className="w-full flex justify-between items-center px-2 gap-8">
                <div className="text-center flex-1">
                  <div className="text-[10px] text-pt-text-muted uppercase font-black tracking-[0.3em] mb-4 opacity-40">MANDANTE</div>
                  <div className="text-6xl font-black text-white italic tracking-tighter">{stats.placarCasa}</div>
                </div>
                <div className="text-3xl text-pt-white/10 font-black italic tracking-[0.4em] pt-8">VS</div>
                <div className="text-center flex-1">
                  <div className="text-[10px] text-pt-text-muted uppercase font-black tracking-[0.3em] mb-4 opacity-40">VISITANTE</div>
                  <div className="text-6xl font-black text-white italic tracking-tighter">{stats.placarFora}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-pt-white/5 pt-10 space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-pt-text-muted italic">Posse de Inteligência</span>
                  <span className="text-pt-primary">{stats.posseBola}%</span>
                </div>
                <div className="w-full h-2.5 bg-pt-bg rounded-full overflow-hidden p-[1px] border border-pt-white/10 shadow-inner">
                  <div className="h-full bg-pt-primary rounded-full shadow-[0_0_20px_rgba(162,255,1,0.4)] transition-all duration-1000" style={{ width: `${stats.posseBola}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatMetric label="CHUTES" value={stats.finalizacoes} />
                <StatMetric label="NO GOL" value={stats.noGol} />
                <StatMetric label="ESCANT." value={stats.escanteios} />
                <StatMetric label="FALTAS" value={stats.faltas} />
              </div>
            </div>
          </div>

          {/* Card Physical Impact */}
          <div className="bg-pt-surface border border-pt-white/10 rounded-[44px] p-10 shadow-2xl relative overflow-hidden flex-1 group">
            <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.3em] mb-10 italic">
              <Thermometer className="w-4 h-4 text-red-500 fill-red-500/20" />
              <span>Fadiga Crítica</span>
            </div>
            
            <div className="space-y-7">
              {jogadores.map((jogador) => (
                <div key={jogador.id} className="space-y-2.5 group/player">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-pt-primary tabular-nums tracking-widest bg-pt-primary/5 w-8 h-8 rounded-[10px] flex items-center justify-center border border-pt-primary/20 group-hover/player:bg-pt-primary group-hover/player:text-pt-bg transition-colors">
                          {jogador.numero}
                       </span>
                       <span className="text-xs font-black text-white truncate uppercase tracking-tighter italic">{jogador.nome}</span>
                    </div>
                    <span className="text-[11px] font-bold text-pt-text-muted tabular-nums tracking-widest">{jogador.fadiga}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-pt-bg border border-pt-white/5 rounded-full overflow-hidden shadow-inner flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${getFadigaColor(jogador.fadiga)}`} 
                      style={{ width: `${jogador.fadiga}%` }}
                    ></div>
                    <div className="flex-1" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-5 rounded-[24px] bg-pt-bg/50 border border-pt-white/10 flex gap-4 items-start">
               <Info className="w-4 h-4 text-pt-primary shrink-0 mt-0.5 opacity-60" />
               <p className="text-[9px] text-pt-text-muted font-bold uppercase tracking-widest leading-relaxed opacity-60">
                  Limiar Crítico: 60%. Sugerida alternância tática ou substituição imediata para manter a densidade operacional.
               </p>
            </div>
          </div>
          
        </div>

        {/* Right Column - IA Strategy Hub */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="bg-pt-surface border border-pt-white/10 rounded-[48px] p-12 flex-1 flex flex-col relative overflow-hidden shadow-2xl group">
             {/* Complex background grid/glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(162,255,1,0.02)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] bg-pt-primary/5 rounded-full blur-[140px] pointer-events-none group-hover:bg-pt-primary/10 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] bg-pt-primary/5 rounded-full blur-[140px] pointer-events-none group-hover:bg-pt-primary/10 transition-all duration-1000" />

            <div className="flex items-center gap-4 text-white font-black text-xs uppercase tracking-[0.3em] mb-12 relative z-10 italic">
              <div className="w-1.5 h-6 bg-pt-primary rounded-full shadow-[0_0_15px_rgba(162,255,1,0.5)]" />
              <h2 className="text-xl tracking-tighter">Console de Síntese Estratégica</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 relative z-10">
              <div className="relative mb-12">
                <div className="w-32 h-32 flex items-center justify-center rounded-[40px] bg-pt-bg border border-pt-white/10 shadow-[inner_0_0_40px_rgba(0,0,0,0.5)] scale-100 group-hover:scale-110 group-hover:border-pt-primary/30 transition-all duration-700">
                  <Target className="w-16 h-16 text-pt-white/5 group-hover:text-pt-primary/40 transition-all duration-500" />
                </div>
                <div className="absolute -inset-4 border border-pt-primary/10 rounded-[48px] animate-reverse-spin pointer-events-none" />
                <div className="absolute -inset-8 border border-pt-primary/5 rounded-[56px] animate-spin pointer-events-none" />
              </div>
              
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-6 scale-105">Analisando Fluxo de Jogo</h3>
              <p className="text-pt-text-muted max-w-lg text-sm font-bold uppercase tracking-[0.15em] leading-relaxed opacity-50 px-4">
                O motor táctico ProTactic está processando 14.500 pontos de dados por segundo. Insights preditivos de alta fidelidade serão gerados assim que a variância estatística atingir o limiar de segurança.
              </p>
              
              <div className="mt-16 w-full max-w-lg bg-pt-bg/40 backdrop-blur-xl border border-pt-white/10 py-10 px-8 rounded-[40px] border-dashed relative">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pt-surface px-6 py-1 border border-pt-white/10 rounded-full">
                    <span className="text-[9px] font-black text-pt-primary uppercase tracking-[0.4em]">Secure Node</span>
                 </div>
                 <div className="flex items-center justify-center gap-4 mb-5">
                    <div className="w-2.5 h-2.5 rounded-full bg-pt-primary animate-ping" />
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Standby Neural</span>
                 </div>
                 <p className="text-[10px] text-pt-text-muted/40 font-black uppercase tracking-[0.3em] font-mono">
                    System Protocol: AWAITING_VARIANCE_TRIGGER
                 </p>
              </div>
            </div>
            
            <div className="mt-auto pt-10 border-t border-pt-white/5 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pt-primary shadow-[0_0_10px_rgba(162,255,1,1)]" />
                    <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.3em]">Perfil: {estiloAdversario}</span>
                  </div>
                  <div className="w-px h-3 bg-pt-white/10" />
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.3em]">Latência: 14ms</span>
                  </div>
               </div>
               <span className="text-[9px] font-black text-pt-text-muted/40 uppercase tracking-[0.4em] italic font-mono">PT-ENGINE_CORE_V4.2</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatMetric({ label, value }) {
  return (
    <div className="bg-pt-bg/60 border border-pt-white/5 rounded-2xl py-5 px-6 transition-all hover:border-pt-primary/30 group hover:bg-pt-bg/80 shadow-inner">
      <p className="text-[9px] text-pt-text-muted font-black uppercase tracking-[0.2em] mb-2 group-hover:text-pt-primary transition-colors italic">{label}</p>
      <p className="text-3xl font-black text-white italic tabular-nums tracking-tighter group-hover:scale-105 transition-transform">{value}</p>
    </div>
  );
}