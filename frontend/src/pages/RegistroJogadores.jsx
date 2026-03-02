import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ImagePlus } from "lucide-react";
import { api } from "../services/api";
import Swal from 'sweetalert2';
import { COUNTRIES } from "../data/countries";

export default function RegistroJogadores() {
  const navigate = useNavigate();
  const posicoes = useMemo(
    () => [
      "Goleiro", "Zagueiro", "Lateral Esquerdo", "Lateral Direito",
      "Volante", "Meio-campista", "Meia Atacante",
      "Ponta Esquerda", "Ponta Direita", "Centroavante",
    ],
    []
  );

  const pernas = useMemo(() => ["Destro", "Canhoto", "Ambidestro"], []);

  const [clubes, setClubes] = useState([]);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);

  const [formData, setFormData] = useState({
    nome: "", cpf: "", data_nascimento: "", peso: "", altura: "",
    nacionalidade: [], clube: "", posicao: [], perna: "",
  });

  useEffect(() => {
    async function fetchClubes() {
      try {
        const response = await api.get("/clubes/");
        setClubes(response.data);
      } catch (error) {
        console.error("Erro ao buscar clubes:", error);
      }
    }
    fetchClubes();
  }, []);

  function handlePickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFotoPreview(url);
    setFotoFile(file);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleRegistrar() {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'posicao') {
          const val = formData.posicao;
          if (Array.isArray(val)) data.append(key, val.join(', '));
          else data.append(key, val);
        } else if (key === 'nacionalidade') {
          const val = formData.nacionalidade;
          if (Array.isArray(val)) data.append(key, val.join(', '));
          else data.append(key, val);
        } else {
          data.append(key, formData[key]);
        }
      });
      if (fotoFile) data.append("foto", fotoFile);

      await api.post("/jogadores/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: 'Registrado!',
        text: 'O jogador foi cadastrado com sucesso.',
        icon: 'success',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Continuar'
      });

      setFormData({
        nome: "", cpf: "", data_nascimento: "", peso: "", altura: "",
        nacionalidade: [], clube: "", posicao: [], perna: "",
      });
      setFotoPreview(null);
      setFotoFile(null);

    } catch (error) {
      console.error("Erro ao registrar jogador:", error);
      
      Swal.fire({
        icon: 'error',
        title: 'Erro ao registrar',
        text: 'Verifique se todos os campos estão preenchidos corretamente.',
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
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          type="button"
          className="p-2 rounded-xl bg-[#0f172a] border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/40 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">
            Registrar Jogadores
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Preencha os dados do atleta.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-5">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full border-2 border-slate-700 overflow-hidden bg-[#0f172a] flex items-center justify-center">
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Prévia"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ImagePlus className="w-7 h-7" />
                  <span className="text-sm font-semibold tracking-wide">
                    FOTO
                  </span>
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

          <div className="mt-6 space-y-4">
            <Field
              label="Data de nascimento"
              type="date"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleInputChange}
            />
            <Field
              label="Peso"
              placeholder="Ex.: 72 (kg)"
              type="number"
              step="0.1"
              name="peso"
              value={formData.peso}
              onChange={handleInputChange}
            />
            <Field
              label="Altura (cm)"
              placeholder="Ex.: 178"
              type="number"
              step="1"
              name="altura"
              value={formData.altura}
              onChange={handleInputChange}
            />
            <CountryMultiSelect
              label="Nacionalidade"
              value={formData.nacionalidade}
              onChange={(vals) => setFormData((p) => ({ ...p, nacionalidade: vals }))}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-5 space-y-4">
            <Field
              label="Nome do Jogador"
              placeholder="Digite nome e sobrenome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
            />
            <Field
              label="CPF"
              placeholder="000.000.000-00"
              name="cpf"
              value={formData.cpf}
              onChange={handleInputChange}
            />

            <SelectField
              label="Clube"
              name="clube"
              value={formData.clube}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Selecione o clube
              </option>
              {clubes.length > 0 ? (
                clubes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Não há clubes registrados
                </option>
              )}
            </SelectField>
          </div>

          <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-5">
            <div className="text-center">
              <div className="inline-flex px-4 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-slate-200 font-semibold">
                Dados de Jogador
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <PositionMultiSelect
                label="Posição"
                value={formData.posicao}
                onChange={(vals) => setFormData((p) => ({ ...p, posicao: vals }))}
                options={posicoes}
              />

              <PernaSelect
                label="Perna"
                value={formData.perna}
                onChange={(v) => setFormData((p) => ({ ...p, perna: v }))}
                options={pernas}
              />
            </div>

            <div className="mt-6 text-slate-300">
              <span className="font-semibold">Atributos:</span>{" "}
              <span className="italic text-slate-400">Em Breve</span>
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

function Field({ label, placeholder, type = "text", ...props }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 font-medium mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div className="relative">
      <label className="block text-sm text-slate-300 font-medium mb-2">
        {label}
      </label>

      <select
        {...props}
        className="appearance-none w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 pl-4 pr-10 text-slate-200 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition"
      >
        {children}
      </select>

      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-[46px] pointer-events-none" />
    </div>
  );
}

function PositionMultiSelect({ label, value = [], onChange, options = [] }) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [];

  function toggle(pos) {
    const exists = selected.includes(pos);
    let next;
    if (exists) next = selected.filter((p) => p !== pos);
    else next = [...selected, pos];
    onChange(next);
  }

  return (
    <div className="relative">
      <label className="block text-sm text-slate-300 font-medium mb-2">{label}</label>
      <div
        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-2 px-3 text-slate-200 flex flex-wrap gap-2 items-center justify-between cursor-pointer"
        onClick={() => setOpen((s) => !s)}
      >
        {selected.length === 0 && <span className="text-slate-500">Selecione...</span>}
        {selected.map((p) => (
          <div key={p} className="inline-flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-full text-xs">
            <span>{p}</span>
          </div>
        ))}
        <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
      </div>

      {open && (
        <div className="absolute z-20 w-full max-h-60 overflow-auto bg-[#041025] border border-slate-800 rounded-lg p-2" style={{ bottom: 'calc(100% + 8px)' }}>
          <div className="space-y-1">
            {options.map((o) => {
              const checked = selected.includes(o);
              return (
                <label key={o} className="flex items-center gap-3 px-2 py-1 hover:bg-slate-900 rounded">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(o)}
                    className="sr-only peer"
                  />
                  <span className="w-6 h-6 flex items-center justify-center rounded border border-slate-600 bg-[#07121a] peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden peer-checked:block w-4 h-4 text-white">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-slate-200">{o}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to convert country ISO code to emoji flag
function countryCodeToEmoji(cc) {
  if (!cc) return "";
  return cc
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}


function CountryMultiSelect({ label, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = Array.isArray(value) ? value : [];

  function toggleCountry(code) {
    const exists = selected.includes(code);
    let next;
    if (exists) next = selected.filter((c) => c !== code);
    else next = [...selected, code];
    onChange(next);
  }

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="block text-sm text-slate-300 font-medium mb-2">{label}</label>
      <div
        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-2 px-3 text-slate-200 flex flex-wrap gap-2 items-center justify-between cursor-pointer"
        onClick={() => setOpen((s) => !s)}
      >
        {selected.length === 0 && <span className="text-slate-500">Selecione...</span>}
        {selected.map((code) => (
          <div key={code} className="inline-flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-full text-xs">
            <span>{countryCodeToEmoji(code)}</span>
            <span>{(COUNTRIES.find((c) => c.code === code) || { name: code }).name}</span>
          </div>
        ))}
        <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
      </div>

      {open && (
        <div className="absolute z-20 w-full max-h-64 overflow-auto bg-[#041025] border border-slate-800 rounded-lg p-2" style={{ bottom: 'calc(100% + 8px)' }}>
          <input
            className="w-full bg-[#02131f] border border-slate-800 rounded px-3 py-2 text-slate-200 mb-2"
            placeholder="Pesquisar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="space-y-1">
            {filtered.map((c) => {
              const checked = selected.includes(c.code);
              return (
                <label key={c.code} className="flex items-center gap-3 px-2 py-1 hover:bg-slate-900 rounded">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCountry(c.code)}
                    className="sr-only peer"
                  />
                  <span className="w-6 h-6 flex items-center justify-center rounded border border-slate-600 bg-[#07121a] peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden peer-checked:block w-4 h-4 text-white">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="w-6">{countryCodeToEmoji(c.code)}</span>
                  <span className="text-slate-200">{c.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PernaSelect({ label, value = '', onChange, options = [] }) {
  const [open, setOpen] = useState(false);

  function choose(v) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div className="relative">
      <label className="block text-sm text-slate-300 font-medium mb-2">{label}</label>
      <div
        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-2 px-3 text-slate-200 flex items-center justify-between cursor-pointer"
        onClick={() => setOpen((s) => !s)}
      >
        <div className="flex items-center gap-2">
          {value ? (
            <div className="inline-flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-full text-xs">
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-slate-500">Selecione...</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>

      {open && (
        <div className="absolute z-20 w-full max-h-44 overflow-auto bg-[#041025] border border-slate-800 rounded-lg p-2" style={{ bottom: 'calc(100% + 8px)' }}>
          <div className="space-y-1">
            {options.map((o) => {
              const active = value === o;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => choose(o)}
                  className={`w-full text-left flex items-center gap-3 px-2 py-2 rounded ${active ? 'bg-emerald-600/20 border border-emerald-500' : 'hover:bg-slate-900'}`}
                >
                  <span className={`w-6 h-6 flex items-center justify-center rounded border ${active ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600 bg-[#07121a]'}`}>
                    {active ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </span>
                  <span className="text-slate-200">{o}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}