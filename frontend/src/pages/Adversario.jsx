import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Shield, Swords, Sparkles } from "lucide-react";
import { api } from "../services/api";

function SelectField({ label, value, onChange, options, placeholder, disabled = false }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
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
  const mine = (myLineup || []).map((player, index) => normalizeCoordinates(player, index, "meu"));
  const opp = (oppLineup || []).map((player, index) => normalizeCoordinates(player, index, "adv"));

  return (
    <section className="rounded-2xl border border-slate-700 bg-[#111827] p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400">Sobreposição por posicionamento tático (Horizontal)</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-blue-300 ring-1 ring-blue-500/25">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            {myClubName || "Meu time"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-red-300 ring-1 ring-red-500/30">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            {oppClubName || "Adversário"}
          </span>
        </div>
      </div>

      <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-slate-700/70 bg-[#1a472a] shadow-inner"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.02) 50px), repeating-linear-gradient(0deg, transparent, transparent 48px, rgba(255,255,255,0.02) 50px)'
        }}
      >
        {/* Linhas do campo Horizontal */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/20" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/20" />
        
        {/* Grandes Áreas (Designadas nos extremos Esquerdo e Direito) */}
        {/* Esquerda (Adversário) */}
        <div className="pointer-events-none absolute left-0 top-1/2 h-[50%] w-[15%] -translate-y-1/2 border-b border-r border-t border-white/25 rounded-r-xl" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-[22%] w-[6%] -translate-y-1/2 border-b border-r border-t border-white/30 rounded-r-lg" />
        
        {/* Direita (Meu Time) */}
        <div className="pointer-events-none absolute right-0 top-1/2 h-[50%] w-[15%] -translate-y-1/2 border-b border-l border-t border-white/25 rounded-l-xl" />
        <div className="pointer-events-none absolute right-0 top-1/2 h-[22%] w-[6%] -translate-y-1/2 border-b border-l border-t border-white/30 rounded-l-lg" />

        {mine.map((item) => (
          <div
            key={`my-${item.jogador_id}`}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <div className="flex flex-col items-center gap-1 group">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-600 text-[11px] font-bold text-white shadow-lg shadow-blue-900/40 transition-transform group-hover:scale-110">
                {item.posicao === "Goleiro" ? "GK" : item.nome.slice(0, 2).toUpperCase()}
              </span>
              <span className="rounded bg-black/70 backdrop-blur px-2 py-0.5 text-[9px] font-medium text-white shadow-sm">{item.nome}</span>
            </div>
          </div>
        ))}

        {opp.map((item) => (
          <div
            key={`opp-${item.jogador_id}`}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <div className="flex flex-col items-center gap-1 group">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-200 bg-red-600 text-[11px] font-bold text-white shadow-lg shadow-red-900/40 transition-transform group-hover:scale-110">
                {item.posicao === "Goleiro" ? "GK" : item.nome.slice(0, 2).toUpperCase()}
              </span>
              <span className="rounded bg-black/70 backdrop-blur px-2 py-0.5 text-[9px] font-medium text-white shadow-sm">{item.nome}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Adversario() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [tab, setTab] = useState("ataque_vs_defesa");
  const [filters, setFilters] = useState({
    meu_jogo_id: "",
    adversario_id: "",
    jogo_adversario_id: "",
  });

  const loadData = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (nextFilters.meu_jogo_id) params.meu_jogo_id = nextFilters.meu_jogo_id;
      if (nextFilters.adversario_id) params.adversario_id = nextFilters.adversario_id;
      if (nextFilters.jogo_adversario_id) params.jogo_adversario_id = nextFilters.jogo_adversario_id;

      const response = await api.get("/previsoes/", { params });
      setPayload(response.data);
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail || "Falha ao carregar previsões.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const myMatchOptions = useMemo(() => (
    (payload?.meus_jogos || []).map((item) => ({
      id: item.id,
      label: `${new Date(item.data_hora).toLocaleDateString("pt-BR")} - ${item.local} vs ${item.adversario_nome}${item.futuro ? " (Futuro)" : " (Passado)"}`,
    }))
  ), [payload]);

  const oppOptions = useMemo(() => (
    (payload?.adversarios || []).map((item) => ({ id: item.id, label: item.nome }))
  ), [payload]);

  const oppMatchOptions = useMemo(() => (
    (payload?.jogos_adversario || []).map((item) => ({
      id: item.id,
      label: `${new Date(item.data_hora).toLocaleDateString("pt-BR")} - ${item.local} vs ${item.adversario_nome}`,
    }))
  ), [payload]);

  const selectedOpp = useMemo(() => (
    (payload?.adversarios || []).find((club) => club.id === filters.adversario_id)
  ), [payload, filters.adversario_id]);

  const handleChangeFilter = async (field, value) => {
    const next = { ...filters, [field]: value };

    if (field === "adversario_id") {
      next.jogo_adversario_id = "";
    }

    setFilters(next);
    await loadData(next);
  };

  const comparison = payload?.comparativo;
  const current = comparison?.[tab];
  const myTypeLabel = current?.meu_time?.tipo_efetivo || "-";
  const oppTypeLabel = current?.adversario?.tipo_efetivo || "-";

  return (
    <div className="mx-auto max-w-[1280px] pb-12">
      <header className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(239,68,68,0.2),transparent_45%),linear-gradient(140deg,#0b1220,#0f172a)] p-6 shadow-2xl">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="absolute -bottom-14 left-16 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl font-semibold tracking-wide text-white md:text-4xl">Previsões Táticas</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Compare sua estrutura ofensiva e defensiva contra o histórico do adversário, no estilo de leitura de posicionamento por setor.
          </p>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-slate-700 bg-[#111827] p-4 md:grid-cols-3">
        <SelectField
          label="Seu jogo (passado ou futuro)"
          value={filters.meu_jogo_id}
          onChange={(value) => handleChangeFilter("meu_jogo_id", value)}
          options={myMatchOptions}
          placeholder="Selecione a partida do seu time"
        />
        <SelectField
          label="Adversário"
          value={filters.adversario_id}
          onChange={(value) => handleChangeFilter("adversario_id", value)}
          options={oppOptions}
          placeholder="Escolha o adversário"
        />
        <SelectField
          label="Jogo histórico do adversário"
          value={filters.jogo_adversario_id}
          onChange={(value) => handleChangeFilter("jogo_adversario_id", value)}
          options={oppMatchOptions}
          placeholder={filters.adversario_id ? "Selecione um jogo antigo" : "Escolha o adversário primeiro"}
          disabled={!filters.adversario_id}
        />
      </section>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <section className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setTab("ataque_vs_defesa")}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${tab === "ataque_vs_defesa" ? "border-blue-500 bg-blue-500/20 text-blue-200" : "border-slate-700 bg-[#0b1220] text-slate-300 hover:border-slate-500"}`}
        >
          <Swords className="h-4 w-4" />
          Meu ataque x defesa deles
        </button>
        <button
          type="button"
          onClick={() => setTab("defesa_vs_ataque")}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${tab === "defesa_vs_ataque" ? "border-sky-500 bg-sky-500/20 text-sky-200" : "border-slate-700 bg-[#0b1220] text-slate-300 hover:border-slate-500"}`}
        >
          <Shield className="h-4 w-4" />
          Minha defesa x ataque deles
        </button>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-[#0b1220] p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Meu clube</p>
          <p className="mt-1 text-lg font-semibold text-white">{payload?.meu_clube?.nome || "-"}</p>
          <p className="mt-2 text-xs text-slate-400">Tipo utilizado: <span className="font-semibold text-blue-400">{myTypeLabel}</span></p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-[#0b1220] p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Adversário</p>
          <p className="mt-1 text-lg font-semibold text-white">{selectedOpp?.nome || "-"}</p>
          <p className="mt-2 text-xs text-slate-400">Tipo utilizado: <span className="font-semibold text-red-300">{oppTypeLabel}</span></p>
        </div>
        <div className="rounded-xl border border-dashed border-slate-600 bg-[#0b1220] p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400"><Sparkles className="h-4 w-4" /> Insights</p>
          <p className="mt-2 text-sm text-slate-300">Bloco reservado para recomendações automáticas. A estrutura já está pronta para entrar na próxima etapa.</p>
        </div>
      </section>

      {loading ? (
        <div className="mt-8 rounded-xl border border-slate-700 bg-[#0b1220] p-8 text-center text-slate-400">Carregando previsões...</div>
      ) : !comparison ? (
        <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
          Selecione seu jogo, o adversário e um jogo antigo do adversário para visualizar o comparativo de posicionamento.
        </div>
      ) : (
        <div className="mt-6">
          <TacticBoard
            title={tab === "ataque_vs_defesa" ? "Meu ataque vs defesa adversária" : "Minha defesa vs ataque adversário"}
            myLineup={current?.meu_time?.jogadores || []}
            oppLineup={current?.adversario?.jogadores || []}
            myClubName={payload?.meu_clube?.nome}
            oppClubName={selectedOpp?.nome}
          />
        </div>
      )}
    </div>
  );
}