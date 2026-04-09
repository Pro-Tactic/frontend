import React, { useEffect, useState } from 'react';
import { api, extractList } from '../services/api';
import { resolveMediaUrl } from '../services/media';
import { Building, Globe, History, Activity, TrendingUp, Trophy, AlertTriangle } from 'lucide-react';

const ClubeDashboard = () => {
  const [clubesDisponiveis, setClubesDisponiveis] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erroConexao, setErroConexao] = useState(null);

  useEffect(() => {
    const fetchLista = async () => {
      try {
        const response = await api.get('/clubes/');
        const listaFinal = extractList(response.data);
        setClubesDisponiveis(listaFinal);
        if (listaFinal.length > 0) setSelectedId(listaFinal[0].id);
      } catch (err) {
        setErroConexao("Não foi possível conectar ao banco de dados.");
        console.error(err);
      }
    };
    fetchLista();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!selectedId) return;
      setLoading(true);
      try {
        const response = await api.get(`/clubes/${selectedId}/dashboard/`);
        setData(response.data);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedId]);

  if (erroConexao) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Erro de Conexão</h2>
        <p className="text-pt-text-muted font-bold text-sm uppercase tracking-widest">{erroConexao}</p>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-[1400px] mx-auto">
      {/* Seletor de Clube */}
      <div className="mb-8 p-6 bg-pt-surface rounded-3xl border border-pt-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden text-pt-text">
        <div className="flex items-center gap-4 z-10">
          <div className="p-3 bg-pt-primary/10 rounded-2xl border border-pt-primary/20">
            <Building className="w-6 h-6 text-pt-primary" />
          </div>
          <div>
            <label className="text-[10px] font-black text-pt-primary uppercase tracking-[0.2em] block mb-1">Clube em Visualização</label>
            <div className="flex items-center gap-3">
              <select 
                value={selectedId} 
                onChange={(e) => setSelectedId(e.target.value)}
                className="bg-pt-surface text-white font-black text-lg p-0 border-none outline-none focus:ring-0 cursor-pointer hover:text-pt-primary transition-colors appearance-none"
              >
                {clubesDisponiveis.map(c => (
                  <option key={c.id} value={c.id} className="bg-pt-bg text-sm font-bold">{c.nome}</option>
                ))}
              </select>
              {loading && <div className="animate-spin h-4 w-4 border-2 border-pt-primary border-t-transparent rounded-full"></div>}
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
           <div className="text-right hidden md:block">
              <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest">Base de Dados</span>
              <p className="text-xs font-bold text-white uppercase tracking-tighter">Sincronizada em Tempo Real</p>
           </div>
        </div>
      </div>

      {data ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Infos Principais */}
            <div className="lg:col-span-4 bg-pt-surface p-8 rounded-[32px] border border-pt-white/10 flex flex-col items-center justify-center text-center shadow-2xl relative text-pt-text">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Building className="w-24 h-24" />
              </div>
              <div className="relative mb-6">
                 <div className="absolute inset-0 bg-pt-primary/20 blur-2xl rounded-full" />
                 <div className="bg-pt-bg p-6 rounded-[32px] border-2 border-pt-white/10 relative">
                    <img 
                      src={resolveMediaUrl(data.perfil.escudo) || 'https://via.placeholder.com/100'} 
                      className="w-24 h-24 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                      alt="Escudo" 
                    />
                 </div>
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{data.perfil.nome}</h1>
              <div className="flex items-center gap-2 text-pt-text-muted font-black text-[10px] uppercase tracking-widest bg-pt-bg/50 px-4 py-2 rounded-full border border-pt-white/5">
                <Globe className="w-3 h-3 text-pt-primary" /> {data.perfil.pais}
                <span className="mx-1">•</span>
                <History className="w-3 h-3 text-pt-primary" /> Desde {data.perfil.ano}
              </div>
            </div>

            {/* História/Manifesto */}
            <div className="lg:col-span-8 bg-pt-surface p-10 rounded-[40px] border border-pt-white/10 shadow-2xl flex flex-col justify-center relative overflow-hidden group text-pt-text">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-pt-primary/5 rounded-full blur-[100px] transition-all group-hover:bg-pt-primary/10" />
              <div className="flex items-center gap-2 text-[10px] font-black text-pt-primary uppercase tracking-[0.2em] mb-6">
                 <History className="w-4 h-4" /> Legado ProTactic
              </div>
              <p className="text-white font-medium leading-[1.8] italic text-xl relative z-10">
                "{data.perfil.historia || "A trajetória deste clube no ProTactic é marcada pela dedicação e busca incessante pela excelência esportiva. Um legado construído partida a partida através de analytics de alta performance."}"
              </p>
            </div>
          </div>

          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard label="Partidas" value={data.estatisticas.total_jogos} icon={Activity} />
            <MetricCard label="Vitórias" value={data.estatisticas.vitorias} icon={Trophy} />
            <MetricCard label="Derrotas" value={data.estatisticas.derrotas} icon={Activity} />
            <MetricCard label="Aprov." value={`${data.estatisticas.aproveitamento}%`} icon={TrendingUp} positive />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-pt-text">
            {/* Resumo da Temporada */}
            <div className="bg-pt-surface p-10 rounded-[40px] border border-pt-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-10 border-b border-pt-white/10 pb-6">
                 <h2 className="text-xl font-black text-white uppercase tracking-tight">Estatísticas de Temporada</h2>
                 <div className="h-2 w-2 rounded-full bg-pt-primary animate-pulse" />
              </div>
              <div className="space-y-8">
                <SeasonBar label="Vitórias" value={data.estatisticas.vitorias} total={data.estatisticas.total_jogos} color="bg-pt-primary" />
                <SeasonBar label="Empates" value={data.estatisticas.empates} total={data.estatisticas.total_jogos} color="bg-white/40" />
                <SeasonBar label="Derrotas" value={data.estatisticas.derrotas} total={data.estatisticas.total_jogos} color="bg-red-500/60" />
              </div>
            </div>

            {/* Histórico Recente */}
            <div className="bg-pt-surface p-10 rounded-[40px] border border-pt-white/10 shadow-2xl text-pt-text">
              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 border-b border-pt-white/10 pb-6 text-left">Resultados Recentes</h2>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-3 custom-scrollbar">
                {data.historico_partidas?.length > 0 ? (
                  data.historico_partidas.map((jogo, idx) => (
                    <div key={idx} className="flex justify-between items-center p-5 bg-pt-bg/50 rounded-2xl border border-pt-white/5 hover:border-pt-primary/30 transition-all group">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest mb-1">vs Oponente</span>
                        <span className="font-bold text-white uppercase tracking-tighter">{jogo.adversario}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-pt-primary uppercase tracking-widest mb-1">Placar</span>
                        <span className="font-mono font-black text-2xl text-white group-hover:scale-110 transition-transform">{jogo.placar}</span>
                      </div>
                      <div className={`text-[10px] font-black px-4 py-2 rounded-xl tracking-widest ${jogo.resultado === 'V' ? 'bg-pt-primary/10 text-pt-primary border border-pt-primary/20' : 'bg-white/5 text-pt-text-muted border border-pt-white/10'}`}>
                        {jogo.resultado === 'V' ? 'VITÓRIA' : 'DERROTA'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-pt-text-muted font-bold uppercase tracking-widest italic text-xs">Nenhum histórico disponível.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-pt-text-muted">
          <div className="w-12 h-12 border-4 border-pt-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Sincronizando Dados do Clube...</p>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, positive }) => {
  return (
    <div className={`bg-pt-surface p-6 rounded-[28px] border border-pt-white/10 shadow-xl transition-all hover:scale-[1.03] group text-pt-text`}>
      <div className="flex items-center justify-between mb-4">
         <p className="text-pt-text-muted text-[10px] font-black uppercase tracking-widest">{label}</p>
         <div className={`p-2 rounded-xl bg-pt-bg ${positive ? 'text-pt-primary' : 'text-white/40'}`}>
            <Icon className="w-4 h-4" />
         </div>
      </div>
      <p className="text-4xl font-black text-white tracking-tighter group-hover:text-pt-primary transition-colors">{value ?? 0}</p>
    </div>
  );
};

const SeasonBar = ({ label, value, total, color }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="text-pt-text">
      <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-pt-text-muted">
        <span>{label}</span>
        <span className="text-white">{value} / {total}</span>
      </div>
      <div className="w-full bg-pt-bg rounded-full h-2.5 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(162,255,1,0.3)]`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

export default ClubeDashboard;