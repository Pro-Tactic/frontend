import { useState } from "react";
import { api } from "../services/api";
import { fetchNavigation } from "../services/navigation";
import { User, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/logo-protactic.png";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const Toast = MySwal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#0f172a', // Slate-900
    color: '#e2e8f0',      // Slate-200
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
  
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/", {
        username,
        password,
      });

      const { access, user_type } = response.data;

      localStorage.setItem("token", access);
      localStorage.setItem("user_type", user_type);

      Toast.fire({
        icon: 'success',
        title: 'Login realizado com sucesso!'
      });

      const nav = await fetchNavigation();
      console.log("NAV:", nav);
      navigate("/inicio", { replace: true });
      
    } catch (err) {
      console.error(err);
      Toast.fire({
        icon: 'error',
        title: 'Credenciais inválidas ou erro no servidor.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        <div className="flex flex-col items-center lg:items-center text-center space-y-8">
          <div className="flex flex-col items-center mb-4">
            <img src={logoImg} alt="Logo ProTactic" className="w-64 h-auto" />
          </div>

          <div className="space-y-4 max-w-lg">
            <h2 className="text-2xl font-medium tracking-wide">
              ASSISTENTE TÉCNICO VIRTUAL
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Análise tática avançada, gestão de elenco inteligente e preparação
              completa para cada adversário.
            </p>
            <button
              onClick={() => navigate("/sobre")}
              type="button"
              className="border border-slate-700 px-6 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors"
            >
              Sobre
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-lg mt-8">
            <StatCard value="500k+" label="Análises Táticas" />
            <StatCard value="350k+" label="Jogadores Geridos" />
            <StatCard value="24/7" label="Suporte Tático" />
          </div>
        </div>
        <div className="flex justify-center w-full">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white">BEM-VINDO</h2>
              <p className="text-slate-400 text-sm mt-1">
                Acesse sua área de trabalho
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Login
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Digite seu login"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3 pl-10 pr-10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-slate-900 font-bold py-3 rounded-lg mt-2 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                {loading ? "Entrando..." : "Entrar"}
                {!loading && <ChevronRight className="h-5 w-5" />}
              </button>
            </form>
          </div>
          <div className="text-center absolute bottom-4 text-[10px] text-slate-600 w-full lg:w-auto">
            © 2025 ProTactic. Todos os direitos reservados.
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <span className="text-green-500 font-bold text-xl">{value}</span>
      <span className="text-slate-500 text-xs mt-1">{label}</span>
    </div>
  );
}