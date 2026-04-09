import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Users, Calendar, AlertCircle, ChevronRight, Zap } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-pt-primary"></div>
        <p className="mt-4 text-pt-text-muted font-black text-[10px] uppercase tracking-widest animate-pulse">Processando Inteligência...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-[32px] p-8 flex items-center gap-4 text-red-400">
        <AlertCircle className="w-8 h-8" />
        <span className="font-black text-sm uppercase tracking-widest">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic tracking-[-0.05em]">Panorama Tático</h1>
        <p className="text-pt-text-muted font-bold text-sm uppercase tracking-widest">
          Inteligência central e métricas de desempenho do clube.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Perfil do Clube */}
        <div className="lg:col-span-4 bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-pt-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-pt-primary/10 transition-colors" />
          
          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            {data?.clube?.escudo ? (
              <div className="p-4 bg-pt-bg rounded-[32px] border border-pt-white/5 shadow-inner">
                <img
                  src={data.clube.escudo}
                  alt={data.clube.nome}
                  className="w-24 h-24 object-contain"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-[32px] bg-pt-bg border border-pt-white/5 flex items-center justify-center shadow-inner">
                <Users className="w-10 h-10 text-pt-primary/40" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{data?.clube?.nome}</h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-[10px] font-black text-pt-primary uppercase tracking-widest px-2 py-0.5 bg-pt-primary/10 rounded-full">{data?.clube?.pais}</span>
                {data?.clube?.data_criacao && (
                  <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest italic">• Fundado em {new Date(data.clube.data_criacao).getFullYear()}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
            <StatBox label="Jogos" value={data?.estatisticas?.total_jogos} />
            <StatBox label="Vitórias" value={data?.estatisticas?.vitorias} highlight />
          </div>
          
          <div className="mt-8 space-y-4 relative z-10">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
               <span className="text-pt-text-muted">Desempenho Geral</span>
               <span className="text-pt-primary">{data?.estatisticas?.aproveitamento}%</span>
            </div>
            <div className="w-full h-2 bg-pt-bg rounded-full overflow-hidden p-[1px] border border-pt-white/5 shadow-inner">
              <div className="h-full bg-pt-primary rounded-full shadow-[0_0_15px_rgba(162,255,1,0.2)]" style={{ width: `${data?.estatisticas?.aproveitamento}%` }} />
            </div>
          </div>
        </div>

        {/* Próximo Jogo e Escalação */}
        <div className="lg:col-span-8 space-y-8">
          
          <section className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-pt-primary/10 flex items-center justify-center">
                   <Calendar className="w-5 h-5 text-pt-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">Próximo Compromisso</h2>
                  <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest">{data?.proximo_jogo?.competicao || "DATA FIFA / AMISTOSO"}</p>
                </div>
              </div>
              
              {data?.proximo_jogo && (
                <div className="px-4 py-2 bg-pt-bg border border-pt-white/5 rounded-2xl text-[10px] font-black text-pt-primary tracking-[0.2em] uppercase italic">
                  CONTAGEM REGRESSIVA
                </div>
              )}
            </div>

            {data?.proximo_jogo ? (
              <div className="p-8 rounded-[32px] bg-pt-bg/50 border border-pt-white/5 relative z-10 hover:border-pt-primary/20 transition-colors">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="flex-1 text-center md:text-left">
                      <div className="text-4xl font-black text-white tracking-tighter uppercase italic">{data.proximo_jogo.adversario}</div>
                      <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                         <div className="flex items-center gap-2 text-[10px] font-black text-pt-text-muted uppercase tracking-widest tabular-nums">
                            <Zap className="w-3 h-3 text-pt-primary" />
                            {data.proximo_jogo.local === 'MANDANTE' ? 'CASA' : 'FORA'}
                         </div>
                         <div className="w-1 h-1 rounded-full bg-pt-white/10" />
                         <div className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest tabular-nums">
                            {new Date(data.proximo_jogo.data_hora).toLocaleString("pt-BR", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                         </div>
                      </div>
                   </div>
                   <div className="w-full md:w-px h-px md:h-12 bg-pt-white/10" />
                   <div className="flex-shrink-0 text-center md:text-right">
                      <div className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest mb-1">Local da Partida</div>
                      <div className="text-sm font-black text-white uppercase italic tracking-tighter">{data.proximo_jogo.estadio || "DEF. TÉCNICA"}</div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-pt-bg/30 rounded-[32px] border border-dashed border-pt-white/10 relative z-10">
                <Calendar className="w-10 h-10 mx-auto mb-4 text-pt-white/5" />
                <p className="text-pt-text-muted font-black text-xs uppercase tracking-widest">Nenhum combate agendado no radar.</p>
              </div>
            )}
          </section>

          {/* Probable Lineup - Compacted */}
          <section className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-pt-bg border border-pt-white/5 flex items-center justify-center">
                   <Users className="w-5 h-5 text-pt-primary" />
                </div>
                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Provável Onze</h3>
              </div>
              {data?.origem_escalacao && (
                <span className="text-[9px] font-black text-pt-text-muted/50 uppercase tracking-[0.2em] italic">
                   Fonte: {data.origem_escalacao === "partida" ? "Simulação de Jogo" : "Histórico Coletivo"}
                </span>
              )}
            </div>

            {data?.provavel_escalacao?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.provavel_escalacao.map((jogador) => (
                  <div
                    key={jogador.jogador_id}
                    className="p-4 rounded-[24px] border border-pt-white/5 bg-pt-bg/20 hover:border-pt-primary/30 transition-all group"
                  >
                    <div className="text-[11px] font-black text-white uppercase italic tracking-tighter group-hover:text-pt-primary transition-colors">{jogador.nome.split(' ').slice(0, 2).join(' ')}</div>
                    <div className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest mt-1 opacity-60">{jogador.posicao}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-pt-bg/20 rounded-[32px] border border-dashed border-pt-white/10">
                <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-widest opacity-40 italic">Aguardando definição técnica da escalação.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight = false }) {
  return (
    <div className={`p-5 rounded-[24px] border border-pt-white/5 bg-pt-bg/40 shadow-inner group hover:border-pt-primary/10 transition-colors`}>
      <div className="text-[9px] text-pt-text-muted uppercase font-black tracking-[0.2em] mb-2">{label}</div>
      <div className={`text-3xl font-black italic tracking-tighter ${highlight ? 'text-pt-primary' : 'text-white'}`}>{value ?? 0}</div>
    </div>
  );
}