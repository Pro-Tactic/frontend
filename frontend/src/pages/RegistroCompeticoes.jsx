import { useState } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import Swal from 'sweetalert2';

export default function RegistroCompeticoes() {
  const [form, setForm] = useState({
    nome: "", tamanho: "", localidade: "", tipo_participantes: "",
    divisao: "", tipo_formato: "", qtd_participantes: "",
    tem_trofeu: false, tem_premiacao_financeira: false,
    valor_premiacao: "", garante_vaga: false, competicao_destino: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setForm({ ...form, [name]: checked });
  };

  async function handleRegistrar() {
    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Sessão inválida',
            text: 'Você precisa estar logado.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            background: '#0f172a', color: '#e2e8f0'
        });
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post("http://127.0.0.1:8000/competicoes/", form, config);
      
      Swal.fire({
        title: 'Sucesso!',
        text: 'Competição registrada.',
        icon: 'success',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#10b981',
      });

    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Sessão Expirada',
            text: 'Faça login novamente para continuar.',
            background: '#0f172a', color: '#e2e8f0', confirmButtonColor: '#ef4444'
          });
      } else {
          Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Não foi possível registrar a competição.',
            toast: true, position: 'top-end',
            background: '#0f172a', color: '#e2e8f0', showConfirmButton: false, timer: 4000
          });
      }
    }
  }

  const labelLocalidade =
    form.tamanho === "Continental" ? "Continente"
      : ["Nacional", "Regional", "Estadual"].includes(form.tamanho) ? "País" : "";

  return (
    <div className="max-w-6xl">
       <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">
        Registrar Competições
      </h1>
      <p className="text-sm text-slate-400 mt-2">
        Cadastre campeonatos e torneios.
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0b1220] border border-slate-800 rounded-2xl p-5 space-y-4">
          
          <Field 
            label="Nome da Competição" 
            placeholder="Digite o nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Tamanho"
              name="tamanho"
              value={form.tamanho}
              onChange={handleChange}
            >
              <option value="" disabled>Selecione</option>
              <option>Mundial</option>
              <option>Continental</option>
              <option>Nacional</option>
              <option>Regional</option>
              <option>Estadual</option>
            </SelectField>

            <Field
              label={labelLocalidade || "Localidade"}
              placeholder={labelLocalidade || "—"}
              disabled={form.tamanho === "Mundial" || !labelLocalidade}
              name="localidade"
              value={form.localidade}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField 
                label="Participantes"
                name="tipo_participantes"
                value={form.tipo_participantes}
                onChange={handleChange}
            >
              <option value="" disabled>Selecione</option>
              <option>Seleções</option>
              <option>Clubes</option>
            </SelectField>

            <SelectField 
                label="Divisão"
                name="divisao"
                value={form.divisao}
                onChange={handleChange}
            >
              <option value="" disabled>Selecione</option>
              <option>1ª Divisão</option>
              <option>2ª Divisão</option>
              <option>3ª Divisão</option>
              <option>4ª Divisão</option>
              <option>5ª Divisão</option>
              <option>Sem Divisão</option>
            </SelectField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField 
                label="Tipo"
                name="tipo_formato"
                value={form.tipo_formato}
                onChange={handleChange}
            >
              <option value="" disabled>Selecione</option>
              <option>Torneio</option>
              <option>Liga</option>
              <option>Outro</option>
            </SelectField>

            <Field
              label="Número de Participantes"
              placeholder="Ex.: 20"
              type="number"
              name="qtd_participantes"
              value={form.qtd_participantes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 flex flex-col space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-200 text-center">
            Premiação
          </h2>

          <Checkbox 
            label="Troféu" 
            name="tem_trofeu"
            checked={form.tem_trofeu}
            onChange={handleCheckbox}
          />

          <Checkbox
            label="Premiação em dinheiro"
            name="tem_premiacao_financeira"
            checked={form.tem_premiacao_financeira}
            onChange={handleCheckbox}
          />

          {form.tem_premiacao_financeira && (
            <Field
              label="Valor monetário"
              placeholder="Ex.: 500000"
              type="number"
              name="valor_premiacao"
              value={form.valor_premiacao}
              onChange={handleChange}
            />
          )}

          <Checkbox
            label="Garante vaga em outra competição"
            name="garante_vaga"
            checked={form.garante_vaga}
            onChange={handleCheckbox}
          />

          {form.garante_vaga && (
            <SelectField label="Competição garantida">
              <option value="" disabled>Selecione (Em breve)</option>
            </SelectField>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleRegistrar}
          className="px-8 py-3 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
        >
          Registrar
        </button>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
    return (
      <div>
        <label className="block text-sm text-slate-300 font-medium mb-2">{label}</label>
        <input className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500/60" {...props} />
      </div>
    );
}

function SelectField({ label, children, ...props }) {
    return (
        <div className="relative">
            <label className="block text-sm text-slate-300 font-medium mb-2">{label}</label>
            <select className="appearance-none w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 pl-4 pr-10 text-slate-200 focus:outline-none focus:border-emerald-500/60" {...props}>
                {children}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-[46px] pointer-events-none" />
        </div>
    );
}

function Checkbox({ label, ...props }) {
    return (
      <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
        <input type="checkbox" className="appearance-none w-5 h-5 rounded-md border border-slate-600 bg-[#0f172a] checked:bg-emerald-500 checked:after:content-['✓'] checked:after:text-black flex items-center justify-center" {...props} />
        {label}
      </label>
    );
}