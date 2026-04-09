import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, extractList } from "../services/api";
import Swal from 'sweetalert2';
import { ArrowLeft, Users, Shield, Target, Zap } from "lucide-react";

const TIPOS_ESCALACAO = [
    { key: 'PADRAO', label: 'TÁTICA PADRÃO' },
    { key: 'DEFENSIVA', label: 'VARIAÇÃO DEFENSIVA' },
    { key: 'OFENSIVA', label: 'VARIAÇÃO OFENSIVA' },
];

const TIPO_LABEL = {
    PADRAO: 'PADRÃO',
    DEFENSIVA: 'DEFENSIVA',
    OFENSIVA: 'OFENSIVA',
};

export default function Escalacao() {
    const { partidaId } = useParams();
    const navigate = useNavigate();
    const fieldRef = useRef(null);

    const [activeTipo, setActiveTipo] = useState('PADRAO');
    const [match, setMatch] = useState(null);
    const [allPlayers, setAllPlayers] = useState([]);
    const [baseLineup, setBaseLineup] = useState([]);
    const [lineup, setLineup] = useState([]);
    const [hydratedLineup, setHydratedLineup] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formationName, setFormationName] = useState("?-?-?");

    useEffect(() => {
        fetchData();
    }, [partidaId, activeTipo]);

    useEffect(() => {
        if (allPlayers.length > 0 && lineup) {
            const hydrated = lineup.map(l => {
                const playerId = typeof l.jogador === 'object' ? l.jogador.id : l.jogador;
                const playerObj = allPlayers.find(p => p.id === playerId);
                return {
                    ...l,
                    jogador: playerObj || { id: playerId, nome: 'Desconhecido', posicao: '?' }
                };
            });
            setHydratedLineup(hydrated);
            calculateFormation(hydrated);
        } else {
            setHydratedLineup([]);
            setFormationName("?-?-?");
        }
    }, [lineup, allPlayers]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [matchRes, playersRes, baseLineupRes] = await Promise.all([
                api.get(`/partidas/${partidaId}/`),
                api.get('/jogadores/'),
                api.get(`/escalacoes/?partida=${partidaId}&tipo=PADRAO`),
            ]);

            let lineupRes = baseLineupRes;
            if (activeTipo !== 'PADRAO') {
                lineupRes = await api.get(`/escalacoes/?partida=${partidaId}&tipo=${activeTipo}`);
            }

            setMatch(matchRes.data);
            setAllPlayers(extractList(playersRes.data));
            setBaseLineup(extractList(baseLineupRes.data));
            setLineup(extractList(lineupRes.data));

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateFormation = (currentLineup) => {
        const titulares = currentLineup.filter(l => l.status === 'TITULAR');
        let def = 0, mid = 0, att = 0;

        titulares.forEach(l => {
            if (l.y === null || l.y === undefined) return;
            if (l.jogador.posicao === 'Goleiro') return;

            if (l.y < 35) {
                att++;
            } else if (l.y < 65) {
                mid++;
            } else if (l.y < 90) {
                def++;
            }
        });

        setFormationName(`${def}-${mid}-${att}`);
    };

    const handleDragStart = (e, player, origin, escalacaoId = null) => {
        setDraggedItem({ player, origin, escalacaoId });
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e, targetZone) => {
        e.preventDefault();
        if (!draggedItem) return;

        const basePlayerIds = new Set(baseLineup.map(item => (typeof item.jogador === 'object' ? item.jogador.id : item.jogador)));
        const swalConfig = { background: '#0B0B0B', color: '#FEFEFE', confirmButtonColor: '#A2FF01' };

        if (activeTipo !== 'PADRAO' && basePlayerIds.size === 0) {
            Swal.fire({ icon: 'warning', title: 'CONFIGURAÇÃO BLOQUEADA', text: 'A tática padrão deve ser definida antes de qualquer variação estratégica.', ...swalConfig });
            setDraggedItem(null);
            return;
        }

        const { player, origin, escalacaoId } = draggedItem;

        if (origin === 'nao-relacionados' && activeTipo !== 'PADRAO' && !basePlayerIds.has(player.id)) {
            Swal.fire({ icon: 'warning', title: 'ATLETA INDISPONÍVEL', text: 'Apenas jogadores da tática padrão podem ser utilizados em variações.', ...swalConfig });
            setDraggedItem(null);
            return;
        }

        let newX = null, newY = null;

        if (targetZone === 'titulares' && fieldRef.current) {
            const rect = fieldRef.current.getBoundingClientRect();
            newX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            newY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

            const isGoleiro = (player?.posicao || '').trim() === 'Goleiro';
            const naLinhaDoGoleiro = newY >= 90;

            if (!isGoleiro && naLinhaDoGoleiro) {
                Swal.fire({ icon: 'warning', title: 'POSICIONAMENTO ILÍCITO', text: 'Esta zona é exclusiva para a heráldica de Goleiro.', ...swalConfig });
                setDraggedItem(null); return;
            }
            if (isGoleiro && !naLinhaDoGoleiro) {
                Swal.fire({ icon: 'warning', title: 'CENTRO DE DEFESA', text: 'O Goleiro deve ser alocado em sua área de atuação primária.', ...swalConfig });
                setDraggedItem(null); return;
            }
        }

        const currentTitulares = hydratedLineup.filter(l => l.status === 'TITULAR').length;
        const currentReservas = hydratedLineup.filter(l => l.status === 'RESERVA').length;

        if (targetZone === 'titulares' && origin !== 'titulares' && currentTitulares >= 11) {
            Swal.fire({ icon: 'warning', title: 'LIMITE ATINGIDO', text: 'O sistema não admite exceder 11 combatentes em campo.', ...swalConfig });
            return;
        }
        if (targetZone === 'reservas' && origin !== 'reservas' && currentReservas >= 6) {
            Swal.fire({ icon: 'warning', title: 'BANCO OVERLOAD', text: 'Limite de suporte estratégico atingido (6 atletas).', ...swalConfig });
            return;
        }

        try {
            if (targetZone === 'nao-relacionados') {
                setLineup(prev => prev.filter(item => item.id !== escalacaoId));
                await api.delete(`/escalacoes/${escalacaoId}/`);
            } else {
                const status = targetZone === 'titulares' ? 'TITULAR' : 'RESERVA';
                const payload = { status, tipo: activeTipo };
                if (targetZone === 'titulares' && newX !== null) {
                    payload.x = newX; payload.y = newY;
                }

                if (origin === 'nao-relacionados') {
                    const tempId = `tmp:${player.id}`;
                    setLineup(prev => ([...prev, { id: tempId, partida: partidaId, jogador: player.id, tipo: activeTipo, status, x: payload.x ?? null, y: payload.y ?? null }]));
                    const res = await api.post('/escalacoes/', { partida: partidaId, jogador: player.id, ...payload });
                    setLineup(prev => prev.map(item => (item.id === tempId ? res.data : item)));
                } else {
                    setLineup(prev => prev.map(item => {
                        if (item.id !== escalacaoId) return item;
                        return { ...item, status, x: targetZone === 'titulares' ? (payload.x ?? item.x) : null, y: targetZone === 'titulares' ? (payload.y ?? item.y) : null };
                    }));
                    const res = await api.patch(`/escalacoes/${escalacaoId}/`, payload);
                    setLineup(prev => prev.map(item => (item.id === escalacaoId ? res.data : item)));
                }
            }
        } catch (error) {
            console.error("Erro ao mover:", error);
            Swal.fire({ icon: 'error', title: 'ERRO TÁTICO', text: 'Sincronização falhou.', background: '#0B0B0B', color: '#FEFEFE', confirmButtonColor: '#FF4B4B' });
            fetchData();
        } finally {
            setDraggedItem(null);
        }
    };

    if (loading && allPlayers.length === 0) return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-pt-bg text-pt-primary gap-4">
        <div className="w-12 h-12 border-4 border-pt-primary/30 border-t-pt-primary rounded-full animate-spin" />
        <span className="font-black text-[10px] uppercase tracking-[0.3em] italic">Carregando Sala de Comando...</span>
      </div>
    );

    if (!match) return <div className="min-h-screen bg-pt-bg flex items-center justify-center font-black text-white italic">DADOS INCONSISTENTES.</div>;

    const basePlayerIds = new Set(baseLineup.map(item => (typeof item.jogador === 'object' ? item.jogador.id : item.jogador)));
    const isVariacao = activeTipo !== 'PADRAO';
    const escalaPadraoExiste = basePlayerIds.size > 0;
    const podeEditarEscalacao = !isVariacao || escalaPadraoExiste;

    const titulares = hydratedLineup.filter(l => l.status === 'TITULAR');
    const reservas = hydratedLineup.filter(l => l.status === 'RESERVA');
    const relatedIds = new Set(hydratedLineup.map(l => l.jogador.id));
    const jogadoresPermitidos = isVariacao ? allPlayers.filter(p => basePlayerIds.has(p.id)) : allPlayers;
    const naoRelacionados = jogadoresPermitidos.filter(p => !relatedIds.has(p.id));

    return (
        <div className="min-h-screen bg-pt-bg p-8 space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-[18px] bg-pt-surface border border-pt-white/10 text-pt-text-muted hover:text-pt-primary hover:border-pt-primary/30 flex items-center justify-center transition-all shadow-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Quadro Tático</h1>
                        <p className="text-pt-text-muted font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                            {(match.nome_mandante || 'MANDANTE').toUpperCase()} <span className="text-pt-primary">VS</span> {(match.nome_visitante || 'VISITANTE').toUpperCase()}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 p-1 bg-pt-surface border border-pt-white/10 rounded-[20px] shadow-2xl">
                    {TIPOS_ESCALACAO.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTipo(tab.key)}
                            className={`px-6 py-2.5 rounded-[16px] text-[10px] font-black tracking-widest transition-all ${activeTipo === tab.key ? 'bg-pt-primary text-pt-bg shadow-xl' : 'text-pt-text-muted hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {!podeEditarEscalacao && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-[24px] flex items-center gap-4 animate-in slide-in-from-top-4">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <p className="font-black text-[10px] uppercase tracking-widest text-yellow-500/80">Bloqueio Operacional: Defina a tática padrão antes de acessar variações.</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-8 h-[720px]">
                <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-6 flex flex-col shadow-2xl overflow-hidden relative" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'nao-relacionados')}>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Disponíveis</h2>
                            <p className="text-[9px] font-bold text-pt-text-muted uppercase tracking-widest">Base de Dados</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-pt-bg border border-pt-white/5 flex items-center justify-center text-pt-primary font-black text-xs">{naoRelacionados.length}</div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {naoRelacionados.map(player => (
                            <div
                                key={player.id} draggable={podeEditarEscalacao}
                                onDragStart={(e) => podeEditarEscalacao && handleDragStart(e, player, 'nao-relacionados')}
                                className={`group p-4 rounded-2xl bg-pt-bg/50 border border-pt-white/5 transition-all ${podeEditarEscalacao ? 'cursor-grab hover:border-pt-primary/40 hover:bg-pt-primary/5 active:cursor-grabbing' : 'grayscale opacity-30 cursor-not-allowed'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-xs text-white uppercase tracking-wider">{player.nome}</span>
                                    <span className="text-[9px] text-pt-primary px-2 py-1 bg-pt-primary/10 rounded-lg font-black">{player.posicao.toUpperCase()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-6 relative">
                    <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-4 flex-1 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-12 pointer-events-none">
                            <div className="flex flex-col items-center">
                                <span className="text-[40px] font-black italic text-white/5 leading-none">{titulares.length}</span>
                                <span className="text-[9px] font-black text-pt-primary tracking-[0.3em] -mt-2">UNID. ATIVAS</span>
                            </div>
                            <div className="bg-pt-bg border border-pt-primary/20 px-6 py-4 rounded-[24px] shadow-2xl flex flex-col items-center gap-1">
                                <span className="text-3xl font-black italic text-pt-primary tracking-tighter tabular-nums leading-none">{formationName}</span>
                                <span className="text-[8px] font-black text-pt-text-muted tracking-[0.2em] uppercase">Set-up Tático</span>
                            </div>
                        </div>

                        <div
                            ref={fieldRef} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'titulares')}
                            className="relative flex-1 bg-gradient-to-b from-[#090909] to-[#0D150B] rounded-[32px] overflow-hidden border border-pt-white/5 m-2 shadow-inner group"
                            style={{ backgroundImage: 'radial-gradient(circle at center, rgba(162, 255, 1, 0.03) 0%, transparent 70%), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.01) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.01) 20px)' }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                <Shield className="w-96 h-96 text-pt-primary" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-pt-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                            <div className="absolute top-1/2 left-0 w-full h-px bg-pt-primary/10 -translate-y-1/2 pointer-events-none" />
                            <div className="absolute inset-y-0 left-1/2 w-px bg-pt-primary/5 pointer-events-none" />

                            {titulares.map((escalacao) => (
                                <div
                                    key={escalacao.id}
                                    style={{ top: `${escalacao.y}%`, left: `${escalacao.x}%` }}
                                    draggable={podeEditarEscalacao}
                                    onDragStart={(e) => podeEditarEscalacao && handleDragStart(e, escalacao.jogador, 'titulares', escalacao.id)}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/player z-10 p-2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform duration-300"
                                >
                                    <div className={`relative w-14 h-14 rounded-[20px] bg-pt-bg border-4 transition-all shadow-2xl flex items-center justify-center group-hover/player:shadow-pt-primary/20 ${escalacao.jogador.posicao === 'Goleiro' ? 'border-pt-primary bg-pt-primary/5 shadow-pt-primary/10' : 'border-pt-white/10 group-hover/player:border-pt-primary/40'}`}>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pt-primary blur-[4px] opacity-0 group-hover/player:opacity-100 transition-opacity" />
                                        <Users className={`w-5 h-5 ${escalacao.jogador.posicao === 'Goleiro' ? 'text-pt-primary' : 'text-pt-text-muted'}`} />
                                    </div>
                                    <div className="mt-3 px-3 py-1.5 bg-pt-bg/90 backdrop-blur-md border border-pt-white/10 rounded-xl text-center shadow-2xl relative min-w-[80px]">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tighter whitespace-nowrap">{escalacao.jogador.nome.split(' ')[0]}</p>
                                        <div className="flex items-center justify-center gap-1 mt-0.5 opacity-60">
                                            <Target className="w-2 h-2 text-pt-primary" />
                                            <span className="text-[7px] font-black text-pt-primary uppercase tracking-[0.1em]">{escalacao.jogador.posicao}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-6 flex flex-col shadow-2xl overflow-hidden relative" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'reservas')}>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Reservas</h2>
                            <p className="text-[9px] font-bold text-pt-text-muted uppercase tracking-widest">Suporte Tático</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-pt-bg border border-pt-white/5 flex items-center justify-center text-pt-primary font-black text-xs">{reservas.length}/6</div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {reservas.map(escalacao => (
                            <div
                                key={escalacao.id} draggable={podeEditarEscalacao}
                                onDragStart={(e) => podeEditarEscalacao && handleDragStart(e, escalacao.jogador, 'reservas', escalacao.id)}
                                className={`group p-4 rounded-2xl bg-pt-bg border border-pt-primary/10 transition-all ${podeEditarEscalacao ? 'cursor-grab hover:border-pt-primary hover:bg-pt-primary/5' : 'opacity-30'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-pt-primary flex items-center justify-center text-pt-bg font-black text-[10px]">R</div>
                                    <div className="space-y-0.5">
                                        <p className="font-black text-xs text-white uppercase tracking-wide">{escalacao.jogador.nome}</p>
                                        <p className="text-[8px] font-black text-pt-primary uppercase tracking-[0.2em]">{escalacao.jogador.posicao}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {reservas.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 opacity-20 text-center gap-4">
                                <Users className="w-10 h-10" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Célula Vazia</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-pt-white/5 flex items-center justify-between opacity-30">
                        <span className="text-[8px] font-black uppercase tracking-widest leading-none">PT-TACTIC ENGINE v4.0</span>
                        <Target className="w-3 h-3 text-pt-primary" />
                    </div>
                </div>
            </div>
        </div>
    );
}
