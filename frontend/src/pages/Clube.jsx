import { useEffect, useState } from "react";;
import { api } from "../services/api";
import { 
  Trophy, History, BarChart3, BookOpen, 
  ChevronLeft, Star, Activity 
} from "lucide-react";

export default function DadosClube() {
  const [clubData, setClubData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClubData() {
      try {
        const token = localStorage.getItem("token");
        
        // Chamada ao backend. O endpoint deve existir no seu servidor.
        const response = await api.get("/clube/dados-gerais/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setClubData(response.data);
      } catch (err) {
        console.error("Erro ao carregar dados do clube:", err);
      } finally {
        setLoading(false);
      }
    }

    loadClubData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 relative">
      {/* Efeito visual ProTactic */}
      <div className="absolute top-[-5%] left-[-5%] w-72 h-72 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-6xl mx-auto z-10 relative">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna: Identidade e Estatísticas */}
          <div className="space-y-6">
            <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trophy className="text-green-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold">{clubData?.nome || "Clube não identificado"}</h2>
              <p className="text-slate-500 text-xs mt-1 uppercase">Série A • Profissional</p>
            </div>

            <CardWrapper title="Dados Estatísticos Gerais" icon={<BarChart3 size={16}/>}>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Gols" value={clubData?.stats?.gols_marcados || "0"} />
                <StatItem label="Vitórias" value={clubData?.stats?.vitorias || "0"} />
                <StatItem label="Posse Média" value={`${clubData?.stats?.posse || 0}%`} />
                <StatItem label="Cartões" value={clubData?.stats?.cartoes || "0"} />
              </div>
            </CardWrapper>
          </div>

          {/* Coluna: História e Resumo */}
          <div className="lg:col-span-2 space-y-6">
            <CardWrapper title="Resumo da Temporada" icon={<Activity size={16}/>}>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  {clubData?.resumo_temporada || "Nenhum resumo disponível para esta temporada."}
                </p>
              </div>
            </CardWrapper>

            <CardWrapper title="História Geral do Clube" icon={<BookOpen size={16}/>}>
              <p className="text-slate-400 text-sm leading-relaxed">
                {clubData?.historia_geral || "Aguardando informações históricas do banco de dados."}
              </p>
            </CardWrapper>

            <CardWrapper title="Histórico Geral" icon={<History size={16}/>}>
              <div className="space-y-2">
                {clubData?.historico_geral?.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-800">
                    <span className="text-sm text-slate-200 flex items-center gap-2">
                      <Star size={12} className="text-yellow-500" /> {item.evento}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{item.ano}</span>
                  </div>
                ))}
              </div>
            </CardWrapper>
          </div>
        </div>
      </main>
    </div>
  );
}

// Componentes de Interface Reutilizáveis
function CardWrapper({ title, icon, children }) {
  return (
    <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl">
      <div className="flex items-center gap-2 mb-4 text-green-500">
        {icon}
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="bg-[#1e293b]/40 p-3 rounded-xl border border-slate-800">
      <span className="text-[10px] text-slate-500 block mb-1 uppercase tracking-tighter">{label}</span>
      <span className="text-xl font-bold text-slate-100 tracking-tight">{value}</span>
    </div>
  );
}