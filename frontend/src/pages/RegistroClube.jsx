import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import { api } from "../services/api";
import Swal from 'sweetalert2';

export default function RegistroClube() {
  const [escudoPreview, setEscudoPreview] = useState(null);
  const [escudoFile, setEscudoFile] = useState(null);
  const [nomeClube, setNomeClube] = useState("");
  const [pais, setPais] = useState("");
  const [anoFundacao, setAnoFundacao] = useState("");
  const [competicaoSelecionada, setCompeticaoSelecionada] = useState("");
  const [competicoes, setCompeticoes] = useState([]);
  const [competicoesDisponiveis, setCompeticoesDisponiveis] = useState([]);
  const [showCompeticaoModal, setShowCompeticaoModal] = useState(false);

  // Buscar competições do banco ao carregar
  useEffect(() => {
    async function loadCompeticoes() {
      try {
        const response = await api.get("/competicoes/");
        const lista = response.data?.results || response.data || [];
        setCompeticoesDisponiveis(lista);
      } catch (error) {
        console.error("Erro ao carregar competições:", error);
      }
    }
    loadCompeticoes();
  }, []);

  function handlePickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEscudoFile(file);
    const url = URL.createObjectURL(file);
    setEscudoPreview(url);
  }

  function addCompeticao() {
    if (!competicaoSelecionada) return;
    const competicaoObj = competicoesDisponiveis.find(c => c.id === parseInt(competicaoSelecionada));
    if (!competicaoObj) return;
    if (competicoes.find(c => c.id === competicaoObj.id)) return;
    setCompeticoes((prev) => [...prev, competicaoObj]);
    setCompeticaoSelecionada("");
    setShowCompeticaoModal(false);
  }

  function removeCompeticao(id) {
    setCompeticoes((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleRegistrar() {
    // Validações
    if (!nomeClube.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo obrigatório',
        text: 'O nome do clube é obrigatório.',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    if (!pais) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo obrigatório',
        text: 'Selecione o país do clube.',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    if (!anoFundacao || anoFundacao < 1800 || anoFundacao > new Date().getFullYear()) {
      Swal.fire({
        icon: 'warning',
        title: 'Ano inválido',
        text: 'Informe um ano de fundação válido.',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    if (!escudoFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo obrigatório',
        text: 'Selecione um escudo para o clube.',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    try {
        const formData = new FormData();
        formData.append("nome", nomeClube);
        formData.append("pais", pais);
        formData.append("ano_fundacao", anoFundacao);
        if (escudoFile) {
            formData.append("escudo", escudoFile);
        }

        await api.post("/clubes/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        // ALERTA DE SUCESSO
        Swal.fire({
            title: 'Clube Criado!',
            text: 'As informações do clube foram salvas.',
            icon: 'success',
            background: '#0f172a',
            color: '#e2e8f0',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Ótimo'
        });

        // Reset form
        setNomeClube("");
        setPais("");
        setAnoFundacao("");
        setCompeticoes([]);
        setEscudoPreview(null);
        setEscudoFile(null);

    } catch (error) {
        console.error("Erro ao registrar clube:", error);
        
        const errorMsg = error.response?.data?.nome?.[0] || 
                        error.response?.data?.detail ||
                        'Não foi possível registrar o clube. Verifique os dados.';
        
        // ALERTA DE ERRO
        Swal.fire({
            icon: 'error',
            title: 'Ops!',
            text: errorMsg,
            background: '#0f172a',
            color: '#e2e8f0',
            confirmButtonColor: '#ef4444',
        });
    }
  }

  return (
    <div className="max-w-5xl">
       {/* ... JSX INALTERADO ... */}
       {/* Header padrão */}
      <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">
        Registrar Clube
      </h1>
      <p className="text-sm text-slate-400 mt-2">
        Cadastre um clube no sistema. Todos os campos são obrigatórios. <span className="text-red-400">*</span>
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Coluna esquerda - Escudo */}
        <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-5 h-full">
            <label className="block text-sm text-slate-300 font-medium mb-3 text-center">
              Escudo do Clube
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="h-full flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-full border-2 border-slate-700 overflow-hidden bg-[#0f172a] flex items-center justify-center">
                {escudoPreview ? (
                    <img
                    src={escudoPreview}
                    alt="Escudo (prévia)"
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImagePlus className="w-7 h-7" />
                    <span className="text-sm font-semibold tracking-wide">ESCUDO</span>
                    </div>
                )}
                </div>

                <label className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-slate-200 hover:bg-slate-800/40 transition cursor-pointer">
                Escolher da Galeria
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePickImage}
                />
                </label>
            </div>
        </div>

        {/* Coluna direita - Form */}
        <div className="h-full flex flex-col gap-6">
          <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-5 space-y-4 flex-1">
            <Field
              label="Nome do Clube"
              placeholder="Digite o nome do clube"
              value={nomeClube}
              onChange={setNomeClube}
              required
            />

            <SelectField
              label="País"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              required
            >
              <option value="">Selecione o país</option>
              <option value="Brasil">Brasil</option>
              <option value="Argentina">Argentina</option>
              <option value="Uruguai">Uruguai</option>
              <option value="Chile">Chile</option>
              <option value="Colômbia">Colômbia</option>
              <option value="Peru">Peru</option>
              <option value="Equador">Equador</option>
              <option value="Paraguai">Paraguai</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Bolívia">Bolívia</option>
              <option value="Portugal">Portugal</option>
              <option value="Espanha">Espanha</option>
              <option value="Inglaterra">Inglaterra</option>
              <option value="França">França</option>
              <option value="Itália">Itália</option>
              <option value="Alemanha">Alemanha</option>
              <option value="Holanda">Holanda</option>
              <option value="Bélgica">Bélgica</option>
              <option value="México">México</option>
              <option value="Estados Unidos">Estados Unidos</option>
              <option value="Japão">Japão</option>
              <option value="Coreia do Sul">Coreia do Sul</option>
              <option value="Outro">Outro</option>
            </SelectField>

            <Field
              label="Ano de Fundação"
              placeholder="Ex.: 1998"
              value={anoFundacao}
              onChange={setAnoFundacao}
              type="number"
              required
            />

            <div>
              <label className="block text-sm text-slate-300 font-medium mb-2">
                Competições <span className="text-slate-500 text-xs">(opcional - pode adicionar múltiplas)</span>
              </label>

              <div className="flex gap-3">
                <div
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 flex items-center justify-between"
                    aria-label="Competições (somente leitura)"
                >
                    <span className="text-slate-400">
                    {competicoes.length > 0
                        ? `${competicoes.length} competição(s) adicionada(s)`
                        : "Clique em + para adicionar competições"}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => setShowCompeticaoModal(true)}
                    className="shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/25 transition flex items-center justify-center"
                    title="Adicionar competição"
                >
                    <Plus className="w-5 h-5" />
                </button>
                </div>

              {competicoes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {competicoes.map((c) => (
                    <span
                        key={c.id}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm"
                    >
                        {c.nome}
                        <button
                        type="button"
                        onClick={() => removeCompeticao(c.id)}
                        className="text-emerald-200/80 hover:text-emerald-100"
                        title="Remover"
                        >
                        <X className="w-4 h-4" />
                        </button>
                    </span>
                    ))}
                </div>
                )}
            </div>

            {/* Modal de Adicionar Competição */}
            {showCompeticaoModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowCompeticaoModal(false)}>
                <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-xl font-semibold text-white mb-4">Adicionar Competição</h3>
                  
                  <select
                    value={competicaoSelecionada}
                    onChange={(e) => setCompeticaoSelecionada(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition mb-4"
                  >
                    <option value="">Selecione uma competição</option>
                    {competicoesDisponiveis
                      .filter(c => !competicoes.find(comp => comp.id === c.id))
                      .map((comp) => (
                        <option key={comp.id} value={comp.id}>{comp.nome}</option>
                      ))
                    }
                  </select>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCompeticaoModal(false)}
                      className="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={addCompeticao}
                      className="flex-1 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRegistrar}
              className="px-8 py-3 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
            >
              Registrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = "text", value, onChange, disabled = false, required = false }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 font-medium mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function SelectField({ label, children, value, onChange, required = false }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 font-medium mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition"
      >
        {children}
      </select>
    </div>
  );
}