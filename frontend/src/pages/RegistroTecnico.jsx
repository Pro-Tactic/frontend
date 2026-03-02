import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { api } from "../services/api";

export default function RegistroTecnico() {
  const navigate = useNavigate();
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    clube: "",
  });

  useEffect(() => {
    async function loadClubes() {
      try {
        const response = await api.get("/clubes/");
        const lista = response.data?.results || response.data || [];
        setClubes(lista);
      } catch (error) {
        console.error("Erro ao carregar clubes:", error);
      }
    }

    loadClubes();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.username || !form.password || !form.clube) {
      Swal.fire({
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Preencha login, senha e clube.",
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/tecnicos/", {
        username: form.username,
        email: form.email || "",
        first_name: form.first_name || "",
        last_name: form.last_name || "",
        password: form.password,
        clube: form.clube,
      });

      Swal.fire({
        icon: "success",
        title: "Técnico cadastrado",
        text: "Usuário treinador criado com sucesso.",
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#10b981",
      });

      setForm({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        clube: "",
      });
    } catch (error) {
      const msg =
        error?.response?.data?.username?.[0] ||
        error?.response?.data?.clube?.[0] ||
        error?.response?.data?.detail ||
        "Não foi possível cadastrar o técnico.";

      Swal.fire({
        icon: "error",
        title: "Erro",
        text: msg,
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          type="button"
          className="p-2 rounded-xl bg-[#0f172a] border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/40 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">Cadastrar Técnico</h1>
          <p className="text-sm text-slate-400 mt-2">Crie um usuário com perfil TREINADOR e vincule a um clube.</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 bg-[#0b1220] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Login *" name="username" value={form.username} onChange={handleChange} />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome" name="first_name" value={form.first_name} onChange={handleChange} />
          <Field label="Sobrenome" name="last_name" value={form.last_name} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Senha *" name="password" type="password" value={form.password} onChange={handleChange} />

          <div>
            <label className="block text-sm text-slate-300 font-medium mb-2">Clube *</label>
            <select
              name="clube"
              value={form.clube}
              onChange={handleChange}
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500/60"
            >
              <option value="">Selecione o clube</option>
              {clubes.map((clube) => (
                <option key={clube.id} value={clube.id}>
                  {clube.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/25 transition disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Cadastrar Técnico"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 font-medium mb-2">{label}</label>
      <input
        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500/60"
        {...props}
      />
    </div>
  );
}
