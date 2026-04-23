import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Users, AlertCircle, Activity, User, Search, Shield, ChevronRight, Zap } from "lucide-react";
import PlayerStatsModal from "../components/PlayerStatsModal";

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const nascimento = new Date(dataNascimento);
  if (Number.isNaN(nascimento.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade -= 1;
  }
  return idade;
}

export default function Elenco() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await api.get("/jogadores/");
        if (!mounted) return;
        const data = response.data?.results || response.data || [];
        setJogadores(data);
      } catch (err) {
        if (!mounted) return;
        setError("Não foi possível carregar os atletas do clube.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredJogadores = jogadores.filter(j =>
    j.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.posicao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 border-4 border-pt-white/5 border-t-pt-primary rounded-full animate-spin" />
        <p className="mt-8 text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Sincronizando Base de Dados de Elenco...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-pt-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-[24px] bg-pt-primary/10 flex items-center justify-center border border-pt-primary/30 shadow-xl shadow-pt-primary/10">
                <Shield className="text-pt-primary w-8 h-8" />
             </div>
             <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Central do Elenco</h1>
          </div>
          <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] ml-2">
            Gestão operacional e análise de telemetria individual.
          </p>
        </div>

        <div className="relative group/search w-full lg:w-96">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="text-pt-text-muted w-5 h-5 group-focus-within/search:text-pt-primary transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="BUSCAR ATLETA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-pt-surface border border-pt-white/10 rounded-[24px] py-5 pl-16 pr-8 text-pt-text appearance-none transition-all shadow-inner hover:bg-pt-surface/80"
          />
        </div>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[32px] p-8 flex items-center gap-4 text-red-400">
          <AlertCircle className="w-8 h-8" />
          <span className="font-black text-sm uppercase tracking-widest">{error}</span>
        </div>
      ) : filteredJogadores.length === 0 ? (
        <div className="col-span-full py-32 text-center bg-pt-surface rounded-[44px] border border-dashed border-pt-white/10 animate-in zoom-in-95 group">
            <div className="w-20 h-20 bg-pt-bg rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-pt-white/10 group-hover:border-pt-primary/30 transition-all">
               <Zap className="w-10 h-10 text-pt-white/5 group-hover:text-pt-primary/20 transition-colors" />
            </div>
            <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] italic opacity-40">
              {searchTerm ? "Nenhum atleta encontrado no filtro atual." : "Nenhum atleta vinculado ao seu clube técnico."}
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredJogadores.map((jogador) => {
            const idade = calcularIdade(jogador.data_nascimento);
            return (
              <div
                key={jogador.id}
                onClick={() => setSelectedPlayer(jogador)}
                className="group relative bg-pt-surface border border-pt-white/10 rounded-[44px] overflow-hidden hover:border-pt-primary transition-all duration-700 shadow-3xl hover:scale-[1.02] active:scale-[0.98] flex flex-col cursor-pointer"
              >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-pt-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="aspect-[3/4] bg-pt-bg relative overflow-hidden">
                  {jogador.foto ? (
                    <img
                      src={jogador.foto}
                      alt={jogador.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-pt-white/5 bg-pt-bg relative">
                       <User className="w-24 h-24" />
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(162,255,1,0.05)_0%,transparent_70%)]" />
                    </div>
                  )}
                  
                  <div className="absolute top-6 right-6 z-10">
                    <div className="bg-pt-bg/60 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black text-pt-primary border border-pt-primary/30 tracking-[0.2em] uppercase italic shadow-2xl">
                      {jogador.posicao}
                    </div>
                  </div>

                  {jogador.numero && (
                    <div className="absolute top-6 left-6 z-10">
                      <div className="w-10 h-10 rounded-full bg-pt-primary flex items-center justify-center text-pt-bg font-black text-sm shadow-lg shadow-pt-primary/30">
                        {jogador.numero}
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-pt-surface via-pt-surface/80 to-transparent" />
                </div>

                <div className="p-8 relative mt-[-20px] bg-pt-surface flex-1 flex flex-col justify-between space-y-5">
                  <h3 className="text-2xl font-black text-white truncate tracking-tighter uppercase italic group-hover:text-pt-primary transition-colors duration-500">
                    {jogador.nome}
                  </h3>
                  
                  {/* Bio-Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <PlayerMetric label="Idade" value={idade ? `${idade}a` : '--'} />
                    <PlayerMetric label="Altura" value={jogador.altura ? `${jogador.altura}m` : '--'} />
                    <PlayerMetric label="Peso" value={jogador.peso ? `${jogador.peso}kg` : '--'} />
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-pt-bg border border-pt-white/10 rounded-[20px] text-[9px] font-black text-pt-text-muted uppercase tracking-[0.3em] group-hover:border-pt-primary/40 group-hover:text-white transition-all shadow-inner italic">
                      <Activity className="w-3.5 h-3.5 text-pt-primary" />
                      Ver Ficha
                    </button>
                    
                    <div className="w-12 h-12 rounded-[20px] bg-pt-primary/5 border border-pt-primary/20 flex items-center justify-center text-pt-primary group-hover:bg-pt-primary group-hover:text-pt-bg transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(162,255,1,0.3)]">
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-4 opacity-10 justify-center pt-8">
          <div className="w-1.5 h-1.5 rounded-full bg-pt-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-pt-white/40" />
      </div>

      {selectedPlayer && (
        <PlayerStatsModal 
            player={selectedPlayer} 
            onClose={() => setSelectedPlayer(null)} 
        />
      )}
    </div>
  );
}

function PlayerMetric({ label, value }) {
  return (
    <div className="text-center px-1 py-2 rounded-xl bg-pt-bg/40 border border-pt-white/5">
       <div className="text-[8px] font-black text-pt-text-muted uppercase tracking-wider mb-0.5">{label}</div>
       <div className="text-[11px] font-black text-white tabular-nums tracking-tighter">{value}</div>
    </div>
  );
}