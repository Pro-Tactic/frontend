import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Shield, Activity, X, Trophy, Footprints, Star, User } from "lucide-react";

export default function PlayerStatsModal({ player, onClose }) {
  const [stats, setStats] = useState({ gols: 0, assistencias: 0, media: 0, jogos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca dados assim que o componente é montado
    async function fetchStats() {
      if (!player?.id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/desempenhos/?jogador=${player.id}`);
        const data = response.data;

        // Cálculos
        const totalJogos = data.length;
        const totalGols = data.reduce((acc, item) => acc + (item.gols || 0), 0);
        const totalAssistencias = data.reduce((acc, item) => acc + (item.assistencias || 0), 0);
        
        const somaNotas = data.reduce((acc, item) => acc + Number(item.nota || 0), 0);
        const mediaNotas = totalJogos > 0 ? (somaNotas / totalJogos).toFixed(1) : "0.0";

        setStats({
          gols: totalGols,
          assistencias: totalAssistencias,
          media: mediaNotas,
          jogos: totalJogos
        });
      } catch (err) {
        console.error("Erro ao calcular stats", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [player]); // Se mudar o player, recarrega

  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-slate-900 relative min-h-[200px]">
            {player.foto ? (
              <img
                src={player.foto}
                alt={player.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <User className="w-20 h-20" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f172a] to-transparent h-20"></div>
          </div>

          <div className="w-full md:w-2/3 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-1">{player.nome}</h2>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <span className="bg-slate-800 px-2 py-1 rounded text-white font-semibold border border-slate-700">
                  {player.posicao}
                </span>
                <span>{player.idade} anos</span>
              </div>
            </div>

            {loading ? (
              <div className="py-10 flex flex-col items-center justify-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-2"></div>
                <p>Analisando dados...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon={Shield} label="Partidas" value={stats.jogos} color="text-blue-400" />
                <StatCard icon={Trophy} label="Gols" value={stats.gols} color="text-yellow-400" />
                <StatCard icon={Footprints} label="Assistências" value={stats.assistencias} color="text-orange-400" />
                
                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase font-bold mb-1">
                    <Star className="w-4 h-4" /> Nota Média
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">{stats.media}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
      <div className={`flex items-center gap-2 ${color} text-xs uppercase font-bold mb-1`}>
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}