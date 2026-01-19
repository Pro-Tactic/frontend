
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { User, Shield, Calendar, Activity } from "lucide-react";

export default function ListarJogadores() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJogadores() {
      try {
        const response = await api.get("/jogadores/");
        setJogadores(response.data);
      } catch (err) {
        console.error("Erro ao carregar jogadores", err);
      } finally {
        setLoading(false);
      }
    }
    loadJogadores();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Meu Elenco</h1>
        <p className="text-slate-400">
          Gerencie e visualize os jogadores do seu time.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {jogadores.map((jogador) => (
          <div
            key={jogador.id}
            className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden hover:border-green-500/50 transition-all group"
          >
            <div className="aspect-[3/4] bg-slate-800 relative">
              {jogador.foto ? (
                <img
                  src={jogador.foto}
                  alt={jogador.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <User className="w-20 h-20" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                {jogador.posicao}
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-white truncate mb-1">
                {jogador.nome}
              </h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Clube
                  </span>
                  <span className="text-slate-200">
                     {/* Se o serializer retornar o objeto clube, usamos .nome, senão usamos o próprio user.clube do contexto ou ajustamos o serializer */}
                     {/* Por enquanto, vou omitir ou assumir que o serializer traga o ID ou nome se disponível. */}
                     {/* Como filtramos por clube no backend, todos devem ser do mesmo clube. */}
                     Meu Clube
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Idade
                  </span>
                  <span className="text-slate-200">{jogador.idade} anos</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {jogadores.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-[#0f172a]/50 rounded-xl border border-dashed border-slate-800">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum jogador encontrado para seu time.</p>
            </div>
        )}
      </div>
    </div>
  );
}
