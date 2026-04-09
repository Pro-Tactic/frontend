import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, extractList } from "../services/api";
import Swal from 'sweetalert2';

const TIPOS_ESCALACAO = [
    { key: 'PADRAO', label: 'Escalação padrão' },
    { key: 'DEFENSIVA', label: 'Escalação defensiva' },
    { key: 'OFENSIVA', label: 'Escalação ofensiva' },
];

const TIPO_LABEL = {
    PADRAO: 'Padrão',
    DEFENSIVA: 'Defensiva',
    OFENSIVA: 'Ofensiva',
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

        let def = 0;
        let mid = 0;
        let att = 0;

        titulares.forEach(l => {
            // If coordinate exists, use it. If not (legacy data), maybe skip or default.
            // Assuming Y is 0 (top/attack) to 100 (bottom/defense) or vice-versa.
            // Let's assume Top (0%) is Attack (Goal opposite side) or Defense (Goalie side)?
            // Usually simpler: Goalie at bottom or top.
            // Let's adopt: 
            // 0% -> Top (Attack)
            // 100% -> Bottom (Defense/Goalie)

            // Wait, standard tactic board: Goalie is usually at bottom or top.
            // Let's assume standard intuitive view: Goalkeeer at bottom (100% or ~90%).
            // Attackers at top (< 35%).

            // Coordinates might be null initially.
            if (l.y === null || l.y === undefined) return;

            // Exclude Goalie from 4-4-2 count usually?
            // Logic: Goalie is usually very distinct.
            // Let's rely on position name or explicit check if close to goal line.
            // Or simply: check if user manually assigned GK position. 
            // Simplest: If player.posicao == 'Goleiro' -> Ignore from count.
            if (l.jogador.posicao === 'Goleiro') return;

            // Y thresholds
            // 0 ------- 35 (Attack) ------- 60 (Mid) ------- 90 (Def) ----- 100 (GK)
            if (l.y < 35) {
                att++;
            } else if (l.y < 65) {
                mid++;
            } else if (l.y < 90) {
                def++;
            } else {
                // Goalkeeper zone (>= 90%) - Ignore from count
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

        if (activeTipo !== 'PADRAO' && basePlayerIds.size === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Escalação padrão obrigatória',
                text: 'Crie primeiro a escalação padrão para liberar as escalações defensiva e ofensiva.',
                background: 'var(--pt-surface)',
                color: 'var(--pt-text-primary)'
            });
            setDraggedItem(null);
            return;
        }

        const { player, origin, escalacaoId } = draggedItem;
        const previousLineup = lineup;

        if (origin === 'nao-relacionados' && activeTipo !== 'PADRAO' && !basePlayerIds.has(player.id)) {
            Swal.fire({
                icon: 'warning',
                title: 'Jogador não permitido',
                text: 'Nas escalações defensiva e ofensiva, só é permitido usar jogadores da escalação padrão.',
                background: 'var(--pt-surface)',
                color: 'var(--pt-text-primary)'
            });
            setDraggedItem(null);
            return;
        }

        let newX = null;
        let newY = null;

        if (targetZone === 'titulares') {
            if (fieldRef.current) {
                const rect = fieldRef.current.getBoundingClientRect();
                const rawX = e.clientX - rect.left;
                const rawY = e.clientY - rect.top;

                newX = Math.max(0, Math.min(100, (rawX / rect.width) * 100));
                newY = Math.max(0, Math.min(100, (rawY / rect.height) * 100));
            }

            const isGoleiro = (player?.posicao || '').trim() === 'Goleiro';
            const naLinhaDoGoleiro = newY !== null && newY >= 90;

            if (!isGoleiro && naLinhaDoGoleiro) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Posição inválida',
                    text: 'A linha do goleiro aceita apenas jogadores da posição Goleiro.',
                    background: 'var(--pt-surface)',
                    color: 'var(--pt-text-primary)'
                });
                setDraggedItem(null);
                return;
            }

            if (isGoleiro && !naLinhaDoGoleiro) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Posição inválida',
                    text: 'O goleiro deve ser posicionado na linha do goleiro.',
                    background: 'var(--pt-surface)',
                    color: 'var(--pt-text-primary)'
                });
                setDraggedItem(null);
                return;
            }
        }

        const currentTitulares = hydratedLineup.filter(l => l.status === 'TITULAR').length;
        const currentReservas = hydratedLineup.filter(l => l.status === 'RESERVA').length;

        if (targetZone === 'titulares' && origin !== 'titulares' && currentTitulares >= 11) {
            Swal.fire({ icon: 'warning', title: 'Time Completo!', text: '11 titulares em campo.', background: 'var(--pt-surface)', color: 'var(--pt-text-primary)' });
            return;
        }
        if (targetZone === 'reservas' && origin !== 'reservas' && currentReservas >= 6) {
            Swal.fire({ icon: 'warning', title: 'Banco Cheio!', text: '6 reservas selecionados.', background: 'var(--pt-surface)', color: 'var(--pt-text-primary)' });
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
                    payload.x = newX;
                    payload.y = newY;
                }

                if (origin === 'nao-relacionados') {
                    const tempId = `tmp:${partidaId}:${player.id}:${activeTipo}`;

                    setLineup(prev => ([
                        ...prev,
                        {
                            id: tempId,
                            partida: partidaId,
                            jogador: player.id,
                            tipo: activeTipo,
                            status,
                            x: payload.x ?? null,
                            y: payload.y ?? null,
                        }
                    ]));

                    const response = await api.post('/escalacoes/', {
                        partida: partidaId,
                        jogador: player.id,
                        ...payload
                    });

                    setLineup(prev => prev.map(item => (
                        item.id === tempId ? response.data : item
                    )));
                } else {
                    setLineup(prev => prev.map(item => {
                        if (item.id !== escalacaoId) return item;
                        return {
                            ...item,
                            status,
                            x: targetZone === 'titulares' ? (payload.x ?? item.x) : null,
                            y: targetZone === 'titulares' ? (payload.y ?? item.y) : null,
                        };
                    }));

                    const response = await api.patch(`/escalacoes/${escalacaoId}/`, payload);

                    setLineup(prev => prev.map(item => (
                        item.id === escalacaoId ? response.data : item
                    )));
                }
            }

        } catch (error) {
            console.error("Erro ao mover:", error);
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha ao salvar.', background: 'var(--pt-surface)', color: 'var(--pt-text-primary)' });
            setLineup(previousLineup);
        } finally {
            setDraggedItem(null);
        }
    };

    if (loading && allPlayers.length === 0) return <div className="p-10 text-center text-pt-text">Carregando...</div>;
    if (!match) return <div className="p-10 text-center text-pt-text">Partida não encontrada.</div>;

    const basePlayerIds = new Set(baseLineup.map(item => (typeof item.jogador === 'object' ? item.jogador.id : item.jogador)));
    const isVariacao = activeTipo !== 'PADRAO';
    const escalaPadraoExiste = basePlayerIds.size > 0;
    const podeEditarEscalacao = !isVariacao || escalaPadraoExiste;

    const titulares = hydratedLineup.filter(l => l.status === 'TITULAR');
    const reservas = hydratedLineup.filter(l => l.status === 'RESERVA');
    const relatedIds = new Set(hydratedLineup.map(l => l.jogador.id));
    const jogadoresPermitidos = isVariacao
        ? allPlayers.filter(p => basePlayerIds.has(p.id))
        : allPlayers;
    const naoRelacionados = jogadoresPermitidos.filter(p => !relatedIds.has(p.id));

    return (
        <div className="min-h-screen bg-pt-bg p-4 text-pt-text">

            <header className="max-w-7xl mx-auto mb-6 flex justify-between items-center bg-pt-surface p-6 rounded-2xl shadow-xl shadow-black/5 border border-pt-slate/10">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-pt-primary tracking-tight">Escalação</h1>
                    <p className="text-sm text-pt-text-muted font-bold">
                        {match.mandante?.nome} vs {match.visitante?.nome}
                    </p>
                    <p className="text-xs text-pt-primary/60 mt-1 font-black uppercase tracking-widest">
                        Tipo atual: {TIPO_LABEL[activeTipo]}
                    </p>
                </div>
                <button onClick={() => navigate(-1)} className="text-pt-text-muted hover:text-pt-primary font-bold transition">
                    Voltar
                </button>
            </header>

            <div className="max-w-7xl mx-auto mb-4 bg-pt-surface p-2 rounded-2xl shadow-xl shadow-black/5 border border-pt-slate/10 flex gap-2">
                {TIPOS_ESCALACAO.map((tab) => {
                    const active = activeTipo === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTipo(tab.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${active ? 'bg-pt-primary text-pt-bg shadow-lg shadow-pt-primary/20' : 'bg-pt-bg/30 text-pt-text-muted hover:text-pt-primary border border-transparent'}`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {isVariacao && !escalaPadraoExiste && (
                <div className="max-w-7xl mx-auto mb-4 rounded-xl border border-yellow-500/40 bg-pt-surface px-4 py-3 text-sm text-yellow-300">
                    Para montar a escalação {TIPO_LABEL[activeTipo].toLowerCase()}, primeiro crie a escalação padrão desta partida.
                </div>
            )}

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* --- NAO RELACIONADOS --- */}
                <div
                    className="bg-pt-surface rounded-2xl p-4 border border-pt-slate/10 flex flex-col h-[600px] shadow-xl shadow-black/5"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'nao-relacionados')}
                >
                    <h2 className="text-[10px] font-black text-pt-text-muted mb-4 uppercase tracking-widest flex justify-between">
                        Disponíveis <span className="text-pt-primary">{naoRelacionados.length}</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {naoRelacionados.map(player => (
                            <div
                                key={player.id}
                                draggable={podeEditarEscalacao}
                                onDragStart={(e) => {
                                    if (!podeEditarEscalacao) return;
                                    handleDragStart(e, player, 'nao-relacionados');
                                }}
                                className={`bg-pt-bg/30 p-3 rounded-xl border border-pt-slate/5 transition flex justify-between items-center ${podeEditarEscalacao ? 'cursor-grab hover:border-pt-primary/50' : 'cursor-not-allowed opacity-60'}`}
                            >
                                <span className="font-bold text-sm text-pt-text">{player.nome}</span>
                                <span className="text-[10px] text-pt-primary font-black uppercase">{player.posicao}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-pt-surface rounded-2xl p-1 border border-pt-slate/10 h-[600px] flex flex-col shadow-xl shadow-black/5 relative">

                        <div className="absolute top-4 left-4 z-20 bg-pt-bg/80 backdrop-blur px-3 py-1 rounded-lg text-pt-text text-[10px] font-black border border-pt-slate/10 uppercase tracking-widest">
                            {titulares.length}/11
                        </div>
                        <div className="absolute top-4 right-4 z-20 bg-pt-bg/80 backdrop-blur px-4 py-1.5 rounded-xl text-pt-primary font-black text-2xl border border-pt-primary shadow-lg shadow-pt-primary/10">
                            {formationName}
                        </div>

                        <div
                            ref={fieldRef}
                            className="relative flex-1 bg-[#1a472a] rounded-lg overflow-hidden border border-slate-800 m-1 shadow-inner group"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'titulares')}
                            style={{
                                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.03) 20px)'
                            }}
                        >
                            <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-white/20 transform -translate-y-1/2 pointer-events-none"></div>
                            <div className="absolute top-0 left-0 w-full h-[35%] border-b border-dashed border-white/5 pointer-events-none"></div>
                            <div className="absolute top-0 left-0 w-full h-[35%] border-b border-dashed border-white/5 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-full h-[35%] border-t border-dashed border-white/5 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-full h-[10%] border-t border-dotted border-yellow-500/20 pointer-events-none"></div>

                            {/* Players on Field */}
                            {titulares.map((escalacao) => {
                                // Default to center if no coords
                                const top = escalacao.y !== null ? `${escalacao.y}%` : '50%';
                                const left = escalacao.x !== null ? `${escalacao.x}%` : '50%';

                                return (
                                    <div
                                        key={escalacao.id}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-move z-10"
                                        style={{ top, left }}
                                        draggable={podeEditarEscalacao}
                                        onDragStart={(e) => {
                                            if (!podeEditarEscalacao) return;
                                            handleDragStart(e, escalacao.jogador, 'titulares', escalacao.id);
                                        }}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg border-2 transition ${escalacao.jogador.posicao === 'Goleiro' ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-white text-slate-900 border-white'}`}>
                                            {escalacao.jogador.posicao === 'Goleiro' ? '1' : ''}
                                            {escalacao.jogador.posicao !== 'Goleiro' && (
                                                <span className="text-xs">{escalacao.jogador.nome.substring(0, 2).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="mt-1 px-2 py-0.5 bg-black/70 backdrop-blur rounded text-[9px] text-white whitespace-nowrap">
                                            {escalacao.jogador.nome}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* --- RESERVAS --- */}
                <div
                    className="bg-pt-surface rounded-2xl p-4 border border-pt-slate/10 flex flex-col h-[600px] shadow-xl shadow-black/5"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'reservas')}
                >
                    <h2 className="text-[10px] font-black text-pt-text-muted mb-4 uppercase tracking-widest flex justify-between">
                        Reservas <span className="text-pt-primary">{reservas.length}/6</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {reservas.map(escalacao => (
                            <div
                                key={escalacao.id}
                                draggable={podeEditarEscalacao}
                                onDragStart={(e) => {
                                    if (!podeEditarEscalacao) return;
                                    handleDragStart(e, escalacao.jogador, 'reservas', escalacao.id);
                                }}
                                className={`bg-pt-bg/30 p-3 rounded-xl border border-pt-primary/10 transition flex items-center gap-3 ${podeEditarEscalacao ? 'cursor-grab hover:border-pt-primary' : 'cursor-not-allowed opacity-60'}`}
                            >
                                <div className="w-6 h-6 rounded-full bg-pt-primary text-pt-bg flex items-center justify-center text-[10px] font-black">R</div>
                                <div>
                                    <p className="font-bold text-sm text-pt-text">{escalacao.jogador.nome}</p>
                                </div>
                            </div>
                        ))}
                        {reservas.length === 0 && (
                            <p className="text-center text-slate-600 text-xs mt-10">
                                {podeEditarEscalacao ? 'Arraste reservas pra cá' : 'Disponível após criar a escalação padrão'}
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
