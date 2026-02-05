import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClubeDashboard = () => {
  const [clubesDisponiveis, setClubesDisponiveis] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erroConexao, setErroConexao] = useState(null);

  // 1. Busca a lista de clubes do banco de dados
  useEffect(() => {
    const fetchLista = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://127.0.0.1:8000/clubes/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const listaFinal = response.data.results || response.data;
        setClubesDisponiveis(listaFinal);
        if (listaFinal.length > 0) setSelectedId(listaFinal[0].id);
      } catch (err) {
        setErroConexao("Não foi possível conectar ao banco de dados.");
        console.error(err);
      }
    };
    fetchLista();
  }, []);

  // 2. Busca os dados detalhados (Dashboard) do clube selecionado
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!selectedId) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/clubes/${selectedId}/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedId]);

  if (erroConexao) return <div className="p-8 text-red-400 bg-gray-900 min-h-screen font-bold">{erroConexao}</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white font-sans">
      
      {/* SELETOR DE CLUBES (ACESSANDO O BANCO) */}
      <div className="mb-8 p-4 bg-gray-800 rounded-xl border border-gray-700 flex items-center gap-4 shadow-lg">
        <label className="text-blue-400 font-bold uppercase text-sm tracking-widest">Clube Ativo:</label>
        <select 
          value={selectedId} 
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-gray-700 p-2 rounded-lg border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
        >
          {clubesDisponiveis.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        {loading && <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
      </div>

      {data ? (
        <div className="animate-fadeIn space-y-8">
          
          {/* SEÇÃO: HISTÓRIA GERAL DO CLUBE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col items-center justify-center text-center shadow-xl">
              <div className="bg-white p-4 rounded-full mb-4 shadow-inner">
                <img src={data.perfil.escudo || 'https://via.placeholder.com/100'} className="w-24 h-24 object-contain" alt="Escudo" />
              </div>
              <h1 className="text-3xl font-black text-white">{data.perfil.nome}</h1>
              <p className="text-gray-400 font-medium">{data.perfil.pais} • Desde {data.perfil.ano}</p>
            </div>

            <div className="lg:col-span-2 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
              <h2 className="text-blue-400 font-bold uppercase text-sm mb-4 tracking-tighter">História Geral do Clube</h2>
              <p className="text-gray-300 leading-relaxed italic text-lg">
                "{data.perfil.historia || "A trajetória deste clube no ProTactic é marcada pela dedicação e busca incessante pela excelência esportiva. Um legado construído partida a partida."}"
              </p>
            </div>
          </div>

          {/* SEÇÃO: DADOS ESTATÍSTICOS GERAIS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard label="Partidas Jogadas" value={data.estatisticas.total_jogos} color="blue" />
            <MetricCard label="Vitórias" value={data.estatisticas.vitorias} color="green" />
            <MetricCard label="Derrotas" value={data.estatisticas.derrotas} color="red" />
            <MetricCard label="Aproveitamento" value={`${data.estatisticas.aproveitamento}%`} color="yellow" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SEÇÃO: RESUMO DA TEMPORADA */}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-bold mb-8 border-b border-gray-700 pb-4">Resumo da Temporada</h2>
              <div className="space-y-6">
                <SeasonBar label="Vitórias" value={data.estatisticas.vitorias} total={data.estatisticas.total_jogos} color="bg-green-500" />
                <SeasonBar label="Empates" value={data.estatisticas.empates} total={data.estatisticas.total_jogos} color="bg-gray-400" />
                <SeasonBar label="Derrotas" value={data.estatisticas.derrotas} total={data.estatisticas.total_jogos} color="bg-red-500" />
              </div>
            </div>

            {/* SEÇÃO: HISTÓRICO GERAL (ÚLTIMAS PARTIDAS) */}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4">Histórico Geral</h2>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {data.historico_partidas?.length > 0 ? (
                  data.historico_partidas.map((jogo, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-900 rounded-xl border-l-4 border-blue-500">
                      <span className="font-semibold text-gray-200">{jogo.adversario}</span>
                      <span className="font-mono font-bold text-xl text-blue-400">{jogo.placar}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${jogo.resultado === 'V' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {jogo.resultado === 'V' ? 'VITÓRIA' : 'DERROTA'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500 italic">Nenhum histórico de partida disponível no banco.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-xl animate-pulse">Aguardando seleção do clube...</p>
        </div>
      )}
    </div>
  );
};

/* Componentes de UI */
const MetricCard = ({ label, value, color }) => {
  const borders = { blue: 'border-blue-500', green: 'border-green-500', yellow: 'border-yellow-500', red: 'border-red-500' };
  return (
    <div className={`bg-gray-800 p-6 rounded-2xl border-l-4 ${borders[color]} shadow-lg transition-transform hover:scale-105`}>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
      <p className="text-4xl font-black">{value ?? 0}</p>
    </div>
  );
};

const SeasonBar = ({ label, value, total, color }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-2 text-sm font-bold">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

export default ClubeDashboard;