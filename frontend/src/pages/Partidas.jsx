import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function Partidas() {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartidas() {
      try {
        const response = await api.get("/partidas/");
        setPartidas(response.data);
      } catch (error) {
        console.error("Erro ao carregar partidas", error);
      } finally {
        setLoading(false);
      }
    }
    loadPartidas();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400">Carregando partidas...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-white">
            Partidas
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Gerencie as escalações das suas próximas partidas.
          </p>
        </div>
        <Link to="/registro/partidas" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nova Partida
        </Link>
      </div>

      <div className="grid gap-4">
        {partidas.length === 0 ? (
          <div className="text-center p-12 bg-[#0b1220] rounded-xl border border-slate-800 text-slate-500">
            Nenhuma partida encontrada.
          </div>
        ) : (
          partidas.map((partida) => (
            <div key={partida.id} className="bg-[#0b1220] border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center hover:border-slate-700 transition">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="text-right">
                  <p className="font-bold text-lg text-white">{partida.mandante.nome}</p>
                </div>
                <div className="bg-slate-800 px-3 py-1 rounded text-xs font-bold text-slate-400">
                  {partida.placar_mandante} x {partida.placar_visitante}
                </div>
                <div>
                  <p className="font-bold text-lg text-white">{partida.visitante.nome}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-slate-500">
                  {new Date(partida.data_hora).toLocaleDateString()}
                </span>
                <Link
                  to={`/escalacao/${partida.id}`}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-medium transition mt-2"
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
