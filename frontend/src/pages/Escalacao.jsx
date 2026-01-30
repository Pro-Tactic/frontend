import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Swal from 'sweetalert2';

// We no longer strictly need predefined POSITIONS for rendering, 
// but we might keep them for initial default positions if needed.
// For now, we rely on X/Y from db.

export default function Escalacao() {
    const { partidaId } = useParams();
    const navigate = useNavigate();
    const fieldRef = useRef(null);

    const [match, setMatch] = useState(null);
    const [allPlayers, setAllPlayers] = useState([]);
    const [lineup, setLineup] = useState([]);
    const [hydratedLineup, setHydratedLineup] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formationName, setFormationName] = useState("?-?-?");

    useEffect(() => {
        fetchData();
    }, [partidaId]);

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
            const [matchRes, playersRes, lineupRes] = await Promise.all([
                api.get(`/partidas/${partidaId}/`),
                api.get('/jogadores/'),
                api.get(`/escalacoes/?partida=${partidaId}`)
            ]);

            setMatch(matchRes.data);
            setAllPlayers(playersRes.data);
            setLineup(lineupRes.data);

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

    const handleDragStart = (e, player, origin, escalacaoId = null, initialX = null, initialY = null) => {
        // Save offset to mouse relative to element if needed, but centering is easier
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

        const { player, origin, escalacaoId } = draggedItem;

        // --- COORDINATE CALCULATION ---
        let newX = null;
        let newY = null;

        if (targetZone === 'titulares') {
            if (fieldRef.current) {
                const rect = fieldRef.current.getBoundingClientRect();
                // Calculate relative % position
                // e.clientX is mouse pos.
                const rawX = e.clientX - rect.left;
                const rawY = e.clientY - rect.top;

                // Constrain 0-100
                newX = Math.max(0, Math.min(100, (rawX / rect.width) * 100));
                newY = Math.max(0, Math.min(100, (rawY / rect.height) * 100));
            }
        }
        // ----------------------------

        // LIMIT CHECK (Only if adding new titular)
        const currentTitulares = hydratedLineup.filter(l => l.status === 'TITULAR').length;
        const currentReservas = hydratedLineup.filter(l => l.status === 'RESERVA').length;

        if (targetZone === 'titulares' && origin !== 'titulares' && currentTitulares >= 11) {
            Swal.fire({ icon: 'warning', title: 'Time Completo!', text: '11 titulares em campo.', background: '#1e293b', color: '#fff' });
            return;
        }
        if (targetZone === 'reservas' && origin !== 'reservas' && currentReservas >= 6) {
            Swal.fire({ icon: 'warning', title: 'Banco Cheio!', text: '6 reservas selecionados.', background: '#1e293b', color: '#fff' });
            return;
        }

        try {
            if (targetZone === 'nao-relacionados') {
                await api.delete(`/escalacoes/${escalacaoId}/`);
            } else {
                const status = targetZone === 'titulares' ? 'TITULAR' : 'RESERVA';

                // If we are dropping on grid (titulars), use calculated XY.
                // If dropping on reserves, XY should be null or ignored.
                const payload = { status };
                if (targetZone === 'titulares' && newX !== null) {
                    payload.x = newX;
                    payload.y = newY;
                }

                if (origin === 'nao-relacionados') {
                    await api.post('/escalacoes/', {
                        partida: partidaId,
                        clube: player.clube,
                        jogador: player.id,
                        ...payload
                    });
                } else {
                    await api.patch(`/escalacoes/${escalacaoId}/`, payload);
                }
            }

            await fetchData();

        } catch (error) {
            console.error("Erro ao mover:", error);
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha ao salvar.', background: '#1e293b', color: '#fff' });
            fetchData(); // Sync
        } finally {
            setDraggedItem(null);
        }
    };

    if (loading && allPlayers.length === 0) return <div className="p-10 text-center text-white">Carregando...</div>;
    if (!match) return <div className="p-10 text-center text-white">Partida não encontrada.</div>;

    const titulares = hydratedLineup.filter(l => l.status === 'TITULAR');
    const reservas = hydratedLineup.filter(l => l.status === 'RESERVA');
    const relatedIds = new Set(hydratedLineup.map(l => l.jogador.id));
    const naoRelacionados = allPlayers.filter(p => !relatedIds.has(p.id));

    return (
        <div className="min-h-screen bg-[#0f172a] p-4 text-slate-200">

            <header className="max-w-7xl mx-auto mb-6 flex justify-between items-center bg-[#1e293b] p-4 rounded-xl shadow-lg border border-slate-700">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Escalação</h1>
                    <p className="text-sm text-slate-400">
                        {match.mandante?.nome} vs {match.visitante?.nome}
                    </p>
                </div>
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition">
                    Voltar
                </button>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* --- NAO RELACIONADOS --- */}
                <div
                    className="bg-[#1e293b] rounded-xl p-4 border border-slate-700 flex flex-col h-[600px] shadow-xl"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'nao-relacionados')}
                >
                    <h2 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider flex justify-between">
                        Disponíveis <span className="text-white">{naoRelacionados.length}</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {naoRelacionados.map(player => (
                            <div
                                key={player.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, player, 'nao-relacionados')}
                                className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 cursor-grab hover:border-indigo-500/50 transition flex justify-between items-center"
                            >
                                <span className="font-bold text-sm text-slate-300">{player.nome}</span>
                                <span className="text-[10px] text-slate-500 uppercase">{player.posicao}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- CAMPO --- */}
                <div className="lg:col-span-2">
                    <div className="bg-[#1e293b] rounded-xl p-1 border border-slate-700 h-[600px] flex flex-col shadow-xl relative">

                        {/* Header Info Layer */}
                        <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-xs font-mono">
                            {titulares.length}/11
                        </div>
                        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur px-3 py-1 rounded text-emerald-400 font-bold text-xl border border-emerald-500/30">
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
                            {/* Field Markings */}
                            <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-white/20 transform -translate-y-1/2 pointer-events-none"></div>

                            {/* Zones Helper (Optional visual guide) */}
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
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, escalacao.jogador, 'titulares', escalacao.id)}
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
                    className="bg-[#1e293b] rounded-xl p-4 border border-slate-700 flex flex-col h-[600px] shadow-xl"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'reservas')}
                >
                    <h2 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider flex justify-between">
                        Reservas <span className="text-white">{reservas.length}/6</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {reservas.map(escalacao => (
                            <div
                                key={escalacao.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, escalacao.jogador, 'reservas', escalacao.id)}
                                className="bg-[#0f172a] p-3 rounded-lg border border-yellow-500/20 cursor-grab hover:border-yellow-500 transition flex items-center gap-3"
                            >
                                <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-[10px] font-bold">R</div>
                                <div>
                                    <p className="font-medium text-sm text-slate-300">{escalacao.jogador.nome}</p>
                                </div>
                            </div>
                        ))}
                        {reservas.length === 0 && <p className="text-center text-slate-600 text-xs mt-10">Arraste reservas pra cá</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}
