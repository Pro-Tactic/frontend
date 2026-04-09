import { useState } from "react";
import { api } from "../services/api";
import { fetchNavigation } from "../services/navigation";
import { clearSession, saveSession } from "../services/auth";
import { prefetchAdminLandingRoute, prefetchCoachLandingRoute } from "../services/routePrefetch";
import { User, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logoImg from "../../icon/logo-protactic.png";
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
    background: 'var(--pt-surface)',
    color: 'var(--pt-text-primary)',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
  
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      clearSession();

      const response = await api.post("/", {
        username,
        password,
      });

      const { access, refresh, user_type } = response.data;

      saveSession({ access, refresh, user_type });

      if (user_type === "ADMIN") {
        prefetchAdminLandingRoute();
      } else {
        prefetchCoachLandingRoute();
      }

      Toast.fire({
        icon: 'success',
        title: 'Login realizado com sucesso!'
      });

      // Navigate immediately to avoid blocking login on an extra API call.
      const target = user_type === "ADMIN" ? "/registro" : "/inicio";
      navigate(target, { replace: true });

      // Warm up sidebar navigation in background for the first protected screen.
      fetchNavigation({ preferCache: false }).catch((navErr) => {
        console.error("Falha ao pré-carregar navegação:", navErr);
      });
      
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
    <div className="min-h-screen bg-pt-bg text-pt-text flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pt-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pt-primary/5 rounded-full blur-[100px]" />

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        <div className="flex flex-col items-center lg:items-center text-center space-y-8">
          <div className="flex flex-col items-center mb-4">
            <img src={logoImg} alt="Logo ProTactic" className="w-64 h-auto" />
          </div>

          <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl font-black tracking-tighter text-pt-primary mb-2">
              ASSISTENTE TÉCNICO VIRTUAL
            </h2>
            <p className="text-pt-text-muted text-sm leading-relaxed font-medium">
              Análise tática avançada, gestão de elenco inteligente e preparação
              completa para cada adversário.
            </p>
            <button
              onClick={() => navigate("/sobre")}
              type="button"
              className="border border-pt-slate/20 px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-pt-primary hover:text-pt-bg hover:border-pt-primary transition-all shadow-md shadow-black/5"
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
          <div className="w-full max-w-md bg-pt-surface border border-pt-white/5 rounded-3xl p-10 shadow-2xl shadow-black/40">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black text-pt-primary tracking-tight">BEM-VINDO</h2>
              <p className="text-pt-text-muted text-sm mt-1 font-semibold uppercase tracking-wider">
                Acesse sua área de trabalho
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-pt-text-muted uppercase tracking-widest ml-1">
                  Login
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-pt-primary h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Digite seu login"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-pt-bg/30 border border-pt-slate/10 rounded-2xl py-4 pl-12 pr-4 text-pt-text font-semibold placeholder:text-pt-text-muted/50 focus:outline-none focus:border-pt-primary focus:ring-4 focus:ring-pt-primary/15 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-pt-text-muted uppercase tracking-widest ml-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pt-primary h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-pt-bg/30 border border-pt-slate/10 rounded-2xl py-4 pl-12 pr-12 text-pt-text font-semibold placeholder:text-pt-text-muted/50 focus:outline-none focus:border-pt-primary focus:ring-4 focus:ring-pt-primary/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-pt-text-muted hover:text-pt-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-pt-text-muted font-bold hover:text-pt-primary transition-colors underline decoration-pt-primary/30 underline-offset-4"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pt-primary hover:bg-pt-primary/90 text-pt-bg font-black py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-pt-primary/20"
              >
                {loading ? "Entrando..." : "Entrar"}
                {!loading && <ChevronRight className="h-5 w-5" />}
              </button>
            </form>
          </div>
          <div className="text-center absolute bottom-6 text-[10px] text-pt-text-muted/50 font-bold uppercase tracking-widest w-full lg:w-auto">
            © 2025 ProTactic. Todos os direitos reservados.
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="bg-pt-surface border border-pt-slate/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-black/5">
      <span className="text-pt-primary font-black text-2xl tracking-tighter">{value}</span>
      <span className="text-pt-text-muted font-bold text-[10px] uppercase mt-1 tracking-wide">{label}</span>
    </div>
  );
}