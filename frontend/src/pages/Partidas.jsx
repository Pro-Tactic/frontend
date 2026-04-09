import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, extractList } from "../services/api";

export default function Partidas() {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartidas() {
      try {
        const response = await api.get("/partidas/");
        setPartidas(extractList(response.data));
      } catch (error) {
        console.error("Erro ao carregar partidas", error);
      } finally {
        setLoading(false);
      }
    }
    loadPartidas();
  }, []);

  if (loading) {
    return <div className="p-8 text-pt-text-muted font-medium">Carregando partidas...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-pt-primary">
            Partidas
          </h1>
          <p className="text-sm text-pt-text-muted mt-2 font-medium">
            Gerencie as escalações das suas próximas partidas.
          </p>
        </div>
        <Link to="/registro/partidas" className="bg-pt-primary hover:scale-105 text-pt-bg px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-pt-primary/20">
          + Nova Partida
        </Link>
      </div>

      <div className="grid gap-4">
        {partidas.length === 0 ? (
          <div className="text-center p-12 bg-pt-surface rounded-2xl border border-pt-slate/10 text-pt-text-muted font-bold shadow-sm shadow-black/5">
            Nenhuma partida encontrada.
          </div>
        ) : (
          partidas.map((partida) => (
            <div key={partida.id} className="bg-pt-surface border border-pt-slate/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center hover:shadow-lg hover:shadow-pt-primary/5 transition-all shadow-sm shadow-black/5">
              <div className="flex items-center gap-6 mb-4 md:mb-0">
                <div className="text-right">
                  <p className="font-black text-xl text-pt-text tracking-tight">{partida.nome_mandante || partida?.mandante?.nome || '-'}</p>
                </div>
                <div className="bg-pt-bg px-4 py-1.5 rounded-lg text-sm font-black text-pt-primary border border-pt-primary/20">
                  {partida.placar_mandante} : {partida.placar_visitante}
                </div>
                <div>
                  <p className="font-black text-xl text-pt-text tracking-tight">{partida.nome_visitante || partida?.visitante?.nome || '-'}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest">
                  {new Date(partida.data_hora).toLocaleDateString()}
                </span>
                <Link
                  to={`/escalacao/${partida.id}`}
                  className="bg-pt-primary/10 hover:bg-pt-primary text-pt-primary hover:text-pt-bg px-6 py-2 rounded-xl text-sm font-black transition-all mt-2 border border-pt-primary/20"
                >
                  Escalar Time
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
