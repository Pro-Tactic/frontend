import { useState } from "react";
import { api } from "../services/api";
import { User, ChevronRight, ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/logo-protactic.png";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const Toast = MySwal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#0f172a',
    color: '#e2e8f0',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  async function handleRequestReset(e) {
    e.preventDefault();
    if (!email) {
      Toast.fire({
        icon: 'warning',
        title: 'Por favor, digite seu e-mail.'
      });
      return;
    }

    setLoading(true);

    try {
      await api.post("/password-reset/", { email });

      MySwal.fire({
        title: 'E-mail enviado!',
        text: 'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
        icon: 'success',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#22c55e',
      }).then(() => {
        navigate("/");
      });

    } catch (err) {
      console.error(err);
      Toast.fire({
        icon: 'error',
        title: 'Erro ao processar solicitação.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <main className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl z-10">
        <div className="flex flex-col items-center mb-8">
          <img src={logoImg} alt="Logo ProTactic" className="w-48 h-auto mb-6" />
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white uppercase tracking-wider">Recuperar Senha</h2>
            <p className="text-slate-400 text-sm mt-2">
              Digite seu e-mail para receber as instruções de recuperação.
            </p>
          </div>
        </div>

        <form onSubmit={handleRequestReset} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
              <input
                type="email"
                placeholder="Digite seu e-mail cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-slate-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-green-500/20"
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
              {!loading && <ChevronRight className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
