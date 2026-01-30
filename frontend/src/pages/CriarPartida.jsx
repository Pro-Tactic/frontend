import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Trophy, Users, Save } from "lucide-react";

import { api } from "../services/api"; 

export default function CriarPartida() {
  const navigate = useNavigate();
  
  const [clubes, setClubes] = useState([]);
  const [competicoes, setCompeticoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    mandante: "",
    visitante: "",
    competicao: "",
    local: "",
    data_hora: "",
    placar_mandante: 0,
    placar_visitante: 0
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        const [clubesRes, competicoesRes] = await Promise.all([
          api.get("/clubes/"),
          api.get("/competicoes/")
        ]);
        setClubes(clubesRes.data);
        setCompeticoes(competicoesRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.mandante === formData.visitante) {
      alert("O time mandante não pode ser igual ao visitante!");
      return;
    }

    try {
      await api.post("/partidas/", formData);
      alert("Partida criada com sucesso!");
      navigate("/registro");
    } catch (error) {
      console.error("Erro ao salvar partida:", error);
      alert("Erro ao salvar. Verifique se todos os campos estão preenchidos corretamente.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mr-2"></div>
        Carregando dados...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-0 pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          type="button"
          className="p-2 rounded-xl bg-[#0f172a] border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/40 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            Nova Partida
          </h1>
          <p className="text-sm text-slate-400">
            Registo oficial de jogo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Card Principal: Times e Placar */}
        <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            
            {/* --- MANDANTE --- */}
            <div className="flex-1 w-full space-y-3">
              <label className="text-sm font-medium text-slate-300 ml-1">Mandante</label>
              
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select 
                  name="mandante"
                  value={formData.mandante}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition appearance-none"
                >
                  <option value="">Selecionar time...</option>
                  {clubes.map(clube => (
                    <option key={clube.id} value={clube.id}>{clube.nome}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs text-slate-500 ml-1">Placar</label>
                 <input 
                    type="number"
                    min="0"
                    name="placar_mandante"
                    value={formData.placar_mandante}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-2 px-4 text-center text-xl font-bold text-white focus:border-emerald-500/60 transition"
                 />
              </div>
            </div>

            {/* --- VS --- */}
            <div className="flex flex-col items-center justify-center shrink-0 self-center mt-4 md:mt-0">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <span className="text-xs font-bold text-slate-400">VS</span>
              </div>
            </div>

            {/* --- VISITANTE --- */}
            <div className="flex-1 w-full space-y-3">
              <label className="text-sm font-medium text-slate-300 ml-1">Visitante</label>
              
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select 
                  name="visitante"
                  value={formData.visitante}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition appearance-none"
                >
                  <option value="">Selecionar time...</option>
                  {clubes.map(clube => (
                    <option key={clube.id} value={clube.id}>{clube.nome}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs text-slate-500 ml-1">Placar</label>
                 <input 
                    type="number"
                    min="0"
                    name="placar_visitante"
                    value={formData.placar_visitante}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-2 px-4 text-center text-xl font-bold text-white focus:border-emerald-500/60 transition"
                 />
              </div>
            </div>

          </div>
        </div>

        {/* Detalhes */}
        <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 md:p-8">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Detalhes do Jogo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm text-slate-400 ml-1">Competição</label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select 
                  name="competicao"
                  value={formData.competicao}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500/60 transition appearance-none"
                >
                  <option value="">Selecionar competição...</option>
                  {competicoes.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400 ml-1">Local / Estádio</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  placeholder="Escreva o local do jogo"
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-slate-200 focus:outline-none focus:border-emerald-500/60 transition"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-slate-400 ml-1">Data e Hora</label>
              <div className="relative">
                <input 
                  type="datetime-local" 
                  name="data_hora"
                  value={formData.data_hora}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500/60 transition [color-scheme:dark]"
                />
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-slate-300 hover:text-white transition"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-8 rounded-xl transition shadow-lg shadow-emerald-900/20"
          >
            <Save className="w-4 h-4" />
            Salvar Partida
          </button>
        </div>

      </form>
    </div>
  );
}