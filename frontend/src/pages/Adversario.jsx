import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Shield, Swords, Sparkles, Target } from "lucide-react";
import { api } from "../services/api";

function SelectField({ label, value, onChange, options, placeholder, disabled = false }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-pt-text-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="mt-2 w-full rounded-2xl border border-pt-white/10 bg-pt-bg/30 px-4 py-3.5 text-sm text-pt-text font-semibold outline-none transition focus:border-pt-primary focus:ring-4 focus:ring-pt-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="" className="bg-pt-surface">{placeholder}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id} className="bg-pt-surface">
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function normalizeCoordinates(player, index, side) {
  if (player.x !== undefined && player.y !== undefined && player.x !== null && player.y !== null) {
    return player;
  }

  let x = 50;
  let y = 50;

  if (side === "meu") {
    // Meu time (Lado Direito - Defesa na Direita, Ataca para Esquerda)
    if (index === 0) { x = 93; y = 50; } // GK
    else if (index <= 4) { x = 78; y = [15, 38, 62, 85][index - 1]; } // DEF
    else if (index <= 8) { x = 62; y = [15, 38, 62, 85][index - 5]; } // MID
    else { x = 52; y = [35, 65][index - 9]; } // ATT
  } else {
    // Adversário (Lado Esquerdo - Defesa na Esquerda, Ataca para Direita)
    if (index === 0) { x = 7; y = 50; } // GK
    else if (index <= 4) { x = 22; y = [15, 38, 62, 85][index - 1]; } // DEF
    else if (index <= 8) { x = 38; y = [15, 38, 62, 85][index - 5]; } // MID
    else { x = 48; y = [35, 65][index - 9]; } // ATT
  }

  return {
    ...player,
    x,
    y,
  };
}

function TacticBoard({ myLineup, oppLineup, myClubName, oppClubName, title }) {
  const { resolvedMine, resolvedOpp } = useMemo(() => {
    const initialMine = (myLineup || []).map((player, index) => normalizeCoordinates(player, index, "meu"));
    const initialOpp = (oppLineup || []).map((player, index) => normalizeCoordinates(player, index, "adv"));

    let allPlayers = [
      ...initialMine.map((p) => ({ ...p, isMine: true })),
      ...initialOpp.map((p) => ({ ...p, isMine: false })),
    ];

    const radius = 8; // Distância mínima (em %)
    const pushFactor = 0.3; // Força de repulsão
    
    for (let iter = 0; iter < 100; iter++) {
      for (let i = 0; i < allPlayers.length; i++) {
        for (let j = i + 1; j < allPlayers.length; j++) {
          let p1 = allPlayers[i];
          let p2 = allPlayers[j];
          
          let dx = (p1.x - p2.x) * 1.5; 
          let dy = p1.y - p2.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius) {
            if (dist === 0) {
              dx = (Math.random() - 0.5) * 2;
              dy = (Math.random() - 0.5) * 2;
              dist = Math.sqrt(dx * dx + dy * dy);
            }
            let angle = Math.atan2(dy, dx);
            let push = (radius - dist) * pushFactor;
            
            p1.x += (Math.cos(angle) * push) / 1.5;
            p1.y += Math.sin(angle) * push;
            p2.x -= (Math.cos(angle) * push) / 1.5;
            p2.y -= Math.sin(angle) * push;
          }
        }
      }
      allPlayers.forEach(p => {
        p.x = Math.max(3, Math.min(97, p.x));
        p.y = Math.max(5, Math.min(95, p.y));
      });
    }

    return {
      resolvedMine: allPlayers.filter(p => p.isMine),
      resolvedOpp: allPlayers.filter(p => !p.isMine)
    };
  }, [myLineup, oppLineup]);

  return (
    <section className="rounded-3xl border border-pt-white/10 bg-pt-surface p-6 shadow-2xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-tight text-white uppercase">{title}</h3>
          <p className="text-[10px] font-bold text-pt-text-muted uppercase tracking-widest mt-1">Simulação de Posicionamento por Setor</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pt-primary/10 border border-pt-primary/20">
            <span className="h-2 w-2 rounded-full bg-pt-primary shadow-[0_0_8px_rgba(162,255,1,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-pt-primary">{myClubName || "Meu time"}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-pt-white/10">
            <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">{oppClubName || "Adversário"}</span>
          </div>
        </div>
      </div>

      <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-pt-white/5 bg-[#0a1f0f] shadow-inner"
        style={{
          backgroundImage: `
            linear-gradient(rgba(162,255,1,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(162,255,1,0.03) 1px, transparent 1px),
            radial-gradient(circle at center, #133a1d 0%, #0a1f0f 100%)
          `,
          backgroundSize: '40px 40px, 40px 40px, 100% 100%'
        }}
      >
        {/* Linhas do campo */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/10" />
        
        {/* Grandes Áreas */}
        <div className="pointer-events-none absolute left-0 top-1/2 h-[60%] w-[18%] -translate-y-1/2 border-b-2 border-r-2 border-t-2 border-white/10 rounded-r-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/2 h-[60%] w-[18%] -translate-y-1/2 border-b-2 border-l-2 border-t-2 border-white/10 rounded-l-3xl" />

        {resolvedMine.map((item) => (
          <div
            key={`my-${item.jogador_id}`}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <div className="flex flex-col items-center gap-1.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-pt-primary/40 blur-lg rounded-full animate-pulse group-hover:bg-pt-primary/60" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-pt-bg bg-pt-primary text-[11px] font-black text-pt-bg shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-12">
                  {item.posicao === "Goleiro" ? "GK" : item.nome.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="rounded-full bg-pt-bg/90 backdrop-blur-md px-3 py-1 text-[9px] font-black text-white shadow-xl whitespace-nowrap border border-pt-white/10 uppercase tracking-tighter">
                {item.nome}
              </span>
            </div>
          </div>
        ))}

        {resolvedOpp.map((item) => (
          <div
            key={`opp-${item.jogador_id}`}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <div className="flex flex-col items-center gap-1.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-md rounded-full" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-pt-bg bg-white text-[11px] font-black text-pt-bg shadow-xl transition-transform group-hover:scale-110">
                  {item.posicao === "Goleiro" ? "GK" : item.nome.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="rounded-full bg-pt-bg/90 backdrop-blur-md px-3 py-1 text-[9px] font-black text-pt-text-muted shadow-xl whitespace-nowrap border border-pt-white/5 uppercase tracking-tighter">
                {item.nome}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Adversario() {
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState("");
  const [metadata, setMetadata] = useState({
    meu_clube: null,
    meus_jogos: [],
    adversarios: [],
    jogos_adversario: [],
  });
  const [comparison, setComparison] = useState(null);
  const [tab, setTab] = useState("ataque_vs_defesa");
  const [filters, setFilters] = useState({
    meu_jogo_id: "",
    adversario_id: "",
    jogo_adversario_id: "",
  });

  async function loadMetadata(adversarioId = "") {
    setLoadingMetadata(true);
    setError("");

    try {
      const params = {};
      if (adversarioId) params.adversario_id = adversarioId;

      const response = await api.get("/previsoes/metadata/", { params });
      setMetadata(response.data || { meu_clube: null, meus_jogos: [], adversarios: [], jogos_adversario: [] });
    } catch (requestError) {
      const status = requestError?.response?.status;
      if (status === 404) {
        try {
          const params = {};
          if (adversarioId) params.adversario_id = adversarioId;
          const legacyResponse = await api.get("/previsoes/", { params });
          setMetadata({
            meu_clube: legacyResponse.data?.meu_clube || null,
            meus_jogos: legacyResponse.data?.meus_jogos || [],
            adversarios: legacyResponse.data?.adversarios || [],
            jogos_adversario: legacyResponse.data?.jogos_adversario || [],
          });
          setComparison(legacyResponse.data?.comparativo || null);
          return;
        } catch (legacyError) {
          const detail = legacyError?.response?.data?.detail || "Falha ao carregar previsões.";
          setError(detail);
        }
      } else {
        const detail = requestError?.response?.data?.detail || "Falha ao carregar previsões.";
        setError(detail);
      }
    } finally {
      setLoadingMetadata(false);
    }
  }

  async function loadComparison(nextFilters) {
    if (!nextFilters.meu_jogo_id || !nextFilters.adversario_id || !nextFilters.jogo_adversario_id) {
      setComparison(null);
      return;
    }

    setLoadingComparison(true);
    setError("");

    try {
      const response = await api.get("/previsoes/comparativo/", {
        params: {
          meu_jogo_id: nextFilters.meu_jogo_id,
          adversario_id: nextFilters.adversario_id,
          jogo_adversario_id: nextFilters.jogo_adversario_id,
        },
      });
      setComparison(response.data?.comparativo || null);
    } catch (requestError) {
      const status = requestError?.response?.status;
      if (status === 404) {
        try {
          const legacyResponse = await api.get("/previsoes/", {
            params: {
              meu_jogo_id: nextFilters.meu_jogo_id,
              adversario_id: nextFilters.adversario_id,
              jogo_adversario_id: nextFilters.jogo_adversario_id,
            },
          });
          setComparison(legacyResponse.data?.comparativo || null);
          return;
        } catch (legacyError) {
          const detail = legacyError?.response?.data?.detail || "Falha ao carregar comparativo.";
          setError(detail);
          setComparison(null);
        }
      } else {
        const detail = requestError?.response?.data?.detail || "Falha ao carregar comparativo.";
        setError(detail);
        setComparison(null);
      }
    } finally {
      setLoadingComparison(false);
    }
  }

  useEffect(() => {
    loadMetadata();
  }, []);

  const myMatchOptions = useMemo(() => (
    (metadata?.meus_jogos || []).map((item) => ({
      id: item.id,
      label: `${new Date(item.data_hora).toLocaleDateString("pt-BR")} - ${item.local} vs ${item.adversario_nome}${item.futuro ? " (Futuro)" : " (Passado)"}`,
    }))
  ), [metadata]);

  const oppOptions = useMemo(() => (
    (metadata?.adversarios || []).map((item) => ({ id: item.id, label: item.nome }))
  ), [metadata]);

  const oppMatchOptions = useMemo(() => (
    (metadata?.jogos_adversario || []).map((item) => ({
      id: item.id,
      label: `${new Date(item.data_hora).toLocaleDateString("pt-BR")} - ${item.local} vs ${item.adversario_nome}`,
    }))
  ), [metadata]);

  const selectedOpp = useMemo(() => (
    (metadata?.adversarios || []).find((club) => club.id === filters.adversario_id)
  ), [metadata, filters.adversario_id]);

  const handleChangeFilter = async (field, value) => {
    const next = { ...filters, [field]: value };

    if (field === "adversario_id") {
      next.jogo_adversario_id = "";
      setComparison(null);
      setFilters(next);
      await loadMetadata(value);
      return;
    }

    setFilters(next);
    await loadComparison(next);
  };

  const current = comparison?.[tab];
  const myTypeLabel = current?.meu_time?.tipo_efetivo || "-";
  const oppTypeLabel = current?.adversario?.tipo_efetivo || "-";
  const loading = loadingMetadata || loadingComparison;

  return (
    <div className="mx-auto max-w-[1400px] pb-12">
      <header className="relative overflow-hidden rounded-[40px] border border-pt-white/10 bg-pt-surface p-10 shadow-2xl mb-8">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-pt-primary/5 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5 blur-[100px]" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-pt-primary/10 border border-pt-primary/20 text-pt-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
             <Target className="w-3 h-3" />
             Inteligência Tática
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4 uppercase">
            Previsões <span className="text-pt-primary">Táticas</span>
          </h1>
          <p className="max-w-2xl text-sm text-pt-text-muted font-medium leading-relaxed">
            Analise a sobreposição estrutural entre sua equipe e o adversário. Descubra vantagens geográficas no campo através do comparativo de posicionamento médio.
          </p>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-6 rounded-3xl border border-pt-white/5 bg-pt-surface p-8 md:grid-cols-3">
        <SelectField
          label="Partida de Referência (Meu Time)"
          value={filters.meu_jogo_id}
          onChange={(value) => handleChangeFilter("meu_jogo_id", value)}
          options={myMatchOptions}
          placeholder="Selecione sua base tática"
        />
        <SelectField
          label="Equipe Adversária"
          value={filters.adversario_id}
          onChange={(value) => handleChangeFilter("adversario_id", value)}
          options={oppOptions}
          placeholder="Escolha quem enfrentar"
        />
        <SelectField
          label="Cenário Histórico do Oponente"
          value={filters.jogo_adversario_id}
          onChange={(value) => handleChangeFilter("jogo_adversario_id", value)}
          options={oppMatchOptions}
          placeholder={filters.adversario_id ? "Selecione o jogo base" : "Defina o adversário primeiro"}
          disabled={!filters.adversario_id}
        />
      </section>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100 font-bold uppercase tracking-tight">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          {error}
        </div>
      )}

      <section className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => setTab("ataque_vs_defesa")}
          className={`group flex items-center gap-3 rounded-2xl border px-6 py-4 text-xs font-black uppercase tracking-widest transition-all ${
            tab === "ataque_vs_defesa" 
              ? "border-pt-primary bg-pt-primary text-pt-bg" 
              : "border-pt-white/10 bg-pt-surface text-pt-text-muted hover:border-pt-primary/50 hover:text-pt-primary"
          }`}
        >
          <Swords className={`h-4 w-4 transition-transform group-hover:scale-110`} />
          Meu Ataque vs Defesa Deles
        </button>
        <button
          type="button"
          onClick={() => setTab("defesa_vs_ataque")}
          className={`group flex items-center gap-3 rounded-2xl border px-6 py-4 text-xs font-black uppercase tracking-widest transition-all ${
            tab === "defesa_vs_ataque" 
              ? "border-pt-primary bg-pt-primary text-pt-bg" 
              : "border-pt-white/10 bg-pt-surface text-pt-text-muted hover:border-pt-primary/50 hover:text-pt-primary"
          }`}
        >
          <Shield className={`h-4 w-4 transition-transform group-hover:scale-110`} />
          Minha Defesa vs Ataque Deles
        </button>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-pt-white/10 bg-pt-surface p-6 group hover:border-pt-primary/30 transition-colors">
          <p className="text-[10px] font-black uppercase tracking-widest text-pt-text-muted mb-2">Base Mandante</p>
          <p className="text-xl font-black text-white">{metadata?.meu_clube?.nome || "-"}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-bold text-pt-text-muted uppercase tracking-wider">Estratégia:</span>
            <span className="text-[10px] font-black text-pt-primary uppercase px-2 py-0.5 rounded-md bg-pt-primary/10 border border-pt-primary/20">
              {myTypeLabel}
            </span>
          </div>
        </div>
        
        <div className="rounded-2xl border border-pt-white/10 bg-pt-surface p-6 group hover:border-white/20 transition-colors">
          <p className="text-[10px] font-black uppercase tracking-widest text-pt-text-muted mb-2">Referência Oponente</p>
          <p className="text-xl font-black text-white">{selectedOpp?.nome || "-"}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-bold text-pt-text-muted uppercase tracking-wider">Comportamento:</span>
            <span className="text-[10px] font-black text-white uppercase px-2 py-0.5 rounded-md bg-white/10 border border-white/20">
              {oppTypeLabel}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-pt-white/20 bg-pt-bg/50 p-6 flex flex-col justify-center">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-pt-primary mb-2">
            <Sparkles className="h-3 w-3" /> Smart Insights
          </p>
          <p className="text-[11px] text-pt-text-muted font-bold leading-relaxed italic">
            "A estrutura defensiva do adversário apresenta uma zona de escape no setor 3. Recomendamos exploração lateral."
          </p>
        </div>
      </section>

      {loading ? (
        <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-3xl border border-pt-white/5 bg-pt-surface/50 p-20">
           <div className="w-12 h-12 border-4 border-pt-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-xs font-black uppercase tracking-widest text-pt-text-muted animate-pulse">Cruzando Dados Táticos...</p>
        </div>
      ) : !comparison ? (
        <div className="mt-10 rounded-3xl border border-pt-primary/20 bg-pt-primary/5 p-10 text-center">
          <p className="text-sm font-black text-pt-primary uppercase tracking-widest">Aguardando Configuração de Cenário</p>
          <p className="mt-2 text-xs text-pt-text-muted font-medium">Defina as partidas acima para gerar a simulação tática avançada.</p>
        </div>
      ) : (
        <div className="mt-8">
          <TacticBoard
            title={tab === "ataque_vs_defesa" ? "Análise: Ofensiva Direcionada" : "Análise: Barreira de Contenção"}
            myLineup={current?.meu_time?.jogadores || []}
            oppLineup={current?.adversario?.jogadores || []}
            myClubName={metadata?.meu_clube?.nome}
            oppClubName={selectedOpp?.nome}
          />
        </div>
      )}
    </div>
  );
}