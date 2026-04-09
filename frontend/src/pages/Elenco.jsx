import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Users, AlertCircle, Activity, User, Target } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-pt-primary"></div>
        <p className="mt-4 text-pt-text-muted font-black text-[10px] uppercase tracking-widest animate-pulse">Analizando Bio-Métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Central do Elenco</h1>
        <p className="text-pt-text-muted font-bold text-sm uppercase tracking-widest">
          Gestão física e acompanhamento individual de performance.
        </p>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[32px] p-8 flex items-center gap-4 text-red-400">
          <AlertCircle className="w-8 h-8" />
          <span className="font-black text-sm uppercase tracking-widest">{error}</span>
        </div>
      ) : jogadores.length === 0 ? (
        <div className="py-20 text-center bg-pt-surface rounded-[40px] border border-dashed border-pt-white/10 animate-in zoom-in-95">
          <Users className="w-16 h-16 mx-auto mb-4 text-pt-white/5" />
          <p className="text-pt-text-muted font-black text-xs uppercase tracking-widest">Nenhum atleta vinculado ao seu clube técnico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jogadores.map((jogador) => {
            const idade = calcularIdade(jogador.data_nascimento);
            return (
              <div
                key={jogador.id}
                className="group relative bg-pt-surface border border-pt-white/10 rounded-[40px] p-6 shadow-2xl overflow-hidden hover:border-pt-primary/30 transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-pt-primary/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-pt-primary/10 transition-colors" />

                <div className="relative z-10 flex items-start gap-6">
                  {/* Foto Container */}
                  <div className="relative flex-shrink-0">
                    {jogador.foto ? (
                      <div className="p-1 bg-pt-bg rounded-[24px] border border-pt-white/5 shadow-inner">
                        <img
                          src={jogador.foto}
                          alt={jogador.nome}
                          className="w-20 h-20 rounded-[20px] object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-[24px] bg-pt-bg border border-pt-white/5 flex items-center justify-center shadow-inner group-hover:border-pt-primary/20 transition-colors">
                        <User className="w-8 h-8 text-pt-white/10 group-hover:text-pt-primary/40 transition-colors" />
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-pt-primary flex items-center justify-center text-pt-bg font-black text-[10px] shadow-lg shadow-pt-primary/30 group-hover:scale-110 transition-transform">
                      {jogador.numero || '—'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="text-lg font-black text-white italic uppercase tracking-tighter truncate group-hover:text-pt-primary transition-colors">
                      {jogador.nome}
                    </div>
                    <div className="text-[10px] font-black text-pt-primary uppercase tracking-[0.2em] mb-4">
                      {jogador.posicao}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                       <PlayerMetric label="Idade" value={idade ? `${idade}a` : '--'} />
                       <PlayerMetric label="Altura" value={jogador.altura ? `${jogador.altura}m` : '--'} />
                       <PlayerMetric label="Peso" value={jogador.peso ? `${jogador.peso}kg` : '--'} />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-pt-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-pt-primary" />
                      <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest">Ativo no Sistema</span>
                   </div>
                   <Activity className="w-4 h-4 text-pt-text-muted group-hover:text-pt-primary animate-pulse transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
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