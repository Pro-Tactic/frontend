import { useMemo, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import { api } from "../services/api";
import Swal from 'sweetalert2';

export default function RegistroClube() {
  const competicoesDisponiveis = useMemo(
    () => ["Copa Local", "Campeonato Estadual", "Liga Regional", "Torneio Amistoso"],
    []
  );

  const [escudoPreview, setEscudoPreview] = useState(null);
  const [escudoFile, setEscudoFile] = useState(null);
  const [nomeClube, setNomeClube] = useState("");
  const [pais, setPais] = useState("");
  const [anoFundacao, setAnoFundacao] = useState("");
  const [competicaoSelecionada, setCompeticaoSelecionada] = useState("");
  const [competicoes, setCompeticoes] = useState([]);

  function handlePickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEscudoFile(file);
    const url = URL.createObjectURL(file);
    setEscudoPreview(url);
  }

  function addCompeticao() {
    if (!competicaoSelecionada) return;
    if (competicoes.includes(competicaoSelecionada)) return;
    setCompeticoes((prev) => [...prev, competicaoSelecionada]);
    setCompeticaoSelecionada("");
  }

  function removeCompeticao(nome) {
    setCompeticoes((prev) => prev.filter((c) => c !== nome));
  }

  async function handleRegistrar() {
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
        
        // ALERTA DE ERRO
        Swal.fire({
            icon: 'error',
            title: 'Ops!',
            text: 'Não foi possível registrar o clube. Verifique os dados.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            background: '#0f172a',
            color: '#e2e8f0'
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
        Cadastre um clube e vincule competições. (Sem salvar no banco por enquanto)
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Coluna esquerda - Escudo */}
        <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-5 h-full">
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
            />

            <Field
              label="País"
              placeholder="Ex.: Brasil"
              value={pais}
              onChange={setPais}
            />

            <Field
              label="Ano de Fundação"
              placeholder="Ex.: 1998"
              value={anoFundacao}
              onChange={setAnoFundacao}
              type="number"
            />

            <div>
              <label className="block text-sm text-slate-300 font-medium mb-2">
                Competições
              </label>

              <div className="flex gap-3">
                <div
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 flex items-center justify-between"
                    aria-label="Competições (somente leitura)"
                >
                    <span className="text-slate-400">
                    {competicoes.length > 0
                        ? "Competições adicionadas abaixo"
                        : "Clique em + para ver/adicionar competições"}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => {}}
                    className="shrink-0 w-12 h-12 rounded-xl bg-[#0f172a] border border-slate-800 text-slate-200 hover:bg-slate-800/40 transition flex items-center justify-center"
                    title="Em breve: adicionar competição"
                >
                    <Plus className="w-5 h-5" />
                </button>
                </div>

              {competicoes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {competicoes.map((c) => (
                    <span
                        key={c}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm"
                    >
                        {c}
                        <button
                        type="button"
                        onClick={() => removeCompeticao(c)}
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

function Field({ label, placeholder, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 font-medium mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition"
      />
    </div>
  );
}