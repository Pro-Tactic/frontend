import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ImagePlus } from "lucide-react";
import { api } from "../services/api";
import Swal from 'sweetalert2';

export default function RegistroJogadores() {
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
    nome: "", cpf: "", idade: "", peso: "", altura: "",
    nacionalidade: "", clube: "", posicao: "", perna: "",
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
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
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
        nome: "", cpf: "", idade: "", peso: "", altura: "",
        nacionalidade: "", clube: "", posicao: "", perna: "",
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
    <div className="max-w-5xl">
       <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">
        Registrar Jogadores
      </h1>
      <p className="text-sm text-slate-400 mt-2">
        Preencha os dados do atleta.
      </p>

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
              label="Idade"
              placeholder="Ex.: 19"
              type="number"
              name="idade"
              value={formData.idade}
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
              label="Altura"
              placeholder="Ex.: 1.78 (m)"
              type="number"
              step="0.01"
              name="altura"
              value={formData.altura}
              onChange={handleInputChange}
            />
            <Field
              label="Nacionalidade"
              placeholder="Ex.: Brasileiro"
              name="nacionalidade"
              value={formData.nacionalidade}
              onChange={handleInputChange}
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
              <SelectField
                label="Posição"
                name="posicao"
                value={formData.posicao}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {posicoes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Perna"
                name="perna"
                value={formData.perna}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {pernas.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </SelectField>
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